
const { roomClient } = require("../Helpers/Config/Front Office/RoomConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");

const getAllStatus = async () => {
  try{
    const floorplan = await roomClient.findMany({
      select:{
        id:true,
        floor:true,
       roomStatus:{
        select:{
          id:true,
          shortDescription:true,
          longDescription:true,
          rowColor:true,
          textColor:true,
        }
        
       }
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
