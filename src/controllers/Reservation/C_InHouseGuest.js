const { getInhouseGuest } = require("../../models/Reservation/M_Reservation");
const { error } = require("../../utils/response");

const inHouseGuest = async (req, res) => {
  try {
    const inHouse = await getInhouseGuest();

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

module.exports = { inHouseGuest };
