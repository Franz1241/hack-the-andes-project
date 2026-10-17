# NASA – Fuentes de datos para Phoenix

## 1. GPM IMERG – Precipitaciones

- **Datos:** intensidad de lluvia (mm/h), precipitación acumulada (mm), coordenadas geográficas, fecha y hora de observación.
- **Resolución espacial:** aproximadamente 10 km.
- **Frecuencia de generación:** cada 30 minutos.
- **Latencia:** aproximadamente 4 horas (IMERG Early).
- **Frecuencia de extracción recomendada:** cada 30 minutos.
- **Formato:** HDF5, NetCDF, GeoTIFF.
- **Fuente:** [https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGHHE_07/summary](https://disc.gsfc.nasa.gov/datasets/GPM_3IMERGHHE_07/summary)

## 2. NASA FIRMS – Incendios forestales

- **Datos:** latitud, longitud, fecha y hora de detección, satélite, nivel de confianza, potencia radiativa del fuego (FRP).
- **Resolución espacial:** aproximadamente 375 m (VIIRS).
- **Frecuencia de generación:** según los pasos de los satélites.
- **Latencia:** generalmente hasta 3 horas después de la observación.
- **Frecuencia de extracción recomendada:** cada 1 hora.
- **Formato:** CSV, JSON/GeoJSON según el servicio, SHP.
- **Fuente:** [https://firms.modaps.eosdis.nasa.gov/api/](https://firms.modaps.eosdis.nasa.gov/api/)

## 3. NASA LANCE FLOOD – Inundaciones

- **Datos:** extensión de agua superficial, áreas potencialmente inundadas, ubicación geográfica, fecha de observación y clasificación de píxeles.
- **Resolución espacial:** aproximadamente 250 m.
- **Frecuencia de generación:** productos diarios y composiciones de 1, 2 y 3 días.
- **Latencia:** normalmente dentro de 3 horas para los archivos de datos; la visualización puede tardar más.
- **Frecuencia de extracción recomendada:** cada 3 horas, comprobando si existen productos nuevos.
- **Formato:** HDF, GeoTIFF.
- **Fuente:** [https://lance.modaps.eosdis.nasa.gov/flood/](https://lance.modaps.eosdis.nasa.gov/flood/)

## 4. NASA GIBS – Imágenes y capas satelitales

- **Datos:** imágenes satelitales, capas de precipitación, incendios, inundaciones, nubosidad y otras variables ambientales según la capa seleccionada.
- **Resolución espacial:** variable según producto.
- **Frecuencia de actualización:** variable; existen capas subdiarias, diarias y de otras periodicidades.
- **Latencia:** desde minutos hasta horas o más, dependiendo de la capa.
- **Frecuencia de consulta recomendada:** bajo demanda para visualizar mapas; cada 3 horas para comprobar cambios en capas de tiempo casi real.
- **Formato:** WMS, WMTS.
- **Fuente:** [https://gibs.earthdata.nasa.gov/wmts/epsg4326/nrt/](https://gibs.earthdata.nasa.gov/wmts/epsg4326/nrt/)
- **Visualizador:** [https://worldview.earthdata.nasa.gov/](https://worldview.earthdata.nasa.gov/)

---

## Consideraciones para la integración

- Todas las fuentes cuentan con cobertura de Perú.
- Las frecuencias de extracción son recomendaciones para el backend de Phoenix, no frecuencias garantizadas de publicación.
- Almacenar la fecha de observación, fecha de descarga y fuente de cada registro.
- Filtrar los datos geoespaciales usando los límites territoriales de Perú.
- Evitar almacenar registros duplicados.
- GIBS se utilizará principalmente para visualización; las demás fuentes proporcionarán los datos para calcular indicadores de riesgo.
- Priorizar GPM IMERG y FIRMS durante el MVP, complementándolos con LANCE FLOOD y GIBS.
