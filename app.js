if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config(); // maybe tolgo il dotenv da s3
}

const express = require('express');
const morgan = require('morgan');
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override'); // https://www.npmjs.com/package/method-override

const app = express();

const routerPublic = require('./routes/routerPublic');
const routerAdmin = require('./routes/routerAdmin');

/* const initalizePassport = require('./config/passport')
initalizePassport(
    passport,
    email => users.find(user => user.email === email)
) */

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// With express version => 4.16.0 the body-parser middleware was added back under the methods express.urlencoded() and express.json()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

app.use(morgan('dev'));

app.use('/', routerPublic);
app.use('/admin', routerAdmin);

module.exports = app;