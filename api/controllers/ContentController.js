/**
 * @module          controllers/ContentController
 * @description     Server-side logic for managing content
 * @author          Fraser Hore
 * @requires        module:neo4j
 * @help            :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// Require the neo4j graph database connector
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase({
    // Support specifying database info via environment variables,
    // but assume Neo4j installation defaults.
    // url: process.env['NEO4J_URL'] || process.env['GRAPHENEDB_URL'] || 'http://neo4j:neo4j@localhost:7474',
    //auth: process.env['NEO4J_AUTH'],
    //url: 'http://gavigraph.sb06.stations.graphenedb.com:24789',
    //auth: 'GaviGraph:DNWxlYkxIFzktTxSDGGS'
    url: 'http://146.185.147.45:7474',
    auth: 'neo4j:gavinet-graph'
});
var request = require("request");

module.exports = {

    /**
     * ContentController.view()
     */
    view: function(req, res) {
        var params = {
            "id": parseInt(req.param('id')) || 0,
            "lang": parseInt(req.param('lang')) || "en-gb"
        };
        // Set the appropriate match query depending on whether request is by validity date, version name, or latest (default)
        // TODO: Add version number
        var versionMatch = "";
        if(req.param('versionName')) {
            var versionName = req.param('versionName');
            versionMatch = " AND version.name = " + versionName;
        } else if(req.param('versionValidityDate')) {
            var versionValidityDate = parseInt(req.param('versionValidityDate'));
            versionMatch = " AND version.from <= " + versionValidityDate + " AND version.to >= " + versionValidityDate;
        } else {
            versionMatch = " AND version.to = 9223372036854775807";
        }
        var query =   'MATCH (identityNode)-[version:VERSION]->(versionNode), (authorNode)-[created:CREATED]->(identityNode)'
                    +' WHERE id(identityNode) = {id} AND version.lang = "en-gb"'
                    +  versionMatch
                    +' RETURN identityNode, version, versionNode, authorNode';
        var cb = function(err, data) {
            //console.log(data);
            if(err) {
                console.log(err);
            } else {
                var identityNode = data[0].identityNode,
                    versionNode = data[0].versionNode,
                    authorNode = data[0].authorNode,
                    viewTemplate = module.exports.getViewTemplate(identityNode, versionNode, authorNode) || "full";
                return res.view(viewTemplate, data[0]);
            }
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    /** Get child content objects */
    getContent: function(req, res) {

        var params = {
            "id": parseInt(req.param('id')) || 0,
            "lang": parseInt(req.param('lang')) || "en-gb"
        };

        var versionMatch = "";

        if(req.param('versionName')) {
            var versionName = req.param('versionName');
            versionMatch = " AND version.name = " + versionName;
        } else if(req.param('versionValidityDate')) {
            var versionValidityDate = parseInt(req.param('versionValidityDate'));
            versionMatch = " AND version.from <= " + versionValidityDate + " AND version.to >= " + versionValidityDate;
        } else {
            versionMatch = " AND version.to = 9223372036854775807";
        }
        //console.log(versionMatch);
        var query =   'MATCH (identityNode)-[version:VERSION]->(versionNode), (authorNode)-[created:CREATED]->(identityNode)'
                    +' WHERE id(identityNode) = {id} AND version.lang = {lang}'
                    +  versionMatch
                    +' RETURN identityNode, version, versionNode, authorNode';

        var cb = function(err, data) {
            //console.log(data);
            return res.json(data[0]);
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    /** Get child content objects */
    getChildren: function(req, res) {
        var params = {
            "id": parseInt(req.param('id')),
            "lang": parseInt(req.param('lang')) || "en-gb"
        };
        var versionMatch = "";

        if(req.param('versionName')) {
            var versionName = req.param('versionName');
            versionMatch = " AND version.name = " + versionName;
        } else if(req.param('versionValidityDate')) {
            var versionValidityDate = parseInt(req.param('versionValidityDate'));
            versionMatch = " AND version.from <= " + versionValidityDate + " AND version.to >= " + versionValidityDate;
        } else {
            versionMatch = " AND version.to = 9223372036854775807";
        }
        var query =   'MATCH (parentNode)-->(identityNode)-[version:VERSION]->(versionNode), (authorNode)-[created:CREATED]->(identityNode)'
                    +' WHERE id(parentNode) = {id} AND version.lang = {lang}'
                    +  versionMatch
                    +' RETURN identityNode, version, versionNode, authorNode';

        var cb = function(err, data) {
            //console.log(data);
            return res.json(data);
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    /** Get related content objects 
    * @param {object} req - HTTP request object
    * @param {object} res - HTTP response object
    * @param {object} req.id - Node ID of the content object for which to get related content objects
    */
    getRelated: function(req, res) {
        var query =  'MATCH (a)-[r]-(b), (b)-[:VERSION {to:9223372036854775807}]->(c)'
                    +' WHERE id(a) = {id} AND NOT (a)-[r:VERSION|:CREATED|:CONTAINS]->(b) AND NOT (a)<-[r:VERSION|:CREATED|:CONTAINS]-(b)'
                    +' RETURN b as identityNode, r as relationship, c as versionNode'
        var params = {
            "id": parseInt(req.param('id'))
        };
        var cb = function(err, data) {
            return res.json(data);
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    /** Get content types */
    getContentTypes: function(req, res) {

        var query =  'MATCH (a:ContentType)-[:VERSION]->(b:Version)'
                    +' RETURN a as contentTypeIdentity, b as contentTypeVersion'
        var params = {
            "id": ''
        };
        var cb = function(err, data) {
            //console.log(data);
            return res.json(data);
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    /** Get parent */
    getParent: function(req, res) {

        var query =  'MATCH (a)<-[r:CONTAINS {to:9223372036854775807}]-(parentNode)'
                    +' WHERE id(a) = {id}'
                    +' RETURN parentNode'
        var params = {
            "id": parseInt(req.param('id'))
        };
        var cb = function(err, data) {
            //console.log(data);
            return res.json(data[0]);
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    /** Get siblings */
    getSiblings: function(req, res) {

        var query =  'MATCH (a)<-[r:CONTAINS {to:9223372036854775807}]-(parent)'
                    +' WHERE id(a) = {id}'
                    +' WITH parent'
                    +' MATCH (parent)-[:CONTAINS {to:9223372036854775807}]->(c)'
                    +' RETURN c as siblingNode'
        var params = {
            "id": parseInt(req.param('id'))
        };
        var cb = function(err, data) {
            //console.log(data);
            return res.json(data);
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    /** Get content type schema */
    getContentTypeSchema: function(req, res) {

        var query =     'MATCH (contentTypeIdentity:ContentType)-[:VERSION]->(contentTypeVersion:Version {identifier:{contenttype}}),'
                    + ' (contentTypeIdentity)-[:PROPERTY|RELATIONSHIP|CONTAINS]->(propertyIdentity)-[:VERSION]->(propertyVersion:Version)'
                    + ' RETURN contentTypeIdentity, contentTypeVersion, collect(propertyIdentity) as propertyIdentities, collect(propertyVersion) as propertyVersions'
        var params = {
            "contenttype": req.param('contenttype')
        };
        //console.log(req.param('contenttype'));
        var cb = function(err, data) {
            //console.log(data);
            if(!data) return;
            if(!data[0]) return;
            //console.log(err);

            var contentTypeVersionProperties = data[0].contentTypeVersion.properties,
                propertyVersions = data[0].propertyVersions,
                schema = {};

            //schema["$schema"] = "http://json-schema.org/draft-04/schema#";
            schema = data[0].contentTypeVersion.properties;
            schema["properties"] = {};

            //console.log[schema];

            for (var i = 0; i < propertyVersions.length; i++) {
                schema.properties[propertyVersions[i].properties.identifier] = propertyVersions[i].properties;
            };
            return res.json(schema);
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },


    /**
     * Create new content obect (identityNode and versionNode)
     */
    create: function(req, res) {
        var relationships = req.body.relationships,
            matchRelated = '',
            whereRelated = '',
            createRelationships = '';

        if(relationships) {
            for (var i = relationships.length - 1; i >= 0; i--) {
                console.log(relationships[i]);
                var relationshipName = relationships[i].relationshipName.toUpperCase(),
                    direction = relationships[i].direction,
                    inboundSymbol = direction === 'inbound' ? '<' : '',
                    outboundSymbol = direction === 'outbound' ? '>' : '',
                    relatedNode = relationships[i].relatedNode,
                    relatedNodeId = relatedNode._id,
                    relatedIdentifier = 'node' + relatedNodeId;

                matchRelated += ', (' + relatedIdentifier + ')';
                whereRelated += ' AND id(' + relatedIdentifier + ') = ' + relatedNodeId;
                createRelationships += ' CREATE (childidentity)' + inboundSymbol + '-[:' + relationshipName + ']-' + outboundSymbol + '(' + relatedIdentifier + ')';

                //console.log(matchRelated);
            };
        }

        var query =   'MATCH (parent), (author)' + matchRelated
                    +' WHERE id(parent)={parentId} AND id(author)={authorId}' + whereRelated
                    +' CREATE parent-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->'
                    +       '(childidentity:Identity:ContentObject {contentType:{contenttype}})'
                    +       '-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->'
                    +       '(childversion:Version)'
                    +' CREATE author-[:CREATED {timestamp:timestamp()}]->childidentity'
                    +' CREATE author-[:CREATED {timestamp:timestamp()}]->childversion'
                    + createRelationships
                    +' SET childidentity:' + this.pascalize(req.body.contenttype) 
                    +' SET childversion = {properties}'
                    +' SET childidentity.name = ' + req.body.identityNamePattern
                    +' RETURN parent,childidentity,childversion';
        var params = {
            "parentId": parseInt(req.body.parentId),
            "authorId": parseInt(req.body.authorId),
            "contenttype": req.body.contenttype,
            "identityNamePattern": req.body.identityNamePattern,
            "properties": req.body.properties
        };
        var cb = function(err, data) {
            //console.log(err);
            console.log(data);
            return res.json(data);
        };
        db.cypher({
            query: query, 
            params: params
        }, cb);
    },

    /**
     * Create new relationship
     */
    createRelationship: function(req, res) {
        //console.log(req.body);
        var query =   'MATCH (from), (to)'
                    +' WHERE id(from)={fromId} AND id(to)={toId}'
                    +' CREATE from-[r:' 
                    + req.body.relationshipName.split(' ').join('_').toUpperCase()
                    + ' {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->to'
                    +' RETURN from, r, to';
        var params = {
            "fromId": req.body.direction === 'Inbound' ? parseInt(req.body.relatedNodeId) : parseInt(req.body.referenceNodeId),
            "relationshipName": req.body.relationshipName.split(' ').join('_').toUpperCase(),
            "toId": req.body.direction === 'Outbound' ? parseInt(req.body.relatedNodeId) : parseInt(req.body.referenceNodeId)
        };
        var cb = function(err, data) {
            //console.log(err);
            //console.log(data);
            return res.json(data);
        };
        db.cypher({
            query: query, 
            params: params
        }, cb);
    },

    /**
    * update content object (new versionNode)
    */
    update: function(req, res) {
        
        var query = 
            // UPDATE (CONTENT) - Add a Version node
              ' MATCH (identitynode)-[currentversionrelationship:VERSION {to:9223372036854775807}]->(currentversion)'
            + ' WHERE id(identitynode) = {id} AND currentversionrelationship.lang = {lang}'
            // Update the current version relationship to end validity
            + ' SET currentversionrelationship.to = timestamp()'
            // Create the new version relationship and node
            + ' CREATE identitynode-[newversionrelationship:VERSION {from:timestamp(), to:9223372036854775807}]->(newversion:Version)'
            // Set new version relationship properties
            + ' SET newversionrelationship.versionNumber = toInt(currentversionrelationship.versionNumber) + 1'
            + ' SET newversionrelationship.versionName = {versionName}'
            + ' SET newversionrelationship.lang = currentversionrelationship.lang'
            // Set new version node properties
            + ' SET newversion = {properties}'
            //... update more newversion properties
            // Update the identity node
            + ' SET identitynode.name = ' + req.body.identityNamePattern
            // Create a previous relationship from the new version to the previous version
            + ' CREATE newversion-[:PREVIOUS]->currentversion'
            // Return the affected nodes
            + ' RETURN identitynode,currentversion,newversion';
        var params = {
            "id": parseInt(req.body.id),
            "lang": req.body.lang,
            "versionName": req.body.versionName,
            "identityNamePattern": req.body.identityNamePattern,
            "properties": req.body.properties
        };
        var cb = function(err, data) {
            console.log(err);
            console.log(data);
            return res.json(data);
        };
        db.cypher({
            query: query, 
            params: params
        }, cb);
    },

    /**
     * Delete a content object (end version validity)
     */
    delete: function(req, res) {

        var query =  'MATCH (child)<-[relationship:CONTAINS {to:9223372036854775807}]-(parent)'
                    +' WHERE id(child) = {id}'
                    +' SET relationship.to = timestamp()'
                    +' RETURN parent, child';
        var params = {
            "id": parseInt(req.param('id'))
        };
        
        var cb = function(err, data) {
            //console.log(err);
            //console.log(data);
            return res.json(data);
        };
        db.cypher({
            query: query, 
            params: params
        }, cb);
    },

    /** Move a content object (end validity of old location relationship and create new location relationship) */
    move: function(req, res) {

    },

    /** Add content object to an additional location (create new location relationship) */
    addLocation: function(req, res) {

    },

    /** Get template override */
    0 function(identityNode, versionNode, authorNode) {
        var query =  'MATCH (a:Overrides)-[:CONTAINS]->(override:Override)'
                    +' RETURN override'
        var params = {
            "id": ''
        };
        var cb = function(err, data) {
            //console.log(data);
            return "full"//res.json(data);
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    getViewTemplateOverrides: function() {

    },

    // Utilies
    separateWords: function(string, options) {
        options = options || {};
        var separator = options.separator || '_';
        var split = options.split || /(?=[A-Z])/;

        return string.split(split).join(separator);
    },

    camelize: function(string) {
        if (this._isNumerical(string)) {
          return string;
        }
        string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
          return chr ? chr.toUpperCase() : '';
        });
        // Ensure 1st char is always lowercase
        return string.substr(0, 1).toLowerCase() + string.substr(1);
    },

    pascalize: function(string) {
        var camelized = this.camelize(string);
        // Ensure 1st char is always uppercase
        return camelized.substr(0, 1).toUpperCase() + camelized.substr(1);
    },

    decamelize: function(string, options) {
        return this.separateWords(string, options).toLowerCase();
    },

    // Performant way to determine if obj coerces to a number
    _isNumerical: function(obj) {
        obj = obj - 0;
        return obj === obj;
    }

    // var isDefined = function(value, path) {
    //     path.split('.').forEach(function(key) {
    //         value = value && value[key];
    //     });
    //     return (typeof value != 'undefined' && value !== null);
    // };

};
