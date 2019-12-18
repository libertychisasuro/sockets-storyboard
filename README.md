# sockets-storyboard

## Features

- Multiple clients collaborate on the same storyboard.
- Upload figures by drag and dropping or traditional file upload. Only PNG, JPEG and GIF formats supported.
- Delete a figure by mousing over it and clicking on the trash icon.
- Status bar in top right displays the number of active sockets.
- Status bar in top right displays activity such as user typing.

## How it Works

On the client-side vanilla JavaScript is used for interactions and DOM manipulation - no dependencies. Communication between the client-side and server-side is handled using Websockets (socket.io). On the server-side ExpressJS is used as a minimal web application framework (scaffolding, routing and file uploads). File uploads are handled using AJAX.

To address the data persistence needs, LokiJS is used for its fast, in-memory document-oriented database. LokiJS synchs from the in-memory storage to a local JSON file.

![Screenshot](/screenshots/screenshot.gif?raw=true)

## Backlog

- Persist inline edits of figure descriptions.
- Support for rooms.
- Support for MP4 video with automated thumbnail generation.
- CSS animations and transitions.
- Drag and drop to re-order figures.
- Validation for large files.
- Uploads for mobile.

## Setup

_Install project dependencies_

```
npm install
```

_Start application_

```
npm start
```

3. Open your first browser (first client) and go to localhost:3000
4. Open your second browser (second client) and go to localhost:3000
5. On application load you will see some previously added figures on the story board.

## Tests

1. From your terminal go to sockets-storyboard/ and run:

```
npm test
```

## Browser Support

- Chrome
- Firefox

## Stack

- [VanillaJS](http://vanilla-js.com "VanillaJS") a fast, lightweight, cross-platform framework for building incredible, powerful JavaScript applications.
- [Node.js](https://nodejs.org/en "Node.js�") is a JavaScript runtime built on Chrome's V8 JavaScript engine.
- [Socket.IO](https://socket.io "Socket.IO") enables real-time bidirectional event-based communication.
- [ExpressJS](https://expressjs.com "ExpressJS") is a minimal and flexible Node.js web application framework.
- [LokiJS](https://github.com/techfort/LokiJS "LokiJS") A fast, in-memory document-oriented datastore for node.js, browser and cordova.
- [GruntJS](https://gruntjs.com "GruntJS") The JavaScript Task Runner.
