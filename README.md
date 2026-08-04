# 🛰️ MeteoPrecisa Chile — Plataforma Agrometeorológica Hiperlocal & Google Earth Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?style=flat&logo=python)](https://www.python.org/)
[![Google Earth Engine](https://img.shields.io/badge/Google_Earth_Engine-EE_API-4285F4?style=flat&logo=google)](https://earthengine.google.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-green?style=flat&logo=leaflet)](https://leafletjs.com/)
[![Windy](https://img.shields.io/badge/Windy-ECMWF_API-red?style=flat)](https://www.windy.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**MeteoPrecisa Chile** es una plataforma agrometeorológica y de monitoreo ambiental hiperlocal de última generación, diseñada para integrar en una sola interfaz unificada la telemetría en tiempo real de **609 estaciones meteorológicas físicas en Chile**, análisis satelital de alta resolución vía **Google Earth Engine (GEE)**, capas de viento/radar animadas **Windy (60fps)**, e informes oficiales de **SENAPRED**, **DMC** y la red **SINCA (Ministerio del Medio Ambiente)**.

---

## 🌟 Características Principales

* 📡 **Telemetría Multired Unificada (609 Estaciones):**
  * **Agromet INIA:** 320+ estaciones agrícolas con medición de heladas, horas frío y evapotranspiración $ETo$ (incluye Estaciones Clave como *INIA Quilacahuín*, *Cañal Bajo Osorno*, etc.).
  * **Dirección Meteorológica de Chile (DMC):** Estaciones aeroportuarias y sinópticas oficiales.
  * **RedMeteo / Estaciones Privadas:** Redes comunitarias y de monitoreo local.
* 🛰️ **Análisis Satelital Avanzado vía Google Earth Engine (GEE):**
  * **NDVI (Normalized Difference Vegetation Index):** Salud y vigor vegetativo en cultivos y praderas (Sentinel-2 / MODIS).
  * **NDWI (Normalized Difference Water Index):** Estrés hídrico y contenido de agua en hojas.
  * **LST (Land Surface Temperature):** Temperatura real de la superficie del suelo (°C) para detección de heladas radiativas.
  * **EVI (Enhanced Vegetation Index):** Monitoreo de biomasa y dosel en bosques y cultivos densos.
  * **FIRMS / Detección de Incendios:** Detección de focos de calor a través de sensores térmicos MODIS/VIIRS.
  * **Evapotranspiración Real Acumulada (MOD16A2):** Consumo hídrico real por hectárea.
* 🌀 **Visor de Mapas Animados Fluidos (Windy Embed 60fps):**
  * Capas dinámicas de vector de viento, radar de precipitaciones doppler, cobertura nubosa y oleaje marino.
* 🛰️ **Visor Satelital NOAA GOES-19 (24 Horas):**
  * Reproductor interactivo de fotogramas infrarrojos capturados cada 10 minutos desde los servidores operacionales de la NOAA.
* 🫁 **Módulo de Calidad del Aire Dual (SINCA MMA + US AQI):**
  * Evaluación simultánea bajo la norma chilena **D.S. 12/2011 del Ministerio del Medio Ambiente** ($MP2.5$ y $MP10$) y la escala internacional **US AQI (EPA EE.UU., 0-500)** con alertas sanitarias para la población.
* 🚨 **Alertas de Emergencia y Sinópticas (SENAPRED & DMC):**
  * Filtrado regional según la ubicación geográfica del usuario y visualización de comunicados oficiales.
* 🌾 **Conmutador de Modo Urbano vs. Modo Agrícola:**
  * Vista adaptada para usuarios urbanos (sensación térmica, viento, presión, UV, AQI) o productores agrícolas (lluvia caída 24H, lluvia pronosticada, acumulado mensual, horas frío base 7°C, $ETo$ FAO-56, radiación $W/m^2$).

---

## 🏗️ Arquitectura del Sistema & Flujo de Datos

```
                                  ┌───────────────────────────────┐
                                  │   FUENTES DE DATOS FÍSICAS    │
                                  ├───────────────────────────────┤
                                  │ • Agromet INIA (320+ est)     │
                                  │ • DMC Chile (150+ est)        │
                                  │ • RedMeteo / Privadas         │
                                  │ • SINCA MMA (Calidad Aire)    │
                                  └──────────────┬────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────┐  ┌───────────────────────────────┐
│     PROVEEDORES SATELITALES   │  │   MOTOR BACKGROUND PYTHON     │
├──────────────────────────────┤  ├───────────────────────────────┤
│ • Google Earth Engine (GEE)  │─►│ • Sincronizador Multired      │
│ • NOAA GOES-19 (Chile 24H)   │  │ • Limpieza de Sentinelas      │
│ • Open-Meteo ECMWF / GFS     │  │ • Caché Persistente SQLite    │
└──────────────────────────────┘  └──────────────┬────────────────┘
                                                 │
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │   FASTAPI BACKEND REST API    │
                                  ├───────────────────────────────┤
                                  │ • /api/v1/clima-hiperlocal    │
                                  │ • /api/v1/buscar-estaciones   │
                                  │ • /api/v1/satelite-goes19     │
                                  └──────────────┬────────────────┘
                                                 │
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │   FRONTEND EMERALD GLASS UI   │
                                  ├───────────────────────────────┤
                                  │ • Leaflet.js + Windy Embed    │
                                  │ • Chart.js Dual-Axis 48H      │
                                  │ • Responsive Mobile-First     │
                                  └───────────────────────────────┘
```

---

## 🛠️ Tecnologías y Servidores Utilizados

### **Backend & Motor de Datos**
* **Lenguaje:** Python 3.11 / 3.14
* **Framework Web:** FastAPI (ASGI asíncrono de alto rendimiento con Uvicorn)
* **Base de Datos & Caché:** SQLite3 con consultas indexadas por coordenadas y memoria interna.
* **Procesamiento de Datos:** `pandas`, `numpy`, `httpx`, `requests`.

### **Procesamiento Satelital & Geospacial**
* **Google Earth Engine (GEE Python API):** Extracción de bandas e índices espectrales sobre las coordenadas exactas de las estaciones.
* **NOAA Satellite Server:** Descarga e indexación de fotogramas infrarrojos GOES-19 Band 13/GeoColor.

### **Frontend & Visualización**
* **Estructura & Estilos:** HTML5, CSS Vanilla con sistema de diseño **Emerald Glassmorphism** (`#10b981`), tipografía **Plus Jakarta Sans** y **Space Grotesk**.
* **Librerías de Mapas & Gráficos:** **Leaflet.js 1.9.4**, **Windy Embed API**, **Chart.js**.

---

## 🚀 Guía de Instalación y Ejecución Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/meteoprecisa-backend.git
cd meteoprecisa-backend
```

### 2. Crear y Activar Entorno Virtual
```bash
python -m venv venv
# En Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# En Linux/macOS:
source venv/bin/activate
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 4. Iniciar el Servidor de Desarrollo
```bash
python -m uvicorn main:app --reload --port 8000
```

### 5. Acceder a la Aplicación
Abre tu navegador e ingresa a:
* **Interfaz de Usuario:** `http://localhost:8000/app/`
* **Documentación Interactiva Swagger API:** `http://localhost:8000/docs`

---

## 🧪 Verificación & Pruebas Automatizadas

El proyecto cuenta con un conjunto de pruebas unitarias con `pytest` que verifican la conectividad de todos los endpoints, la limpieza de códigos sentinela y la respuesta de GEE:

```bash
python -m pytest -v test_main.py
```

---

## 📤 Pasos para Subir el Proyecto a GitHub

1. Inicializar repositorio Git local (si aún no está iniciado):
   ```bash
   git init
   ```
2. Crear archivo `.gitignore`:
   ```gitignore
   venv/
   __pycache__/
   *.pyc
   .pytest_cache/
   .env
   base_datos.sqlite
   ```
3. Añadir los archivos y realizar el primer commit:
   ```bash
   git add .
   git commit -m "feat: Lanzamiento MeteoPrecisa Chile v9.0 — Plataforma Agrometeorologica e Integración GEE"
   ```
4. Vincular con tu repositorio remoto en GitHub y hacer push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/tu-usuario/meteoprecisa-backend.git
   git push -u origin main
   ```

---

## 📜 Licencia y Reconocimientos

Este proyecto está disponible bajo la licencia MIT. Agradecimientos especiales a las redes de datos públicas de Chile: **Agromet INIA**, **Dirección Meteorológica de Chile (DMC)**, **SINCA (Ministerio del Medio Ambiente)**, **SENAPRED**, **NOAA Satellite Services**, **Google Earth Engine** y **Windy.com**.