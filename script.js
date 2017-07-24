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
    var TIMEOUT_INTERVAL = 1000;

    var typingCompleteCallback = function() {
        socket.emit('typingComplete');
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

            figure.setAttribute('draggable', 'true');
            figure.setAttribute('class', 'figure');
            figure.setAttribute('id', figureId);
            figure.appendChild(image);
            figure.appendChild(label);
            figure.appendChild(icon);

            figure.addEventListener('dragstart', function() {
                //@todo
            });

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

    /**
     * @link http://keycode.info/
     * @param label
     */
    var initLabelEditing = function(label) {
        label.contentEditable = 'true';

        label.addEventListener('keydown', function(e) {
            if (this === document.activeElement) {
                if(e.keyCode === 8) {
                    return true;
                }

                if(e.keyCode === 13) {
                    e.preventDefault();
                    return false;
                }

                if(this.textContent.length === 18) {
                    e.preventDefault();
                    return false;
                }
            }
        }, true);
    };

    var initLabelActivity = function(label) {
        label.addEventListener('keyup', function(e) {
            if (this === document.activeElement) {
                clearTimeout(typingTimeout);

                socket.emit('typing', true);
                socket.emit('typingText', {
                    id: this.id,
                    textContent: this.textContent
                });

                typingTimeout = setTimeout(function () {
                    typingCompleteCallback();
                }, TIMEOUT_INTERVAL);
            }
        }, true);
    };

    var uploadFiles = function(files) {
        var formData = new FormData();
        var xhr = new XMLHttpRequest();
        var file = files[0] || null;

        if(files.length === 0) return console.log('No files to upload');

        formData.append('fileInput', file);

        xhr.open('post', '/upload', true);
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                progress.style.width = (e.loaded / e.total * 100 | 0) + '%';
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
        progress.style.width = '0%';
    };

    var resetFileInput = function() {
        document.getElementById('fileInput').value = '';
    };

    var initDragAndDrop = function() {
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

        socket.on('isTyping', function(socketId) {
            document.getElementById('activity').innerText = socketId + ' is typing ..';
        });
    };

    var drawConnectors = function() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var namespace = svg.namespaceURI;
        var line = document.createElementNS(namespace, 'line');

        line.setAttribute('x1', 0);
        line.setAttribute('y1', 0);
        line.setAttribute('x2', 500);
        line.setAttribute('y2', 500);
        line.setAttribute('stroke','#00cc00');
        line.setAttribute('stroke-width', 2);

        svg.appendChild(line);

        figures.appendChild(svg);
    };

    return {
        initDragAndDrop: initDragAndDrop,
        initMediaQuery: initMediaQuery,
        initSocketBindings: initSocketBindings,
        drawConnectors: drawConnectors
    };

})();

window.addEventListener('DOMContentLoaded', function() {

    console.log('DOMContentLoaded');

    Storyboard.initSocketBindings();
    Storyboard.initMediaQuery();
    Storyboard.initDragAndDrop();

    //debugger;

}, true);


