const express = require('express');
const path = require('path');
const session = require('express-session');
const memorystore = require('memorystore')(session);

const app = express();
const login_register = require('./route_api/login_register');
const get_page = require('./route_api/get_page');
const room_function = require('./route_api/room_function');

// set the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    cookie: {maxAge:24*60*60*1000},
    secret: 'session1dayExpired',
    resave: false,
    saveUninitialized:true,
    store:new memorystore({
        checkPeriod:24*60*60*1000
    })
}));


// ------------- GET User info --------------
app.get('/user',function (req,res) {
    res.json({
        "id": req.session.userID,
        "username": req.session.username,
        "role": req.session.role,
        "name": req.session.name
    });
});

app.use(login_register);
app.use(get_page);
app.use(room_function);



// ------------ root service ----------
app.get('/', function (req, res) {
    if (req.session.role == 0) {
        res.redirect('/homepage_student');
    }else if(req.session.role == 1){
        res.redirect('/homepage_lecturer');
    }
    else if(req.session.role == 2){
        res.redirect('/homepage_staff');
    }else{
        res.sendFile(path.join(__dirname, 'views/homepage.html'));
    }
});

const PORT = 3000;
app.listen(PORT, function () {
    console.log('Server is running at port ' + PORT);
});

