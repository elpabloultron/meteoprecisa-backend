function rosadelosvientos(grados) {
    // Definir las direcciones cardinales y sus rangos de grados
    var direcciones = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    var rangos = [[0, 22.5], [22.5, 45.0], [45.0, 67.5], [67.5, 90], [90, 112.5], [112.5, 135.0], [135.0, 157.5], [157.5, 180.0], [180.0, 202.5], [202.5, 225.0], [225.0, 247.5], [247.5, 270.0], [270.0, 292.5], [292.5, 315.0], [315.0, 337.5], [337.5, 360.0], [360.0, 382.5]];

    // Calcular la posición del viento en el array
    var posicion = 0;
    for (var i = 0; i < rangos.length; i++) {
      if (grados >= rangos[i][0] && grados < rangos[i][1]) {
        posicion = i;
        break;
      }
  };

  // Devolver la dirección cardinal correspondiente
  return direcciones[posicion];
};


function Angulos(D, lng) {
    var dir = D < 0 ? (lng ? "O" : "S") : lng ? "E" : "N";
    var deg = 0 | (D < 0 ? (D = -D) : D);
    var min= 0 | (((D += 1e-9) % 1) * 60);
    //var sec= (0 | (((D * 60) % 1) * 6000)) / 100;
    var salida = deg + "&deg;" + min + "' " + dir;
    return salida;
};

$(document).ready(function() {
    // Función para crear un marcador
    function creaMarcador(latitud, longitud, nombre, id, datos) {
        // cambialo a divicon
        var iconoMarcador = L.icon({
            iconUrl: 'img/emavector.svg',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        
        var marcador = L.marker([latitud, longitud], {icon: iconoMarcador});
        marcador.id = "capa_gral";

        var muestratemp;
        var muestrahum;
        if (datos["temperatura"] == null) {
           muestratemp = "<span style='color: red;'>Error!</span>";
        } else {
            muestratemp = datos["temperatura"] + "&deg;C ";
        }
        if (datos["humedad"] == null) {
            muestrahum = "<span style='color: red;'>Error!</span>";
         } else {
             muestrahum = datos["humedad"] + " %";
         }
        
        // Contenido del globo de información
        var utctimmap = moment(datos["fecha_hora"]);
        var fechamapa = utctimmap.format("DD-MM-YYYY");
        var horamapa = utctimmap.format("HH:mm");
        var diferencia = utctimmap.fromNow();

        var contenidoPopup = "<span class='text-muted'>Estación RedMeteo "+ id +"</span>";
        contenidoPopup += "<h5>" + nombre + "</h5>"
        contenidoPopup += "<b>Coordenadas:</b> " + Angulos(latitud, false) + ", " + Angulos(longitud, true) + "<br>";
        
        // // Agregar datos de la estación según la capa activa
        // var capaActiva = mapaLeaflet.getLayer('capaActiva');
        // if (capaActiva) {
        //     var campo = capaActiva.options.nombreCampo;
        contenidoPopup += "<table class='table table-striped'>";
        contenidoPopup += "<tr><td><b><i class='bi bi-thermometer-half'></i> Temperatura</b></td> <td>" + muestratemp + "</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-speedometer'></i>  Presión</b></td> <td>" + datos["presion"] + " hPa</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-cloud-drizzle'></i> Lluvia</b></td> <td>" + datos["precipitacion"] + " mm hoy</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-moisture'></i> Humedad</b></td> <td>" + muestrahum + "</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-wind'></i> Viento y Dir.</b></td> <td>" + Math.round(datos["viento"]*36)/10 + " km/h, " + rosadelosvientos(datos["direccion"]) + "</td></tr>";
        contenidoPopup += "</table>";
        contenidoPopup += "<small><b>Recibido: </b>" + fechamapa + " " + horamapa + " hrs. (" +  diferencia + ")</small><br>";
        contenidoPopup += "<small>Ver la Ficha de Estación <a href='https://redmeteo.cl/estacion.html?codigo=" + id + "'> aquí</a></small>";
        
        // }
        
        marcador.bindPopup(contenidoPopup);
        
        return marcador;
    }

    function creaMarcadorViento(latitud, longitud, nombre, id, datos) {
        // cambialo a divicon
        var iconoMarcador = L.WindBarb.icon({lat: latitud, deg: datos["direccion"], speed: Math.round(datos["viento"]*194)/100, pointRadius: 8, barbSpacing: 5, strokeLength: 16, mirrorVel: true});
        
        var marcador = L.marker([latitud, longitud], {icon: iconoMarcador});
        marcador.id = "capa_viento";

        var muestratemp;
        var muestrahum;
        if (datos["temperatura"] == null) {
           muestratemp = "<span style='color: red;'>Error!</span>";
        } else {
            muestratemp = datos["temperatura"] + "&deg;C ";
        }
        if (datos["humedad"] == null) {
            muestrahum = "<span style='color: red;'>Error!</span>";
         } else {
             muestrahum = datos["humedad"] + " %";
         }
        
        // Contenido del globo de información
        var utctimmap = moment(datos["fecha_hora"]);
        var fechamapa = utctimmap.format("DD-MM-YYYY");
        var horamapa = utctimmap.format("HH:mm");
        var diferencia = utctimmap.fromNow();

        var contenidoPopup = "<span class='text-muted'>Estación RedMeteo "+ id +"</span>";
        contenidoPopup += "<h5>" + nombre + "</h5>"
        contenidoPopup += "<b>Coordenadas:</b> " + Angulos(latitud, false) + ", " + Angulos(longitud, true) + "<br>";
        
        // // Agregar datos de la estación según la capa activa
        // var capaActiva = mapaLeaflet.getLayer('capaActiva');
        // if (capaActiva) {
        //     var campo = capaActiva.options.nombreCampo;
        contenidoPopup += "<table class='table table-striped'>";
        contenidoPopup += "<tr><td><b><i class='bi bi-thermometer-half'></i> Temperatura</b></td> <td>" + muestratemp + "</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-speedometer'></i>  Presión</b></td> <td>" + datos["presion"] + " hPa</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-cloud-drizzle'></i> Lluvia</b></td> <td>" + datos["precipitacion"] + " mm hoy</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-moisture'></i> Humedad</b></td> <td>" + muestrahum + "</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-wind'></i> Viento y Dir.</b></td> <td>" + Math.round(datos["viento"]*36)/10 + " km/h, " + rosadelosvientos(datos["direccion"]) + "</td></tr>";
        contenidoPopup += "</table>";
        contenidoPopup += "<small><b>Recibido: </b>" + fechamapa + " " + horamapa + " hrs. (" +  diferencia + ")</small><br>";
        contenidoPopup += "<small>Ver la Ficha de Estación <a href='https://redmeteo.cl/estacion.html?codigo=" + id + "'> aquí</a></small>";
        
        // }
        
        marcador.bindPopup(contenidoPopup);
        
        return marcador;
    }

    function creaMarcadorTemperatura(latitud, longitud, nombre, id, datos) {
        // cambialo a divicon
        var urlicono;
        var muestratemp;
        var muestrahum;

        var utctimmap = moment(datos["fecha_hora"]);
        var fechamapa = utctimmap.format("DD-MM-YYYY");
        var horamapa = utctimmap.format("HH:mm");
        var diferencia = utctimmap.fromNow();
        var ahora = moment();
        var tiempodato = moment(datos["fecha_hora"]);
        var segundos = tiempodato.diff(ahora);

        if (datos["temperatura"] == null || segundos < -10800000) {
           urlicono = 'marcadores/null.svg';
           muestratemp = "<span style='color: red;'>Error!</span>";
        } else {
            urlicono = 'marcadores/' + Math.round(datos["temperatura"]) +'.svg';
            muestratemp = datos["temperatura"] + "&deg;C ";
        }
        if (datos["humedad"] == null) {
            muestrahum = "<span style='color: red;'>Error!</span>";
         } else {
             muestrahum = datos["humedad"] + " %";
         }

        var iconoMarcador = L.icon({
            iconUrl: urlicono,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        
        var marcador = L.marker([latitud, longitud], {icon: iconoMarcador});
        marcador.id = "capa_temp";
        
        // Contenido del globo de información

        var contenidoPopup = "<span class='text-muted'>Estación RedMeteo "+ id +"</span>";
        contenidoPopup += "<h5>" + nombre + "</h5>"
        contenidoPopup += "<b>Coordenadas:</b> " + Angulos(latitud, false) + ", " + Angulos(longitud, true) + "<br>";
        
        // // Agregar datos de la estación según la capa activa
        // var capaActiva = mapaLeaflet.getLayer('capaActiva');
        // if (capaActiva) {
        //     var campo = capaActiva.options.nombreCampo;
        contenidoPopup += "<table class='table table-striped'>";
        contenidoPopup += "<tr><td><b><i class='bi bi-thermometer-half'></i> Temperatura</b></td> <td>" + muestratemp + "</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-speedometer'></i>  Presión</b></td> <td>" + datos["presion"] + " hPa</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-cloud-drizzle'></i> Lluvia</b></td> <td>" + datos["precipitacion"] + " mm hoy</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-moisture'></i> Humedad</b></td> <td>" + muestrahum + "</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-wind'></i> Viento y Dir.</b></td> <td>" + Math.round(datos["viento"]*36)/10 + " km/h, " + rosadelosvientos(datos["direccion"]) + "</td></tr>";
        contenidoPopup += "</table>";
        contenidoPopup += "<small><b>Recibido: </b>" + fechamapa + " " + horamapa + " hrs. (" +  diferencia + ")</small><br>";
        contenidoPopup += "<small>Ver la Ficha de Estación <a href='https://redmeteo.cl/estacion.html?codigo=" + id + "'> aquí</a></small>";
        
        marcador.bindPopup(contenidoPopup);
        
        return marcador;
    }

    function creaMarcadorLluvia(latitud, longitud, nombre, id, datos) {
        // cambialo a divicon
        var utctimmap = moment(datos["fecha_hora"]);
        var fechamapa = utctimmap.format("DD-MM-YYYY");
        var horamapa = utctimmap.format("HH:mm");
        var diferencia = utctimmap.fromNow();
        var ahora = moment();
        var tiempodato = moment(datos["fecha_hora"]);
        var segundos = tiempodato.diff(ahora);

        var lluvia;
        var contenidolluvia;
        if (datos["precipitacion"] == 0.0){
            lluvia = 1;
            contenidolluvia = Math.floor(datos["precipitacion"]);
        } else if (datos["precipitacion"] > 0.0 && datos["precipitacion"] <= 10.0) {
            lluvia = 2;
            contenidolluvia = Math.floor(datos["precipitacion"]);
        } else if (datos["precipitacion"] > 10.0 && datos["precipitacion"] <= 20.0) {
            lluvia = 3;
            contenidolluvia = Math.floor(datos["precipitacion"]);
        } else if (datos["precipitacion"] > 20.0 && datos["precipitacion"] <= 30.0) {
            lluvia = 4;
            contenidolluvia = Math.floor(datos["precipitacion"]);
        } else if (datos["precipitacion"] > 30.0) {
            lluvia = 5;
            contenidolluvia = Math.floor(datos["precipitacion"]);
        } else {
            lluvia = "null";
            contenidolluvia = "";
        }
        if (segundos < -10800000) {
            lluvia = "null";
            contenidolluvia = "";
        }

        var muestratemp;
        var muestrahum;
        if (datos["temperatura"] == null) {
           muestratemp = "<span style='color: red;'>Error!</span>";
        } else {
            muestratemp = datos["temperatura"] + "&deg;C ";
        }
        if (datos["humedad"] == null) {
            muestrahum = "<span style='color: red;'>Error!</span>";
         } else {
             muestrahum = datos["humedad"] + " %";
         }

        var iconoMarcador = L.divIcon({
            //iconUrl: 'marcadores/rain' + lluvia +'.svg',
            className:  'lluvia' + lluvia,
            html: '<span style="font-size: 1em;"> ' + contenidolluvia + '</span>',
            iconSize: [32, 32],
            iconAnchor: [16, 28],
            popupAnchor: [0, -32]
        });
        
        var marcador = L.marker([latitud, longitud], {icon: iconoMarcador});
        marcador.id = "capa_temp";
        
        // Contenido del globo de información
        var contenidoPopup = "<span class='text-muted'>Estación RedMeteo "+ id +"</span>";
        contenidoPopup += "<h5>" + nombre + "</h5>"
        contenidoPopup += "<b>Coordenadas:</b> " + Angulos(latitud, false) + ", " + Angulos(longitud, true) + "<br>";
        
        // // Agregar datos de la estación según la capa activa
        // var capaActiva = mapaLeaflet.getLayer('capaActiva');
        // if (capaActiva) {
        //     var campo = capaActiva.options.nombreCampo;
        contenidoPopup += "<table class='table table-striped'>";
        contenidoPopup += "<tr><td><b><i class='bi bi-thermometer-half'></i> Temperatura</b></td> <td>" + muestratemp + "</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-speedometer'></i>  Presión</b></td> <td>" + datos["presion"] + " hPa</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-cloud-drizzle'></i> Lluvia</b></td> <td>" + datos["precipitacion"] + " mm hoy</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-moisture'></i> Humedad</b></td> <td>" + muestrahum + "</td></tr>";
        contenidoPopup += "<tr><td><b><i class='bi bi-wind'></i> Viento y Dir.</b></td> <td>" + Math.round(datos["viento"]*36)/10 + " km/h, " + rosadelosvientos(datos["direccion"]) + "</td></tr>";
        contenidoPopup += "</table>";
        contenidoPopup += "<small><b>Recibido: </b>" + fechamapa + " " + horamapa + " hrs. (" +  diferencia + ")</small><br>";
        contenidoPopup += "<small>Ver la Ficha de Estación <a href='https://redmeteo.cl/estacion.html?codigo=" + id + "'> aquí</a></small>";
        
        marcador.bindPopup(contenidoPopup);
        
        return marcador;
    }
    let capaemas = L.geoJSON(null);
    let capatemp = L.geoJSON(null);
    let capalluvia = L.geoJSON(null);
    let capaviento = L.geoJSON(null);
    let capas;
    let primeraejecucion = false;
    
    // Procesar el JSON
    function procesarmapa(){
        $.ajax({
            url: 'last-data.json', // URL del archivo JSON
            dataType: 'json', // Tipo de respuesta esperado (JSON)
            success: function(datos) { 
                if (primeraejecucion == false) {
                    capas = creaCapasMarcadores(datos);
                    capaemas = capaemas.addLayer(capas.customGetLayer('capa_gral'));
                    capatemp = capatemp.addLayer(capas.customGetLayer('capa_temp'));
                    capalluvia = capalluvia.addLayer(capas.customGetLayer('capa_lluvia'));
                    capaviento = capaviento.addLayer(capas.customGetLayer('capa_viento'));
                    //capatemp.addTo(mapaLeaflet);
                    //var capaemas = capas.customGetLayer('capa_lluvia');
                    capatemp.addTo(mapaLeaflet); 
                    primeraejecucion = true;
                } else {
                    //capaemas.removeLayer(capas.customGetLayer('capa_gral'));
                    //capatemp.removeLayer(capas.customGetLayer('capa_temp'));
                    //capalluvia.removeLayer(capas.customGetLayer('capa_lluvia'));
                    mapaLeaflet.invalidateSize();
                    capas = creaCapasMarcadores(datos);

                    capaemas = capaemas.addLayer(capas.customGetLayer('capa_gral'));
                    capatemp = capatemp.addLayer(capas.customGetLayer('capa_temp'));
                    capalluvia = capalluvia.addLayer(capas.customGetLayer('capa_lluvia'));
                    capaviento = capaviento.addLayer(capas.customGetLayer('capa_viento'));
                }

            }
        });
    }

    procesarmapa();
    // Establecer un intervalo para actualizar el mapa cada 5 minutos
    setInterval(procesarmapa, 60*1000); 

    // fetch('last-data.json')
    // .then(response => response.json())
    // .then(datosJSON => {
    //     // Procesar los datos JSON
    //     var datos = datosJSON;
        
    //     // Crear capas y marcadores
    //     capas = creaCapasMarcadores(datos);
    //     capaemas = capaemas.addLayer(capas.customGetLayer('capa_gral'));
    //     capatemp = capatemp.addLayer(capas.customGetLayer('capa_temp'));
    //     capalluvia = capalluvia.addLayer(capas.customGetLayer('capa_lluvia'));
    //     //capatemp.addTo(mapaLeaflet);
    //     //var capaemas = capas.customGetLayer('capa_lluvia');
    //     capaemas.addTo(mapaLeaflet); 
    // })
    // .catch(error => {
    //     console.error('Error al cargar datos JSON:', error);
    // });
    
    L.LayerGroup.include({
        customGetLayer: function (id) {
            for (var i in this._layers) {
                if (this._layers[i].id == id) {
                   return this._layers[i];
                }
            }
        }
    });
    
    // Crear el mapa Leaflet
    var mapaLeaflet = L.map('mapa', {
        fullscreenControl: {
            pseudoFullscreen: false // if true, fullscreen to page width and height
        },
        center: [-37.06239, -73.14143],
        //layers: [Street, Nubes],
        zoom: 4
    });
    var dianoche = L.terminator({fillOpacity: 0.125, opacity: 0.125}).addTo(mapaLeaflet);
    setInterval(function() {
        dianoche.setTime();
    }, 60000); // Every minute

    var Street = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; 2024 Red Meteorológica Aficionada de Chile. Capas base &copy; ESRI',
        maxZoom: 20,
        minZoom: 1
      });
    var Liberty = L.maplibreGL({
        style: 'https://tiles.openfreemap.org/styles/liberty',
        attribution: '&copy; 2024 Red Meteorológica Aficionada de Chile. Capas base &copy; OpenFreeMap',
        maxZoom: 20,
        minZoom: 1
    });
    var Satelital = L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; 2024 Red Meteorológica Aficionada de Chile. Capas base &copy; ESRI',
        maxZoom: 20,
        minZoom: 1
      });
    var Topografico = L.tileLayer('http://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; 2024 Red Meteorológica Aficionada de Chile. Capas base &copy; ESRI',
        maxZoom: 20,
        minZoom: 1
      });

    var WorldShaded = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; 2024 Red Meteorológica Aficionada de Chile. Capas base &copy; ESRI',
        maxZoom: 20,
        minZoom: 1
      });
    var Dark = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; 2024 Red Meteorológica Aficionada de Chile. Capas base &copy; CARTO',
        maxZoom: 20,
        minZoom: 1
      });

    var Precipitacion = L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=398d76a7cc8b8b0f2f3c72d09ae7498c', {
        attribution: '&copy; OpenWeatherMap',
        maxZoom: 9,
        minZoom: 1
      });

    var Nubes = L.tileLayer('https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=398d76a7cc8b8b0f2f3c72d09ae7498c', {
        attribution: '&copy; OpenWeatherMap',
        maxZoom: 9,
        minZoom: 1
      });

    var Temperatura = L.tileLayer('https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=398d76a7cc8b8b0f2f3c72d09ae7498c', {
        attribution: '&copy; OpenWeatherMap',
        maxZoom: 9,
        minZoom: 1
    });
    var Viento = L.tileLayer('https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=398d76a7cc8b8b0f2f3c72d09ae7498c', {
        attribution: '&copy; OpenWeatherMap',
        maxZoom: 9,
        minZoom: 1
    });

    var Presion = L.tileLayer('https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=398d76a7cc8b8b0f2f3c72d09ae7498c', {
        attribution: '&copy; OpenWeatherMap',
        maxZoom: 9,
        minZoom: 1
    });
    Street.addTo(mapaLeaflet);
    //Nubes.addTo(mapaLeaflet);
    Precipitacion.addTo(mapaLeaflet);

    var baseMaps = {
        "Calle": Street,
        "Vectorial": Liberty,
        "Sombreado": WorldShaded,
        "Positron": Dark,
        "Satelital": Satelital,
        "Topográfico": Topografico
    };
    
    var overlayMaps = {
        "Red EMAs": {
            "Estaciones": capaemas,
            "Temp. EMAs": capatemp,
            "Precip. EMAs": capalluvia,
            "Viento EMAs": capaviento
        },
        "Modelos Numéricos" : {
            "Nubes": Nubes,
            "Precipitación": Precipitacion,
            "Temperatura": Temperatura,
            "Viento" : Viento,
            "Presión SLP": Presion
        }
    };
    var opciones = {
        exclusiveGroups: ["Red EMAs"],
      };

    var layerControl = L.control.groupedLayers(baseMaps, overlayMaps, opciones)
    layerControl.addTo(mapaLeaflet);
    
    
    // Definir las capas
    function creaCapasMarcadores(datos) {
        var capageneral = L.geoJSON(null, {
            onEachFeature: function(feature, layer) {
                var nombre = feature.properties.nombre;
                var latitud = feature.geometry.coordinates[1];
                var longitud = feature.geometry.coordinates[0];
                var temperatura = feature.properties.temperatura;
                var presion = feature.properties.presion;
                var precipitacion = feature.properties.precipitacion;
                var vientovel = feature.properties.velocidad_viento;
                var direccion = feature.properties.direccion_viento;
                var humedad = feature.properties.humedad;
                var fecha_hora = feature.properties.fecha_hora;
                
                var marcador = creaMarcador(latitud, longitud, nombre, id, {temperatura: temperatura, presion: presion, precipitacion: precipitacion, viento: vientovel, direccion: direccion, humedad: humedad, fecha_hora: fecha_hora});
                layer.addLayer(marcador);
            }
        });
        capageneral.id = 'capa_gral';

        var capaT = L.geoJSON(null, {
            onEachFeature: function(feature, layer) {
                var nombre = feature.properties.nombre;
                var latitud = feature.geometry.coordinates[1];
                var longitud = feature.geometry.coordinates[0];
                var temperatura = feature.properties.temperatura;
                var presion = feature.properties.presion;
                var precipitacion = feature.properties.precipitacion;
                var vientovel = feature.properties.velocidad_viento;
                var direccion = feature.properties.direccion_viento;
                var humedad = feature.properties.humedad;
                var fecha_hora = feature.properties.fecha_hora;
                
                var marcador = creaMarcadorTemperatura(latitud, longitud, nombre, id, {temperatura: temperatura, presion: presion, precipitacion: precipitacion, viento: vientovel, direccion: direccion, humedad: humedad, fecha_hora: fecha_hora});
                layer.addLayer(marcador);
            }

        });
        capaT.id = 'capa_temp';

        var capaLL = L.geoJSON(null, {
            onEachFeature: function(feature, layer) {
                var nombre = feature.properties.nombre;
                var latitud = feature.geometry.coordinates[1];
                var longitud = feature.geometry.coordinates[0];
                var temperatura = feature.properties.temperatura;
                var presion = feature.properties.presion;
                var precipitacion = feature.properties.precipitacion;
                var vientovel = feature.properties.velocidad_viento;
                var direccion = feature.properties.direccion_viento;
                var humedad = feature.properties.humedad;
                var fecha_hora = feature.properties.fecha_hora;

                
                var marcador = creaMarcadorLluvia(latitud, longitud, nombre, id, {temperatura: temperatura, presion: presion, precipitacion: precipitacion, viento: vientovel, direccion: direccion, humedad: humedad, fecha_hora: fecha_hora});
                layer.addLayer(marcador);
            }

        });
        capaLL.id = 'capa_lluvia';

        var capaVV = L.geoJSON(null, {
            onEachFeature: function(feature, layer) {
                var nombre = feature.properties.nombre;
                var latitud = feature.geometry.coordinates[1];
                var longitud = feature.geometry.coordinates[0];
                var temperatura = feature.properties.temperatura;
                var presion = feature.properties.presion;
                var precipitacion = feature.properties.precipitacion;
                var vientovel = feature.properties.velocidad_viento;
                var direccion = feature.properties.direccion_viento;
                var humedad = feature.properties.humedad;
                var fecha_hora = feature.properties.fecha_hora;

                
                var marcador = creaMarcadorLViento(latitud, longitud, nombre, id, {temperatura: temperatura, presion: presion, precipitacion: precipitacion, viento: vientovel, direccion: direccion, humedad: humedad, fecha_hora: fecha_hora});
                layer.addLayer(marcador);
            }

        });
        capaVV.id = 'capa_viento';
        
        // Recorrer datos y crear marcadores
        for (var estacion of datos) {
            var latitud = estacion.latitud;
            var longitud = estacion.longitud;
            var nombre = estacion.nombre;
            var id = estacion.id_estacion;
            var fh = estacion.fecha_hora;
            
            var marcadorcito = creaMarcador(latitud, longitud, nombre, id, {temperatura: estacion.temperatura, presion: estacion.presion, precipitacion: estacion.lluviadiaria, viento: estacion.velocidad_viento, direccion: estacion.direccion_viento, humedad: estacion.humedad, fecha_hora: fh});
            var marcaT = creaMarcadorTemperatura(latitud, longitud, nombre, id, {temperatura: estacion.temperatura, presion: estacion.presion, precipitacion: estacion.lluviadiaria, viento: estacion.velocidad_viento, direccion: estacion.direccion_viento, humedad: estacion.humedad, fecha_hora: fh});
            var marcaLL = creaMarcadorLluvia(latitud, longitud, nombre, id, {temperatura: estacion.temperatura, presion: estacion.presion, precipitacion: estacion.lluviadiaria, viento: estacion.velocidad_viento, direccion: estacion.direccion_viento, humedad: estacion.humedad, fecha_hora: fh});
            var marcaVV = creaMarcadorViento(latitud, longitud, nombre, id, {temperatura: estacion.temperatura, presion: estacion.presion, precipitacion: estacion.lluviadiaria, viento: estacion.velocidad_viento, direccion: estacion.direccion_viento, humedad: estacion.humedad, fecha_hora: fh});
            //var marcadorLluviaDiaria = creaMarcador(latitud, longitud, nombre, {lluviaDiaria: estacion.lluviadiaria});
            //var marcadorVelocidadViento = creaMarcador(latitud, longitud, nombre, {velocidadViento: estacion.velocidad_viento});
            //console.log('Procesando..' & nombre);
            //marcadorcito.addTo(mapaLeaflet);
            capageneral.addLayer(marcadorcito);
            capaT.addLayer(marcaT);
            capaLL.addLayer(marcaLL);
            capaVV.addLayer(marcaVV);
    
            //capaLluviaDiaria.addLayer(marcadorLluviaDiaria);
            //capaVelocidadViento.addLayer(marcadorVelocidadViento);
        }
        var grupomarcadores = L.layerGroup([capageneral, capaT, capaLL, capaVV]);
        return grupomarcadores;
    }
});