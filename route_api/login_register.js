const express = require('express');
const bcrypt = require("bcrypt");
const con = require('../config/db');
const session = require('express-session');
const router = express.Router();


// ---------- login -----------
router.post('/login', function (req, res) {
    const { username, password } = req.body;
    const sql = "SELECT * FROM user WHERE username=?";
    con.query(sql, [username], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send('DB error')
        } else if (results.length != 1) {
            res.status(401).send('Wrong username')
        } else {
            //compare raw and hash password
            bcrypt.compare(password, results[0].password, function (err, same) {
                if (err) {
                    res.status(500).send('Auth Password error')
                } else {
                    if (same == true) {
                        req.session.username = username;
                        req.session.userID = results[0].user_id;
                        req.session.role = results[0].role;
                        req.session.name = results[0].name;
                        res.send('/')
                    } else {
                        res.status(401).send('Wrong Password')
                    }
                }
            })
        }
    })
});

// register
router.post('/register', function (req, res) {
    const { name, username, password, student_id } = req.body;
    // find StudentID
    const findStuid = 'SELECT student_id FROM user WHERE student_id = ?'
    con.query(findStuid, [student_id], function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send("Server error!");
        }
        else if (result.length > 0) {
            res.status(401).send("Student ID has already used!");
        } else {
            // find StudentID
            const findUsername = 'SELECT username FROM user WHERE username = ?'
            con.query(findUsername, [username], function (err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).send("Server error!");
                }
                else if (result.length > 0) {
                    res.status(401).send("Username has already used!");
                } else {
                    // hash pass
                    bcrypt.hash(password, 10, function (err, hash) {
                        if (err) {
                            return res.status(500).send("Hash error!");
                        } else {
                            // correct data
                            const sql = "INSERT INTO user (name,password,username,student_id, role) VALUES (?,?,?,?,0)";
                            con.query(sql, [name, hash, username, student_id], function (err, result) {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send("Server error insert data!");
                                } else {
                                    res.send('/');
                                }
                            });
                        }
                    });
                }
            })
        }
    })
});

// ------------- Logout --------------
router.get('/logout',function (req,res) {
    req.session.destroy(function (err) {
        if(err){
            res.status(500).send('session error');
        }
        res.redirect('/');
    })    
})

module.exports = router;