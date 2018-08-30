
const jwt = require("jsonwebtoken");
var chai = require("chai");
var expect = chai.expect;
var DatabaseCleaner = require('database-cleaner');
const bcrypt = require("bcrypt");

const connectionFactory = require('../helpers/connectionFactory');
const UtilService = require('../../../api/services/UtilService');

var databaseCleaner = new DatabaseCleaner('mysql');
var url = 'http://localhost:1337/';
var request = require('supertest')(url);

describe("category model", () => {

    let connection = "";

    let jwtToken, jwtToken_2, idUser = "";

    const user_1 = {
        "username": "teste1",
        "password": "123",
        "role": [{
                "id": "1"
            }
        ]
    };
    const user_2 = {
        "username": "teste2",
        "password": "123@123",
        "role": [{
                "id": "2"
            }
        ]
    };

    before(function (done) {
        connection = connectionFactory();
        databaseCleaner.clean(connectionFactory(), () => {
            done();
        });
    });

    after(function (done) {
        connection.end();
        done();
    });

    it("### SEEDERS ###", function (done) {
        let idUser, idRole;
        let sql = `INSERT INTO user (username, password) VALUES ( 'felipeGomes' , '${bcrypt.hashSync("250261", 10)}')`;
        connection.query(sql, (error, result) => {
            idUser = result.insertId;
            sql = `INSERT INTO role (name) VALUES ( 'admin' )`;
            connection.query(sql, (error, result) => {
                idRole = result.insertId;
                sql = `INSERT INTO role_user__user_role (role_user, user_role) VALUES ( '${idRole}' , '${idUser}')`;
                connection.query(sql, (error, result) => done());
            });
        });
    });


    it("### LOGIN ADMIN ###", (done) => {
        let req = request
            .post("login/")
            .send({ "username": "felipeGomes", "password": "250261" })
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body).have.property("token");
                jwtToken = res.body.token;
                done();
            });
    });


    it("### SUCESS TOKEN VALID | authenticaton ###", (done) => {
        let req = request.get(`user?pageNum=0&pageSize=5`)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body).to.be.an("array");
                done();
            })
    });


    it("### FAIL WITHOUT TOKEN | authentication ###", (done) => {
        let req = request.post("superhero/")
            .send(user_1)
            .expect(401)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### TOKEN WRONG | authenticaton ###", (done) => {
        let req = request.post("user/")
            .send(user_2)
            .set("authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxLCJpYXQiOjE1MzUyOTE2NjUsImV4cCI6MTUzNTM3ODA2NX0.cLjHXjNqq0PLFyqSxoR1gUcqdCijbiWbWtbJrE2DzIo")
            .expect(401)
            .end((err, res) => {
                if (err) throw err;
                idUser = res.body.id;
                done();
            })
    });

});