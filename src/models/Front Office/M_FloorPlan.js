const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");


const getAllStatus = async () => {
  try {
    const currDate = new Date().toISOString().split('T')[0]
    const [rooms, resv] = await prisma.$transaction([
      prisma.room.findMany({
        select: {
          id: true,
          roomStatus: {
            select: {
              rowColor: true,
              textColor: true
            }
          }
        }, orderBy: { id: 'asc' }
      }),
      prisma.resvRoom.findMany({
        where: {
          reservation: { NOT: [{ specialTreatmentId: null }], onGoingReservation: true }
        }, select: { roomId: true,  reservation: { select: { specialTreatment: { select: { rowColor: true, textColor: true } } } } }, orderBy: { roomId: 'asc' }
      })
    ])
    for (let rsv of resv) {
      const { roomId } = rsv
      rooms[roomId - 101] = {
        id: roomId,
        roomStatus: {
          ...rsv.reservation.specialTreatment
        }
      }
    }
    return rooms
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

// const getFloorPlanDataBasedOnDate = async (searchedDate) => {
//   try {
//     const searchDate = new Date(searchedDate).toISOString().split("T")[0];
//     const floorPlan = await prisma.logAvailability.findFirst({
//       where: {
//         created_at: {
//           gte: `${searchDate}T00:00:00.000Z`,
//           lte: `${searchDate}T23:59:59.999Z`
//         }
//       }, select: { roomHistory: true }
//     })
//     if(floorPlan === null) throw Error(`No Log in ${searchDate}`)
//     return floorPlan;
//   } catch (err) {
//     ThrowError(err)
//   } finally {
//     await PrismaDisconnect();
//   }
// }

module.exports = { getAllStatus };
