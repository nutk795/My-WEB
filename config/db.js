const mysql = require("mysql2");

const con = mysql.createConnection({
    host: 'localhost' //define host
    ,user: 'root'
    ,password: ''
    ,database: 'projectweb'
})

module.exports = con;