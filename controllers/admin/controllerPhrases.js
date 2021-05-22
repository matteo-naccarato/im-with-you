require('dotenv').config();
const sqlite3 = require('sqlite3');

const phrasesDB = require('../../db/phrasesDB');
const peopleDB = require('../../db/peopleDB')

const s3 = require('./s3')
const singleUpload = s3.upload.single('image')

/* const failureCallback = () => {
    res.send('maybe')
} */

exports.get_page = (req, res) => {

    phrasesDB.read()
        .then(result => {
            /* console.log(result); */
            res.render('admin/phrases/all', {
                phrases: result.rows
            })
        })
        .catch(result => console.log(result));
}

exports.get_create = (req, res) => {
    peopleDB.read()
        .then(result => {
            console.log(result)
            res.render('admin/phrases/create', {
                quotedById: result.rows
            })
        })
        .catch(result => console.log(result))
}

exports.create = (req, res) => {
    singleUpload(req, res, function(err) {
        if (err) {
            console.log(err)
            return res.end("Error uploading file.");
        }

        const phrase = {
            text: req.body.text,
            img: req.file.location,
            quotedById: req.body.quotedById,
            authorId: 1,
            isFinished: (req.body.isFinished === 'on') ? 1 : 0,
            date: new Date().toLocaleDateString()
        }

        phrasesDB.create(phrase);
        res.status(200).redirect('/admin/phrases')
    })
}


exports.get_update = (req, res) => {
    phrasesDB.read(req.params.id)
        .then(phrase => {

            console.log(phrase)

            peopleDB.read()
                .then(people => {
                    res.render('admin/phrases/update', {
                        phrase: phrase.rows[0],
                        quotedById: people.rows
                    })
                })
                .catch(result => console.log(result))

        })
        .catch(result => console.log(result))
}

exports.update = (req, res) => {
    const phrase = {
        id: req.params.id,
        text: req.body.text,
        img: 'https://upload.wikimedia.org/wikipedia/commons/6/62/F12019_Leclerc_Schloss_Gabelhofen.jpg',
        quotedById: req.body.quotedById,
        authorId: 1,
        isFinished: (req.body.isFinished === 'on') ? 1 : 0,
        date: new Date().toLocaleDateString()
    }
    console.log(phrase)
    phrasesDB.update(phrase)
    res.status(200).redirect('/admin/phrases')
}

exports.delete = (req, res) => {
    phrasesDB.getImageUrl(req.params.id)
        .then(obj => {
            const tmp = obj.url.split('/')
            s3.deleteImage(tmp[tmp.length - 1])
            console.log('Image successfully deleted!')
            phrasesDB.delete(req.params.id)
            console.log('Phrase successfully deleted!')
            res.status(200).redirect('/admin/phrases')
        })

}