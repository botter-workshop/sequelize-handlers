const assert = require('assert');
const request = require('supertest');
const { app } = require('./app');

describe('handlers', function () {
    describe('get', function () {
        it('should return json', function (done) {
            request(app)
                .get('/users/1')
                .expect(200)
                .end((err, res) => {
                    assert.equal(res.body.id, 1);
                    assert.equal(res.body.username, 'test');
                    assert.equal(res.body.birthday, '1999-12-31T00:00:00.000Z');
                    done();
                });
        });
        
        it('should return not found', function (done) {
            request(app)
                .get('/users/0')
                .expect(404)
                .end(done);
        });
    });

    describe('create', function () {
        it('should create a new instance', function (done) {
            request(app)
                .post('/users')
                .send({ username:'othertest', birthday:'01/01/00' })
                .expect(201)
                .expect({ success: true }, function () {
                    request(app)
                        .get('/users/2')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .end((err, res) => {
                            assert.equal(res.body.id, 2);
                            assert.equal(res.body.username, 'othertest');
                            assert.equal(res.body.birthday, '2000-01-01T00:00:00.000Z');
                            done();
                        });
                });
        });
    });

    describe('query', function () {
        it('should respond with json', function (done) {
            request(app)
                .get('/users')
                .expect(200)
                .end((err, res) => {
                    assert.equal(res.body.length, 2);
                    done();
                });
        });
        
        it('should filter based on a field', function (done) {
            request(app)
                .get("/users?username=test")
                .expect(200)
                .end((err, res) => {
                    assert.equal(res.body.length, 1);
                    done();
                });
        });
        
        it('should limit results', function (done) {
            request(app)
                .get("/users?limit=1")
                .expect(206)
                .end((err, res) => {
                    assert.equal(res.body.length, 1);
                    done();
                });
        });
        
        it('should offset results', function (done) {
            request(app)
                .get("/users?offset=1")
                .expect(200)
                .end((err, res) => {
                    assert.equal(res.body.length, 1);
                    done();
                });
        });
        
        it('should send only the requested fields', function (done) {
            request(app)
                .get("/users?fields=username")
                .expect(200)
                .end((err, res) => {
                    assert.equal(res.body.length, 2);
                    assert.deepEqual(res.body[0], { username:'test' });
                    done();
                });
        });
        
        it('should sort results', function (done) {
            request(app)
                .get("/users?sort=username")
                .expect(200)
                .end((err, res) => {
                    assert.equal(res.body.length, 2);
                    assert.equal(res.body[0].id, 2);
                    done();
                });
        });

        it('should handle complex queries', function (done) {
            request(app)
                .post('/users')
                .send({ username:'lasttest', birthday:'8/29/18' })
                .set('Accept', 'application/json')
                .expect(201)
                .expect({success: true}, function () {
                    request(app)
                        .get('/users?limit=1&offset=1&fields=username,id')
                        .expect(206)
                        .end((err, res) => {
                            assert.equal(res.body.length, 1);
                            assert.equal(res.body[0].id, 2);
                            assert.equal(res.body[0].username, 'othertest');
                            assert.equal(res.body[0].birthday, undefined);
                            done();
                        });
                });
        });
    });

    describe('update', function () {
        it('should update an existing instance', function (done) {
            request(app)
                .put('/users/2')
                .send({ username:'changed' })
                .expect(201)
                .expect({success: true}, function() {
                    request(app)
                        .get('/users/2')
                        .expect(200)
                        .end((err, res) => {
                            assert.equal(res.body.id, 2);
                            assert.equal(res.body.username, 'changed');
                            assert.equal(res.body.birthday, '2000-01-01T00:00:00.000Z');
                            done();
                        });
                });
        });
        
        it('should return not found', function (done) {
            request(app)
                .put('/users/0')
                .send({ username:'changed' })
                .expect(404)
                .end(done);
        });
    });

    describe('remove', function() {
        it('should delete an instance', function(done) {
            request(app)
                .delete('/users/2')
                .expect(204)
                .expect({success: true}, function() {
                    request(app)
                        .get('/users')
                        .expect(200)
                        .end((err, res) => {
                            assert.equal(res.body.length, 2);
                            done();
                        });
                });
        });
        
        it('should return not found', function (done) {
            request(app)
                .delete('/users/0')
                .expect(404)
                .end(done);
        });
    });
});
