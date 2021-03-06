if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const morgan = require('morgan');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override');

const app = express();

const routerPublic = require('./routes/routerPublic');
const routerAdmin = require('./routes/routerAdmin');
const routerError = require('./routes/routerError')


const { ROLE, checkRole, checkAuthenticated, checkNotAuthenticated } = require('./config/adminUtils')
const { LANGUAGES } = require('./controllers/public/languages/langUtils')


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

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

app.use(methodOverride('_method'))

app.use(morgan('dev'));

app.use('/err', routerError)
app.use('/admin', checkAuthenticated, checkRole(ROLE.ADMIN), routerAdmin);
app.use('/', routerPublic);
app.get('/*', (req, res) => {
    const rawContents = require('./views/public/contents.json')
    if (req.user) {
        switch (req.user.countryCode) {
            case LANGUAGES.IT:
                contents = rawContents[LANGUAGES.IT]['404']
                break;
            default:
                contents = rawContents[LANGUAGES.EN]['404']
        }
    } else contents = rawContents[LANGUAGES.EN]['404']
    res.status(404).render('errors/404', {
        user: req.user,
        ROLE: ROLE,
        language: contents
    })
})

module.exports = app;