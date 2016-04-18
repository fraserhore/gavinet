//Reference: 
//http://www.onextrapixel.com/2012/12/10/how-to-create-a-custom-file-input-with-jquery-css3-and-php/

//----------------------------------
// Upload the file.
// You can upload files up to 2 GB with the REST API.
function uploadFile(file,status) {

    // Define the folder path for this example.
    var serverRelativeUrlToFolder = webServerRelativeUrl + '/Process Resources';

    // Get test values from the file input and text input page controls.
    var fileInput = file;//jQuery('#getFile');
	var fileInputName = file.name;
	
    // Get the server URL.
    var serverUrl = _spPageContextInfo.webAbsoluteUrl,
	currentItemId = parseInt(GetUrlKeyValue('ID'));
    
	// "https://gavinet.sharepoint.com/sites/km/pmt/_api/Web/GetFileByServerRelativeUrl('/sites/km/pmt/Process%20Resources/WelcomeFax.tif')/ListItemAllFields"
	var urlToCheck = webAbsoluteUrl + "/_api/Web/GetFileByServerRelativeUrl('" + serverRelativeUrlToFolder +"/"+ fileInputName + "')/ListItemAllFields";
	
				
	var oldFile = getListItem(urlToCheck);
	
	//File already exists
	oldFile.done(function (listItem, status, xhr) {

		var ParentProcessID  = listItem.d.ParentProcessID;
		
		if(ParentProcessID !== null)
		{
			// Current item id dont exist in group, lets group it
			if (ParentProcessID.indexOf(currentItemId) < 0)
			{
				ParentProcessID = ParentProcessID + ";" + currentItemId;
			}
		}
		
		// Change the group of the list item if already exists.
		var changeItem = updateListItemGroup(listItem.d.__metadata, ParentProcessID);
		changeItem.done(function (data, status, xhr) {
				$('#resourcesList').html("");
				GetResourcesForCurrentItem(webAbsoluteUrl,'Process Resources', currentItemId);
				$("#statusbar").hide();
				alert('File '+fileInputName+' existed already! It has been grouped.');
				$('#dragandrophandler').css({"border-color": "transparent", 
													 "border-width":"0px", 
													 "border-style":"none"});
		});
		
	}); 
	
	//New file
	oldFile.fail(function (data, status, xhr) {
		// Initiate method calls using jQuery promises.
		// Get the local file as an array buffer.
		var getFile = getFileBuffer();
		getFile.done(function (arrayBuffer) {
			
			// Add the file to the SharePoint folder.
			var addFile = addFileToFolder(arrayBuffer);
			addFile.done(function (file, status, xhr) {
				
				
				
				// Get the list item that corresponds to the uploaded file.
				var getItem = getListItem(file.d.ListItemAllFields.__deferred.uri);
				getItem.done(function (listItem, status, xhr) {

					// Change the display name and title of the list item.
					var changeItem = updateListItem(listItem.d.__metadata);
					changeItem.done(function (data, status, xhr) {
						
						
						//status.setAbort(xhr);
						//Lets reload the resources.
						$('#resourcesList').html("");
						GetResourcesForCurrentItem(webAbsoluteUrl,'Process Resources', currentItemId);
						$("#statusbar").hide();
						$('#dragandrophandler').css({"border-color": "transparent", 
													 "border-width":"0px", 
													 "border-style":"none"});
						
					});
					changeItem.fail(onError);
				}); 
				getItem.fail(onError);
			});
			addFile.fail(onError);
		});
		getFile.fail(onError);
	});
				

	function getfilebyserverrelativeurl(serverUrl, serverRelativeUrlToFolder, fileInputName) {

		// Construct the endpoint.
        var fileCollectionEndpoint = String.format(
                "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
                "/add(overwrite=true, url='{2}')",
                serverUrl, serverRelativeUrlToFolder, fileInputName);
				
        // Send the request and return the response.
        return jQuery.ajax({
            url: fileCollectionEndpoint,
            type: "GET",
            headers: { "accept": "application/json;odata=verbose" }
        });
    }
   

	// Get the local file as an array buffer.
    function getFileBuffer() {
        var deferred = jQuery.Deferred();
        var reader = new FileReader();
        reader.onloadend = function (e) {
            deferred.resolve(e.target.result);
        }
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        }
        reader.readAsArrayBuffer(fileInput);
        return deferred.promise();
    }

    // Add the file to the file collection in the Shared Documents folder.
    function addFileToFolder(arrayBuffer) {

        var fileName = fileInput.name;

        // Construct the endpoint.
        var fileCollectionEndpoint = String.format(
                "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
                "/add(overwrite=true, url='{2}')",
                serverUrl, serverRelativeUrlToFolder, fileName);

        // Send the request and return the response.
        // This call returns the SharePoint file.
		
		
		var jqXHR=$.ajax({
        // return jQuery.ajax({
					 xhr: function() {
					 var xhrobj = $.ajaxSettings.xhr();
					 if (xhrobj.upload) {
							 xhrobj.upload.addEventListener('progress', function(event) {
								 var percent = 0;
								 var position = event.loaded || event.position;
								 var total = event.total;
								 if (event.lengthComputable) {
									 percent = Math.ceil(position / total * 100);
								 }
								 //Set progress
								 status.setProgress(percent);
							 }, false);
					 }
					 return xhrobj;
					 },
            url: fileCollectionEndpoint,
            type: "POST",
            data: arrayBuffer,
            processData: false,
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-length": arrayBuffer.byteLength
            }
        });
		
		//status.setAbort(jqXHR);
		
		return jqXHR;
    }

    // Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
    function getListItem(fileListItemUri) {

        // Send the request and return the response.
        return jQuery.ajax({
            url: fileListItemUri,
            type: "GET",
            headers: { "accept": "application/json;odata=verbose" }
        });
    }

    // Change the display name and title of the list item.
    function updateListItem(itemMetadata) {

        // Define the list item changes. Use the FileLeafRef property to change the display name. 
        // For simplicity, also use the name as the title. 
        // The example gets the list item type from the item's metadata, but you can also get it from the
        // ListItemEntityTypeFullName property of the list.
        var body = String.format("{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}','ParentProcessID':'{3}'}}",
            itemMetadata.type, fileInputName, fileInputName, currentItemId);

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
	
	// Change the display name and title of the list item.
    function updateListItemGroup(itemMetadata, newGroup) {

        // Define the list item changes. Use the FileLeafRef property to change the display name. 
        // For simplicity, also use the name as the title. 
        // The example gets the list item type from the item's metadata, but you can also get it from the
        // ListItemEntityTypeFullName property of the list.
        var body = String.format("{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}','ParentProcessID':'{3}'}}",
            itemMetadata.type, fileInputName, fileInputName,newGroup);

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
}

function sendFileToServer(formData,status){
    var uploadURL ="http://hayageek.com/examples/jquery/drag-drop-file-upload/upload.php"; //Upload URL
    var extraData ={}; //Extra Data.
    var jqXHR=$.ajax({
            xhr: function() {
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload) {
                    xhrobj.upload.addEventListener('progress', function(event) {
                        var percent = 0;
                        var position = event.loaded || event.position;
                        var total = event.total;
                        if (event.lengthComputable) {
                            percent = Math.ceil(position / total * 100);
                        }
                        //Set progress
                        status.setProgress(percent);
                    }, false);
                }
            return xhrobj;
        },
    url: uploadURL,
    type: "POST",
    contentType:false,
    processData: false,
        cache: false,
        data: formData,
        success: function(data){
            status.setProgress(100);
 
            $("#status1").append("File upload Done<br>");         
        }
    }); 
 
    status.setAbort(jqXHR);
}
 
var rowCount=0;

function createStatusbar(obj){
     rowCount++;
     var row="odd";
     if(rowCount %2 ==0) row ="even";
     this.statusbar = $("<div id='statusbar' class='statusbar "+row+"'></div>");
     this.filename = $("<div class='filename'></div>").appendTo(this.statusbar);
     this.size = $("<div class='filesize'></div>").appendTo(this.statusbar);
     this.progressBar = $("<div class='progressBar'><div></div></div>").appendTo(this.statusbar);
     //this.abort = $("<div class='abort'></div>").appendTo(this.statusbar);
	 //this.abort.show();
     obj.after(this.statusbar);
 
    this.setFileNameSize = function(name,size)
    {
        var sizeStr="";
        var sizeKB = size/1024;
        if(parseInt(sizeKB) > 1024)
        {
            var sizeMB = sizeKB/1024;
            sizeStr = sizeMB.toFixed(2)+" MB";
        }
        else
        {
            sizeStr = sizeKB.toFixed(2)+" KB";
        }
 
        this.filename.html(name);
        this.size.html(sizeStr);
    }
    this.setProgress = function(progress)
    {       
		var sb = this.statusbar;
        var progressBarWidth =progress*this.progressBar.width()/ 100;  
        this.progressBar.find('div').animate({ width: progressBarWidth }, 10).html(progress + "% ");
		if(parseInt(progress) >= 100)
		{
			sb.hide();
		}
    }
    this.setAbort = function(jqxhr)
    {
        var sb = this.statusbar;
        this.abort.click(function()
        {
			// jqxhr.abort();
            
			sb.hide();
        });
    }	
}

function handleSingleFileUpload(files,obj){
   
	var fd = new FormData();
	fd.append('file', files);

	var status = new createStatusbar(obj); //Using this we can set progress.
	status.setFileNameSize(files.name,files.size);
	status.setProgress(0);
	uploadFile(files,status);
	//status.setProgress(100);
	//$("#status1").append("File upload Done<br>");
   
}

function handleFileUpload(files,obj){
   for (var i = 0; i < files.length; i++) 
   {
        var fd = new FormData();
        fd.append('file', files[i]);
 
        var status = new createStatusbar(obj); //Using this we can set progress.
        status.setFileNameSize(files[i].name,files[i].size);
		status.setProgress(0);
		uploadFile(files[i],status);
		//status.setProgress(100);
		//$("#status1").append("File upload Done<br>");
   }
}

// Display error messages. 
function onError(error) {
    alert(error.responseText);
}
//----------------------------------

