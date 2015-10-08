<!DOCTYPE html>
<html> 
  <head> 
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><!--meta para activar el responsive--> 
    <meta http-equiv="X-UA-Compatible" content="IE=7,IE=8,IE=9">
    <title>Prueba Widget</title> 
	<link rel="stylesheet" href="css/style.css" type="text/css"/> <!--main style sheet--> 
	<link rel="stylesheet" href="css/jquery.linkselect.css" type="text/css"><!--combobox style -->
	<link rel="stylesheet" href="css/jquery.linkmultselect.css" type="text/css"><!--multiple combobox style -->
	<link rel="stylesheet" href="css/responsive.css" type="text/css" media="screen and (max-width: 959px)"><!--Nueva hoja estilos- para responsive -->

<!--Slider style -->
	
	<script src="js/jquery-1.7.2.min.js"></script>
	<script src="js/jquery-ui-1.8.20.custom.min.js"></script>
	<script src="js/jquery.linkselect.js"></script>
	<script src="js/jquery.linkmultselect.js"></script>
	
	<script type="text/javascript">
		
			//****************************************************************************//
			//																			  //	
			//		Parámetros de Entrada Editables										  //
			//																			  //	
			//****************************************************************************//
			
			var todosGrupos = true;
			
			var noGrupo = getURLParam("indicador");
			
			if(noGrupo != "" && !isNaN(noGrupo)){
				todosGrupos = false;
			}else{
				noGrupo = 0;
			}
			
			var cat = 0;
			var subcat = 0;
			
			/*
			//Numero de la Categoría del XML, puede estar entre el número 1 hasta el número total de categoría
			var noCategoria = getURLParam("indicador");
			//Indicador para mostrar todas las categorías (true) o solo una (false)
			var todasCategorias = true;
			
			if(noCategoria != "" && !isNaN(noCategoria)){
				todasCategorias = false;
			}else{
				noCategoria = 0;
			}
			var subcat = 0;
			*/
			//Fin de Parámetros Editables
			
			$(function(){
				$("#control").click(function(event) {
					event.preventDefault();
					$("#Combo_Content").toggle(333);
					
					if($("#Title_Cat_min").is(":visible")){
						$("#Title_Cat_min").hide();
					} else {
						$("#Title_Cat_min").show();
					}
					
				});
			
			});

			$(document).ready(function(){				
				$("#grupo").linkselect({style:"indicador"});
				$("#categ").linkselect({style:"indicador"});
				$("#subcateg").linkselect();
					
				$.get("datosGruposTematicos.xml", function(xml) {					
					var optionsCat = [];
					var cat;
					var seleccionado = false;
					
					var totalGrupos = $(xml).find("grupo").length;
					
					if(noGrupo > 0 && noGrupo < totalGrupos){
						noGrupo = noGrupo - 1;
					}else if(noGrupo >= totalGrupos){
						noGrupo = totalGrupos - 1;
					} else{
						noGrupo = getRandomInt(0, $(xml).find("grupo").size()-1);
					}
										
					var optionsGrupo = [];
					
					$(xml).find("grupo").each( function(index) {
						if(todosGrupos || p == noGrupo){
							var name = $(this).attr("name");
							var value = $(this).attr("value");
							if(index == noGrupo){
								$("#grupo").val(value);
								cat = value;
								seleccionado = true;
							} else {
								seleccionado = false;
							}
							optionsGrupo.push({value: value, text: name, selected: seleccionado});
						}
					});
					$("#grupo").linkselect("replaceOptions", optionsGrupo);
					
				});
			
			});
			
			
			function buscarSubCategoria(grupo){
				var optionsCat = [];
				var seleccionado = false;
				
				$.get("datosGruposTematicos.xml", function(xml) {
				
					$(xml).find("grupo[value='" + grupo + "']").each( function() {						
						$(this).find("categoria").each(function(index) {
							var name = $(this).attr("name");
							var value = $(this).attr("value");
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
			
			
			function setSubCat(categ) {
			
				var optionsSubCat = [];
				var seleccionado = false;
				
				$.get("datosGruposTematicos.xml", function(xml) {
					
					$(xml).find("categoria[value='" + categ + "']").each( function() {
						console.log(categ);
						$(this).find("servicio").each(function(index) {
						
							var title = $(this).attr("title");
							var id = $(this).attr("id");
							var service = "servicio.html?s=" + id;
							
							if(index == categ){
								seleccionado = true;
								cargaIFrame(service);
							} else {
								seleccionado = false;
							}
							optionsSubCat.push({value: service, text: title, selected: seleccionado});
						})
						
					});
					optionsSubCat.sort(function(a,b) {
						var textA=a.text.toLowerCase(), textB=b.text.toLowerCase();
						if (textA < textB)
							return -1 
						if (textA > textB)
							return 1
						return 0
					});
					
					$("#subcateg").linkselect("replaceOptions", optionsSubCat);				
					
				});
				
			}
			
			function mostrarToolTip(title, e) {
				if(e == "in"){
					$("#toolTip").text(title);
				} else if(e == "out"){
					$("#toolTip").text("");
				}
			}
			
			function cargaIFrame(url) {
				$("#ampliarservicio").attr("href", url + "&fullscreen=true")
				$("#mapaservicio").attr("src", url);
			}
			
			function getRandomInt(min, max) {
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
	
		</script>

  </head> 
  
  <body>
	<div id="Iframe_Map">		
		<div id="Menu_combo_Container">
			<div id="Combo_Content">
				<table>
					<tr class="heightTR">
					<td class="widthTitulo">
					<div class="toolTipC" id="toolTipC">Categor&iacute;a:</div>
					</td>
					<td class="widthContenido">
				<select id="grupo" name="grupo" title="" class="linkselect" onChange="buscarSubCategoria(grupo.value)"></select>
				</td>
				<td  class="widthTitulo">
				<div class="toolTipI" id="toolTipC">Sub-Categor&iacute;a:</div>
				</td>
				<td class="widthContenido">
				<select id="categ" name="categ" title="" class="linkselect" onChange="setSubCat(categ.value)"></select>
				</td>
				</tr>
				<tr class="heightTR">
				<td class="widthTitulo">
				<div class="toolTipC" id="toolTipI">Indicador:</div>
				</td>
				<td class="widthContenido" colspan="3">
				<select id="subcateg" name="subcateg" title="" class="linkselect" onChange="cargaIFrame(subcateg.value)"></select>
				</td>
				</tr>
				</table>
			</div>
		</div>
		<iframe id="mapaservicio" scrolling='no' style='height: 625px; width: 960px; border: none; margin-top:60px; padding:0; background-color:#EBFFFF;'>
		</iframe>
		<div id="icono_amp">
			<a id="ampliarservicio" href="" target="_blank" title="Ampliar este Indicador"><img src="css/img/ampliar.png"></a>
		</div>
	</div>
	</body> 
</html>