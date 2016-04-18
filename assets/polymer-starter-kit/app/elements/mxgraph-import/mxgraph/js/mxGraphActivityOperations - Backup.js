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
					}
				});
			},
			error:  function(data){
				mxLog.debug("Failed to update item " + data);
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
            url: data.__metadata.uri,
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
            }
        });
	},
	function (data) {
		failure("Item deleted failure: " + errorThrown);
		console.log("Failed to deleted item " + itemId + " " + errorStatus + " " + errorThrown);
   });
}

// Delete Operation
// itemId: the id of the item to delete
// listName: The name of the list you want to delete the item from
// siteurl: The url of the site that the list is in.
// success: The function to execute if the call is sucessfull
// failure: The function to execute if the call fails
function deleteListItemOld(itemId, listName, siteUrl, success, failure) {

		var listitemurl = siteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')";
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
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')",
		type: "DELETE",
		contentType: "application/json;odata=verbose",
		headers: requestHeaders,
		success: function(data) {
			//console.log(data.d);
			success(data.d);
		},
		error: function(){
			console.log("Failed to delete item");
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
		url: webAbsoluteUrl + "/_api/Web/Lists/getByTitle('" + listName + "')/items('" + itemId + "')",
		type: "DELETE",
		contentType: "application/json;odata=verbose",
		headers: requestHeaders,
		success: function(){
			alert("Deleted item");
		},
		error: function(){
			alert("Failed to delete item");
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
		error: error
	});
}

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
		error: error
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
		error: error
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
		error: error
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
		error: error
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
    error: error
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
		error: error
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
						if(ParentProcessID.indexOf(currentItemId) >= 0)
						{
							var href = data.results[i].FileRef; //EncodeAbsUrl
							var Title = data.results[i].Title; 
							var ID = data.results[i].Id; 
							
							var buttonEditHtml = "<a title=\"Edit the document properties.\" style=\"float:right; margin-Right:10px;\" href=\""+webAbsoluteUrl+"/"+listName+"/Forms/EditForm.aspx?ID="+ID+"\"><img alt=\"\" style=\"margin-top: -10px;\" src=\""+siteAbsoluteUrl +"/SiteAssets/fh_mxgraph/mxgraph/images/EditDoc.png\" width=\"25\" height=\"25\"></a>";
							
							// onClick="var answer = confirm('Are you sure you want to remove this document from this item?'); if (answer) { UpdateDocumentGroup(" + ID + "," + //currentItemId + "); }"
							
							
							  var buttonDeleteHtml = "<a class=\"LinkDeleteDoc\" title=\"Delete the document, if the document is linked to more process objects, it will only remove from this one.\" onClick=\"UpdateDocumentGroup(" + ID + "," + currentItemId + ",'" + webAbsoluteUrl + "','" + listName + "')\" href=\"#\"><img alt=\"\" style=\"margin-top: -10px;\" src=\""+ siteAbsoluteUrl +"/SiteAssets/fh_mxgraph/mxgraph/images/DeleteDoc.png\"  width=\"25\" height=\"25\"></a>";
							
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
					var parentNav = webAbsoluteUrl + '/Pages/PMT.aspx?ID=' + ParentItemID;
					
					//Grabs the parent of the first item passed, so we can know its name
					getItemWithId(webAbsoluteUrl, listName, ParentItemID,
						function(data) {
							ParentTitle = data.Title;
							if(ParentItemID)
							{
								var innerHTML = "<a href=" + parentNav +" id=\"parentNavigation\"> "+ ParentTitle +"</a>";
								var spliter = "<span style=\"width: 16px; height: 12px; overflow: hidden; display: inline-block; position: relative;\"> <img style=\"left: -109px !important; top: -232px !important; position: absolute;\" alt=\":\" src=\"/_layouts/15/images/spcommon.png?rev=39\"></img></span>";	
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

function GetActivityPathGraphs(webAbsoluteUrl, listName, currentItemId, configURL) {
    getItemWithId(webAbsoluteUrl, listName, currentItemId,
			function(data) {
				ParentItemID = data.ParentIDs;
				//if parent exist lets create the HTML for the navigation
				if(ParentItemID)
				{
					//var parentNavigation = document.createElement('parentNavigation');
					var parentNav = webAbsoluteUrl + '/Lists/' + listName.replace(" ","%20") + '/DispForm.aspx?ID=' + ParentItemID
					
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
				
				//Decision 
				//Output 
				//Activity
				if(contentTypeID === "0x0100B780648F0DD4474886F4D0C3F275B33804000CCACB51C4F08C40B78A82D05EAB45F4" 
				|| contentTypeID === "0x0100B780648F0DD4474886F4D0C3F275B33801004870C90224F9C8418222FC63C8AD478B" 
				|| contentTypeID === "0x0100B780648F0DD4474886F4D0C3F275B33802009299A06F36C5354199F164C35DB1BE0D")
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
					
					if(Responsible && Informed && Consulted && Support && Accountable)
					{
						$('#RASCITable').show();
					}
					else
					{
						$('#RASCITable').hide();
					}
				}
				else 
					$('#RASCITable').hide();
				
				
			},
			function(error) {
			console.log(error);
			}
		);

}

