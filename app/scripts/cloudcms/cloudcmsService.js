(function () {
    'use strict';
    var Gitana = require("gitana");
    var fs = require("fs");

    var gitanaConfig = JSON.parse("" + fs.readFileSync("./gitana.json"));
    var branchName = "master";
    
    // debug only when using charles proxy ssl proxy when intercepting cloudcms api calls:
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    
    angular.module('app')
        .service('cloudCmsService', ['$q', CloudCmsService]);
    
    function CloudCmsService($q) {
        var connection = null;

        return {
            connect: connect,
            getNodes: getNodesById,
            queryNodes: queryNodes
            // ,
            // createNodes: createNodes,
            // deleteNodes: deleteNodes,
            // updateNodes: updateNodes
        };
        
        function getConnection(callback) {
            if (connection)
            {
                callback(connection);
                return;
            }

            connect(gitanaConfig, branchName).then(function (resultArray) {
                // queryNodes().then(function(){
                //     console.log("queried for nodes: ");
                // });
                return callback(resultArray[0]);
            });
        }

        function connect(gitanaConfig, branchId) {
            var deferred = $q.defer();
            // var gitanaConfig = JSON.parse("" + fs.readFileSync("../gitana.json"));
            Gitana.connect(gitanaConfig, function(err) {
                if (err) {
                    console.log("Failed to connect: " + JSON.stringify(err));
                    deferred.reject(err);
                    return;
                }

                this.datastore("content").trap(function(err) {
                    console.log("Failed to retrieve datastore: " + JSON.stringify(err));
                    deferred.reject(err);
                    return;

                }).readBranch(branchId || "master").trap(function(err) {
                    console.log("Failed to retrieve branch: " + JSON.stringify(err));
                    deferred.reject(err);
                    return;

                }).then(function () {
                    console.log("Connected: " + JSON.stringify(this));
                    connection = this;
                    deferred.resolve([connection]);
                    return;
                })
            });
            
            return deferred.promise;
        }
        
        function getNodesById(iDs) {
            var deferred = $q.defer();
            var query = {};

            if (Gitana.isArray(iDs))
            {
                query["_doc"] = {
                    "$in": iDs
                }
            }
            else
            {
                query["_doc"] = iDs;
            }

            connection.queryNodes(query, {"limit": 100}, function (err, rows) {
                if (err) deferred.reject(err);
                deferred.resolve(rows);
            });
            
            return deferred.promise;
        }
        
        function _queryNodes(query) {
            var deferred = $q.defer();
            query = query || {"_type": "n:node"};

            getConnection(function() {
                connection.queryNodes(query, {"limit": 100}, function (err, nodes) {
                    if (err) 
                    {
                        deferred.reject(err);
                        return;
                    }

                    deferred.resolve(nodes);
                    return;
                });
            });

            return deferred.promise;
        }

        function queryNodes(query) {
            var nodes = [];
            var deferred = $q.defer();
            query = query || {"_type": "n:node"};

            getConnection(function(connection) {
                Chain(connection).trap(function(err) {
                    deferred.reject(err);
                    return;
                }).queryNodes(query, {"limit": 100}).then(function() {
                    nodes = this;
                    console.log("queryNodes result " + JSON.stringify(nodes));
                    deferred.resolve(nodes);
                    return;
                });
            });
        }
    }
})();