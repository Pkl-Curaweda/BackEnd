const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, countNight, generateDateBetweenNowBasedOnDays, generateDateBetweenStartAndEnd } = require("../../utils/helper");

//? REPORT
const findReportReservation = async () => {
  const report = await prisma.logAvailability.findMany({
    select: {
      id: true,
      roomHistory: true,
      created_at: true,
      updated_at: true,
    },
  });

  report.map((value) => {
    value.roomAvailable = 0;
    value.occupied = 0;
    value.roomRevenue = 0;
    value.totalRoom = 0;

    for (const history in value.roomHistory) {
      if (value.roomHistory[history] !== 0) {
        value.roomAvailable++;
        if (value.roomHistory[history].roomPrice) {
          value.roomRevenue += value.roomHistory[history].roomPrice;
        }
      } else {
        value.occupied++;
      }
      value.totalRoom++;
    }
    value.occ = value.occupied / value.totalRoom * 100;
    value.arr = value.roomRevenue / value.occupied;

    //value.totalAvailableSatuBulan (date, room avail)

    return value;
  });

  return report;
};

//? GET ALL REPORT DATA
const getReportData = async (disOpt, page, perPage, date) => {
  try {
    let reports = [], dates, startIndex, endIndex;
    startIndex = (page - 1) * perPage;
    endIndex = startIndex + perPage - 1;
  
    // const monthNames = [
    //   "January", "February", "March", "April", "May", "June",
    //   "July", "August", "September", "October", "November", "December",
    // ];

    if (date) {
      startDate = date.split(' ')[0]
      endDate = date.split(' ')[1]
      dates = generateDateBetweenStartAndEnd(startDate, endDate)
    } else {
      dates = generateDateBetweenNowBasedOnDays("past", 30); //30 DAYS BEFORE NOW
    }

    startIndex = Math.max(0, startIndex);
    endIndex = Math.min(dates.length - 1, endIndex);

    for (let i = startIndex; i <= endIndex; i++) {
      const searchDate = dates[i]

      const logAvailability = await prisma.logAvailability.findFirst({
        where: {
          created_at: {
            gte: `${searchDate}T00:00:00.000Z`,
            lte: `${searchDate}T23:59:59.999Z`,
          },
        },
        select: {
          roomHistory: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      let roomAvailable = 0,
        occupied = 0,
        occ = 0,
        roomRevenue = 0,
        arr = 0,
        totalRoom = 0;

      if (logAvailability && logAvailability.roomHistory) {
        for (const history in logAvailability.roomHistory) {
          if (logAvailability.roomHistory[history] != 0) roomAvailable++;
          if (logAvailability.roomHistory[history].roomPrice) {
            occupied++;
            roomRevenue += logAvailability.roomHistory[history].roomPrice;
          }
          totalRoom++;
        }
      }

      occ = (occupied / totalRoom) * 100 || 0;
      arr = roomRevenue / occupied || 0;

      const storedData = {
        date: searchDate,
        roomAvailable,
        occupied,
        occ,
        roomRevenue,
        arr,
      };

      reports.push(storedData);
    }

    const lastPage = Math.ceil(dates.length / perPage);

    return {
      reports,
      meta: {
        total: dates.length,
        currPage: page,
        lastPage,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
};



//? REPORT DETAIL
const getReportDetailData = async (date, displayOption) => {
  try {
    let total = { RESERVATION: 0, DELUXE: 0, FAMILY: 0, STANDARD: 0 }, detail = {}, percentages = {}, dates, startDate, endDate
    switch (displayOption) {
      case "day":
        dates = generateDateBetweenStartAndEnd(date, date);
        break;
      case "week":
        //TODO: KERJAIN
        break;
      case "month":
        const searchedDate = new Date(date)
        startDate = new Date(searchedDate.setDate(searchedDate.getDate() - (searchedDate.getDate() - 1)))
        const lastDate = new Date(searchedDate.getFullYear(), searchedDate.getMonth() + 1, 0).getDate();
        endDate = new Date(searchedDate.setDate(lastDate))
        dates = generateDateBetweenStartAndEnd(startDate, endDate)
      case "year":
        const currentYear = new Date(date).getFullYear()
        startDate = `${currentYear}-01-01`;
        endDate = `${currentYear}-12-31`
        dates = generateDateBetweenStartAndEnd(startDate, endDate)
        break;
    }
    console.log(dates)

    for (let searchDate of dates) {
      //?SearchedDate = 2023-12-12
      const logAvailability = await prisma.logAvailability.findFirst({
        where: {
          created_at: {
            gte: `${searchDate}T00:00:00.000Z`,
            lte: `${searchDate}T23:59:59.999Z`,
          },
        },
        select: { roomHistory: true },
        orderBy: { created_at: 'desc' },
      });
      if (logAvailability != null) {
        Object.values(logAvailability.roomHistory).forEach((roomHistory) => {
          const { roomType, id } = roomHistory.room;
          const key = `room_${id}`;
          if (roomHistory.occupied !== 0) {
            total.RESERVATION++;
            total[roomType]++;
            const percentageKeyExists = percentages.hasOwnProperty(key);
            percentages[key] = (percentageKeyExists ? percentages[key] : 0) + 100;
          } else {
            if (!percentages.hasOwnProperty(key)) percentages[key] = 0;
          }
        });
      }
    }

    const rooms = await prisma.room.findMany({ select: { id: true, roomType: true, bedSetup: true } })
    rooms.forEach(room => {
      const { id, roomType, bedSetup } = room
      const detailKey = `${id}-${roomType}-${bedSetup}`;
      let key = `room_${id}`, percent = percentages[key];
      if (percentages[key] > 1) percent = dates.length / percentages[`room_${id}`]
      if (!detail.hasOwnProperty(detailKey)) {
        detail[detailKey] = { id, roomType, bedSetup, percent }
      }
    })
    return detail
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
};




module.exports = {
  findReportReservation,
  getReportData,
  getReportDetailData,
}