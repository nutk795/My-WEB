const express = require('express');
const session = require('express-session');
const con = require('../config/db');
const router = express.Router();

//เอาไว้ get room ทั้งหมด manage page
router.get("/roomdata", function (_req, res) {
    const sql = "SELECT * FROM room";
    con.query(sql, function (err, result) {
        if (err) {
            res.status(500).send('DB error')
        }
        else {
            res.json(result);
        }
    })
});


// แสดงห้องจองสำหรับ User และ show dashboard
router.get('/roomlist', (req, res) => {
    // Query to fetch data from the database
    const sql = `
    SELECT room.*, booking.status, booking.time, booking.date FROM room LEFT JOIN booking ON room.room_id = booking.room_id`
        ;

    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error executing query: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (result.length <= 0) {
            return res.status(400).send("No room list");
        }

        // Create a map to store room details 
        const roomMap = new Map();

        // Process each result and group by room details
        result.forEach((row) => {
            const { room_id, roomname, capacity, roomStatus, build, status, time, date } = row;

            if (!roomMap.has(room_id)) {
                roomMap.set(room_id, {
                    room_id,
                    roomname,
                    capacity,
                    roomStatus,
                    build,
                    time: [],
                    status: [],
                    date: [],
                });
            }

            const tomorrow = new Date(date);
            // Format the date as 'YYYY-MM-DD'
            const date_show = `${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`
            roomMap.get(room_id).time.push(time);
            roomMap.get(room_id).status.push(status);
            roomMap.get(room_id).date.push(date_show);
        });

        // Convert the map values (room details with time and status arrays) to an array
        const groupedResult = Array.from(roomMap.values());

        res.json(groupedResult);
    });
});


//Api จองสำหรับ User 
router.post("/addRequest", function (req, res) {
    const { room_id, date, time } = req.body;
    // Check
    const checkUserBooking = "SELECT * FROM booking WHERE user_id = ? AND status IN (1, 2) AND date = ?;"
    con.query(checkUserBooking, [req.session.userID, date], function (checkErr, checkResult) {
        if (checkErr) {
            res.status(500).send('DB error');
        } else {
            if (checkResult.length > 0) {
                res.status(400).send('You can booking only 1 Request');
            } else {
                const checkBookingQuery = "SELECT * FROM booking WHERE  room_id = ? AND time = ? AND date = ? AND status IN (1, 2)";
                con.query(checkBookingQuery, [room_id, time, date], function (checkErr, checkResult) {
                    if (checkErr) {
                        res.status(500).send('DB error');
                    } else {
                        if (checkResult.length > 0) {
                            res.status(400).send('This Time already booking');
                        } else {
                            const insertBookingQuery = "INSERT INTO booking (room_id, user_id, date,time,status) VALUES (?, ?, ?, ?,2)";
                            con.query(insertBookingQuery, [room_id, req.session.userID, date, time], function (insertErr, insertResult) {
                                if (insertErr) {
                                    res.status(500).send('DB error');
                                } else {
                                    res.send('/checkrequest_student')
                                }
                            });
                        }
                    }
                });
            }
        }
    }
    );
});

//Update Disable/Available room สำหรับ staff
router.put("/updateRoomStatus", function (req, res) {
    const { roomId, roomStatus } = req.body;
    var tomorrowDate = new Date();
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate() + 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const sql = "UPDATE room SET roomStatus=? WHERE room_id=?";
    con.query(sql, [roomStatus, roomId], function (err, result) {
        if (err) {
            res.status(500).send('DB error');
        } else {
            if (roomStatus == 0) {
                const sql2 = "UPDATE booking SET status=0 , description='Room has Disable' WHERE room_id=? AND date=?";
                con.query(sql2, [roomId, formatDate(tomorrowDate)], function (err, result) {
                    if (err) {
                        res.status(500).send('DB error');
                    } else {
                        res.send('Update successful');
                    }
                });
            } else {
                res.send('Update successful');
            }
        }
    });
});

//get roomdata by ID
router.get('/getRoomData', (req, res) => {
    const roomId = req.query.roomId;

    const query = `SELECT * FROM room WHERE room_id = ?`;

    con.query(query, [roomId], (err, results) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        // Check if there are results
        if (results.length === 0) {
            res.status(404).send('Room not found');
        } else {
            // Return the room data as JSON
            res.json(results[0]);
        }
    });
});

//get แค่ request ของตัวเองสำหรับ user
router.get("/roomuser_request", function (req, res) {
    const sql = "SELECT * FROM booking WHERE user_id=?";
    con.query(sql, [req.session.userID], function (err, result) {
        if (err) {
            res.status(500).send('DB error')
        }
        else {
            res.json(result);
        }
    })
});

//get booking ทั้งหมดสำหรับ lecturer
router.get("/room_request", function (req, res) {
    const sql = `SELECT booking.*, user.student_id, user.name, user.username, room.roomname, room.build
    FROM booking
    LEFT JOIN user ON booking.user_id = user.user_id
    LEFT JOIN room ON booking.room_id = room.room_id;`
    con.query(sql, function (err, result) {
        if (err) {
            res.status(500).send('DB error');
        } else {
            // Modify the result array
            const modifiedResult = result.map((booking) => {

                const tomorrow = new Date(booking.date);
                // Format the date as 'YYYY-MM-DD'
                const date_show = `${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`
                // Return the booking object with the formatted date
                return { ...booking, date: date_show };
            });

            // Send the modified result as JSON response
            res.json(modifiedResult);
        }
    });
});


//Edit api สำหรับ staff
router.put("/edit_roomdata/:roomId", function (req, res) {
    const roomId = req.params.roomId;
    const { newName, newCapacity, newBuild } = req.body;

    const upperRoomname = newName.toUpperCase();
    const upperBuild = newBuild.toUpperCase();
    // Check
    const checkRoomQuery = "SELECT * FROM room WHERE UPPER(roomname) = ? AND UPPER(build) = ?";
    con.query(checkRoomQuery, [upperRoomname, upperBuild], function (checkErr, checkResult) {
        if (checkErr) {
            res.status(500).send('DB error');
        } else {
            if (checkResult.length > 0) {
                res.status(400).send('Room already exists');
            } else {
                const sql = "UPDATE room SET roomname=?, capacity=?, build=? WHERE room_id=?";
                con.query(sql, [upperRoomname, newCapacity, upperBuild, roomId], function (err, result) {
                    if (err) {
                        res.status(500).send('DB error');
                    } else {
                        if (result.affectedRows > 0) {
                            res.send('Update successful');
                        } else {
                            res.status(404).send('Room not found');
                        }
                    }
                });
            }
        }
    });
});

//add room เพิ่ม สำหรับ staff
router.post("/add_roomdata", function (req, res) {
    const { roomname, capacity, build } = req.body;

    // Convert roomname and build to lowercase
    const lowerRoomname = roomname.toLowerCase();
    const lowerBuild = build.toLowerCase();
    const upperRoomname = roomname.toUpperCase();
    const upperBuild = build.toUpperCase();
    // Check
    const checkRoomQuery = "SELECT * FROM room WHERE LOWER(roomname) = ? AND LOWER(build) = ?";
    con.query(checkRoomQuery, [lowerRoomname, lowerBuild], function (checkErr, checkResult) {
        if (checkErr) {
            res.status(500).send('DB error');
        } else {
            if (checkResult.length > 0) {
                res.status(400).send('Room already exists');
            } else {
                const insertRoomQuery = "INSERT INTO room (roomname, capacity, build) VALUES (?, ?, ?)";
                con.query(insertRoomQuery, [upperRoomname, capacity, upperBuild], function (insertErr, insertResult) {
                    if (insertErr) {
                        res.status(500).send('DB error');
                    } else {
                        res.send('Room added successfully');
                    }
                });
            }
        }
    });
});

//Approve and Disapprove ห้อง Lecturer

router.put("/approve_disapprove", function (req, res) {
    const { bookingId, description, status } = req.body;

    const sql = "UPDATE booking SET status=? , description=?,approve_name=? WHERE booking_id=?"

    con.query(sql, [status, description, req.session.name, bookingId], function (err, result) {
        if (err) {
            res.status(500).send('DB error');
        } else {
            if (result.affectedRows > 0) {
                res.send('Update successful');
            } else {
                res.status(404).send('Room not found');
            }
        }
    })
});


module.exports = router;
