const {getALLCheckOut,getCheckOutById} = require("../../models/Check Out/M_CheckOut");

const getCheckOut = async (req, res) => {
  try {
    const data = await getALLCheckOut();
    res.status(200).json({
      data,
    });
  } catch (err) {
    console.log(err);
  }
};
const getCheckOutId = async (req, res) => {
  let checkout;
  const checkoutId = req.params.id;

  checkout = checkoutId != "" || undefined ? await getCheckOutById(parseInt(checkoutId)) : await getALLCheckOut();
  res.status(200).json({
    checkout,
  });
};

module.exports = {getCheckOut,getCheckOutId};
