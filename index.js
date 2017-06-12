/**
 * Created by lchisasuro on 08/06/2017.
 */

var express = require('express');
var expressFileUpload = require('express-fileupload');
var underscore = require('underscore');

var Loki = require('lokijs');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var DB_NAME = 'db.json';
var COLLECTION_NAME = 'storyboard';
var UPLOAD_PATH = './uploads/';
var collection = null;

var onDataLoadedCallback = function() {
    console.log('Database ready');
};

/** autoloadCallback referenced in loki constructor */
var databaseInitialize = function() {
    collection = db.getCollection(COLLECTION_NAME);

    if (collection === null) {
        collection = db.addCollection(COLLECTION_NAME);
    }

    onDataLoadedCallback();
};

var db = new Loki(DB_NAME, {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true,
    autosaveInterval: 5000,
    persistenceMethod: 'fs'
});

var getCollection = function() {
    return collection.find({});
};

var addToCollection = function(data) {
    collection.insert(data);
};

var deleteFromCollection = function(name) {
    collection.chain().find({name: name}).remove();
};


/** Handle socket events after client connects */
io.on('connection', function(socket) {

    console.log('Socket ' + socket.id + ' connected');

    socket.on('disconnect', function(){
        socket.leave('storyboard');
        io.emit('syncSockets', io.engine.clientsCount);

        console.log('Socket ' + socket.id + ' disconnected');
    });

    socket.join('storyboard');

    io.emit('syncSockets', io.engine.clientsCount);

    socket.on('load', function() {
        var result = getCollection();

        /** only sync to the current client */
        io.to(socket.id).emit('syncStoryboard', result);
    });

    socket.on('typing', function() {
        socket.broadcast.emit('isTyping', {
            message: socket.id + ' is typing ..'
        });
    });

    socket.on('typingComplete', function() {
        io.emit('syncSockets', io.engine.clientsCount);
    });

    socket.on('syncText', function(element) {
        socket.broadcast.emit('syncText', element);
    });

    socket.on('delete', function(filename) {
        /** delete entry from collection */
        deleteFromCollection(filename);

        fs.unlink(UPLOAD_PATH + filename, function() {
            io.emit('syncStoryboardOnDelete');
        });
    });

});


/** The http server listen on port 3000. */
http.listen(3000, function() {
    console.log('listening on *:3000');
});

/** Express middle-ware configurations */
app.use(express.static(__dirname + '/'));

app.use(expressFileUpload({
    safeFileNames: false,
    preserveExtension: true,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
}));


/** Express initializes app to be a function handler that you can supply to an HTTP server */
app.get('/', function(request, response) {
    /** Serve index.html when users hit the homepage on route / */
    response.sendFile(__dirname + '/index.html');
});

/** File uploads route */
app.post('/upload', function(request, response) {
    var file = request.files.uploadForm || null;
    var fileName = file.name;

    if (!request.files) {
        return response.status(400).send('No files uploaded');
    }

    file.mv(UPLOAD_PATH + fileName, function(error) {

        addToCollection({
            name : file.name,
            description:  file.name,
            fileType: file.type
        });

        io.emit('syncStoryboardOnUpload');

        if (error) {
            response.status(400).send(error);
        } else {
            response.status(200).send(true);
        }
    });
});
