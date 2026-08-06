# 🌩️ MeteoPrecisa

**Plataforma de Inteligencia Agrometeorológica y Calidad del Aire Hiperlocal**

MeteoPrecisa es una aplicación web y backend API que consolida datos meteorológicos en tiempo real desde múltiples fuentes terrestres (DMC, Agromet INIA, RedMeteo, SINCA, PurpleAir) y los cruza con análisis satelitales avanzados de la Agencia Espacial Europea y la NASA utilizando **Google Earth Engine**. 

La arquitectura está diseñada para ofrecer tiempos de respuesta ultrarrápidos (<50ms) a través de un motor asíncrono de caché que pre-computa los modelos climáticos en segundo plano, permitiendo el despliegue como una PWA (Progressive Web App) nativa orientada a la toma de decisiones agrícolas.

---

## 🏗️ Arquitectura del Sistema

MeteoPrecisa se divide en tres capas principales:

### 1. El Sincronizador en Segundo Plano (Data Ingestion)
Archivo principal: `sincronizador_background.py`

Un worker de Python construido con `asyncio` que se ejecuta perpetuamente en el servidor. Su misión es orquestar la ingesta masiva de datos:
- Consulta en vivo estaciones terrestres oficiales (Dirección Meteorológica de Chile - DMC) y ciudadanas (RedMeteo).
- Se conecta a la API de **PurpleAir** y de **SINCA** (Ministerio del Medio Ambiente) para extraer datos precisos de material particulado y calidad del aire.
- Extrae Alertas Tempranas de **SENAPRED**.
- **Motor de Caché RAM:** En lugar de guardar en bases de datos pesadas, el sincronizador consolida los datos y los inyecta en una memoria local ultrarrápida (`CACHE_MEMORIA`). Este es el "cerebro" que permite que la app cargue instantáneamente. Cuenta con mitigación automática de _memory leaks_ para escalabilidad continua.

### 2. El Cerebro Satelital (Google Earth Engine)
Carpeta: `gee/`

Módulo geoespacial que interactúa nativamente con la API de Earth Engine. Cuando un usuario envía sus coordenadas (Latitud/Longitud), este módulo ejecuta análisis en fracciones de segundo:
- **`gee/rural.py`:** Extrae Salud Vegetal (NDVI - Sentinel-2/MODIS), Evapotranspiración (FAO-56), Radiación Solar (ERA5) y Humedad Volumétrica del Suelo (GLDAS).
- **`gee/urban.py`:** Extrae la Temperatura de Superficie Terrestre (LST) calculando el riesgo de "Islas de Calor Urbano" mediante emisividad térmica (MOD11A1).
- **Endpoint Histórico (`/api/v1/weather/historico`)**: Extrae series de tiempo asíncronas de los últimos 12 meses de índices agrícolas (NDVI) sin bloquear la interfaz.

### 3. API Servidor (Backend)
Archivo principal: `main.py`

Construido en **FastAPI**. Sirve como el puente que une la caché RAM del sincronizador y las peticiones del frontend. Expone endpoints de alto rendimiento (como `/api/v1/weather/nearby`) que realizan algoritmos de `geopy` y `KDTree` para encontrar instantáneamente la estación meteorológica más cercana al usuario y cruzarla con la inteligencia satelital del punto exacto.

### 4. PWA Frontend (React + Vite)
Carpeta: `frontend/`

- Interfaz minimalista y adaptativa construida en **React**, **Vite** y **TailwindCSS**.
- Capacidad de instalación nativa (PWA - Progressive Web App) en iOS y Android.
- Paneles dinámicos (`AgroPanel`, `UrbanPanel`) que se adaptan automáticamente dependiendo de si el usuario está en el campo (mostrando riego y heladas) o en la ciudad (mostrando calidad de aire y confort térmico).
- Gráficos interactivos construidos con `Chart.js` para visualización temporal de datos.

---

## 🚀 Despliegue y Ejecución Local

### Prerrequisitos
- Python 3.10+
- Node.js v18+
- Credenciales habilitadas para [Google Earth Engine](https://earthengine.google.com/)
- API Key de PurpleAir

### Instalación

1. **Clonar repositorio e instalar dependencias Python:**
```bash
git clone https://github.com/elpabloultron/meteoprecisa-backend.git
cd meteoprecisa-backend
pip install -r requirements.txt
```

2. **Configurar Variables de Entorno (IMPORTANTE 🔒)**:
El proyecto requiere llaves privadas que **NUNCA** deben subirse a un repositorio público.
Crea un archivo `.env` en la raíz copiando el `.env.example`:
```bash
cp .env.example .env
```
Abre `.env` y pega tu clave `PURPLEAIR_API_KEY`. 

Para **Google Earth Engine**, asegúrate de haber ejecutado `earthengine authenticate` en tu máquina o proporcionar la `service_account.json` (ambos ya ignorados en `.gitignore`).

3. **Ejecutar Backend FastAPI:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*(El sincronizador en segundo plano arrancará automáticamente con el ciclo de vida del servidor).*

4. **Ejecutar Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Postura de Seguridad e Integridad Open-Source

MeteoPrecisa ha sido diseñado con altos estándares para prevenir vulnerabilidades OWASP comunes y fugas de datos:
- **Protección de Llaves (Secret Management):** Las credenciales de PurpleAir, tokens de Open-Meteo y llaves de Servicio GCloud/Earth Engine están extraídas del código fuente. Se inyectan en tiempo de ejecución a través del archivo local ignorado `.env`.
- **Evasión de Fugas de Memoria:** El sistema de caché interno (`CACHE_MEMORIA`) incluye estrategias de poda y rotación de registros (`truncation limiting` de GEE Points) que garantizan un uso bajo y estable de memoria RAM sin importar si el volumen de usuarios crece de 10 a 1.000.000 de consultas al mes.
- **Robustez contra DDoS y Throttling:** Dado que el cliente (Frontend) no hace *scraping* ni consultas directas a los servidores climáticos, si la app se viraliza, solo recaerá carga sobre el servidor FastAPI cacheado. Los servidores de la DMC o PurpleAir jamás recibirán carga excesiva ya que el backend realiza peticiones atómicas solo una vez cada 15/60 minutos.

---

> *Desarrollado para potenciar la precisión agronómica y climática de los ciudadanos de Chile y Sudamérica.*