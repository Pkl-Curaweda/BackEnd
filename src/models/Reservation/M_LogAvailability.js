const { logAvailabilityClient } = require("../Helpers/Config/Front Office/logAvailabilityConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");


const getLogAvailabilityData = async () => {
    try {
        let logData = [], searchedDate, longHistory, lte, gte, today;
        today = new Date();
        longSearchedDate = 3; //? 3 Days from now
        for (let i = 0; i <= longSearchedDate; i++) {
            currentDate = today;
            const searchedDate = new Date(currentDate.setDate(currentDate.getDate() - i))
            console.log(searchedDate)
            const logAvailability = await logAvailabilityClient.findMany({
                where: { created_at: { lte, gte } }
            })
            const pushedData = {
                date: searchedDate.toISOString().split('T')[0],
                logAvailability
            }
            logData.push(pushedData);
        }
        return logData

    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getLogAvailabilityData }