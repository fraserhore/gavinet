
function mxGraphActivityPathViewer(container, itemId, highlightNodeID, configURL) {

    // Checks if browser is supported
    if (! mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is
        // not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    } else {
        // Creates the graph inside the given container
        var graph = new mxGraph(container);
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
		
        // Load the configuration (e.g. stylesheet)
        var configReq = mxUtils.load(configURL),
            configRoot = configReq.getDocumentElement(),
            configDecoder = new mxCodec(configRoot.ownerDocument);
        configDecoder.decode(configRoot, graph);

        // Adds a highlight on the cell under the mousepointer
        // new mxCellTracker(graph);

        graph.convertValueToString = function (cell) {
            if (mxUtils.isNode(cell.value)) {
                return cell.getAttribute('label', '');
            }
        };

        graph.isHtmlLabel = function (cell) {
            return true;
        };

        // Crisp rendering in SVG except for connectors, actors, cylinder, ellipses
        mxShape.prototype.crisp = true;
        mxSwimlane.prototype.crisp = true;
        mxActor.prototype.crisp = false;
        mxCylinder.prototype.crisp = false;
        mxEllipse.prototype.crisp = false;
        mxDoubleEllipse.prototype.crisp = false;
        mxConnector.prototype.crisp = false;

        // Load the graph
        graph.getModel().beginUpdate();
        try {
			//codec.decode(xmlDoc.documentElement, graph.getModel());
			getItemProperty(webAbsoluteUrl, listName, itemId, 'Process_x0020_XML',
			// Success callback
			function(xml) {
				var doc = mxUtils.parseXml(xml);
				var codec = new mxCodec(doc);
				codec.decode(doc.documentElement, graph.getModel());
			},
			// Error callback
			function(error) {
			});
        }
        finally {
            // Updates the display
            graph.getModel().endUpdate();
        }

        // Scale to fit if container smaller than graph
        var graphBounds = graph.getGraphBounds(),
            graphContainer = graph.container;
        if(graphBounds.width && graphBounds.width > graphContainer.clientWidth) {
            graph.fit();
            graph.view.rendering = true;
            // Commented out so we only call refresh once at the end
            //graph.refresh();
        }

        // Highlight the highlight node if one is passed to the function
        if(highlightNodeID){
            var highlightCell = getCellByItemIdtest(graph, highlightNodeID);
            if(highlightCell){
                var highlightCellStyle = highlightCell.getStyle();
                highlightCell.setStyle(highlightCellStyle+';fillColor=white;fontColor=black;');
                // Commented out so we only call refresh once at the end
                //graph.refresh();
            }
        }

        // Adjust style to indicate that the node has children
        var nodesWithChildrenFilter = function(cell) {
                return cell.getAttribute('children_count') > 0;
            },
            filteredCells = graph.model.filterDescendants(nodesWithChildrenFilter);
        if(filteredCells) {
            for (i = 0; i < filteredCells.length; i++) {
                var cellStyle = filteredCells[i].getStyle();
                filteredCells[i].setStyle(cellStyle+';shadow=true');
            }
            // Commented out so we only call refresh once at the end
            //graph.refresh();
        }

        // Refresh graph to make sure any style changes are shown
        graph.refresh();

        // Add listener to go to url on single click
        graph.addListener(mxEvent.CLICK, function(sender, evt) {
            var e = evt.getProperty('event'); // mouse event
            var cell = evt.getProperty('cell'); // cell may be null
            if (!evt.isConsumed()) {
                if (cell !== null) {

                   // var href = cell.getAttribute('href');

                    /* if (href !== null && href.length > 0) {
                        window.open(href, '_self');
                    } else {
                        mxUtils.alert('No URL defined');
                    } */
                }

            }
        });

        graph.dblClick = function (evt, cell) {
            var mxe = new mxEventObject(mxEvent.DOUBLE_CLICK, 'event', evt, 'cell', cell);
            this.fireEvent(mxe);

            if (! mxEvent.isConsumed(evt) && ! mxe.isConsumed() && cell !== null) {
                if (cell !== null) {

                    var href = cell.getAttribute('href');

                    if (href !== null && href.length > 0) {
                        window.open(href, '_self');
                    } else {
                        mxUtils.alert('No URL defined');
                    }
                }
            }
        };

        if (mxClient.IS_IE) {
            new mxDivResizer(container);
        }
    }
}

