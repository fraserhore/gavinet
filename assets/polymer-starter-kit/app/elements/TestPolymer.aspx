<!--
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
-->

<!doctype html>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<html lang="" xmlns:mso="urn:schemas-microsoft-com:office:office" xmlns:msdt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882">

<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<head>
  <meta charset="utf-8">
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="generator" content="Polymer Starter Kit" />
  <title>Polymer Starter Kit</title>
  <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

  <!-- Chrome for Android theme color -->
  <meta name="theme-color" content="#303F9F">

  <!-- Web Application Manifest -->
  <link rel="manifest" href="manifest.json">

  <!-- Tile color for Win8 -->
  <meta name="msapplication-TileColor" content="#3372DF">

  <!-- Add to homescreen for Chrome on Android -->
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="application-name" content="Polymer Starter Kit">
  <link rel="icon" sizes="192x192" href="images/touch/chrome-touch-icon-192x192.png">

  <!-- Add to homescreen for Safari on iOS -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="Polymer Starter Kit">
  <link rel="apple-touch-icon" href="images/touch/apple-touch-icon.png">

  <!-- Tile icon for Win8 (144x144) -->
  <meta name="msapplication-TileImage" content="images/touch/ms-touch-icon-144x144-precomposed.png">

  <!-- build:css styles/main.css -->
  <link rel="stylesheet" href="styles/main.css">
  <!-- endbuild-->


  <!-- build:js bower_components/webcomponentsjs/webcomponents-lite.min.js -->
  <script src="bower_components/webcomponentsjs/webcomponents-lite.js"></script>
  <!-- endbuild -->

  <!-- will be replaced with elements/elements.vulcanized.html -->
  <link rel="import" href="elements/elements.html">
  <!-- endreplace-->



<!--[if gte mso 9]><SharePoint:CTFieldRefs runat=server Prefix="mso:" FieldList="FileLeafRef,_dlc_DocId,_dlc_DocIdUrl,_dlc_DocIdPersistId"><xml>
<mso:CustomDocumentProperties>
<mso:_dlc_DocId msdt:dt="string">GAVI-28-1822</mso:_dlc_DocId>
<mso:_dlc_DocIdItemGuid msdt:dt="string">3b5c8a7f-7ca6-4eb9-b403-14c04f79c8ac</mso:_dlc_DocIdItemGuid>
<mso:_dlc_DocIdUrl msdt:dt="string">https://gavinet.sharepoint.com/sites/km/_layouts/15/DocIdRedir.aspx?ID=GAVI-28-1822, GAVI-28-1822</mso:_dlc_DocIdUrl>
</mso:CustomDocumentProperties>
</xml></SharePoint:CTFieldRefs><![endif]-->
</head>

<body unresolved class="fullbleed layout vertical">

  <span id="browser-sync-binding"></span>
  <template is="dom-bind" id="app">

    <paper-header-panel main mode="standard" class="flex">

      <!-- Main Toolbar -->
      <paper-toolbar id="mainToolbar" horizontal layout>
        <paper-icon-button icon="view-module"></paper-icon-button>
        <!-- Application name -->
        <div class="middle paper-font-display2 app-name">My Dashboard</div>
        <!-- Application sub title -->
        <div class="bottom title"></div>

        <span class="flex" flex style="-ms-flex: 1 1 0%;"></span>

        <!-- Toolbar icons -->
        <glossary-lookup glossary-node-id="144"></glossary-lookup>
        <paper-icon-button icon="social:notifications"></paper-icon-button>
        <paper-icon-button icon="help"></paper-icon-button>
        <paper-icon-button icon="settings"></paper-icon-button>
        <img class="logo" src="images/gavi-logo_130x50.png">

      </paper-toolbar>

      <!-- Main Content -->
      <div class="content">

        <gavi-dashboard>

          <gavi-dashboard-panel icon="editor:insert-drive-file" heading="Graph">
            <gavi-graph></gavi-graph>
          </gavi-dashboard-Panel>

          <gavi-dashboard-panel icon="editor:insert-drive-file" heading="Latest Documents">
            <gavi-sp-docs></gavi-sp-docs>
          </gavi-dashboard-Panel>

          <gavi-dashboard-panel icon="device:access-time" heading="Upcoming Meetings">
            <gavi-sp-calendar></gavi-sp-calendar>
          </gavi-dashboard-Panel>

          <gavi-dashboard-panel icon="assignment-turned-in" heading="Current Tasks">
            <gavi-sp-tasks></gavi-sp-tasks>
          </gavi-dashboard-Panel>


        </gavi-dashboard>

      </div>
    </paper-header-panel>

  </template>

  <!-- build:js scripts/app.js -->
  <script src="scripts/app.js"></script>
  <!-- endbuild-->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
  <script>
    $.ajax({
        url: "http://fhgraph.sb05.stations.graphenedb.com:24789/db/data/node/1",
        headers : {
          'Access-Control-Allow-Origin' : '*'
        },
        crossDomain: true,
        accept: "application/json;odata=verbose",
        type:"GET",
        success:function(data,xhr,status)
        {
            console.log(data);
        },
        error:function(xhr,err,msg){
            //console.log(xhr);
            //console.log(err);
            console.log(msg);
        }
    });
  </script>
  <script>
    $.ajax({
        url: "http://fhgraph.sb05.stations.graphenedb.com:24789/db/data/transaction/commit",
        headers : {
          'Authorization' : 'Basic '+window.btoa('fhgraph:9yPmYE8RU4QRDGkQER0V')
        },
        crossDomain: true,
        accept: "application/json; charset=UTF-8",
        contentType:"application/json",
        data:'{"statements" : [{"statement" : "MATCH n  RETURN n"}]}',
        type:"POST",
        success:function(data,xhr,status)
        {
            console.log(data);
        },
        error:function(xhr,err,msg){
            //console.log(xhr);
            //console.log(err);
            //console.log(msg);
        }
    });
  </script>
</body>

</html>
