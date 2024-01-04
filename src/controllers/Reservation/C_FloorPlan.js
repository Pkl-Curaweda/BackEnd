const { prisma } = require("#configs/prisma.config.js");
const room = require("#models/House Keeping/M_Room.js");
const floorplan = require("../../models/Front Office/M_FloorPlan.js");
const { success, error } = require("../../utils/response.js");

const getFloorPlan = async (req, res) => {
  let flrpln;
  const { date } = req.query;
  try {
    flrpln = date != undefined ? await floorplan.getFloorPlanDataBasedOnDate(date) : await floorplan.getAllStatus()
    return success(res, 'Operation Success', flrpln)
  } catch (err) {
    return error(res, err.message, 404);
  }
};

const getFloorPLanDetail = async (req, res) => {
  const { id } = req.params
  try{
    const detail = await room.getRoomStatWithId(id)
    return success(res, 'Operation Success', detail)
  }catch(err){
    return error(res, err.message, 404)
  }
}

const postStat = async (req, res) => {
  try {
    const { id, stId} = req.params
    const chgStat = await room.postStatusChange({ id, roomStatusId: stId })
    return success(res, 'Change Success', chgStat)
  } catch (err) {
    return error(res, err.message, 404)
  }
}
module.exports = { getFloorPlan, postStat, getFloorPLanDetail };
