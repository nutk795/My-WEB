const express = require('express');
const path = require('path');

const router = express.Router();

// ============ Page routes student = 0, lecturer = 1, Staff = 2 =================
// ============ Student Page routes =================   
// HomePage Student Routes     
router.get('/homepage_student', function (req, res) {
    if (req.session.role == 0) {
        res.sendFile(path.join(__dirname, '../views/studentviews/homepage_student.html'));
    } else {
        res.redirect('/')
    }
});
// RoomList for Student Routes
router.get('/roomlist_student', function (req, res) {
    if (req.session.role == 0) {
        res.sendFile(path.join(__dirname, '../views/studentviews/roomlist_student.html'));
    } else {
        res.redirect('/')
    }
});

// CheckRequest for Student Routes
router.get('/checkrequest_student', function (req, res) {
    if (req.session.role == 0) {
        res.sendFile(path.join(__dirname, '../views/studentviews/checkrequest_student.html'));
    } else {
        res.redirect('/')
    }
});

// ============ Lecturer Page routes =================   
// HomePage Lecturer Routes     
router.get('/homepage_lecturer', function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, '../views/lecturerviews/homepage_lecturer.html'));
    } else {
        res.redirect('/')
    }
});
// History for Lecturer Routes
router.get('/history_lecturer', function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, '../views/lecturerviews/history_lecturer.html'));
    } else {
        res.redirect('/')
    }
});

// REQUEST for Lecturer Routes
router.get('/request_lecturer', function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, '../views/lecturerviews/request_lecturer.html'));
    } else {
        res.redirect('/')
    }
});

// Dashboard for Lecturer Routes
router.get('/dashboard_lecturer', function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, '../views/lecturerviews/dashboard_lecturer.html'));
    } else {
        res.redirect('/')
    }
});

// ============ Staff Page routes =================   
// HomePage Staff Routes     
router.get('/homepage_staff', function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, '../views/staffviews/homepage_staff.html'));
    } else {
        res.redirect('/')
    }
});
// History for Staff Routes
router.get('/history_staff', function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, '../views/staffviews/history_staff.html'));
    } else {
        res.redirect('/')
    }
});

// Manage for Staff Routes
router.get('/manage_staff', function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, '../views/staffviews/manage_staff.html'));
    } else {
        res.redirect('/')
    }
});

// Dashboard for Staff Routes
router.get('/dashboard_staff', function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, '../views/staffviews/dashboard_staff.html'));
    } else {
        res.redirect('/')
    }
});

module.exports = router;