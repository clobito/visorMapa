/*
Propósito: Implementación del componente JavaScript en archivo externo para la vista servicio.html
Fecha creado: 14/10/2015 

*/
$(document).ready(function()
{
	dojo.require("dijit.layout.BorderContainer");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dijit.layout.AccordionContainer");
	dojo.require("esri.map");
	dojo.require("esri.dijit.Legend");
	dojo.require("esri.layers.FeatureLayer");
	dojo.require("esri.layers.agstiled");
	dojo.require("esri.dijit.Geocoder");
	dojo.require("esri.arcgis.utils");
	dojo.require("dijit.form.CheckBox");
	dojo.require("dojo.html");
	dojo.require("dojox.data.XmlStore");

	//Variable global para la leyenda
	var tituloLeyenda;		

	//Fecha actualizado: 14/102015
	//Cambio realizado: Variable global para el mapa, para usar la opción "Reestablecer a vista predeterminada"
	var mapMain;

	var map, identifyTarea, identifyParametros, imagen = "", capaUrl = "", contenido = "", metadata = "", fs = false, leyendaCapas = [], infoCapas = [], ocultaCapas = [], leyendaIds = [], identifyIds = [];

	dojo.ready(init);
	
	function init() {
	  /*Fecha actualizado: 13/10/2015
	  Cambio realizado: Actualización del archivo fuente XML por contingencia
	  Fecha actualizado: 15/10/2015
	  Cambio realizado: Cargue del archivo fuente XML del sitio geoportal.
	  */
	  	//var xmlUrl	=	"datosGruposTematicos.xml";
	  	var xmlUrl	=	"datosGruposTematicosNube.xml";
	  	//var xmlUrl		=	"datosGruposTematicosMapasige.xml";
		var servicio 	= 	getURLParam("s");
		alert("URL Servicio =>"+servicio);		
		var indicadores = new dojox.data.XmlStore({url: xmlUrl, rootItem: "servicio"});		

		var obtieneIndicador = function(items, request){
                    
        	var item = items[0];
       

			//****************************************************************************//
			//																			  //	
			//		Parámetros de Entrada Editables										  //
			//																			  //	
			//****************************************************************************//
	
			//ID de la capa de leyenda
			//si hay mas de una capa para mostrar colocar valores separados por comas, por ej: [3,7]
			leyendaIds = indicadores.getValue(item, "@legend").split(",");
	
			if(indicadores.getValue(item, "@image") != null && indicadores.getValue(item, "@image") != "")
			{
				imagen = indicadores.getValue(item, "@image");
			}
	
			//ID de la capa de identificación
			//si hay mas de una capa para mostrar colocar valores separados por comas, por ej: [3,7]
			identifyIds = indicadores.getValue(item, "@identify").split(",");
	
			//Direccion URL del servicio de capas
			capaUrl = indicadores.getValue(item, "@layer");
			//Configuración del URL			
			alert("Capa:"+capaUrl);
			
	
			//Url del Archivo Excel u otro formato
			if(indicadores.getValue(item, "@table") != null && indicadores.getValue(item, "@table") != "")
			{
				contenido = "<a href='" + indicadores.getValue(item, "@table") +  "' id='tabla' style='cursor:pointer;'>";
				contenido += "<img src='sige-theme/images/sige/servicios/descargar.png' alt='Descargue el Excel' title='Descargue el Excel'>";
				contenido += "</a>";
			}

			//Url de los metadatos del indicador
			if(indicadores.getValue(item, "@metadata") != null && indicadores.getValue(item, "@metadata") != "")
			{
				metadata = "<a href='" + indicadores.getValue(item, "@metadata") +  "' target='_blank' class='vinculo'>Metadato de la Investigación</a><br><br>";
			}
	
			if(getURLParam("fullscreen") != null && getURLParam("fullscreen") != "")
			{
				fs = true;
			}
			//Fin de Parámetros Editables
			
			configuraIndicador();
			
		}
		
		var request = indicadores.fetch({onComplete: obtieneIndicador, query: {"@id":servicio}, queryOptions: {ignoreCase: true} });
		
    }
    function configuraIndicador(){
		/*Fecha actualizado: 15/10/2015.
		Cambio realizado: Ocultar botón Maximizar Indicador
		Fecha actualizado: 16/10/2015
		Cambio realizado: Uso de Jquery en la Libreria ArcGIS 3.14*/
		$('#icono_amp').attr('style','visibility:hidden');
		//dojo.query("#icono_amp").style("visibility", "hidden");
		//dojo.query("#gp_logo").style("visibility", "hidden");
		$('#gp_logo').attr('style','visibility:hidden');
		//Cuando el navegador no es IE, se muestra el botón de full screen
		if(!dojo.isIE && fs){
			//dojo.query("#icono_amp").style("visibility", "visible");
			$('#icono_amp').attr('visibility:visible');
		}		
		if(fs){
			//dojo.query("#gp_logo").style("visibility", "visible");
			$('#gp_logo').attr('visibility:visible');
		}
		
		var peticionCapa = esri.request({
		  "url": capaUrl,
		  "content": {
			"f": "json"
		  },
		  "callbackParamName": "callback"
		});
		
		peticionCapa.then(peticionExitosa, peticionFallida);
		
	}

	function iniciarMapa(titulo, capas) {
	/*Fecha actualizado: 13/10/2015
	Cambio realizado: Adaptación librerias ArcGIS 3.14: map, ArcGISTiledMapServiceLayer y Geocoder
	Fecha actualizado: 14/10/2015
	Cambio realizado: Desactivar definición del mapa. Pasa a ser definición global
	Fecha actualizado: 16/10/2015
	Cambio realizado: Desactivación de cargue de redes sociales en vista normal*/	
		tituloLeyenda = titulo;
        //var mapMain;
        var geoCoder;
        require([
	        "esri/map",
	        "esri/layers/ArcGISTiledMapServiceLayer",
	        "esri/dijit/Geocoder",
	        "esri/graphic",
	        "esri/InfoTemplate",
	        "esri/SpatialReference",
	        "esri/geometry/Extent",
	        "esri/layers/GraphicsLayer",
	        "dojo/domReady!"
        ], function (
        	Map, ArcGISTiledMapServiceLayer, Geocoder, Graphic, InfoTemplate, SpatialReference, Extent, GraphicsLayer
        	)
        	{
        		mapMain =	new Map("map",
        		{
        			basemap: "streets",
        			center: [-74.095938, 4.647016],        			    			
        			zoom:6,
        			sliderPosition: "bottom-right"
        		});

        		//Carga de la capa en la nueva libreria
        		var capa = new ArcGISTiledMapServiceLayer(capaUrl);
        		//Adición de la capa al mapa
        		mapMain.addLayer(capa);

        		//Definición limites del mapa
        		var extMapa = new esri.geometry.Extent( 
        		{
        			"xmin":-9495735,
    				"ymin":-83164,
    				"xmax":-7186725,
    				"ymax":1406441,
    				"spatialReference":
    				{
    					"wkid":102100
    				}
        		});
        		//Adición de los limites al mapa
        		mapMain.setExtent(extMapa);

        		infoCapas.push({layer:capa,title:titulo});

        		//Prepara la capa para la leyenda, procurando solo mostrar la capa adecuada
				for(layer in capas)
				{  
					if( !buscaEnArray(leyendaIds, layer) ) {
						ocultaCapas.push(layer);
					}
				}

				leyendaCapas.push({layer:capa,title:titulo,hideLayers:ocultaCapas});

				//Implementación del geoCoder
				geoCoder = new Geocoder(
				{
					map: map,
					autoComplete: true,
					arcgisGeocoder:
					{
						placeholder: "Introducir una Ubicación"
					}

				},dojo.byId("busqueda"));

				//Evento para carga de la capa del mapa
				mapEvents 	= 	mapMain.on("load", setLoadMap);

				//Método para procesar carga del mapa
				function setLoadMap(mapEvents)
				{
					/*Fecha actualizado: 15/10/2015
					Cambio realizado: Ocultar iconos de Maximizar indicador y descarga de excel cuando se obtiene el mapa*/
					/*esri.hide($('#icono_amp'));
					esri.hide($('#excel'));*/
					$('#icono_amp').attr('style','visibility:visible');
					prepararMapa(mapEvents);
				}

				//Eventos de carga/descarga de capas del mapa
				mapEvents 	= 	mapMain.on("update-end", setLoadEnd);

				//Método para procesar el evento "update-end"
				function setLoadEnd()
				{
					/*Fecha actualizado: 14/10/2015
					Cambio realizado: Cargue del vinculo para descargar información en hoja de calculo*/
					//esri.hide(dojo.byId("carga"));
					$("#excel").html(contenido);
					
					//esri.show(dojo.byId("excel"));
					/*esri.show($("#excel"));
					esri.show($('#icono_amp'));*/										
					$(".viewRestore").click(function()
					{
						/*Fecha actualizado: 14/10/2015
						Cambio realizado: Habilitar vinculo "Reestablecer a vista predeterminada".*/

						var limites = new esri.geometry.Extent({"xmin":-9495735,"ymin":-83164,"xmax":-7186725,"ymax":1406441,"spatialReference":{"wkid":102100}});
						mapMain.setExtent(limites);
					});
				}

				//Eventos de carga/descarga del mapa
				mapEvents	=	mapMain.on("update-start", setLoadStart);

				//Método para procesar el evento "update-start"
				function setLoadStart()
				{
					esri.show(dojo.byId("carga"));
				}

				//Evento para colocar la opción de cargue Metadata
				//Fecha creado: 14/10/2015
				mapEvents	=	mapMain.on("layer-add-result", setLoadMetadata);

				//Método para procesar el evento "layer-add-result"
				function setLoadMetadata()
				{
					var peticionLeyenda = esri.request({
					  "url": capaUrl + "/legend",
					  "content": {
						"f": "json"
					  },
					  "callbackParamName": "callback"
					});
					peticionLeyenda.then(peticionLeyendaExitosa, peticionFallida);
					$("#metadata").html(metadata);				
				}				
				
        	});
		//var limites = new esri.geometry.Extent({"xmin":-9495735,"ymin":-83164,"xmax":-7186725,"ymax":1406441,"spatialReference":{"wkid":102100}});
		
		/*map = new esri.Map("map", { 
		  extent: limites,
		  sliderStyle: "small",
		  sliderPosition: "bottom-right",
		  minZoom: 6,
		  maxZoom: 10,
		  logo: false
        });*/
		


		//Configura el buscador
		/*var Geocoder = new esri.dijit.Geocoder({
			autoComplete: true,
			arcgisGeocoder:{
				placeholder: "Introducir una Ubicación"
			},
		  map: map
        },dojo.byId("busqueda"));
		//Inicia el Buscador
		Geocoder.startup();*/
		
		//Capa principal
		/*var capa = new esri.layers.ArcGISTiledMapServiceLayer(capaUrl);
		//map.addLayers([capa]);
		mapMain.addLayer(capa);*/

		/*infoCapas.push({layer:capa,title:titulo});
		
		//Prepara la capa para la leyenda, procurando solo mostrar la capa adecuada
		for(layer in capas)
		{  
			if( !buscaEnArray(leyendaIds, layer) ) {
				ocultaCapas.push(layer);
			}
		}
		
		leyendaCapas.push({layer:capa,title:titulo,hideLayers:ocultaCapas});
		
		dojo.connect(map,"onUpdateEnd",function(){
		  esri.hide(dojo.byId("carga"));
		});

		dojo.connect(map,"onUpdateStart",function(){
		  esri.show(dojo.byId("carga"));
		});
		
  		//Prepara el mapa para el Identify
		dojo.connect(map,"onLoad", prepararMapa);*/

		
        //Agrega la leyenda y otros elementos
        /*dojo.connect(map,"onLayersAddResult",function(results){        	
			var peticionLeyenda = esri.request({
			  "url": capaUrl + "/legend",
			  "content": {
				"f": "json"
			  },
			  "callbackParamName": "callback"
			});
			
			peticionLeyenda.then(peticionLeyendaExitosa, peticionFallida);
			
			
			//Carga en el html el link del excel
			//dojo.html.set(dojo.byId("excel"), contenido);
			
			//Carga en el html el link de los metadatos
			dojo.html.set(dojo.byId("metadata"), metadata);*/
			
			//Personaliza Redes Sociales - No aplica en vista normnal
			//Twitter
			
			/*dojo.attr(dojo.byId("twitter"), "data-url", window.location.href);
			dojo.attr(dojo.byId("twitter"), "data-text", "Indicadores DANE: " );
			
            var ruta = encodeURIComponent(window.location.href);    
                        
			//Facebook
			var fb = "https://www.facebook.com/plugins/like.php?href=" + ruta + "&width=450&height=21&colorscheme=light&layout=button_count&action=like&show_faces=true&send=false&appId=383515278388083";
			dojo.attr(dojo.byId("facebook"), "src", fb);
			
			//Google Plus
            var gp = "<iframe id='googleplus' frameborder='0' hspace='0' marginheight='0' marginwidth='0' scrolling='no' style='position: static; top: 0px; width: 90px; margin: 0px; border-style: none; left: 0px; visibility: visible; height: 20px;' tabindex='0' vspace='0' width='100%' id='I0_1380050201931' src='https://apis.google.com/u/0/_/+1/fastbutton?bsv=o&amp;usegapi=1&amp;count=true&amp;size=medium&amp;hl=en-US&amp;origin=http%3A%2F%2Fwww.dane.gov.co&amp;url=" + ruta + ";' name='I0_1380050201931' data-gapiattached='true' title='+1'></iframe>";
            dojo.byId("googleplus").innerHTML = gp;
            
            document.getElementById("description").setAttribute("content", "Indicadores DANE: " + titulo);*/
			
			//agrega check boxes
                        /*
			dojo.forEach(infoCapas,function(layer){         
			var nombreCapa = layer.title;
			var checkBox = new dijit.form.CheckBox({
				name: "checkBox" + layer.layer.id,
				value: layer.layer.id,
				checked: layer.layer.visible,
				onChange: function(evt) {
				  var clayer = map.getLayer(this.value);
				  clayer.setVisibility(!clayer.visible);
				  this.checked = clayer.visible;
				}
			});
			  
			  //agrega el checkbox con su etiqueta
			  dojo.place(checkBox.domNode,dojo.byId("capas"),"after");
			  var checkLabel = dojo.create('label',{'for':checkBox.name, innerHTML:nombreCapa, style:{fontSize: "12px"} },checkBox.domNode,"last");
				dojo.place("<br />",checkLabel,"after");
			  });
			  
        });*/
		
	}

	function peticionExitosa(respuesta, io) {
		var descripcion, titulo, capas = [];
		
		//obtiene el Titulo y el Nombre del Servicio
		if ( respuesta.hasOwnProperty("documentInfo") ) {
			descripcion = respuesta.documentInfo.Comments;
			titulo = respuesta.documentInfo.Title;
			dojo.byId("titulo").innerHTML = titulo;
			document.title = titulo;			
			dojo.byId("descripcion").innerHTML = descripcion;	
		}
		
		//Obtiene todos los sublayers con el objeto JSON
		if ( respuesta.hasOwnProperty("layers") ) {
			 capas = respuesta.layers;
		}
		//Crea el mapa
		iniciarMapa(titulo, capas);
		
    }

    function peticionLeyendaExitosa(respuesta, io) {
		//Obtiene todos los sublayers con el objeto JSON
		
		if ( respuesta.hasOwnProperty("layers") ) {

			var leyendaHtml = '<div style="display: block; " class="esriLegendService">';
			leyendaHtml += '<table width="95%">';
			leyendaHtml += '<tbody>';
			leyendaHtml += '<tr>';
			leyendaHtml += '<td align="">';
			leyendaHtml += '<span class="esriLegendServiceLabel">' + tituloLeyenda + '</span>';
			leyendaHtml += '</td>';
			leyendaHtml += '</tr>';
			leyendaHtml += '</tbody>';
			leyendaHtml += '</table>';

			var layers = respuesta.layers;

			var j = 0;
			for (var i = 0; i < layers.length; i++) {
				if( buscaEnArray(leyendaIds, layers[i].layerId) ) {
					
					leyendaHtml += '<div style="display: block; " class="">';
					leyendaHtml += '<table width="95%" class="esriLegendLayerLabel">';
					leyendaHtml += '<tbody>';
					leyendaHtml += '<tr>';
					leyendaHtml += '<td align="">' + layers[i].layerName + '</td>';
					leyendaHtml += '</tr>';
					leyendaHtml += '</tbody>';
					leyendaHtml += '</table>';
					
					leyendaHtml += '<table cellpadding="0" cellspacing="0" width="95%" class="esriLegendLayer">';
					leyendaHtml += '<tbody>';
					
					if( imagen == "" ){
					
						var leyendas = layers[i].legend;
						for(var j = 0; j < leyendas.length; j++) {
							leyendaHtml += '<tr>';
							leyendaHtml += '<td width="35">';
							leyendaHtml += '<img src="data:' + leyendas[j].contentType + ';base64,' + leyendas[j].imageData + '" border="0" style="opacity:1">';
							leyendaHtml += '</td>';
							leyendaHtml += '<td>';
							leyendaHtml += '<table width="95%" dir="ltr">';
							leyendaHtml += '<tbody>';
							leyendaHtml += '<tr>';
							leyendaHtml += '<td align="">' + leyendas[j].label + '</td>';
							leyendaHtml += '</tr>';
							leyendaHtml += '</tbody>';
							leyendaHtml += '</table>';
							leyendaHtml += '</td>';
							leyendaHtml += '</tr>';
						}
					
					} else {

						leyendaHtml += '<tr>';
						leyendaHtml += '<td>';
						leyendaHtml += '<img src="' + imagen + '">';
						leyendaHtml += '</td>';
						leyendaHtml += '</tr>';
					
					}
			
					leyendaHtml += '</tbody>';
					leyendaHtml += '</table>';
					leyendaHtml += '</div>';
					
				}

			}
				
			leyendaHtml += '</div>';
			
			dojo.byId("leyenda").innerHTML = leyendaHtml;
		}
		
    }

    function peticionFallida(error, io) {
      alert(dojo.toJson(error, true));
    }

    //Reposiciona el mapa
	function vistaInicial() {
		/*Fecha actualizado: 14/10/2015
		Cambio realizado: Deshabilitar ya que se invoca en el método iniciarMapa()*/

		var limites = new esri.geometry.Extent({"xmin":-9495735,"ymin":-83164,"xmax":-7186725,"ymax":1406441,"spatialReference":{"wkid":102100}});
		mapMain.setExtent(limites);
	}

	function prepararMapa(map) {
	
		dojo.connect(map, "onClick", ejecutarIdentifyTarea);
		
		identifyTask = new esri.tasks.IdentifyTask(capaUrl);
		
		identifyParametros = new esri.tasks.IdentifyParameters();
        identifyParametros.tolerance = 1;
        identifyParametros.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_TOP;
		identifyParametros.layerIds = identifyIds;
        identifyParametros.width  = map.width;
        identifyParametros.height = map.height;
	}

	function ejecutarIdentifyTarea(evt) {

        identifyParametros.geometry = evt.mapPoint;
        identifyParametros.mapExtent = map.extent;
       
        var diferido = identifyTask.execute(identifyParametros);

        diferido.addCallback(function(respuesta) {     
          // Callback para consultar todos los features    
          return dojo.map(respuesta, function(resultado) {
            var feature = resultado.feature;
			var cadenaInfo = "<b>" + resultado.layerName + "</b><br><br>";
			// Guarda el array de todos los features identificados.
			for(var atributo in feature.attributes) {
				if(atributo != "OBJECTID" 
					&& atributo != "OBJECTID_1" 
					&& atributo != "Shape" 
					&& atributo != "Shape_Length" 
					&& atributo != "Shape_Area" 
					&& atributo != "Shape_Leng" 
					&& feature.attributes[atributo].toLowerCase() != "null") {
					cadenaInfo += "<b>" + atributo + "</b>: " + feature.attributes[atributo] + "<br>";
				}
			}
			
			var template = new esri.InfoTemplate("", cadenaInfo);
			feature.setInfoTemplate(template);
            
            return feature;
          });
        });
        // Muestra el array de todos los features identificados.
        map.infoWindow.setFeatures([ diferido ]);
        map.infoWindow.show(evt.mapPoint);		
	}

	function buscaEnArray(arr, obj) {
		for(var i=0; i<arr.length; i++) {
			if (arr[i] == obj) 
			return true;
		}
	}

	//Acciones Descripción
	var togglerA; //variable extraida
	require(["dojo/fx/Toggler", "dojo/fx", "dojo/dom", "dojo/on", "dojo/domReady!"],
	function(Toggler, coreFx, dom, on){
	  togglerA = new Toggler({
		node: "marco",
		showFunc: coreFx.wipeIn,
		hideFunc: coreFx.wipeOut
	  });
	  on(dom.byId("ocultarDesc"), "click", function(e){
		togglerA.hide();
		dojo.style(dom.byId("mostrarDesc"), {display: ""});
		dojo.style(dom.byId("ocultarDesc"), {display: "none"});
	  });
	  on(dom.byId("mostrarDesc"), "click", function(e){
		togglerA.show();
		dojo.style(dom.byId("mostrarDesc"), {display: "none"});
		dojo.style(dom.byId("ocultarDesc"), {display: ""});
	  });
	});

	//Acciones Leyenda
	var togglerB; //variable extraida
	require(["dojo/fx/Toggler", "dojo/fx", "dojo/dom", "dojo/on", "dojo/domReady!"],
	function(Toggler, coreFx, dom, on){
	  togglerB = new Toggler({
		node: "ventana",
		showFunc: coreFx.wipeIn,
		hideFunc: coreFx.wipeOut
	  });
	  on(dom.byId("ocultarLey"), "click", function(e){
		togglerB.hide();
		dojo.style(dom.byId("mostrarLey"), {display: ""});
		dojo.style(dom.byId("ocultarLey"), {display: "none"});
	  });
	  on(dom.byId("mostrarLey"), "click", function(e){
		togglerB.show();
		dojo.style(dom.byId("mostrarLey"), {display: "none"});
		dojo.style(dom.byId("ocultarLey"), {display: ""});
	  });
	});

	//Funcion para que detecte el ancho de la pantalla y cambie el estilo --modo responsive
	$(window).resize(function() {
		if ($(window).width() < 768){
			togglerA.hide();
			togglerB.hide();
			$("#mostrarLey").show();
			$("#ocultarLey").hide();
			$("#mostrarDesc").show();
			$("#ocultarDesc").hide();
		}
		
		else{
			togglerA.show();
			togglerB.show();
			$("#mostrarLey").hide();
			$("#ocultarLey").show();
			$("#mostrarDesc").hide();
			$("#ocultarDesc").show();
		}
    });

    require(["dojo/dnd/Moveable", "dojo/dom", "dojo/domReady!"],
	function(Moveable, dom){
		var marcoMov = new Moveable(dom.byId("marco-mov"));
		var ventanaMov = new Moveable(dom.byId("ventana-mov"));
	});

	//Medida Estandar 960px; height: 450px
	
	function getURLParam( name )
	{  
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  		
		var regexS = "[\\?&]"+name+"=([^&#]*)";  
		var regex = new RegExp( regexS );  
		var results = regex.exec( window.location.href );  
		if( results == null )    
			return "";  
		else    
			return results[1];
	}

	//Función para pantalla completa
	function lanzarPantallaCompleta(element) {
	  if(element.requestFullScreen) {
		element.requestFullScreen();
	  } else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	  } else if(element.webkitRequestFullScreen) {
		element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	  }
	}

	function efectosPantallaCompleta() {
		/*Cambio realizado: Visibilidad del icono de Maximizar*/
		var element = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;		
		
		if(element)
		{	
			dojo.query("#icono_amp").style("visibility", "hidden");
		} else{
			dojo.query("#icono_amp").style("visibility", "visible");
		}
		
	}

	// Eventos
	document.addEventListener("fullscreenchange", function(e) {
		efectosPantallaCompleta();
	});
	document.addEventListener("mozfullscreenchange", function(e) {
		efectosPantallaCompleta();
	});
	document.addEventListener("webkitfullscreenchange", function(e) {
		efectosPantallaCompleta();
	});
});