"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    findById: function (hospitalId) {
        return db.query(sqlMapping.hospital.findById, hospitalId);
    },
    findAll: function (page) {
        return db.queryWithCount(sqlMapping.hospital.findAll, [page.from, page.size])
    },
    addPatient: function (patient) {
        return db.query(sqlMapping.patient.addPatient, patient);
    },
    findPatients: function (uid, page, keyWords) {
        if (keyWords) return db.query(sqlMapping.patient.findPatientsByKeyWords, [uid, '%' + keyWords + '%', '%' + keyWords + '%', page.from, page.size]);
        return db.query(sqlMapping.patient.findPatients, [uid, page.from, page.size]);
    },
    findDepartmentsBy: function (hospitalId) {
        return db.query(sqlMapping.hospital.findByHospital, hospitalId);
    },
    findDoctorsByDepartment: function (hospitalId, departmentId) {
        return db.query(sqlMapping.hospital.findByDepartment, [hospitalId, departmentId]);
    },
    findDoctorById: function (doctorId) {
        return db.query(sqlMapping.hospital.findDoctorById, doctorId);
    },
    findShiftPlans: function (doctorId, start, end, pid) {
        return db.query(sqlMapping.hospital.findShitPlans, [+doctorId, start, end, +doctorId, +pid]);
    },
    findPatientByMobile: function (mobile) {
        return db.query(sqlMapping.hospital.findPatientByMobile, mobile);
    },
    findBySalesManPatients: function (uid, mobile) {
        return db.query(sqlMapping.hospital.findBySalesManPatients, [uid, mobile]);
    },
    findBySalesManPatientsByMobile: function (mobile) {
        return db.query(sqlMapping.hospital.findBySalesManPatientsByMobile, mobile);
    },

    updatePatient: function (patient) {
        return db.query(sqlMapping.patient.updatePatient, [patient, patient.id]);
    },
    findShiftPlanByDoctorAndShiftPeriod: function (doctorId, day, shiftPeriod) {
        return db.query(sqlMapping.hospital.findShiftPlanByDoctorAndShiftPeriod, [doctorId, day, shiftPeriod]);
    },
    findBySalesManPatientById: function (pid) {
        return db.query(sqlMapping.hospital.findBySalesManPatientById, pid);
    },
    findPatientBasicInfoBy: function (mobile) {
        return db.query(sqlMapping.hospital.findPatientBasicInfoBy, mobile);
    },
    findPatientByBasicInfoId: function (patientBasicInfoId, hospitalId) {
        return db.query(sqlMapping.hospital.findPatientByBasicInfoId, [patientBasicInfoId, hospitalId]);
    },
    insertPatientBasicInfo: function (p) {
        return db.query(sqlMapping.hospital.insertPatientBasicInfo, p);
    },
    insertPatient: function (patient) {
        return db.query(sqlMapping.hospital.insertPatient, patient)
    },
    insertRegistration: function (registration) {
        return db.query(sqlMapping.hospital.insertRegistration, registration);
    },
    updateShiftPlan: function (doctorId, registerDate, shiftPeriod) {
        return db.query(sqlMapping.hospital.updateShiftPlan, [doctorId, registerDate, shiftPeriod])
    },
    findShiftPeriodById: function (hospitalId, periodId) {
        return db.query(sqlMapping.hospital.findShiftPeriodById, [hospitalId, periodId]);
    },
    findRegistrations: function (salesManId, page) {
        return db.query(sqlMapping.hospital.findRegistrations, [salesManId, page.from, page.size]);
    },

    findRegistrationsByMonth: function (salesManId, month, page) {
        return db.query(sqlMapping.hospital.findRegistrationsByMonth, [salesManId, month, page.from, page.size]);
    },
    findRegistrationsByPid: function (uid, pid, page) {
        return db.query(sqlMapping.hospital.findRegistrationsByPid, [pid, uid, page.from, page.size]);
    },

    deletePatient: function (salesManId, mobile) {
        return db.query(sqlMapping.hospital.deletePatient, [salesManId, mobile]);
    },
    updatePatientAgentTimes: function (pid) {
        return db.query(sqlMapping.hospital.updatePatientAgentTimes, pid);
    },
    updatePatientAgentable: function (mobile, salesManId) {
        return db.query(sqlMapping.hospital.updatePatientAgentable, [mobile, salesManId]);
    },
    findSalesManPatientsBy: function (mobile, hospitalId) {
        return db.query(sqlMapping.hospital.findSalesManPatientsBy, [mobile, hospitalId]);
    },
    findHospitalIds: function(){
        return db.query('select id from Hospital');
    },
    findPeriods: function (hospitalId) {
        return db.query('select id from ShiftPeriod where hospitalId = ? order by name', hospitalId);
    }}
