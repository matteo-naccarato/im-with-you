const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initalize(passport, getUserByEmail, getUserById) {
    // if the user is correct
    const authenticateUser = async(email, password, done) => {
        const user = getUserByEmail(email) // it returns email if user exits, rather 'no'
        if (user == null) {
            return done(null, false, { message: 'No user with that email' }) // no err, no user found, message
        }

        try {
            if (await bcrypt.compare(password, user.password)) { // la prima è quella messa nel form, l'altra è quella salvata 
                // true => tutto a posto, user autenticato
                return done(null, user) // return user authenticated
            } else {
                return done(null, false, { messaage: 'Password incorrect' })
            }
        } catch (e) {
            return done(e)
        }

    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser)) // options: la prima è il nome dell'utente => metto poi username

    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initalize