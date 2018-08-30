
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

    let jwtToken, idSuperPower = "";

    const superPower_1 = {
        "name": "super strength",
        "description": "superhuman strength"
    };
    const superPower_2 = {
        "name": "hyper speed",
        "description": "incomparable speed"
    };

    const superHero_1 = {
        "name": "Super Man",
        "alias": "Clark kent",
        "protectionArea": {
            "name": "Gothan city",
            "lat": "-25.3222100",
            "long": "-22.2211422",
            "radius": "1220"
        },
        "superPowers": [{
            "id": 1
        }]
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

    it("### LOGIN ###", (done) => {
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

    it("### BASE | CREATE new superpower ###", (done) => {
        let req = request.post("superpower/")
            .send(superPower_1)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.name).to.equal('super strength');
                expect(res.body.description).to.equal('superhuman strength');
                done();
            })
    });

    it("### SUCESS | CREATE new superpower ###", (done) => {
        let req = request.post("superpower/")
            .send(superPower_2)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                idSuperPower = res.body.id;
                done();
            })
    });

    it("### FAIL NAME REQUIRED | CREATE new superpower ###", (done) => {
        let req = request.post("superpower/")
            .send({ "name": "", "description": "Freezing with his own hands" })
            .set("authorization", jwtToken)
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### SUCESS | UPDATE superpower ###", (done) => {
        let req = request.put(`superpower/${idSuperPower}`)
            .send({ "name": "iron fist", "description": "just a test" })
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.name).to.equal('iron fist');
                expect(res.body.description).to.equal('just a test');
                done();
            })
    });

    it("### FAIL UNIQUE NAME | UPDATE superpower ###", (done) => {
        let req = request.put(`superpower/${idSuperPower}`)
            .send({ "name": "super strength", "description": "just a test" })
            .set("authorization", jwtToken)
            .expect(500)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.message.code).to.equal('E_UNIQUE');
                done();
            })
    });

    it("### FAIL NOT FOUND | FIND ONE superpower ###", (done) => {
        let req = request.get(`superpower/315`)
            .set("authorization", jwtToken)
            .expect(404)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### SUCESS | FIND ONE superpower ###", (done) => {
        let req = request.get(`superpower/${idSuperPower}`)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.name).to.equal('iron fist');
                expect(res.body.description).to.equal('just a test');
                done();
            })
    });

    it("### FAIL | FIND ONE superpower with parameter string ###", (done) => {
        let req = request.get(`superpower/hyperspeed`)
            .set("authorization", jwtToken)
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### SUCESS | PAGE LIST superpower ###", (done) => {
        let req = request.get(`superpower?pageNum=0&pageSize=5`)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body).to.be.an("array");
                done();
            })
    });
    
    it("### FAIL | PAGE LIST superpower without query parameters ###", (done) => {
        let req = request.get(`superpower`)
            .set("authorization", jwtToken)
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### SUCESS | DELETE superpower ###", (done) => {
        let req = request.delete(`superpower/${idSuperPower}`)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.text).to.equal('OK');
                done();
            })
    });

    var idSP = '';
    
    it("### BASE | CREATE new superpower to remove link with superhero  ###", (done) => {
        let req = request.post("superpower/")
            .send({
                "name": "Fire eyes",
                "description": "bla bla"
            })
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                idSP = res.body.id;
                done();
            })
    });

    it("### BASE | CREATE new superhero to remove superpower ###", (done) => {
        let req = request.post("superhero/")
            .send({
                "name": "Wonder Woman",
                "alias": "Diana Price",
                "protectionArea": {
                    "name": "Gothan city",
                    "lat": "-25.3222100",
                    "long": "-22.2211422",
                    "radius": "1220"
                },
                "superPowers": [{
                    "id": idSP
                }]
            })
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.name).to.equal('Wonder Woman');
                expect(res.body.alias).to.equal('Diana Price');
                done();
            })
    });


    it("### FAIL DATA LINKED | DELETE superpower ###", (done) => {
        let req = request.delete(`superpower/${idSP}`)
            .set("authorization", jwtToken)
            .expect(500)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

});