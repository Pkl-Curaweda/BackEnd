const getALLReactiveReservation = require("../../models/Check In/M_ReactiveReservation");

const getReactiveReservation = async (req, res) => {
  try {
    const data = await getALLReactiveReservation();
    res.status(200).json({
      data,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = getReactiveReservation;
