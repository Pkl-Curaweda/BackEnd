const {
  reservationClient,
} = require("../../models/Helpers/Config/Front Office/ReservationConfig");
const {
  reserverClient,
} = require("../../models/Helpers/Config/Front Office/ReserverConfig");

const getAllGroupCheckIn = async (req, res) => {
  try {
    const reservation = await reservationClient.findMany();
    const reserver = await reserverClient.findMany();

    res.status(200).json({
      reservation,
      reserver,
    });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

module.exports = { getAllGroupCheckIn };
