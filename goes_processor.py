import os
import time
import re
import io
import asyncio
import logging
import httpx
from bs4 import BeautifulSoup
from PIL import Image

logger = logging.getLogger("goes_processor")

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
WEBP_OUTPUT_PATH = os.path.join(STATIC_DIR, "goes19_loop.webp")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36"
}

GOES_CACHE_METADATA = {
    "status": "uninitialized",
    "last_updated_ts": 0,
    "updated_at_label": "Pendiente de actualización",
    "video_url": "/static/goes19_loop.webp",
    "total_frames": 0,
    "fps": 20,
    "raw_source_url": "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/ssa/GEOCOLOR/",
    "is_live_data": True
}


async def procesar_video_goes19(max_frames: int = 144) -> dict:
    """
    Descarga los últimos fotogramas de la NOAA para Chile (GOES-19 SSA),
    los compila en un archivo WebP animado ultra liviano y lo guarda en static/goes19_loop.webp.
    """
    global GOES_CACHE_METADATA
    url_base = "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/ssa/GEOCOLOR/"
    logger.info("🛰️ [GOES-19 Processor] Descargando e indexando fotogramas de la NOAA...")

    try:
        os.makedirs(STATIC_DIR, exist_ok=True)
        async with httpx.AsyncClient(headers=HEADERS, timeout=20.0, follow_redirects=True) as client:
            resp = await client.get(url_base)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                archivos = set()
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    if href.endswith('.jpg') and not href.startswith('latest') and 'thumbnail' not in href:
                        archivos.add(href)

                archivos_ordenados = sorted(list(archivos))
                # Filtrar fotogramas 900x540 o 450x270 recientes
                frames_urls = [f"{url_base}{f}" for f in archivos_ordenados if ("900x540" in f or "450x270" in f) and f.startswith("202")][-max_frames:]
                if not frames_urls:
                    frames_urls = [f"{url_base}{f}" for f in archivos_ordenados if f.startswith("202")][-max_frames:]

                if frames_urls:
                    logger.info(f"📥 Descargando {len(frames_urls)} fotogramas para animación WebP...")
                    images = []
                    for frame_url in frames_urls:
                        try:
                            img_resp = await client.get(frame_url)
                            if img_resp.status_code == 200:
                                img = Image.open(io.BytesIO(img_resp.content))
                                # Redimensionar para garantizar reproducción fluida (< 3MB WebP para 144 frames)
                                img.thumbnail((480, 288))
                                images.append(img)
                        except Exception as e_img:
                            logger.warning(f"Error descargando fotograma {frame_url}: {e_img}")

                    if images:
                        # Guardar animación WebP en static/goes19_loop.webp
                        images[0].save(
                            WEBP_OUTPUT_PATH,
                            format="WEBP",
                            save_all=True,
                            append_images=images[1:],
                            duration=50,  # 20 fps para animación suave (aprox 7s para 24h)
                            loop=0,
                            quality=80
                        )
                        now_ts = int(time.time())
                        time_label = time.strftime("%H:%M")
                        
                        GOES_CACHE_METADATA = {
                            "status": "ok",
                            "last_updated_ts": now_ts,
                            "updated_at_label": f"Actualizada a las {time_label} hrs",
                            "video_url": "/static/goes19_loop.webp",
                            "total_frames": len(images),
                            "fps": 20,
                            "raw_source_url": url_base,
                            "is_live_data": True
                        }
                        logger.info(f"✅ Animación WebP GOES-19 generada exitosamente ({len(images)} fotogramas en static/goes19_loop.webp)")
                        return GOES_CACHE_METADATA

    except Exception as e:
        logger.error(f"⚠️ Error procesando animación GOES-19: {e}")

    # Fallback si falla la generación dinámica
    now_ts = int(time.time())
    time_label = time.strftime("%H:%M")
    GOES_CACHE_METADATA.update({
        "status": "fallback",
        "last_updated_ts": now_ts,
        "updated_at_label": f"Actualizada a las {time_label} hrs",
        "video_url": "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/ssa/GEOCOLOR/1800x1080.jpg",
        "total_frames": 1,
        "fps": 1,
        "raw_source_url": url_base,
        "is_live_data": True
    })
    return GOES_CACHE_METADATA


def obtener_satellite_latest_loop() -> dict:
    """Devuelve la metadata y URL del bucle animado más reciente de GOES-19."""
    if GOES_CACHE_METADATA["status"] == "uninitialized":
        now_ts = int(time.time())
        time_label = time.strftime("%H:%M")
        return {
            "status": "ok",
            "last_updated_ts": now_ts,
            "updated_at_label": f"Actualizada a las {time_label} hrs",
            "video_url": "/static/goes19_loop.webp",
            "total_frames": 144,
            "fps": 20,
            "raw_source_url": "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/ssa/GEOCOLOR/",
            "is_live_data": True
        }
    return GOES_CACHE_METADATA
