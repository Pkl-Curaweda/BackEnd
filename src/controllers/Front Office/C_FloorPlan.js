const room = require("../../models/House Keeping/M_Room.js");
const floorplan = require("../../models/Front Office/M_FloorPlan.js");
const { success, error } = require("../../utils/response.js");
const { createOooRoom } = require("../../models/House Keeping/M_OOORoom.js");

const getFloorPlan = async (req, res) => {
  let flrpln;
  const { date } = req.query;
  try {
    flrpln = date != undefined ? await floorplan.getFloorPlanByDate(date) : await floorplan.getAllStatus()
    return success(res, 'Get Success', flrpln)
  } catch (err) {
    return error(res, err.message, 404);
  }
};

const getFloorPLanDetail = async (req, res) => {
  const { id } = req.params
  try{
    const detail = await room.getRoomStatWithId(id)
    return success(res, 'Get Success', detail)
  }catch(err){
    return error(res, err.message, 404)
  }
}

const postStat = async (req, res) => {
  let statusToLog = ['OOO', 'OM', 'HU']
  const user = req.user
  try {
    const { id, status} = req.params
    const chgStat = await room.changeRoomStatusByDescription(+id, status, user)
    if(statusToLog.some((stats) => { stats === chgStat.roomStatus.shortDescription})){
      const currDate = new Date().toISOString().split('T')[0]
      await createOooRoom(chgStat.roomStatus.shortDescription, { roomId: +id, userId: user.id, reason: 'Floor Plan Changes', from: `${currDate}T00:00:00.000Z`, until: `${currDate}T23:59:59.999Z`, description: 'Floor Plan Changes'})
    } 
    return success(res, `Status Room ${id} change to ${status}`, chgStat.status)
  } catch (err) {
    return error(res, err.message, 404)
  }
}
module.exports = { getFloorPlan, postStat, getFloorPLanDetail };
