"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (checkIn) {
        return db.query(sqlMapping.checkin.insert, checkIn);
    },
    findByUid: function (uid, page) {
        return db.query(sqlMapping.checkin.findByUid, [uid, page.from, page.size]);
    },
    updateCheckInCount: function(salesMan){
        return db.query(sqlMapping.salesMan.updateCheckInCount, salesMan);
    }
}
