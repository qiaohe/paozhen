'use strict';
var md5 = require('md5');
console.log(md5('111'));
var restify = require('restify');
var config = require('./config');
var router = require('./common/router');
var auth = require('./common/auth');
var logger = require('./common/logger');
var server = restify.createServer(config.server);
var moment = require('moment');
var hospitalDAO = require('./dao/hospitalDAO');
var redis = require('./common/redisClient');
var util = require('util');
restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');
server.use(restify.CORS());
server.opts(/.*/, function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
    res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    res.send(200);
    return next();
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.dateParser());
server.use(restify.queryParser({
    mapParams: false
}));
server.use(restify.gzipResponse());
server.use(restify.bodyParser());
server.use(logger());
server.use(auth());
router.route(server);
server.on("uncaughtException", function (req, res, route, err) {
    res.send({ret: 1, message: err.message});
});
var Promise = require('bluebird');
hospitalDAO.findHospitalIds().then(function(hospitals){
    console.log(hospitals);
    return Promise.map(hospitals, function (hospital) {
        var id = hospital.id;
        console.log('id:' + id);
         return hospitalDAO.findPeriods(id).then(function (periods) {
            return Promise.map(periods, function (period, index) {
                var key = 'h:' + id + ':p:' + period.id;
                console.log(key);
                return redis.setAsync(key, String.fromCharCode(65 + index))
            }).then(function () {
                console.log('dd');
            });
            //return periods.forEach(function (item, index) {
            //    var key = 'h:' + id + ':p:' + item.id;
            //    return redis.setAsync(key, String.fromCharCode(65 + index))
            //})
        });
    }).then(function () {
        console.log('ddd');
    });

})



server.listen(config.server.port, config.server.host, function () {
    console.log('%s listening at %s', server.name, server.url);
});
