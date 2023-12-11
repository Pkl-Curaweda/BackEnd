const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, countNight, paginate } = require("../../utils/helper");
const { CreateNewGuest } = require("../Authorization/M_Guest");
const { CreateNewReserver } = require("./M_Reserver");
const { createNewResvRoom, deleteResvRoomByReservationId } = require("./M_ResvRoom");
const { getAllAvailableRoom } = require("../House Keeping/M_Room");
const { encrypt } = require("../../utils/encryption");

const orderByIdentifier = (sortAndOrder) => {
  let orderQuery;
  const sortIdentifier = sortAndOrder.split(' ')[0]
  const sortBy = sortAndOrder.split(' ')[1];
  const orderBy = sortAndOrder.split(' ')[2];

  if (sortIdentifier === "resv") {
    switch (sortBy) {
      case "arrCode": {
        orderQuery = { arrangmentCodeId: orderBy }
      }
        break;
      case "rate": {
        orderQuery = { arrangment: { rate: orderBy } }
      }
        break;
      default: {
        orderQuery = { reservation: { [sortBy]: orderBy } }
        break;
      }
    }
  } else if (sortIdentifier === "rese") {
    switch (sortBy) {
      case "name":
        orderQuery = {
          reservation: {
            reserver: { guest: { [sortBy]: orderBy } }
          }
        }
        break;

      default:
        orderQuery = { reservation: { reserver: { [sortBy]: orderBy } } }
        break;
    }
  } else if (sortIdentifier === "room") {
    switch (sortBy) {
      // case "name":
      //   orderQuery = { roomMaids: { user: { [sortBy]: orderBy } } }
      //   break;

      default:
        orderQuery = { room: { [sortBy]: orderBy } }
        break;
    }
  }
  return orderQuery;
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

const getAllReservation = async (sortAndOrder, displayOption, nameQuery, dateQuery, page, perPage) => {
  try {
    let orderBy, name, whereQuery, arrivalDate, departureDate;
    name = nameQuery || "";
    if (displayOption != "") {
      const displayOptionAndQuery = displayByIdentifier(displayOption);
      displayOption = displayOptionAndQuery.displayOption;
      whereQuery = displayOptionAndQuery.whereQuery;
    } else {
      if (dateQuery != "") {
        arrivalDate = {
          gte: `${dateQuery.split(" ")[0] || ""}T00:00:00.000Z`,
          lte: `${dateQuery.split(" ")[1] || ""}T23:59:59.999Z`
        }
        departureDate = {
          gte: `${dateQuery.split(" ")[0] || ""}T00:00:00.000Z`,
          lte: `${dateQuery.split(" ")[1] || ""}T23:59:59.999Z`,
        }
      }
    }
    if (sortAndOrder != "") orderBy = orderByIdentifier(sortAndOrder);
    const { take, skip } = await paginate(prisma.reservation, whereQuery, { page, perPage })

    const reservations = await prisma.resvRoom.findMany({
      where: {
        reservation: { reserver: { guest: { name: { contains: name } } } },
        ...(dateQuery && { reservation: { arrivalDate } }),
        ...(dateQuery && { reservation: { departureDate } }),
        ...(whereQuery && { reservation: { [displayOption]: whereQuery } }),
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
            roomType: true,
            bedSetup: true,
            rate: true,
          },
        },
        roomMaids: {
          select: {
            user: {
              select: { name: true }
            }
          }
        },
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
            manyNight: true,
            arrivalDate: true,
            departureDate: true,
            created_at: true,
          }
        }
      },
      orderBy,
      take,
      skip
    });

    let reservationsArray = [];
    reservations.forEach((reservation) => {
      const reservationId = reservation.reservationId;
      const index = reservationsArray.findIndex((item) => item.reservationId === reservationId);
      delete reservation.reservationId;
      if (index === -1) {
        reservationsArray.push({
          reservationId,
          reservation: [reservation],
        });
      } else {
        reservationsArray[index].reservation.push(reservation);
      }
    });
    return { reservations: reservationsArray };
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
            resvStatus: {
              select: { description: true },
            },
            reservationRemarks: true
          }
        },
        room: {
          select:
          {
            id: true,
            roomType: true,
            bedSetup: true,
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
    return reservationDetail;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
};

//? DATA MODIFY / ADD MODIFY
const CreateNewReservation = async (data) => {
  try {
    let arrivalDate, departureDate, manyNight;
    arrivalDate = new Date(data.arrivalDate).toISOString();
    departureDate = new Date(data.departureDate).toISOString();
    manyNight = countNight(arrivalDate, departureDate);

    const guestName = data.nameContact.split('/')[0];
    const guestContact = data.nameContact.split('/')[1];
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
          connect: {
            id: 1
          }
        },
        reservationRemarks: data.reservationRemarks
      }
    })
    const createdResvRoom = await createNewResvRoom(createdReservation.id, data.room);
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
    const availableRooms = await getAllAvailableRoom();
    const arrangmentCode = await prisma.arrangmentCode.findMany({
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
const deleteReservationById = async (id) => {
  try {
    await deleteResvRoomByReservationId(id);
    const deletedReservation = await prisma.reservation.delete({ where: { id } });
    return deletedReservation
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

//? EDIT DATA
const editReservation = async (reservationId, resvRoomId, data) => {
  try {
    let { nameContact, arrangmentCode, resourceName, manyAdult, manyChild, manyBaby, arrivalDate, departureDate, reservationRemarks } = data, name, contact, manyNight;
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
        manyAdult,
        manyChild,
        manyBaby,
        manyNight,
        arrivalDate,
        departureDate,
        reservationRemarks
      }
    });
    await prisma.resvRoom.update({
      where: { id: resvRoomId }, data: { arrangmentCodeId: arrangmentCode }
    })
    return update;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const ChangeReservationProgress = async (id, changeTo) => {
  try {
    const reservation = await prisma.reservation.findFirstOrThrow({ where: { id }, select: { borderColor: true, onGoingReservation: true, checkInDate: true, checkoutDate: true } });

    const currentDate = new Date();
    const oldBorderColor = reservation.borderColor;
    const progressColor = ["ffff", "16a75c", "ffff"] //?Need to change the checkout border
    switch (changeTo) {
      case "reservation":
        reservation.borderColor = progressColor[0];
        reservation.onGoingReservation = true
        break;
      case "checkin":
        reservation.borderColor = progressColor[1];
        reservation.onGoingReservation = true
        reservation.checkInDate = currentDate
        break;
      case "checkout":
        reservation.borderColor = progressColor[2];
        reservation.onGoingReservation = false
        reservation.checkoutDate = currentDate
        break;
      default:
        throw Error("No Progress Sync");
    }
    const updatedReservation = await prisma.reservation.update({ where: { id }, data: reservation })
    return { oldBorderColor, newBorderColor: updatedReservation.borderColor }
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const AddNewIdCard = async (data) => {
  try{
    console.log(data)
    const  { reservationId, resvRoomId } = data
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({where: { id: resvRoomId, reservationId }, select: { reservation: { select: { reserver: { select: { guestId: true } } } } }})
    data.cardId = encrypt(data.cardId)
    await prisma.guest.update({ where: { id: resvRoom.reservation.reserver.guestId }, data: { address: data.address } })
    delete data.resvRoomId, data.address
    const createdIdCard = await prisma.idCard.create({data})    
    return createdIdCard
  }catch(err){
    ThrowError(err)
  }finally{
    await PrismaDisconnect()
  }
}
module.exports = {
  getAllReservation,
  getDetailById,
  deleteReservationById,
  CreateNewReservation,
  editReservation,
  ChangeReservationProgress,
  DetailCreateReservationHelper,
  AddNewIdCard
};
