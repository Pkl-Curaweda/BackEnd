const { Router } = require("express");
const { testCreateLog } = require("../controllers/Reservation/C_Test");
const R_Test = new Router();

R_Test.get('/funcLog', testCreateLog);

module.exports = R_Test;