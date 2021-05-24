const sqlite3 = require('sqlite3').verbose();
const { connect_dev, connect_prod, close } = require('./utilsDB')

const FIELDS = {
    'ID': 'id',
    'EMAIL': 'email'
}


const read = (field = '', value = -1) => {
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

    const sql = "UPDATE ... WHERE id = $id;"
    db.run(sql, {

        /* ... */
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


const readById = async(id, callback) => {
    const db = connect_dev();
    const sql = `SELECT * FROM Users WHERE id = ${id}`;
    db.get(sql, (err, row) => {
        callback(row)
        close(db)
    })
}

const readByEmail = async(email, callback) => {
    const db = connect_dev();
    const sql = `SELECT * FROM Users WHERE email = '${email}'`;
    db.get(sql, (err, row) => {
        callback(row)
        close(db)
    })
}

// hanno un nome questi DESIGN PATTERN??!!!!
/* async function readById(id) {
    const data = await read(FIELDS.ID, id)
    console.log('ciao mamma')
    console.log(data.rows[0])
    return data.rows[0]
} */

/* async function readByEmail(email) {
    const data = await read(FIELDS.EMAIL, `'${email}'`)        
    return data.rows[0]
} */

module.exports = {
    create,
    readById,
    readByEmail
}