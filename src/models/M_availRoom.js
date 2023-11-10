const prisma = require("../db/index");

const findAvailRooms = async () => {
	const availRoom = await prisma.room.findMany();
	return availRoom;
};

module.exports = { findAvailRooms };
