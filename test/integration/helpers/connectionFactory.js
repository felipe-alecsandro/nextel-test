var mysql = require('mysql');

function createDBConnetion(){

        return mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'db_super_hero_catalogue'
        });
}

module.exports =  createDBConnetion;