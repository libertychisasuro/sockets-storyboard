
var fs = require('fs');
var _ = require('underscore');
var assert = require('assert');
var supertest = require('supertest');
var request = supertest('localhost:3000');
var socket = require('socket.io-client');

const SOCKET_HOST = 'http://localhost:3000';
const SOCKET_OPTIONS = {
    transports: ['websocket'],
    autoConnect: false
};


describe('Server', function() {

    var server;
    var cookiesImage = './uploads/cookies.png';

    var setUp = function() {
        supressConsole();
        clearDatabase();
        clearRequireCache();
        clearUploads();

        server = require('../index');
    };

    var tearDown = function(done) {
        clearDatabase();
        clearUploads();

        server.close(done);
    };

    var clearRequireCache = function() {
        /** Delete the previous server instance from the cache */
        delete require.cache[require.resolve('../index')];
    };

    var clearUploads = function() {
        if (fs.existsSync(cookiesImage)) {
            fs.unlinkSync(cookiesImage);
        }
    };

    var clearDatabase = function() {
        var sourceFile = './test/loki/db.json';
        var targetFile = './loki/db.json';

        fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
    };

    var supressConsole = function() {
        console.info = function() {
            return;
        };
    };

    before(function() {
        setUp();
    });

    after(function(done) {
        tearDown(done);
    });

    beforeEach(function() {

    });

    afterEach(function(done) {
        done();
    });

    it('GET /', function testHomepage(done) {

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

    it('Should broadcast sockets count to all clients on connect', function testClientConnect(done) {

        var client1 = socket.connect(SOCKET_HOST, SOCKET_OPTIONS);
        var client2 = socket.connect(SOCKET_HOST, SOCKET_OPTIONS);
        var expectedClients = 1;

        client1.open();
        client1.emit('load');
        client1.on('syncSockets', function(socketsCount) {
            assert.equal(expectedClients, socketsCount);
            client1.disconnect();
            client2.disconnect();
            done();
        });

        client2.open();
        client2.emit('load');
    });

    it('Should broadcast sockets count to all clients on disconnect', function testClientDisconnect(done) {

        var client1 = socket.connect(SOCKET_HOST, SOCKET_OPTIONS);
        var client2 = socket.connect(SOCKET_HOST, SOCKET_OPTIONS);
        var expectedClients = 1;

        client1.open();
        client1.emit('load');

        client2.on('syncSockets', function(socketsCount) {
            assert.equal(expectedClients, socketsCount);
            client2.disconnect();
            done();
        });

        client2.open();
        client2.emit('load');

        client1.disconnect();
    });

    it('Should broadcast "is typing" message to all clients', function testIsTyping(done) {

        var client1 = socket.connect(SOCKET_HOST, SOCKET_OPTIONS);
        var client2 = socket.connect(SOCKET_HOST, SOCKET_OPTIONS);
        var expectedId = '#testClient1';
        var expectedContent = 'Hello world..';
        var expectedSocketId;

        client1.open();
        client1.emit('load');
        client2.open();
        client2.emit('load');

        client1.on('connect', function() {
            expectedSocketId = client1.id;
        });

        client2.on('isTyping', function(socketId) {
            assert.equal(expectedSocketId, socketId);
        });

        client2.on('syncText', function(target) {
            assert.equal(expectedId, target.id);
            assert.equal(expectedContent, target.textContent);
            client1.disconnect();
            client2.disconnect();
            done();
        });

        client1.emit('typing', true);
        client1.emit('typingText', {
            id: '#testClient1',
            textContent: 'Hello world..'
        });
    });

    it('Should delete cookies.png from database and filesystem', function testDelete(done) {

        var client1 = socket.connect(SOCKET_HOST, SOCKET_OPTIONS);
        var client2 = socket.connect(SOCKET_HOST, SOCKET_OPTIONS);
        var afterCallback;

        afterCallback = _.after(2, function() {
            done();
        });

        client1.open();
        client1.emit('load');
        client2.open();
        client2.emit('load');

        client1.on('syncStoryboardOnDelete', function() {
            afterCallback();
            client1.disconnect();
        });

        client2.on('syncStoryboardOnDelete', function() {
            afterCallback();
            client2.disconnect();
        });

        client1.emit('delete', 'cookies.png');
    });

});
