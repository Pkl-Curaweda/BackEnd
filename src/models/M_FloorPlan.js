const prisma = require("../db/index");

const getAllStatus = async () => {
  const floorplan = await prisma.RoomStatus.findMany();
  return floorplan;
};

const getAvaibilityRoom = async (occ) => {
  const data = await prisma.room.findMany({
    where:{
      occupied_status:occ
    },select:{
      id: true,
      roomStatus:{
        select:{
          description: true,
          hexCode:true
        }
      }
    }
  });
  return data;
}
module.exports = {getAllStatus, getAvaibilityRoom};
