/**
 * ContentController
 *
 * @description :: Server-side logic for managing contents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// Require the 
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
     * `ContentController.view()`
     */
    view: function(req, res) {

        var query =   'MATCH (identityNode)-[version:VERSION]->(versionNode), (authorNode)-[created:CREATED]->(identityNode)'
                    +' WHERE id(identityNode) = {id} AND version.to = 9223372036854775807 AND version.lang = "en-gb"'
                    +' RETURN identityNode, version, versionNode, authorNode'

        var params = {
            "id": parseInt(req.param('id'))
        };
        var cb = function(err, data) {
            //console.log(data);
            if(err) {
                console.log(err);
            } else {
                return res.view("full", data[0]);
            }
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    getChildren: function(req, res) {

        var query =  'MATCH (a)-[r {to:9223372036854775807}]->(b)-[:VERSION {to:9223372036854775807}]->(c)'
                    +' WHERE id(a) = {id}'
                    +' RETURN b as identityNode, c as versionNode'
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
     * `ContentController.create()`
     */
    create: function(req, res) {
        console.log(req.body);

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
        
        console.log(query);

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
     * `ContentController.createRelationship()`
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
     * `ContentController.delete()`
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

    // Utilities
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
