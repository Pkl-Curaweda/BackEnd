
const roomClient = require("../Helpers/Config/Front Office/RoomConfig");
const roomStatusClient = require("../Helpers/Config/Front Office/RoomStatusConfig");

const getAllStatus = async () => {
  const floorplan = await roomStatusClient.findMany();
  return floorplan;
};

const getAvailabilityRoom = async (occ) => {
  const data = await roomClient.findMany({
    where: {
      occupied_status: occ
    }, select: {
      id: true,
      roomStatus: {
        select: {
          description: true,
          hexCode: true
        }
      }
    }
  });
  return data;
}
module.exports = { getAllStatus, getAvailabilityRoom };
