// trae y puebla los select
var  urlData ="datosGruposTematicos_DGEST85.xml";
//Actualización del archivo de pruebas - 06 Oct 2015
//var  urlData = "datosGruposTematicos.xml";
//Actualización del archivo de pruebas - 07 Oct 2015
//Propósito: Carga de los mapas empleando protocolo no seguro http
//var  urlData = "datosGruposTematicosnoseg.xml";
function cargarOpcionesGrupo(grupo,categoria,indicador){
	//Categorías de los indicadores	
	/*$.get(urlData, function(xml) {
		var optionsGrupo = [];
		$("#grupo").append("<option value='0'>Seleccione</option>");
		$(xml).find("grupo").each( function(index) {

			var name = $(this).attr("name");
			var value = $(this).attr("value");
			if(value===grupo){
				$("#grupo").append("<option value='"+value+"' selected>"+name+"</option>");
				buscarSubCategoria(value,categoria,indicador);
			}else{
				$("#grupo").append("<option value='"+value+"'>"+name+"</option>");
			}
		});
	});*/
	$('.optionsCont_div').attr("style","height:600px");
	//Procesamiento del archivo XML => datosGruposTematicos_DGEST85.xml
	$.post(urlData, function(xml) {
			var optionsGrupo = [];
			//$("#grupo").append("<option value='0'>Seleccione</option>");
			$("#grupo").html("<option value='0'>Seleccione</option>");			
			//Procesamiento de las etiquetas XML: grupo
			$(xml).find("grupo").each( function(index) {

				var name = $(this).attr("name");
				var value = $(this).attr("value");				
				//Creación de la lista Categoria
				/*if(value===grupo){					
					$("#grupo").append("<option value='"+value+"' selected>"+name+"</option>");
					buscarSubCategoria(value,categoria,indicador);
				}else{
					alert("Etiqueta:"+" "+name+","+"valor:"+value+","+"grupo:"+grupo);
					$("#grupo").append("<option value='"+value+"'>"+name+"</option>");
				}*/
				$("#grupo").append("<option value='"+value+"'>"+name+"</option>");
			});
		});
}

function buscarSubCategoria(grupo,categoria,indicador){
	//Fecha actualizado: 07/10/2015
	//Propósito: Limpiar las cajas, cuando se seleccione en la primera "Seleccione". Aplica cuando se actualiza la categoria principal, se limpia el combo Indicadores.
	//Carga de las subcategorias de acuerdo a la categoria seleccionada
	/*$.get(urlData, function(xml) {
		$("#categ").empty();
		$("#categ").append("<option value='0'>Seleccione</option>");
			$(xml).find("grupo[value='" + grupo + "']").each( function() {
			$(this).find("categoria").each(function(index) {
				var name = $(this).attr("name");
				var value = $(this).attr("value");
				if(value===categoria){
					$("#categ").append("<option value='"+value+"' selected>"+name+"</option>");
					setSubCat(categoria,indicador);
				}else{
					$("#categ").append("<option value='"+value+"'>"+name+"</option>");
				}
			});
		});
	});*/
	$.post(urlData, function(xml) {
		//Ingreso al combo Subcategoria		
		//$("#categ").empty();
		//$("#categ").append("<option value='0'>Seleccione</option>");
		//Limpiar combo categoria - 07/10/2015
		with ($('#categ'))
		{
			empty();	
			html("<option value='0'>Seleccione</option>");	
		}
		with ($("#subcateg"))
		{
			empty();
			html("<option value='0'>Seleccione</option>");
		}	
		//Procesamiento del XML => Carga del valor (value) desde la etiqueta grupo
		$(xml).find("grupo[value='" + grupo + "']").each( function() {
			//XML => Carga de la etiqueta categoria asociada a la etiqueta grupo
			$(this).find("categoria").each(function(index) {
				//Recorrido de la información asociada a la etiqueta categoria
				var name = $(this).attr("name");
				var value = $(this).attr("value");
				/*alert("Name:"+name+",value:"+value);
				if(value===categoria){
					$("#categ").append("<option value='"+value+"' selected>"+name+"</option>");
					setSubCat(categoria,indicador);
				}else{
					$("#categ").append("<option value='"+value+"'>"+name+"</option>");
				}*/
				$("#categ").append("<option value='"+value+"'>"+name+"</option>");
			});
		});
	});

}
function setSubCat(categ,indicador){
	//Establecer Combo indicadores
	/*$.get(urlData, function(xml) {
		$("#subcateg").empty();
		$("#subcateg").append("<option value='0'>Seleccione</option>");
		$(xml).find("categoria[value='" + categ + "']").each( function() {
			
			$(this).find("servicio").each(function(index) {
				var title = $(this).attr("title");
				var id = $(this).attr("id");
				var service = "servicio.html?s=" + id;
				if(id===indicador){
					$("#subcateg").append("<option selected value='"+id+"'>"+title+"</option>");
				}else{
					$("#subcateg").append("<option value='"+id+"'>"+title+"</option>");
				}
			});

		});
	});*/
	$.post(urlData, function(xml) {
		$("#subcateg").empty();		
		$("#subcateg").append("<option value='0'>Seleccione</option>");
		$(xml).find("categoria[value='" + categ + "']").each( function() {
			
			$(this).find("servicio").each(function(index) {
				var title = $(this).attr("title");
				var id = $(this).attr("id");
				var service = "servicio.html?s=" + id;
				if(id===indicador){
					$("#subcateg").append("<option selected value='"+id+"'>"+title+"</option>");
				}else{
					$("#subcateg").append("<option value='"+id+"'>"+title+"</option>");
				}
			});

		});
	});
}

function cargaIFrame(indicador)
{
	//Fecha: 02/10/2015
	//Propósito: Cargar el frame.
	//Parámetros: 1.indicador => String. Generación de la ruta para obtener el mapa del servidor
	//Fecha actualizado: 05/10/2015
	//Cambio realizado: Cargar el enlace de acuerdo al indicador en la parte principal
	//Fecha actualizado: 07/10/2015
	//Cambio realizado: Obtener protocolo correspondiente al acceso a los mapas
	//Carga del elemento del metadata
	var urlArray = Array;
	var encontro = -1;
	$.post(urlData, function(xml) {
		$(xml).find("servicio").each(function()
		{			
			var metaData 	= $(this).attr('layer');
			var indicadorXml= $(this).attr('id');
			//alert("Indicador:"+indicador+",xml:"+indicadorXml);
			if (indicador == indicadorXml)			
			{		
				encontro = 1;	
				//alert("url =>"+metaData);	
				//Url Material origen
				url 		=	metaData;
				//Personalizar protocolo	
				//Creación del protocolo desde el XML
				urlArray	= 	url.split("//");
				//protocolo 	= 	urlArray[0];
				protocolo	=	"http:";
				url 		=	protocolo+"//"+urlArray[1];
				//Ubicación del objeto en la capa
				/*width	= 	"800px";				
				height 	=	"450px";
				htmlpdf = 	'<meta http-equiv="X-Frame-Options" content="sameorigin">'; 				
				//Habilitar contenido Xframe				
				//htmlpdf += '<object data="'+url+'" type="application/pdf" width="'+width+'" height="'+height+'"></object>';
				htmlpdf += '<object data="'+url+'" width="'+width+'" height="'+height+'"></object>';*/
				htmlpdf = url;
				//alert("Contenido a renderizar =>"+htmlpdf);
				//Colocar cargando en el área del mapa, mientras carga el mapa
				$('#mapPpal').html('<img width="300px" heigth="300px" src="css2/img/loading.gif">');
				//Invocar el api de Mapa				
				loadMap(htmlpdf);
			}
			if (encontro == -1)
			{
				$("#mapPpal").html('');
			}
			
		});
	});
}	

function loadMapTest(url)
{
	/*Propósito: Cargar el mapa, de acuerdo a la url obtenida
	Parámetros: 1.url => String. Cadena que corresponde a la url de carga del mapa.
	Fecha creación: 06/10/2015
	Fuente: https://developers.arcgis.com/javascript/jssamples/map_simple.html
	*/
	
	var map;
	require(["esri/map", "dojo/domReady!"], function(Map) 
	{
		map = new Map("mapPpal", {
			basemap: "satellite",
			center: [-74.094606,-4.647296],
			sliderStyle: "small",
			zoom: 11
		});		
	});
}

function loadMapTest2(url)
{
	/*Propósito: Cargar el mapa, de acuerdo a la url obtenida
	Parámetros: 1.url => String. Cadena que corresponde a la url de carga del mapa.
	Fecha creación: 06/10/2015
	Fuente: https://developers.arcgis.com/javascript/jssamples/ags_createwebmapid.html
	*/		
	//Uso de WebMaps - Pruebas
	//Algunos Ids: 4778fee6371d4e83a22786029f30c7e1, d5e02a0c1f2b4ec399823fdd3c2fdebd, d73cf988e0e04e19af01c91b9c7d62fe
	url = "http://geoportal.dane.gov.co/arcgis/rest/services/INDICADORES_SIPSA/Cache_SIPSATAbastBogotaxMpio_2013/MapServer";
	var webMapId = "";
	require([
		"dojo/parser",
	    "dojo/ready",
	    "dijit/layout/BorderContainer",
	    "dijit/layout/ContentPane",
	    "dojo/dom",
	    "esri/map", 
	    "esri/urlUtils",
	    "esri/arcgis/utils",
	    "esri/dijit/Legend",
	    "esri/dijit/Scalebar",
	    "dojo/domReady!"], function(
	   	parser,
	    ready,
	    BorderContainer,
	    ContentPane,
	    dom,
	    Map,
	    urlUtils,
	    arcgisUtils,
	    Legend,
	    Scalebar
	   	)
	   	{
	   		/*map = new Map("mapPpal", {
				basemap: "satellite",
				center: [-74.094606,-4.647296],
				sliderStyle: "small",
				zoom: 11
			});*/	
			/*ready(function()
			{
				//url += '?f=jsapi'; 
				//parser.parse();				
				//arcgisUtils.arcgisUrl = url;
				//alert("Url para renderizar =>"+url);				
				arcgisUtils.createMap(webMapId,"mapPpal").then(function(response)
				{					
					alert("Url para renderizar... =>"+url);
					//return false;
					//Visualizar leyendas
					dom.byId("title").innerHTML 	=	response.itemInfo.item.title;
			        dom.byId("subtitle").innerHTML 	=	response.itemInfo.item.snippet;			        
					
			        var map = response.map;

			        //Scale bar
			        var scalebar = new Scalebar({
			        	map: map,
	        			scalebarUnit: "english"
			        });

			        //Legend
			        var legendLayers = arcgisUtils.getLegendLayers(response); 
			        var legendDijit = new Legend({
			        	map: map,
	        			layerInfos: legendLayers	
			        },"legend");			        
			        legendDijit.startup();
				});
			});*/
			//Método para crear mapa conocido el id del mismo. Devuelve el mapa en formato JSON
			arcgisUtils.arcgisUrl = url;
			arcgisUtils.createMap(webMapId,"mapPpal").then(function(response)
			{
				//url += '?f=jsapi'; 
				alert("Url para renderizar... =>"+url);
				
				//Titulos				
		        $("#title").html(response.itemInfo.item.title);
		        $("#subtitle").html(response.itemInfo.item.snippet);
				
				//Implementar escalas
		        var map = response.map;

		        //Scale bar
		        var scalebar = new Scalebar({
		        	map: map,
        			scalebarUnit: "english"
		        });
		        //Visualizar leyendas
		        //Legend
		        var legendLayers = arcgisUtils.getLegendLayers(response); 
		        var legendDijit = new Legend({
		        	map: map,
        			layerInfos: legendLayers	
		        },"legend");			        
		        legendDijit.startup();
			});
			
		
		});	 
}

function loadMapTest3(url)
{
	/*Propósito: Cargar el mapa, de acuerdo a la url obtenida
	Parámetros: 1.url => String. Cadena que corresponde a la url de carga del mapa.
	Fecha creación: 07/10/2015
	Fuente: https://developers.arcgis.com/javascript/jsapi/esri.basemaps-amd.html*/
	
	url = "http://geoportal.dane.gov.co/arcgis/rest/services/INDICADORES_SIPSA/Cache_SIPSATAbastBogotaxMpio_2013/MapServer";
	//url = "http://services.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer";
	alert("Carga mapa, url =>"+url);
	require([
    "esri/basemaps",
    "esri/map",
    "dojo/domReady!"
  	], function (esriBasemaps, Map)
  	{
	    esriBasemaps.delorme =  
	    {
	    	baseMapLayers: [
		    {
		    	url: url
		    }],
		    thumbnailUrl: "http://servername.fqdn.suffix/images/thumbnail_2014-11-25_61051.png",		
		    title: "Delorme"
		};
	    	

	    var map = new Map("mapPpal",
	    {
	    	basemap: "delorme",
	    	center: [-74.095938,-4.647016],
	    	zoom: 13,
	    	sliderStyle: "small"
	    });
    });
    alert("finalizando");
}

function loadMap(url)
{
	/*Propósito: Cargar el mapa, de acuerdo a la url obtenida
	Parámetros: 1.url => String. Cadena que corresponde a la url de carga del mapa.
	Fecha creación: 07/10/2015 
	Fuente: https://developers.arcgis.com/javascript/jssamples/map_dynamic.html*/
	
	//alert("Carga mapa, url =>"+url);	 	
	var map;
	//Dimensión del mapa principal y limpieza del icono de "cargando"
	with ($('#mapPpal'))
	{
		attr('style','width:900px; height:600px;');
		html('');
	}
      require([
        "esri/map",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/ImageParameters"
      ], function (
        Map, ArcGISDynamicMapServiceLayer, ImageParameters) {

        map = new Map("mapPpal", {
          sliderOrientation : "horizontal"
        });

        var imageParameters = new ImageParameters();
        //set the image type to PNG24, note default is PNG8.
        imageParameters.format = "jpeg"; 
        imageParameters.maxImageHeigth = "600px";

        //Takes a URL to a non cached map service.
        var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer(url, {
          "opacity" : 0.5,
          "imageParameters" : imageParameters
        });

        map.addLayer(dynamicMapServiceLayer);
      });           
      //alert("finalizando");

}