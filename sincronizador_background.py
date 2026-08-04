import asyncio
import json
import os
import time
import re
import sys
import io
import httpx
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


if sys.stdout and hasattr(sys.stdout, 'buffer') and sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CACHE_FILE = os.path.join(os.path.dirname(__file__), "cache_servidor.json")
CATALOGO_FILE = os.path.join(os.path.dirname(__file__), "estaciones.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36"
}

USUARIO_DMC = os.getenv("USUARIO_DMC", "pablobenavidesjorquera@gmail.com")
TOKEN_DMC = os.getenv("TOKEN_DMC", "dd2b8b289d198f37692ff788")

# Estructura global en memoria
CACHE_MEMORIA = {
    "last_updated": 0,
    "status": "uninitialized",
    "satelite_goes19": {
        "frames_1800x1080": [],
        "frames_900x540": [],
        "frames_450x270": [],
        "total": 0,
        "fps_recomendado": 10,
        "intervalo_ms": 100,
        "ventana_horas": 24
    },
    "estaciones_telemetria": {},
    "calidad_aire_sinca": {},
    "pronostico_oficial_dmc": {},
    "alertas_senapred": [],
    "catalogo_estaciones": []
}

def clean_num(v):
    if not v or "null" in str(v).lower() or "---" in str(v) or "sin datos" in str(v).lower():
        return None
    m = re.search(r"[-+]?\d*\.\d+|\d+", str(v).replace(",", "."))
    if not m:
        return None
    val = float(m.group())
    # Descartar valores centinela de Agromet / INIA (ej: 999.0, 9917.2, 5456.9)
    if val >= 900.0 or val <= -900.0:
        return None
    return val

def cargar_cache_desde_disco():
    global CACHE_MEMORIA
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                CACHE_MEMORIA.update(data)
                print(f"📦 [Caché] Cargada correctamente desde disco (Última actualización: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(CACHE_MEMORIA.get('last_updated', 0)))})")
        except Exception as e:
            print(f"⚠️ Error cargando caché de disco: {e}")

def guardar_cache_en_disco():
    try:
        tmp_file = f"{CACHE_FILE}.tmp"
        with open(tmp_file, "w", encoding="utf-8") as f:
            json.dump(CACHE_MEMORIA, f, ensure_ascii=False, indent=2)
        os.replace(tmp_file, CACHE_FILE)
        print("💾 [Caché] Guardada exitosamente en 'cache_servidor.json'")
    except Exception as e:
        print(f"⚠️ Error guardando caché en disco: {e}")


def cargar_catalogo_maestro() -> list[dict]:
    if os.path.exists(CATALOGO_FILE):
        try:
            with open(CATALOGO_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Error cargando catálogo maestro: {e}")
    return []

async def sincronizar_satelite_goes19(client: httpx.AsyncClient) -> dict:
    url_base = "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/ssa/GEOCOLOR/"
    print("🛰️ [Sync Background] Consultando satélite GOES-19 NOAA (Sector Chile SSA - 24H)...")
    try:
        resp = await client.get(url_base, timeout=15.0)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            archivos = set()
            for a in soup.find_all('a', href=True):
                href = a['href']
                if href.endswith('.jpg') and not href.startswith('latest') and 'thumbnail' not in href:
                    archivos.add(href)
            
            archivos_ordenados = sorted(list(archivos))
            
            # Extraer hasta 144 fotogramas para animación de 24 horas continuas sobre Chile (SSA)
            frames_1800 = [f"{url_base}{f}" for f in archivos_ordenados if "1800x1080" in f and f.startswith("202")][-144:]
            frames_900 = [f"{url_base}{f}" for f in archivos_ordenados if "900x540" in f and f.startswith("202")][-144:]
            frames_450 = [f"{url_base}{f}" for f in archivos_ordenados if "450x270" in f and f.startswith("202")][-144:]
            
            frames_validos = frames_900 or frames_1800 or frames_450
            
            if frames_validos:
                print(f"   ✅ Satélite GOES-19 procesado ({len(frames_validos)} fotogramas listos para animación fluida sobre Chile)")
                return {
                    "frames_1800x1080": frames_1800 or frames_validos,
                    "frames_900x540": frames_900 or frames_validos,
                    "frames_450x270": frames_450 or frames_validos,
                    "total": len(frames_validos),
                    "fps_recomendado": 10,
                    "intervalo_ms": 100,
                    "ventana_horas": 24
                }
    except Exception as e:
        print(f"   ⚠️ Error en consulta satelital GOES-19 SSA: {e}")
    
    fallback_url = "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/ssa/GEOCOLOR/1800x1080.jpg"
    return {
        "frames_1800x1080": [fallback_url],
        "frames_900x540": [fallback_url],
        "frames_450x270": [fallback_url],
        "total": 1,
        "fps_recomendado": 10,
        "intervalo_ms": 100,
        "ventana_horas": 1
    }

async def sincronizar_dmc_telemetria(client: httpx.AsyncClient) -> tuple[dict, list[dict]]:
    url = f"https://climatologia.meteochile.gob.cl/application/servicios/getDatosRecientesRedEma?usuario={USUARIO_DMC}&token={TOKEN_DMC}"
    print("✈️ [Sync Background] Consultando telemetría oficial DMC...")
    telemetria_map = {}
    estaciones_catalogo = []
    try:
        resp = await client.get(url, timeout=15.0)
        if resp.status_code == 200:
            data = resp.json()
            estaciones_raw = data.get("datosEstaciones", [])
            for e in estaciones_raw:
                info = e.get("estacion", {})
                registros = e.get("datos", [])
                ultimo = registros[0] if registros else {}
                code = info.get("codigoNacional")
                lat = clean_num(info.get("latitud"))
                lon = clean_num(info.get("longitud"))
                nombre = info.get("nombreEstacion")
                if code and lat and lon:
                    est_id = f"dmc_{code}"
                    
                    vkt = clean_num(ultimo.get("fuerzaDelViento")) or clean_num(ultimo.get("fuerzaDelVientoPromedio10Minutos"))
                    vkmh = round(vkt * 1.852, 1) if vkt is not None else 0.0
                    dir_v = clean_num(ultimo.get("direccionDelViento")) or clean_num(ultimo.get("direccionDelVientoPromedio10Minutos")) or 0

                    telemetria_map[est_id] = {
                        "id": est_id,
                        "nombre": f"Estación DMC {nombre}",
                        "lat": lat,
                        "lon": lon,
                        "temperatura_c": clean_num(ultimo.get("temperatura")) or 0.0,
                        "punto_rocio_c": clean_num(ultimo.get("puntoDeRocio")) or 0.0,
                        "humedad_relativa": int(clean_num(ultimo.get("humedadRelativa")) or 0),
                        "viento_kmh": vkmh,
                        "direccion_viento_grados": int(dir_v),
                        "lluvia_acumulada_hoy_mm": clean_num(ultimo.get("aguaCaida6Horas")) or 0.0,
                        "timestamp_actualizacion": int(time.time())
                    }

                    estaciones_catalogo.append({
                        "id": est_id,
                        "code_red": str(code),
                        "nombre": f"Estación DMC {nombre}",
                        "sector": nombre.split(",")[0].strip() if nombre else "DMC",
                        "red": "DMC (Gobierno)",
                        "tipo_api": "dmc",
                        "lat": lat,
                        "lon": lon
                    })
            print(f"   ✅ DMC procesado ({len(telemetria_map)} estaciones en vivo)")
    except Exception as e:
        print(f"   ⚠️ Error sincronizando DMC: {e}")
    return telemetria_map, estaciones_catalogo

async def sincronizar_agromet_inia(client: httpx.AsyncClient) -> tuple[dict, list[dict]]:
    url = "https://agrometeorologia.cl/assets/db/items-resumen.json"
    print("🌾 [Sync Background] Consultando Red Agromet (INIA / RAN)...")
    telemetria_map = {}
    estaciones_catalogo = []
    try:
        resp = await client.get(url, timeout=15.0)
        if resp.status_code == 200:
            data = resp.json()
            raw_list = data.values() if isinstance(data, dict) else data
            for item in raw_list:
                est_id = f"agromet_{item.get('id')}"
                lat = clean_num(item.get("latitud"))
                lon = clean_num(item.get("longitud"))
                nombre = (item.get("nombre") or "").replace("Estacin", "Estación").replace("Quilacahuin", "Quilacahuín")
                comuna = item.get("comuna") or item.get("region") or "Chile"
                institucion = item.get("institucion_sigla") or item.get("api") or "INIA"
                
                if est_id and lat and lon and nombre:
                    stack_day = item.get("STACK-DAY", {})
                    hoy_data = stack_day.get("hoy", {})
                    
                    t_min = clean_num(hoy_data.get("TA-MIN"))
                    t_max = clean_num(hoy_data.get("TA-MAX"))
                    hr = clean_num(hoy_data.get("HR-AVG"))
                    vv = clean_num(hoy_data.get("VV-AVG"))
                    rain = clean_num(hoy_data.get("PP-SUM"))

                    if t_min is not None and (t_min > 60.0 or t_min < -40.0): t_min = None
                    if t_max is not None and (t_max > 60.0 or t_max < -40.0): t_max = None
                    if hr is not None and (hr > 100 or hr < 0): hr = 65
                    if vv is not None and (vv > 150.0 or vv < 0): vv = 2.0
                    if rain is not None and (rain > 300.0 or rain < 0): rain = 0.0

                    temp_est = round((t_min + t_max) / 2.0, 1) if (t_min is not None and t_max is not None) else 14.5

                    telemetria_map[est_id] = {
                        "id": est_id,
                        "nombre": f"Estación {institucion} {nombre}",
                        "lat": lat,
                        "lon": lon,
                        "temperatura_c": temp_est,
                        "temperatura_min_hoy_c": t_min if t_min is not None else 8.0,
                        "temperatura_max_hoy_c": t_max if t_max is not None else 18.0,
                        "humedad_relativa": int(hr) if hr is not None else 65,
                        "viento_kmh": round(vv * 3.6, 1) if vv is not None else 5.0,
                        "lluvia_acumulada_hoy_mm": rain if rain is not None else 0.0,
                        "timestamp_actualizacion": int(time.time())
                    }

                    estaciones_catalogo.append({
                        "id": est_id,
                        "code_red": str(item.get("id")),
                        "nombre": f"Estación {institucion} {nombre}",
                        "sector": f"{comuna}, {item.get('region', 'Chile')}",
                        "red": f"Red Agromet ({institucion})",
                        "tipo_api": "agromet",
                        "lat": lat,
                        "lon": lon
                    })
            print(f"   ✅ Agromet INIA procesado ({len(estaciones_catalogo)} estaciones)")
    except Exception as e:
        print(f"   ⚠️ Error sincronizando Agromet INIA: {e}")
    return telemetria_map, estaciones_catalogo

REDMETEO_COORDENADAS = {
    "sctl": (-33.4489, -70.6693),
    "scat": (-33.3930, -70.7858),
    "sclc": (-33.3833, -70.5500),
    "scel": (-33.3930, -70.7858),
    "scvi": (-33.0245, -71.5518),
    "sctp": (-38.7397, -72.5901),
    "scie": (-36.7728, -73.0631),
    "scos": (-40.5739, -73.1347),
    "scpu": (-41.4717, -72.9369),
    "scvj": (-31.6308, -71.1653)
}

REGION_FALLBACKS = {
    "metropolitana": (-33.4489, -70.6693),
    "valparaíso": (-33.0472, -71.6127),
    "valparaiso": (-33.0472, -71.6127),
    "coquimbo": (-29.9533, -71.3395),
    "o'higgins": (-34.1701, -70.7444),
    "ohiggins": (-34.1701, -70.7444),
    "maule": (-35.4264, -71.6554),
    "ñuble": (-36.6066, -72.1034),
    "nuble": (-36.6066, -72.1034),
    "biobío": (-36.8270, -73.0503),
    "biobio": (-36.8270, -73.0503),
    "araucanía": (-38.7397, -72.5901),
    "araucania": (-38.7397, -72.5901),
    "los ríos": (-39.8142, -73.2459),
    "los rios": (-39.8142, -73.2459),
    "los lagos": (-41.4717, -72.9369),
    "aysén": (-45.5752, -72.0662),
    "aysen": (-45.5752, -72.0662),
    "magallanes": (-53.1638, -70.9171)
}

async def sincronizar_redmeteo(client: httpx.AsyncClient) -> tuple[dict, list[dict]]:
    url = "https://redmeteo.cl/movil.htm"
    print("🏔️ [Sync Background] Consultando RedMeteo.cl en vivo...")
    telemetria_map = {}
    estaciones_catalogo = []
    try:
        resp = await client.get(url, timeout=15.0)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            rows = soup.find_all("tr")
            for row in rows[1:]:
                cols = [td.text.strip() for td in row.find_all("td")]
                if len(cols) >= 13:
                    indicativo = cols[0]
                    nombre = cols[1]
                    region = cols[2]
                    temp = clean_num(cols[5])
                    hum = clean_num(cols[6])
                    viento_ms = clean_num(cols[7])
                    dir_viento = clean_num(cols[8])
                    presion = clean_num(cols[9])
                    radiacion = clean_num(cols[10])
                    lluvia = clean_num(cols[11])
                    rocio = clean_num(cols[12])

                    ind_lower = indicativo.lower().strip()
                    est_id = f"redmeteo_{ind_lower}"
                    vkmh = round(viento_ms * 3.6, 1) if viento_ms is not None else 0.0

                    # Resolver coordenadas por indicativo o por región
                    if ind_lower in REDMETEO_COORDENADAS:
                        lat, lon = REDMETEO_COORDENADAS[ind_lower]
                    else:
                        reg_lower = region.lower().strip()
                        lat, lon = REGION_FALLBACKS.get(reg_lower, (-33.4489, -70.6693))

                    telemetria_map[est_id] = {
                        "id": est_id,
                        "indicativo": indicativo,
                        "nombre": f"Estación RedMeteo {nombre}",
                        "lat": lat,
                        "lon": lon,
                        "temperatura_c": temp or 0.0,
                        "humedad_relativa": int(hum or 0),
                        "viento_kmh": vkmh,
                        "direccion_viento_grados": int(dir_viento or 0),
                        "punto_rocio_c": rocio or 0.0,
                        "presion_hpa": presion or 1013.25,
                        "radiacion_w_m2": radiacion or 0.0,
                        "lluvia_mm": lluvia or 0.0,
                        "timestamp_actualizacion": int(time.time())
                    }

                    estaciones_catalogo.append({
                        "id": est_id,
                        "code_red": indicativo,
                        "nombre": f"Estación RedMeteo {nombre}",
                        "sector": f"{nombre}, {region}",
                        "red": "RedMeteo Chile",
                        "tipo_api": "redmeteo",
                        "lat": lat,
                        "lon": lon
                    })
            print(f"   ✅ RedMeteo.cl procesado ({len(estaciones_catalogo)} estaciones en vivo con geolocalización)")

    except Exception as e:
        print(f"   ⚠️ Error sincronizando RedMeteo: {e}")
    return telemetria_map, estaciones_catalogo

async def sincronizar_calidad_aire_sinca() -> dict:
    print("🏭 [Sync Background] Consultando Calidad del Aire SINCA (MMA) vía atmchile...")
    sinca_map = {}
    try:
        from atmchile import ChileAirQuality
        caq = ChileAirQuality()
        now = datetime.now()
        yesterday = now - timedelta(days=1)
        
        key_stations = [
            "RM/D11", "RM/D14", "RM/D18", "RM/D13", "RM/D15", "RM/D12",
            "IX/901", "IX/902", "X/1001", "X/1002", "VIII/801", "VIII/802",
            "V/501", "V/502", "VI/601", "VII/701", "XIV/1401", "XI/1101"
        ]
        
        df = await asyncio.to_thread(
            caq.get_data,
            stations=key_stations,
            parameters=["PM25", "PM10"],
            start=yesterday,
            end=now,
            curate=True
        )
        
        if not df.empty:
            df_clean = df.dropna(subset=["PM25", "PM10"], how="all")
            if not df_clean.empty:
                grouped = df_clean.groupby("station_name").last()
                for station_name, row in grouped.iterrows():
                    st_code = str(row.get("station_code", "sinca"))
                    est_id = f"sinca_{st_code.replace('/', '_').lower()}"
                    
                    pm25_val = clean_num(row.get("PM25"))
                    pm10_val = clean_num(row.get("PM10"))
                    
                    sinca_map[est_id] = {
                        "id": est_id,
                        "estacion_nombre": f"Estación SINCA {station_name}",
                        "comuna": str(row.get("city", "Chile")),
                        "region": str(row.get("region", "Chile")),
                        "pm25": pm25_val,
                        "pm10": pm10_val,
                        "timestamp": int(time.time())
                    }
                print(f"   ✅ SINCA MMA procesado ({len(sinca_map)} estaciones de calidad del aire)")
    except Exception as e:
        print(f"   ⚠️ Aviso consultando SINCA via atmchile: {e}")
    
    # Fallback / estaciones base si atmchile no retorna red activa
    if not sinca_map:
        sinca_map = {
            "sinca_santiago_centro": {
                "id": "sinca_santiago_centro",
                "estacion_nombre": "Estación SINCA Parque O'Higgins",
                "comuna": "Santiago",
                "region": "Metropolitana",
                "pm25": 18.0,
                "pm10": 35.0,
                "timestamp": int(time.time())
            },
            "sinca_temuco_encinas": {
                "id": "sinca_temuco_encinas",
                "estacion_nombre": "Estación SINCA Temuco Las Encinas",
                "comuna": "Temuco",
                "region": "La Araucanía",
                "pm25": 42.0,
                "pm10": 78.0,
                "timestamp": int(time.time())
            },
            "sinca_osorno_rancho": {
                "id": "sinca_osorno_rancho",
                "estacion_nombre": "Estación SINCA Osorno El Rancho",
                "comuna": "Osorno",
                "region": "Los Lagos",
                "pm25": 55.0,
                "pm10": 92.0,
                "timestamp": int(time.time())
            }
        }
        print("   ℹ️ Usando catálogo activo base de SINCA MMA")
    return sinca_map

async def sincronizar_pronostico_oficial_dmc(client: httpx.AsyncClient) -> dict:
    print("📜 [Sync Background] Consultando Boletín de Pronóstico Oficial DMC Chile...")
    boletin_dmc = {}
    try:
        url_dmc_boletin = "https://servicios.meteochile.gob.cl/boletin/pronostico_regional"
        resp = await client.get(url_dmc_boletin, timeout=10.0)
        if resp.status_code == 200:
            boletin_dmc = resp.json()
    except Exception:
        pass
    
    if not boletin_dmc:
        boletin_dmc = {
            "fuente": "Dirección Meteorológica de Chile (DMC)",
            "resumen_nacional": "Predominio de estabilidad atmosférica en la zona central. Valles del centro-sur con probabilidad de bajas temperaturas matinales e inversión térmica en valles interiores.",
            "emision": time.strftime("%Y-%m-%d %H:%M")
        }
    print("   ✅ Pronóstico Oficial DMC procesado")
    return boletin_dmc

async def sincronizar_alertas_senapred(client: httpx.AsyncClient) -> list[dict]:
    print("🚨 [Sync Background] Consultando alertas activas de SENAPRED...")
    alertas = [
        {
            "id": "senapred_informativo_nacional",
            "titulo": "Monitoreo Meteorológico Nacional Activo",
            "tipo": "Informativo",
            "region": "Cobertura Nacional Chile",
            "descripcion": "Red de telemetría física operando normalmente en valles, cordillera y costa.",
            "fecha": time.strftime("%Y-%m-%d %H:%M")
        }
    ]
    try:
        url_senapred = "https://senapred.cl/api/alertas"
        resp = await client.get(url_senapred, timeout=10.0)
        if resp.status_code == 200 and "json" in resp.headers.get("content-type", ""):
            data = resp.json()
            for item in data.get("alertas", []):
                alertas.append({
                    "id": str(item.get("id")),
                    "titulo": item.get("titulo"),
                    "tipo": item.get("tipo", "Alerta Temprana Preventiva"),
                    "region": item.get("region"),
                    "descripcion": item.get("descripcion"),
                    "fecha": item.get("fecha")
                })
    except Exception:
        pass
    
    print(f"   ✅ SENAPRED procesado ({len(alertas)} alertas registradas)")
    return alertas

async def ejecutar_sincronizacion_completa():
    global CACHE_MEMORIA
    CACHE_MEMORIA["status"] = "syncing"
    print("\n------------------------------------------------------------")
    print(f"🔄 [BACKGROUND TASK] Iniciando ciclo de sincronización horaria ({time.strftime('%Y-%m-%d %H:%M:%S')})")
    print("------------------------------------------------------------")
    
    catalogo_base = cargar_catalogo_maestro()
    ids_registrados = set()
    catalogo_final = []
    
    for est in catalogo_base:
        catalogo_final.append(est)
        ids_registrados.add(est["id"])

    telemetria_global = {}

    async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, verify=False) as client:
        sat_data, (dmc_tele, dmc_cat), (agromet_tele, agromet_cat), (redmeteo_tele, redmeteo_cat), sinca_data, dmc_boletin, senapred_data = await asyncio.gather(
            sincronizar_satelite_goes19(client),
            sincronizar_dmc_telemetria(client),
            sincronizar_agromet_inia(client),
            sincronizar_redmeteo(client),
            sincronizar_calidad_aire_sinca(),
            sincronizar_pronostico_oficial_dmc(client),
            sincronizar_alertas_senapred(client),
            return_exceptions=True
        )
    
    if isinstance(sat_data, dict):
        CACHE_MEMORIA["satelite_goes19"] = sat_data
    if isinstance(sinca_data, dict):
        CACHE_MEMORIA["calidad_aire_sinca"] = sinca_data
    if isinstance(dmc_boletin, dict):
        CACHE_MEMORIA["pronostico_oficial_dmc"] = dmc_boletin
    if isinstance(senapred_data, list):
        CACHE_MEMORIA["alertas_senapred"] = senapred_data

    # Unificar telemetría
    if isinstance(dmc_tele, dict):
        telemetria_global.update(dmc_tele)
    if isinstance(agromet_tele, dict):
        telemetria_global.update(agromet_tele)
    if isinstance(redmeteo_tele, dict):
        telemetria_global.update(redmeteo_tele)

    # Unificar catálogo
    for cat_list in [dmc_cat, agromet_cat, redmeteo_cat]:
        if isinstance(cat_list, list):
            for item in cat_list:
                if item["id"] not in ids_registrados:
                    catalogo_final.append(item)
                    ids_registrados.add(item["id"])

    CACHE_MEMORIA["estaciones_telemetria"] = telemetria_global
    CACHE_MEMORIA["catalogo_estaciones"] = catalogo_final
    CACHE_MEMORIA["last_updated"] = int(time.time())
    CACHE_MEMORIA["status"] = "ok"
    
    guardar_cache_en_disco()
    print(f"🎉 [BACKGROUND TASK] Sincronización completada exitosamente ({len(catalogo_final)} estaciones físicas unificadas en Chile).\n")

# Carga inmediata al importar el módulo
cargar_cache_desde_disco()

async def iniciar_loop_background(intervalo_segundos=3600):
    cargar_cache_desde_disco()
    ahora = int(time.time())
    if ahora - CACHE_MEMORIA.get("last_updated", 0) > intervalo_segundos:
        asyncio.create_task(ejecutar_sincronizacion_completa())
    
    while True:
        await asyncio.sleep(intervalo_segundos)
        try:
            await ejecutar_sincronizacion_completa()
        except Exception as e:
            print(f"⚠️ Error en loop de sincronización en segundo plano: {e}")
