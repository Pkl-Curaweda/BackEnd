const { getAllStatus } = require("../../models/Reservation/M_FloorPlan.js");


const getStatus = async (req, res) => {
  try {
    const data = await getAllStatus();
    res.status(200).json({
      data,
    });
  }catch(err) {
    console.log(err);
  }
};

module.exports = { getStatus };
