module.exports = {
  cypher: function(query,params,cb) {
var r=require("request");
		var username = 'fhgraph';
		var	password = '9yPmYE8RU4QRDGkQER0V';
		var txUrl = "http://" + username + ":" + password + "@fhgraph.sb05.stations.graphenedb.com:24789/db/data/transaction/commit";
			r.post({uri:txUrl,
							json:{statements:[{statement:query,parameters:params}]}},
						 function(err,res) { cb(err,res.body)})
		}
};