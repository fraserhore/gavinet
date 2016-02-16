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
    url: 'http://gavigraph.sb06.stations.graphenedb.com:24789',
    auth: 'GaviGraph:DNWxlYkxIFzktTxSDGGS'
});
var request = require("request");

module.exports = {

    /**
     * `ContentController.view()`
     */
    view: function(req, res) {

        var query = 'MATCH (a)-[version:VERSION]->(b) WHERE id(a) = {id} AND version.to = 9223372036854775807 AND version.lang = "en-gb" RETURN a as identityNode, version as version, b as versionNode'
        var params = {
            "id": parseInt(req.param('id'))
        };
        var cb = function(err, data) {
            return res.view("full", data[0]);
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    getChildren: function(req, res) {

        var query =  'MATCH (a)-[r:CONTAINS {to:9223372036854775807}]->(b)-[:VERSION {to:9223372036854775807}]->(c)'
                    +' WHERE id(a) = {id}'
                    +' RETURN b as identityNode, c as versionNode'
        var params = {
            "id": parseInt(req.param('id'))
        };
        var cb = function(err, data) {
            console.log(data);
            return res.json(data);
        }
        db.cypher({
            query: query,
            params: params
        }, cb);
    },

    getContentTypes: function(req, res) {

        var query =  'MATCH (a:ContentType)'
                    +' RETURN a as contentType'
        var params = {
            "id": ''
        };
        var cb = function(err, data) {
            console.log(data);
            return res.json(data);
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

        var query = 'MATCH (parent) WHERE id(parent)={parentId} CREATE parent-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(childidentity:IdentityNode:ContentObject)-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(childversion:Version) SET childidentity:' + req.body.contenttype + ' SET childversion = {properties} SET childidentity.name = childversion.name RETURN parent,childidentity,childversion';
        var params = {
            "parentId": parseInt(req.body.parentId),
            "contenttype": req.body.contenttype,
            "properties": {
                "name": req.body.name,
                "description": req.body.description
            }
        };
        
        var cb = function(err, data) {
            console.log(err);
            console.log(data);

        };
        db.cypher({
            query: query, 
            params: params
        }, cb);
    }

    // var isDefined = function(value, path) {
    //     path.split('.').forEach(function(key) {
    //         value = value && value[key];
    //     });
    //     return (typeof value != 'undefined' && value !== null);
    // };

};
