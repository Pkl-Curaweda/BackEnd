const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, countNight, generateDateBetweenNowBasedOnDays } = require("../../utils/helper");

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


const getReportData = async (disOpt, page, perPage) => {
  try {
    let reports = [], startIndex, endIndex;
    startIndex = (page - 1) * perPage;
    endIndex = startIndex + perPage - 1;
    // const skip = (page - 1) * pageSize;
    // const paginatedData = month.slice(skip, skip + pageSize);

    // const monthNames = [
    //   "January", "February", "March", "April", "May", "June",
    //   "July", "August", "September", "October", "November", "December",
    // ];

    const dates = generateDateBetweenNowBasedOnDays("past", 30) //?31 DAYS BEFORE TODAY
    startIndex = Math.max(0, startIndex);
    endIndex = Math.min(dates.length - 1, endIndex);
    console.log(startIndex, endIndex)

    for (let i = startIndex; i <= endIndex; i++) {
      const searchedDate = new Date(dates[i]);
      const searchDate = searchedDate.toISOString().split("T")[0];
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

      let roomAvailable = 0, occupied = 0, occ = 0, roomRevenue = 0, arr = 0, totalRoom = 0;
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

      reports.push(storedData)
    }
    const lastPage = Math.ceil(dates.length / perPage);
    // const daysInMonth = new Date(currentYear, i, 0).getDate();
    // const formattedMonth = i.toString().padStart(2, "0");
    // const monthName = monthNames[i - 1];
    // const endDate = i === currentMonth ? currentDate.getDate() : daysInMonth;

    // for (let date = endDate; date >= 1; date--) {
    //   const formattedDate = date.toString().padStart(2, "0");

    //   perDay.push(storedData);
    // }

    // const storedMonth = {
    //   monthName,
    //   perDay,
    // };

    // month.push(storedMonth);
    // const result = {
    //   perDay: disOpt === "perDay" ? month.flatMap((m) => m.perDay) : undefined,
    //   perMonth: disOpt === "perMonth" ? month.map((m) => ({ monthName: m.monthName, perDay: m.perDay.map((day) => ({ data: day })), })) : undefined,
    //   perYear: disOpt === "perYear" ? month.map((m) => ({ year: currentYear, monthName: m.monthName, perDay: m.perDay.map((day) => ({ data: day })), })) : undefined,
    //   allData: !disOpt ? month.map((m) => ({ monthName: m.monthName, perDay: m.perDay.map((day) => ({ data: day })), })) : undefined,
    // };

    return {
      reports,
      meta: {
        total: dates.length,
        currPage: page,
        lastPage,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null
    }
    };
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

//?OnGOING
const GetReportDetail = async () => {

}

//? GET REPORT DATA BY DATE
const getReportDataByDate = async (requestedDate) => {
  try {
    const formattedDate = requestedDate;

    const logAvailability = await prisma.logAvailability.findFirst({
      where: {
        created_at: {
          gte: `${formattedDate}T00:00:00.000Z`,
          lte: `${formattedDate}T23:59:59.999Z`
        }
      },
      select: {
        roomHistory: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!logAvailability || !logAvailability.roomHistory) {
      return {
        date: formattedDate,
        roomAvailable: null,
        occupied: null,
        occ: null,
        roomRevenue: null,
        arr: null,
      };
    }

    let roomAvailable = 0, occupied = 0, occ = 0, roomRevenue = 0, arr = 0, totalRoom = 0;

    for (const history in logAvailability.roomHistory) {
      if (logAvailability.roomHistory[history] !== 0) {
        roomAvailable++;
        if (logAvailability.roomHistory[history].roomPrice) {
          roomRevenue += logAvailability.roomHistory[history].roomPrice;
        }
      } else {
        occupied++;
      }
      totalRoom++;
    }

    occ = totalRoom === 0 ? null : (occupied / totalRoom) * 100;
    arr = occupied === 0 ? null : roomRevenue / occupied;

    const storedData = {
      date: formattedDate,
      roomAvailable: roomAvailable === 0 ? null : roomAvailable,
      occupied: occupied === 0 ? null : occupied,
      occ,
      roomRevenue,
      arr,
    };

    return storedData;
  } catch (error) {
    throw error;
  }
};


module.exports = {
  findReportReservation,
  getReportData,
  getReportDataByDate,
}