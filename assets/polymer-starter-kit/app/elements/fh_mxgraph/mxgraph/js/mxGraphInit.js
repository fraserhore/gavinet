console.log(_spPageContextInfo);


// In the config file, the mxEditor.onInit method is overridden to invoke this global function as the last step in the editor constructor.
function onInit(editor) {
	var nodeID;

	// Open and initialize the Activity graph editor
	mxGraphActivityEditor(editor, nodeID);
}

// window.onbeforeunload = function() { return mxResources.get('changesLost'); };

// The application starts here. The document.onLoad executes the mxApplication constructor with a given configuration.
// The xml stylesheet that defines the look of the shapes is a seperate xml file that is included by the configuration file.
$(function() {
	new mxApplication( webAbsoluteUrl + '/SiteAssets/fh_mxgraph/mxgraph/config/diagrameditor.xml');
});