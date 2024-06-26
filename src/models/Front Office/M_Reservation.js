const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, countNight, generateBalanceAndTotal, paginateFO, isRoomAvailable, generateDeleteDate } = require("../../utils/helper");
const { CreateNewGuest } = require("../Authorization/M_Guest");
const { CreateNewReserver } = require("./M_Reserver");
const { createNewResvRoom, deleteResvRoomByReservationId } = require("./M_ResvRoom");
const { getAllAvailableRoom, changeRoomStatusByDescription, changeOccupied } = require("../House Keeping/M_Room");
const { encrypt } = require("../../utils/encryption");
const { assignRoomMaid } = require("../House Keeping/IMPPS/M_RoomMaid");
const { genearateListOfTask, createNewMaidTask, assignTask, deleteCheckoutTask } = require("../House Keeping/IMPPS/M_MaidTask");
const { isVoucherValid, setVoucher } = require("./M_Voucher");
const { addNewInvoiceFromArticle } = require("./M_Invoice");
const { activateRoomEmail, activateDeactivateRoomEmail } = require("../Authorization/M_User");
const io = require("../../..");

const orderReservationByIdentifier = (sortAndOrder) => {
  let query = { orderQuery: undefined, whereQuery: undefined };
  const sortIdentifier = sortAndOrder.split(' ')[0]
  const sortBy = sortAndOrder.split(' ')[1];
  const filter = sortAndOrder.split(' ')[2];

  if (sortIdentifier === "resv") {
    switch (sortBy) {
      case "arrCode": {
        query.whereQuery = { arrangmentCodeId: { contains: filter } }
        break;
      }

      case "rate": {
        query.orderQuery = { arrangment: { rate: filter } }
        break;
      }

      case "status": {
        query.whereQuery = { reservation: { resvStatusId: parseInt(filter) } }
        break;
      }
      case "night": {
        switch (filter) {
          case 'asc':
            query.whereQuery = { reservation: { manyNight: 1 } }
            break;
          default:
            query.whereQuery = { reservation: { manyNight: { gt: 1 } } }
            break;
        }
        break;
      }

      default: {
        query.orderQuery = { reservation: { [sortBy]: filter } }
        break;
      }
    }
  } else if (sortIdentifier === "rese") {
    switch (sortBy) {
      case "name":
        query.orderQuery = { reservation: { reserver: { guest: { name: filter } } } }
        break;
      default:
        query.whereQuery = { reservation: { reserver: { resourceName: { contains: filter } } } }
        break;
    }
  } else if (sortIdentifier === "room") {
    switch (sortBy) {
      case "name":
        query.whereQuery = { roomMaids: { user: { name: { contains: filter } } } }
        break;
      case 'type':
        query.whereQuery = { room: { roomType: { id: filter } } }
        break;
      case 'bedSetup':
        query.whereQuery = { room: { roomType: { bedSetup: filter } } }
        break;
      default:
        query.orderQuery = { room: { [sortBy]: filter } }
        break;
    }
  }
  return query
};

const displayByIdentifier = (disOpt) => {
  let displayOption, whereQuery;
  const today = new Date();
  const dateToday = today.toISOString().split('T')[0];
  if (disOpt != "inhouse") {
    displayOption = `${disOpt}Date`; //arrivalDate
    if (disOpt === "reservation") displayOption = "created_at"
    whereQuery = {
      gte: `${dateToday}T00:00:00.000Z`,
      lte: `${dateToday}T23:59:59.999Z`,
    }
  } else {
    displayOption = "inHouseIndicator";
    whereQuery = true
  }
  return {
    displayOption,
    whereQuery
  }
}

const getAllReservation = async (sortAndOrder, displayOption, nameQuery, dateQuery, page, perPage, history) => {
  try {
    let orderBy, name, whereQuery, arrivalDate, departureDate, whereDate
    name = nameQuery || "";
    if (displayOption != "") {
      const displayOptionAndQuery = displayByIdentifier(displayOption);
      displayOption = displayOptionAndQuery.displayOption;
      whereQuery = displayOptionAndQuery.whereQuery;
    } else {
      if (dateQuery != "")
        whereDate = {
          AND: [
            { arrivalDate: { gte: `${dateQuery.split(" ")[0] || ""}T00:00:00.000Z` } },
            { departureDate: { lte: `${dateQuery.split(" ")[1] || ""}T23:59:59.999Z` } }
          ]
        }
    }
    if (sortAndOrder != "") orderBy = orderReservationByIdentifier(sortAndOrder);
    const { reservations, meta } = await paginateFO(prisma.resvRoom, { page, name: "reservations", perPage }, {
      where: {
        reservation: { reserver: { guest: { name: { contains: name } } } },
        ...(dateQuery && { reservation: { ...whereDate } }),
        ...(whereQuery && { reservation: { [displayOption]: whereQuery } }),
        ...(orderBy && orderBy.whereQuery),
        ...(history != "true" && { deleted: false })
      },
      select: {
        id: true,
        reservationId: true,
        arrangment: {
          select: {
            id: true,
            rate: true
          }
        },
        room: {
          select: {
            id: true,
            roomType: {
              select: { id: true, bedSetup: true }
            }
          },
        },
        deleted: true,
        reservation: {
          select: {
            reserver: {
              select: {
                resourceName: true,
                guest: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            resvStatus: {
              select: {
                id: true,
                description: true,
                rowColor: true,
                textColor: true
              }
            },
            specialTreatmentId: true,
            specialTreatment: {
              select: {
                rowColor: true,
                textColor: true
              }
            },
            borderColor: true,
            manyNight: true,
            arrivalDate: true,
            departureDate: true,
            created_at: true,
          }
        }
      },
      orderBy: orderBy && orderBy.orderQuery || { created_at: 'desc' }
    })

    let roomsData = {}, roomTypes = {}, resvStatus = {}
    const reservationMap = new Map();
    reservations.forEach((resv) => {
      const reservationId = resv.reservationId;
      const reservation = resv.reservation
      roomsData[resv.room.id] = resv.room.id
      resvStatus[resv.reservation.resvStatus.description] = { id: resv.reservation.resvStatus.id, desc: resv.reservation.resvStatus.description }
      roomTypes[resv.room.roomType.id] = { id: resv.room.roomType.id, col: 'RType', val: `room+type+${resv.room.roomType.id}` }
      if (reservation.specialTreatmentId != null) {
        const specialTreatment = reservation.specialTreatment
        resv.reservation.resvStatus.rowColor = specialTreatment.rowColor;
        resv.reservation.resvStatus.textColor = specialTreatment.textColor;
      }
      if (resv.deleted != false) {
        resv.reservation.resvStatus.textColor = "#808080";
        resv.reservation.resvStatus.rowColor = "#f7f7f7";
        resv.reservation.borderColor = "#f7f7f7";
      }
      delete resv.reservationId
      delete resv.reservation.specialTreatmentId
      delete resv.reservation.specialTreatment

      if (!reservationMap.has(reservationId)) {
        reservationMap.set(reservationId, {
          reservationId,
          reservation: []
        });
      }
      reservationMap.get(reservationId).reservation.push(resv);
    });
    const rooms = Object.values(roomsData).sort((a, b) => a - b)
    const sortingRoomNo = {
      options: [`${rooms[0]}-${rooms[rooms.length - 1]}`, `${rooms[rooms.length - 1]}-${rooms[0]}`],
      toChange: {
        [`${rooms[0]}-${rooms[rooms.length - 1]}`]: { col: 'RmNo', val: 'room+id+asc' },
        [`${rooms[rooms.length - 1]}-${rooms[0]}`]: { col: 'RmNo', val: 'room+id+desc' },
      }
    }
    const resvStat = Object.values(resvStatus)
    for (let stats of resvStat) {
      sortingRoomNo.options.push(stats.desc)
      sortingRoomNo.toChange[stats.desc] = { col: "RmNo", val: `resv+status+${stats.id}` }
    }
    let sortingRoomType = { options: [], toChange: {} }
    const types = Object.values(roomTypes)
    for (let type of types) {
      const { col, id, val } = type
      sortingRoomType.options.push(id)
      sortingRoomType.toChange[id] = { col, val }
    }
    return { sortingRoomNo, sortingRoomType, reservations: Array.from(reservationMap.values()), meta };
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

//? DETAILS RESERVATION
const getDetailById = async (id, reservationId) => {
  try {
    const reservationDetail = await prisma.resvRoom.findFirstOrThrow({
      where: {
        id,
        reservationId
      },
      select: {
        reservation: {
          select: {
            id: true,
            reserver: {
              select: {
                resourceName: true,
                guest: {
                  select: {
                    name: true,
                    contact: true
                  },
                },
              },
            },
            manyAdult: true,
            manyBaby: true,
            manyChild: true,
            arrivalDate: true,
            departureDate: true,
            checkoutDate: true,
            checkInDate: true,
            resvStatus: {
              select: { id: true, description: true },
            },
            reservationRemarks: true
          }
        },
        voucherId: true,
        room: {
          select:
          {
            id: true,
            roomType: {
              select: { id: true, bedSetup: true }
            },
            roomImage: true,
          },
        },
        arrangment: {
          select: {
            id: true,
            rate: true
          }
        }
      },
    });
    const balance = await generateBalanceAndTotal({ balance: true }, reservationId, id)
    reservationDetail.balance = balance
    return reservationDetail;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
};

//? DATA MODIFY / ADD MODIFY
const CreateNewReservation = async (data, user) => {
  try {
    let arrivalDate, departureDate, manyNight;
    arrivalDate = new Date(data.arrivalDate).toISOString();
    departureDate = new Date(data.departureDate).toISOString();
    manyNight = countNight(arrivalDate, departureDate);
    await isRoomAvailable({ arr: arrivalDate, dep: departureDate }, data.room.roomId)

    const [guestName, guestContact] = data.nameContact.split('/');
    if (guestContact === undefined) throw Error('Please send a correct format [Guest Name]/[Phone Number]')
    const createdGuest = await CreateNewGuest(guestName, guestContact);
    const createdReserver = await CreateNewReserver(createdGuest.guest.id, data);
    const createdReservation = await prisma.reservation.create({
      data: {
        reserver: {
          connect: {
            id: createdReserver.id
          }
        },
        arrivalDate,
        departureDate,
        manyAdult: data.manyAdult,
        manyChild: data.manyChild,
        manyBaby: data.manyBaby,
        manyNight,
        resvStatus: {
          connect: { id: data.resvStatusId }
        },
        reservationRemarks: data.reservationRemarks
      }
    })
    const createdResvRoom = await createNewResvRoom(createdReservation.id, data.room, user);
    return { createdGuest, createdReserver, createdReservation, createdResvRoom }
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};


//?HELPER SIDE
const DetailCreateReservationHelper = async () => {
  try {
    const availableRooms = await prisma.room.findMany({ where: { NOT: [{ id: 0 }] }, select: { id: true, roomType: true, roomImage: true }, orderBy: { id: 'asc' } });
    const arrangmentCode = await prisma.arrangmentCode.findMany({
      where: { NOT: [{ id: `REMOVED` }], deleted: false },
      select: {
        id: true,
        rate: true
      }
    })
    const reservationStatus = await prisma.resvStatus.findMany({
      select: {
        id: true,
        description: true
      },
      take: 3
    })
    return {
      availableRooms, reservationStatus, arrangmentCode
    }
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

//?DELETE
const deleteReservationById = async (id, resvRoomId) => {
  try {
    const [reservationExist, resvroomExist] = await prisma.$transaction([
      prisma.reservation.findFirstOrThrow({ where: { id }, select: { resvRooms: true } }),
      prisma.resvRoom.findFirstOrThrow({ where: { id: resvRoomId } }),
    ])
    const deleted_at = generateDeleteDate("deleteResv")
    await prisma.resvRoom.update({ where: { id: resvroomExist.id }, data: { deleted: true, deleted_at } })
    await prisma.room.update({ where: { id: resvroomExist.roomId }, data: { occupied_status: false } })
    return "Resv Room Delete"
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const checkCurrentStatus = async (id) => {
  try {
    const currStat = await prisma.reservation.findFirstOrThrow({ where: { id }, select: { resvStatus: { select: { id: true } } } })
    return currStat.resvStatus.id
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

//? EDIT DATA
const editReservation = async (reservationId, resvRoomId, data, user) => {
  try {
    let { nameContact, arrangmentCode, resourceName, manyAdult, manyChild, manyBaby, arrivalDate, departureDate, reservationRemarks, resvStatusId, voucher } = data, name, contact, manyNight;
    name = nameContact.split('/')[0];
    contact = nameContact.split('/')[1];
    manyNight = countNight(arrivalDate, departureDate)
    arrivalDate = `${arrivalDate}T00:00:00.00Z`
    departureDate = `${departureDate}T00:00:00.00Z`

    const update = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        reserver: {
          update: {
            resourceName,
            guest: {
              update: {
                name,
                contact

              }
            }
          }
        },
        resvStatus: {
          connect: { id: resvStatusId }
        },
        manyAdult,
        manyChild,
        manyBaby,
        manyNight,
        arrivalDate,
        departureDate,
        reservationRemarks
      }
    });
    const resvRoom = await prisma.resvRoom.update({
      where: { id: resvRoomId }, data: { arrangmentCodeId: arrangmentCode }
    })
    if (voucher != '') await setVoucher(voucher, resvRoom.id, user.id)
    return { update, voucher: `Using voucher: ${voucher}` };
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const AddWaitingList = async (reservationId, resvRoomId, request) => {
  try {
    const exist = await prisma.resvRoom.findFirstOrThrow({ where: { id: +resvRoomId, reservationId: +reservationId }, select: { roomId: true } })
    const task = await genearateListOfTask("GUEREQ", exist.roomId, request)
    return task
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const ChangeReservationProgress = async (id, changeTo, force = "false") => {
  try {
    let currentStat;
    const reservation = await prisma.reservation.findFirstOrThrow({ where: { id }, select: { id: true, borderColor: true, onGoingReservation: true, checkInDate: true, checkoutDate: true, inHouseIndicator: true, resvRooms: { select: { id: true, roomId: true } } } });
    const currentDate = new Date();
    const oldBorderColor = reservation.borderColor;
    const progressColor = ["#16a75c", "#fffc06", "#fe0001"]
    const progressName = ['Reservation', 'Check In', 'Check Out']
    const resvRooms = reservation.resvRooms
    let progressIndex = 0, roomStatusId = 0;
    switch (changeTo) {
      case 'reservation':
        progressIndex = 0
        break;
      case 'checkin':
        progressIndex = 1
        if (oldBorderColor === progressColor[1]) throw Error("Already Check In")
        currentStat = await checkCurrentStatus(id)
        if (currentStat != 1) throw Error("Status aren't Guaranteed")
        for (let room of reservation.resvRooms) {
          await activateDeactivateRoomEmail(room.id, "activate")
          await changeRoomStatusByDescription(room.roomId, "OC")
          await changeOccupied(room.roomId, true)
        }
        reservation.checkInDate = currentDate
        break;
      case 'checkout':
        progressIndex = 2
        if (oldBorderColor === progressColor[0]) throw Error("Reservation hasn't Check In yet")
        await generateBalanceAndTotal({}, reservation.id).then(({ balance }) => { if (balance < 0 && force != "true") throw Error('Balance must be 0 before Check Out') })
        currentStat = await checkCurrentStatus(id)
        if (currentStat != 1) throw Error("Status aren't Guaranteed")
        for (let room of reservation.resvRooms) {
          await activateDeactivateRoomEmail(room.id, "deactivate")
          await changeRoomStatusByDescription(room.roomId, "VD")
          await changeOccupied(room.roomId, false)
          await genearateListOfTask("CHECKOUT", room.roomId)
        }
        reservation.checkoutDate = currentDate
        break;
      default:
        throw Error("No Progress Sync");
    }
    delete reservation.resvRooms
    reservation.inHouseIndicator = changeTo != 'checkin' ? false : true
    reservation.borderColor = progressColor[progressIndex];
    reservation.onGoingReservation = changeTo != 'checkout' ? true : false
    const updatedReservation = await prisma.reservation.update({ where: { id }, data: reservation })
    if (changeTo != 'reservation') {
      roomStatusId = changeTo === 'checkin' ? 5 : 3 //?Occupied Clean or Vacant Dirty
      resvRooms.forEach(async room => {
        if (changeTo != "checkout") await addNewInvoiceFromArticle([], reservation.id, room.id)
        await prisma.room.update({ where: { id: room.roomId }, data: { roomStatusId } })
      })
    }
    return { message: `Status Change to ${progressName[progressIndex]}`, oldBorderColor, newBorderColor: updatedReservation.borderColor, checkInDate: updatedReservation.checkInDate, checkOutDate: updatedReservation.checkoutDate }
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const GetPreviousIdCard = async (reservationId) => {
  try {
    const idCard = await prisma.idCard.findFirst({ where: { reservationId }, select: { name: true, cardIdentifier: true, cardId: true, address: true } })
    return idCard
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const AddNewIdCard = async (data) => {
  try {
    delete data.resvRoomId
    const createdIdCard = await prisma.idCard.create({ data })
    return createdIdCard
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const changeSpecialTreatment = async (reservationId, specialTreatmentId) => {
  try {
    const treatment = ['VIP', 'INCOGNITO']
    if (specialTreatmentId > 2) specialTreatmentId = null
    await prisma.reservation.update({ where: { id: reservationId }, data: { specialTreatmentId: specialTreatmentId } })
    return treatment[specialTreatmentId - 1] || "Default"
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const roomAvailableChecker = async (query) => {
  let { roomId, range, id } = query
  try {
    let [arr, dep] = range.split('T')
    arr = arr.replace(/\//g, '-')
    dep = dep.replace(/\//g, '-')
    return await isRoomAvailable({ arr, dep }, +roomId, +id)
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const reverseCheckIn = async (reservationId) => {
  try {
    console.log('Sampe sini?')
    const { resvRooms } = await prisma.reservation.findFirstOrThrow({ where: { id: +reservationId }, include: { resvRooms: true }})
    for(let room of resvRooms){
      console.log('Sampe sini 2?')
      await activateDeactivateRoomEmail(room.id, "activate")
      await changeRoomStatusByDescription(room.roomId, "OC")
      await changeOccupied(room.roomId, true)
      await deleteCheckoutTask(room.roomId)
    }
    return await prisma.reservation.update({where: { id: +reservationId } ,data: { borderColor: "#fffc06", onGoingReservation: true, inHouseIndicator: true, checkoutDate: null } })

  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

module.exports = {
  getAllReservation,
  getDetailById,
  reverseCheckIn,
  deleteReservationById,
  CreateNewReservation,
  editReservation,
  roomAvailableChecker,
  ChangeReservationProgress,
  DetailCreateReservationHelper,
  AddNewIdCard,
  AddWaitingList,
  orderReservationByIdentifier,
  changeSpecialTreatment,
  checkCurrentStatus,
  GetPreviousIdCard
};
