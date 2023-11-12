const { canceledReservationClient } = require("../Helpers/Config/Front Office/CanceledReservationConfig");


const getAllCancelled = async () => {
  const cancelled = await canceledReservationClient.findMany();
  return cancelled;
};

module.exports = getAllCancelled;