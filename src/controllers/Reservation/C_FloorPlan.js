const { getAllStatus, getFloorPlanDataBasedOnDate } = require("../../models/Front Office/M_FloorPlan.js");
const { success, error } = require("../../utils/response.js");

const getFloorPlan  = async (req, res) => {
  try {
    let floorPlan;
    const date = req.query.date || "";
    if(date != ""){
      floorPlan = await getFloorPlanDataBasedOnDate(date);
    }else{
      floorPlan = await getAllStatus();
    }
    return success(res, 'Operation Success', floorPlan)
  }catch(err) {
  return error(res, err.message, 404);
  }
};
module.exports = { getFloorPlan};
