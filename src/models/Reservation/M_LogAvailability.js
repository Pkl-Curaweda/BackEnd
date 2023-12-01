const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, countNight } = require("../../utils/helper");

const getLogAvailabilityData = async (dateQuery, skip, limit) => {
    try {
        let logData = [], totalData = 0, originDate, startDate, endDate;
        originDate = new Date();
        longSearchedDate = 3;
        if (dateQuery != "") {
            startDate = new Date(dateQuery.split(' ')[0]).toISOString();
            endDate = new Date(dateQuery.split(' ')[1]).toISOString();
            longSearchedDate = countNight(startDate, endDate)
            originDate = new Date(endDate)
        }
        for (let i = 0; i <= longSearchedDate; i++) {
            const searchedDate = new Date(originDate);
            searchedDate.setDate(searchedDate.getDate() - i);
            const searchDate = searchedDate.toISOString().split('T')[0];
            const logAvailability = await prisma.logAvailability.findMany({
                where: {
                    created_at: {
                        gte: `${searchDate}T00:00:00.000Z`,
                        lte: `${searchDate}T23:59:59.999Z`
                    }
                }, select: {
                    roomHistory: true
                },
                take: limit,
                skip: skip,
            })
            const pushedData = {
                date: searchedDate.toISOString().split('T')[0],
                logAvailability
            }
            logData.push(pushedData);
            totalData++
        }
        return {
            logData, totalData
        }

    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { getLogAvailabilityData }