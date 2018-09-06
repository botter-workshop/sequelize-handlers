const request = require('supertest');
var { app } = require('./helper');
var chai = require('chai');
expect = chai.expect;

describe('handlers', function () {
    describe('get', function () {
        it('should respond with correct json', function(done) {
            request(app)
                .get('/user/1')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body.id).to.equal(1);
                    expect(res.body.username).to.equal('test');
                    expect(res.body.birthday).to.equal('1999-12-31T00:00:00.000Z');
                    done();
                });
        });
    });

    describe('create', function() {
        it('should create a new instance', function(done) {
            request(app)
                .post('/user')
                .send({username:'othertest', birthday:'01/01/00'})
                .set('Accept', 'application/json')
                .expect(201)
                .expect({success: true}, function() {
                    request(app)
                        .get('/user/2')
                        .set('Accept', 'application/json')
                        .end((err, res) => {
                            expect(res.statusCode).to.equal(200);
                            expect(res.body.id).to.equal(2);
                            expect(res.body.username).to.equal('othertest');
                            expect(res.body.birthday).to.equal('2000-01-01T00:00:00.000Z');
                            done();
                        });
                });
        });
    });

    describe('query', function() {
        it('should respond with json', function(done) {
            request(app)
                .get('/user')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.lengthOf(2);
                    done();
                });
        });
        it('should filter based on a field', function(done) {
            request(app)
                .get("/user?username=test")
                .set('Accept', 'application/json')
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.lengthOf(1);
                    done();
                });
        });
        it('should limit results', function(done) {
            request(app)
                .get("/user?limit=1")
                .set('Accept', 'application/json')
                .end((err, res) => {
                    expect(res.statusCode).to.equal(206);
                    expect(res.body).to.have.lengthOf(1);
                    done();
                });
        });
        it('should offset results', function(done) {
            request(app)
                .get("/user?offset=1")
                .set('Accept', 'application/json')
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.lengthOf(1);
                    done();
                });
        });
        it('should send only the requested fields', function(done) {
            request(app)
                .get("/user?fields=username")
                .set('Accept', 'application/json')
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.lengthOf(2);
                    expect(res.body[0]).to.deep.equal({username:'test'})
                    done();
                });
        });
        it('should sort results', function(done) {
            request(app)
                .get("/user?sort=username")
                .set('Accept', 'application/json')
                .end((err, res) => {
                    expect(res.statusCode).to.equal(200);
                    expect(res.body).to.have.lengthOf(2);
                    expect(res.body[0].id).to.equal(2);
                    done();
                });
        });

        it('should handle complex queries', function(done) {
            request(app)
                .post('/user')
                .send({username:'lasttest', birthday:'8/29/18'})
                .set('Accept', 'application/json')
                .expect(201)
                .expect({success: true}, function() {
                    request(app)
                        .get('/user?limit=1&offset=1&fields=username,id')
                        .set('Accept', 'application/json')
                        .end((err, res) => {
                            expect(res.statusCode).to.equal(206);
                            expect(res.body).to.have.lengthOf(1);
                            expect(res.body[0].id).to.equal(2);
                            expect(res.body[0].username).to.equal('othertest');
                            expect(res.body[0].birthday).to.undefined;
                            done();
                        });
                });
        });
    });

    describe('update', function() {
        it('should update an existing instance', function(done) {
            request(app)
                .put('/user/2')
                .send({username:'changed'})
                .set('Accept', 'application/json')
                .expect(201)
                .expect({success: true}, function() {
                    request(app)
                        .get('/user/2')
                        .set('Accept', 'application/json')
                        .end((err, res) => {
                            expect(res.statusCode).to.equal(200);
                            expect(res.body.id).to.equal(2);
                            expect(res.body.username).to.equal('changed');
                            expect(res.body.birthday).to.equal('2000-01-01T00:00:00.000Z');
                            done();
                        });
                });
        });
    });

    describe('remove', function() {
        it('should delete an instance', function(done) {
            request(app)
                .delete('/user/2')
                .set('Accept', 'application/json')
                .expect(204)
                .expect({success: true}, function() {
                    request(app)
                        .get('/user')
                        .set('Accept', 'application/json')
                        .end((err, res) => {
                            expect(res.statusCode).to.equal(200);
                            expect(res.body).to.have.lengthOf(2);
                            done();
                        });
                });
        });
    });
});
