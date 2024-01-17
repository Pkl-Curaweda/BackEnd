const { da } = require("@faker-js/faker");
const { prisma } = require("../../../prisma/seeder/config");
const {
  ThrowError,
  PrismaDisconnect,
  countNight,
  generateDateBetweenNowBasedOnDays,
  generateDateBetweenStartAndEnd,
  formatDecimal,
} = require("../../utils/helper");

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
    value.occ = (value.occupied / value.totalRoom) * 100;
    value.arr = value.roomRevenue / value.occupied;

    //value.totalAvailableSatuBulan (date, room avail)

    return value;
  });

  return report;
};

//? GET ALL REPORT DATA
const getReportData = async (disOpt, page, perPage, sort, date) => {
  try {
    let reports = [], dates, startIndex, endIndex, data = [], totalRoom = 0, searchDates = [];
    startIndex = (page - 1) * perPage;
    endIndex = startIndex + perPage - 1;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    if (date) {
      startDate = date.split(' ')[0]
      endDate = date.split(' ')[1]
      dates = generateDateBetweenStartAndEnd(startDate, endDate)
    } else { dates = generateDateBetweenNowBasedOnDays("past", 30); }

    if (disOpt === "day") {
      startIndex = Math.max(0, startIndex);
      endIndex = Math.min(dates.length - 1, endIndex);
    } else {
      startIndex = 0,
        endIndex = dates.length - 1
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const searchDate = dates[i];
      searchDates.push(searchDate)
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

      const tPayment = await prisma.resvPayment.findMany({
        where: {
          created_at: {
            gte: `${searchDate}T00:00:00.000Z`,
            lte: `${searchDate}T23:59:59.999Z`,
          }
        },
        select: { total: true, tax: true }
      })
      let roomAvailable = 0, occupied = 0, occ = 0, roomRevenue = 0, arr = 0, added = { ident: "", rm_avail: 0, rno: 0, occ: 0, rev: 0, arr: 0 }, totalPayment = 0, totalTaxed = 0;
      for (pay of tPayment) {
        const totalTax = + pay.tax
        totalPayment = + pay.total
        totalTaxed = + (totalPayment - totalTax)
      }
      roomRevenue = totalPayment

      if (logAvailability && logAvailability.roomHistory) {
        for (const history in logAvailability.roomHistory) {
          if (logAvailability.roomHistory[history] != 0) roomAvailable++;
          if (logAvailability.roomHistory[history]) occupied++;
          totalRoom++;
        }
      }
      occ = totalRoom !== 0 ? formatDecimal((occupied / totalRoom) * 100) : 0;
      arr = occupied !== 0 ? formatDecimal(roomRevenue / occupied) : 0;
      added.rm_avail = roomAvailable;
      added.rno = occupied;
      added.occ = added.rm_avail !== 0 ? formatDecimal((added.rno / added.rm_avail) * 100) : 0;
      added.rev = roomRevenue
      added.arr = added.rno !== 0 ? formatDecimal((added.rev / added.rno)) : 0;
      const storedData = {
        date: searchDate,
        roomAvailable,
        occupied,
        occ,
        roomRevenue,
        arr,
        added: {
          ident: "DTD",
          rm_avail: added.rm_avail,
          rno: added.rno,
          occ: added.occ,
          rev: added.rev,
          arr: added.arr,
        },
        taxService: {
          unTax: totalPayment,
          taxed: totalTaxed
        }
      };
      reports.push(storedData);
    }

    switch (disOpt) {
      case "week":
        const weeks = []
        for (let i = 0; i < dates.length; i += 7) {
          const subArray = dates.slice(i, i + 7);
          weeks.push(subArray);
        }
        weeks.forEach((week) => {
          let sendedData = {
            roomAvailable: 0,
            occupied: 0,
            roomRevenue: 0,
            occ: 0,
            arr: 0,
            added: {
              ident: "",
              rm_avail: 0,
              rno: 0,
              occ: 0,
              rev: 0,
              arr: 0,
            },
            taxService: {
              unTax: 0,
              taxed: 0
            }
          }
          week.forEach(day => {
            const report = reports.filter(report => report.date === day);
            report.forEach(report => {
              sendedData.roomAvailable += report.roomAvailable;
              sendedData.occupied += report.occupied;
              sendedData.roomRevenue += report.roomRevenue
              sendedData.taxService.unTax += report.taxService.unTax
              sendedData.taxService.taxed += report.taxService.taxed
            })
            sendedData.added.ident = "WTD"
            sendedData.occ = totalRoom !== 0 ? formatDecimal((sendedData.occupied / totalRoom) * 100) : 0;
            sendedData.arr = sendedData.occupied !== 0 ? formatDecimal(sendedData.roomRevenue / sendedData.occupied) : 0;
            sendedData.added.rm_avail = sendedData.roomAvailable;
            sendedData.added.rno = sendedData.occupied;
            sendedData.added.occ = sendedData.added.rm_avail !== 0 ? formatDecimal((sendedData.added.rno / sendedData.added.rm_avail) * 100) : 0;
            sendedData.added.rev = sendedData.roomRevenue
            sendedData.added.arr = sendedData.added.rno !== 0 ? formatDecimal((sendedData.added.rev / sendedData.added.rno)) : 0;
          })
          data.push({
            date: `${week[0]} - ${week[week.length - 1]}`,
            ...sendedData
          })
        })
        break;

      case "month":
        const months = [...new Set(dates.map(date => new Date(date).getMonth()))];
        for (month of months) {
          let sendedData = {
            roomAvailable: 0,
            occupied: 0,
            roomRevenue: 0,
            occ: 0,
            arr: 0,
            added: {
              ident: "",
              rm_avail: 0,
              rno: 0,
              occ: 0,
              rev: 0,
              arr: 0,
            },
            taxService: {
              unTax: 0,
              taxed: 0
            }
          }
          const report = reports.filter((report) => new Date(report.date).getMonth() === month);
          report.forEach(report => {
            sendedData.roomAvailable += report.roomAvailable,
              sendedData.occupied += report.occupied,
              sendedData.roomRevenue += report.roomRevenue
            sendedData.taxService.unTax += report.taxService.unTax
            sendedData.taxService.taxed += report.taxService.taxed
          })

          sendedData.added.ident = "MTD"
          sendedData.occ = totalRoom !== 0 ? formatDecimal((sendedData.occupied / totalRoom) * 100) : 0;
          sendedData.arr = sendedData.occupied !== 0 ? formatDecimal(sendedData.roomRevenue / sendedData.occupied) : 0;
          sendedData.added.rm_avail = sendedData.roomAvailable;
          sendedData.added.rno = sendedData.occupied;
          sendedData.added.occ = sendedData.added.rm_avail !== 0 ? formatDecimal((sendedData.added.rno / sendedData.added.rm_avail) * 100) : 0;
          sendedData.added.rev = sendedData.roomRevenue
          sendedData.added.arr = sendedData.added.rno !== 0 ? formatDecimal((sendedData.added.rev / sendedData.added.rno)) : 0;

          data.push({
            date: monthNames[month],
            ...sendedData
          })
        }
        break;

      case "year":
        const years = [...new Set(dates.map(date => new Date(date).getFullYear()))]; //?Get all the existed year that are  inside of the dates
        for (year of years) {
          let sendedData = {
            roomAvailable: 0,
            occupied: 0,
            roomRevenue: 0,
            occ: 0,
            arr: 0,
            added: {
              ident: "",
              rm_avail: 0,
              rno: 0,
              occ: 0,
              rev: 0,
              arr: 0,
            },
            taxService: {
              unTax: 0,
              taxed: 0
            }
          }
          const report = reports.filter(
            (report) => new Date(report.date).getFullYear() === year
          );
          report.forEach(report => {
            sendedData.roomAvailable += report.roomAvailable,
              sendedData.occupied += report.occupied,
              sendedData.roomRevenue += report.roomRevenue
            sendedData.taxService.unTax += report.taxService.unTax
            sendedData.taxService.taxed += report.taxService.taxed
          })
          sendedData.added.ident = "YTD"
          sendedData.occ = totalRoom !== 0 ? formatDecimal((sendedData.occupied / totalRoom) * 100) : 0;
          sendedData.arr = sendedData.occupied !== 0 ? formatDecimal(sendedData.roomRevenue / sendedData.occupied) : 0;
          sendedData.added.rm_avail = sendedData.roomAvailable;
          sendedData.added.rno = sendedData.occupied;
          sendedData.added.occ = sendedData.added.rm_avail !== 0 ? formatDecimal((sendedData.added.rno / sendedData.added.rm_avail) * 100) : 0;
          sendedData.added.rev = sendedData.roomRevenue
          sendedData.added.arr = sendedData.added.rno !== 0 ? formatDecimal((sendedData.added.rev / sendedData.added.rno)) : 0;
          data.push({
            date: year,
            ...sendedData
          })
        }
        break;

      default:
        data = reports;
    }

    if (sort) {
      switch (sort) {
        case "desc":
          data = data.sort((a, b) => b.roomRevenue - a.roomRevenue)
          break;
        default:
          data = data.sort((a, b) => a.roomRevenue - b.roomRevenue)
          break;
      }
    }
    if (disOpt) perPage = dates.length
    const lastPage = Math.ceil(dates.length / perPage);

    return {
      reports: data,
      meta: {
        total: dates.length,
        currPage: page,
        lastPage,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    }
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
};


//? REPORT DETAIL
const getReportDetailData = async (date, displayOption) => {
  try {
    let total = { RESERVATION: 0, DELUXE: 0, FAMILY: 0, STANDARD: 0 }, detail = {}, percentages = {}, dates, startDate, endDate, searchedDate
    switch (displayOption) {
      case "day":
        dates = generateDateBetweenStartAndEnd(date, date);
        break;
      case "week":
        dates = [];
        searchedDate = new Date(date);
        for (let i = 0; i <= 7 - 1; i++) {
          const listDate = new Date(searchedDate);
          listDate.setDate(searchedDate.getDate() - i);
          dates.push(listDate.toISOString().split('T')[0]);
        }
        break;
      case "month":
        searchedDate = new Date(date)
        startDate = new Date(searchedDate.setDate(searchedDate.getDate() - (searchedDate.getDate() - 1)))
        const lastDate = new Date(searchedDate.getFullYear(), searchedDate.getMonth() + 1, 0).getDate();
        endDate = new Date(searchedDate.setDate(lastDate))
        dates = generateDateBetweenStartAndEnd(startDate, endDate)
      case "year":
        const currentYear = new Date(date).getFullYear();
        startDate = `${currentYear}-01-01`;
        endDate = `${currentYear}-12-31`;
        dates = generateDateBetweenStartAndEnd(startDate, endDate);
        break;
    }

    for (let searchDate of dates) {
      const logAvailability = await prisma.logAvailability.findFirst({
        where: {
          created_at: {
            gte: `${searchDate}T00:00:00.000Z`,
            lte: `${searchDate}T23:59:59.999Z`,
          },
        },
        select: { roomHistory: true },
        orderBy: { created_at: "desc" },
      });
      if (logAvailability != null) {
        Object.values(logAvailability.roomHistory).forEach((roomHistory) => {
          const { roomType, id } = roomHistory.room;
          const key = `room_${id}`;
          if (roomHistory.occupied !== 0) {
            total.RESERVATION++;
            total[roomType]++;
            const percentageKeyExists = percentages.hasOwnProperty(key);
            percentages[key] =(percentageKeyExists ? percentages[key] : 0) + 100;
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
      if (percentages[key] > 1) {
        percent = dates.length / percentages[`room_${id}`] * 100
        percent = percent.toFixed(1)
      }
      if (!detail.hasOwnProperty(detailKey)) {
        detail[detailKey] = { id, roomType, bedSetup, percent };
      }
    });
    return { detail, total };
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};



module.exports = {
  findReportReservation,
  getReportData,
  getReportDetailData,
};
