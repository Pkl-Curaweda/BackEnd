const { getAvailRooms } = require("../controllers/C_availRoom");
const { Router } = require("express");
const R_availRoom = Router();

R_availRoom.get("/", getAvailRooms);

module.exports = R_availRoom;
