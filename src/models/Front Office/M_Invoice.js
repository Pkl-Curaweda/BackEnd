const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenStartAndEnd, generateBalanceAndTotal, countDPP, generateSubtotal, generateTotal, generateItemPrice, splitDateTime } = require("../../utils/helper");

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
          roomMaids: { select: { user: { select: { name: true } } } },
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
    ])
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
      const [inv] = await prisma.$transaction([
        prisma.invoice.findMany({
          where: {
            resvRoomId, created_at: {
              gte: `${searchDate}T00:00:00.000Z`,
              lte: `${searchDate}T23:59:59.999Z`,
            },
            paid: false
          },
          select: { id: true, articleType: { select: { id: true, description: true, price: true } }, qty: true, rate: true, order: { select: { id: true, service: { select: { id: true, name: true, price: true } } } } }
        })
      ])

      for(let i of inv){
        invoices.push({
          art: i.articleType.id ? i.articleType.id : "In Room",
          uniqueId: i.id,
          qty: i.qty,
          desc: i.articleType.description ? i.articleType.description : i.order.service.name,
          rate: i.rate,
          amount: (i.rate * i.qty),
          billDate: searchDate,
        })
      }
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
        roomBoys: resvRoom.roomMaids.user.name,
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
        select: {
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

const GetInvoiceDetailByArt = async (reservationId, resvRoomId, invoiceId) => {
  try {
    let detail;
    const balanceTotal = await generateBalanceAndTotal({ balance: true, total: true }, reservationId, resvRoomId)
    let addressComment = await prisma.reservation.findFirst({ where: { id: reservationId }, select: { idCard: { select: { address: true } }, reserver: { select: { billComment: true } } } })
    addressComment = { address: addressComment.idCard.address || "",comment: addressComment.reserver.billComment || "" }
    const i = await prisma.invoice.findFirstOrThrow({ where: { id: invoiceId } ,
      select: { id: true, articleType: { select: { id: true, description: true, price: true } }, qty: true, rate: true, order: { select: { id: true, service: { select: { id: true, name: true, price: true } } } } }
    })

    detail = {
      art: i.articleType.id ? i.articleType.id : "In Room",
      qty: i.qty,
      desc: i.articleType.description ? i.articleType.description : i.order.service.name,
      rate: i.rate,
      amount: (i.rate * i.qty),
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

const deleteInvoiceData = async (reservationId, resvRoomId, id) => {
  try{
    const [exist, deleted] = await prisma.$transaction([
      prisma.invoice.findFirstOrThrow({ where: { id, resvRoomId } }),
      prisma.invoice.delete({ where: { id, resvRoomId } })
    ])
    return deleted
  }catch(err){
    ThrowError(err)
  }finally{
    await PrismaDisconnect()
  }
}

const printInvoice = async (reservationId, resvRoomId, sortIdentifier, page, perPage, search, date) => {
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({ 
      where: {
        id: resvRoomId, reservationId
      },
      select: {
        id: true,
        reservation: {
          select: {
            arrivalDate: true,
            departureDate: true,
            reserver: {
              select: {
                resourceName: true,
                guest: {
                  select: {
                    name: true,
                  },
                },
              },
            }
          }
        }
      }
    });
    const { reservation } = resvRoom
    const inv = await GetInvoiceByResvRoomId(reservationId, resvRoomId, sortIdentifier, page, perPage, search, date)
    return {
      resourceName:  reservation.reserver.resourceName,
      guestName: reservation.reserver.guest.name,
      arrivalDate: splitDateTime(reservation.arrivalDate).date,
      departureDate:  splitDateTime(reservation.departureDate).date,
      invoices: inv.invoices
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
  addNewInvoiceFromArticle,
  deleteInvoiceData
};
