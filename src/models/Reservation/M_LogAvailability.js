const { logAvailabilityClient } = require("../Helpers/Config/Front Office/logAvailabilityConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");


const getLogAvailabilityData = async () => {
    try {
        let logData = [], today;
        today = new Date();
        longSearchedDate = 3; //? 3 Days from now
        for (let i = 0; i <= longSearchedDate; i++) {
            const searchedDate = new Date(today);
            searchedDate.setDate(today.getDate() - i);
            const searchDate = searchedDate.toISOString().split("T")[0];
            const logAvailability = await logAvailabilityClient.findMany({
                where: { created_at: {
                    gte: `${searchDate}T00:00:00.000Z`,
                    lte: `${searchDate}T23:59:59.999Z`
                 } }
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