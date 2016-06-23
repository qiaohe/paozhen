module.exports = {
    hospital: {
        insert: 'insert Hospital set ?',
        updatePatientAgentTimes: 'update SalesManPatient set agentRegistrationTimes = agentRegistrationTimes + 1, isBinded = 1 where id = ?',
        updatePatientAgentable: 'update SalesManPatient set agentable = 0 where mobile = ? and salesMan <> ?',
        insertPatient: 'insert Patient set ?',
        updateShiftPlan: 'update ShiftPlan set actualQuantity = actualQuantity + 1 where doctorId = ? and day =? and shiftPeriod = ?',
        findShiftPlanByDoctorAndShiftPeriod: 'select * from ShiftPlan where doctorId=? and day=? and shiftPeriod =?',
        findBySalesManPatientById: 'select * from SalesManPatient where id=?',
        findPatientBasicInfoBy: 'select * from PatientBasicInfo where mobile=?',
        findPatientByBasicInfoId: 'select * from Patient where patientBasicInfoId = ? and hospitalId=?',
        insertPatientBasicInfo: 'insert PatientBasicInfo set ?',
        update: 'update Hospital set ? where id=?',
        findById: 'select * from Hospital where id=?',
        insertRegistration: 'insert Registration set ?',
        findShiftPeriodById: 'select * from ShiftPeriod where hospitalId = ? and id =?',
        findRegistrations: 'select patientMobile, patientName, departmentName, doctorName, createDate, totalFee as amount, concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , p.`name`) as shiftPeriod from Registration r left JOIN ShiftPeriod p on r.shiftPeriod = p.id where r.businessPeopleId =? order by r.createDate desc limit ?, ?',
        findRegistrationsByMonth: 'select patientMobile, patientName, departmentName, doctorName, createDate, totalFee as amount, concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , p.`name`) as shiftPeriod from Registration r left JOIN ShiftPeriod p on r.shiftPeriod = p.id where r.businessPeopleId =? and date_format(createDate,\'%Y%m\')=? order by r.createDate desc limit ?, ?',
        findRegistrationsByPid: 'select patientMobile, patientName, departmentName, doctorName, r.createDate, totalFee as amount, concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , p.`name`) as shiftPeriod from Registration r left JOIN ShiftPeriod p on r.shiftPeriod = p.id left join SalesManPatient smp on smp.mobile = r.patientMobile where smp.id = ? and r.businessPeopleId=? order by r.createDate desc limit ?, ?',
        findPatientByMobile: 'select * from PatientBasicInfo where mobile =?',
        deletePatient: 'delete from SalesManPatient where salesMan=? and mobile=?',
        findBySalesManPatients: 'select * from SalesManPatient where salesMan=? and mobile =?',
        findBySalesManPatientsByMobile: 'select * from SalesManPatient where mobile =?',
        findDoctorById: 'select id, name, departmentName,hospitalId, hospitalName, headPic,registrationFee, speciality,introduction, images,jobTitle, departmentId, jobTitleId,commentCount from Doctor where id =?',
        findByDepartment: 'select id, name, departmentName, hospitalName, headPic,registrationFee, speciality,jobTitle from Doctor where hospitalId = ?  and departmentId = ?',
        findShitPlans: 'select p.`name` as period, `day`, actualQuantity, plannedQuantity, p.id as periodId from ShiftPlan sp, ShiftPeriod p where sp.shiftPeriod = p.id and sp.doctorId = ? and sp.day>? and sp.day<=? and sp.actualQuantity < sp.plannedQuantity and sp.plannedQuantity > 0 and p.id not in (select shiftPeriod from Registration r LEFT JOIN SalesManPatient smp on r.patientMobile = smp.mobile where r.doctorId=? and r.registerDate=sp.`day` and smp.id =?) order by sp.day, sp.shiftPeriod',
        findByHospital: 'select id, name, introduction from Department where hospitalId = ?',
        findAll: 'select SQL_CALC_FOUND_ROWS h.*, e.name as administratorName from Hospital h left JOIN Employee e on e.id = h.administrator order by h.createDate desc limit ?, ?',
        findSalesManPatientsBy: 'select count(*) as count from SalesManPatient where mobile=? and hospitalId=? and isBinded = 1'
    },
    salesMan: {
        findByUserName: 'select * from SalesMan where mobile = ?',
        updatePassword: 'update SalesMan set password=? where mobile=?',
        update: 'update SalesMan set ? where id=?',
        updateCheckInCount: 'update SalesMan set checkInCount = checkInCount + 1 where id=?'
    },
    checkin: {
        insert: 'insert CheckIn set ?',
        findByUid: 'select * from CheckIn where salesMan=? order by date desc limit ?,?'
    },
    performance: {
        findPerformances: 'select yearMonth,plan,actual from Performance where salesMan=? order by yearMonth'
    },
    patient: {
        addPatient: 'insert SalesManPatient set ?',
        findPatients: 'select * from SalesManPatient where salesMan = ? order by createDate desc limit ?,?',
        updatePatient: 'update SalesManPatient set ? where id = ?',
        findPatientsByKeyWords: 'select * from SalesManPatient where salesMan = ? and (mobile like ? or name like ?) order by createDate desc limit ?,?'
    }
}
