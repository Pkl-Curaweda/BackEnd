const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");


const getAllStatus = async () => {
  try {
    const roomIdList = [];
    const todayDate = new Date().toISOString().split("T")[0];
    const rooms = await prisma.room.findMany({ select: { id: true } });
    rooms.forEach(room => {
      roomIdList.push(room.id);
    });
    const floorPlan = {};
    for (const roomId of roomIdList) {
      const resvRoom = await prisma.resvRoom.findFirst({
        where: {
          created_at: {
            gte: `${todayDate}T00:00:00.000Z`,
            lte: `${todayDate}T23:59:59.999Z`
          },
          roomId
        },
        select: {
          reservation: {
            select: {
              resvStatus: {
                select: {
                  rowColor: true,
                  textColor: true
                }
              },
              reserver: {
                select: {
                  guest: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      })
      const key = `room_${roomId}`;
      if(resvRoom != null){
        floorPlan[key] = {
          "guestName": resvRoom.reservation.reserver.guest.name,
          "resvStatus": resvRoom.reservation.resvStatus
        };
      }else{
        floorPlan[key] = ""
      }
    }
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
