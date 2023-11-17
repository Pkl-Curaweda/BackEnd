const { Router } = require("express");
const {getCheckOut,getCheckOutId} = require("../controllers/Check Out/C_CheckOut");
const R_CheckOut = Router();


//?CHECKOUT RESERVATION
R_CheckOut.get("/", getCheckOut);
R_CheckOut.get("/:id", getCheckOutId);


module.exports = R_CheckOut;
