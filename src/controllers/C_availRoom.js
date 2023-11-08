const { findAvailRooms } = require("../models/M_AvailRoom");

const getAvailRooms = async (req, res) => {
  const availRoom = await findAvailRooms();

  res.status(200).json({ availRoom });
};

module.exports = { getAvailRooms };
