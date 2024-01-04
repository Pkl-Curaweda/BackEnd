const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");


const getAllStatus = async () => {
  try {
    const floorPlan = await prisma.room.findMany({
      select: {
        id: true,
        roomStatus: {
          select: {
            rowColor: true, 
            textColor: true
          }
        }
      }
    })
    return floorPlan
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const getFloorPlanDataBasedOnDate = async (searchedDate) => {
  try {
    const searchDate = new Date(searchedDate).toISOString().split("T")[0];
    const floorPlan = await prisma.logAvailability.findFirst({
      where: {
        created_at: {
          gte: `${searchDate}T00:00:00.000Z`,
          lte: `${searchDate}T23:59:59.999Z`
        }
      }, select: { roomHistory: true }
    })
    if(floorPlan === null) throw Error(`No Log in ${searchDate}`)
    return floorPlan;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
}

module.exports = { getAllStatus, getFloorPlanDataBasedOnDate };
