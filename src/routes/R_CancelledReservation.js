const { Router } = require("express");
const getCancelledReservation = require("../controllers/C_CancelledReservation");

const R_CancelledReservation = Router();
R_CancelledReservation.get("/", getCancelledReservation);

module.exports = R_CancelledReservation;
