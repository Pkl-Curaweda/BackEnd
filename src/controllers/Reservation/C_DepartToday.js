const { getDepartToday } = require("../../models/Reservation/M_Reservation");
const { error } = require("../../utils/response");

const departToday = async (req, res) => {
  try {
    const depart = await getDepartToday();

    if (!depart) {
      return error(res, "Depart Today not found", 404);
    }

    res.json({
      reservation: depart,
    });
  } catch (err) {
    return error(res, "Internal Server Error", 500);
  }
};

module.exports = { departToday };
