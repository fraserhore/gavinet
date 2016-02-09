/**
 * ContentController
 *
 * @description :: Server-side logic for managing contents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// Rewquie the 
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
        var username = 'GaviGraph';
        var password = 'DNWxlYkxIFzktTxSDGGS';
        var txUrl = "http://" + username + ":" + password + "@gavigraph.sb06.stations.graphenedb.com:24789/db/data/transaction/commit";

        function cypher(query, params, cb) {
            request.post({
                    uri: txUrl,
                    json: {
                        statements: [{
                            statement: query,
                            parameters: params
                        }]
                    }
                },
                function(err, res) {
                    cb(err, res.body)
                })
        }

        var query = 'MATCH (a)-[version:VERSION]->(b) WHERE id(a) = {id} AND version.to = 9223372036854775807 AND version.lang = "en-gb" RETURN a as IdentityNode, version as Version, b as VersionNode'
        var params = {
            "resultDataContents": ["row", "graph"],
            "id": parseInt(req.param('id'))
        }
        var isDefined = function(value, path) {
            path.split('.').forEach(function(key) {
                value = value && value[key];
            });
            return (typeof value != 'undefined' && value !== null);
        };
        var cb = function(err, data) {
            //return res.json(data.results);
            var row = data.results && data.results[0] && data.results[0].data && data.results[0].data[0] && data.results[0].data[0].row,
                object = {};
            object['identityNode'] = row && row[0];
            object['versionNode'] = row && row[2];
            object['layout'] = 'layout';
            return res.view("full", object);
        }
        cypher(query, params, cb);
    },

    /**
     * `ContentController.create()`
     */
    create: function(req, res) {
        var username = 'GaviGraph';
        var password = 'DNWxlYkxIFzktTxSDGGS';
        var txUrl = "http://" + username + ":" + password + "@gavigraph.sb06.stations.graphenedb.com:24789/db/data/transaction/commit";
        console.log(req.body);

        function cypher(query, params, cb) {
            request.post({
                    uri: txUrl,
                    json: {
                        statements: [{
                            statement: query,
                            parameters: params
                        }]
                    }
                },
                function(err, res) {
                    cb(err, res.body)
                })
        }

        var query = 'MATCH (parent) WHERE id(parent)={parentId} CREATE parent-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(childidentity:IdentityNode:ContentObject)-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(childversion:Version) SET childidentity:' + req.body.contenttype + ' SET childversion = {properties} SET childidentity.name = childversion.name RETURN parent,childidentity,childversion';
        var params = {
            "resultDataContents": ["row", "graph"],
            "parentId": parseInt(req.body.parentId),
            "contenttype": req.body.contenttype,
            "properties": {
                "name": req.body.name,
                "description": req.body.description
            }
        };
        var isDefined = function(value, path) {
            path.split('.').forEach(function(key) {
                value = value && value[key];
            });
            return (typeof value != 'undefined' && value !== null);
        };
        var cb = function(err, data) {
            console.log(err);
            console.log(data);

        };
        cypher(query, params, cb);
    }

};
