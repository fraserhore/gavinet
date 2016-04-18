console.log('_spPageContextInfo');
console.log(_spPageContextInfo);

var editor, html = '';
var closedWithoutCreate = false;
var durationField = "Duration";
	
/*******************************************************************
Create the editor
 ********************************************************************/
function mxGraphActivityEditor(editor) {

	// Show mxLog for debugging
	mxLog.show();
	
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

	getItemProperty(webAbsoluteUrl, listName, currentItemId, sharepointXMLProperty,
		// Success callback
		function (xml) {
		var doc = mxUtils.parseXml(xml);
		var node = doc.documentElement;
		editor.readGraphModel(node);
	},
		// Error callback
		function (error) {});

	// Create a variable for the graph for convenience
	graph = editor.graph;

	//editor.execute("exportImage");
	
	/*******************************************************************
	Set the spID of the Sharepoint Parent Item that contains the graph.
	All vertices (e.g. activities) added to the graph will have their
	spParentIDs set to the spID of the parent cell in the graph,
	so the first cell added to the graph will have the current Sharepoint
	item's ID added to its spParentIDs.
	 ********************************************************************/
	mxGraphMainParent = graph.model.getCell('1');
	mxGraphMainParent.setAttribute('spID', currentItemId);
	mxGraphMainParent.setAttribute('spGuid', itemGuid);

	if(webAbsoluteUrl.search("/devkm") > 0)
		durationField = "Duration1";
	/*******************************************************************
	Listen for changes to the graph in order to create new Sharepoint
	items when certain shapes are added, update these Sharepoint
	items when the corresponding shapes are changed, and delete these
	Sharepoint items when the corresponding shapes are deleted
	 ********************************************************************/
	graph.model.addListener(mxEvent.CHANGE, function (sender, evt) {
		changes = evt.getProperty('edit').changes;
		for (i = 0; i < changes.length; i++) {
			var change = changes[i];

/*******************************************************************
			// Vertex has been added to the graph or its parent has changed
			 ********************************************************************/
			if (change instanceof mxChildChange && change.child.vertex === 1 && change.parent !== null) {
				var child = change.child,
				childTagName = child.value.tagName,
				childSpContentTypeID = child.getAttribute('spContentTypeID'),
				childSpID = child.getAttribute('spID'),
				parent = change.parent,
				parentSpID = parent.getAttribute('spID'),
				parentTagName = parent.value.tagName,
				parentStyle = parent.style,
				parentName = parent.value.attributes[1].nodeValue,
				previous = change.previous,
				properties = {};


				//case this value is undefined, let grab it from the href attribute
				if(parentSpID === undefined)
				{
					// var href = parent.getAttribute('href');
					// if(href === undefined)
					// {
						// mxLog.debug("Internal error, please reload the graph, by not doing so your work might be lost.");
						// return;
					// }
					// var num  = href.search("ID=");
					parentSpID = currentItemId;
				}

				//For Roles - Old Swimlanes
				if (childTagName === "Role" && previous === null) {
					PromptSelectRoleOrCreate(function (pObjectId) {
						child.setAttribute('spID', pObjectId)
					}, editor, graph, child, childSpContentTypeID);
					
					return;
				}
				
				//For Off Page References
				if (childTagName === "OffPageReference" && previous === null) {
					PromptSelectActivities(function (pObjectId) {
						child.setAttribute('spID', pObjectId)
					}, editor, graph, child, childSpContentTypeID);
					
					return;
				}
				
				// Vertex has been added to the graph (i.e. it is new)
				if (previous === null) {
					// Clear attributes except for label and spContentTypeID
					var attributes = child.value.attributes,
					attributesCount = attributes.length,
					i2 = 0;
					for (; i2 < attributesCount; i2 += 1) {
						var attributeName = attributes[i2].nodeName;

						if (attributeName === 'label') {
							child.setAttribute(attributes[i2].nodeName, child.value.nodeName + '_' + Math.floor(Math.random() * (1000 - 0)) + 0);
							graph.refresh();
						} else if (attributeName !== 'spContentTypeID') {
							child.setAttribute(attributes[i2].nodeName, '');
						}
						graph.refresh();
					}

					// If child has an spContentTypeID create an associated Sharepoint list item
					if (childSpContentTypeID) {
						properties = {
							"Title" : child.getAttribute('label'),
							"ContentTypeId" : childSpContentTypeID,
							"__metadata" : {
								"type" : spDataType
							}
						};

						// If an item A is dropped inside of activity B, use activity
						// B's spID as item A's spParentIDs value. Otherwise use the
						// main parent id (i.e. the activity the current page represents)
						if (parentTagName === 'Activity') {
							child.setAttribute('spParentIDs', parentSpID);
							properties['ParentIDs'] = parentSpID.toString();
						} else {
							child.setAttribute('spParentIDs', currentItemId);
							properties['ParentIDs'] = currentItemId.toString();
						}

						// If the item is dropped into a Role Swimlane, add the
						// spID of the Role into the item's Responsible property
						if (parentStyle === "swimlane" || parentTagName === 'Role') {
							
							//Changed the ID to the name of the swimlane/role
							//Fraser asked on 02/09/2015 to change back to ID
							child.setAttribute('spResponsible', parentSpID);
							properties['Responsible'] = parentSpID.toString();
							
							//----------------------------
							// parent.value	[object Element]
							// attributes	[object NamedNodeMap]
							// 1	[object Attr]
							// nodeValue	"Test me"
							// parent.value.attributes[1].nodeValue
							//child.setAttribute('spResponsible', parentName);
							//properties['Responsible'] = parentName;
						}
						//If object dropped is a role (Swimlane)


						/*******************************************************************
						Create a Sharepoint list item
						 ********************************************************************/
						createListItem(webAbsoluteUrl, listName, properties,
							//Success callback
							function (listItem) {
							child.setAttribute('spID', listItem.Id);
							
							//keeps href only for images
							if (childTagName === "Image")
								child.setAttribute('href', webAbsoluteUrl + '/Lists/' + listName.replace(" ", "%20") + '/DispForm.aspx?ID=' + listItem.Id);
						},
							function (error) {
							console.log(error);
							return;
						});
						console.log(properties);

					}
				}
				// Vertex has a new parent
				else {
					var previousTagName = previous.value.tagName;

					// If child has an spContentTypeID update its spParentIDs and/or spResponsible
					// attributes and the associated Sharepoint list item's corresponding properties
					if (childSpContentTypeID) {
						// If an item A is dropped inside of activity B, add activity
						// B's spID to item A's spParentIDs value. If the previous parent
						// was an Activity, remove its spID from A's spParentIDs, otherwise
						// remove the main parent spID
						if (parentTagName === 'Activity') {
							// convert child's spParentIDs into an array
							var childSpParentIDs = child.getAttribute('spParentIDs');
							if (childSpParentIDs) {
								var childSpParentIDsNoSpaces = childSpParentIDs.replace(' ', ''),
								childSpParentIDsArray = childSpParentIDsNoSpaces.split(','),
								previousSpID,
								indexOfSpID = -1;
								if (previousTagName === 'Activity') {
									previousSpID = previous.getAttribute('spID');
									indexOfSpID = childSpParentIDsArray.indexOf(previousSpID);
								} else {
									indexOfSpID = childSpParentIDsArray.indexOf(currentItemId);
								}
								if (indexOfSpID !== -1) {
									childSpParentIDsArray.splice(indexOfSpID, 1);
								}
								childSpParentIDsArray.push(parentSpID);
								childSpParentIDs = childSpParentIDsArray.toString();
							} else {
								childSpParentIDs = parentSpID.toString();
							}
							child.setAttribute('spParentIDs', childSpParentIDs);
							properties['ParentIDs'] = childSpParentIDs;
						}

						// If the new parent is a Role Swimlane, add the spID
						// of the Role into the item's Responsible property and
						// remove the previous parent's spID if it was also a Role
						else if (parentTagName === 'Role') {
							// Convert child's spResponsible ids into an array
							var childSpResponsible = child.getAttribute('spResponsible');
							if (childSpResponsible) {
								var childSpResponsibleNoSpaces = childSpResponsible.replace(' ', ''),
								childSpResponsibleArray = childSpResponsibleNoSpaces.split(','),
								previousSpID,
								indexOfSpID = -1;
								if (previousTagName === 'Role') {
									previousSpID = previous.getAttribute('spID');
									indexOfSpID = childSpResponsibleArray.indexOf(previousSpID);
								}
								if (indexOfSpID !== -1) {
									childSpResponsibleArray.splice(indexOfSpID, 1);
								}
								childSpResponsibleArray.push(parentSpID);
								childSpResponsible = childSpResponsibleArray.toString();
							} else {
								childSpResponsible = parentSpID;
							}
							//child.setAttribute('spResponsible', parentName);
							//properties['Responsible'] = parentName;
							
							child.setAttribute('spResponsible', childSpResponsible);
							properties['Responsible'] = childSpResponsible.toString();
						}
						else //clear Parent cause it was dropped in the layer 
						{
							child.setAttribute('spResponsible', "");
							properties['Responsible'] = "";
						}
						/********************************************************
						Update the Sharepoint list item
						 ********************************************************/
						if (properties && childSpID) {
							properties['__metadata'] = {
								"type" : spDataType
							};
							UpdateListItem(webAbsoluteUrl, listName, childSpID, properties);
						}
					}

					// If the previous parent was an activity and it no longer has
					// children, remove the group style
					if (previous.children.length === 0 && previousTagName === 'Activity') {
						var previousStyle = previous.style,
						previousStyleSlicePosition = previousStyle.indexOf('Group');
						if (previousStyleSlicePosition !== -1) {
							previous.setStyle(previousStyle.slice(0, previousStyleSlicePosition) + previousStyle.slice(previousStyleSlicePosition + 5));
							graph.refresh();
						}
					}
				}

				// If the new parent is an Activity, change its style to the group style if it isn't already.
				if (parentStyle && parentTagName === 'Activity') {
					var parentStyleSlicePosition = parentStyle.indexOf(';'),
					parentBaseStyle = parentStyleSlicePosition !== -1 ? parentStyle.slice(0, parentStyleSlicePosition) : parentStyle,
					parentStyleAttributes = parentStyleSlicePosition !== -1 ? parentStyle.slice(parentStyleSlicePosition) : '';
					if (parentBaseStyle.slice(-5) !== 'Group') {
						parent.setStyle(parentBaseStyle + 'Group' + parentStyleAttributes);
						graph.refresh();
					}
				}
			}

			/*******************************************************************
			// Vertex attribute values have changed
			 ********************************************************************/
			if (change instanceof mxCellAttributeChange || change instanceof mxValueChange) {
				var changedCell = change.cell,
				changedCellSpContentTypeID = changedCell.getAttribute('spContentTypeID'),
				changedAttribute = change instanceof mxValueChange ? 'label' : change.attribute;

				console.log(change);

				// BUG FIX
				// if the element is an image and the href attribute has changed,
				// replace the image url in the style property with the value of the href attribute
				if (changedAttribute === 'href' && changedCell.value.tagName === 'Image') {
					var url = change.value,
					style = changedCell.style,
					styleSlicePosition = style.indexOf('image='),
					styleSlice1 = style.slice(0, styleSlicePosition),
					styleSlice2 = style.slice(styleSlicePosition),
					styleSlicePosition2 = styleSlice2.indexOf(';'),
					styleSlice3 = styleSlicePosition2 !== -1 ? styleSlice2.slice(styleSlicePosition2 + 1) : '';
					changedCell.setStyle(styleSlice1 + 'image=' + url + ';' + styleSlice3);
					graph.refresh();
				}

				// If the changed cell has a spContentTypeID and either the label or an attribute starting with
				// sp has changed, update the corresponding Sharepoint list item
				if (changedCellSpContentTypeID) {
					var changedCellSpID = changedCell.getAttribute('spID'),
					properties = {
						__metadata : {
							"type" : spDataType
							}
					};
					if (changedAttribute === 'label') {
						properties['Title'] = change.value;
					} else if (changedAttribute.substr(0, 2) === 'sp' && changedAttribute !== 'spPersonDays') {
						if (changedAttribute === 'spDescription')
							properties['ProcessItemDescription'] = String(change.value);
						else if (changedAttribute === 'spStatus')
							properties['spStatus'] = String(change.value);
						else if (changedAttribute === 'spDuration')
							properties[durationField] = String(change.value);
						else
							properties[changedAttribute.substring(2)] = String(change.value);
					} else if (changedAttribute === 'spPersonDays') {
						if (IsNumeric(change.value)) {
							properties[changedAttribute.substring(2)] = change.value;
						} else {
							mxLog.debug("spPersonDays value must be numeric. Ex: '123', '12.3', '-10.3'");

							return;
						}

					}
					

					/*************************************************************
					Update the corresponding Sharepoint List item
					 ********************************************************************/
					UpdateListItem(webAbsoluteUrl, listName, changedCellSpID, properties);
				}
			}
		}

		/*******************************************************************
		Update the current Sharepoint item's GraphXML
		********************************************************************/
		var updateProperties = {
			__metadata : {
				"type" : spDataType
			},
			"GraphXML" : editor.writeGraphModel()
		};
		UpdateListItem(webAbsoluteUrl, listName, currentItemId, updateProperties);
	});

	/*******************************************************************
	Graph cells have been removed
	 ********************************************************************/
	graph.addListener(mxEvent.REMOVE_CELLS, function (sender, evt) {
		//alert('This object will be deleted.');
		for (i = 0; i < evt.properties.cells.length; i++) {
			 if (evt.properties.cells[i].value.nodeName !== "Connector") {
				 var itemId = evt.properties.cells[i].getAttribute('spID');
				 
				 
				 // var confirm = confirm('This object will be deleted.');
				 
				 // if(confirm){
					/*******************************************************************
					Delete Sharepoint list items
					********************************************************************/
					if (itemId) {
						deleteListItem(itemId, listName, webAbsoluteUrl,
							function (success) {
								console.log(success);
								mxLog.debug(success);
							},
							function (failure) {
								console.log(failure);
								mxLog.debug(failure);
							});
					}
				 // }
				 
			}
		}
		/*******************************************************************
		Update the current Sharepoint item's GraphXML
		 ********************************************************************/
		 // var properties = {
		 // __metadata: { "type": spDataType },
		 // "GraphXML" : editor.writeGraphModel()
		  // };
		 // UpdateListItem(webAbsoluteUrl, listName, currentItemId, properties);
		 
	});

	/*******************************************************************
	Mouse listeners
	********************************************************************/
	graph.addMouseListener(
	{
		currentState: null,
		previousFill: null,
		mouseDown: function(sender, me)
		{
			
		},
		mouseMove: function(sender, me)
		{
			
		},
		mouseUp: function(sender, me) {
			
			//me.state.cell.style
			//var value = cell.getValue();
			
			
			// if(me.state) //checks if something is selected
			// setTimeout(function(){
				// if(doubleClick === false)
				// {
					// //$(".mdl-layout__drawer").addClass("is-visible");
					// selectionChanged(graph);
				// }
				// doubleClick = false;
				
			// },300);
		},
		dragEnter: function(evt, state)
		{
		},
		dragLeave: function(evt, state)
		{
		}
	});

	graph.getTooltipForCell = function(cell)
	{
		// var label = this.convertValueToString(cell);
		// return 'Tooltip for '+label;
		
		// description 
		// RASCI fields that have been completed.
		// var id = cell.getAttribute('spID')
		// var cellId = cell.getId();
		
		// var description = "";
		// var spAccountable = "";
		// var spSupport = "";
		// var spConsulted = "";
		// var spInformed = "";
		// var spResponsible = "";
		

		
		// var attributes = cell.value.attributes,
		// attributesCount = attributes.length,
		// i2 = 0;
		// for (; i2 < attributesCount; i2 += 1) 
		// {
			// var attributeName = attributes[i2].nodeName;

			// // "spAccountable"
			// // "spSupport"
			// // "spConsulted"
			// // "spInformed"
			// // "spResponsible"
			// // "spPersonDays"
			// // "spPolicies"
			// // "spRecommendations"
			// if (attributeName === 'spDescription') {
				// description = attributes[i2].value;
			// }
			// if (attributeName === 'spAccountable') {
				// spAccountable = attributes[i2].value;
			// } 
			// if (attributeName === 'spSupport') {
				// spSupport = attributes[i2].value;
			// } 
			// if (attributeName === 'spConsulted') {
				// spConsulted = attributes[i2].value;
			// } 
			// if (attributeName === 'spInformed') {
				// spInformed = attributes[i2].value;
			// } 
			// if (attributeName == 'spResponsible') {
				// spResponsible = attributes[i2].value;
			// }
		// }
		
		// if(spResponsible !== null)	
		// {
		
		//max size for tooltip
		
		// return '<center><b>'+cell.getAttribute('label')+'</b></center>' +
				// '<br><span class="">Description: '+description+ '</span>' +
				// '<br>Responsible: '+spResponsible+
				// '<br>Accountable: '+spAccountable+
				// '<br>Support: '+spSupport +
				// '<br>Consulted: '+spConsulted+
				// '<br>Informed: '+spInformed;
		// }
		// else
		// {
			
			// return '<center><b>'+cell.getAttribute('label')+'</b></center>' +
				// '<br>Description: '+description;
		// }
	}

	graph.addListener(mxEvent.UNDO, function (sender, evt) {
		//alert('This object will be deleted.');
		for (i = 0; i < evt.properties.cells.length; i++) {
			var itemId = evt.properties.cells[i].getAttribute('spID');
		}
		/*******************************************************************
		Update the current Sharepoint item's GraphXML
		 ********************************************************************/
		 // var properties = {
		 // __metadata: { "type": spDataType },
		 // "GraphXML" : editor.writeGraphModel()
		  // };
		 // UpdateListItem(webAbsoluteUrl, listName, currentItemId, properties);
		 
	});
	/*******************************************************************
	Set mxGraph options
	 ********************************************************************/
	//Wrap label text - This property is not working with export as image.
	//Enables HTML labels as wrapping is only available for those
	graph.setHtmlLabels(true);
	
	// Refresh is necessary to get the labels to wrap
	//graph.refresh();
	
	
	var stencilReq = mxUtils.load(siteAbsoluteUrl + '/SiteAssets/fh_mxgraph/mxgraph/config/stencils.xml');
	var stencilRoot = stencilReq.getDocumentElement();
	var stencilShape = stencilRoot.firstChild;
	while (stencilShape !== null) {
		if (stencilShape.nodeType == mxConstants.NODETYPE_ELEMENT) {
			mxStencilRegistry.addStencil(stencilShape.getAttribute('name'), new mxStencil(stencilShape));
		}

		stencilShape = stencilShape.nextSibling;
	}
	
	// Clone the source if new connection has no target
	graph.connectionHandler.setCreateTarget(true);
	
	 // Changes the zoom on mouseWheel events
	// mxEvent.addMouseWheelListener(function (evt, up)
	// {
		// if (!mxEvent.isConsumed(evt))
		// {
			// if (up)
			// {
				// editor.execute('zoomIn');
			// }
			// else
			// {
				// editor.execute('zoomOut');
			// }
			
			// mxEvent.consume(evt);
		// }
	// });
			
	// Crisp rendering in SVG except for connectors, actors, cylinder, ellipses
	mxShape.prototype.crisp = true;
	mxActor.prototype.crisp = false;
	mxCylinder.prototype.crisp = false;
	mxEllipse.prototype.crisp = false;
	mxDoubleEllipse.prototype.crisp = false;
	mxConnector.prototype.crisp = false;

	// Enable guides
	mxGraphHandler.prototype.guidesEnabled = true;

	//Specifies if single clicks should add waypoints on the new edge.  Default is false.
	//mxConnectionHandler.prototype.waypointsEnabled = true;
	
	//Returns true if the given mouse up event should stop this handler.  
	//The connection will be created if error is null.  Note that this is only called if waypointsEnabled is true.  
	//This implemtation returns true if there is a cell state in the given event.
	//mxConnectionHandler.prototype.isStopEvent = function(	me	)

	// Alt to disable guides
	mxGuide.prototype.isEnabledForEvent = function (evt) {
		return !mxEvent.isAltDown(evt);
	};

	// Enable snapping waypoints to terminals
	mxEdgeHandler.prototype.snapToTerminals = true;

	// Define an icon for creating new connections in the connection handler.
	// This will automatically disable the highlighting of the source vertex.
	mxConnectionHandler.prototype.connectImage = new mxImage(siteAbsoluteUrl + '/SiteAssets/fh_mxgraph/mxgraph/images/connector.gif', 16, 16);

	// Enable connections in the graph and disables
	// reset of zoom and translate on root change
	// (ie. switch between XML and graphical mode).
	graph.setConnectable(true);

	// Enable nesting of vertices
	graph.setDropEnabled(true);

	graph.isValidDropTarget = function (cell) {
		return true;
	};

	// Refresh is necessary to get the labels to wrap
	graph.refresh();

	// Create select actions in page
	node = $('#mainActions');
	buttons = ['group', 'delete', 'undo', 'print'];
	
			
	for (i = 0; i < buttons.length; i++) {
		var button = document.createElement('button');
		button.classList.add('button');
		button.classList.add('small');
		
		button.onclick = function() {return false;};
		
		mxUtils.write(button, mxResources.get(buttons[i]));
		var factory = function (name) {
			return function () {
				editor.execute(name);
			};
		};
		mxEvent.addListener(button, 'click', factory(buttons[i]));
		node.append(button);
	}

	select_button = document.createElement('a');
	select_button.classList.add('button');
	select_button.classList.add('small');
	select_button.classList.add('dropdown');
	select_button.setAttribute('data-dropdown', 'selectaction');
	select_button.setAttribute('aria-controls', 'selectaction');
	select_button.setAttribute('aria-expanded', 'false');
	mxUtils.writeln(select_button, 'More Actions...');
	
	select_list = document.createElement('ul');
	select_list.classList.add('f-dropdown');
	select_list.setAttribute('id', 'selectaction');
	select_list.setAttribute('data-dropdown-content', '');
	select_list.setAttribute('aria-hidden', 'true');
	
	select = document.createElement('select');
	option = document.createElement('option');
	mxUtils.writeln(option, 'More Actions...');
	select.appendChild(option);

	items = ['redo', 'ungroup', 'cut', 'copy', 'paste', 'show', 'exportImage'];

	for (i = 0; i < items.length; i++) {
		var select_list_label = document.createElement('a');
		mxUtils.writeln(select_list_label, mxResources.get(items[i]));
		var select_list_item = document.createElement('li');
		select_list_item.setAttribute('data-value', items[i]);
		select_list_item.appendChild(select_list_label);
		select_list.appendChild(select_list_item);
		
		option = document.createElement('option');
		mxUtils.writeln(option, mxResources.get(items[i]));
		option.setAttribute('value', items[i]);
		select.appendChild(option);
	}

	mxEvent.addListener(select, 'change', function (evt) {
		console.log('change');
		if (select.selectedIndex > 0) {
			var option = select.options[select.selectedIndex];
			select.selectedIndex = 0;

			if (option.value !== null) {
				editor.execute(option.value);
			}
		}
	});
	mxEvent.addListener(select, 'remove', function (evt) {
		if (select.selectedIndex > 0) {
			var option = select.options[select.selectedIndex];
			select.selectedIndex = 0;

			if (option.value !== null) {
				editor.execute(option.value);
			}
		}
	});
	mxEvent.addListener(select, 'removeCells', function (evt) {
		if (select.selectedIndex > 0) {
			var option = select.options[select.selectedIndex];
			select.selectedIndex = 0;

			if (option.value !== null) {
				editor.execute(option.value);
			}
		}
	});

	// link dropdown to select
	$(select_list).on('click', 'a', function(){
		var 
			$li = $(this).parent(),
			index = $(select_list).find('li').index($li) + 1,
			$option = $(select).find('option').eq(index),
			value = $option.val()
		;
		$option.prop('selected', true);
		$(select).val(value).change();
		editor.execute(value); 
	}); 


	node.append(select_button);
	node.append(select_list);
	try { $(document).foundation(); } catch(err) { console.log(err.message); }
	//
	select.setAttribute('style', 'display:none;');
	node.append(select);

	// Create select actions in page
	node = $('#selectActions');
	mxUtils.write(node[0], 'Select: ');
	mxUtils.linkAction(node[0], 'All', editor, 'selectAll');
	mxUtils.write(node[0], ', ');
	mxUtils.linkAction(node[0], 'None', editor, 'selectNone');
	mxUtils.write(node[0], ', ');
	mxUtils.linkAction(node[0], 'Vertices', editor, 'selectVertices');
	mxUtils.write(node[0], ', ');
	mxUtils.linkAction(node[0], 'Edges', editor, 'selectEdges');

	// Create zoom actions in page
	node = $('#zoomActions');
	mxUtils.write(node[0], 'Zoom: ');
	mxUtils.linkAction(node[0], 'In', editor, 'zoomIn');
	mxUtils.write(node[0], ', ');
	mxUtils.linkAction(node[0], 'Out', editor, 'zoomOut');
	mxUtils.write(node[0], ', ');
	mxUtils.linkAction(node[0], 'Actual', editor, 'actualSize');
	mxUtils.write(node[0], ', ');
	mxUtils.linkAction(node[0], 'Fit', editor, 'fit');

	// // Display information about the session in the status bar
	// editor.addListener(mxEvent.SESSION, function (editor, evt) {
		// var session = evt.getProperty('session');
		// if (session.connected) {
			// var tstamp = new Date().toLocaleString();
			// editor.setStatus(tstamp + ':' +
				// ' ' + session.sent + ' bytes sent, ' +
				// ' ' + session.received + ' bytes received');
		// } else {
			// editor.setStatus('Not connected');
		// }
	// });


	var doubleClick = false;
	/**********************************************
	 Add listener to go to url on DOUBLE click
	**********************************************/
	graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt) {
		// SingleClick = false;
		doubleClick = true;
		selectionChanged(graph, doubleClick);
	});

	
	graph.getSelectionModel().addListener(mxEvent.CHANGE, function (sender, evt) {
		
		console.log("before single click: doubleClick = " + doubleClick);
		doubleClick = false;
		selectionChanged(graph, doubleClick);
		doubleClick = false;
	});
	//selectionChanged(graph);

	// Add an option to view the XML of the graph
	document.body.appendChild(mxUtils.button('View XML', function () {
			var encoder = new mxCodec();
			var node = encoder.encode(graph.getModel());
			mxUtils.popup(mxUtils.getPrettyXml(node), true);
		}));

}

/**
 * Updates the properties panel
 */
function selectionChanged(graph, doubleClick) {
	var div = $('#properties');

	// Forces focusout in IE
	//graph.container.focus();

	// Clears the DIV the non-DOM way
	div.html('');

	// Gets the selection cell
	var cell = graph.getSelectionCell();

	if (cell == null) {
		mxUtils.writeln(div[0], 'Nothing selected.');
		
		//if(area !== undefined)
			//area.removeInstance('txtDescription');

		removeEditor();
	} else {
		var HasDescriptionForEditor = false;
		//cell.setStyle('rounded;html=1;whiteSpace=wrap');

		var value = cell.getValue();

		// Writes the title
		var center = document.createElement('center');
		mxUtils.writeln(center, cell.value.nodeName);
		div.append(center);
		mxUtils.br(div[0]);

		// Creates the form from the attributes of the user object
		var form = new mxForm();

		var attrs = cell.value.attributes;
		var offPage = cell.style;
		if (attrs) {
			for (var i = 0; i < attrs.length; i++) {
				try
				{
					var showField = ShowField(attrs[i],offPage);

					if (showField)
						createTextField(graph, form, cell, attrs[i]);
						
					if(attrs[i].nodeName === "spDescription")
						HasDescriptionForEditor = true;
				}
				catch(err)
				{}			
			}
		}
		
		//-----------------------
		var href = cell.getAttribute('href');
		var id = cell.getAttribute('spID');
		var Newhref;
		
		//validate if off page ref
		if(cell.style === "offPageReference")
		{
			if(href !== undefined)
			{
				//href value- > "https://gavinet.sharepoint.com/sites/km/pmt/Lists/Core%20Processes/DispForm.aspx?ID=288"	
				var num  = href.search("pmtID=");
				var res = href.substring(num);
				
				Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?" + res;
			
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
					var num  = href.search("pmtID=");
					
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
						var res = href.substring(num);
					
						Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?" + res;
					}
					else //complete URL - "https://gavinet.sharepoint.com/sites/devkm/Pages/pmt.aspx?pmtID=5"
						Newhref = webAbsoluteUrl + "/Pages/PMT.aspx?pmtID=" + href;
				}
			}
		}
		//---------------------
		var btnHTML = "<a class=\"btnEditResources\" title=\"Navigate to process.\" style=\"float:right; margin-Right:10px;\" href=\""+Newhref+"\"><img alt=\"\" style=\"margin-top: -10px;\" src=\""+siteAbsoluteUrl +"/SiteAssets/fh_mxgraph/mxgraph/images/ForwardArrowRight.png\" width=\"25\" height=\"25\"></a>";
		
		div.append(form.getTable());
		div.append(btnHTML);
		mxUtils.br(div[0]);

		if(value.localName !== "Connector" && HasDescriptionForEditor)
			createEditor();
			
		//Check for double click action
		if(doubleClick)
		{
			$(".mdl-layout__drawer").addClass("is-visible");
			
			$("#properties input").on("focus", function () {
			   $(this).select();
			});
			console.log("doubleClick after on focus");
			
			$("#properties input").first().focus(
				//function() { $(this).select(); } 
			);
			console.log("after first focus");
			doubleClick = false;
			console.log("doubleClick = false, last from if");
		}
		doubleClick = false;
	}
}

//check if value is supposed to be displayed
function ShowField(attribute, offPage) {

	//for off pages to show href
	if (attribute.nodeName === "href" && offPage === "offPageReference")
		return true;
		
	if (attribute.nodeName === "spContentTypeID" || 
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
 * Creates the textfield for the given property.
 */
function createTextField(graph, form, cell, attribute) {
	var input = null;
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
		
		
	if (attribute.nodeName === "spDescription")
	{
		input = form.addTextarea(node + ':', attribute.nodeValue, 6);
		input.id = "txtDescription";
	}
	else if (attribute.nodeName === "spStatus")
	{
		var theOptions = ['Initial draft','Under review','Approved'];
		input = form.addCombo("Status:", false,1);
		
		if(attribute.nodeValue === '')
		{
			form.addOption(input, ' ', ' ', true);
			form.addOption(input, 'Initial draft', 'Initial draft', false);
			form.addOption(input, 'Under review', 'Under review', false);
			form.addOption(input, 'Approved', 'Approved', false);
		}
		else {
			if(attribute.nodeValue === 'Initial draft')
			{
				form.addOption(input, ' ', ' ', false);
				form.addOption(input, 'Initial draft', 'Initial draft', true);
				form.addOption(input, 'Under review', 'Under review', false);
				form.addOption(input, 'Approved', 'Approved', false);
			}
			else if(attribute.nodeValue === 'Under review')
			{
				form.addOption(input, ' ', ' ', false);
				form.addOption(input, 'Initial draft', 'Initial draft', false);
				form.addOption(input, 'Under review', 'Under review', true);
				form.addOption(input, 'Approved', 'Approved', false);
			}
			else if(attribute.nodeValue === 'Approved')
			{
				form.addOption(input, ' ', ' ', false);
				form.addOption(input, 'Initial draft', 'Initial draft', false);
				form.addOption(input, 'Under review', 'Under review', false);
				form.addOption(input, 'Approved', 'Approved', true);
			}
		}
	} 
	else
	{
		input = form.addText(node + ':', attribute.nodeValue);
		input.onfocus="this.select();";
	}
	var applyHandler = function () {
		var newValue = input.value || '';
		var oldValue = cell.getAttribute(attribute.nodeName, '');

		if (newValue != oldValue) {
			graph.getModel().beginUpdate();

			try {
				var edit = new mxCellAttributeChange(cell, attribute.nodeName, newValue);
				graph.getModel().execute(edit);
				//graph.updateCellSize(cell);
			}
			finally {
				graph.getModel().endUpdate();
			}
		}
	};

	mxEvent.addListener(input, 'keypress', function (evt) {
		// Needs to take shift into account for textareas
		if (evt.keyCode == /*enter*/
			13 && !mxEvent.isShiftDown(evt)) {
			input.blur();
		}
	});

	if (mxClient.IS_IE) {
		mxEvent.addListener(input, 'focusout', applyHandler);
	} else {
		// Note: Known problem is the blurring of fields in
		// Firefox by changing the selection, in which case
		// no event is fired in FF and the change is lost.
		// As a workaround you should use a local variable
		// that stores the focused field and invoke blur
		// explicitely where we do the graph.focus above.
		mxEvent.addListener(input, 'blur', applyHandler);
	}
}

/**
 * Prompt for Roles Or Creates a new one.
 */
function PromptSelectRoleOrCreate(SelectRole, editor, graph, child, childSpContentTypeID) {
	var dialog;
	var pDialog = $('#actors');
	
	$('#actors')
		.find('option')
		.remove()
		.end();
	
	$("#dialog").css('display', 'inherit')
	dialog = $("#dialog").dialog({
			autoOpen : false,
			height : 200,
			width : 500,
			modal : true,
			buttons : {
				"OK" : function () {
					var actorSelected = $('#actors').val();

					if (actorSelected === "Create")
					{
						//--------------------------------
						
						// Clear attributes except for label and spContentTypeID
						var attributes = child.value.attributes,
						attributesCount = attributes.length,
						i2 = 0;
						for (; i2 < attributesCount; i2 += 1) {
							var attributeName = attributes[i2].nodeName;

							if (attributeName === 'label') {
								child.setAttribute(attributes[i2].nodeName, child.value.nodeName + '_' + Math.floor(Math.random() * (1000 - 0)) + 0);
								graph.refresh();
							} else if (attributeName !== 'spContentTypeID') {
								child.setAttribute(attributes[i2].nodeName, '');
							}
							graph.refresh();
						}

						// If child has an spContentTypeID create an associated Sharepoint list item
						if (childSpContentTypeID) {
							properties = {
								"Title" : child.getAttribute('label'),
								"ContentTypeId" : childSpContentTypeID,
								"__metadata" : {
									"type" : spDataType
								}
							};

							// If an item A is dropped inside of activity B, use activity
							// B's spID as item A's spParentIDs value. Otherwise use the
							// main parent id (i.e. the activity the current page represents)
							
							child.setAttribute('spParentIDs', currentItemId);
							properties['ParentIDs'] = currentItemId.toString();

							/*******************************************************************
							Create a Sharepoint list item
							 ********************************************************************/
							createListItem(webAbsoluteUrl, listName, properties,
								//Success callback
								function (listItem) {
								child.setAttribute('spID', listItem.Id);
								//child.setAttribute('href', webAbsoluteUrl + '/Lists/' + listName.replace(" ", "%20") + '/DispForm.aspx?ID=' + listItem.Id);
							},
								function (error) {
								console.log(error);
							});
							console.log(properties);
							
							var updateProperties = {
								__metadata : {
									"type" : spDataType
								},
								"GraphXML" : editor.writeGraphModel()
							};
							UpdateListItem(webAbsoluteUrl, listName, currentItemId, updateProperties);
						}
						//--------------------------------
						
					}
					else {
						var actorSelected = $('#actors').val();
						
						var Name = $( "#actors option:selected" ).text();
						
						// Clear attributes except for label and spContentTypeID
						var attributes = child.value.attributes,
						attributesCount = attributes.length,
						i2 = 0;
						for (; i2 < attributesCount; i2 += 1) {
							var attributeName = attributes[i2].nodeName;

							if (attributeName === 'label') {
								child.setAttribute(attributes[i2].nodeName, Name);
								graph.refresh();
							} else if (attributeName !== 'spContentTypeID') {
								child.setAttribute(attributes[i2].nodeName, '');
							}
							graph.refresh();
						}

						// If child has an spContentTypeID create an associated Sharepoint list item
						if (childSpContentTypeID) {
							// If an item A is dropped inside of activity B, use activity
							// B's spID as item A's spParentIDs value. Otherwise use the
							// main parent id (i.e. the activity the current page represents)
							
							child.setAttribute('spParentIDs', currentItemId);
							child.setAttribute('spID', actorSelected);
							//child.setAttribute('href', webAbsoluteUrl + '/Lists/' + listName.replace(" ", "%20") + '/DispForm.aspx?ID=' + actorSelected);
							
							console.log(properties);
							
							var updateProperties = {
								__metadata : {
									"type" : spDataType
								},
								"GraphXML" : editor.writeGraphModel()
							};
							UpdateListItem(webAbsoluteUrl, listName, currentItemId, updateProperties);
						}
						//--------------------------------
					}
					
					dialog.dialog("close");
				},
				Cancel : function () {
					// mxGraphActivityEditor(mxGraphEditor);
					
					graph.getModel().beginUpdate();

					try {
						//this.fireEvent(new mxEventObject(mxEvent.AFTER_ADD_VERTEX,"vertex",b)))
						// Gets the subtree from cell downwards
						var cells = [];
						graph.traverse(child, true, function(vertex)
						{
							cells.push(vertex);
							
							return true;
						});
						graph.removeCells(cells);
						//child.remove();
					}
					finally {
						graph.getModel().endUpdate();
					}
					
					closedWithoutCreate = true;
					dialog.dialog("close");
				}
			},
			close : function () {
				graph.refresh();
						
				dialog.dialog("close");
				closedWithoutCreate = true;
			}
		});


	var option = $('<option/>')
		.attr('value', 'Create')
		.text('Create a new role')
		.appendTo(pDialog);
	getAllItems
	(
		_spPageContextInfo.webAbsoluteUrl,
		listName,
		"ID,Title,ContentType",
		"startswith(ContentTypeId,'0x0100B780648F0DD4474886F4D0C3F275B33805')", //filter for Swimlane/role based on actor CT
		200, //rowlimit
		"Title",
		function (data) {
		$.each(data.results, function (i) {
			var option = $('<option/>')
				.attr('value', data.results[i].ID)
				.text(data.results[i].Title)
				.appendTo(pDialog);
		});
	},
		function (error) {
		alert(error);
	});
	
	dialog.dialog("open");
}

/**
 * Prompt for Roles Or Creates a new one.
 */
function PromptSelectActivities(SelectRole, editor, graph, child, childSpContentTypeID) {
	var dialog;
	var pDialog = $('#Activities');
	
	pDialog.find('option').remove().end();
	
	$("#dialogOffPage").css('display', 'inherit')
	dialog = $("#dialogOffPage").dialog({
			autoOpen : false,
			height : 200,
			width : 500,
			modal : true,
			buttons : {
				"OK" : function () {
					var actorSelected = pDialog.val();

					if (actorSelected)
					{						
						var Name = $( "#Activities option:selected" ).text();
						
						// Clear attributes except for label and spContentTypeID
						var attributes = child.value.attributes,
						attributesCount = attributes.length,
						i2 = 0;
						for (; i2 < attributesCount; i2 += 1) {
							var attributeName = attributes[i2].nodeName;

							if (attributeName === "href") {
								child.setAttribute(attributes[i2].nodeName, actorSelected);
							}
							else if (attributeName === 'label') {
								child.setAttribute(attributes[i2].nodeName, Name);
							}
						}
						
						//updates Graph
						graph.refresh();
						
						//save changes to graph XML
						var updateProperties = {
							__metadata : {
								"type" : spDataType
							},
							"GraphXML" : editor.writeGraphModel()
						};
						UpdateListItem(webAbsoluteUrl, listName, currentItemId, updateProperties);
					}
					
					dialog.dialog("close");
				},
				Cancel : function () {
					// mxGraphActivityEditor(mxGraphEditor);
					
					graph.getModel().beginUpdate();

					try {
						//this.fireEvent(new mxEventObject(mxEvent.AFTER_ADD_VERTEX,"vertex",b)))
						// Gets the subtree from cell downwards
						var cells = [];
						graph.traverse(child, true, function(vertex)
						{
							cells.push(vertex);
							
							return true;
						});
						graph.removeCells(cells);
						//child.remove();
					}
					finally {
						graph.getModel().endUpdate();
					}
					
					closedWithoutCreate = true;
					dialog.dialog("close");
				}
			},
			close : function () {
				graph.refresh();
						
				dialog.dialog("close");
				closedWithoutCreate = true;
			}
		});


	var option = $('<option/>')
		.attr('value', 'Create')
		.text('Select a Activity')
		.appendTo(pDialog);
	getAllItems
	(
		_spPageContextInfo.webAbsoluteUrl,
		listName,
		"ID,Title,ContentType",
		"startswith(ContentTypeId,'0x0100B780648F0DD4474886F4D0C3F275B33802')", //filter for activity CT
		200, //rowlimit
		"Title",
		function (data) {
		$.each(data.results, function (i) {
			
			//var Tooltip = GetNavigationMenuForTooltip(_spPageContextInfo.webAbsoluteUrl, listName, data.results[i].ID);
			
			var option = $('<option/>')
				.attr('value', data.results[i].ID)
				//.attr('title', Tooltip)
				.text(data.results[i].Title)
				.appendTo(pDialog);
		});
	},
		function (error) {
		alert(error);
	});
	
	dialog.dialog("open");
}
/**
 * checks if inserted value is numeric
 */
function IsNumeric(sText) {
	var ValidChars = "-0123456789.";
	var IsNumber = true;
	var Char;

	for (i = 0; i < sText.length && IsNumber == true; i++) {
		Char = sText.charAt(i);
		if (ValidChars.indexOf(Char) == -1) {
			IsNumber = false;
		}
	}
	return IsNumber;

}

/**
 * Creates the textfield rich html.
 */
function createEditor() {
	if (editor)
		removeEditor();

	// Create a new editor inside the <div id="editor">, setting its value to html
	//var config = {language: 'en'};
	//editor = CKEDITOR.appendTo('txtDescription', config, html);
	
	editor = CKEDITOR.replace( 'txtDescription', {
			 // //Load the English interface.
			 language: 'en'
			});
	
	 editor.addCommand("mySimpleCommand", { // create named command
		 exec: function(edt) {
			
			 // Retrieve the editor contents. In an Ajax application, this data would be
			 // sent to the server or used in any other way.
			 //document.getElementById('editorcontents').innerHTML = html = editor.getData();
			 //document.getElementById('contents').style.display = '';
			
			 var cell = graph.getSelectionCell();
			
			 graph.getModel().beginUpdate();

			 try {
				var edit = new mxCellAttributeChange(cell, "spDescription", editor.getData());
				graph.getModel().execute(edit);
				
				 //graph.updateCellSize(cell);
			 }
			 finally {
				graph.getModel().endUpdate();
				mxLog.debug('Description saved.');
			 }
			
			
			 //alert(edt.getData());
		  }
	  });
	
	 editor.ui.addButton('SuperButton', { // add new button and bind our command
		 label: "Save HTML",
		 command: 'mySimpleCommand',
		 toolbar: 'insert',
		 icon: 'https://gavinet.sharepoint.com/sites/km/SiteAssets/fh_mxgraph/mxgraph/images/Saveimg.png'
	  });


} 

/**
 * removes the textfield rich html.
 */
function removeEditor() {
	if (!editor)
		return;
	

	// Destroy the editor.
	editor.destroy();
	editor = null;
}
