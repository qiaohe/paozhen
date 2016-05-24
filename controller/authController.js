"use strict";
var md5 = require('md5');
var redis = require('../common/redisClient');
var config = require('../config');
var salesManDAO = require('../dao/salesManDAO');
var i18n = require('../i18n/localeMessage');
var _ = require('lodash');
var moment = require('moment');
var uuid = require('node-uuid');
module.exports = {
    login: function (req, res, next) {
        var userName = (req.body && req.body.username) || (req.query && req.query.username);
        var password = (req.body && req.body.password) || (req.query && req.query.password);
        var user = {};
        salesManDAO.findByUserName(userName).then(function (users) {
            if (!users || !users.length) throw new Error(i18n.get('member.not.exists'));
            user = users[0];
            if (user.password != md5(password)) throw new Error(i18n.get('member.password.error'));
            var token = uuid.v4();
            redis.set(token, JSON.stringify(user));
            redis.expire(token, config.app.tokenExpire);
            user.token = token;
            delete user.password;
            user.gender = config.gender[user.gender];
            redis.getAsync('s:uid:' + user.id + ':token').then(function (reply) {
                redis.del(reply);
                redis.set('s:uid:' + user.id + ':token', token);
            });
            res.send({ret: 0, data: user});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    logout: function (req, res, next) {
        var token = req.headers['x-auth-token'];
        if (!token) return res.send(401, i18n.get('token.not.provided'));
        redis.delAsync(token).then(function () {
            redis.del('s:uid:' + req.user.id + ':token');
            res.send({ret: 0, message: i18n.get('logout.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    resetPwd: function (req, res, next) {
        var that = this;
        var mobile = req.body.username;
        var certCode = req.body.certCode;
        var newPwd = req.body.password;
        redis.getAsync(mobile).then(function (reply) {
            if (!(reply && reply == certCode)) return res.send({ret: 1, message: i18n.get('sms.code.invalid')});
            return salesManDAO.updatePassword(md5(newPwd), mobile).then(function (result) {
                return salesManDAO.findByUserName(mobile);
            }).then(function (users) {
                var token = uuid.v4();
                var user = users[0];
                redis.set(token, JSON.stringify(user));
                redis.expire(token, config.app.tokenExpire);
                user.token = token;
                delete user.password;
                user.gender = config.gender[user.gender];
                res.send({ret: 0, data: user});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    updateMyProfile: function (req, res, next) {
        var salesMan = req.body;
        salesMan.id = req.user.id;
        salesManDAO.update(salesMan).then(function (result) {
            res.send({ret: 0, message: i18n.get('member.update.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },
    getSummary: function (req, res, next) {
        var uid = req.user.id;
        var data = {checkIn: {}};
        salesManDAO.findPerformances(uid).then(function (ps) {
            data.performances = ps;
            return redis.getAsync('h:' + req.user.hospitalId + ':u:' + req.user.id + ':checkIn');
        }).then(function (result) {
            data.checkIn.last = (result != null ? JSON.parse(result) : {});
            return redis.getAsync('h:' + req.user.hospitalId + ':u:' + req.user.id + ':' + moment().format('YYYYMMDD'));
        }).then(function (result) {
            data.checkIn.summary = {today: result == null ? 0 : +result};
            return redis.getAsync('h:' + req.user.hospitalId + ':u:' + req.user.id + ':' + moment().format('YYYYMM'));
        }).then(function (result) {
            data.checkIn.summary.month = (result == null ? 0 : +result);
            return redis.getAsync('h:' + req.user.hospitalId + ':u:' + req.user.id + ':r:' + moment().format('YYYYMM'));
        }).then(function (result) {
            data.agentPreRegistration = {month: (result == null ? 0 : +result)};
            return redis.getAsync('h:' + req.user.hospitalId + ':u:' + req.user.id + ':r:' + moment().format('YYYYMMDD'));
        }).then(function (result) {
            data.agentPreRegistration.today = (result == null ? 0 : +result);
            res.send({ret: 0, data: data});
        });
        return next();
    }
}