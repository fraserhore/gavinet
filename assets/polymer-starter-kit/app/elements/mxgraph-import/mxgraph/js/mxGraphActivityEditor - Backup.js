console.log('_spPageContextInfo');
console.log(_spPageContextInfo);

var editor, html = '';
var closedWithoutCreate = false;

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

				if (childTagName === "Role" && previous === null) {
					PromptSelectRoleOrCreate(function (pObjectId) {
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

							child.setAttribute('spResponsible', parentSpID);
							properties['Responsible'] = parentSpID.toString();
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
						if (parentTagName === 'Role') {
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
							child.setAttribute('spResponsible', childSpResponsible);
							properties['Responsible'] = childSpResponsible.toString();
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
	Set mxGraph options
	 ********************************************************************/
	// Wrap label text
	graph.setHtmlLabels(true);

	// Load the stencils into the registry
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
		mxUtils.write(button, mxResources.get(buttons[i]));
		var factory = function (name) {
			return function () {
				editor.execute(name);
			};
		};
		mxEvent.addListener(button, 'click', factory(buttons[i]));
		node.append(button);
	}

	select = document.createElement('select');
	option = document.createElement('option');
	mxUtils.writeln(option, 'More Actions...');
	select.appendChild(option);

	items = ['redo', 'ungroup', 'cut', 'copy', 'paste', 'show', 'exportImage', 'newExportImage'];

	for (i = 0; i < items.length; i++) {
		option = document.createElement('option');
		mxUtils.writeln(option, mxResources.get(items[i]));
		option.setAttribute('value', items[i]);
		select.appendChild(option);
	}

	mxEvent.addListener(select, 'change', function (evt) {
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

	// Display information about the session in the status bar
	editor.addListener(mxEvent.SESSION, function (editor, evt) {
		var session = evt.getProperty('session');
		if (session.connected) {
			var tstamp = new Date().toLocaleString();
			editor.setStatus(tstamp + ':' +
				' ' + session.sent + ' bytes sent, ' +
				' ' + session.received + ' bytes received');
		} else {
			editor.setStatus('Not connected');
		}
	});

	graph.getSelectionModel().addListener(mxEvent.CHANGE, function (sender, evt) {
		selectionChanged(graph);
	});
	selectionChanged(graph);

	// Client-side code for new image export
	var newExportImage = function (editor) {
		var scale = 1;
		var bounds = editor.graph.getGraphBounds();

		// Creates XML node to hold output
		var xmlDoc = mxUtils.createXmlDocument();
		var root = xmlDoc.createElement('output');
		xmlDoc.appendChild(root);

		// Creates interface for rendering output
		var xmlCanvas = new mxXmlCanvas2D(root);
		xmlCanvas.scale(scale);
		xmlCanvas.translate(Math.round(-bounds.x * scale), Math.round(-bounds.y * scale));

		// Renders output to interface
		var imgExport = new mxImageExport();
		imgExport.drawState(editor.graph.getView().getState(editor.graph.model.root), xmlCanvas);

		// Puts request data together
		var filename = 'export.png';
		var format = 'png';
		var bg = '#FFFFFF';
		var w = Math.round((bounds.width + 4) * scale);
		var h = Math.round((bounds.height + 4) * scale);
		var xml = mxUtils.getXml(root);

		// Compression is currently not used in this example
		// Requires base64.js and redeflate.js
		// xml = encodeURIComponent(Base64.encode(RawDeflate.deflate(xml), true));

		new mxXmlRequest('/New' + editor.urlImage.substring(1), 'filename=' + filename +
			'&format=' + format + '&bg=' + bg + '&w=' + w + '&h=' + h + '&xml=' +
			encodeURIComponent(xml)).simulate(document, '_blank');
	};

	editor.addAction('newExportImage', newExportImage);

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
function selectionChanged(graph) {
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

		//cell.setStyle('rounded;html=1;whiteSpace=wrap');

		var value = cell.getValue();

		// Writes the title
		var center = document.createElement('center');
		mxUtils.writeln(center, cell.value.nodeName + ' (' + cell.id + ')');
		div.append(center);
		mxUtils.br(div[0]);

		// Creates the form from the attributes of the user object
		var form = new mxForm();

		var attrs = cell.value.attributes;

		if (attrs) {
			for (var i = 0; i < attrs.length; i++) {
				var showField = ShowField(attrs[i]);

				if (showField)
					createTextField(graph, form, cell, attrs[i]);
			}
		}

		div.append(form.getTable());
		mxUtils.br(div[0]);

		if(value.localName !== "Connector")
			createEditor();
	}
}

//check if value is supposed to be displayed
function ShowField(attribute) {

	if (attribute.nodeName === "href" || attribute.nodeName === "spContentTypeID" || attribute.nodeName === "spID" || attribute.nodeName === "spParentIDs")
		return false;
	else
		return true;
}

/**
 * Creates the textfield for the given property.
 */
function createTextField(graph, form, cell, attribute) {
	var input = null;

	if (attribute.nodeName === "spDescription") {
		input = form.addTextarea(attribute.nodeName + ':', attribute.nodeValue, 6);
		input.id = "txtDescription";
	} else
		input = form.addText(attribute.nodeName + ':', attribute.nodeValue);

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
		"startswith(ContentTypeId,'0x0100B780648F0DD4474886F4D0C3F275B33805')", //filter
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
				// graph.getModel().endUpdate();
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
