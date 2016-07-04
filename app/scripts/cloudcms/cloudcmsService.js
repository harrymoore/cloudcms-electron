(function () {
    'use strict';
    var Gitana = require("gitana");

    var connection = null;
    
    angular.module('app')
        .service('cloudCmsService', ['$q', CloudCmsService]);
    
    function CloudCmsService($q) {
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

            connect().then(function (branch) {
                connection = branch;
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

                }).readBranch(branchId || "master").trap(function(err) {
                    console.log("Failed to retrieve branch: " + JSON.stringify(err));
                    deferred.reject(err);

                }).then(function () {
                    console.log("Connected: " + JSON.stringify(this));
                    deferred.resolve(this);                    
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
        
        function queryNodes(query) {
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
                });
            });

            return deferred.promise;
        }
    }
})();