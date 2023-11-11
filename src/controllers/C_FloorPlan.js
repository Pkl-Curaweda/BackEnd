const {getAllStatus,getAvaibilityRoom} = require("../models/M_FloorPlan.js");


const getStatus = async (req, res) => {
  try {
    const data = await getAllStatus();
    res.status(200).json({
      data,
    });
  } catch (err) {
    console.log(err);
  }
};
const getAvailable = async (req, res) => {
  let availableroom = req.query.avail;
  if(availableroom == "true"){
    availableroom=true
  }else{
    availableroom=false
  }
  try {
    const data = await getAvaibilityRoom(availableroom);
    res.json({data})

  } catch (err) {
    console.log(err);
  }
};
module.exports = {getStatus,getAvailable};