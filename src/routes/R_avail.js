const { Router } = require("express");
const { getAvail } = require("../controllers/C_avail");
const R_avail = Router();

R_avail.get("/", getAvail);

module.exports = R_avail;