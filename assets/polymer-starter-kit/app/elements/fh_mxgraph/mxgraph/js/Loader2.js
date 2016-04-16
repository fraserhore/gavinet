
/*******************************************************************
Define variables for the list, the current item and the context
********************************************************************/

function EditProperties()
{
	//source should be, example: https://gavinet.sharepoint.com/sites/km/pmt/Lists/Core%20Processes/DispForm.aspx?ID=64
	var urlEdit = webAbsoluteUrl + '/Lists/' + listName.replace(" ","%20") + '/EditForm.aspx?ID=' + currentItemId + "&source=" + webAbsoluteUrl + '/Lists/' + listName.replace(" ","%20") + '/DispForm.aspx?ID=' + currentItemId;
	window.location = urlEdit;
}

var isViewMode;
function showActivityPath() {

	var configURL = siteAbsoluteUrl + '/SiteAssets/fh_mxgraph/mxgraph/config/stylesheet.xml';
		
	if(FirstClick)
	{
		$('#btnShowPath').html("Hide Activity Path");
		$('#graph-ancestor-path').css('display','block');
		$('.mxGraph-view-wrapper').css('display','none');
		
		//document.getElementById('graph-ancestor-path').fadeIn("slow");
		FirstClick = false;
		
		GetActivityPathGraphs(webAbsoluteUrl, listName, currentItemId, configURL);
		
		//Hide viewer or editor until activity path is enabled
		if(!isViewMode)
		{
			//mxGraph-view hide
			$('#mxGraph-view').css('display','none');
			$('.mxGraph-view-wrapper').css('display','none');
		}
		else 
		{
			//sub-activities-graph hide
			$('#sub-activities-graph').css('display','none');
			$('.mxGraph-view-wrapper').css('display','none');
		}
	}
	else
	{
		var e = $('#graph-ancestor-path');
		if(e.css('display') === 'block')
		{
			//e.fadeOut("slow");
			e.css('display', 'none');
			$('#btnShowPath').html("Show Activity Path");
			
			//show viewer or editor
			if(!isViewMode)
			{
				//mxGraph-view show
				$('#mxGraph-view').css('display','block');
				$('.mxGraph-view-wrapper').css('display','block');
			}
			else
			{
				//sub-activities-graph show
				$('#sub-activities-graph').css('display','block');
				$('.mxGraph-view-wrapper').css('display','block');
			}
		}
		else
		{
			e.css('display', 'block'); 
			$('#btnShowPath').html("Hide Activity Path");
			
			//Hide viewer or editor until activity path is enabled
			if(!isViewMode)
			{
				//mxGraph-view hide
				$('#mxGraph-view').css('display','none');
				$('.mxGraph-view-wrapper').css('display','none');
			}
			else 
			{
				//sub-activities-graph hide
				$('#sub-activities-graph').css('display','none');
				$('.mxGraph-view-wrapper').css('display','none');
			}
		}
		

	}
};
				
				
function downloadURI(uri, name) {
	// var link = document.createElement("a");
	// link.download = name;
	// link.href = uri;
	// link.click();
	// //link[0].click();
	// link.remove();

	var a = $("<a>")
	.attr("href", uri)
	.attr("download", name)
	.appendTo("body");
	
	a[0].click();

	a.remove();
}
function ExportToPNG()
{

	// html2canvas($("#mxGraph-view"), {
            // onrendered: function(canvas) {
                // // theCanvas = canvas;
                // // document.body.appendChild(canvas);

                // // Convert and download as image 
                // //Canvas2Image.saveAsPNG(canvas); 
                // $("#img-out").append(canvas);
                // // Clean up 
                // //document.body.removeChild(canvas);
            // }
        // });
		
		// clickMe
	// var mxGraphFullHTML = $('#mxGraph-view');
	
    // if(mxGraphFullHTML)
	// {
		// saveSvgAsPng(document.getElementById(""), "diagram.png");
	// }
    
  
	//saveSvgAsPng(document.getElementById(""), "diagram.png");
	
	//TODO: create HTML div text on svg for export
	//var graph = new mxGraph(document.getElementById('mxGraph-view_Export')); //-- from UAT test
	//TODO: create HTML div text on svg for export
	var graph = new mxGraph(document.getElementById('mxGraph-view'));
	
	 // var configURL = siteAbsoluteUrl + '/SiteAssets/fh_mxgraph/mxgraph/config/stylesheet.xml';
	 // // Load the configuration (e.g. stylesheet)
        // var configReq = mxUtils.load(configURL),
            // configRoot = configReq.getDocumentElement(),
            // configDecoder = new mxCodec(configRoot.ownerDocument);
        // configDecoder.decode(configRoot, graph);

		// /*******************************
		 // Set options on the graph
		// *******************************/
		// graph.setEnabled(false);
        // graph.foldingEnabled = false;
		// graph.setResizeContainer(true);
        // /*
        // graph.setTooltips(true);
        // graph.getTooltipForCell = function(cell) {
          // return mxUtils.isNode(cell.value) ? cell.getAttribute('description', '') : '';
        // };
        // */
        // graph.setPanning(true);
        // graph.panningHandler.useLeftButtonForPanning = true;
        // graph.keepSelectionVisibleOnZoom = true;
		
        // // Add a highlight on the cell under the mouse pointer
        // new mxCellTracker(graph);

        // graph.convertValueToString = function (cell) {
            // if (mxUtils.isNode(cell.value)) {
                // return cell.getAttribute('label', '');
            // }
        // };

          // graph.isHtmlLabel = function (cell) {
              // return false;
		  // };

		// //This places the stencils format to the objects, dont remove
		// var stencilReq = mxUtils.load(siteAbsoluteUrl + '/SiteAssets/fh_mxgraph/mxgraph/config/stencils.xml');
		// var stencilRoot = stencilReq.getDocumentElement();
		// var stencilShape = stencilRoot.firstChild;
		// while (stencilShape !== null) {
			// if (stencilShape.nodeType == mxConstants.NODETYPE_ELEMENT) {
				// mxStencilRegistry.addStencil(stencilShape.getAttribute('name'), new mxStencil(stencilShape));
			// }

			// stencilShape = stencilShape.nextSibling;
		// }
		
        // // Crisp rendering in SVG except for connectors, actors, cylinder, ellipses
        // mxShape.prototype.crisp = true;
        // mxSwimlane.prototype.crisp = true;
        // mxActor.prototype.crisp = false;
        // mxCylinder.prototype.crisp = false;
        // mxEllipse.prototype.crisp = false;
        // mxDoubleEllipse.prototype.crisp = false;
        // mxConnector.prototype.crisp = false;
		
		// /*******************************
         // Load Graph
		// ********************************/
        // graph.getModel().beginUpdate();
        // try {		
			// getItemProperty(webAbsoluteUrl, listName, currentItemId, 'GraphXML',
			// // Success callback
			// function(xml) {
				// var doc = mxUtils.parseXml(xml);
				// var codec = new mxCodec(doc);
				// //console.log(doc);
				// codec.decode(doc.documentElement, graph.getModel());
				
				// graph.refresh();
				
				// // Highlight the highlight node if one is passed to the function
				
				
				// // Adjust style to indicate that the node has children
				// // var nodesWithChildrenFilter = function(cell) {
					// // return cell.getAttribute('children_count') > 0;
				// // },
						// // filteredCells = graph.model.filterDescendants(nodesWithChildrenFilter);
				// // if(filteredCells) {
					// // for (i = 0; i < filteredCells.length; i++) {
						// // var cellStyle = filteredCells[i].getStyle();
						// // filteredCells[i].setStyle(cellStyle+';shadow=true');
					// // }
					// // // Commented out so we only call refresh once at the end
					// // //graph.refresh();
				// // }
				
			// },
			// // Error callback
			// function(error) {
				// console.log(error);
			// });
        // }
        // finally {
            // // Updates the display
            // graph.getModel().endUpdate();
        // }
		
		// /*******************************
		 // Adjust graph scale and styles
		// *******************************/

		// // Get the default parent for inserting new cells. This
        // // is normally the first child of the root (ie. layer 0).
        // var parent = graph.getDefaultParent();
		
        // // Scale to fit if container smaller than graph
        // var graphBounds = graph.getGraphBounds(),
            // graphContainer = graph.container;
        // if(graphBounds.width && graphBounds.width > graphContainer.clientWidth) {
            // graph.fit();
            // graph.view.rendering = true;
            // // Commented out so we only call refresh once at the end
            // //graph.refresh();
        // }

        // // Refresh graph to make sure any style changes are shown
        // graph.refresh();
		
		
	var height = graph.getGraphBounds().height;	//631
	var width = graph.getGraphBounds().width;	//631	1941
	if(height !== 0 && width !== 0)
		mxUtils.show(graph,null,height,width)
	else
		abc(graph,null,2500,2500)
		
		// a	[object (mxGraph)]
		// b	null
		// c	2500
		// d	2500
		// e	undefined
		// f	undefined
}

// Overwrites the MXClient function mxUtils.show, so that the left and top css is placed at 0,0
function abc(a,b,c,d,e,f){
	c=null!=c?c:0;d=null!=d?d:0;null==b?b=window.open().document:b.open();var g=a.getGraphBounds(),k=Math.ceil(c-g.x),l=Math.ceil(d-g.y);null==e&&(e=Math.ceil(g.width+c)+Math.ceil(Math.ceil(g.x)-g.x));
null==f&&(f=Math.ceil(g.height+d)+Math.ceil(Math.ceil(g.y)-g.y));if(mxClient.IS_IE||11==document.documentMode){d="<html><head>";g=document.getElementsByTagName("base");for(c=0;c<g.length;c++)d+=g[c].outerHTML;d+="<style>";for(c=0;c<document.styleSheets.length;c++)try{d+=document.styleSheets(c).cssText}catch(m){}d=d+'</style></head><body style="margin:0px;">'+('<div style="position:absolute;overflow:hidden;width:'+e+"px;height:"+f+'px;"><div style="position:relative;left:0px;top:0px;">');d+=
	a.container.innerHTML;d+="</div></div></body><html>";b.writeln(d);b.close()}else{b.writeln("<html><head>");g=document.getElementsByTagName("base");for(c=0;c<g.length;c++)b.writeln(mxUtils.getOuterHtml(g[c]));d=document.getElementsByTagName("link");for(c=0;c<d.length;c++)b.writeln(mxUtils.getOuterHtml(d[c]));d=document.getElementsByTagName("style");for(c=0;c<d.length;c++)b.writeln(mxUtils.getOuterHtml(d[c]));b.writeln('</head><body style="margin:0px;"></body></html>');b.close();c=b.createElement("div");
c.position="absolute";c.overflow="hidden";c.style.width=e+"px";c.style.height=f+"px";e=b.createElement("div");e.style.position="absolute";e.style.left=k+"px";e.style.top=l+"px";f=a.container.firstChild;for(d=null;null!=f;)g=f.cloneNode(!0),f==a.view.drawPane.ownerSVGElement?(c.appendChild(g),d=g):e.appendChild(g),f=f.nextSibling;b.body.appendChild(c);null!=e.firstChild&&b.body.appendChild(e);null!=d&&(d.style.minWidth="",d.style.minHeight="",d.firstChild.setAttribute("transform","translate("+k+","+
l+")"))}mxUtils.removeCursors(b.body);return b
}


function outerHTML(el) {
  var outer = document.createElement('graph-ancestor-path');
  outer.appendChild(el.cloneNode(true));
  return outer.innerHTML;
}

function styles(dom) {
  var used = "";
  var sheets = document.styleSheets;
  for (var i = 0; i < sheets.length; i++) {
    var rules = sheets[i].cssRules;
    for (var j = 0; j < rules.length; j++) {
      var rule = rules[j];
      if (typeof(rule.style) != "undefined") {
        var elems = dom.querySelectorAll(rule.selectorText);
        if (elems.length > 0) {
          used += rule.selectorText + " { " + rule.style.cssText + " }\n";
        }
      }
    }
  }
 
  var s = document.createElement('style');
  s.setAttribute('type', 'text/css');
  s.innerHTML = "<![CDATA[\n" + used + "\n]]>";
 
  var defs = document.createElement('defs');
  defs.appendChild(s);
  dom.insertBefore(defs, dom.firstChild);
}


function setAttributes(el) {
  el.setAttribute("version", "1.1");
  el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  el.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
}


function svgImage(xml) {
  var image = new Image();
  image.src = 'data:image/svg+xml;base64,' + window.btoa(xml);
  //window.btoa(unescape(encodeURIComponent(xml)))
}


function ToggleViewEdit()
{
	//Creates the navigation menu with 2 levels
	$.getJSON(_spPageContextInfo.webServerRelativeUrl + "/_api/web/currentuser")
	.done(function(data){ 
			var ln = data.LoginName;
			// getListItemWithId(itemId, listName, siteurl, success, failure)
			getListUserEffectivePermissions(_spPageContextInfo.webServerRelativeUrl, listName, currentItemId, ln)
			.done(function(data){
            var roles = parseBasePermissions(data);
				if($.inArray('editListItems',roles) == -1)
				{
					//Edit button hide
					$('#btnViewEdit').css('display','none');
					
					//Resources buttons hide
					$('.LinkDeleteDoc').css('display','none');
					$('.btnEditResources').css('display','none');
					
					//Resources upload hide
					$('#btnUploadFile').css('display','none');
					$('.divUploader').css('display','none');
					
				}
				
			});
		})
		.fail(function() { console.log("Failed to retrieve user login name")});
		
	if(FirstRunNavigationMenu)
	{
		// get top menu navigation permissions and hide if needed
		GetOwnerPermissions(listName);
		// checkPermissions();
		
		GetNavigationMenu(webAbsoluteUrl, listName, currentItemId);
		//Change title of the Graph
		
		$('#resourcesList').html("");
		GetResourcesForCurrentItem(webAbsoluteUrl,'Process Resources', currentItemId);
		
		//Fill RASCI table properties
		GetRasciTable(webAbsoluteUrl, listName, currentItemId);
		
		//Get creator and modified by display
		GetCreatorAndModified(webAbsoluteUrl, listName, currentItemId);
		
		//Get comments for current item
		GetComments(webAbsoluteUrl, "CommentsList", currentItemId);
		GetCommentsPermissions("CommentsList", currentItemId);
		
		
		
		FirstRunNavigationMenu = false;
	}

	if(isViewMode)
	{
		//Change btn name
		$("#btnViewEdit").html("Edit Graph");
		
		//sub-activities-graph hide
		$('#sub-activities-graph').css('display','none');
		
		//Footer hide
		$('#footer').css('display','none');
		
		//mxGraph-view show
		$('#mxGraph-view').css('display','block');
		
		//clear inner html for reload of graph
		$('#mxGraph-view').html("");
		
		LoadViewer();

		isViewMode = false;
	}
	else
	{ 
		//Change btn name
		$("#btnViewEdit").html("View Graph");
		
		//mxGraph-view hide
		$('#mxGraph-view').css('display','none');
		
		//Footer hide
		$('#footer').css('display','block');
		
		//sub-activities-graph show
		$('#sub-activities-graph').css('display','block');
		
		if(EditModeFirstRun)
		{
			LoadEditor();
			EditModeFirstRun = false;
		}
		
		isViewMode = true;
	}
	// $('.mdl-layout__drawer-button .material-icons').html('keyboard_arrow_left');
}

function GetParentID()
{
	var id;
	return id;
}
function LoadViewer()
{
	var configURL = siteAbsoluteUrl + '/SiteAssets/fh_mxgraph/mxgraph/config/stylesheet.xml';

	mxGraphActivityViewer(document.getElementById('mxGraph-view'), currentItemId, '', configURL);	
}

function loadItemContent() {
	getFullItemFieldById(webAbsoluteUrl, listName, currentItemId, 
		//success
		function(data) {
			console.log(data);
			$('#activityName').html(data.Title);
			
			// contentTypeID = data.ContentTypeId;
			// if(contentTypeID === "0x0100B780648F0DD4474886F4D0C3F275B3380033F9F683C9A6864F9893F6EF0142B096")
				// $('#btnShowPath').hide();
				
			Parent = data.Parent_x0020_Processes;
			ParentIDs = data.ParentIDs;
			
			//TODO: confirm the usage of parentIDS with benjamin
			if(Parent === null && ParentIDs === null)
			//if(Parent === null)
				$('#btnShowPath').hide();
			else
				$('#btnShowPath').show();
		}, 
		//error
		function(error){
			console.log(error);
		}
	);
}
