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

        var query =   'MATCH (identityNode)-[version:VERSION]->(versionNode), (authorNode)-[created:CREATED]->(identityNode)'
                    +' WHERE id(identityNode) = {id} AND version.to = 9223372036854775807 AND version.lang = "en-gb"'
                    +' RETURN identityNode, version, versionNode, authorNode'

        var params = {
            "id": parseInt(req.param('id'))
        };
        var cb = function(err, data) {
            //console.log(data);
            return res.view("full", data[0]);
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

    getContentTypes: function(req, res) {

        var query =  'MATCH (a:ContentType)'
                    +' RETURN a as contentType'
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

        var query =  'MATCH (a:ContentType)-[]->(b:Version {identifier:{contentType}})'
                    +' RETURN a as contentType, b as version'
        var params = {
            "contentType": req.param('contentType')
        };
        //console.log(req.param('contentType'));
        var cb = function(err, data) {
            //console.log(data);
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
        console.log(req.body);
        var query =   'MATCH (parent), (author)'
                    +' WHERE id(parent)={parentId} AND id(author)={authorId}'
                    +' CREATE parent-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->'
                    +       '(childidentity:IdentityNode:ContentObject {contentType:{contenttype}})'
                    +       '-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->'
                    +       '(childversion:Version)'
                    +' CREATE author-[:CREATED {timestamp:timestamp()}]->childidentity'
                    +' CREATE author-[:CREATED {timestamp:timestamp()}]->childversion'
                    +' SET childidentity:' + req.body.contenttype 
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
    }

    // var isDefined = function(value, path) {
    //     path.split('.').forEach(function(key) {
    //         value = value && value[key];
    //     });
    //     return (typeof value != 'undefined' && value !== null);
    // };

};
