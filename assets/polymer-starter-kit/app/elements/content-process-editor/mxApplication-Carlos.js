/*
 * Copyright (c) 2006-2013, JGraph Ltd
 *
 * Defines the startup sequence of the application.
 */
{

	/**
	 * Constructs a new application (note that this returns an mxEditor
	 * instance).
	 */
	function mxApplication(config)
	{
		var hideSplash = function()
		{
			// Fades-out the splash screen
			var splash = document.getElementById('splash');
			
			if (splash != null)
			{
				try
				{
					mxEvent.release(splash);
					mxEffects.fadeOut(splash, 100, true);
				}
				catch (e)
				{
					splash.parentNode.removeChild(splash);
				}
			}
		};
		
		try
		{
			if (!mxClient.isBrowserSupported())
			{
				mxUtils.error('Browser is not supported!', 200, false);
			}
			else
			{
				mxObjectCodec.allowEval = true;
				var node = mxUtils.load(config).getDocumentElement();
				var editor = new mxEditor(node);
				mxObjectCodec.allowEval = false;
				
				//------------Carlos ADD
				
				var graph = editor.graph;
				var model = graph.getModel();

				// Auto-resizes the container
				graph.border = 80;
				graph.getView().translate = new mxPoint(graph.border/2, graph.border/2);
				//graph.setResizeContainer(true);
				graph.graphHandler.setRemoveCellsFromParent(true);
			
				if (graph.isEnabled())
				{
					// Allows new connections but no dangling edges
					graph.setConnectable(true);
					graph.setAllowDanglingEdges(false);
					
					// End-states are no valid sources
					var previousIsValidSource = graph.isValidSource;
					
					graph.isValidSource = function(cell)
					{
						if (previousIsValidSource.apply(this, arguments))
						{
							var style = this.getModel().getStyle(cell);
							
							return style == null ||
								!(style == 'end' ||
								style.indexOf('end') == 0);
						}
						return false;
					};
					
					// Start-states are no valid targets, we do not
					// perform a call to the superclass function because
					// this would call isValidSource
					// Note: All states are start states in
					// the example below, so we use the state
					// style below
					graph.isValidTarget = function(cell)
					{
						var style = this.getModel().getStyle(cell);
						
						var swimlane = this.isSwimlane(cell);
						//Always returning false
						
						if(style === "swimlane")
							return false;
							
						return !this.getModel().isEdge(cell) &&
							!this.isSwimlane(cell) &&
							(style == null ||
							!(style == 'state' ||
							style.indexOf('state') == 0));
					};
					
					// Allows dropping cells into new lanes and
					// lanes into new pools, but disallows dropping
					// cells on edges to split edges
					graph.setDropEnabled(true);
					graph.setSplitEnabled(false);
					
					// Returns true for valid drop operations
					graph.isValidDropTarget = function(target, cells, evt)
					{
						if (this.isSplitEnabled() &&
							this.isSplitTarget(target, cells, evt))
						{
							return true;
						}
						
						var model = this.getModel();
						var lane = false;
						var pool = false;
						var cell = false;
						
						// Checks if any lanes or pools are selected
						for (var i = 0; i < cells.length; i++)
						{
							var tmp = model.getParent(cells[i]);
							lane = lane || this.isPool(tmp);
							pool = pool || this.isPool(cells[i]);
							
							cell = cell || !(lane || pool);
						}
						
						return !pool &&
							cell != lane &&
							((lane && this.isPool(target)) ||
							(cell && this.isPool(model.getParent(target))));
					};
					
					// Adds new method for identifying a pool
					graph.isPool = function(cell)
					{
						var model = this.getModel();
						var parent = model.getParent(cell);
					
						return parent != null &&
							model.getParent(parent) == model.getRoot();
					};
					
					// Changes swimlane orientation while collapsed
					graph.model.getStyle = function(cell)
					{
						var style = mxGraphModel.prototype.getStyle.apply(this, arguments);
					
						if (graph.isCellCollapsed(cell))
						{
							if (style != null)
							{
								style += ';';
							}
							else
							{
								style = '';
							}
							
							style += 'horizontal=1;align=left;spacingLeft=14;';
						}
						
						return style;
					};
					// Keeps widths on collapse/expand					
					var foldingHandler = function(sender, evt)
					{
						var cells = evt.getProperty('cells');
						
						for (var i = 0; i < cells.length; i++)
						{
							var geo = graph.model.getGeometry(cells[i]);
							if (geo.alternateBounds != null)
							{
								geo.width = geo.alternateBounds.width;
							}
						}
					};
					graph.addListener(mxEvent.FOLD_CELLS, foldingHandler);
				}
				
				// Applies size changes to siblings and parents
				mxsl = new mxSwimlaneManager(graph);
				mxsl.setHorizontal(true);
				// Creates a stack depending on the orientation of the swimlane
				var layout = new mxStackLayout(graph, false);
				
				// Makes sure all children fit into the parent swimlane
				layout.resizeParent = true;
							
				// Applies the size to children if parent size changes
				layout.fill = true;
				// Only update the size of swimlanes
				layout.isVertexIgnored = function(vertex)
				{
					return !graph.isSwimlane(vertex);
				}
				
				// Keeps the lanes and pools stacked
				var layoutMgr = new mxLayoutManager(graph);
				layoutMgr.getLayout = function(cell)
				{
					if (!model.isEdge(cell) && graph.getModel().getChildCount(cell) > 0 &&
						(model.getParent(cell) == model.getRoot() || graph.isPool(cell)))
					{
						layout.fill = graph.isPool(cell);
						
						return layout;
					}
					
					return null;
				};
				
				
				//------------Carlos ADD END

				// Updates the window title after opening new files
				var title = document.title;
				var funct = function(sender)
				{
					document.title = title + ' - ' + sender.getTitle();
				};
				
				editor.addListener(mxEvent.OPEN, funct);
				
				// Prints the current root in the window title if the
				// current root of the graph changes (drilling).
				editor.addListener(mxEvent.ROOT, funct);
				funct(editor);
				
				// Displays version in statusbar
				editor.setStatus('Powered by  <a href=\"http://www.jgraph.com/mxgraph.html\">mxGraph</a>');

				// Shows the application
				hideSplash();
			}
		}
		catch (e)
		{
			hideSplash();

			// Shows an error message if the editor cannot start
			mxUtils.alert('Cannot start application: '+e.message);
			throw e; // for debugging
		}
								
		return editor;
	}

}