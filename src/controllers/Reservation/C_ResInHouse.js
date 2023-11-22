const {
  getReservationInhouse,
} = require("../../models/Reservation/M_Reservation");
const { error } = require("../../utils/response");

const inHouseResevation = async (req, res) => {
  try {
    const inHouse = await getReservationInhouse();

    if (!inHouse) {
      return error(res, "In-House status not found", 404);
    }

    res.json({
      reservation: inHouse,
    });
  } catch (err) {
    return error(res, "Internal Server Error", 500);
  }
};

module.exports = { inHouseResevation };
