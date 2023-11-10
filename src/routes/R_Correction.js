const { Router } = require("express");
const { getAllData } = require("../controllers/C_Correction");
const R_Correction = Router();

R_Correction.get("/", getAllData);

module.exports = R_Correction;
