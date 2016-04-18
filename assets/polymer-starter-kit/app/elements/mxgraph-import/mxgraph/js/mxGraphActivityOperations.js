/*************************************************************************
 * Sharepoint API functions.
 *************************************************************************/

 // Create Operation
// webAbsoluteUrl: The url of the site that the list is in
// listName: The name of the list you want to get items from
// properties: json object with item properties to be updated
// success: The function to execute if the call is successful
// failure: The function to execute if the call fails
function createListItem(webAbsoluteUrl, listName, properties, success, failure) {
    var itemType = getItemTypeForListName(listName);
    $.ajax({
        url: webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(properties),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            success(data.d);
				mxLog.debug('Item ' + data.d.Id +' created');
        },
        error: function (data) {
            failure(data);
			mxLog.debug('Item creation failed');
			$('#feedbackUserErrors').html("");
			var errorReport = "<p>An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.</p>";
						 //+ "<p>Report the following error to support. Failed to update item " + itemId + " " + errorStatus + " " + errorThrown". </p>";
			$('#feedbackUserErrors').html(errorReport);
			var r=confirm("An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.");
			if (r)
			{
				//write redirection code
				window.location.reload();
				// window.location = window.location.href;
			}
        }
    });
}


// Update Operation
// webAbsoluteUrl: The url of the site that the list is in
// listName: The name of the list you want to get items from
// itemId: the id of the item to update
// properties: json object with item properties to be updated
function UpdateListItem(webAbsoluteUrl, listName, itemId, properties) {
	if(itemId)
	{
		mxLog.debug('Updating item ' + itemId);
		// first we need to fetch the eTag to ensure we have the most recent value for it
		$.ajax({
			url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')",
			type: "GET",
			headers: { "ACCEPT": "application/json;odata=verbose" },
			success: function(data){
				// got the eTag
				var etag = data.d.__metadata.etag;
				//console.log(properties);

				// set the MERGE verb so we only need to provide the update delta
				var requestHeaders = {
					"ACCEPT": "application/json;odata=verbose",
					"content-type": "application/json;odata=verbose",
					"X-RequestDigest": $("#__REQUESTDIGEST").val(),
					"X-HTTP-Method": "MERGE",
					"If-Match": "*"
				}

				$.ajax({
					url: data.d.__metadata.uri,
					type: "POST",
					contentType: "application/json;odata=verbose",
					headers: requestHeaders,
					data: JSON.stringify(properties),
					success: function(data){
						mxLog.debug('Item ' + itemId + ' updated');
					},
					error: function(data, errorStatus, errorThrown ){
						mxLog.debug("Failed to update item " + itemId + " " + errorStatus + " " + errorThrown);
						$('#feedbackUserErrors').html("");
						
						if(errorThrown !== "Conflict")
						{
							var errorReport = "<p>An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.</p>";
										 //+ "<p>Report the following error to support. Failed to update item " + itemId + " " + errorStatus + " " + errorThrown". </p>";
							$('#feedbackUserErrors').html(errorReport);
							var r=confirm("An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.");
							if (r)
							{
								//write redirection code
								window.location.reload();
								// window.location = window.location.href;
							}
						}
					}
				});
			},
			error:  function(data){
				mxLog.debug("Failed to update item " + data);
				$('#feedbackUserErrors').html("");
				var errorReport = "<p>An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.</p>";
							 //+ "<p>Report the following error to support. Failed to update item " + itemId + " " + errorStatus + " " + errorThrown". </p>";
				$('#feedbackUserErrors').html(errorReport);
				var r=confirm("An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.");
				if (r)
				{
					//write redirection code
					window.location.reload();
					// window.location = window.location.href;
				}
			}
		});
	}
	else
		mxLog.debug("Failed to update item, no ID was passed, please try to update the graph before performing another operation.");
}

// READ SPECIFIC ITEM operation
// itemId: The id of the item to get
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. 
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function getListItemWithId(itemId, listName, siteurl, success, failure) {
    var url = siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items?$filter=Id eq " + itemId;
    $.ajax({
        url: url,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            if (data.d.results.length == 1) {
                success(data.d.results[0]);
            }
            else {
                failure("Multiple results obtained for the specified Id value");
            }
        },
        error: function (data) {
            failure(data);
        }
    });
}

// Delete Operation
// itemId: the id of the item to delete
// listName: The name of the list you want to delete the item from
// siteurl: The url of the site that the list is in. 
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function deleteListItem(itemId, listName, siteUrl, success, failure) {
    getListItemWithId(itemId, listName, siteUrl, function (data) {
        $.ajax({
            url: data.__metadata.uri + "/recycle()",
            type: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-Http-Method": "DELETE",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "If-Match": data.__metadata.etag
            },
            success: function () {
                mxLog.debug('Deleted item ' + itemId);
            },
            error: function () {
                failure("Item deleted failure: " + errorThrown);
				console.log("Failed to deleted item " + itemId + " " + errorStatus + " " + errorThrown);
				$('#feedbackUserErrors').html("");
				var errorReport = "<p>An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.</p>";
							 //+ "<p>Report the following error to support. Failed to update item " + itemId + " " + errorStatus + " " + errorThrown". </p>";
				$('#feedbackUserErrors').html(errorReport);
				var r=confirm("An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.");
				if (r)
				{
					//write redirection code
					window.location.reload();
					// window.location = window.location.href;
				}
            }
        });
	},
	function (data) {
		failure("Item deleted failure: " + data);
		console.log("Failed to deleted item " + itemId);
   });
}

// Delete Operation
// itemId: the id of the item to delete
// listName: The name of the list you want to delete the item from
// siteurl: The url of the site that the list is in.
// success: The function to execute if the call is sucessfull
// failure: The function to execute if the call fails
function deleteListItemOld(itemId, listName, siteUrl, success, failure) {

		var listitemurl = siteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')/recycle()";
        $.ajax({
            url: listitemurl,
            type: "DELETE",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-Http-Method": "DELETE",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "If-Match": "*"
            },
            success: function () {
                //success("Item deleted - Id:" + itemId);
				mxLog.debug('Deleted item ' + itemId);
            },
            error: function (data, errorStatus, errorThrown) {
                failure("Item deleted failure: " + errorThrown);
				console.log("Failed to deleted item " + itemId + " " + errorStatus + " " + errorThrown);
				$('#feedbackUserErrors').html("");
				var errorReport = "<p>An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.</p>";
							 //+ "<p>Report the following error to support. Failed to update item " + itemId + " " + errorStatus + " " + errorThrown". </p>";
				$('#feedbackUserErrors').html(errorReport);
				var r=confirm("An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.");
				if (r)
				{
					//write redirection code
					window.location.reload();
					// window.location = window.location.href;
				}
            }
        });
}


function deleteItemReturn(webAbsoluteUrl, listName, itemId, success, failure) {

	var requestHeaders = {
		"ACCEPT": "application/json;odata=verbose",
		"X-RequestDigest": $("#__REQUESTDIGEST").val(),
		"If-Match": "*" // delete the item even if another user has updated it since we last fetched it
	}

	$.ajax({
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')/recycle()",
		type: "DELETE",
		contentType: "application/json;odata=verbose",
		headers: requestHeaders,
		success: function(data) {
			//console.log(data.d);
			success(data.d);
		},
		error: function(){
			console.log("Failed to delete item");
			$('#feedbackUserErrors').html("");
			var errorReport = "<p>An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.</p>";
						 //+ "<p>Report the following error to support. Failed to update item " + itemId + " " + errorStatus + " " + errorThrown". </p>";
			$('#feedbackUserErrors').html(errorReport);
			var r=confirm("An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.");
			if (r)
			{
				//write redirection code
				window.location.reload();
				// window.location = window.location.href;
			}
		}
	});

}


function deleteItem(webAbsoluteUrl, listName, itemId) {

	var requestHeaders = {
		"ACCEPT": "application/json;odata=verbose",
		"X-RequestDigest": $("#__REQUESTDIGEST").val(),
		"If-Match": "*" // delete the item even if another user has updated it since we last fetched it
	}

	$.ajax({
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')/recycle()",
		type: "DELETE",
		contentType: "application/json;odata=verbose",
		headers: requestHeaders,
		success: function(){
			alert("Deleted item");
		},
		error: function(){
			alert("Failed to delete item");
			$('#feedbackUserErrors').html("");
			var errorReport = "<p>An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.</p>";
						 //+ "<p>Report the following error to support. Failed to update item " + itemId + " " + errorStatus + " " + errorThrown". </p>";
			$('#feedbackUserErrors').html(errorReport);
			var r=confirm("An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.");
			if (r)
			{
				//write redirection code
				window.location.reload();
				// window.location = window.location.href;
			}
		}
	});

}


// Get List Item Type metadata
function getItemTypeForListName(name) {
    return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
}

function getItemWithId(webAbsoluteUrl, listName, itemId, success, error) {
	$.ajax({
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')?$select=ID,Title,ProcessItemDescription,ParentIDs",
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		},
		success: function(data) {
			//console.log(data.d);
			success(data.d);
		},
		error:  function(data){
			console.log(data);
		}
	});
}

//Get all properties, except the user field values, that need to be keypaired: author, editor, ...
//to get this value check query at: getItemCreatorById()
function getFullItemFieldById(webAbsoluteUrl, listName, itemId, success, error) {
	$.ajax({
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')",
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		},
		success: function(data) {
			//console.log(data.d);
			success(data.d);
		},
		error: function(data){
			console.log(data);
		}
	});
}

function getItemProperty(webAbsoluteUrl, listName, itemId, property, success, error) {
	$.ajax({
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')?$select=" + property,
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		},
		success: function(data) {
			//console.log(data.d[property]);
			success(data.d[property]);
		},
		error: function(data){
			console.log(data);
		}
	});
}

function getItemByField(webAbsoluteUrl, listName, fieldName, fieldQueryParameter, success, error) {
	$.ajax({
		// $filter=substringof('"+fieldName+"', "+fieldQueryParameter+") eq true
		//url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$select=FileRef,Title&$filter="+fieldName+" eq "+fieldQueryParameter,
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$select=FileRef,Title,Id,ParentProcessID&$substringof("+fieldName+", " + fieldQueryParameter + ")",
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		},
		success: function(data) {
			//console.log(data.d);
			success(data.d);
		},
		error: function(data){
			console.log(data);
		}
	});
}

function getListItemByField(webAbsoluteUrl, listName, fieldName, fieldQueryParameter, success, error) {
	$.ajax({
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$select=Author/Id,Author/Title,Editor/Id,Editor/Title,*&$expand=Author,Editor&$substringof("+fieldName+", " + fieldQueryParameter + ")",
		//url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$select=Author/Id,Author/Title,Editor/Id,Editor/Title,*&$expand=Author,Editor&$substringof("+fieldName+", " + fieldQueryParameter + ")",
		//url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$select=FileRef,Title,ItemID,Comment&$substringof("+fieldName+", " + fieldQueryParameter + ")",
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		},
		success: function(data) {
			//console.log(data.d);
			success(data.d);
		},
		error: function(data){
			console.log(data);
		}
	});
}

function getAllItems(webAbsoluteUrl, listName, viewFields, filter, rowlimit, orderbyfield, success, error) {
	var queryFilter = "&$filter=";
	if(filter === "")
	{
		queryFilter = "";
	}
	else
	{
		queryFilter += filter;
	}
	$.ajax({
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$select=" + viewFields + "&$expand=ContentType" + queryFilter +"&$orderby=" + orderbyfield + "&$top=" + rowlimit,
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		},
		success: function(data) {
			//console.log(data.d);
			success(data.d);
		},
		error: function(data){
			console.log(data);
		}
	});
}

function getListUrl(webAbsoluteUrl, listName, success, error) {
  $.ajax({
    url: webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('" + listName + "')/rootFolder?$select=ServerRelativeUrl",
    type: "GET",
    contentType: "application/json;odata=verbose",
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    success: function(data) {
      success(data.d.ServerRelativeUrl);
    },
    error: function(data){
			console.log(data);
		}
  });
}

function getDocumentWithId(webAbsoluteUrl, listName, currentDocumentId, success, error) {
	$.ajax({
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + currentDocumentId + "')",
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		},
		success: function(data) {
			//console.log(data.d);
			success(data.d);
		},
		error: function(data){
			console.log(data);
		}
	});
}

// Change the display name and title of the list item.
function updateListItemGroup(itemMetadata, newGroup) {

	// Define the list item changes. Use the FileLeafRef property to change the display name. 
	// For simplicity, also use the name as the title. 
	// The example gets the list item type from the item's metadata, but you can also get it from the
	// ListItemEntityTypeFullName property of the list.
	var body = String.format("{{'__metadata':{{'type':'{0}'}},'Group':'{1}'}}",
		itemMetadata.type, newGroup);

	// Send the request and return the promise.
	// This call does not return response content from the server.
	return jQuery.ajax({
		url: itemMetadata.uri,
		type: "POST",
		data: body,
		headers: {
			"X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
			"content-type": "application/json;odata=verbose",
			"content-length": body.length,
			"IF-MATCH": itemMetadata.etag,
			"X-HTTP-Method": "MERGE"
		}
	});
}
	
function UpdateDocumentGroup(currentDocumentId, currentItemId, webAbsoluteUrl, listName) {
  
  input = confirm("Are you sure you want to remove this document from this item?");
  if(input)
  {
	var Document = getDocumentWithId(webAbsoluteUrl, listName, currentDocumentId,
		function (listItem, status, xhr) {

			var ParentProcessID  = listItem.ParentProcessID;
			
			// Current item id dont exist in group, lets group it
			if (ParentProcessID.indexOf(currentItemId) >= 0)
			{
				//item is not grouped, going to delete it
				if(ParentProcessID === currentItemId.toString())
				{
					// Change the ParentProcessID of the list item if already exists.
					var changeItem = deleteItemReturn(webAbsoluteUrl, listName, currentDocumentId,
						function (data, status, xhr) {
							
							//Lets reload the resources.
							$('#resourcesList').html("");
							GetResourcesForCurrentItem(webAbsoluteUrl,'Process Resources', currentItemId);
						},
						function(error) {
							console.log(error);
						}
					);
				}
				else
				{
					group = group.replace(";"+currentItemId, "");
					
					// Change the group of the list item if already exists.
					var changeItem = updateListItemGroup(listItem.__metadata, group);
					changeItem.done(function (data, status, xhr) {
						
						//Lets reload the resources.
						$('#resourcesList').html("");
						GetResourcesForCurrentItem(webAbsoluteUrl,'Process Resources', currentItemId);
					});
				}
			}
			
			
			
		},
		function(error) {
			console.log(error);
		
			$('#feedbackUserErrors').html("");
			var errorReport = "<p>An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.</p>";
						 //+ "<p>Report the following error to support. Failed to update item " + itemId + " " + errorStatus + " " + errorThrown". </p>";
			$('#feedbackUserErrors').html(errorReport);
			var r=confirm("An error occured while saving your modifications. Please reload the page so you can continue to work on this process without losing information.");
			if (r)
			{
				//write redirection code
				window.location.reload();
				// window.location = window.location.href;
			}
		
		}
	);
	
  }
}
  
function GetResourcesForCurrentItem(webAbsoluteUrl,listName, currentItemId) {
    getItemByField(webAbsoluteUrl, listName, 'ParentProcessID', currentItemId,
			function(data) {
				
				for (var i = 0; i < data.results.length; i = i + 1) {   
					
					var group = data.results[i].Group;
					
					var ParentProcessID = data.results[i].ParentProcessID;
					
					if(ParentProcessID)
					{
						var teste = ParentProcessID.split(";");
						var OK = $.inArray(currentItemId.toString(), teste);
						 
						//if(ParentProcessID.indexOf(currentItemId) >= 0)
						if(OK !== -1)
						{
							var href = data.results[i].FileRef; //EncodeAbsUrl
							var Title = data.results[i].Title; 
							var ID = data.results[i].Id; 
							
							var buttonEditHtml = "<a class=\"btnEditResources\" title=\"Edit the document properties.\" style=\"float:right; margin-Right:10px;\" href=\""+webAbsoluteUrl+"/"+listName+"/Forms/EditForm.aspx?ID="+ID+"\"><img alt=\"\" class=\"resourcesImg\" src=\""+siteAbsoluteUrl +"/SiteAssets/fh_mxgraph/mxgraph/images/MaterialIcons/ic_edit_black_48dp_1x.png\" width=\"25\" height=\"25\"></a>";
							
							// onClick="var answer = confirm('Are you sure you want to remove this document from this item?'); if (answer) { UpdateDocumentGroup(" + ID + "," + //currentItemId + "); }"
							
							
							  var buttonDeleteHtml = "<a class=\"LinkDeleteDoc\" title=\"Delete the document, if the document is linked to more process objects, it will only remove from this one.\" onClick=\"UpdateDocumentGroup(" + ID + "," + currentItemId + ",'" + webAbsoluteUrl + "','" + listName + "')\" href=\"#\"><img alt=\"\" class=\"resourcesImg\" src=\""+ siteAbsoluteUrl +"/SiteAssets/fh_mxgraph/mxgraph/images/MaterialIcons/ic_delete_black_48dp_1x.png\"  width=\"25\" height=\"25\"></a>";
							
							// var buttonDeleteHtml = "<a class=\"LinkDeleteDoc\" onClick=\"alert()\" href=\"#\"><img alt=\"\" src=\"/sites/km/SiteAssets/fh_mxgraph/mxgraph/images/DeleteDoc.png\"  width=\"25\" height=\"25\"></a>";
							
							
							//var buttonDeleteHtml = "<input class=\"btnDeleteDocs\" type=\"button\" id=\"btnDelete\" text=\"Delete\" value=\"Delete\" onClick=\"var answer = confirm('Are you sure you want to remove this document from this item?'); if (answer) { UpdateDocumentGroup(" + ID + "," + currentItemId + "," + webAbsoluteUrl + "," + listName + "); }\"></input>";
							
							//var buttonDeleteHtml = "<a id=\"unobtrusive\" style=\"float:right; margin-Right:10px;\" //href=\""+webAbsoluteUrl+"/"+listName+"/Forms/EditForm.aspx?ID="+ID+"\"><img alt=\"\" //src=\"/sites/km/SiteAssets/fh_mxgraph/mxgraph/images/DeleteDoc.png\" width=\"25\" height=\"25\"></a>";
							
							var innerHTML = "<p><a href=\"" + href +"\" id=\"parentNavigation\"> "+ Title +"</a> "+ buttonEditHtml + buttonDeleteHtml +"</p>";

							var oldHTML = $('#resourcesList').html();

							$('#resourcesList').html(oldHTML + innerHTML);
						}
					}
				 }
			},
			function(error) {
			console.log(error);
			}
		);
}
  
//Get recursive parent items for given item
function GetNavigationMenu(webAbsoluteUrl,listName, currentItemId) {
    getItemWithId(webAbsoluteUrl, listName, currentItemId,
			function(data) {
				//$('#lblTitle').html(data.Title);
				
				if(GotDescriptioAlready)
				{
					$('#psDescription').html(data.ProcessItemDescription);
					GotDescriptioAlready = false;
				}
				ParentItemID = data.ParentIDs;
				
				//if parent exist lets create the HTML for the navigation
				if(ParentItemID)
				{
					//var parentNavigation = document.createElement('parentNavigation');
					//var parentNav = webAbsoluteUrl + '/Lists/' + listName.replace(" ","%20") + '/DispForm.aspx?ID=' + ParentItemID
					var parentNav = webAbsoluteUrl + '/Pages/PMT.aspx?pmtID=' + ParentItemID;

					//Grabs the parent of the first item passed, so we can know its name
					getItemWithId(webAbsoluteUrl, listName, ParentItemID,
						function(data) {
							ParentTitle = data.Title;
							if(ParentItemID)
							{
								var innerHTML = "<a href=" + parentNav +" id=\"parentNavigation\"> "+ ParentTitle +"</a>";
								var spliter = "<span style=\"margin-left: 4px; margin-right: 3px;\"> <img style=\"width:12px; height:12px;\" alt=\":\" src=\"/sites/devkm/SiteAssets/fh_mxgraph/mxgraph/images/arrowRight.png\"></img></span>";	
								var oldHTML = $('#divTitlelbl').html();
								$('#divTitlelbl').html(innerHTML + spliter + oldHTML) ;
							}
							
							var ParentOfParentItemID = data.ParentIDs;
							if(ParentOfParentItemID)
							{
								//Runs the function for first parent.
								GetNavigationMenu(webAbsoluteUrl,listName, ParentItemID);
							}
						  },
						  function(error) {
							console.log(error);
						  }
						);
				}
			},
			function(error) {
			console.log(error);
			}
		);

}

//Get recursive parent items for given item
function GetNavigationMenuForTooltip(webAbsoluteUrl,listName, currentItemId) {
	var tooltip;
	
    getItemWithId(webAbsoluteUrl, listName, currentItemId,
			function(data) {
				
				ParentItemID = data.ParentIDs;
				
				//if parent exist lets create the HTML for the navigation
				if(ParentItemID)
				{

					//Grabs the parent of the first item passed, so we can know its name
					getItemWithId(webAbsoluteUrl, listName, ParentItemID,
						function(data) {
							ParentTitle = data.Title;
							if(ParentItemID)
							{
								var tooltip = ParentTitle;
								// var innerHTML = "<a href=" + parentNav +" id=\"parentNavigation\"> "+ ParentTitle +"</a>";
								// var spliter = "<span style=\"margin-left: 4px; margin-right: 3px;\"> <img style=\"width:12px; height:12px;\" alt=\":\" src=\"/sites/devkm/SiteAssets/fh_mxgraph/mxgraph/images/arrowRight.png\"></img></span>";	
								// var oldHTML = $('#divTitlelbl').html();
								// $('#divTitlelbl').html(innerHTML + spliter + oldHTML) ;
								
								return tooltip;
							}
							
							// var ParentOfParentItemID = data.ParentIDs;
							// if(ParentOfParentItemID)
							// {
								// //Runs the function for first parent.
								// GetNavigationMenu(webAbsoluteUrl,listName, ParentItemID);
							// }
						  },
						  function(error) {
							console.log(error);
						  }
						);
				}
			},
			function(error) {
			console.log(error);
			}
		);
}

function GetCreatorAndModified(webAbsoluteUrl, listName, currentItemId) {
	getItemCreatorById(webAbsoluteUrl, listName, currentItemId,
			function(data) {
				//if parent exist lets create the HTML for the Creator and last modifier
				if(data)
				{
					var userCreatorName = data.Author.Title;
					var userModifierName = data.Editor.Title;
					
					$('#CreatorAndModifiedTopDiv').css('display','block');
					var creator = "<p>Creator: "+ userCreatorName +"</p>";
					var modifier = 	"<p>Last Modified by: "+ userModifierName +"</p>";
					var completeHTML = creator + modifier;
					
					$('#CreatorAndModified').html(completeHTML);
				}
			},
			function(error) {
				console.log(error);
				$('#CreatorAndModifiedTopDiv').css('display','none');
			}
		);
}


// CREATE Operation
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. // title: The value of the title field for the new item
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function createListItemWithDetails(listName, siteUrl, title, Comment, ID) {
	
	var itemType = "SP.Data." + listName.charAt(0).toUpperCase() + listName.split(" ").join("").slice(1) + "ListItem";
    
    var item = {
        "__metadata": { "type": itemType },
        "Title": title,
		"Comment": String(Comment),
		"ItemID": String(ID)
    };
 
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
			mxLog.debug("Comment created.");
        },
        error: function (data) {
            mxLog.debug("Comment operation failed, please try again later.");
        }
    });
}

function InsertComment() {
	
	var input = document.getElementById('newComment').value;

	if(input !== "")
	{
		createListItemWithDetails("CommentsList", webAbsoluteUrl, userLoginName, input, currentItemId);
		
		//Timeout so that we can get the new comment, sometimes can be slow
		setTimeout(function(){
			$('#Comments').html("");
			document.getElementById('newComment').value = "";
			GetComments(webAbsoluteUrl, "CommentsList", currentItemId);
			$('#CommentsToggle').toggle();
		},3000);
		
	}
}

function GetCommentsPermissions(listName,currentItemId)
{
	$.getJSON(_spPageContextInfo.webServerRelativeUrl + "/_api/web/currentuser")
	.done(function(data){ 
			var ln = data.LoginName;
			// getListItemWithId(itemId, listName, siteurl, success, failure)
			getUserEffectivePermissionsOnList(_spPageContextInfo.webAbsoluteUrl, listName, ln)
			.done(function(data){
            var roles = parseBasePermissions(data);
				if($.inArray('editListItems',roles) == -1)
				{
					// For users that cannot comment 
					$('#CommentsButton').css('display','none');					
				}
				
			});
		})
		.fail(function() { console.log("Failed to retrieve user login name")});
}

function checkPermissions() {
    var call = jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl +
            "/_api/Web/effectiveBasePermissions",
        type: "GET",
        dataType: "json",
        headers: {
            Accept: "application/json;odata=verbose"
        }
    });

    call.done(function (data, textStatus, jqXHR) {
        var manageListsPerms = new SP.BasePermissions();
        manageListsPerms.initPropertiesFromJson(data.d.EffectiveBasePermissions);

        var manageLists = manageListsPerms.has(SP.PermissionKind.manageLists);

        var message = jQuery("#message");
        message.text("Manage Lists: " + manageLists);
    });
}

 function GetOwnerPermissions(listName)
 {
	 $.getJSON(_spPageContextInfo.webServerRelativeUrl + "/_api/web/currentuser")
	 .done(function(data){ 
			 var ln = data.LoginName;
			 // getListItemWithId(itemId, listName, siteurl, success, failure)
			 //getListUserEffectivePermissions(_spPageContextInfo.webServerRelativeUrl, listName, currentItemId, ln)
			 getUserEffectivePermissionsOnList(_spPageContextInfo.webAbsoluteUrl, listName, ln)
			 .done(function(data){
             var roles = parseBasePermissions(data);
				 if($.inArray('manageWeb',roles) == -1)
				 {
					 // For users that cannot comment 
					 $('#OwnerLink1').css('display','none');		
					 $('#OwnerLink2').css('display','none');		
					 
				}
				
			});
	})
	 .fail(function() { console.log("Failed to retrieve user login name")});
 }


function GetComments(webAbsoluteUrl, listName, currentItemId) {
	var counter = 0;
	
	var TitleCounter = "<strong>Comments</strong>"
	$('.CommentsTitle').html(TitleCounter);
					
	//getFullItemPropertiesAndCreatorById(webAbsoluteUrl, listName, currentItemId,
	getListItemByField(webAbsoluteUrl, listName, 'ItemID', currentItemId,
			function(data) {
				//if parent exist lets create the HTML for the Creator and last modifier
				if(data)
				{
					for (var i = 0; i < data.results.length; i = i + 1)
					{
						if(data.results[i].ItemID === String(currentItemId))
						{
							var oldHTML = $('#Comments').html();
							// var teste = ParentProcessID.split(";");
							// var OK = $.inArray(currentItemId.toString(), teste);
							 
							//if(ParentProcessID.indexOf(currentItemId) >= 0)
							// if(OK !== -1)
							// {
							// var href = data.results[i].FileRef; //EncodeAbsUrl
							var Title = data.results[i].Author.Title; 
							var Comment = data.results[i].Comment;
							
							//Actions%5Fx0020%5Ftaken
							var ActionsTaken = data.results[i].Actions_x0020_taken;
							
							if(ActionsTaken === null)
								ActionsTaken = " ";
							
							var  d = data.results[i].Created;
							var d2 = d.replace("Z"," ");
							var Date = d2.replace("T"," ");
							
							counter = counter + 1;
							var TitleCounter = "<strong>Comments ("+ counter +")</strong>"
							// var userModifierName = data.Editor.Title;
							
							$('#Comments').css('display','block');
							var creator = "<p><b>"+ Title + "</b> - "+ Date + "</p>";
							// var CommentHTML = 	"<p>Comment: "+ Comment +"</p>";
							var completeHTML =  "<div class=\"smallBorderBottom\"> "+ creator + "<div class=\"floatLeft divWith70\">"+ Comment + "</div> <div class=\"floatRight divWith30 leftpadding\"> " + ActionsTaken +"</div></div>";
							
							$('#Comments').html(oldHTML + completeHTML);
							$('.CommentsTitle').html(TitleCounter);
							// }
						}
					}
				}
				else
				{
					$('#CommentsToggle').css('display','block');
					$('#CommentsButton').css('display','block');
				}
			},
			function(error) {
				console.log(error);
				$('#Comments').css('display','none');
			}
		);
}

function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
}
//Grabs author, editor and all properties *, using a keypair value for this user fields.
function getFullItemPropertiesAndCreatorById(webAbsoluteUrl, listName, itemId, success, error) {
	$.ajax({
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')?$select=Author/Id,Author/Title,Editor/Id,Editor/Title,*&$expand=Author,Editor",
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		},
		success: function(data) {
			//console.log(data.d);
			success(data.d);
		},
		error: function(data){
			console.log(data);
		}
	});
}

//Grabs author and editor only, using a keypair value for this user fields.
function getItemCreatorById(webAbsoluteUrl, listName, itemId, success, error) {
	$.ajax({
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')?$select=Author/Id,Author/Title,Editor/Id,Editor/Title,*&$expand=Author,Editor",
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		},
		success: function(data) {
			//console.log(data.d);
			success(data.d);
		},
		error: function(data){
			console.log(data);
		}
	});
}

function GetActivityPathGraphs(webAbsoluteUrl, listName, currentItemId, configURL) {
    getItemWithId(webAbsoluteUrl, listName, currentItemId,
			function(data) {
				ParentItemID = data.ParentIDs;
				//if parent exist lets create the HTML for the navigation
				if(ParentItemID)
				{
					//var parentNavigation = document.createElement('parentNavigation');
					//var parentNav = webAbsoluteUrl + '/Lists/' + listName.replace(" ","%20") + '/DispForm.aspx?ID=' + ParentItemID
					var parentNav = webAbsoluteUrl + '/Pages/PMT.aspx?pmtID=' + ParentItemID;
					
					//Grabs the parent of the first item passed, so we can know its name
					getItemWithId(webAbsoluteUrl, listName, ParentItemID,
						function(data) {
							ParentTitle = data.Title;
							if(ParentItemID)
							{
								var innerHTMLTitle = "<a href=" + parentNav +" id=\"parentNavigationPath\"> "+ ParentTitle +"</a>";
								var div = "mxGraph-viewActivityPath" + ParentItemID;
								var innerHTML =   "<div class=\"mxGraph-viewActivityPathClass\" id=\""+div+"\"></div>";
								
								var pathHTML = 	"<div class=\"pathTitleDiv\"> "+ innerHTMLTitle +"</div>";
								var oldHTML = $('#graph-ancestor-path').html();
								
								var totalHTMLPath = "<div class=\"pathTotalDiv\"> "+ pathHTML + innerHTML +"<div class=\"activityBorderBottom\"></div></div>";
								
								$('#graph-ancestor-path').html(totalHTMLPath + oldHTML);
								
								mxGraphActivityViewer(document.getElementById(div), ParentItemID, currentItemId, configURL);
							}
							
							var ParentOfParentItemID = data.ParentIDs;
							if(ParentOfParentItemID)
							{
								//Runs the function for first parent.
								GetActivityPathGraphs(webAbsoluteUrl, listName, ParentItemID, configURL);
							}
						  },
						  function(error) {
							console.log(error);
						  }
						);
				}
				// else
				// {
					// $('#btnShowPath').hide();
				// }
			},
			function(error) {
			console.log(error);
			}
		);

}

function GetRasciTable(webAbsoluteUrl, listName, currentItemId) {
    getFullItemFieldById(webAbsoluteUrl, listName, currentItemId,
			function(data) {
				
				contentTypeID = data.ContentTypeId;
				//
				//Decision - 0x0100B780648F0DD4474886F4D0C3F275B33804
				//Output  - 0x0100B780648F0DD4474886F4D0C3F275B33801
				//Activity 0x0100B780648F0DD4474886F4D0C3F275B33802
				if(contentTypeID.indexOf("0x0100B780648F0DD4474886F4D0C3F275B33804") >= 0 ||
				contentTypeID.indexOf("0x0100B780648F0DD4474886F4D0C3F275B33801") >= 0 ||
				contentTypeID.indexOf("0x0100B780648F0DD4474886F4D0C3F275B33802") >= 0)
				//contentTypeID === "0x0100B780648F0DD4474886F4D0C3F275B33804" 
				//|| contentTypeID === "0x0100B780648F0DD4474886F4D0C3F275B33801" 
				//|| contentTypeID === "0x0100B780648F0DD4474886F4D0C3F275B33802")
				{
					Responsible = data.Responsible;
					//if parent exist lets create the HTML for the navigation
					if(Responsible)
					{
						$('#tabCell1').html(Responsible);
					}
					
					Accountable = data.Accountable;
					//if parent exist lets create the HTML for the navigation
					if(Accountable) 
					{
						$('#tabCell2').html(Accountable);
					}
					
					Support = data.Support;
					//if parent exist lets create the HTML for the navigation
					if(Support)
					{
						$('#tabCell3').html(Support);
					}
					
					Consulted = data.Consulted;
					//if parent exist lets create the HTML for the navigation
					if(Consulted)
					{
						$('#tabCell4').html(Consulted);
					}
					
					Informed = data.Informed;
					//if parent exist lets create the HTML for the navigation
					if(Informed)
					{
						$('#tabCell5').html(Informed);
					}
					
					if(Responsible || Informed || Consulted || Support || Accountable)
					{
						$('#RASCITable').show();
						$('#RasciTableDiv').show();
					}
					else
					{
						$('#RASCITable').hide();
						$('#RasciTableDiv').hide();
						
					}
				}
				else 
				{
					$('#RASCITable').hide();
					$('#RasciTableDiv').hide();
				}
				
			},
			function(error) {
			console.log(error);
			}
		);
}

function getUserEffectivePermissionsOnListTest(webUrl, listTitle, accountName) 
{
	// var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('PermissionTestList')/getItemById(3)/breakroleinheritance";
    
	//checks item permissions
	var endpointUrl = webUrl +  "/_api/web/lists/getbytitle('" + listTitle + "')/getusereffectivepermissions(@user)?@user='" + encodeURIComponent(accountName) + "'";
	
	//check list permissions
	//var endpointUrl = webUrl +  "/_api/web/lists/getbytitle('" + listTitle + "')/getusereffectivepermissions(@user)?@user='" + encodeURIComponent(accountName) + "'";
    return $.getJSON(endpointUrl);
}

function getUserEffectivePermissionsOnList(webUrl,listTitle, accountName) 
{
    var endpointUrl = webUrl +  "/_api/web/lists/getbytitle('" + listTitle + "')/getusereffectivepermissions(@u)?@u='" + encodeURIComponent(accountName) + "'";
    return $.getJSON(endpointUrl);
}

function getListUserEffectivePermissions(webUrl, listTitle, itemId, accountName) 
{
	// var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('PermissionTestList')/getItemById(3)/breakroleinheritance";
    
	//checks item permissions
	var endpointUrl = webUrl +  "/_api/web/lists/getbytitle('" + listTitle + "')/items('" + itemId + "')/getusereffectivepermissions(@user)?@user='" + encodeURIComponent(accountName) + "'";
	
	//check list permissions
	//var endpointUrl = webUrl +  "/_api/web/lists/getbytitle('" + listTitle + "')/getusereffectivepermissions(@user)?@user='" + encodeURIComponent(accountName) + "'";
    return $.getJSON(endpointUrl);
}

function parseBasePermissions(value)
{
    var permissions = new SP.BasePermissions();
    permissions.initPropertiesFromJson(value);
    var permLevels = [];
    for(var permLevelName in SP.PermissionKind.prototype) {
        if (SP.PermissionKind.hasOwnProperty(permLevelName)) {
            var permLevel = SP.PermissionKind.parse(permLevelName);
            if(permissions.has(permLevel)){
                  permLevels.push(permLevelName);
            }
        }     
    }
    return permLevels;   
} 


//Get recursive parent items for given item
function GetTableOfContentRecursive(webAbsoluteUrl,listName) {
										   // 0x0100B780648F0DD4474886F4D0C3F275B33802 - activity
	//var filter = "startswith(ContentTypeId,'0x0100B780648F0DD4474886F4D0C3F275B338')"; //filter for 'Process Item' CT
	// var filter = "ParentIDs"; //filter for 'Process Item' CT
	var pList = $('.processList');
	var ItemID;
	var viewFields = "ID,Title,ContentType,ParentIDs";
	var filter = "";
	//Get Top "Process Item" items
    
	var getTableOfContentItems = getAllTableOfContentItems(webAbsoluteUrl,
						listName,
						"ID,Title,ContentType",
						"", //filter for Swimlane/role based on actor CT
						200, //rowlimit
						"Title");
						
	getTableOfContentItems.done(function (listItems, status) {
		$.each(listItems.d.results, function(i) {
			ItemID = listItems.d.results[i].ID;
		
			// write TOP Process Item
			var div = $('<div/>')
				.addClass('parent0 div-' +ItemID)
				.appendTo(pList);
			var aaa = $('<a/>')
				.addClass('ui-all')
				.attr('href', webAbsoluteUrl + "/Pages/PMT.aspx?pmtID="+ listItems.d.results[i].ID)
				.text(listItems.d.results[i].Title + " (" + listItems.d.results[i].ContentType.Name +")")
				.appendTo(div);
				
				var br = $('<br/>').appendTo(div);
				
				//----------------------------
				//----------------------------
				// Get the list item that corresponds to the uploaded file.
					getAllTableOfContentSubItems(webAbsoluteUrl, listName, viewFields, filter, ItemID, 1)
				//----------------------------
				//----------------------------
		});
	}); 
	getTableOfContentItems.fail(onError);
}

function getAllTableOfContentItems(webAbsoluteUrl, listName, viewFields, filter, rowlimit, orderbyfield, success, error) {
	var queryFilter = "&$filter=";
	if(filter === "")
	{
		queryFilter = "";
	}
	else
	{
		queryFilter += filter;
	}

	// Send the request and return the response.
	return $.ajax({
		// url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$filter=" + filter,
		// url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$select=" + viewFields + "&$filter=ParentIDs eq null",
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$select=" + viewFields + "&$expand=ContentType" + queryFilter + "&$filter=ParentIDs eq null" ,
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		}
	});
}

function getAllTableOfContentSubItems(webAbsoluteUrl, listName, viewFields, filter, ItemID, length) {
	
	if(length !== 0 )
	{
		var getItem = getListItems(webAbsoluteUrl, listName, viewFields, filter, ItemID);
		getItem.done(function (listItems, status) {
				
				
					$.each(listItems.d.results, function(i) {
						subItemID = listItems.d.results[i].ID;
						ParentID = listItems.d.results[i].ParentIDs;
						
						// write TOP Process Item
						var div = $('<div/>')
							.addClass('parent1 div-' +subItemID)
							.appendTo('.div-' +ParentID);
						var aaa = $('<a/>')
							.addClass('ui-all')
							.attr('href', webAbsoluteUrl + "/Pages/PMT.aspx?pmtID="+ listItems.d.results[i].ID)
							.text(listItems.d.results[i].Title + " (" + listItems.d.results[i].ContentType.Name +")")
							.appendTo(div);
						
						getAllTableOfContentSubItems(webAbsoluteUrl, listName, viewFields, filter, subItemID, listItems.d.results.length);
					});
				
				
		}); 
		getItem.fail(onError);
	}
	else
		return;
}

// Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
function getListItems(webAbsoluteUrl, listName, viewFields, filter, ItemID) {

	var queryFilter = "&$filter=";
	if(filter === "")
	{
		queryFilter = "";
	}
	else
	{
		queryFilter += filter;
	}
	
	// Send the request and return the response.
	return $.ajax({
		// url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$filter=" + filter,
		// url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$select=" + viewFields + "&$filter=ParentIDs eq null",
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items?$select=" + viewFields + "&$expand=ContentType" + queryFilter + "&$filter=ParentIDs eq "+ ItemID,
		type: "GET",
		contentType: "application/json;odata=verbose",
		headers: {
			"Accept": "application/json;odata=verbose"
		}
	});
}


function onError(error) {
    alert(error.responseText);
}