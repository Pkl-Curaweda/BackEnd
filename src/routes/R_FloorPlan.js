const { Router } = require("express");
const {getStatus,getAvailable} = require("../controllers/C_FloorPlan.js");

const R_FloorPlan = Router();
R_FloorPlan.get("/", getStatus);
R_FloorPlan.get("/avail", getAvailable );

module.exports = R_FloorPlan;
