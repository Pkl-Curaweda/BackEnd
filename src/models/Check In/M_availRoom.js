const { prisma } = require("../../../prisma/seeder/config");
const { roomClient } = require("../Helpers/Config/Front Office/RoomConfig");

const findAvailRooms = async () => {
	const availRoom = await roomClient.findMany();
	return availRoom;
};

module.exports = { findAvailRooms };

//? SORTING ROOM AVAILABILIY
const filterRoomAvailabiy = async (roomType, roomId, bedSetup) => {
	const roomAvail = await prisma.room.findMany({
		where: {
			AND: [
				roomType ? { roomType: roomType } : {},
				roomId ? { id: parseInt(roomId) } : {},
				bedSetup ? { bedSetup: bedSetup } : {},
			]
		}
	});

	return roomAvail;
}

module.exports = {
	filterRoomAvailabiy,
}
