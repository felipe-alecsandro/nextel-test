
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
        "username": "Admin",
        "password": "admin",
        "role": [{
                "id": "1"
            }
        ]
    };
    const user_2 = {
        "username": "João",
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

    it("### SEEDERS 2 ###", function (done) {
        sql = `INSERT INTO role (name) VALUES ( 'standart' )`;
        connection.query(sql, (error, result) => done())
    });

    it("### FAIL WRONG PASSWORD | LOGIN  ###", (done) => {
        let req = request
            .post("login/")
            .send({ "username": "felipeGomes", "password": "1111111" })
            .expect(401)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.message).to.equal("Authentication failed. Invalid password.");
                done();
            });
    });

    it("### FAIL USER NOT FOUND | LOGIN ###", (done) => {
        let req = request
            .post("login/")
            .send({ "username": "ricardoManfrin", "password": "250261" })
            .expect(401)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.message).to.equal("Authentication failed. Username not found.");
                jwtToken = res.body.token;
                done();
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


    it("### BASE | CREATE new user ###", (done) => {
        let req = request.post("user/")
            .send(user_1)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.username).to.equal('Admin');
                done();
            })
    });

    it("### SUCESS | CREATE new user ###", (done) => {
        let req = request.post("user/")
            .send(user_2)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                idUser = res.body.id;
                done();
            })
    });

    it("### LOGIN STANDART ###", (done) => {
        let req = request
            .post("login/")
            .send({ "username": "João", "password": "123@123" })
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body).have.property("token");
                jwtToken_2 = res.body.token;
                done();
            });
    });

    it("### FAIL NAME REQUIRED | CREATE new user ###", (done) => {
        let req = request.post("user/")
            .send({ "username": "", "password": "123456" })
            .set("authorization", jwtToken)
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### SUCESS | UPDATE user ###", (done) => {
        let req = request.put(`user/${idUser}`)
            .send({ "username": "rogerioCabral", "password": "123654", "role": [{ "id": "2" }] })
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.username).to.equal('rogerioCabral');
                done();
            })
    });

    it("### FAIL UNIQUE NAME | UPDATE user ###", (done) => {
        let req = request.put(`user/${idUser}`)
            .send({ "username": "felipeGomes", "password": "just a test" })
            .set("authorization", jwtToken)
            .expect(500)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.message.code).to.equal('E_UNIQUE');
                done();
            })
    });

    it("### FAIL NOT FOUND | FIND ONE user ###", (done) => {
        let req = request.get(`user/315`)
            .set("authorization", jwtToken)
            .expect(404)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### FAIL | FIND ONE user - string with parameter id ###", (done) => {
        let req = request.get(`user/felipeGomes`)
            .set("authorization", jwtToken)
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### FAIL | FIND ONE user - without parameter id ###", (done) => {
        let req = request.get(`user/`)
            .set("authorization", jwtToken)
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### SUCESS | FIND ONE user ###", (done) => {
        let req = request.get(`user/${idUser}`)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.username).to.equal('rogerioCabral');
                done();
            })
    });

    it("### SUCESS | PAGE LIST user ###", (done) => {
        let req = request.get(`user?pageNum=0&pageSize=5`)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body).to.be.an("array");
                done();
            })
    });

    it("### FAIL | PAGE LIST user without parameters ###", (done) => {
        let req = request.get(`user/`)
            .set("authorization", jwtToken)
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });


    it("### SUCESS | DELETE user ###", (done) => {
        let req = request.delete(`user/${idUser}`)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.text).to.equal('OK');
                done();
            })
    });

});