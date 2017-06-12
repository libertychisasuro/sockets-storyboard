# sockets-storyboard

###Features

- Multiple clients access the storyboard and upload figures that will be displayed to the other clients.
- You can upload figures by drag and dropping or traditional file upload. Only image/png, image/jpeg and image/gif formats are supported.
- You can delete a figure by mousing over it and clicking on the trash icon.
- Responsive layout will allow mobile users to view the storyboard but no uploads.
- Status bar in top right displays the number of active sockets.
- Status bar in top right displays activity such as user typing.

###Backlog

- Persisting inline edits of figure descriptions.
- Support for video/mp4 with automated thumbnail generation.
- Uploads for mobile.

###Setup Instructions

1. Download and extract the source to your machine - eg c:/wamp/www/sockets-storyboard
2. From your commnd-line tool run: npm start
3. Open your first browser (first client) and go to localhost:3000
4. Open your second browser (second client) and go to localhost:3000
5. On appliation load you will see some previously added figures on the story board.
6. Drag and drop to uplaod new figures.
7. Mouseover a figure on the storyboard and start to edit the description -notice other connected clients will display the edits in real-time.


###How it Works

The application is designed to be fast and light. On the client-side vanilla JavaScript is used for interactions and DOM manipulation without overhead or dependencies on jQuery or view libraries. Communication betwen the client-side and server-side is handled using Websockets (socket.io). On the serversde ExpressJS is used is a minimal  web application framework (scaffolding, routing and file uploads). File uploads are handled using AJAX and a progress bar is also implemented for the larger file uploads.

To address the data persistance needs, LokiJS is used for its fast, in-memory document-oriented database. LokiJS synchs from the in-memory storage to a local JSON file.

###Stack used

 * [VanillaJS](http://vanilla-js.com "VanillaJS") a fast, lightweight, cross-platform framework for building incredible, powerful JavaScript applications.
 * [Node.js®](https://nodejs.org/en "Node.js®") is a JavaScript runtime built on Chrome's V8 JavaScript engine.
 * [Socket.IO](https://socket.io "Socket.IO") enables real-time bidirectional event-based communication.
 * [ExpressJS](https://expressjs.com "ExpressJS")  is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
 * [LokiJS](https://github.com/techfort/LokiJS "LokiJS") A fast, in-memory document-oriented datastore for node.js, browser and cordova.
 * [GruntJS](https://gruntjs.com "GruntJS") The JavaScript Task Runner.

