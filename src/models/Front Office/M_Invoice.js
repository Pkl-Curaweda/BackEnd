const { prisma } = require("../../../prisma/seeder/config");
const {
  ThrowError,
  PrismaDisconnect,
  countNight,
  generateDateBetweenStartAndEnd,
  generateBalanceAndTotal,
} = require("../../utils/helper");

//?This one is only the invoice is by the room/ per resvRoom
const GetInvoiceByResvRoomId = async (
  reservationId,
  resvRoomId,
  sortIdentifier,
  page,
  perPage
) => {
  try {
    let invoices = [],
      startIndex,
      endIndex,
      arrivalDate,
      departureDate;
    let resvRoom = await prisma.resvRoom.findFirstOrThrow({
      where: { id: resvRoomId, reservationId },
      select: {
        arrangment: {
          select: {
            rate: true,
          },
        },
        roomId: true,
        voucherNo: true,
        roomMaids: {
          select: {
            user: {
              select: { name: true },
            },
          },
        },
        reservation: {
          select: {
            arrivalDate: true,
            departureDate: true,
            reserver: {
              select: { guestId: true },
            },
          },
        },
      },
    });
    const { guestId } = resvRoom.reservation.reserver;
    arrivalDate = resvRoom.reservation.arrivalDate.toISOString().split("T")[0];
    departureDate = resvRoom.reservation.departureDate
      .toISOString()
      .split("T")[0];
    const dates = generateDateBetweenStartAndEnd(arrivalDate, departureDate);
    startIndex = Math.max(0, (page - 1) * perPage);
    endIndex = Math.min(dates.length - 1, startIndex + perPage - 1);

    for (let i = startIndex; i <= endIndex; i++) {
      const searchedDate = new Date(dates[i]);
      const searchDate = searchedDate.toISOString().split("T")[0];
      //?ROOM PRICE / DAYS
      invoices.push({
        art: 998,
        uniqueId: 1,
        qty: 1,
        desc: "Room",
        rate: resvRoom.arrangment.rate,
        amount: resvRoom.arrangment.rate,
        billDate: searchDate,
      });

      const orders = await prisma.orderDetail.findMany({
        where: {
          order: { guestId },
          created_at: {
            gte: `${searchDate}T00:00:00.000Z`,
            lte: `${searchDate}T23:59:59.999Z`,
          },
        },
        select: {
          id: true,
          qty: true,
          service: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });

      orders.forEach((order) => {
        //?ORDER / DAYS
        invoices.push({
          art: order.service.id,
          uniqueId: order.id,
          qty: order.qty,
          desc: order.service.name,
          rate: order.service.price,
          amount: order.qty * order.service.price,
          billDate: searchDate,
        });
      });

      const payments = await prisma.resvPayment.findMany({
        where: {
          reservationId,
          created_at: {
            gte: `${searchDate}T00:00:00.000Z`,
            lte: `${searchDate}T23:59:59.999Z`,
          },
        },
        select: {
          id: true,
          total: true,
        },
      });

      payments.forEach((payment) => {
        //?ANY PAYMENT IN THIS DATE
        invoices.push({
          art: 999,
          uniqueId: payment.id,
          qty: 1,
          desc: "Payment",
          rate: payment.total,
          amount: payment.total,
          billDate: searchDate,
        });
      });
    }
    if (sortIdentifier != undefined)
      invoices = sortInvoiceData(invoices, sortIdentifier);

    const lastPage = Math.ceil(dates.length / perPage);
    return {
      invoices,
      meta: {
        total: dates.length,
        currPage: page,
        lastPage,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const GetInvoiceDetailByArt = async (reservationId, resvRoomId, args) => {
  try {
    let detail;
    const { date, id, uniqueId } = args;
    const balanceTotal = await generateBalanceAndTotal(
      reservationId,
      resvRoomId
    );
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({
      where: { id: resvRoomId, reservationId },
      select: {
        arrangment: {
          select: {
            rate: true,
          },
        },
        roomId: true,
        voucherNo: true,
        roomMaids: {
          select: {
            user: {
              select: { name: true },
            },
          },
        },
        reservation: {
          select: {
            arrivalDate: true,
            departureDate: true,
            reserver: {
              select: { guestId: true },
            },
          },
        },
      },
    });
    switch (id) {
      case 998:
        //?ROOM PRICE / DAYS
        detail = {
          art: id,
          qty: 1,
          desc: "Room",
          rate: resvRoom.arrangment.rate,
          amount: resvRoom.arrangment.rate,
          billDate: date,
        };
        break;
      case 999:
        //?PAYMENT
        const payments = await prisma.resvPayment.findMany({
          where: {
            reservationId,
            created_at: {
              gte: `${date}T00:00:00.000Z`,
              lte: `${date}T23:59:59.999Z`,
            },
          },
          select: {
            total: true,
          },
        });
        detail = {
          art: 999,
          qty: 1,
          desc: "Payment",
          rate: payments[uniqueId].total,
          amount: payments[uniqueId].total,
          billDate: date,
        };
        break;
      default:
        //?ORDER DETAIL
        const order = await prisma.orderDetail.findFirstOrThrow({
          where: {
            id: uniqueId,
            service: { id },
            // created_at: {
            //     gte: `${date}T00:00:00.000Z`,
            //     lte: `${date}T23:59:59.999Z`
            // }
          },
          select: {
            qty: true,
            service: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        });
        detail = {
          art: id,
          uniqueId,
          qty: order.qty,
          desc: order.service.name,
          rate: order.service.price,
          amount: order.qty * order.service.price,
          billDate: date,
        };
        break;
    }

    return { detail, ...balanceTotal };
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};

const sortInvoiceData = (invoice, sortIdentifier) => {
  let propertiesKey;
  propertiesKey = sortIdentifier.split("-")[0];
  if (propertiesKey === "rev") propertiesKey = "amount";
  const sortBy = sortIdentifier.split("-")[1];
  if (propertiesKey === "desc" || propertiesKey === "date") {
    switch (sortBy) {
      case "desc":
        invoice = invoice.sort((a, b) =>
          b[propertiesKey]?.localeCompare(a[propertiesKey])
        );
        break;
      default:
        invoice = invoice.sort((a, b) =>
          a[propertiesKey]?.localeCompare(b[propertiesKey])
        );
        break;
    }
  } else {
    switch (sortBy) {
      case "desc":
        invoice = invoice.sort((a, b) => b[propertiesKey] - a[propertiesKey]);
        break;
      default:
        invoice = invoice.sort((a, b) => a[propertiesKey] - b[propertiesKey]);
        break;
    }
  }
  return invoice;
};
const printInvoice = async (id, reservationId) => {
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({ //Doganti ke resvRoom soalnya data yang bakal diambil ini dari 1 reservation bukan seluruh data yang ada di reservation
      where: {
        id, reservationId
      },
      select: {
        reservation: {
          select: {
            id: true,
            arrivalDate: true,
            departureDate: true,
            reserver: {
              select: {
                resourceName: true,
                guestId: true,
                guest: {
                  select: {
                    name: true,
                  },
                },
              },
            }
          }
        },
        arrangment: {
          select: {
            rate: true
          }
        },
      }
    });
    let invoices = []
    const { reservation, arrangment } = resvRoom
    const { reserver } = reservation
    const arrivalDate = resvRoom.reservation.arrivalDate.toISOString().split("T")[0]
    const departureDate = resvRoom.reservation.arrivalDate.toISOString().split("T")[0]
    //?Using date so it will only pick the data that are from the arrivalDate, and departureDate of that reservation
    const dates = generateDateBetweenStartAndEnd(arrivalDate, departureDate)
    for(date of dates){
      let roomPrice = {
        date,
        desc: "Room Rate",
        amount: arrangment.rate
      } //?What this do is each date take 1 room price of that room
      invoices.push(roomPrice)

      const orders = await prisma.orderDetail.findMany({ //?Now the order is based on the date, so the date will not only be the date of reservation.created_at
        where: {
          order: { guestId: reserver.guestId }
        },
        select: {
          qty: true,
          service: {
            select: {
              name: true,
              price: true,
            },
          }
        }
      })
      
      orders.forEach(order => {
        invoices.push({
          date,
          desc: order.service.name,
          amount: order.qty * order.service.price
        })
      })
    }
    return {
      resourceName: reserver.resourceName,
      guestName: reserver.guest.name,
      arrivalDate,
      departureDate,
      invoices
    }

    // const reservations = await prisma.reservation.findMany({
    //   select: {
    //     id: true,
    //     arrivalDate: true,
    //     departureDate: true,
    //     reserver: {
    //       select: {
    //         resourceName: true,
    //         guestId: true,
    //         guest: {
    //           select: {
    //             name: true,
    //           },
    //         },
    //       },
    //     },
    //     resvRooms: {
    //       select: {
    //         room: {
    //           select: {
    //             roomType: true,
    //           }
    //         },
    //         arrangment: {
    //           select: {
    //             rate: true
    //           }
    //         }
    //       }
    //     },
    //     created_at: true,
    //   },
    // });

    // const invoiceData = [];



    // for (const reservation of reservations) {
    //   const orders = await prisma.orderDetail.findMany({
    //     where: {
    //       order: { guestId: reservation.reserver.guestId },

    //     },
    //     select: {
    //       id: true,
    //       qty: true,
    //       service: {
    //         select: {
    //           id: true,
    //           name: true,
    //           price: true,
    //         },
    //       },
    //     },
    //   });
    //   console.log(orders)

    //   const arrivalDate = reservation.arrivalDate
    //     ? reservation.arrivalDate.toLocaleDateString()
    //     : "N/A";
    //   const departureDate = reservation.departureDate
    //     ? reservation.departureDate.toLocaleDateString()
    //     : "N/A";

    //   const invoiceRecord = {
    //     resourceName: reservation.reserver?.resourceName ?? "N/A",
    //     guestName: reservation.reserver?.guest?.name ?? "N/A",
    //     arrivalDate,
    //     departureDate,
    //     date: reservation.created_at
    //       ? reservation.created_at.toLocaleDateString()
    //       : "N/A",
    //     records: [],
    //   };

    //   invoiceRecord.records.push({
    //     description: "Room",
    //     amount: reservation.resvRooms.roomRate,
    //     billDate: invoiceRecord.date,
    //   });

    //   for (const order of orders) {
    //     invoiceRecord.records.push({
    //       qty: order.qty,
    //       description: order.service.name,
    //       rate: order.service.price,
    //       amount: order.qty * order.service.price,
    //       billDate: invoiceRecord.date,
    //     });
    //   }


    //   invoiceData.push(invoiceRecord);
    // }

    // return invoiceData;
  } catch (err) {
    ThrowError(err);
  } finally {
    await PrismaDisconnect();
  }
};



module.exports = {
  GetInvoiceByResvRoomId,
  GetInvoiceDetailByArt,
  printInvoice,
};
