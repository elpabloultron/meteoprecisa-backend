from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

def test_home_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["servicio"] == "MeteoPrecisa Chile - Engine Multired Unificado"
    assert data["google_earth_engine_activo"] is True
    assert "total_estaciones_registradas" in data

def test_capas_mapa_windy_y_gee_endpoint():
    response = client.get("/api/v1/capas-mapa")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "capas" in data
    assert "viento_particulas_windy" in data["capas"]
    assert "satelite_infra_goes19" in data["capas"]

def test_gee_ndvi_punto_endpoint():
    # Coordenadas agrícolas en Curicó, Valle Central de Chile
    response = client.get("/api/v1/gee/ndvi-punto?lat=-34.9667&lon=-71.2167")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "analisis_earth_engine" in data
    gee = data["analisis_earth_engine"]
    assert "ndvi_salud_vegetal" in gee
    assert "humedad_suelo_volumetrica" in gee

def test_satelite_goes19_24h_endpoint():
    response = client.get("/api/v1/satelite-goes19?resolucion=1800x1080&ventana_horas=24")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "reproduccion_fluida" in data
    assert data["reproduccion_fluida"]["fps_recomendado"] == 10
    assert "frames" in data
    assert isinstance(data["frames"], list)
    assert len(data["frames"]) > 0

def test_buscar_estaciones_endpoint():
    response = client.get("/api/v1/buscar-estaciones?q=Temuco")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_alertas_senapred_endpoint():
    response = client.get("/api/v1/alertas-senapred")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "alertas" in data

def test_clima_hiperlocal_modos_urbano_y_agricola_con_gee():
    # Coordenadas de Santiago Centro
    response = client.get("/api/v1/clima-hiperlocal?lat=-33.4450&lon=-70.6830")
    assert response.status_code == 200
    data = response.json()
    
    assert "estacion" in data
    assert "modo_urbano" in data
    assert "modo_agricola" in data
    assert "pronostico_oficial_dmc" in data
    assert "pronostico_numerico_openmeteo" in data
    
    # Validar Módulo Urbano
    urbano = data["modo_urbano"]
    assert "sensacion_termica_c" in urbano
    assert "inversion_termica" in urbano
    assert "calidad_aire_sinca_y_aqi" in urbano

    # Validar Módulo Agrícola con Métricas de Google Earth Engine
    agricola = data["modo_agricola"]
    assert "evapotranspiracion_eto_mm_dia" in agricola
    assert "horas_frio_acumuladas_24h" in agricola
    assert "salud_vegetacion_ndvi" in agricola
    assert "humedad_suelo_volumetrica" in agricola

def test_admin_sincronizar_ahora():
    response = client.post("/api/v1/admin/sincronizar-ahora")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

def test_redmeteo_geolocalizacion():
    from sincronizador_background import REDMETEO_COORDENADAS
    assert "sctl" in REDMETEO_COORDENADAS
    lat, lon = REDMETEO_COORDENADAS["sctl"]
    assert lat < 0 and lon < 0

def test_guardar_cache_atomico():
    from sincronizador_background import guardar_cache_en_disco
    guardar_cache_en_disco()
    import os
    assert os.path.exists("cache_servidor.json")

def test_weather_current_endpoint():
    response = client.get("/api/v1/weather/current?lat=-33.4450&lng=-70.6830")
    assert response.status_code == 200
    data = response.json()
    assert "estacion" in data
    assert "transparency_metadata" in data
    meta = data["transparency_metadata"]
    assert "source_name" in meta
    assert "last_fetched_timestamp" in meta
    assert "updated_ago_str" in meta
    assert "official_bulletin" in meta


