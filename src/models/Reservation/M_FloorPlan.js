
const { roomClient } = require("../Helpers/Config/Front Office/RoomConfig");
const { roomStatusClient } = require("../Helpers/Config/Front Office/RoomStatusConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");

const getAllStatus = async () => {
  try{
    const floorplan = await roomStatusClient.findMany({
      select:{
        id:true,
        shortDescription:true,
        rowColor:true,
        textColor:true
     }
    });
    return floorplan;
  }catch(err){
    ThrowError(err);
  }finally{
    await PrismaDisconnect();
  }
};


module.exports = { getAllStatus };
