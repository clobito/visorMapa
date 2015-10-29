/* Proposito: Carga de los parámetros Categoria, Sub-Categoria e Indicador desde la vista servicioMax.html
Fecha creado: 29/10/2015
Observaciones: Generación de error al actualizar los parámetros. Se insertaban los caracteres ï»¿ al procesar el archivo servicioMax.js*/

//Variables globales

var xmlUrl		=	"dataSrc/datosGruposTematicosMapasige.xml";

function cargarOpcionesGrupo(grupo,categoria,indicador)
{
	/*Fecha actualizado: 28/10/2015
	Cambio realizado: Colocar archivo base XML como variable definida.*/
	$.get(xmlUrl, function(xml) 
	{
		var optionsGrupo = [];
		$("#grupo").append("<option value='0'>Seleccione</option>");
		$(xml).find("grupo").each( function(index) 
		{				
			var name = $(this).attr("name");
			var value = $(this).attr("value");
			if(value==grupo){
				$("#grupo").append("<option value='"+value+"' selected>"+name+"</option>");
				buscarSubCategoria(value,categoria,indicador);
			}else{
				$("#grupo").append("<option value='"+value+"'>"+name+"</option>");
			}
		});
	});
}

function buscarSubCategoria(grupo,categoria,indicador)
{
	/*Fecha actualizado: 28/10/2015
	Cambio realizado: Colocar archivo base XML como variable definida.*/		
	$.get(xmlUrl, function(xml) {
		$("#categ").empty();
		$("#categ").append("<option value='0'>Seleccione</option>");
		//Limpiamos el combo de Indicador, cuando se intente cambiar la Categoria
		$('#subcateg').empty();
		$("#subcateg").append("<option value='0'>Seleccione</option>");
		$(xml).find("grupo[value='" + grupo + "']").each( function() 
		{
			$(this).find("categoria").each(function(index) 
			{
				var name = $(this).attr("name");
				var value = $(this).attr("value");
				if(value==categoria){
					$("#categ").append("<option value='"+value+"' selected>"+name+"</option>");
					setSubCat(categoria,indicador);
				}else{
					$("#categ").append("<option value='"+value+"'>"+name+"</option>");
				}
			});				
		});
	});
}
	
	
function setSubCat(categ,indicador)
{
	/*Fecha actualizado: 28/10/2015
	Cambio realizado: Colocar archivo base XML como variable definida.*/

	$.get(xmlUrl, function(xml) {
		$("#subcateg").empty();
		$("#subcateg").append("<option value='0'>Seleccione</option>");
		$(xml).find("categoria[value='" + categ + "']").each( function() 
		{
			console.log(categ);
			$(this).find("servicio").each(function(index) {
				
					var title = $(this).attr("title");
					var id = $(this).attr("id");
					var service = "servicio.html?s=" + id;
					if(id==indicador){
						$("#subcateg").append("<option selected value='"+id+"'>"+title+"</option>");
					}else{
						$("#subcateg").append("<option value='"+id+"'>"+title+"</option>");
					}
			});
				
		});
	});
}

function cargaIFrame(url) 
{
	window.location="servicioMax.html?s=" + url+"&c="+$("#grupo option:selected").val()+"&sc="+$("#categ option:selected").val();
}