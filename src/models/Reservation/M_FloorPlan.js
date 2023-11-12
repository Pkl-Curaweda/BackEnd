
const { roomClient } = require("../Helpers/Config/Front Office/RoomConfig");
const { roomStatusClient } = require("../Helpers/Config/Front Office/RoomStatusConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");

const getAllStatus = async () => {
  try{
    const floorplan = await roomStatusClient.findMany();
    return floorplan;
  }catch(err){
    ThrowError(err);
  }finally{
    await PrismaDisconnect();
  }
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
