const { de } = require("@faker-js/faker");
const { CreateNewGuest } = require("../Authorization/M_Guest");
const { CreateAndAssignToken } = require("../Authorization/M_Token");
const { reservationClient } = require("../Helpers/Config/Front Office/ReservationConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");
const { countNight } = require("../Helpers/generateFunction");
const { CreateNewReserver } = require("./M_Reserver");
const { createNewResvRoom } = require("./M_ResvRoom");

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

// const displayByIdentifier = (displayOption) => {
//   try {
//     let whereQuery, gteLte;
//     const today = new Date();
//     const date = today.toISOString().split("T")[0];
//     gteLte = {
//       gte: `${date}T00:00:00.000Z`,
//       lte: `${date}T23:59:59.999Z`,
//     }
//     if (displayOption != 'inhouse') {
//       displayOption = displayOption + "Date"
//       whereQuery = [displayOption] = gteLte
//     } else {
//       displayOption = "InHouseIndicator"
//       whereQuery = [displayOption] = true
//     }
//     return whereQuery;
//   } catch (err) {
//     ThrowError(err)
//   }
// }

const getAllReservation = async (sortAndOrder, displayOption, nameQuery, dateQuery) => {
  try {
    let orderBy, name, whereQuery, arrivalDate, departureDate;
    name = nameQuery || ""; //?Used for querying a name
    if (dateQuery != "") {
      arrivalDate = dateQuery.split(' ')[0] || "";
      departureDate = dateQuery.split(' ')[1] || "";
    }
    if (sortAndOrder != "") orderBy = orderByIdentifier(sortAndOrder);
    const reservations = await reservationClient.findMany({
      where: {
        //? SEARCH BY NAME
        reserver: { guest: { name: { contains: name } } },
        ...(dateQuery && { arrivalDate }),
        ...(dateQuery && { departureDate }),
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
            roomMaids: {
              select: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
        },
        created_at: true,
      },
      orderBy,
    });
    return reservations;
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect();
  }
};


//? DETAILS RESERVATION
const getReservationById = async (id) => {
  try {
    const reservation = await reservationClient.findFirst({
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

//! UNDER CONSTUCTIONS
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
    throw error;
  }
};

const getReservationToday = async () => {
  try {
    const today = new Date();
    const date = today.toISOString().split("T")[0];

    const reservationsToday = await reservationClient.findMany({
      where: {
        arrivalDate: {
          gte: `${date}T00:00:00.000Z`,
          lte: `${date}T23:59:59.999Z`,
        },
      },

      select: {
        id: true,
        arrangmentCode: true,
        arrivalDate: true,
        departureDate: true,
        manyNight: true,

        reserver: {
          select: {
            id: true,
            resourceName: true,
            guest: {
              select: {
                name: true,
              },
            },
          },
        },
        resvRooms: {
          select: {
            room: {
              select: {
                id: true,
                roomType: true,
                bedSetup: true,
                rate: true,
              },
            },
            RoomMaid: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        created_at: true,
      },
    });

    return reservationsToday;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const getInhouseGuest = async () => {
  try {
    const inHouseStatus = await reservationClient.findMany({
      where: {
        inHouseIndicator: true,
      },

      select: {
        id: true,
        arrangmentCode: true,
        arrivalDate: true,
        departureDate: true,
        manyNight: true,

        reserver: {
          select: {
            id: true,
            resourceName: true,
            guest: {
              select: {
                name: true,
              },
            },
          },
        },
        resvRooms: {
          select: {
            room: {
              select: {
                id: true,
                roomType: true,
                bedSetup: true,
                rate: true,
              },
            },
            RoomMaid: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        created_at: true,
      },
    });
    return inHouseStatus;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const getArrivalToday = async () => {
  try {
    const today = new Date();
    const date = today.toISOString().split("T")[0];

    const arrivalToday = await reservationClient.findMany({
      where: {
        arrivalDate: {
          gte: `${date}T00:00:00.000Z`,
          lte: `${date}T23:59:59.999Z`,
        },
      },

      select: {
        id: true,
        arrangmentCode: true,
        arrivalDate: true,
        departureDate: true,
        manyNight: true,

        reserver: {
          select: {
            id: true,
            resourceName: true,
            guest: {
              select: {
                name: true,
              },
            },
          },
        },
        resvRooms: {
          select: {
            room: {
              select: {
                id: true,
                roomType: true,
                bedSetup: true,
                rate: true,
              },
            },
            RoomMaid: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        created_at: true,
      },
    });
    return arrivalToday;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const getDepartToday = async () => {
  try {
    const today = new Date();
    const date = today.toISOString().split("T")[0];

    const departToday = await reservationClient.findMany({
      where: {
        departureDate: {
          gte: `${date}T00:00:00.000Z`,
          lte: `${date}T23:59:59.999Z`,
        },
      },

      select: {
        id: true,
        arrangmentCode: true,
        arrivalDate: true,
        departureDate: true,
        manyNight: true,

        reserver: {
          select: {
            id: true,
            resourceName: true,
            guest: {
              select: {
                name: true,
              },
            },
          },
        },
        resvRooms: {
          select: {
            room: {
              select: {
                id: true,
                roomType: true,
                bedSetup: true,
                rate: true,
              },
            },
            RoomMaid: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        created_at: true,
      },
    });
    return departToday;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

module.exports = {
  getAllReservation,
  getReservationById,
  deleteReservation,
  CreateNewReservation,
  editReservation,
  getReservationToday,
  getInhouseGuest,
  getArrivalToday,
  getDepartToday,
};
