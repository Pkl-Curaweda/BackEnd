const {
  canceledReservationClient,
} = require("../Helpers/Config/Front Office/CanceledReservationConfig");

const getAllCancelled = async () => {
  const cancelled = await canceledReservationClient.findMany({
    where: {
      resvStatus: {
        desc: "canceled",
      },
    },
    select: {
      reservationId: true,
      reservation: {
        select: {
          resvRooms: {
            select: {
              room: {
                select: {
                  id: true,
                  category: true,
                },
              },
            },
          },
          resvQty: {
            select: {
              id: true,
            },
          },
          resvStatus: {
            select: {
              desc: true,
            },
          },
          reserver: {
            select: {
              groupName: true,
              nation: true,
              guest_id: {
                select: {
                  id: true,
                },
              },
            },
          },
          canceledDate: true,
          arrivalDate: true,
          departureDate: true,
        },
      },
    },
  });
const checkoutsWithDate = cancelled.map((canceled) => {
  if (
    canceled.reservation &&
    canceled.reservation.canceledDate instanceof Date &&
    !isNaN(canceled.reservation.canceledDate)
  ) {
    canceled.reservation.canceledDate =
      canceled.reservation.canceledDate.toLocaleDateString();
  }
  return canceled;
});

return checkoutsWithDate;
};

const getCancelledById = async (canceledId) => {
  const cancelled = await canceledReservationClient.findMany({
    where: {
      resvStatus: {
        id:canceledId,
        desc: "canceled",
      },
    },
    select: {
      reservationId: true,
      reservation: {
        select: {
          resvRooms: {
            select: {
              room: {
                select: {
                  id: true,
                  category: true,
                },
              },
            },
          },
          resvQty: {
            select: {
              id: true,
            },
          },
          resvStatus: {
            select: {
              desc: true,
            },
          },
          reserver: {
            select: {
              groupName: true,
              nation: true,
              guest_id: {
                select: {
                  id: true,
                },
              },
            },
          },
          canceledDate: true,
          arrivalDate: true,
          departureDate: true,
        },
      },
    },
  });
  const checkoutsWithDate = cancelled.map((canceled) => {
    if (
      canceled.reservation &&
      canceled.reservation.canceledDate instanceof Date &&
      !isNaN(canceled.reservation.canceledDate)
    ) {
      canceled.reservation.canceledDate =
        canceled.reservation.canceledDate.toLocaleDateString();
    }
    return canceled;
  });

  return checkoutsWithDate;
};
module.exports = {getAllCancelled,getCancelledById};
