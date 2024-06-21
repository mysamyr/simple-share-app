const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const { EVENTS } = require("./constants");
const { addUser, getRoom, updateMessage, removeUser } = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));

io.on(EVENTS.CONNECTION, (socket) => {
	const userId = socket.id;

	socket.on(EVENTS.JOIN, (room, callback) => {
		const { newRoom, message, error } = addUser(userId, room);

		if (error) return callback(error);

		socket.join(newRoom);
		// eslint-disable-next-line no-console
		console.log(`${userId} has joined to ${newRoom} room`);

		callback(null, newRoom, message);
	});

	socket.on(EVENTS.SEND, (message, callback) => {
		const room = getRoom(userId);

		updateMessage(room, message);
		// eslint-disable-next-line no-console
		console.log(`${userId} has sent a message ${message}`);

		io.to(room).emit(EVENTS.UPDATE, message);
		callback();
	});

	socket.on(EVENTS.LEAVE, () => {
		const room = getRoom(userId);

		removeUser(userId, room);
		// eslint-disable-next-line no-console
		console.log(`${userId} has left the room`);
	});

	socket.on(EVENTS.DISCONNECT, () => {
		const room = getRoom(userId);

		if (room) removeUser(userId, room);
		// eslint-disable-next-line no-console
		console.log(`${userId} has been disconnected`);
	});
});

server.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Server is listening on port ${PORT}`);
});
