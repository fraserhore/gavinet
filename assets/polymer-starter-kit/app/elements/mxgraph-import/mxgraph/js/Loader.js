
/*******************************************************************
Define variables for the list, the current item and the context
********************************************************************/
// Sharepoint page context info

var pageListId = _spPageContextInfo.pageListId,
	siteAbsoluteUrl = _spPageContextInfo.siteAbsoluteUrl,
	siteServerRelativeUrl = _spPageContextInfo.siteServerRelativeUrl,
	userId = _spPageContextInfo.UserId,
	userLoginName = _spPageContextInfo.userLoginName,
	webAbsoluteUrl = _spPageContextInfo.webAbsoluteUrl,
	webServerRelativeUrl = _spPageContextInfo.webServerRelativeUrl,
	webTitle = _spPageContextInfo.webTitle,
	listGuid = "84B1E444-CB1E-4C25-BCDF-18352B05A382",
	currentItemId = parseInt(GetUrlKeyValue('ID')),
	itemGuid = "",
	listName = 'Core Processes',
	spDataType = 'SP.Data.' + listName.replace(" ","_x0020_") + 'ListItem',
	<!-- spDataType = getItemTypeForListName(listName), -->
	EditModeFirstRun = true,
	ViewModeFirstRun = true,
	ParentItemID = "",
	ParentTitle = "",
	ContentTypeGroup = "",
	isViewMode = true,
	FirstClick = true,
	FirstRunNavigationMenu = true,
	activity_path_generated = false;

function EditProperties()
{
	//source should be, example: https://gavinet.sharepoint.com/sites/km/pmt/Lists/Core%20Processes/DispForm.aspx?ID=64
	var urlEdit = webAbsoluteUrl + '/Lists/' + listName.replace(" ","%20") + '/EditForm.aspx?ID=' + currentItemId + "&source=" + webAbsoluteUrl + '/Lists/' + listName.replace(" ","%20") + '/DispForm.aspx?ID=' + currentItemId;
	window.location = urlEdit;
}


function showActivityPath() {

	var configURL = 'https://gavinet.sharepoint.com/sites/km/SiteAssets/fh_mxgraph/mxgraph/config/stylesheet.xml';
		
	if(FirstClick)
	{
		$('#btnShowPath').val("Hide Activity Path");
		$('#graph-ancestor-path').css('display','block');
		//document.getElementById('graph-ancestor-path').fadeIn("slow");
		FirstClick = false;
		
		GetActivityPathGraphs(webAbsoluteUrl, listName, currentItemId, configURL);
		
		//Hide viewer or editor until activity path is enabled
		if(!isViewMode)
		{
			//mxGraph-view hide
			$('#mxGraph-view').css('display','none');
		}
		else 
		{
			//sub-activities-graph hide
			$('#sub-activities-graph').css('display','none');
		}
	}
	else
	{
		var e = $('#graph-ancestor-path');
		if(e.css('display') === 'block')
		{
			//e.fadeOut("slow");
			e.css('display', 'none');
			$('#btnShowPath').val("Show Activity Path");
			
			//show viewer or editor
			if(!isViewMode)
			{
				//mxGraph-view show
				$('#mxGraph-view').css('display','block');
			}
			else
			{
				//sub-activities-graph show
				$('#sub-activities-graph').css('display','block');
			}
		}
		else
		{
			e.css('display', 'block'); 
			$('#btnShowPath').val("Hide Activity Path");
			
			//Hide viewer or editor until activity path is enabled
			if(!isViewMode)
			{
				//mxGraph-view hide
				$('#mxGraph-view').css('display','none');
			}
			else 
			{
				//sub-activities-graph hide
				$('#sub-activities-graph').css('display','none');
			}
		}
		

	}
};
				
function ToggleViewEdit()
{
	//Creates the navigation menu with 2 levels
	if(FirstRunNavigationMenu)
	{
		GetNavigationMenu(webAbsoluteUrl, listName, currentItemId);
		//Change title of the Graph
		
		$('#resourcesList').html("");
		GetResourcesForCurrentItem(webAbsoluteUrl,'Process Resources', currentItemId);
		
		GetRasciTable(webAbsoluteUrl, listName, currentItemId);
		
		FirstRunNavigationMenu = false;
	}
	
	if(isViewMode)
	{ 
		//Change btn name
		$("#btnViewEdit").val("Edit Graph");
		
		//sub-activities-graph hide
		$('#sub-activities-graph').css('display','none');
		
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
		$("#btnViewEdit").val("View Graph");
		//mxGraph-view hide
		$('#mxGraph-view').css('display','none');
		
		//sub-activities-graph show
		$('#sub-activities-graph').css('display','block');
		
		if(EditModeFirstRun)
		{
			LoadEditor();
			EditModeFirstRun = false;
		}
		
		isViewMode = true;
	}
}

function GetParentID()
{
	var id;
	return id;
}
function LoadViewer()
{
	var configURL = 'https://gavinet.sharepoint.com/sites/km/SiteAssets/fh_mxgraph/mxgraph/config/stylesheet.xml';

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
			
			if(Parent === null && ParentIDs === null)
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
