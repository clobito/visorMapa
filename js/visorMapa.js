//****************************************************************************//
//																			  //	
//		Parámetros de Entrada Editables										  //
//																			  //	
//****************************************************************************//
//Fecha actualizado: 13/10/2015
//Cambio realizado: Actualizar carga de archivo source XML que apunta a la nube.

function mostrarToolTip(title, e) 
{
	if(e == "in"){
		$("#toolTip").text(title);
	} else if(e == "out"){
		$("#toolTip").text("");
	}
}

function cargaIFrame(url) 
{		
	/*alert("Cargando servicio => "+url);
	return false;*/
	$("#ampliarservicio").attr("href", url.replace("servicio.html","servicioMax.html") + "&fullscreen=true&c="+$("#grupo").val()+"&sc="+$("#categ").val());	
	$("#mapaservicio").attr("src", url);	
}

function getRandomInt(min, max) 
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

function menuclic()
{				
	var inancho = $("a.indicador-link").width();
	console.log(inancho);
	$(".indicador-container").css('width',inancho);
	var asd = $(".indicador-container").width();
	console.log(asd);
	var liancho = $("a.linkselect-link").width();
	console.log(liancho);
	$(".linkselect-container").css('width',liancho);
	var asd = $(".linkselect-container").width();
	console.log(asd);
}

function buscarSubCategoria(grupo)
{
	/*Fecha actualizado: 30/10/2015
	Cambio realizado: Dar atención al requerimiento "Cargar por defecto el siguiente mapa: 
•	Categoria  Contexto General (ContextoCG2005)
•	SubCategoria  Indicadores Perfil Censo General 2005 (Perfil)
•	Indicador  Perfil Censo General 2005, según departamento y municipio (Perfil_1)"
*/			
	var optionsCat = [];
	var seleccionado = false;	
	$.get(xmlUrl, function(xml) {
	
		$(xml).find("grupo[value='" + grupo + "']").each( function() {						
			$(this).find("categoria").each(function(index) {
				var name = $(this).attr("name");
				var value = $(this).attr("value");
				if (name == 'Indicadores Perfil Censo General 2005')
				{
					seleccionado = true;
				}
				optionsCat.push({value: value, text: name, selected: seleccionado});
			})
			
		});
		
		//Organiza el arreglo de Indicadores alfabéticamente
		optionsCat.sort(function(a,b) {
			var textA=a.text.toLowerCase(), textB=b.text.toLowerCase();
			if (textA < textB)
				return -1 
			if (textA > textB)
				return 1
			return 0
		});
		
		$("#categ").linkselect("replaceOptions", optionsCat);
						
	});			
}

function setSubCat(categ) 
{			
	/*Fecha actualizado: 30/10/2015
	Cambio realizado: Dar atención al requerimiento "Cargar por defecto el siguiente mapa: 
•	Categoria  Contexto General (ContextoCG2005)
•	SubCategoria  Indicadores Perfil Censo General 2005 (Perfil)
•	Indicador  Perfil Censo General 2005, según departamento y municipio (Perfil_1)
" => Redireccionar indicador Perfil Censo General 2005, según departamento y municipio*/
	/*var inancho = $("a.indicador-link").width();
	console.log(inancho);
	$(".indicador-container").css('width',inancho);
	var asd = $(".indicador-container").width();
	console.log(asd);*/		
	
	var optionsSubCat = [];
	var seleccionado = false;	
	$.get(xmlUrl, function(xml) 
	{
		
		$(xml).find("categoria[value='" + categ + "']").each( function() 
		{
			console.log(categ);
			$(this).find("servicio").each(function(index) {
			
				var title 	= 	$(this).attr("title");
				var id 		= 	$(this).attr("id");
				var service = 	"servicio.html?s=" + id;
				
				//if(index == categ){
				if(title == 'Perfil Censo General 2005, según departamento y municipio'){
					seleccionado 	=	true;					
				} else {
					seleccionado 	= 	false;
				}				
				optionsSubCat.push({value: service, text: title, selected: seleccionado});
			})
			
		});
		//Verificación del arreglo

		//Organiza el arreglo de Indicadores alfabéticamente
		optionsSubCat.sort(function(a,b) {
			var textA=a.text.toLowerCase(), textB=b.text.toLowerCase();
			if (textA < textB)
				return -1 
			if (textA > textB)
				return 1
			return 0
		});
		
		$("#subcateg").linkselect("replaceOptions", optionsSubCat);
		cargaIFrame(service);				
		
	});
				
}

/*	Fecha actualizado: 15/10/2015
Cambio realizado: Carga del archivo XML del portal Dane.
Fecha actualizado: 19/10/2015
Cambio realizado: Carga del archivo base XML del sitio MapaSige (Dane), versión final.
Fecha actualizado: 23/10/2015
Cambio realizado: Actualización Path cargue archivo base XML
*/
//Declaraciones globales
var todosGrupos = true;

//var xmlUrl=	"datosGruposTematicos.xml";
//XML de la nube - Contingencia
//var xmlUrl	=	"datosGruposTematicosNube.xml";
//XML del portal Dane
var xmlUrl	=	"dataSrc/datosGruposTematicosMapasige.xml";
var noGrupo = getURLParam("indicador");

if(noGrupo != "" && !isNaN(noGrupo)){
	todosGrupos = false;
}else{
	noGrupo = 0;
}

var cat = 0;
var subcat = 0;

$(function()
{				
	$("#control").click(function(event) 
	{
		event.preventDefault();
		$("#Combo_Content").toggle(333);
		
		if($("#Title_Cat_min").is(":visible")){
			$("#Title_Cat_min").hide();
		} else {
			$("#Title_Cat_min").show();
		}
		
	});

});

$(window).resize(function() 
{
	var altodev = $(window).height();							
	$("#icono_amp").css('top',altodev-90);
	$("#Iframe_Map").css('height',altodev);
	var anchdev = $(window).width();							
	$("#icono_amp").css('left',anchdev-90);

	var marginmap = $("#Menu_combo_Container").height();
	console.log(marginmap);			
	$("#mapaservicio").css('margin-top',marginmap-20);
	var newalt= altodev-marginmap+20;
	$("#mapaservicio").css('height',newalt);
	console.log($(window).width());
	if($(window).width() <= 370){
		$(".indicador-link").css('font-size','10px');
		$(".linkselect-link").css('font-size','10px');					
	}
	else{
		$(".indicador-link").css('font-size','12px');
		$(".linkselect-link").css('font-size','12px');	
	}
				
});

$(document).ready(function()
{
	/*Fecha actualizado: 15/10/2015
	Cambio realizado: Ocultar controles Maximizar y descarga Hoja de calculo al inicio de la petición
	Fecha actualizado: 26/10/2015, 30/10/2015
	Cambio realizado: Dar solución al requerimiento "Cargar por defecto el siguiente mapa: 
•	Categoria  Contexto General
•	SubCategoria  Indicadores Perfil Censo General 2005
•	Indicador  Perfil Censo General 2005, según departamento y municipio"
	Fecha actualizado: 28/10/2015
	Cambio realizado: Suprimir icono de maximizado.

	*/

	$('#icono_amp').hide();
	
	var altodev = $(window).height();							
	$("#icono_amp").css('top',altodev-90);
	$("#Iframe_Map").css('height',altodev);

	var anchdev = $(window).width();							
	$("#icono_amp").css('left',anchdev-90);
	console.log($(window).width());

	var marginmap = $("#Menu_combo_Container").height();
	console.log(marginmap);			
	$("#mapaservicio").css('margin-top',marginmap-20);

	console.log($(window).width());

	var newalt= altodev-marginmap+20;
	$("#mapaservicio").css('height',newalt);

	if($(window).width() <= 370){
		$(".indicador-link").css('font-size','10px');
		$(".linkselect-link").css('font-size','10px');
	}
	else{
		$(".indicador-link").css('font-size','12px');
		$(".linkselect-link").css('font-size','12px');	
	}

	/*$("#grupo").linkselect({style:"indicador"});
	$("#categ").linkselect({style:"indicador"});
	$("#subcateg").linkselect();*/

	
	$.get(xmlUrl, function(xml) {					
		var optionsCat = [];
		var cat;
		//Variables que controla elementos seleccionados
		//Selección de la categoria (grupo)
		var seleccionado 	=	false;
		//Selección de subcategoria
		var seleccSubcat 	=	false;
		//Selección del indicador
		var seleccIndica 	=	false;
		var totalGrupos 	=	$(xml).find("grupo").length;
		if(noGrupo > 0 && noGrupo < totalGrupos){
			noGrupo = noGrupo - 1;
		}else if(noGrupo >= totalGrupos){
			noGrupo = totalGrupos - 1;
		} else{
			//noGrupo = getRandomInt(0, $(xml).find("grupo").size()-1);
		}		
								
		//var optionsGrupo = [];
		var optionsGrupo = [];		

		//Categoria
		$(xml).find("grupo").each( function(index) {
			if(todosGrupos || p == noGrupo){
				var name = $(this).attr("name");
				var value = $(this).attr("value");
				if(index == noGrupo){	
					cat = value;						
					seleccionado = true;										
				} else {
					seleccionado = false;
				}				
				optionsGrupo.push({value: value, text: name, selected: seleccionado});
				//optionsGrupo.push({value: value, text: name});				
			}
		});
		//Recorrido de los options SubCategoria
		/*for (var cont=0; cont < optionsCateg.length; ++cont)
		{			
			if (optionsCateg[cont].selected == true)
			{
				alert("Item =>"+optionsCateg[cont].value+","+optionsCateg[cont].text+","+optionsCateg[cont].selected);
				//$('#categ').val(optionsCateg[cont].value);
			}
			else
			{
				alert("No seleccionado =>"+optionsCateg[cont].text);
			}
		}*/
		$("#grupo").linkselect({style:"indicador"});
		$("#grupo").linkselect("replaceOptions",optionsGrupo);
		$("#categ").linkselect({style:"indicador"});				
		//$("#categ").linkselect("replaceOptions", optionsCateg);		
		$("#subcateg").linkselect();
		//$('#subcateg').linkselect("replaceOptions", optionSubcat);		
		/*alert("Armado de combos al aplicar libreria =>"+$('#subcateg').val());
		return false;
		alert("Carga archivo primario");*/
		
		//Ocultar controles al inicio de la petición
		//$('#icono_amp').attr('style','visibility:hidden');
		$('#excel').attr('style','visibility:hidden');
		
		/*
		
		var totalcategorias = $(xml).find("categoria").length;
		
		if(noCategoria > 0 && noCategoria < totalCategorias){
			noCategoria = noCategoria - 1;
		}else if(noCategoria >= totalCategorias){
			noCategoria = totalCategorias - 1;
		} else{
			noCategoria = getRandomInt(0, $(xml).find("categoria").size()-1);
		}
		
		$(xml).find("categoria").eq(noCategoria).each( function() {
			var cat = $(this).attr("value");
			var serv = $(xml).find("categoria[value='" + cat + "']");
			subcat = getRandomInt(0, $(serv).find("servicio").size()-1);
		});
		
		$(xml).find("categoria").each( function(index) {
			if(todasCategorias || p == noCategoria){
				var name = $(this).attr("name");
				var value = $(this).attr("value");
				if(index == noCategoria){
					$("#categ").val(value);
					cat = value;
					seleccionado = true;
				} else {
					seleccionado = false;
				}
				optionsCat.push({value: value, text: name, selected: seleccionado});
			}
		});
		$("#categ").linkselect("replaceOptions", optionsCat);
		*/

	});
});