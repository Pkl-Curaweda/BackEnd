const roomClient = require("../Helpers/Config/Front Office/RoomConfig");

const findAvailRooms = async () => {
	const availRoom = await roomClient.findMany();
	return availRoom;
};

module.exports = { findAvailRooms };
