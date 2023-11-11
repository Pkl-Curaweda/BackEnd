const roomClient = require("./config");


const findAvailRooms = async () => {
	const availRoom = await roomClient.findMany();
	return availRoom;
};

module.exports = { findAvailRooms };
