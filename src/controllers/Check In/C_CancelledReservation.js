const {getAllCancelled} = require("../../models/Check In/M_CancelledReservation");

const getCancelledReservation = async (req, res) => {
  try {
    const data = await getAllCancelled();
    res.status(200).json({
      data,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {getCancelledReservation}