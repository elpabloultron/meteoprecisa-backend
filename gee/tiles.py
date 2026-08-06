import ee

from .core import GEECore


def _create_tile_url(image_ee, vis_params: dict) -> str:
    """Helper genérico para obtener la URL del map ID en Earth Engine."""
    try:
        map_id_dict = image_ee.getMapId(vis_params)
        return map_id_dict['tile_fetcher'].url_format
    except Exception as e:
        print(f"⚠️ Error generando Map ID en GEE: {e}")
        return ""

def obtener_capas_gee_y_windy(lat: float, lon: float) -> dict:
    """Genera las URLs de los tiles (capas visuales) para el Frontend."""
    if not GEECore.is_active():
        return {
            "NDVI_layer": "",
            "NDWI_layer": "",
            "Temperatura_layer": "https://{s}.tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_OWM_KEY"
        }

    try:
        # Definir una región de interés alrededor de lat/lon
        point = ee.Geometry.Point([lon, lat])
        buffer_roi = point.buffer(20000) # 20km
        
        # NDVI Sentinel-2
        s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
            .filterBounds(buffer_roi) \
            .filterDate('2025-10-01', '2026-04-01') \
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
            .median()
            
        ndvi_img = s2.normalizedDifference(['B8', 'B4'])
        ndvi_vis = {'min': 0, 'max': 1, 'palette': ['white', 'green']}
        ndvi_url = _create_tile_url(ndvi_img, ndvi_vis)
        
        # NDWI Sentinel-2
        ndwi_img = s2.normalizedDifference(['B3', 'B8'])
        ndwi_vis = {'min': -1, 'max': 1, 'palette': ['red', 'yellow', 'green', 'blue']}
        ndwi_url = _create_tile_url(ndwi_img, ndwi_vis)
        
        return {
            "NDVI_layer": ndvi_url,
            "NDWI_layer": ndwi_url,
            # Se podría usar Windy u OWM para la visual de temperatura
            "Temperatura_layer": "https://{s}.tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=YOUR_OWM_KEY" 
        }
    except Exception as e:
        print(f"⚠️ Error GEE Tiles: {e}")
        return {
            "NDVI_layer": "",
            "NDWI_layer": "",
            "Temperatura_layer": ""
        }
