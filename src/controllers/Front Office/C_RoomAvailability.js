const { getLogAvailabilityData, createNewLogAvailable, filterRoomAvailabiy } = require("../../models/Front Office/M_RoomAvailability");
const { success, error } = require("../../utils/response");
const schedule = require("node-schedule")

const getRoomAvailability = async (req, res) => {
  const { page = 1, perPage = 5, date = "", search, filter } = req.query;
  try {
    const logData = await getLogAvailabilityData(date, parseInt(page), parseInt(perPage), filter, search);
    return success(res, "Operation Success", logData);
  } catch (err) {
    return error(res, err.meesage)
  }
};

const CreateLog = async (req, res) => {
  try {
    const createdLog = await createNewLogAvailable();
    return success(res, 'Log Created', createdLog)
  } catch (err) {
    return error(res, err.message)
  }

}

//?DAILY REPORT
const dailyReport = async () => {
  const currDate = new Date();
  schedule.scheduleJob('logs', '0 0 * * *', async () => {
    console.log('Running schedule....')
    await createNewLogAvailable().then(() => {
      console.log(`Log created for ${currDate}`)
      console.log('Schedule end...')
    }).catch((err) => {
      console.log(err.message)
      schedule.cancelJob('logs')
    })
  })
}

dailyReport();

module.exports = { getRoomAvailability, CreateLog };
