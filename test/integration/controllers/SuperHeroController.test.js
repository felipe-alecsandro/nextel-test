
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

    let jwtToken, idSuperHero = "";

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
    const superHero_2 = {
        "name": "The Flash",
        "alias": "Barry Allen",
        "protectionArea": {
            "name": "Starcity",
            "lat": "-38.8951100",
            "long": "-77.0363700",
            "radius": "1220"
        },
        "superPowers": [{
            "id": "1"
        }]
    };

    let superSeeders = [
        {
            "name": "Super Chock",
            "alias": "Bob Marley",
            "protectionArea": {
                "name": "Metrocarna",
                "lat": "-23.552565",
                "long": "-46.633783",
                "radius": "10000"
            },
            "superPowers": [{
                "id": 1
            }]
        },
        {
            "name": "Pegasus",
            "alias": "Seya",
            "protectionArea": {
                "name": "Grecia",
                "lat": "0.299376",
                "long": "15.357340",
                "radius": "1220"
            },
            "superPowers": [{
                "id": 1
            }]
        },
        {
            "name": "Super Flanelinha",
            "alias": "Jonas Price",
            "protectionArea": {
                "name": "Parada Inglesa city",
                "lat": "-23.563774",
                "long": "-46.653870",
                "radius": "10000"
            },
            "superPowers": [{
                "id": 1
            }]
        }
    ];

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

    it("### BASE | CREATE new superhero ###", (done) => {
        let req = request.post("superhero/")
            .send(superHero_1)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.name).to.equal('Super Man');
                expect(res.body.alias).to.equal('Clark kent');
                done();
            })
    });

    superSeeders.map( (obj , index) => {

        it(`### SEEDERS ${index} | CREATE new superhero to get help ###`, (done) => {
            let req = request.post("superhero/")
                .send(obj)
                .set("authorization", jwtToken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    done();
                })
        });
    });
    
    it("### SUCESS | FIND HELP  ###", (done) => {
        let req = request.get("helpme?latitude=-23.552532&longitude=-46.642692")
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.length).to.equal(2);
                done();
            })
    });

    it("### SUCESS | CREATE new superhero ###", (done) => {
        let req = request.post("superhero/")
            .send(superHero_2)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                idSuperHero = res.body.id;
                done();
            })
    });

    it("### FAIL NAME REQUIRED | CREATE new superhero ###", (done) => {
        let req = request.post("superhero/")
            .send({ "name": "", "alias": "Robert Patison" })
            .set("authorization", jwtToken)
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### FAIL UNIQUE NAME | UPDATE superhero ###", (done) => {
        let req = request.put(`superhero/${idSuperHero}`)
            .send({ "name": "Super Man", "alias": "Clark Kent" })
            .set("authorization", jwtToken)
            .expect(500)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.message.code).to.equal('E_UNIQUE');
                done();
            })
    });

    it("### FAIL NOT FOUND | FIND ONE superhero ###", (done) => {
        let req = request.get(`superhero/315`)
            .set("authorization", jwtToken)
            .expect(404)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### SUCESS | UPDATE superhero ###", (done) => {
        let req = request.put(`superhero/${idSuperHero}`)
            .send({ "name": "Spider man", "alias": "Peter Parker" })
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.name).to.equal('Spider man');
                expect(res.body.alias).to.equal('Peter Parker');
                done();
            })
    });

    it("### SUCESS | FIND ONE superhero ###", (done) => {
        let req = request.get(`superhero/${idSuperHero}`)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body.name).to.equal('Spider man');
                expect(res.body.alias).to.equal('Peter Parker');
                done();
            })
    });

    it("### SUCESS | PAGE LIST superhero ###", (done) => {
        let req = request.get(`superhero?pageNum=0&pageSize=5`)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.body).to.be.an("array");
                done();
            })
    });

    it("### FAIL | FIND HELP - without parameters ###", (done) => {
        let req = request.get("helpme")
            .set("authorization", jwtToken)
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            })
    });

    it("### SUCESS | DELETE superhero ###", (done) => {
        let req = request.delete(`superhero/${idSuperHero}`)
            .set("authorization", jwtToken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                expect(res.text).to.equal('OK');
                done();
            })
    });
});