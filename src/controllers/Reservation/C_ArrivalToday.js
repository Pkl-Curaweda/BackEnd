const { getArrivalToday } = require("../../models/Reservation/M_Reservation");
const { error } = require("../../utils/response");

const arrivalToday = async (req, res) => {
  try {
    const arrival = await getArrivalToday();

    if (!arrival) {
      return error(res, "Arrival Today not found", 404);
    }

    res.json({
      reservation: arrival,
    });
  } catch (err) {
    return error(res, "Internal Server Error", 500);
  }
};

module.exports = { arrivalToday };
