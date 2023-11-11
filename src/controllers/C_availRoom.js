const { findAvailRooms } = require("../models/Room/M_availRoom");

const getAvailRooms = async (req, res) => {
	const availRoom = await findAvailRooms();
	res.status(200).json({ availRoom });
};

module.exports = { getAvailRooms };
