const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenStartAndEnd, generateBalanceAndTotal, countDPP, generateSubtotal, generateTotal, generateItemPrice } = require("../../utils/helper");

//?This one is only the invoice is by the room/ per resvRoom
const GetInvoiceByResvRoomId = async (reservationId, resvRoomId, sortIdentifier, page, perPage, search, date) => {
  try {
    let invoices = [], startIndex, endIndex, arrivalDate, departureDate, dates;
    const [resvRoom, artList] = await prisma.$transaction([
      prisma.resvRoom.findFirstOrThrow({
        where: { id: resvRoomId, reservationId },
        select: {
          id: true,
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
      }),
      prisma.articleType.findMany({ select: { id: true, description: true, price: true } })
    ]
  )
    const { guestId } = resvRoom.reservation.reserver;
    if (date) {
      const startDate = date.split('T')[0];
      const endDate = date.split('T')[1];
      dates = generateDateBetweenStartAndEnd(startDate, endDate)
    } else {
      const currDate = new Date()
      arrivalDate = resvRoom.reservation.arrivalDate.toISOString().split("T")[0];
      departureDate = currDate.toISOString().split('T')[0]
      dates = generateDateBetweenStartAndEnd(arrivalDate, departureDate);
    }

    for (let i = dates.length - 1; i >= 0; i--) {
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
          service: { name: { contains: search } },
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
          label: "In Room",
          uniqueId: order.id,
          qty: order.qty,
          desc: order.service.name,
          rate: order.service.price,
          amount: order.qty * order.service.price,
          path: `${process.env.BASE_URL}/detail/invoice/${reservationId}/${resvRoomId}/${searchDate}?ids=${order.service.id}-${order.id}`,
          billDate: searchDate,
        });
      });

      const resvArticle = await prisma.resvArticle.findMany({
        where: {
          resvRoomId: resvRoom.id,
          type: {
            description: { contains: search }
          },
          created_at: {
            gte: `${searchDate}T00:00:00.000Z`,
            lte: `${searchDate}T23:59:59.999Z`,
          },
        },
        select: {
          id: true,
          typeId: true,
          qty: true,
          type: {
            select: {
              description: true,
              price: true
            }
          }
        }
      })

      for (let art of resvArticle) {
        //?ARTICLE
        invoices.push({
          art: art.typeId,
          uniqueId: art.id,
          qty: art.qty,
          desc: art.type.description,
          rate: art.type.price,
          amount: art.qty * art.type.price,
          billDate: searchDate,
        });
      }

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

      payments.forEach((payment, index) => {
        //?ANY PAYMENT IN THIS DATE
        invoices.push({
          art: 999,
          uniqueId: index + 1,
          qty: 1,
          desc: "Payment",
          rate: payment.total,
          amount: payment.total,
          billDate: searchDate,
        });
      });
    }

    const total = invoices.length
    const lastPage = Math.ceil(invoices.length / perPage);

    startIndex = Math.max(0, (page - 1) * perPage);
    endIndex = Math.min(invoices.length - 1, startIndex + perPage - 1);
    if (search != undefined) invoices = searchInvoice(invoices, search)
    if (sortIdentifier != undefined) invoices = sortInvoiceData(invoices, sortIdentifier);

    invoices = invoices.slice(startIndex, endIndex + 1);


    return {
      invoices,
      added: {
        roomNo: resvRoom.roomId,
        roomBoys: resvRoom.roomMaids[0],
        voucherNo: resvRoom.voucherNo
      },
      artList,
      meta: {
        total,
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

const searchInvoice = (m, s) => {
  try {
    return m.filter((invoice) => { return invoice.desc.toLowerCase().includes(s.toLowerCase()); });
  } catch (err) {
    ThrowError(err)
  }
}

const addNewInvoiceFromOrder = async (o, reservationId, resvRoomId) => {
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({ where: { id: resvRoomId, reservationId }, select: { reservation: { select: { reserver: { select: { guestId: true } } } }, roomId: true } })
    const subtotal = await generateSubtotal(o)
    const order = await prisma.order.create({
      data: {
        guestId: resvRoom.reservation.reserver.guestId,
        roomId: resvRoom.roomId,
        subtotal,
        ppn: subtotal * 0.1,
        fees: generateTotal(subtotal),
        orderDetails: {
          createMany: {
            data: await Promise.all(
              o.map(async (item) => ({
                serviceId: parseInt(item.serviceId, 10),
                price: await generateItemPrice(item.serviceId, item.qty),
                qty: parseInt(item.qty, 10)
              }))
            )
          }
        }
      },
      include: {
        orderDetails: {
          include: {
            service: true
          }
        }
      }
    })
    return order
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const addNewInvoiceFromArticle = async (b, reservationId, resvRoomId) => {
  try {
    const [exist, resvArt] = await prisma.$transaction([
      prisma.resvRoom.findFirstOrThrow({ where: { id: resvRoomId, reservationId } }),
      prisma.resvArticle.create({
        data: {
          resvRoomId,
          ...b
        },
        select:{
          resvRoomId: true,
          qty: true,
          type: {
            select: {
              id: true,
              description: true
            }
          }
        }
      })
    ])
    return resvArt
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const GetInvoiceDetailByArt = async (reservationId, resvRoomId, args) => {
  try {
    let detail;
    const { date, id, uniqueId } = args
    const balanceTotal = await generateBalanceAndTotal({ balance: true, total: true }, reservationId, resvRoomId)
    let addressComment = await prisma.reservation.findFirst({ where: { id: reservationId }, select: { idCard: { select: { address: true } }, reserver: { select: { billComment: true } } } })
    addressComment = {
      address: addressComment.idCard.address || "",
      comment: addressComment.reserver.billComment || ""
    }
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({
      where: { id: resvRoomId, reservationId },
      select: {
        arrangment: {
          select: {
            rate: true
          }
        },
        roomId: true,
        voucherNo: true,
        roomMaids: {
          select: {
            user: {
              select: { name: true }
            }
          }
        },
        reservation: {
          select: {
            arrivalDate: true, departureDate: true,
            reserver: {
              select: { guestId: true }
            }
          }
        }
      }
    })
    switch (id) {
      case 998:
        //?ROOM PRICE / DAYS
        const checkDate = await generateDateBetweenStartAndEnd(resvRoom.reservation.arrivalDate, resvRoom.reservation.departureDate)
        if (!checkDate.includes(date)) throw Error('Unknown Date');
        detail = {
          art: id,
          qty: 1,
          desc: "Room",
          rate: resvRoom.arrangment.rate,
          amount: resvRoom.arrangment.rate,
          billDate: date
        }
        break;
      case 999:
        //?PAYMENT
        const payments = await prisma.resvPayment.findMany({
          where: {
            reservationId,
            created_at: {
              gte: `${date}T00:00:00.000Z`,
              lte: `${date}T23:59:59.999Z`
            }
          },
          select: {
            total: true
          }
        })
        if (payments.length === 0) throw new Error("No Payment Recorded");
        detail = {
          art: 999,
          qty: 1,
          desc: "Payment",
          rate: payments[uniqueId - 1].total,
          amount: payments[uniqueId - 1].total,
          billDate: date
        }
        break;
      default:
        const artList = await prisma.articleType.findMany({ select: { id: true } })
        const arts = artList.map(art => art.id)
        if (arts.includes(id)) {
          const resvArt = await prisma.resvArticle.findFirstOrThrow({
            where: {
              id: uniqueId,
              typeId: id,
              created_at: {
                gte: `${date}T00:00:00.000Z`,
                lte: `${date}T23:59:59.999Z`
              }
            },
            select: {
              id: true,
              typeId: true,
              qty: true,
              type: {
                select: {
                  description: true,
                  price: true
                }
              }
            }
          })
          detail = {
            art: id,
            uniqueId,
            qty: resvArt.qty,
            desc: resvArt.type.description,
            rate: resvArt.type.price,
            amount: resvArt.qty * resvArt.type.price,
            billDate: date
          }
        } else {
          //?ORDER DETAIL
          const order = await prisma.orderDetail.findFirstOrThrow({
            where: {
              id: uniqueId,
              service: { id },
              created_at: {
                gte: `${date}T00:00:00.000Z`,
                lte: `${date}T23:59:59.999Z`
              }
            },
            select: {
              qty: true,
              service: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          })
          detail = {
            art: id,
            uniqueId,
            qty: order.qty,
            desc: order.service.name,
            rate: order.service.price,
            amount: order.qty * order.service.price,
            billDate: date
          }
        }
        break;
    }

    return { detail, ...balanceTotal, ...addressComment };
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

const putInvoiceData = async (reservationId, resvRoomId, args, data) => {
  const { date, id, uniqueId } = args
  let detail;
  try {
    await prisma.resvRoom.findFirstOrThrow({ where: { id: resvRoomId, reservationId } })
    if (id >= 998) throw Error('Cannot Be Changed')
    const artList = await prisma.articleType.findMany({ select: { id: true } })
    const arts = artList.map(art => art.id)
    if (arts.includes(id)) {
      const [exist, resvArt] = await prisma.$transaction([
        prisma.resvArticle.findFirstOrThrow({
          where: {
            id: uniqueId,
            typeId: id
          }
        })
      ], [
        prisma.resvArticle.update({
          where: {
            id: uniqueId,
            typeId: id
          },
          data: { ...data },
          select: {
            id: true,
            typeId: true,
            qty: true,
            type: {
              select: {
                description: true,
                price: true
              }
            }
          }
        })
      ])
      detail = {
        art: id,
        uniqueId,
        qty: resvArt.qty,
        desc: resvArt.type.description,
        rate: resvArt.type.price,
        amount: resvArt.qty * resvArt.type.price,
        billDate: date
      }
    } else {
      //?ORDER DETAIL
      const [exist, order] = await prisma.$transaction([
        prisma.orderDetail.findFirstOrThrow({
          where: {
            id: uniqueId,
            service: { id }
          }
        })
      ], [
        prisma.orderDetail.update({
          where: {
            id: uniqueId,
            service: { id }
          },
          data: { ...data },
          select: {
            qty: true,
            service: {
              select: {
                name: true,
                price: true
              }
            }
          }
        })
      ])
      detail = {
        art: id,
        uniqueId,
        qty: order.qty,
        desc: order.service.name,
        rate: order.service.price,
        amount: order.qty * order.service.price,
        billDate: date
      }
    }
    return detail
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const printInvoice = async (id, reservationId) => {
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({ //Doganti ke resvRoom soalnya data yang bakal diambil ini dari 1 reservation bukan seluruh data yang ada di reservation
      where: {
        id, reservationId
      },
      select: {
        id: true,
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
    for (date of dates) {
      let roomPrice = {
        date,
        desc: "Room Rate",
        amount: arrangment.rate
      } //?What this do is each date take 1 room price of that room
      invoices.push(roomPrice)
      const orders = await prisma.orderDetail.findMany({ //?Now the order is based on the date, so the date will not only be the date of reservation.created_at
        where: {
          order: { guestId: reserver.guestId },
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

      const article = await prisma.resvArticle.findMany({
        where: { resvRoomId: resvRoom.id },
        select: {
          qty: true,
          type: {
            select: { description: true, price: true }
          }
        }
      })

      orders.forEach(order => {
        invoices.push({
          date: '',
          desc: order.service.name,
          amount: order.qty * order.service.price
        })
      })

      for (let art of article) {
        invoices.push({
          date: '',
          desc: art.type.description,
          amount: art.qty * art.type.price
        })
      }
    }
    return {
      resourceName: reserver.resourceName,
      guestName: reserver.guest.name,
      arrivalDate,
      departureDate,
      invoices
    }
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
  addNewInvoiceFromOrder,
  putInvoiceData,
  addNewInvoiceFromArticle
};
