$(function(){

       $('#myTable2 tr').each(function(){
       	var check1 = $(this).find('td')[2].innerHTML;
       	var check2 = $(this).find('td')[3].innerHTML;
       	$(this).children().next().next().next().css("background-color", "#7FFFD4");
       	if(check1!=check2){
       		$(this).find('td')[3].css("background-color", "#7FFFD4");
       	}
 	})
 })