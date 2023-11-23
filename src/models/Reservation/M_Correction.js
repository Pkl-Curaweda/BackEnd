const { prisma } = require("../../../prisma/seeder/config");
const {
  reservationClient,
} = require("../Helpers/Config/Front Office/ReservationConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");

//? SORTING LANDPAGE
const getAllReservation = async (or, sort) => {
  let order = {};

  switch (or) {
    case "gn": //guestname
      order = { reserver: { guest_id: { name: sort } } };
      break;
    case "rvno": //reservationnumber
      order = { id: sort };
      break;
    case "rn": //resourcename
      order = { reserver: { resourceName: sort } };
      break;
    case "ad": //arrivaldate
      order = { arrivalDate: sort };
      break;
    case "dd": //departdate
      order = { departureDate: sort };
      break;
    case "ca": //created at
      order = { created_at: sort };
      break;
    case "agc": //arrangmentcode
      order = { arrangmentCode: sort };
      break;

    default:
      break;
  }
  const reservations = await reservationClient.findMany({
    select: {
      id: true,
      reserver: {
        select: {
          resourceName: true,
          guest_id: {
            select: {
              name: true,
            },
          },
        },
      },
      arrivalDate: true,
      departureDate: true,
      checkInDate: true,
      arrangmentCode:true,
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
      created_at:true,
      manyNight:true,
    },
    orderBy: [order],
  });

  return reservations;
};

const getReservationById = async (reservationId) => {
  try {
    const reservation = await reservationClient.findFirst({
      where: {
        id: reservationId,
      },
      select: {
        id: true,
        arrangmentCode:true,
        resvRooms: {
          select: {
            roomId: true,
            room: {
              select: {
                roomType: true,
                bedSetup:true,
                roomImage:true,
                rate:true,
      

              },
            },
            RoomMaid:{
              select:{
                id:true,
                user:{
                  select:{
                    name:true,
                  }
                }

              }
            }
          },
        },
        resvStatus:{
          select:{
            description:true,
          }
        },
        reserver: {
          select: {
            resourceName: true,
            guest_id:{
              select:{
                name:true,
              }
            },
          },
        },
        arrivalDate: true,
        departureDate: true,
        manyNight:true,
        manyAdult:true,
        manyBaby:true,
        manyChild:true,
        
        

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


//? SEARCH BY NAME
const searchByName = async (searchTerm) => {
  const guests = await prisma.reservation.findMany({
    where: {
      reserver: {
        guest_id:{
          name:{
            contains: searchTerm,
          }
        }
      }
    },
    select: {
      id: true,
      reserver: {
        select:{
          resourceName: true,
          guest_id:{
            select: {
              name: true,
            }
          }
        }
      },

      resvRooms:{
        select:{
          room:{
            select:{
              id: true,
              roomType: true,
              bedSetup: true,
              rate: true,
            }
          }
        }
      },

      arrangmentCode: true,
      arrivalDate: true,
      departureDate: true,

      created_at: true,

      //(user) -> resvRoom -> roomMaidId(underworking)

      
      
      
    },
  });

  const guestsWithNight = guests.map((guest) => {
    const arrivalDate = new Date(guest.arrivalDate);
    const departureDate = new Date(guest.departureDate);
    const night = Math.floor((departureDate - arrivalDate) / (1000 * 60 * 60 * 24));

    return {
      ...guest,
      night,
    };
  });

  return guestsWithNight
};




module.exports = {
  getAllReservation,
  getReservationById,
  deleteReservation,
  addReservation,
  editReservation,
  searchByName,
};
