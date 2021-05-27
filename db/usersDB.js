const sqlite3 = require('sqlite3').verbose();
const { connect_dev, connect_prod, close } = require('./utilsDB')

const FIELDS = {
    'ID': 'id',
    'EMAIL': 'email'
}


/* const readAll = (field = '', value = -1) => {
    const db = connect_dev();
    const sql = 'SELECT * FROM Users' + ((field != '') ? ` WHERE ${field} = ${value}` : '') + ';';

    return new Promise((resolve, reject) => {
        var responseObj;
        db.all(sql, function(err, rows) {
            if (err) {
                responseObj = {
                    'error': err
                };
                reject(responseObj);
            } else {
                responseObj = {
                    statement: this,
                    rows: rows
                };
                resolve(responseObj);
            }
            close(db)
        })
    })
} */

const readTest = (role, id = -1 /* , callback */ ) => {
    const db = connect_dev();
    const sql = `SELECT * FROM Users WHERE role = '${role}'` + ((id > -1) ? ` AND Users.id = ${id}` : "") + ";";

    return new Promise((resolve, reject) => {
        var responseObj;
        db.all(sql, function(err, rows) {
            if (err) {
                responseObj = {
                    'error': err
                };
                reject(responseObj);
            } else {
                responseObj = {
                    statement: this,
                    rows: rows
                };
                resolve(responseObj);
            }
            close(db)
        })
    })
}

const create = user => {
    const db = connect_dev();
    const sql = "INSERT INTO Users VALUES (null, $email, $username, $password, $name, $surname, $dateOfBirth, $imgUrl, $lastSeen, $countryCode, $role);"

    db.run(sql, {
        $email: user.email,
        $username: user.username,
        $password: user.password,
        $name: user.name,
        $surname: user.surname,
        $dateOfBirth: user.dateOfBirth,
        $imgUrl: user.imgUrl,
        $lastSeen: user.lastSeen,
        $countryCode: user.countryCode,
        $role: user.role,
    })

    close(db);
}

exports.update = user => {
    const db = connect_dev();

    console.log(user)

    const sql = "UPDATE Users SET email = $email, username = $username, password = $password, name = $name, surname = $surname, yearOfBirth = $yearOfBirth, monthOfBirth = $montOfBirth, dayOfBirth = $dayOfBirth, img = $img, lastSeen = $lastSeen, countryCode = $countryCode, role = $role WHERE id = $id;"
    db.run(sql, {
        $email: user.email,
        $username: user.username,
        $password: user.password,
        $name: user.name,
        $surname: user.surname,
        $yearOfBirth: user.yearOfBirth,
        $monthOfBirth: user.monthOfBirth,
        $dayOfBirth: user.dayOfBirth,
        $img: user.img,
        $lastSeen: user.lastSeen,
        $countryCode: user.countryCode,
        $role: user.role,
        $id: user.id
    })

    close(db);
}

exports.delete = id => {
    const db = connect_dev();
    const sql = `DELETE FROM Users WHERE id = ${id};`;
    db.run(sql);
    close(db)
}


exports.getImageUrl = id => {
    const db = connect_dev()

    const sql = `SELECT img FROM Users WHERE id = ${id};`
    return new Promise((resolve, reject) => {
        var responseObj;
        db.get(sql, (err, value) => {
            if (err) {
                responseObj = {
                    'error': err
                };
                reject(responseObj);
            } else {
                responseObj = {
                    statement: this,
                    url: value.img
                };
                resolve(responseObj);
            }
            close(db)
        })
    })

}

const read = async(field, value, callback) => {
    const db = connect_dev();
    const sql = `SELECT * FROM Users WHERE ${field} = ${value}`;
    /* console.log(sql) */
    db.get(sql, (err, row) => {
        callback(row)
        close(db)
    })
}

const readById = async(id, callback) => {
    read(FIELDS.ID, id, callback)
}

const readByEmail = async(email, callback) => [
    read(FIELDS.EMAIL, `'${email}'`, callback)
]


module.exports = {
    create,
    readById,
    readByEmail,
    readTest
}