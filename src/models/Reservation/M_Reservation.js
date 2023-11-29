const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, countNight } = require("../../utils/helper");
const { CreateNewGuest } = require("../Authorization/M_Guest");
const { CreateNewReserver } = require("./M_Reserver");
const { createNewResvRoom, deleteResvRoomByReservationId } = require("./M_ResvRoom");

const orderByIdentifier = (sortAndOrder) => {
  let orderQuery;
  const sortIdentifier = sortAndOrder.split(' ')[0]
  const sortBy = sortAndOrder.split(' ')[1];
  const orderBy = sortAndOrder.split(' ')[2];

  if (sortIdentifier === "resv") {
    orderQuery = { [sortBy]: orderBy }
  } else if (sortIdentifier === "rese") {
    switch (sortBy) {
      case "name":
        orderQuery = {
          reserver: { guest: { [sortBy]: orderBy } }
        }
        break;

      default:
        orderQuery = { reserver: { [sortBy]: orderBy } }
        break;
    }
  } else if (sortIdentifier === "room") {
    switch (sortBy) {
      case "name":
        orderQuery = {
          resvRooms: { RoomMaid: { [sortBy]: orderBy } }
        }
        break;

      default:
        orderQuery = { resvRoomS: { room: { [sortBy]: orderBy } } }
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
    displayOption = `${disOpt}Date`;
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
    displayOption, whereQuery
  }
}



const getAllReservation = async (sortAndOrder, displayOption, nameQuery, dateQuery) => {
  try {
    let orderBy, name, whereQuery, arrivalDate, departureDate;
    name = nameQuery || ""; //?Used for querying a name
    if (displayOption != "") {
      const displayOptionAndQuery = displayByIdentifier(displayOption);
      displayOption = displayOptionAndQuery.displayOption;
      whereQuery = displayOptionAndQuery.whereQuery;
    } else {
      if (dateQuery != "") {
        arrivalDate = dateQuery.split(" ")[0] || "";
        departureDate = dateQuery.split(" ")[1] || "";
      }
    }
    if (sortAndOrder != "") orderBy = orderByIdentifier(sortAndOrder);
    const reservations = await prisma.reservation.findMany({
      where: {
        //? SEARCH BY NAME
        reserver: { guest: { name: { contains: name } } },
        ...(dateQuery && { arrivalDate }),
        ...(dateQuery && { departureDate }),
        ...(whereQuery && { [displayOption]: whereQuery }),
      },
      select: {
        id: true,
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
        arrivalDate: true,
        departureDate: true,
        arrangmentCode: true,
        manyNight: true,
        resvRooms: {
          select: {
            roomId: true,
            room: {
              select: {
                roomType: true,
                bedSetup: true,
                rate: true,
              },
            },
          },
        },
        created_at: true,
      },
      orderBy,
      // take: limit,
      // skip: skip,
    });
    return reservations;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};


//? DETAILS RESERVATION
const getReservationById = async (id) => {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        arrangmentCode: true,
        resvRooms: {
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
          },
        },
        resvStatus: {
          select: {
            description: true,
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
        arrangmentCode: data.arrangmentCode,
        reservationRemarks: data.reservationRemarks
      }
    })
    const createdResvRoom = await createNewResvRoom(createdReservation.arrangmentCode, createdReservation.id, data);
    return { createdGuest, createdReserver, createdReservation, createdResvRoom }
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

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
};
