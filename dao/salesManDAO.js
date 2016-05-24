"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    findByUserName: function (userName) {
        return db.query(sqlMapping.salesMan.findByUserName, userName);
    },
    updatePassword: function (password, userName) {
        return db.query(sqlMapping.salesMan.updatePassword, [password, userName]);
    },
    update: function(salesMan) {
        return db.query(sqlMapping.salesMan.update, [salesMan, salesMan.id]);
    },
    findPerformances: function(salesMan) {
        return db.query(sqlMapping.performance.findPerformances, [salesMan]);

    }
}
