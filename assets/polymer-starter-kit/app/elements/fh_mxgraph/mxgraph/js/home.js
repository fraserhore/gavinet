$(document).ready(function() {
	var pList = $('.processList');
getAllItems
(
	_spPageContextInfo.webAbsoluteUrl, 
	"Core Processes",
	"ID,Title,ContentType",
	"",//filter
	1000,//rowlimig
	"Title",
	function(data){
		
		$.each(data.results, function(i) {
		
		var li = $('<li/>')
			.addClass('ui-menu-item')
			.appendTo(pList);
		var aaa = $('<a/>')
			.addClass('ui-all')
			.attr('href', _spPageContextInfo.webAbsoluteUrl + "/Pages/PMT.aspx?pmtID="+ data.results[i].ID)
			.text(data.results[i].Title + " (" + data.results[i].ContentType.Name +")")
			.appendTo(li);
		});
	},		 
	function(error) {
		alert(error);
	}
);

});