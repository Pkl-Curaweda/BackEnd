const { CreateNewGuest } = require("../Authorization/M_Guest");
const { CreateAndAssignToken } = require("../Authorization/M_Token");
const { reservationClient } = require("../Helpers/Config/Front Office/ReservationConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");
const { countNight } = require("../Helpers/generateFunction");
const { CreateNewReserver } = require("./M_Reserver");
const { createNewResvRoom } = require("./M_ResvRoom");

//? SORTING LANDPAGE

const orderByIdentifier = (sortAndOrder) => {
  let orderQuery;
  const sortIdentifier = sortAndOrder.split(' ')[0]
  console.log(sortIdentifier)
  const sortBy = sortAndOrder.split(' ')[1];
  const orderBy = sortAndOrder.split(' ')[2];

  //?Reservation Number //?Arrival Date //?Departure Date //?Night //?Created Date
  if (sortIdentifier === "resv") {
    orderQuery = {
      [sortBy]: orderBy
    }
  } else if (sortIdentifier === "rese") {
    //?Reservation Resource
    switch (sortBy) {
      case "name":
        orderQuery = {
          reserver: {
            //?Guest Name
            guest: {
              [sortBy]: orderBy
            }
          }
        }
        break;

      default:
        orderQuery = {
          reserver: {
            [sortBy]: orderBy
          }
        }
        break;
    }
  } else if (sortIdentifier === "room") {
    //?Room Number //?Room Type //?Bed Type //?Room Rate
    switch (sortBy) {
      case "name":
        //?Room Boy Code?
        orderQuery = {
          resvRoom: {
            RoomMaid: {
              [sortBy]: orderBy
            }
          }
        }
        break;

      default:
        orderQuery = {
          resvRoom: {
            room: {
              [sortBy]: orderBy
            }
          }
        }
        break;
    }
  }
  console.log(orderQuery)
  return orderQuery
}


const getAllReservation = async (sortAndOrder, nameQuery, dateQuery) => {
  try {
    let orderBy, name, arrivalDate, departureDate;
    name = nameQuery || "";
    if (dateQuery) {
      arrivalDate = dateQuery.split(' ')[0] || "";
      departureDate = dateQuery.split(' ')[1] || "";
    }
    if (sortAndOrder != "") orderBy = orderByIdentifier(sortAndOrder);
    const reservations = await reservationClient.findMany({
      where: {
        //? SEARCH BY NAME
        reserver: { guest: { name: { contains: name } } },
        ...(dateQuery && { arrivalDate }),
        ...(dateQuery && { departureDate })
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
        checkInDate: true,
        arrangmentCode: true,
        resvRooms: {
          select: {
            roomId: true,
            room: {
              select: {
                roomType: true,
              },
            },
          },
        },
        created_at: true,
        manyNight: true,
      },
      orderBy
    });
    return reservations;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
};

const getReservationById = async (id) => {
  try {
    const reservation = await reservationClient.findFirst({
      where: {
        id
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
        checkInDate: true,
        arrangmentCode: true,
        resvRooms: {
          select: {
            roomId: true,
            room: {
              select: {
                roomType: true,
              },
            },
          },
        },
        created_at: true,
        manyNight: true,
      },
    });
    return reservation;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteReservation = async (reservationId) => {
  try {
    await prisma.resvFlight.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.resvRoom.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.deposit.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.logReservation.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.canceledReservation.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.voucher.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.discrepancy.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.cleaningSheet.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.cleanRoom.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.dirtyRoom.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.oooRoom.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.guestPreference.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.task.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    await prisma.roomChange.deleteMany({
      where: {
        reservationId: reservationId,
      },
    });

    const deleteResv = await reservationClient.deleteMany({
      where: {
        id: reservationId,
      },
    });

    return deleteResv;
  } catch (error) {
    console.error("Error deleting reservation:", error);
    console.log("Error details:", JSON.stringify(error, null, 2)); // Log detailed error information
    throw error;
  }
};

//? DATA MODIFY / ADD MODIFY
const CreateNewReservation = async (data) => {
  try {
    let arrivalDate, departureDate, manyNight;
    arrivalDate = new Date(data.arrivalDate).toISOString();
    departureDate = new Date(data.departureDate).toISOString();
    manyNight = countNight(arrivalDate, departureDate);
    console.log(manyNight)

    const guestName = data.nameContact.split('-')[0];
    const guestContact = data.nameContact.split('-')[1];
    const createdGuest = await CreateNewGuest(guestName, guestContact);
    const createdReserver = await CreateNewReserver(createdGuest.guest.id, data);

    const createdReservation = await reservationClient.create({
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

    return {
      createdGuest,
      createdReserver, 
      createdReservation,
      createdResvRoom
    }
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
    const update = await reservationClient.update({
      where: {
        id: reservationId,
      },
      data: updatedData,
    });

    return update;
  } catch (error) {
    console.error("Error updating reservation:", error);
    // You might want to handle the error or throw it further
    throw error;
  }
};



module.exports = {
  getAllReservation,
  getReservationById,
  deleteReservation,
  CreateNewReservation,
  editReservation,
};
