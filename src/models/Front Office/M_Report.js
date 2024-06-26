const { da } = require("@faker-js/faker");
const { prisma } = require("../../../prisma/seeder/config");
const {
  ThrowError,
  PrismaDisconnect,
  countNight,
  generateDateBetweenNowBasedOnDays,
  generateDateBetweenStartAndEnd,
  formatDecimal,
  isDateInRange,
} = require("../../utils/helper");

//? GET ALL REPORT DATA
const getReportData = async (disOpt, page, perPage, sort, date) => {
  try {
    let reports = [], dates, startIndex, endIndex, data = [], totalRoom = 0, searchDates = [], ident, startDate, endDate, roomList = {};
    startIndex = (page - 1) * perPage;
    endIndex = startIndex + perPage - 1;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    switch (disOpt) {
      case "week":
        startDate = new Date().toISOString().split('T')[0]
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 30)
        endDate = endDate.toISOString().split('T')[0]
        break;
      case "month":
        startDate = new Date().toISOString().split('T')[0]
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 90)
        endDate = endDate.toISOString().split('T')[0]
        break;
      case "year":
        const currYear = new Date().getFullYear()
        startDate = `${currYear}-01-01`
        endDate = `${currYear}-12-31`
        break;
      default:
        if (date) {
          [startDate, endDate] = date.split(' ')
        } else {
          startDate = new Date().toISOString().split('T')[0]
          endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 7)
          endDate = endDate.toISOString().split('T')[0]
        }
        break;
    }
    dates = generateDateBetweenStartAndEnd(startDate, endDate)
    if (disOpt != "day") endIndex = dates.length - 1
    startIndex = Math.max(0, startIndex);
    endIndex = Math.min(dates.length - 1, endIndex);
    const [rms, resvRooms] = await prisma.$transaction([
      prisma.room.findMany({ where: { NOT: { id: 0 }, deleted: false }, select: { id: true, deleted: false} }),
      prisma.resvRoom.findMany({
        where: {
          deleted: false,
          reservation: {
            OR: [
              { arrivalDate: { gte: `${startDate}T00:00:00.000Z` } },
              { departureDate: { lte: `${endDate}T23:59:59.999Z` } }
            ]
          }
        }, select: {
          ResvPayment: true,
          Invoice: {
            select: { qty: true, rate: true, created_at: true }
          },
          reservation: {
            select: { arrivalDate: true, departureDate: true }
          },
          room: {
            select: { id: true, occupied_status: true }
          }
        }
      })
    ])

    for (let room of rms) {
      const key = `room_${room.id}`
      roomList[key] = 0
      totalRoom++
    }

    for (let i = startIndex; i <= endIndex; i++) {
      let roomAvailable = 0, occupied = 0, occ = 0, roomRevenue = 0, arr = 0, added = { ident: "", rm_avail: 0, rno: 0, occ: 0, rev: 0, arr: 0 }, totalPayment = 0, totalTax =  0, rooms = { ...roomList };
      const searchDate = dates[i];
      searchDates.push(searchDate)
      const rsv = resvRooms.filter(rsv => {
        let [arrivalDate, departureDate] = [rsv.reservation.arrivalDate, rsv.reservation.departureDate]
        return isDateInRange(new Date(searchDate), new Date(`${arrivalDate.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${departureDate.toISOString().split('T')[0]}T23:59:59.999Z`));
      })
      for (let rs of rsv) {
        rooms[`room_${rs.room.id}`] = 1
        let payment = rs.ResvPayment.filter(pay => {
          return isDateInRange(new Date(searchDate), new Date(`${pay.created_at.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${pay.created_at.toISOString().split('T')[0]}T23:59:59.999Z`))
        })
        let invoice = rs.Invoice.filter(inv => {
          return isDateInRange(new Date(searchDate), new Date(`${inv.created_at.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${inv.created_at.toISOString().split('T')[0]}T23:59:59.999Z`))
        })
        for (let pay of payment) totalTax =+ pay.tax
        for (let inv of invoice) totalPayment += (inv.qty * inv.rate)
      }
      const roomArray = Object.values(rooms)
      for (let room of roomArray) room != 1 ? roomAvailable++ : occupied++
      occ = formatDecimal((occupied / roomArray.length) * 100)
      arr = occupied > 0 ? formatDecimal(roomRevenue / occupied) : 0
      added.rm_avail = roomAvailable;
      added.rno = occupied;
      added.occ = formatDecimal((added.rno / roomArray.length) * 100)
      added.rev = roomRevenue
      added.arr = added.rno > 0 ? formatDecimal((added.rev / added.rno)) : 0
      const storedData = {
        date: searchDate,
        roomAvailable,
        occupied,
        occ,
        roomRevenue: totalPayment,
        arr,
        added: {
          rm_avail: added.rm_avail,
          rno: added.rno,
          occ: added.occ,
          rev: added.rev,
          arr: added.arr,
        },
        taxService: {
          unTax: totalPayment,
          taxed: totalTax
        }
      };
      reports.push(storedData);
    }

    switch (disOpt) {
      case "week":
        ident = "WTD"
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
            sendedData.occ = sendedData.roomAvailable > 0 ? formatDecimal((sendedData.occupied / (sendedData.roomAvailable + sendedData.occupied)) * 100) : 0
            sendedData.arr = sendedData.occupied !== 0 ? formatDecimal(sendedData.roomRevenue / sendedData.occupied) : 0;
            sendedData.added.rm_avail = sendedData.roomAvailable;
            sendedData.added.rno = sendedData.occupied;
            sendedData.added.occ = sendedData.roomAvailable > 0 ? formatDecimal((sendedData.occupied / (sendedData.roomAvailable + sendedData.occupied)) * 100) : 0
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
        ident = "MTD"
        const months = [...new Set(dates.map(date => new Date(date).getMonth()))];
        for (let month of months) {
          let sendedData = {
            roomAvailable: 0,
            occupied: 0,
            roomRevenue: 0,
            occ: 0,
            arr: 0,
            added: {
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

          sendedData.occ = sendedData.roomAvailable > 0 ? formatDecimal((sendedData.occupied / (sendedData.roomAvailable + sendedData.occupied)) * 100) : 0
          sendedData.arr = sendedData.occupied !== 0 ? formatDecimal(sendedData.roomRevenue / sendedData.occupied) : 0;
          sendedData.added.rm_avail = sendedData.roomAvailable;
          sendedData.added.rno = sendedData.occupied;
          sendedData.added.occ = sendedData.roomAvailable > 0 ? formatDecimal((sendedData.occupied / (sendedData.roomAvailable + sendedData.occupied)) * 100) : 0
          sendedData.added.arr = sendedData.added.rno !== 0 ? formatDecimal((sendedData.added.rev / sendedData.added.rno)) : 0;

          data.push({
            date: monthNames[month],
            ...sendedData
          })
        }
        break;

      case "year":
        ident = "YTD"
        const years = [...new Set(dates.map(date => new Date(date).getFullYear()))]; //?Get all the existed year that are  inside of the dates
        for (year of years) {
          let sendedData = {
            roomAvailable: 0,
            occupied: 0,
            roomRevenue: 0,
            occ: 0,
            arr: 0,
            added: {
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
          sendedData.occ = sendedData.roomAvailable > 0 ? formatDecimal((sendedData.occupied / (sendedData.roomAvailable + sendedData.occupied)) * 100) : 0
          sendedData.arr = sendedData.occupied !== 0 ? formatDecimal(sendedData.roomRevenue / sendedData.occupied) : 0;
          sendedData.added.rm_avail = sendedData.roomAvailable;
          sendedData.added.rno = sendedData.occupied;
          sendedData.added.occ = sendedData.roomAvailable > 0 ? formatDecimal((sendedData.occupied / (sendedData.roomAvailable + sendedData.occupied)) * 100) : 0
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
        ident = "DTD"
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
    const total = data.length
    data = data.slice(startIndex, endIndex + 1)
    const lastPage = Math.ceil(data.length / perPage);

    return {
      ident,
      reports: data,
      meta: {
        total,
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

//TODO: FIX THIS DETAIL REPORT
//? REPORT DETAIL
const getReportDetailData = async (date, displayOption) => {
  try {
    let total = { RESERVATION: 0, DELUXE: 0, FAMILY: 0, STANDARD: 0 }, detail = {}, percentages = {}, dates, startDate, endDate, searchedDate
    startDate = date != undefined ? date : new Date().toISOString().split('T')[0]
    switch (displayOption) {
      case "day":
        endDate = startDate
        break;
      case "week":
        endDate = startDate
        startDate = new Date(startDate)
        startDate.setDate(startDate.getDate() - 7)
        startDate = startDate.toISOString().split('T')[0]
        break;
      case "month":
        searchedDate = new Date(date)
        startDate = new Date(searchedDate.setDate(searchedDate.getDate() - (searchedDate.getDate() - 1)))
        const lastDate = new Date(searchedDate.getFullYear(), searchedDate.getMonth() + 1, 0).getDate();
        endDate = new Date(searchedDate.setDate(lastDate))
      case "year":
        const currentYear = new Date(date).getFullYear();
        startDate = `${currentYear}-01-01`;
        endDate = `${currentYear}-12-31`;
        break;
    }
    dates = generateDateBetweenStartAndEnd(startDate, endDate)
    const [resvRoom, rooms] = await prisma.$transaction([
      prisma.resvRoom.findMany({
        where: {
          reservation: {
            OR: [
              { arrivalDate: { gte: `${startDate}T00:00:00.000Z` } },
              { departureDate: { lte: `${endDate}T23:59:59.999Z` } }
            ]
          }
        }, select: {
          room: { select: { id: true, roomType: true } },
          reservation: {
            select: {
              arrivalDate: true,
              departureDate: true
            }
          }
        }
      }),
      prisma.room.findMany({ where: { deleted: false, NOT: { id: 0 } } ,select: { id: true, roomType: true } })
    ])

    
    for (let room of rooms) percentages[`room_${room.id}`] = 0
    for (let date of dates) {
      const resv = resvRoom.filter(rsv => {
        let [arrivalDate, departureDate] = [rsv.reservation.arrivalDate, rsv.reservation.departureDate]
        return isDateInRange(new Date(date), new Date(`${arrivalDate.toISOString().split('T')[0]}T00:00:00.000Z`), new Date(`${departureDate.toISOString().split('T')[0]}T23:59:59.999Z`));
      })
      for (let rs of resv) {
        const { roomType, id } = rs.room;
        total.RESERVATION++;
        total[roomType.longDesc]++;
        const key = `room_${id}`;
        const percentageKeyExists = percentages.hasOwnProperty(key);
        percentages[key] = (percentageKeyExists ? percentages[key] : 0) + 100;
      }
    }

    for (let room of rooms) {
      const { id } = room
      let key = `room_${id}`, percent = percentages[key];
      const detailKey = `${id}-${room.roomType.id}-${room.roomType.bedSetup}`;
      if (percentages[key] > 1) {
        percent = dates.length / percentages[`room_${id}`] * 100
        percent = parseFloat(percent.toFixed(1))
      }
      if (!detail.hasOwnProperty(detailKey)) {
        detail[detailKey] = { id, roomType: room.roomType.id, bedSetup: room.roomType.bedSetup, percent };
      }
    }


    return { detail, total };
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};



module.exports = {
  getReportData,
  getReportDetailData,
};
