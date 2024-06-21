const rooms = {};

const generateNewKey = () => {
	// todo change to better generator
	const existingKeys = Object.keys(rooms);
	for (let i = 1; i < 999; i++) {
		const key = `${i}`.padStart(3, "0");
		if (!existingKeys.includes(key)) {
			return { newRoom: key };
		}
	}
	return { error: "There is no plane to put your note. Please, wait." };
};

const getRoom = (userId) => {
	const room = Object.entries(rooms).find(([, { users }]) =>
		users.includes(userId),
	);
	return room && room[0];
};

module.exports = {
	getRoom,
	addUser: (user, room) => {
		if (!room) {
			const { newRoom, error } = generateNewKey();
			if (error) return { error };
			rooms[newRoom] = {
				t: "",
				users: [],
			};
			rooms[newRoom].users.push(user);
			return { newRoom };
		}
		if (!rooms[room]) {
			return { error: "Room doesn't exist" };
		}
		rooms[room].users.push(user);

		return { newRoom: room, message: rooms[room].t };
	},
	updateMessage: (room, msg) => {
		rooms[room].t = msg;
	},
	removeUser: (userId) => {
		const roomDetails = getRoom(userId);
		if (!roomDetails) return;
		const room = rooms[roomDetails[0]];
		if (room.users.length === 1) {
			delete rooms[roomDetails[0]];
			return;
		}
		room.users = room.users.filter((u) => u !== userId);
	},
};
