$(document).ready(function() {
	// var pList = $('.processList');
	
	var webAbsoluteUrl = _spPageContextInfo.webAbsoluteUrl;
	
	GetTableOfContentRecursive(webAbsoluteUrl,"Core Processes");
	
	
// getAllItems
// (
	// _spPageContextInfo.webAbsoluteUrl, 
	// "Core Processes",
	// "ID,Title,ContentType",
	// "",//filter
	// 1000,//rowlimig
	// "Title",
	// function(data){
		
		// $.each(data.results, function(i) {
		
		// var li = $('<li/>')
			// .addClass('ui-menu-item')
			// .appendTo(pList);
		// var aaa = $('<a/>')
			// .addClass('ui-all')
			// .attr('href', _spPageContextInfo.webAbsoluteUrl + "/Pages/PMT.aspx?ID="+ data.results[i].ID)
			// .text(data.results[i].Title + " (" + data.results[i].ContentType.Name +")")
			// .appendTo(li);
		// });
	// },		 
	// function(error) {
		// alert(error);
	// }
// );

});