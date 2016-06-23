"use strict";
var config = require('../config');
var i18n = require('../i18n/localeMessage');
var checkinDAO = require('../dao/checkinDAO');
var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');
var redis = require('../common/redisClient');
module.exports = {
    postCheckIn: function (req, res, next) {
        var checkIn = _.assign(req.body, {
            date: new Date(),
            lat: req.body.location.lat,
            lng: req.body.location.lng,
            name: req.body.location.name,
            salesMan: req.user.id,
            pictures: ((req.body.pictures && req.body.pictures.length > 0) ? req.body.pictures.join(',') : null)
        });
        checkinDAO.insert(_.omit(checkIn, 'location')).then(function (result) {
            checkIn.id = result.insertId;
            redis.set('h:' + req.user.hospitalId + ':u:' + req.user.id + ':checkIn', JSON.stringify(req.body.location));
            redis.incr('h:' + req.user.hospitalId + ':u:' + req.user.id + ':' + moment().format('YYYYMMDD'));
            redis.incr('h:' + req.user.hospitalId + ':u:' + req.user.id + ':' + moment().format('YYYYMM'));
            res.send({ret: 0, data: _.omit(checkIn, ['lat', 'lng', 'name', 'salesMan'])});
        }).then(function (result) {
            checkinDAO.updateCheckInCount(req.user.id);
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getMyCheckIns: function (req, res, next) {
        var uid = req.user.id;
        checkinDAO.findByUid(uid, {from: +req.query.from, size: +req.query.size}).then(function (checkIns) {
            if (!checkIns.length) return res.send({ret: 0, data: []});
            checkIns.forEach(function (checkIn) {
                checkIn.location = {lat: checkIn.lat, lng: checkIn.lng, name: checkIn.name};
                checkIn.pictures = ((checkIn.pictures && checkIn.pictures.length > 0) ? checkIn.pictures.split(',') : null);
                delete checkIn.lat;
                delete checkIn.lng;
                delete checkIn.name;
                delete checkIn.salesMan;
            });
            res.send({ret: 0, data: checkIns});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        })
        return next();
    }
}
