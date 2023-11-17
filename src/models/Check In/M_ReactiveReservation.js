const {
  canceledReservationClient,
} = require("../Helpers/Config/Front Office/CanceledReservationConfig");

const getALLReactiveReservation = async () => {
  const Reactive = await canceledReservationClient.findMany({
    where: {
      resvStatus:{
       desc:"guaranted"
      }
    },
    select: {
      reservationId: true,
      reservation: {
        select: {
          arrivalDate: true,
          departureDate: true,
          resvStatus: true,
          resvQty: {
            select: {
                id:true
            },
          },
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
        },
      },
      room: {
        select: {
          id: true,
          category: true,
        },
      },
      createdAt: true,
    },
  });
  return Reactive;
};

module.exports = getALLReactiveReservation;
