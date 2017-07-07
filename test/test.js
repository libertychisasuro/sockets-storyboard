
var assert = require('assert');
var supertest = require('supertest');
var request = supertest('localhost:3000');
var _ = require('underscore');
var fs = require('fs');


describe('Server', function() {

    var server;

    var clearRequireCache = function() {
        /** Delete the previous server instance from the cache */
        delete require.cache[require.resolve('../index')];
    };

    before(function() {
        var sourceFile = './loki/db.json';
        var targetFile = './test/loki/db.json';

        fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
    });

    after(function() {
        var unix = Math.round(+ new Date() / 1000);
        var cookies = './uploads/cookies.png';
        var targetFile = './loki/db.json';
        var sourceFile = './test/loki/db.json';
        var outputFile = './test/output/' + unix + '-db.json';

        fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
        fs.unlinkSync(cookies);
    });

    beforeEach(function() {
        clearRequireCache();
        server = require('../index');
    });

    afterEach(function(done) {
        server.close(done);
    });

    it('responds to /', function testHomepage(done) {
        request.get('/')
            .expect(200, done);
    });

    it('POST /upload with no file', function testUploadNoFile(done) {
        request.post('/upload')
            .expect(400, done);
    });

    it('POST /upload with file', function testUploadWithFile(done) {
        request.post('/upload')
            .field('Content-Type', 'multipart/form-data')
            .field('name', 'uploadForm')
            .field('description', 'storyboard+image')
            .attach('fileInput', './test/uploads/cookies.png')
            .end(function (error, response) {
                assert.equal(response.status, 200);
                done();
            });
    });

});
