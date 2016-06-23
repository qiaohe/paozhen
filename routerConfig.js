var authController = require('./controller/authController');
var thirdPartyController = require('./controller/thirdPartyController');
var hospitalController = require('./controller/hospitalController');
var checkInController = require('./controller/checkInController');
module.exports = [
    {
        method: "post",
        path: "/api/login",
        handler: authController.login
    },
    {
        method: "post",
        path: "/api/logout",
        handler: authController.logout,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/hospitals",
        handler: hospitalController.getHospitals,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/hospitals/:hospitalId",
        handler: hospitalController.getHospitalById,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/resetPwd",
        handler: authController.resetPwd,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/checkins",
        handler: checkInController.postCheckIn,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/my/checkins",
        handler: checkInController.getMyCheckIns,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/me",
        handler: authController.updateMyProfile,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/resetPwd",
        handler: authController.resetPwd
    },
    {
        method: "get",
        path: "/api/sms/:mobile",
        handler: thirdPartyController.sendSMS
    },
    {
        method: 'get',
        path: '/api/qiniu/token',
        handler: thirdPartyController.getQiniuToken
    },
    {
        method: 'get',
        path: '/api/homePage',
        handler: authController.getSummary,
        secured: 'user'
    },
    {
        method: 'post',
        path: '/api/patients',
        handler: hospitalController.addPatient,
        secured: 'user'
    },
    {
        method: 'get',
        path: '/api/patients',
        handler: hospitalController.getPatients,
        secured: 'user'
    },
    {
        method: 'put',
        path: '/api/patients',
        handler: hospitalController.updatePatient,
        secured: 'user'
    },
    {
        method: 'get',
        path: '/api/patients/mobile/:mobile',
        handler: hospitalController.getPatientByMobile,
        secured: 'user'
    },
    {
        method: 'get',
        path: '/api/patients/search',
        handler: hospitalController.searchPatients,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/departments",
        handler: hospitalController.getDepartments,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/departments/:departmentId/doctors",
        handler: hospitalController.getDoctorsByDepartment,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/my/hospital",
        handler: hospitalController.getHospitalById,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId",
        handler: hospitalController.getDoctorById,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId/shiftPlans",
        handler: hospitalController.getShitPlan,
        secured: "user"
    },
    {
        method: "post",
        path: "/api/agentPreRegistrations",
        handler: hospitalController.agentPreRegistration,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/my/agentPreRegistrations",
        handler: hospitalController.getMyPreRegistrations,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/my/:month/agentPreRegistrations",
        handler: hospitalController.getMyPreRegistrationsByMonth,
        secured: "user"
    },

    {
        method: "get",
        path: "/api/patients/:pid/agentPreRegistrations",
        handler: hospitalController.getPreRegistrationsOfPatient,
        secured: "user"
    },
    {
        method: "del",
        path: "/api/patients/:mobile",
        handler: hospitalController.deletePatient,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/versionInfo",
        handler: thirdPartyController.getVersionInfo
    }
];