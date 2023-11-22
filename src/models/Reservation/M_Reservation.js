const {
  reservationClient,
} = require("../Helpers/Config/Front Office/ReservationConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");

//? SORTING LANDPAGE

const orderByIdentifier = (sortAndOrder) => {
  let orderQuery;
  const sortIdentifier = sortAndOrder.split(" ")[0];
  console.log(sortIdentifier);
  const sortBy = sortAndOrder.split(" ")[1];
  const orderBy = sortAndOrder.split(" ")[2];

  //?Reservation Number //?Arrival Date //?Departure Date //?Night //?Created Date
  if (sortIdentifier === "resv") {
    orderQuery = {
      [sortBy]: orderBy,
    };
  } else if (sortIdentifier === "rese") {
    //?Reservation Resource
    switch (sortBy) {
      case "name":
        orderQuery = {
          reserver: {
            //?Guest Name
            guest: {
              [sortBy]: orderBy,
            },
          },
        };
        break;

      default:
        orderQuery = {
          reserver: {
            [sortBy]: orderBy,
          },
        };
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
              [sortBy]: orderBy,
            },
          },
        };
        break;

      default:
        orderQuery = {
          resvRoom: {
            room: {
              [sortBy]: orderBy,
            },
          },
        };
        break;
    }
  }
  console.log(orderQuery);
  return orderQuery;
};

const getAllReservation = async (sortAndOrder, nameQuery, dateQuery) => {
  try {
    let orderBy, name, arrivalDate, departureDate;
    name = nameQuery || "";
    if (dateQuery) {
      arrivalDate = dateQuery.split(" ")[0] || "";
      departureDate = dateQuery.split(" ")[1] || "";
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
            RoomMaid: {
              select: {
                id: true,
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
      orderBy,
    });
    return reservations;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

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
            roomId:true,
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
const addReservation = async (data) => {
  try {
    const reservation = await reservationClient.create({ data });
    return reservation;
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
  addReservation,
  editReservation,
  getReservationToday,
  getInhouseGuest,
  getArrivalToday,
  getDepartToday,
};
