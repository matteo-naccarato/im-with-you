const bcrypt = require('bcrypt')
const passport = require('passport')

const initalizePassport = require('../../config/passport')
const phrasesDB = require('../../db/phrasesDB')
const postsDB = require('../../db/postsDB')
const savesDB = require('../../db/savesDB')
const { updateLastSeen } = require('../../db/usersDB')
const { ROLE } = require('../../config/adminUtils')
const { SALT_ROUNDS, internalError } = require('../../db/utilsDB')
const { PAGES, LANGUAGES, getContents, getSpecificContents } = require('./languages/langUtils')

const { create, readById, readByEmail, checkUniqueFields } = require('../../db/usersDB')
initalizePassport(
    passport,
    readByEmail,
    readById,
)

const renderHome = async(req, res, contents) => {
    try {
        const lastPhrase = (await phrasesDB.readLasts(1)).rows[0]
        const lastPost = (await postsDB.readLasts(1)).rows[0]

        let likedByUser
        if (req.user) {
            let tmp = (await savesDB.likedByUser(savesDB.SAVES_TBLS.PHRASE, req.user.id)).rows
            likedByUser = tmp.map(obj => obj.contentId)

            lastPhrase.liked = likedByUser.includes(lastPhrase.id)


            tmp = (await savesDB.likedByUser(savesDB.SAVES_TBLS.POST, req.user.id)).rows
            likedByUser = tmp.map(obj => obj.contentId)

            lastPost.liked = likedByUser.includes(lastPost.id)
        }

        res.render('public/index', {
            user: req.user,
            ROLE: ROLE,
            language: (contents) ? contents : texts,
            lastPhrase: lastPhrase,
            lastPost: lastPost
        });
    } catch (err) {
        internalError(res, 500, err)
    }
}

exports.get_home = async(req, res) => {
    const contents = getContents(req.user, PAGES['/'])
    try {
        await renderHome(req, res, contents)
    } catch (err) {
        internalError(res, 500, err)
    }
}

exports.get_specific_home = async(req, res) => {
    const contents = getSpecificContents(req.params.lang, PAGES['/'])
    try {
        await renderHome(req, res, contents)
    } catch (err) {
        internalError(res, 500, err)
    }
}


exports.get_phrases = async(req, res) => {
    const contents = getContents(req.user, PAGES['/phrases'])

    try {
        const phrases = (await phrasesDB.read(phrasesDB.FIELDS.ISFINISHED, 1)).rows

        let likedByUser
        if (req.user) {
            const tmp = (await savesDB.likedByUser(savesDB.SAVES_TBLS.PHRASE, req.user.id)).rows
            likedByUser = tmp.map(obj => obj.contentId)

            phrases.map(phrase => {
                return phrase.liked = likedByUser.includes(phrase.id)
            })
        }

        res.render('public/phrases', {
            user: req.user,
            ROLE: ROLE,
            language: contents,
            phrases: phrases
        })
    } catch (err) {
        internalError(res, 500, err)
    }

}

exports.get_posts = async(req, res) => {
    const contents = getContents(req.user, PAGES['/posts'])

    try {
        const posts = (await postsDB.read(postsDB.FIELDS.ISFINISHED, 1)).rows

        let likedByUser
        if (req.user) {
            const tmp = (await savesDB.likedByUser(savesDB.SAVES_TBLS.POST, req.user.id)).rows
            likedByUser = tmp.map(obj => obj.contentId)

            posts.map(posts => {
                return posts.liked = likedByUser.includes(posts.id)
            })
        }

        res.render('public/posts', {
            user: req.user,
            ROLE: ROLE,
            language: contents,
            posts: posts
        })
    } catch (err) {
        internalError(res, 500, err)
    }
}


exports.save_phrase = (req, res) => {
    savesDB.create(savesDB.SAVES_TBLS.PHRASE, req.params.id, req.user.id, () => {
        res.status(200).redirect('/phrases')
    })
}

exports.unsave_phrase = (req, res) => {
    savesDB.delete(savesDB.SAVES_TBLS.PHRASE, req.params.id, req.user.id, () => {
        res.status(200).redirect('/phrases')
    })
}

exports.save_post = (req, res) => {
    savesDB.create(savesDB.SAVES_TBLS.POST, req.params.id, req.user.id, () => {
        res.status(200).redirect('/posts')
    })
}

exports.unsave_post = (req, res) => {
    savesDB.delete(savesDB.SAVES_TBLS.POST, req.params.id, req.user.id, () => {
        res.status(200).redirect('/posts')
    })

}

exports.get_saved = async(req, res) => {
    const contents = getContents(req.user, PAGES['/saved'])
    try {
        const phrasesSaved = (await savesDB.read(savesDB.SAVES_TBLS.PHRASE, req.user.id)).rows
        const postsSaved = (await savesDB.read(savesDB.SAVES_TBLS.POST, req.user.id)).rows

        phrasesSaved.map(phrase => phrase.liked = true)
        postsSaved.map(post => post.liked = true)

        console.log(postsSaved)

        res.render('public/saved', {
            user: req.user,
            ROLE: ROLE,
            language: contents,
            phrases: phrasesSaved,
            posts: postsSaved
        })
    } catch (err) {
        internalError(res, 500, err)
    }
}


exports.get_register = (req, res) => {
    const contents = getContents(req.user, PAGES['/register'])
    res.render('register', {
        user: req.user,
        language: contents
    })
}


exports.register = async(req, res) => {
    try {
        const lastSeen = new Date().toISOString().split('T')[0] // 2021-05-26T21:53:36.244Z
        const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS)

        const usernameEmailValid = (await checkUniqueFields(req.body.email, req.body.username)).isValid
        if (usernameEmailValid) {
            create({
                email: req.body.email,
                username: req.body.username,
                password: hashedPassword,
                name: req.body.name,
                surname: req.body.surname,
                dateOfBirth: req.body.dateOfBirth,
                img: '',
                yearOfLastSeen: lastSeen.split('-')[0],
                monthOfLastSeen: lastSeen.split('-')[1],
                dayOfLastSeen: lastSeen.split('-')[2],
                countryCode: '',
                role: ROLE.BASIC
            }, () => {
                req.flash('info', 'Registrazione completata con successo!')
                res.redirect('/login')
            })
        } else {
            req.flash('error', 'Qualcuno ha già utilizzato questa email o questo username')
            res.redirect('/register')
        }
    } catch {
        res.redirect('/register')
    }
}

exports.get_login = (req, res) => {
    const contents = getContents(req.user, PAGES['/login'])
    res.render('login', {
        user: req.user,
        language: contents
    })
}

exports.logout = (req, res) => {
    if (req.user) {
        updateLastSeen(req.user.id)
    }
    req.flash('info', 'Logout completato con successo!')
    req.logOut()
    res.redirect('/login')
}