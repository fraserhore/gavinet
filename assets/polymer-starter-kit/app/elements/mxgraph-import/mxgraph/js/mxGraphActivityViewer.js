// Program starts here. The document.onLoad executes the
// mxApplication constructor with a given configuration.
// In the config file, the mxEditor.onInit method is
// overridden to invoke this global function as the
// last step in the editor constructor.


// Show mxLog for debugging
//	mxLog.show();

function mxGraphActivityViewer(container, itemId, highlightNodeID, configURL) {

	var sharepointXMLProperty = 'GraphXML',
	root,
	mxGraphMainParent,
	changes,
	i,
	option,
	node,
	buttons,
	select,
	items;
	
    // Checks if browser is supported
    if (! mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    } else {
		
		/*********************************************
         Create the graph inside the given container
		*********************************************/
        var graph = new mxGraph(container);
		
		// Load the configuration (e.g. stylesheet)
        var configReq = mxUtils.load(configURL),
            configRoot = configReq.getDocumentElement(),
            configDecoder = new mxCodec(configRoot.ownerDocument);
        configDecoder.decode(configRoot, graph);

		/*******************************
		 Set options on the graph
		*******************************/
		graph.setEnabled(false);
        graph.foldingEnabled = false;
		graph.setResizeContainer(true);
        /*
        graph.setTooltips(true);
        graph.getTooltipForCell = function(cell) {
          return mxUtils.isNode(cell.value) ? cell.getAttribute('description', '') : '';
        };
        */
        graph.setPanning(true);
        graph.panningHandler.useLeftButtonForPanning = true;
        graph.keepSelectionVisibleOnZoom = true;
		
        // Add a highlight on the cell under the mouse pointer
        new mxCellTracker(graph);

        graph.convertValueToString = function (cell) {
            if (mxUtils.isNode(cell.value)) {
                return cell.getAttribute('label', '');
            }
        };

		// Enables HTML labels as wrapping is only available for those
        graph.isHtmlLabel = function (cell) {
            return true;
        };

		//This places the stencils format to the objects, dont remove
		var stencilReq = mxUtils.load(siteAbsoluteUrl + '/SiteAssets/fh_mxgraph/mxgraph/config/stencils.xml');
		var stencilRoot = stencilReq.getDocumentElement();
		var stencilShape = stencilRoot.firstChild;
		while (stencilShape !== null) {
			if (stencilShape.nodeType == mxConstants.NODETYPE_ELEMENT) {
				mxStencilRegistry.addStencil(stencilShape.getAttribute('name'), new mxStencil(stencilShape));
			}

			stencilShape = stencilShape.nextSibling;
		}
		
        // Crisp rendering in SVG except for connectors, actors, cylinder, ellipses
        mxShape.prototype.crisp = true;
        mxSwimlane.prototype.crisp = true;
        mxActor.prototype.crisp = false;
        mxCylinder.prototype.crisp = false;
        mxEllipse.prototype.crisp = false;
        mxDoubleEllipse.prototype.crisp = false;
        mxConnector.prototype.crisp = false;
		
		/*******************************
         Load Graph
		********************************/
        graph.getModel().beginUpdate();
        try {		
			getItemProperty(webAbsoluteUrl, listName, itemId, 'GraphXML',
			// Success callback
			function(xml) {
				var doc = mxUtils.parseXml(xml);
				var codec = new mxCodec(doc);
				//console.log(doc);
				codec.decode(doc.documentElement, graph.getModel());
				
				graph.refresh();
				
				// Highlight the highlight node if one is passed to the function
				if(highlightNodeID){
					var highlightCell = getCellByItemId(graph, highlightNodeID);
					
					if(highlightCell){
						var highlightCellStyle = highlightCell.getStyle();
						highlightCell.setStyle(highlightCellStyle+';fillColor=white;fontColor=black;');
					}
					graph.refresh();
				}
				
				// Adjust style to indicate that the node has children
				// var nodesWithChildrenFilter = function(cell) {
					// return cell.getAttribute('children_count') > 0;
				// },
						// filteredCells = graph.model.filterDescendants(nodesWithChildrenFilter);
				// if(filteredCells) {
					// for (i = 0; i < filteredCells.length; i++) {
						// var cellStyle = filteredCells[i].getStyle();
						// filteredCells[i].setStyle(cellStyle+';shadow=true');
					// }
					// // Commented out so we only call refresh once at the end
					// //graph.refresh();
				// }
				
			},
			// Error callback
			function(error) {
				console.log(error);
			});
        }
        finally {
            // Updates the display
            graph.getModel().endUpdate();
        }
		
		/*******************************
		 Adjust graph scale and styles
		*******************************/

		// Get the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        var parent = graph.getDefaultParent();
		
        // Scale to fit if container smaller than graph
        var graphBounds = graph.getGraphBounds(),
            graphContainer = graph.container;
        if(graphBounds.width && graphBounds.width > graphContainer.clientWidth) {
            graph.fit();
            graph.view.rendering = true;
            // Commented out so we only call refresh once at the end
            //graph.refresh();
        }

        // Refresh graph to make sure any style changes are shown
        graph.refresh();

		
		// var SingleClick = true;
		var doubleClick = false;
		/**********************************************
         Add listener to go to url on DOUBLE click
		**********************************************/
        graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt) {
			// SingleClick = false;
			doubleClick = true;
            var e = evt.getProperty('event'); // mouse event
            var cell = evt.getProperty('cell'); // cell may be null or undefined
            if (!evt.isConsumed()) {
				 if (cell !== null && cell !== undefined) {
					var href = cell.getAttribute('href');
					var id = cell.getAttribute('spID');
					var Newhref;
					
					/**
					 Updates the properties panel
					**/

					var div = $('#properties');

					// Clears the DIV the non-DOM way
					div.html('');
					
					var value = cell.getValue();
					
					// Writes the title
					var center = document.createElement('center');
					//mxUtils.writeln(center, cell.value.nodeName + ' (Has ' + cell.getChildCount() + ' sub Activities)');
					mxUtils.writeln(center, cell.value.attributes[1].nodeValue + ' (Has ' + cell.getChildCount() + ' sub Activities)');
					div.append(center);
					mxUtils.br(div[0]);

					// Creates the HTML from the attributes of the user object
					var newHTML = "";
					
					var attrs = cell.value.attributes;
					var offPage = cell.style;
					
					if (attrs) {
						for (var i = 0; i < attrs.length; i++) {
							try
							{
								var showField = ShowFieldViewer(attrs[i],offPage);

								if (showField)
								{
									var html = showFields(cell, attrs[i]);
									newHTML = newHTML + html;
								}
							}
							catch(err)
							{}		
						}
					}
					// var btnHTML = "<div class=\"pathTotalDiv txtLeft\">"+ node + ": " + attribute.nodeValue +"</div>";
					
					
					//-----------------------
					var href = cell.getAttribute('href');
					var id = cell.getAttribute('spID');
					var Newhref;
					
					//validate if off page ref
					if(cell.style === "offPageReference")
					{
						if(href !== undefined){
							//href value- > "https://gavinet.sharepoint.com/sites/km/pmt/Lists/Core%20Processes/DispForm.aspx?ID=288"	
							var num  = href.search("ID=");
							
					
							//DEV: do testing
							// Only ID url - "525"
							if(num !== -1)
							{
								var res = href.substring(num + 3);
							
								Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?pmtID=" + res;
							}
							else //complete URL - "https://gavinet.sharepoint.com/sites/devkm/Pages/pmt.aspx?ID=5"
								Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?pmtID=" + href;
						}
					}
					else
					{
						if(id !== undefined)
						{			
							Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?pmtID=" + id;
						}
						else
						{
							if(href !== undefined){
								//href value- > "https://gavinet.sharepoint.com/sites/km/pmt/Lists/Core%20Processes/DispForm.aspx?ID=288"	
								var num  = href.search("ID=");
								
								//PROD working
								// if(num !== -1)
								// {
									// var res = href.substring(num);
								
									// Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?" + res;
								// }
						
								//DEV: do testing
								// Only ID url - "525"
								if(num !== -1)
								{
									var res = href.substring(num + 3);
								
									Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?pmtID=" + res;
								}
								else //complete URL - "https://gavinet.sharepoint.com/sites/devkm/Pages/pmt.aspx?ID=5"
									Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?pmtID=" + href;
							}
						}
					}
					//---------------------
					var btnHTML = "<a class=\"btnEditResources\" title=\"Navigate to process.\" style=\"float:right; margin-Right:10px;\" href=\""+Newhref+"\"><img alt=\"\" style=\"margin-top: -10px;\" src=\""+siteAbsoluteUrl +"/SiteAssets/fh_mxgraph/mxgraph/images/ForwardArrowRight.png\" width=\"25\" height=\"25\"></a>";
					
					div.append(newHTML);
					div.append(btnHTML);
					mxUtils.br(div[0]);
					
					//Show footer 
					$('#footer').css('display','block');
					div.css('display','block');
					
					$(".mdl-layout__drawer").addClass("is-visible");
					
				}
			}
        });
		
		
		/**********************************************
         Add listener to go to url on single click
		**********************************************/
         graph.addListener(mxEvent.CLICK, function(sender, evt) {
			//delay single click to check for double click first
			setTimeout(function(){
				if(doubleClick === false)
				{
					var e = evt.getProperty('event'); // mouse event
					var cell = evt.getProperty('cell'); // cell may be null or undefined
					if (!evt.isConsumed()) {
						if (cell !== null && cell !== undefined) {
							var href = cell.getAttribute('href');
							var id = cell.getAttribute('spID');
							var Newhref;
							
							//validate if off page ref
							if(cell.style === "offPageReference")
							{
								if(href !== undefined)
								{
									//href value- > "https://gavinet.sharepoint.com/sites/km/pmt/Lists/Core%20Processes/DispForm.aspx?ID=288"	
									var num  = href.search("ID=");
									var res = href.substring(num + 3);
								
									Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?pmtID=" + res;
									
								}
							}
							else
							{
								if(id !== undefined)
								{			
									Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?pmtID=" + id;
								}
								else
								{
									if(href !== undefined){
										//href value- > "https://gavinet.sharepoint.com/sites/km/pmt/Lists/Core%20Processes/DispForm.aspx?ID=288"	
										var num  = href.search("ID=");
										
										//PROD working
										// if(num !== -1)
										// {
											// var res = href.substring(num);
										
											// Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?" + res;
										// }
								
										//DEV: do testing
										// Only ID url - "525"
										if(num !== -1)
										{
											var res = href.substring(num + 3);
												
											Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?pmtID=" + res;
										}
										else //complete URL - "https://gavinet.sharepoint.com/sites/devkm/Pages/pmt.aspx?ID=5"
											Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?pmtID=" + href;
									}
								}
							}
							
							if (Newhref !== null && Newhref.length > 0) 
								window.open(Newhref, '_self');
							else 
								mxUtils.alert('No URL defined');
							
							
						}
					}
				}
				doubleClick = false;
				
			},300);            
        });
	
		// g.append('svg:text')
		  // .attr('x', 0)
		  // .attr('y', 30)
		  // .attr('class', 'id')
		  // .append('svg:tspan')
		  // .attr('x', 0)
		  // .attr('dy', 5)
		  // .text(function(d) { return d.name; })
		  // .append('svg:tspan')
		  // .attr('x', 0)
		  // .attr('dy', 20)
		  // .text(function(d) { return d.sname; })
		  // .append('svg:tspan')
		  // .attr('x', 0)
		  // .attr('dy', 20)
		  // .text(function(d) { return d.idcode; })


		
		if (mxClient.IS_IE) {
            new mxDivResizer(container);
        }
    }
}

	

//check if value is supposed to be displayed
function ShowFieldViewer(attribute, offPage) {

	//for off pages to show href
	if (attribute.nodeName === "href" && offPage === "offPageReference")
		return true;
	
	else if (attribute.nodeName === "label" && offPage === "offPageReference")
		return true;
		
	else if (attribute.nodeName === "spContentTypeID" || 
	attribute.nodeName === "label" ||
	attribute.nodeName === "href" ||
	attribute.nodeName === "spRelatedActivityID" ||
	attribute.nodeName === "spID" || 
	attribute.nodeName === "spId" ||
	attribute.nodeName === "spParentIDs" || 
	attribute.nodeName === "spParentId" || 
	attribute.nodeName === "mxCellUpdated" || 
	attribute.nodeName === "spComments" ||
	attribute.nodeName === "spRecommendations" )
		return false;
	else
		return true;
}

/**
 * appends the html for the given property.
 */
function showFields(cell, attribute) {
	var node = null;
	
	if (attribute.nodeName === "label" )
		node = "Name";
	else if (attribute.nodeName === "spstatusID")
		node = "Status";
	else if (attribute.nodeName === "href")
		node = "Url";
	else if (attribute.nodeName === "spPersonDays")
		node = "Person Days";
	else if (attribute.nodeName === "spSupportingTechnology")
		node = "Supporting Technology";
	else if (attribute.nodeName === "spParentGuid")
		node = "Parent";
	else
		node = attribute.nodeName.substring(2)
				
	var HTML = "<div class=\"pathTotalDiv txtLeft\">"+ node + ": " + attribute.nodeValue +"</div>";
	
	return HTML;
}


function getCellByItemId(graph, itemId){
    for (var p in graph.model.cells)
		{
			var cellID = graph.model.cells[p].value.attributes['3'];
			if(cellID)
			{
				if(cellID.value === String(itemId))
				{
					activeCell = graph.model.cells[p];
					return activeCell;
				}
			}
		}
		return null;
}