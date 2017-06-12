/**
 * Created by lchisasuro on 08/06/2017.
 */

var Storyboard = (function() {
  
    var socket = io();
    var uploadForm = document.getElementById('uploadForm');
    var upload = document.getElementById('upload');
    var figures = document.getElementById('figures');
    var uploadContent = document.getElementById('upload-content'),
        progress = document.getElementById('progress'),
        acceptedTypes = {
            'image/png': true,
            'image/jpeg': true,
            'image/gif': true
        };

    var deleteFromStoryBoard = function(filename) {
        socket.emit('delete', filename);
    };

    var clearStoryBoard = function () {
        var range = document.createRange();

        range.selectNodeContents(figures);
        range.deleteContents();
    };

    var typing = false;
    var typingTimeout = undefined;

    var typingCompleteCallback = function() {
        typing = false;
        socket.emit('typing', false);
    };

    var getFigureId = function(id) {
        return 'figure-' + id;
    };

    var getLabelId = function(id) {
        return 'label-' + id;
    };

    var loadStoryBoard = function (images) {
        var image = new Image();

        if(images.length == 0) return;

        image.onload = function() {
            var id = images[0].$loki;
            var fileName = images[0].name;
            var description = images[0].description;
            var figure = document.createElement('li');
            var figureId = getFigureId(id);
            var label = document.createElement('span');
            var labelId = getLabelId(id);
            var labelText = document.createTextNode(description.substring(0, 17));
            var icon = document.createElement('i');
            var iconText = document.createTextNode('delete');

            figures.appendChild(figure);

            figure.setAttribute('class', 'figure');
            figure.setAttribute('id', figureId);
            figure.appendChild(image);
            figure.appendChild(label);
            figure.appendChild(icon);

            label.setAttribute('id', labelId);
            label.appendChild(labelText);

            icon.setAttribute('class', 'material-icons');
            icon.setAttribute('data-id', id);
            icon.setAttribute('data-filename', fileName);
            icon.appendChild(iconText);

            initDeleteIcon(icon);
            initLabelEditing(label);
            initLabelActivity(label);

            images.splice(0, 1);

            loadStoryBoard(images);
        };

        image.src = '/uploads/' + images[0].name;
    };

    var initDeleteIcon = function(icon) {
        icon.addEventListener('click', function() {
            deleteFromStoryBoard(this.getAttribute('data-filename'));
        }, true);
    };

    var initLabelEditing = function(label) {
        label.contentEditable = 'true';

        label.addEventListener('keydown', function(e) {
            if(e.keyCode === 13) {
                e.preventDefault();
                return false;
            }

            if(this.textContent.length === 18 && e.keyCode !== 8) {
                e.preventDefault();
            }

            socket.emit('syncText', {
                id: this.id,
                textContent: this.textContent
            });
        }, true);
    };

    var initLabelActivity = function(label) {
        label.addEventListener('keypress', function(e) {
            if (e.which !== 13) {
                if (typing === false && this === document.activeElement) {
                    typing = true;
                    socket.emit('typing', true);
                } else {
                    clearTimeout(typingTimeout);
                    typingTimeout = setTimeout(typingCompleteCallback, 3000);
                }
            }
        }, true);
    };

    var uploadFiles = function(files) {
        var formData = new FormData();
        var xhr = new XMLHttpRequest();
        var file = files[0] || null;

        if(files.length === 0) return console.log('No files to upload');

        formData.append('uploadForm', file);

        xhr.open('post', '/upload', true);
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                var complete = (e.loaded / e.total * 100 | 0);
                progress.value = complete;
                console.log('Progress ' + complete + '%');
            }
        };

        xhr.onload = function () {
            resetProgress();
            resetFileInput();
        };

        xhr.onerror = function (e) {
            console.log(e);
        };

        xhr.send(formData);
    };

    var resetProgress = function() {
        progress.value = 0;
    };

    var resetFileInput = function() {
        document.getElementById('fileInput').value = '';
    };

    var initializeDragAndDrop = function() {
        var fileInput = document.getElementById('fileInput');

        fileInput.addEventListener('change', function(e) {
            uploadFiles(e.target.files);
        }, true);

        uploadContent.ondragover = function (e) {
            this.className = 'hover';
            return false;
        };

        uploadContent.ondragend = function (e) {
            this.className = '';
            return false;
        };

        uploadContent.ondragleave = function (e) {
            this.className = '';
            return false;
        };

        uploadContent.ondrop = function (e) {
            this.className = '';
            e.preventDefault();
            uploadFiles(e.dataTransfer.files);
        };
    };

    var initMediaQuery = function() {
        /** Hide upload section on small screens */
        window.matchMedia('(max-width: 768px)').addListener(function(media) {
            if (media.matches) {
                document.getElementById('upload').setAttribute('class', 'hidden');
            } else {
                document.getElementById('upload').setAttribute('class', '');
            }
        });
    };

    var initSocketBindings = function() {
        /** Request storyboard */
        socket.emit('load');

        socket.on('syncStoryboard', function(reponse) {
            clearStoryBoard();
            loadStoryBoard(reponse);
            console.log('Syncing boards');
        });

        socket.on('syncStoryboardOnDelete', function() {
            socket.emit('load');
        });

        socket.on('syncStoryboardOnUpload', function() {
            socket.emit('load');
        });

        socket.on('syncSockets', function(socketsCount) {
            document.getElementById('activity').innerText = 'connected sockets: ' + socketsCount;
        });

        socket.on('syncText', function(target) {
            document.getElementById(target.id).innerText = target.textContent;
        });

        socket.on('isTyping', function(reponse) {
            if (reponse.message) {
                document.getElementById('activity').innerText = reponse.message;
                typingTimeout = setTimeout(typingCompleteCallback, 3000);
            } else {
                /** Request storyboard status */
                socket.emit('typingComplete');
            }
        });
    };

    return {
        initializeDragAndDrop: initializeDragAndDrop,
        initMediaQuery: initMediaQuery,
        initSocketBindings: initSocketBindings
    };

})();

window.addEventListener('DOMContentLoaded', function() {

    console.log('DOMContentLoaded');

    Storyboard.initSocketBindings();
    Storyboard.initMediaQuery();
    Storyboard.initializeDragAndDrop();

    //debugger;

}, true);


