const { Router } = require("express");
const {
	getShowroom,
	getCorrection,
	deleteResv,
} = require("../controllers/C_Reservation");
const R_Reservation = new Router();

R_Reservation.get("/", (req, res) => {
	res.send("You are in Reservation");
});

R_Reservation.get("/correction", getCorrection);
R_Reservation.delete("/delete/:id", deleteResv);
R_Reservation.get("/showroom/:id", getShowroom);

module.exports = R_Reservation;
