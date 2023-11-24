
const { roomClient } = require("../Helpers/Config/Front Office/RoomConfig");
const { roomStatusClient } = require("../Helpers/Config/Front Office/RoomStatusConfig");
const { specialTreatmentClient } = require("../Helpers/Config/Front Office/specialTreatmentConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");

const getAllStatus = async () => {
  try {
    const statusDescription = await roomStatusClient.findMany({select: { shortDescription: true, longDescription: true, rowColor: true, textColor: true }});
    const specialStatusDescription = await specialTreatmentClient.findMany({select: { description: true, rowColor: true, textColor: true }});
    const floorplan = await roomClient.findMany({
      select: {
        id: true,
        floor: true,
        roomStatus: {
          select: {
            rowColor: true,
            textColor: true,
          }

        }
      }
    });
    return {
      floorplan,
      statusDescription,
      specialStatusDescription
    }
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};


module.exports = { getAllStatus };
