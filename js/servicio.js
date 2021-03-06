/*
Propósito: Implementación del componente JavaScript en archivo externo para la vista servicio.html
Fecha creado: 14/10/2015 

*/
$(document).ready(function()
{
	/*
	Fecha actualizado: 16/10/2015
	Cambio realizado: Establecer variable para obtener el XML Source como global. Se desactiva del método init()
	Fecha actualizado: 19/10/2015
	Cambio realizado: Establecer fuente XML desde el servidor DANE
	Fecha actualizado: 23/10/2015
	Cambio realizado: Actualización Path cargue archivo base XML
	Fecha actualizado: 23/10/2015
	Cambio realizado: Satisfacer requerimiento "Quitar controles fantasma cuando carga el mapa"
	Fecha actualizado: 28/10/2015
	Cambio realizado: Suprimir icono de maximizado.	
	Fecha actualizado: 29/10/2015
	Cambio realizado: Activar la capa gp_logo para visualizar la imágen según requerimiento "Quitar logo del Dane en la parte inferior de la vista normal del geoportal. En las vistas maximizadas se deben colocar los logos actualizados de DANE y el Todos por un nuevo país."
	*/

	dojo.require("dijit.layout.BorderContainer");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dijit.layout.AccordionContainer");
	dojo.require("esri.map");
	dojo.require("esri.dijit.Legend");
	dojo.require("esri.layers.FeatureLayer");
	dojo.require("esri.layers.agstiled");
	//dojo.require("esri.dijit.Geocoder");
	dojo.require("esri.arcgis.utils");
	dojo.require("dijit.form.CheckBox");
	dojo.require("dojo.html");
	dojo.require("dojox.data.XmlStore");
	//Mantenimiento a la vista servicio.html 
	$('#Menu_combo_Container').hide();	

	$('#icono_fs').attr('style','display:none');

	//Variable global para la leyenda
	var tituloLeyenda;		

	//Fecha actualizado: 14/10/2015
	//Cambio realizado: Variable global para el mapa, para usar la opción "Reestablecer a vista predeterminada"
	//Fecha actualizado: 13/11/2015
	//Cambio realizado: Declaración variable global para tomar la información del punto que se toma del mapa
	var mapMain;

	var identifyTask, identifyParametros, imagen = "", capaUrl = "", contenido = "", metadata = "", fs = false, leyendaCapas = [], infoCapas = [], ocultaCapas = [], leyendaIds = [], identifyIds = [];

	var clickPoint;
	
	//var xmlUrl	=	"datosGruposTematicosNube.xml";
	var xmlUrl		=	"dataSrc/datosGruposTematicosMapasige.xml";
	
	
	function init() {
	  /*Fecha actualizado: 13/10/2015
	  Cambio realizado: Actualización del archivo fuente XML por contingencia
	  Fecha actualizado: 15/10/2015
	  Cambio realizado: Cargue del archivo fuente XML del sitio geoportal.
	  Fecha actualizado: 16/10/2015
	  Cambio realizado: Procesamiento del atributo identify. Cuando es único, se trae en un arrreglo en la posición 0; de lo contrario, se procesan en un arreglo quedando en varias posiciones.
	  Fecha actualizado: 29/10/2015
	  Cambio realizado: Activar la capa gp_logo para visualizar la imágen según requerimiento "Quitar logo del Dane en la parte inferior de la vista normal del geoportal. En las vistas maximizadas se deben colocar los logos actualizados de DANE y el Todos por un nuevo país."
	  Fecha actualizado: 23/11/2015
	  Cambio realizado: Atender el requerimiento "La descarga de datos (Excel, Pdf, etc) solo funciona correctamente con el .xls". Se realiza el análisis de extensiones .xls, .pdf y otra para generar icono y vinculo.
	  Observaciones: Fuente: http://www.w3schools.com/jsref/jsref_split.asp 
	  */
	  	//var xmlUrl	=	"datosGruposTematicos.xml";
	  	//var xmlUrl	=	"datosGruposTematicosNube.xml";
	  	//var xmlUrl		=	"datosGruposTematicosMapasige.xml";
		var servicio 	= 	getURLParam("s");

		with ($('#carga'))
		{
			attr('style','width:100%; height:450px; background-color:#EBFFFF; text-align: center; vertical-align: middle;')
			html('<img src="img/loading.gif" width="400" height="400"/>');			
		}
		//Ocultar las ventanas del mapa, incluyendo Geocoder hasta no haberse cargado
		$('#marco-mov').attr("style","display:none");
		$('#ventana-mov').attr("style","display:none");	
		$('#busqueda').hide();
		//$('#gp_logo').hide();
		
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
			//Averiguar si tiene 1 o más identify asociados.
			//Si hay un solo Identify se toma el mismo a un array			
			if (indicadores.getValue(item, "@identify").indexOf(',') == -1)
			{				
				identifyIds = indicadores.getValue(item, "@identify").split();
			}
			//si hay mas de una capa para mostrar colocar valores separados por comas, por ej: [3,7]
			else
			{
				identifyIds = indicadores.getValue(item, "@identify").split(",");
			}			
			
			//Direccion URL del servicio de capas
			capaUrl = indicadores.getValue(item, "@layer");
			//Configuración del URL	
			//Url del Archivo Excel u otro formato
			//Generar extensión. FUENTE: http://stackoverflow.com/questions/2400312/substring-with-reverse-index
			if(indicadores.getValue(item, "@table") != null && indicadores.getValue(item, "@table") != "")
			{
				var ext 	=	indicadores.getValue(item, "@table").slice(-3);
				//Construcción del vinculo y su imágen asociada según extensión
				switch (ext)
				{
					//Adjuntos en excel
					//Icono que requiere ser actualizado
					case 'xls':
					{
						contenido = "<a href='" + indicadores.getValue(item, "@table") +  "' id='tabla' style='cursor:pointer;'>";
						contenido += "<img src='sige-theme/images/sige/servicios/descargar.png' alt='Descargue el Excel' title='Descargue el Excel'>";
						break;
					}
					//Adjuntos en pdf - Se abren en otra ventana
					//Icono de prueba...
					case 'pdf':
					{
						contenido = "<a href='" + indicadores.getValue(item, "@table") +  "' id='tabla' style='cursor:pointer;' target='_blank'>";
						contenido += "<img src='sige-theme/images/sige/servicios/descargarpdf.png' alt='Descargue el PDF' title='Descargue el PDF'>";
						break;
					}
					//Adjuntos en otro formato
					//Icono de prueba...
					default:
					{
						contenido = "<a href='" + indicadores.getValue(item, "@table") +  "' id='tabla' style='cursor:pointer;' target='_blank'>";
						contenido += "<img src='sige-theme/images/sige/servicios/descargarotro.png' alt='Descargue el informe' title='Descargue el informe'>";
					}
				}
				//contenido += "<img src='sige-theme/images/sige/servicios/descargar.png' alt='Descargue el Excel' title='Descargue el Excel'>";
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
    dojo.ready(init);
    //Mantenimiento a la vista servicio.html    
    with ($('#carga'))
	{
		attr('style','width:100%; height:450px; background-color:#EBFFFF; text-align: center; vertical-align: middle;')
		html('<img src="img/loading.gif" width="400" height="400"/>');
	}
	//Ocultar las ventanas del mapa, incluyendo Geocoder hasta no haberse cargado
	$('#marco-mov').attr("style","display:none");
	$('#ventana-mov').attr("style","display:none");	
	$('#busqueda').hide();
	//$('#gp_logo').hide();

    function configuraIndicador(){
		/*Fecha actualizado: 15/10/2015.
		Cambio realizado: Ocultar botón Maximizar Indicador
		Fecha actualizado: 16/10/2015
		Cambio realizado: Uso de Jquery en la Libreria ArcGIS 3.14
		Fecha actualizado: 29/10/2015
		Cambio realizado: Dar atención al requerimiento "Quitar logo del Dane en la parte inferior de la vista normal del geoportal. En las vistas maximizadas se deben colocar los logos actualizados de DANE y el Todos por un nuevo país. 
		Fecha actualizado: 29/10/2015
		Cambio realizado: Actualizar visibilidad en la capa icono_amp
		*/
		$('#icono_amp').attr('style','visibility:hidden');
		//dojo.query("#icono_amp").style("visibility", "hidden");
		//dojo.query("#gp_logo").style("visibility", "hidden");
		//$('#gp_logo').attr('style','visibility:hidden');
		//Cuando el navegador no es IE, se muestra el botón de full screen
		if(!dojo.isIE && fs){
			//dojo.query("#icono_amp").style("visibility", "visible");
			$('#icono_amp').attr('style','visibility:visible');
		}		
		if(fs){
			//dojo.query("#gp_logo").style("visibility", "visible");
			$('#gp_logo').attr('style','visibility:visible');
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
		Cambio realizado: Desactivación de cargue de redes sociales en vista normal
		Fecha actualizado: 16/10/2015
		Cambio realizado: Inclusión de los módulos query, QueryTask
		Fecha actualizado: 19/10/2015
		Cambio realizado: Inclusión de los módulos symbols/SimpleFillSymbol, esri/Color y symbols/SimpleLineSymbol
		Fecha actualizado: 21/10/2015
		Cambio realizado: Inclusión de los módulos tasks/IdentifyTask y tasks/IdentifyParameters
		Fecha actualizado: 22/10/2015
		Cambio realizado: Inclusión de los módulos layers/ArcGISDynamicMapServiceLayer, dijit/Popup, [dojo/_base/array, dojo/dom-construct (módulos del dojo framework)]
		Fecha actualizado: 22/10/2015
		Cambio realizado: Fix del Geocoder en ArcGIS 3.14
		Fecha actualizado: 26/10/2015
		Cambio realizado: Carga del mapa base, de acuerdo al requerimiento "Cambio Mapa Base en tonos grises"
		Fecha actualizado: 29/10/2015
		Cambio realizado: Dar atención al requerimiento "2.	La Selección de un elemento geográfico en el mapa debe cambiar a color a Cian. Actualmente se visualiza en color rojo."
		Fecha actualizado: 13/11/2015
		Cambio realizado: Dar atención al requerimiento "Cargue de información de las capas"
		*/	
		tituloLeyenda = titulo;
        //var mapMain;
        var geoCoder;
        /*Creación del query para InfoWindow*/
		//Flag para determinar la carga de información del servidor, formato pJson o formato json
		var flag 			=	-1;
		//Objetos
		var queryTask,query;
		var infoTemplate;
		//var identifyTask;
		var popUp;
		var capaUrlQuery 	=	'';
		var title,content 	=	'';
		//Arrays para procesar la carga de campos ejecutando QueryTask.
		var itemsAlias,items=	[];
		//URL base para carga de la capa "Outlined"
		var capaOutlined	=	"http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer";
        require([
	        "esri/map",
	        "esri/layers/ArcGISTiledMapServiceLayer",
	        "esri/layers/ArcGISDynamicMapServiceLayer",
	        "esri/dijit/Geocoder",
	        "esri/graphic",
	        "esri/InfoTemplate",
	        "esri/SpatialReference",
	        "esri/geometry/Extent",
	        "esri/layers/GraphicsLayer",
	        "esri/symbols/SimpleFillSymbol",
	        "esri/symbols/SimpleLineSymbol",
	        "esri/tasks/query",
        	"esri/tasks/QueryTask",
        	"esri/tasks/IdentifyTask",
        	"esri/tasks/IdentifyParameters",
        	"esri/Color",
        	"esri/dijit/Popup",
        	"dojo/_base/array",
        	"dojo/dom-construct",
	        "dojo/domReady!"
        ], function (
        	Map, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, Geocoder, Graphic, InfoTemplate, 
        	SpatialReference, Extent, GraphicsLayer, SimpleFillSymbol, SimpleLineSymbol, 
        	Query, QueryTask, IdentifyTask, IdentifyParameters, Color, Popup, arrayUtils, 
        	domConstruct
        	)
        	{
        		//Crear la ventana flotante de información. Colores: Contorno, relleno
				popUp 	=	new Popup(
				{
					fillSymbol:  new SimpleFillSymbol(
						SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,							
							new Color("#4BFFFF"), 2),
						new Color([255, 255, 0, 0.25]))						
				},domConstruct.create("div"));
        		mapMain =	new Map("map",
        		{
        			basemap: "streets",
        			center: [-74.095938, 4.647016],        			    			
        			zoom:6,
        			sliderPosition: "bottom-right",
        			infoWindow: popUp
        		});

        		//Carga del mapa base
        		var capaBase	=	new ArcGISTiledMapServiceLayer(capaOutlined);
        		//Adición de la capa al mapa
        		mapMain.addLayer(capaBase);
        		//Carga de la capa correspondiente al mapa en la nueva libreria
        		//alert("URL =>"+capaUrl);
        		var capa 		=	new ArcGISTiledMapServiceLayer(capaUrl);
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
				//alert("Capas =>"+infoCapas.length);
				//Implementación del geoCoder
				geoCoder = new Geocoder(
				{
					autoComplete: true,
					arcgisGeocoder:
					{
						placeholder: "Introducir una Ubicación"
					},
					map: mapMain
				},"busqueda");
				$('#busqueda').hide();

				//Inicia el Buscador
				geoCoder.startup();

				//Evento para carga de la capa del mapa
				mapEvents 	= 	mapMain.on("load", setLoadMap);

				//Carga de la capa dinámica - FUENTE: https://developers.arcgis.com/javascript/jssamples/find_popup.html
				mapMain.addLayer(new ArcGISDynamicMapServiceLayer(capaUrl,
				{
					opacity: 0.55
				}));				
				//Método para procesar carga del mapa
				function setLoadMap(event)
				{
					/*Fecha actualizado: 15/10/2015
					Cambio realizado: Ocultar iconos de Maximizar indicador y descarga de excel cuando se obtiene el mapa
					Fecha actualizado: 22/10/2015
					Cambio realizado: Implementar la carga del InfoWindow para ejecutar carga de información de acuerdo al mapa y sus Identify's, al dar click sobre la región del mapa
					Fecha actualizado: 22/10/2015
					Cambio realizado: Cambio de parámetro "mapEvents" => "event"
					Fecha actualizado: 23/10/2015
					Cambio realizado: Ocultar la capa del mapa hasta que no se haya terminado de cargar
					Fecha actualizado: 26/10/2015
					Cambio realizado: Dar atención al requerimiento "Probar si es posible desplegar el Identify cuando el mouse se coloca sobre el elemento geográfico. Actualmente se despliega cuando se hace click con el mouse. Cuando se sale de la región, ocultar el InfoWindow".
					Observaciones: EL despliegue de la información funciona al colocar el mouse sobre la ventana InfoWindow
					*/
					/*esri.hide($('#icono_amp'));
					esri.hide($('#excel'));*/
					$('#icono_amp').attr('style','visibility:visible');					
					prepararMapa();
					iniciarRedesSociales(titulo, capas);
					mapMain.on("click",ejecutarIdentifyTarea);					
					$('#map').show();
					$('#busqueda').show();
					$('#ventana-mov').attr("style","display:block");					
					$('#marco-mov').attr("style","display:block");					
				}

				function prepararMapa() 
				{			
					/*Fecha actualizado: 22/10/2015
					Cambio realizado: Determinar los parametros para procesar los Identify del mapa
					Fecha actualizado: 18/11/2015
					Cambio realizado: Determinar la opción de las capas para su cargue desde el servidor (LAYER_OPTION_TOP) => (LAYER_OPTION_ALL), de acuerdo al requerimiento "Verificar la respuesta del Identify cuando hay varias capas".
					*/
					//alert("Cantidad identify =>"+identifyIds.length+",URL =>"+capaUrl);
					
					identifyTask 						= 	new IdentifyTask(capaUrl);
					
					identifyParametros					=	new IdentifyParameters();
			        identifyParametros.tolerance 		=	1;
			        identifyParametros.returnGeometry	=	true; 			        
			        identifyParametros.layerOption 		=	IdentifyParameters.LAYER_OPTION_ALL;
					identifyParametros.layerIds 		= 	identifyIds;
			        identifyParametros.width  			= 	mapMain.width;
			        identifyParametros.height 			= 	mapMain.height;
				}

				//Evento al finalizar la actualización del mapa 
				mapEvents 	= 	mapMain.on("update-end", setLoadEnd);

				//Método para procesar el evento "update-end"
				function setLoadEnd(event)
				{
					/*Parámetro: Evento aplicado al finalizar la actualización del mapa (22/10/2015)
					Fecha actualizado: 14/10/2015
					Cambio realizado: Cargue del vinculo para descargar información en hoja de calculo
					Fecha actualizado: 16/10/2015
					Cambio realizado: Implementar visualización de información empleando el componente QueryTask()
					Fecha actualizado: 19/10/2015
					Cambio realizado: Cargar los vinculos de redes sociales
					Fecha actualizado: 19/10/2015
					Cambio realizado: Implementar el cargue de la información asociando	los campos del Query en la sección "Fields"
					Fecha actualizado: 20/10/2015
					Cambio realizado: Ajuste del cargue de la información al método queryArray()
					Fecha actualizado: 21/10/2015
					Cambio realizado: Visualización y optimización del cargue de InfoWindow por ejecución del QueryTask.
					Fecha actualizado: 21/10/2015
					Cambio realizado: Implementación de cargue de la ventana InfoWindow para varios Identify's.
					Fecha actualizado: 21/10/2015
					Cambio realizado: No visualizar en el InfoWindow la información del campo OBJECTID
					Fecha actualizado: 22/10/2015
					Cambio realizado: Implementar carga de información empleando las clases IdentifyTask e IdentifyParameters (https://developers.arcgis.com/javascript/jssamples/find_popup.html)
					Fecha actualizado: 26/10/2015
					Cambio realizado: Dar atención al requerimiento "Probar si es posible desplegar el Identify cuando el mouse se coloca sobre el elemento geográfico. Actualmente se despliega cuando se hace click con el mouse. Cuando se sale de la región, ocultar el InfoWindow".
					Fecha actualizado: 18/11/2015
					Cambio realizado: Desactivar el evento "mouse-out" para permitir navegar sobre las capas en el InfoWindow.
					*/

					//esri.hide(dojo.byId("carga"));
					$("#excel").html(contenido);
					/*iniciarRedesSociales(titulo, capas);*/
					mapMain.on("mouse-over",ejecutarIdentifyTarea);
					/*mapMain.on("mouse-out",function()
					{						
						mapMain.graphics.clear();
						mapMain.infoWindow.hide();
					});
					//esri.show(dojo.byId("excel"));
					esri.show($("#excel"));
					esri.show($('#icono_amp'));*/										
					$(".viewRestore").click(function()
					{
						/*Fecha actualizado: 14/10/2015
						Cambio realizado: Habilitar vinculo "Reestablecer a vista predeterminada".
						Fecha actualizado: 22/10/2015
						Cambio realizado: Cuando se restaure la vista, borrar el contenido de la caja de búsqueda.
						*/

						var limites = new esri.geometry.Extent({"xmin":-9495735,"ymin":-83164,"xmax":-7186725,"ymax":1406441,"spatialReference":{"wkid":102100}});
						mapMain.setExtent(limites);
						$('#busqueda_input').val('');
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
				//Evento que se dispara al cargar las capas del mapa
				mapEvents	=	mapMain.on("layer-add-result", setLoadInfoLayer);
				function setLoadInfoLayer(event)
				{
					//alert("Ingresa =>"+event);
					tasks	=	dojo.map(event,function(result){
						return new IdentifyTask(result.layer.url);
					});
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

	function iniciarRedesSociales(titulo, capas) 
	{
		/*Fecha actualizado: 14/10/2015
		Cambio realizado: Implementar cargue de redes sociales.
		Fecha actualizado: 15/10/2015
		Cambio realizado: Actualización de cargue de controles, empleando Jquery
		Observaciones: Se toma fragmento del método iniciarMapa()*/
		tituloLeyenda = titulo;
        
		//Carga en el html el link del excel
		//dojo.html.set(dojo.byId("excelMax"), contenido);
		//$('#excelMax').html(contenido);
		//Carga en el html el link de los metadatos
		//dojo.html.set(dojo.byId("metadata"), metadata);
		$('#metadata').html(metadata);
		
		//Personaliza Redes Sociales
		//Twitter
		/*dojo.attr(dojo.byId("twitter"), "data-url", window.location.href);
		dojo.attr(dojo.byId("twitter"), "data-text", "Indicadores DANE: " );*/

		with ($('#twitter'))
		{
			attr("data-url", window.location.href);
			attr("data-text", "Indicadores DANE: ");
		}
		
        var ruta = encodeURIComponent(window.location.href);    
                    
		//Facebook
		var fb = "https://www.facebook.com/plugins/like.php?href=" + ruta + "&width=450&height=21&colorscheme=light&layout=button_count&action=like&show_faces=true&send=false&appId=383515278388083";			
		//dojo.attr(dojo.byId("facebook"), "src", fb);

		$('#facebook').attr("src",fb);
		
		//Google Plus
        var gp = "<iframe id='googleplus' frameborder='0' hspace='0' marginheight='0' marginwidth='0' scrolling='no' style='position: static; top: 0px; width: 90px; margin: 0px; border-style: none; left: 0px; visibility: visible; height: 20px;' tabindex='0' vspace='0' width='100%' id='I0_1380050201931' src='https://apis.google.com/u/0/_/+1/fastbutton?bsv=o&amp;usegapi=1&amp;count=true&amp;size=medium&amp;hl=en-US&amp;origin=http%3A%2F%2Fwww.dane.gov.co&amp;url=" + ruta + ";' name='I0_1380050201931' data-gapiattached='true' title='+1'></iframe>";
        //dojo.byId("googleplus").innerHTML = gp;
        $('#googleplus').html(gp);
            
        //document.getElementById("description").setAttribute("content", "Indicadores DANE: " + titulo);
        $('#description').attr("content","Indicadores DANE: " + titulo);

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

	/*function prepararMapa(map) {
		//dojo.connect(map, "onClick", ejecutarIdentifyTarea);
		alert("Determinar mapa =>"+capaUrl);
		identifyTask = new esri.tasks.IdentifyTask(capaUrl);
		
		identifyParametros = new esri.tasks.IdentifyParameters();
        identifyParametros.tolerance = 1;
        identifyParametros.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_TOP;
		identifyParametros.layerIds = identifyIds;
        identifyParametros.width  = map.width;
        identifyParametros.height = map.height;
	}*/

	function ejecutarIdentifyTarea(evt) 
	{
		/*Fecha actualizado: 22/10/2015
		Cambio realizado: Cambio "map" => "mapMain".
		Fecha actualizado: 22/10/2015
		Cambio realizado: Adición titulo al InfoWindow		
		Observaciones: Tomado de la Url => https://developers.arcgis.com/javascript/jssamples/find_popup.html. Tomado de la Url => https://geonet.esri.com/thread/57637 => http://jsfiddle.net/URpaW/44/ (Ver 3.1). FUENTE: https://geonet.esri.com/thread/50961 (código original).
		*/
		
		
        identifyParametros.geometry =	evt.mapPoint;
        identifyParametros.mapExtent= 	mapMain.extent;
        identifyParametros.width	=	mapMain.width;
        identifyParametros.height	=	mapMain.height;
       
        var diferido = identifyTask.execute(identifyParametros);        
        diferido.addCallback(function(respuesta) {
        	//alert("Resp =>"+respuesta);
          // Callback para consultar todos los features    
          return dojo.map(respuesta, function(resultado) {
          	//return array.map(respuesta, function(resultado) {
            var feature = resultado.feature;
			var cadenaInfo = "<b>" + resultado.layerName + "</b><br><br>";			
			// Guarda el array de todos los features identificados.			
			for(var atributo in feature.attributes) {
				//alert("Atributo =>"+atributo);
				//alert("Render feature =>"+feature.attributes[atributo]);
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
			//alert("Resultado =>"+cadenaInfo);
			//var template = 	new InfoTemplate("", cadenaInfo);
			var template = new esri.InfoTemplate();			
			template.setTitle(resultado.layerName);
			//alert("Resultado =>"+resultado.layerName);
			template.setContent(cadenaInfo);
			feature.setInfoTemplate(template);            
            return feature;
          });          
        });
		
					
        // Muestra el array de todos los features identificados.
       
        mapMain.infoWindow.setFeatures([ diferido ]);
        mapMain.infoWindow.show(evt.mapPoint);		
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