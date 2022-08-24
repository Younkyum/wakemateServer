var mysql = require('mysql');
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'jyk4737137',
    database: 'wakemate'
})

module.exports = db;