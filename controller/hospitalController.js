"use strict";
var config = require('../config');
var i18n = require('../i18n/localeMessage');
var hospitalDAO = require('../dao/hospitalDAO');
var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');
var redis = require('../common/redisClient');
var md5 = require('md5');
module.exports = {
    getHospitals: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        hospitalDAO.findAll({
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (hospitals) {
            hospitals.pageIndex = pageIndex;
            return res.send({ret: 0, data: hospitals});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getHospitalById: function (req, res, next) {
        hospitalDAO.findById(req.user.hospitalId).then(function (hospitals) {
            res.send({ret: 0, data: hospitals[0]})
        }).catch(function (err) {
            res.send({ret: 0, message: err.message})
        });
        return next();
    },
    addPatient: function (req, res, next) {
        hospitalDAO.findSalesManPatientsBy(req.body.mobile, req.user.hospitalId).then(function (result) {
            var patient = _.assign(req.body, {
                salesMan: req.user.id,
                createDate: new Date(),
                agentRegistrationTimes: 0,
                agentable: result[0].count < 1,
                isBinded: 0,
                hospitalId: req.user.hospitalId
            });
            hospitalDAO.addPatient(patient).then(function (result) {
                patient.id = result.insertId;
                res.send({ret: 0, data: patient});
            }).catch(function (err) {
                res.send({ret: 1, message: err.message});
            });
        });
        return next();
    },

    getPatients: function (req, res, next) {
        hospitalDAO.findPatients(req.user.id, {from: +req.query.from, size: +req.query.size}).then(function (patients) {
            if (patients.length < 1) return res.send({ret: 0, data: []});
            res.send({ret: 0, data: patients});
        });
        return next();
    },
    searchPatients: function (req, res, next) {
        hospitalDAO.findPatients(req.user.id, {
            from: +req.query.from,
            size: +req.query.size
        }, req.query.q).then(function (patients) {
            if (patients.length < 1) return res.send({ret: 0, data: []});
            res.send({ret: 0, data: patients});
        });
        return next();
    },
    getDepartments: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        hospitalDAO.findDepartmentsBy(hospitalId).then(function (departments) {
            return res.send({ret: 0, data: departments});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDoctorsByDepartment: function (req, res, next) {
        var departmentId = req.params.departmentId;
        var hospitalId = req.user.hospitalId;
        hospitalDAO.findDoctorsByDepartment(hospitalId, departmentId).then(function (doctors) {
            return res.send({ret: 0, data: doctors});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDoctorById: function (req, res, next) {
        var doctor = {};
        hospitalDAO.findDoctorById(req.params.doctorId).then(function (doctors) {
            doctor = doctors[0];
            doctor.images = doctor.images ? doctor.images.split(',') : [];
            res.send({ret: 0, data: doctor});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getShitPlan: function (req, res, next) {
        var doctorId = req.params.doctorId;
        var start = moment(req.query.d).add(-1, 'd').format('YYYY-MM-DD');
        var end = moment(req.query.d).add(1, 'w').format('YYYY-MM-DD');
        hospitalDAO.findShiftPlans(doctorId, start, end, req.query.pid).then(function (plans) {
            var filteredPlans = _.filter(plans, function (p) {
                var date = p.day + ' ' + p.period.split('-')[0];
                return moment(date, 'YYYY-MM-DD HH:mm').isAfter(moment());
            });

           var sortedPlans =  _.sortBy(filteredPlans, function(item) {
               var date = item.day + ' ' + item.period.split('-')[0];
               return moment(date, 'YYYY-MM-DD HH:mm');
            });
            var data = _.groupBy(sortedPlans, function (plan) {
                moment.locale('zh_CN');
                return moment(plan.day).format('YYYY-MM-DD dddd');
            });
            var result = [];
            for (var key in data) {
                var p = key.split(' ');
                var item = {
                    day: p[0], weekName: p[1], actualQuantity: _.sum(data[key], function (item) {
                        return item.actualQuantity;
                    }), plannedQuantity: _.sum(data[key], function (item) {
                        return item.plannedQuantity;
                    }), periods: data[key]
                };
                item.periods.forEach(function (object) {
                    delete object.day;
                });
                result.push(item);
            }
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getPatientByMobile: function (req, res, next) {
        var mobile = req.params.mobile;
        var data = {exists: false, patient: {}};
        hospitalDAO.findBySalesManPatients(req.user.id, mobile).then(function (patients) {
            data.exists = patients.length > 0;
            if (data.exists) {
                data.patient = patients[0];
            }
            return hospitalDAO.findPatientByMobile(mobile);
        }).then(function (patients) {
            if (patients.length > 0) {
                data.patient = patients[0];
                res.send({ret: 0, data: data})
            } else {
                return hospitalDAO.findBySalesManPatientsByMobile(mobile).then(function (patients) {
                    data.patient = patients[0];
                    res.send({ret: 0, data: data});
                })
            }
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        })
    },
    updatePatient: function (req, res, next) {
        var patient = req.body;
        patient.id = patient.pid;
        delete patient.pid;
        hospitalDAO.updatePatient(req.body).then(function (result) {
            res.send({ret: 0, message: '更改成功'})
        });
        return next();
    },
    agentPreRegistration: function (req, res, next) {
        var registration = req.body;
        var pid = req.body.pid;
        hospitalDAO.findShiftPlanByDoctorAndShiftPeriod(registration.doctorId, registration.registerDate, registration.shiftPeriod).then(function (plans) {
            if (!plans.length || (plans[0].plannedQuantity <= +plans[0].actualQuantity)) {
                return res.send({ret: 1, message: i18n.get('doctor.shift.plan.invalid')});
            } else {
                hospitalDAO.findBySalesManPatientById(req.body.pid).then(function (ps) {
                    delete registration.pid;
                    var p = ps[0];
                    registration = _.assign(registration, {
                        patientName: p.name, patientMobile: p.mobile,
                        gender: p.gender,
                        createDate: new Date()
                    });
                    return hospitalDAO.findDoctorById(registration.doctorId);
                }).then(function (doctors) {
                    var doctor = doctors[0];
                    registration = _.assign(registration, {
                        departmentId: doctor.departmentId,
                        departmentName: doctor.departmentName,
                        hospitalId: doctor.hospitalId,
                        hospitalName: doctor.hospitalName,
                        registrationFee: doctor.registrationFee,
                        doctorName: doctor.name,
                        doctorJobTitle: doctor.jobTitle,
                        doctorJobTitleId: doctor.jobTitleId,
                        doctorHeadPic: doctor.headPic,
                        paymentType: 1,
                        status: 0,
                        registrationType: 7,
                        memberType: 1,
                        businessPeopleId: req.user.id,
                        businessPeopleName: req.user.name,
                        creator: req.user.id
                    });
                    return hospitalDAO.findPatientBasicInfoBy(registration.patientMobile);
                }).then(function (patientBasicInfoList) {
                    if (patientBasicInfoList.length) {
                        registration.patientBasicInfoId = patientBasicInfoList[0].id;
                        return redis.incrAsync('doctor:' + registration.doctorId + ':d:' + registration.registerDate + ':period:' + registration.shiftPeriod + ':incr').then(function (seq) {
                            return redis.getAsync('h:' + req.user.hospitalId + ':p:' + registration.shiftPeriod).then(function (sp) {
                                registration.sequence = sp + seq;
                                registration.outPatientType = 0;
                                registration.outpatientStatus = 5;
                                return hospitalDAO.findPatientByBasicInfoId(registration.patientBasicInfoId, req.user.hospitalId);
                            });
                        });
                    }
                    return hospitalDAO.insertPatientBasicInfo({
                        name: registration.patientName,
                        realName: registration.patientName,
                        mobile: registration.patientMobile,
                        gender:registration.gender,
                        createDate: new Date(),
                        password: md5(registration.patientMobile.substring(registration.patientMobile.length - 6, registration.patientMobile.length)),
                        creator: req.user.id
                    }).then(function (result) {
                        registration.patientBasicInfoId = result.insertId;
                        return redis.incrAsync('doctor:' + registration.doctorId + ':d:' + registration.registerDate + ':period:' + registration.shiftPeriod + ':incr').then(function (seq) {
                            return redis.getAsync('h:' + req.user.hospitalId + ':p:' + registration.shiftPeriod).then(function (sp) {
                                registration.sequence = sp + seq;
                                registration.outPatientType = 0;
                                registration.outpatientStatus = 5;
                                return hospitalDAO.findPatientByBasicInfoId(registration.patientBasicInfoId, req.user.hospitalId);
                            });
                        });
                    });
                }).then(function (result) {
                    if (!result.length) {
                        return redis.incrAsync('member.no.incr').then(function (memberNo) {
                            return hospitalDAO.insertPatient({
                                patientBasicInfoId: registration.patientBasicInfoId,
                                hospitalId: req.user.hospitalId,
                                memberType: 1,
                                balance: 0.00,
                                memberCardNo: registration.hospitalId + '-1-' + _.padLeft(memberNo, 7, '0'),
                                createDate: new Date()
                            }).then(function (patient) {
                                registration.patientId = patient.insertId;
                                return hospitalDAO.insertRegistration(registration);
                            });
                        });
                    } else {
                        registration.patientId = result[0].id;
                    }
                    return hospitalDAO.insertRegistration(registration);
                }).then(function () {
                    return hospitalDAO.updateShiftPlan(registration.doctorId, registration.registerDate, registration.shiftPeriod);
                }).then(function () {
                    return hospitalDAO.updatePatientAgentable(registration.patientMobile, req.user.id);
                }).then(function () {
                    return hospitalDAO.updatePatientAgentTimes(pid);
                }).then(function (result) {
                    return hospitalDAO.findShiftPeriodById(req.user.hospitalId, registration.shiftPeriod);
                }).then(function (result) {
                    redis.incr('h:' + req.user.hospitalId + ':u:' + req.user.id + ':r:' + moment().format('YYYYMMDD'));
                    redis.incr('h:' + req.user.hospitalId + ':u:' + req.user.id + ':r:' + moment().format('YYYYMM'));
                    return res.send({
                        ret: 0,
                        data: {
                            id: registration.id,
                            registerDate: registration.registerDate,
                            hospitalName: registration.hospitalName,
                            departmentName: registration.departmentName,
                            doctorName: registration.doctorName, jobTtile: registration.doctorJobTtile,
                            shiftPeriod: result[0].name
                        }
                    });
                });
            }
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getMyPreRegistrations: function (req, res, next) {
        hospitalDAO.findRegistrations(req.user.id, {
            from: +req.query.from,
            size: +req.query.size
        }).then(function (registrations) {
            res.send({ret: 0, data: registrations});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getMyPreRegistrationsByMonth: function (req, res, next) {
        hospitalDAO.findRegistrationsByMonth(req.user.id, req.params.month, {
            from: +req.query.from,
            size: +req.query.size
        }).then(function (registrations) {
            res.send({ret: 0, data: registrations});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getPreRegistrationsOfPatient: function (req, res, next) {
        hospitalDAO.findRegistrationsByPid(req.user.id, +req.params.pid, {
            from: +req.query.from,
            size: +req.query.size
        }).then(function (registrations) {
            res.send({ret: 0, data: registrations});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    deletePatient: function (req, res, next) {
        hospitalDAO.deletePatient(req.user.id, req.params.mobile).then(function (result) {
            res.send({ret: 0, message: '删除成功。'})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        })

        return next();
    }
}
