const { getAllReservation } = require("../../models/Front Office/M_Reservation");
const { success, error } = require("../../utils/response");

const getArrivalGuestData = async (req, res) => {
  try {
    const { sortOrder = "", disOpt = "", name = "", date = "", page = 1, perPage = 5 } = req.query;
    const { reservations, meta } = await getAllReservation(sortOrder, disOpt, name, date, parseInt(page), parseInt(perPage));
    return success(res, "Operation Success", {
      reservations,
      meta
    });
  } catch (err) {
    return error(res, err.message)
  }
};

module.exports = { getArrivalGuestData };