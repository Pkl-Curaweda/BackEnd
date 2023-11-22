const {
  getReservationToday,
} = require("../../models/Reservation/M_Reservation");
const { error } = require("../../utils/response");

const todayReservation = async (req, res) => {
  try {
    const today = await getReservationToday();
    if (!today) {
      return error(res, "Today Reservation status not found", 404);
    }

    res.json({ reservation: today });
  } catch (err) {
    return error(res, "Internal Server Error", 500);
  }
};

module.exports = { todayReservation };
