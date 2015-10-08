var tituloLeyenda;
var map,
	identifyTarea, identifyParametros, imagen = "", 
	capaUrl = "", 
	contenido = "", 
	metadata = "", 
	fs = false, 
	leyendaCapas = [], 
	infoCapas = [], 
	ocultaCapas = [], 
	leyendaIds = [], 
	identifyIds = [];
	
require([
	"esri/map", "esri/layers/FeatureLayer", 
	"esri/layers/ArcGISTiledMapServiceLayer",
	"dijit/layout/BorderContainer", "dijit/layout/ContentPane",
	"esri/arcgis/utils", "esri/dijit/Legend", "esri/dijit/Geocoder", 
	"dojo/on", "dojo/query", "dojo/parser", "dojo/dom-construct", "dojo/domReady!"
], 
function(Map) { 
  var map = new Map("map", {
    center: [-118, 34.5],
    zoom: 8,
    basemap: "topo"
  });
});