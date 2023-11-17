const {reservationClient} = require("../Helpers/Config/Front Office/ReservationConfig");

const getALLCheckOut = async () => {
  const checkouts = await reservationClient.findMany({
    where: {
      finishedReservation: true,
    },
    select: {
      id:true,
      m: true,
      l: true,
      argtCode:true,
      reserver: {
        select: {
          groupName: true,
          nation: true,
          guest_id: {
            select: {
              name: true,
            },
          },
        },
      },
      resvRooms: {
        select: {
          roomId: true,
          room:{
            select:{
              rateCode:{
                select:{
                  rate:true,
                }
              }
            }
          }

        },
      },
      resvStatus: {
        select: {
          desc: true,
        },
      },
      resvQty:{
        select:{
          manyChild:true,
          manyAdult:true,
          manyRoom:true,
        }
      },
      resvFlights:{
        select:{
          arrivalFlight:true,
          departureFlight:true,
        }
      },
      arrivalDate: true,
      departureDate: true,
      checkoutDate: true,

      
    },
  });

  const checkoutsWithTime = checkouts.map((checkout) => {
    const depTime = new Date(checkout.departureDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const arrTime = new Date(checkout.arrivalDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const arrivalDate = new Date(checkout.arrivalDate).toLocaleDateString();
    const departureDate = new Date(checkout.departureDate).toLocaleDateString();

    return { ...checkout, depTime, arrTime, arrivalDate, departureDate };
  });

  return checkoutsWithTime;
};
const getCheckOutById = async (checkoutId) => {
  const checkouts = await reservationClient.findMany({
    where: {
      id:checkoutId,
      finishedReservation: true,
    },
    select: {
      id:true,
      m: true,
      l: true,
      argtCode: true,
      reserver: {
        select: {
          groupName: true,
          nation: true,
          guest_id: {
            select: {
              name: true,
            },
          },
        },
      },
      resvRooms: {
        select: {
          roomId: true,
          room: {
            select: {
              rateCode: {
                select: {
                  rate: true,
                },
              },
            },
          },
        },
      },
      resvStatus: {
        select: {
          desc: true,
        },
      },
      resvQty: {
        select: {
          manyChild: true,
          manyAdult: true,
          manyRoom: true,
        },
      },
      resvFlights: {
        select: {
          arrivalFlight: true,
          departureFlight: true,
        },
      },
      arrivalDate: true,
      departureDate: true,
      checkoutDate: true,
    },
  });
 
  const checkoutsWithTime = checkouts.map((checkout) => {
    const depTime = new Date(checkout.departureDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const arrTime = new Date(checkout.arrivalDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const arrivalDate = new Date(checkout.arrivalDate).toLocaleDateString();
    const departureDate = new Date(checkout.departureDate).toLocaleDateString();

    return { ...checkout, depTime, arrTime, arrivalDate, departureDate };
  });

  return checkoutsWithTime;

};
module.exports = {getALLCheckOut,getCheckOutById};



