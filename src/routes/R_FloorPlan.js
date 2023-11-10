const { Router } = require("express");
const getStatus = require("../controllers/C_FloorPlan.js");

const R_FloorPlan = Router();
R_FloorPlan.get("/", getStatus);

module.exports = R_FloorPlan;
