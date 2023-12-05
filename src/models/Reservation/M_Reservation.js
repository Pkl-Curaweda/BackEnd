const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, countNight, paginate } = require("../../utils/helper");
const { CreateNewGuest } = require("../Authorization/M_Guest");
const { CreateNewReserver } = require("./M_Reserver");
const { createNewResvRoom, deleteResvRoomByReservationId } = require("./M_ResvRoom");
const { getAllAvailableRoom } = require("./M_Room");

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
        reservation: {
          reserver: { guest: { name: { contains: name } } },
        },
        ...(dateQuery && { reservation: { arrivalDate } }),
        ...(dateQuery && { reservation: { departureDate } }),
        ...(whereQuery && { reservation: { [displayOption]: whereQuery } }),
      },
      select: {
        reservationId: true,
        arrangmentCodeId: true,
        roomId: true,
        arrangment: {
          select: {
            rate: true
          }
        },
        room: {
          select: {
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
const getReservationById = async (id) => {
  try {
    const reservation = await prisma.resvRoom.findFirst({
      where: {
        id,
      },
      select: {
        roomId: true,
        room: {
          select:
          {
            roomType: true,
            bedSetup: true,
            roomImage: true,
            rate: true,
          },
        },
        reservation: {
          select: {
            id: true,
            arrangmentCode: true,
            resvStatus: {
              select: {
                description: true,
                rowColor: true,
                textColor: true
              },
            },
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
            manyAdult: true,
            manyBaby: true,
            manyChild: true,
          }
        }
      },
    });
    return reservation;
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

    const guestName = data.nameContact.split('-')[0];
    const guestContact = data.nameContact.split('-')[1];
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

const createReservationHelper = async () => {
  try{
    const availableRooms = await getAllAvailableRoom();
    const arrangmentCode = await prisma.arrangmentCode.findMany({ 
      select: {
        id: true,
        rate: true
      }
    })
    return {
      availableRooms, arrangmentCode
    }
  }catch (err){
    ThrowError(err)
  }finally{
    await PrismaDisconnect()
  }
}

//! UNDER CONSTUCTIONS
const deleteReservationById = async (id) => {
  try {
    const deletedResvRoom = await deleteResvRoomByReservationId(id);
    await prisma.cleanRoom.deleteMany({ where: { reservationId: id } })
    await prisma.dirtyRoom.deleteMany({ where: { reservationId: id } })
    const deletedReservation = await prisma.reservation.delete({ where: { id } });
    return deletedReservation
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

//? EDIT DATA
const editReservation = async (reservationId, updatedData) => {
  try {
    if (!updatedData) {
      throw new Error("No data provided for update");
    }
    const update = await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: updatedData,
    });

    return update;
  } catch (error) {
    console.error("Error updating reservation:", error);
    throw error;
  }
};


module.exports = {
  getAllReservation,
  getReservationById,
  deleteReservationById,
  CreateNewReservation,
  editReservation,
  createReservationHelper
};
