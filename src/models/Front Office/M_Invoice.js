const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenStartAndEnd, generateBalanceAndTotal, countDPP, generateSubtotal, generateTotal, generateItemPrice, splitDateTime } = require("../../utils/helper");
const { countAfterVoucher } = require("./M_Voucher");

const sortInvoice = (ident = "paid", ascDesc = "asc") => {
  try {
    console.log(ident)
    switch (ident) {
      case "art":
        orderBy = { articleTypeId: ascDesc }
        break;
      case "date":
        orderBy = { created_at: ascDesc }
        break;
      case "room":
        orderBy = { roomId: ascDesc }
        break;
      case "desc" || "amount":
        return false
      case "rev":
        return false
      default:
        //? QTY,RATE 
        orderBy = { [ident]: ascDesc }
        break;
    }
    console.log(orderBy)
    return { orderBy }
  } catch (err) {
    ThrowError(err.message)
  }
}

//?This one is only the invoice is by the room/ per resvRoom
const GetInvoiceByResvRoomId = async (reservationId, resvRoomId, sortIdentifier, page, perPage, search, date) => {
  try {
    let invoices = [], startIndex, endIndex, arrivalDate, departureDate, dates, ident, ascDesc;
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
          voucherId: true,
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
    let orderBy
    if (sortIdentifier != undefined) {
      [ident, ascDesc] = sortIdentifier.split('-')
      orderBy = sortInvoice(ident, ascDesc);
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
          },
          select: { id: true, paid: true, articleType: { select: { id: true, description: true, price: true } }, qty: true, roomId: true, rate: true, orderDetail: { select: { id: true, service: { select: { id: true, name: true, price: true } } } } },
          ...(orderBy != false && { ...orderBy } || { orderBy: { paid: 'desc' } })
        })
      ])
      for (let i of inv) {
        invoices.push({
          art: i.articleType != null ? i.articleType.id : "In Room",
          uniqueId: i.id,
          qty: i.qty,
          rowColor: i.paid != false ? "#808080" : "#ffffff",
          desc: i.articleType != null ? i.articleType.description : i.orderDetail.service.name,
          rate: i.rate,
          amount: (i.rate * i.qty),
          roomNo: i.roomId,
          billDate: searchDate,
        })
      }
    }

    if (orderBy === false) {
      if (ident === "rev") ident = "amount"
      console.log(ident)
      switch (ascDesc) {
        case "desc":
          invoices = invoices.sort((a, b) => {
            b[ident]?.localeCompare(a[ident])

          });
          break;
        default:
          invoices = invoices.sort((a, b) =>
            a[ident]?.localeCompare(b[ident])
          );
          break;
      }
    }

    const total = invoices.length
    const lastPage = Math.ceil(invoices.length / perPage);

    startIndex = Math.max(0, (page - 1) * perPage);
    endIndex = Math.min(invoices.length - 1, startIndex + perPage - 1);
    if (search != undefined) invoices = searchInvoice(invoices, search)
    invoices = invoices.slice(startIndex, endIndex + 1);

    return {
      invoices,
      added: {
        roomBoys: resvRoom.roomMaids.user.name,
        voucherNo: resvRoom.voucherId
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
  let invoiceList = []
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({ where: { id: resvRoomId, reservationId }, select: { id: true, reservation: { select: { reserver: { select: { guestId: true } } } }, roomId: true } })
    const subtotal = await generateSubtotal(o)
    const order = await prisma.order.create({
      data: {
        guestId: resvRoom.reservation.reserver.guestId,
        roomId: resvRoom.roomId,
        subtotal,
        ppn: subtotal * 0.1, //TODO: PPN NEED TO CHANGED,
        fees: subtotal * 0.1, //TODO: FEES NEED TO CHANGED,
        total: generateTotal(subtotal),
      }
    })

    for (let orderDet of o) {
      const orderDetail = await prisma.orderDetail.create({
        data: {
          orderId: order.id,
          serviceId: orderDet.serviceId,
          price: await generateItemPrice(orderDet.serviceId, orderDet.qty),
          qty: parseInt(orderDet.qty, 10),
        }, include: { service: true }
      })
      const invoice = await prisma.invoice.create({
        data: {
          resvRoomId: resvRoom.id,
          orderDetailId: orderDetail.id,
          qty: orderDetail.qty,
          roomId: resvRoom.roomId,
          rate: orderDetail.price,
        }
      })
      invoiceList.push({
        art: "In Room",
        desc: orderDetail.service.name,
        orderDetailId: invoice.orderDetailId,
        qty: orderDetail.qty,
      })
    }
    return invoiceList
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const addNewInvoiceFromArticle = async (b = [], reservationId, resvRoomId) => {
  let addedArticle = []
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({ where: { id: resvRoomId, reservationId }, select: { reservation: { select: { arrivalDate: true, departureDate: true } }, arrangment: { select: { rate: true } }, roomId: true, voucherId: true, voucher: { select: { id: true, arithmatic: true } }} })
    await checkInvoiceRoom(resvRoomId).then((condition) => {
      if (condition === false) b.push({ articleId: 998, qty: 1 })
    })
  console.log(b)
    let dateUsed, dateReturn, rate
    for (let body of b) {
      if (!(body.qty <= 0)) {
        if (body.articleId != 998) {
          const art = await prisma.articleType.findFirstOrThrow({ where: { id: body.articleId }, select: { price: true } })
          dateUsed = resvRoom.reservation.arrivalDate;
          dateReturn = resvRoom.reservation.departureDate;
          rate = art.price
        }
        const resvArt = await prisma.invoice.create({
          data: {
            resvRoomId,
            roomId: resvRoom.roomId,
            qty: body.qty,
            articleTypeId: body.articleId,
            ...(dateUsed && { dateUsed }),
            ...(dateReturn && { dateReturn }),
            rate: resvRoom.voucherId != null ? countAfterVoucher(resvRoom.arrangment.rate, resvRoom.voucher.id) : resvRoom.arrangment.rate
          }
        })
        addedArticle.push(resvArt)
      } else continue
    }
    console.log(addedArticle)
    return addedArticle
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const checkInvoiceRoom = async (resvRoomId) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0]
    const check = await prisma.invoice.findFirst({
      where: {
        resvRoomId, articleTypeId: 998, AND: [
          { created_at: { gte: `${currentDate}T00:00:00.000Z` } },
          { created_at: { lte: `${currentDate}T23:59:59.999Z` } }
        ]
      }
    })
    return check != null
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
    addressComment = { address: addressComment.idCard.address || "", comment: addressComment.reserver.billComment || "" }
    const i = await prisma.invoice.findFirstOrThrow({
      where: { id: invoiceId },
      select: { id: true, articleType: { select: { id: true, description: true, price: true } }, qty: true, rate: true, orderDetail: { select: { id: true, service: { select: { id: true, name: true, price: true } } } } }
    })

    detail = {
      art: i.articleType.id ? i.articleType.id : "In Room",
      qty: i.qty,
      desc: i.articleType.description ? i.articleType.description : i.orderDetail.service.name,
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
  try {
    const [exist, deleted] = await prisma.$transaction([
      prisma.invoice.findFirstOrThrow({ where: { id, resvRoomId } }),
      prisma.invoice.delete({ where: { id, resvRoomId } })
    ])
    return deleted
  } catch (err) {
    ThrowError(err)
  } finally {
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
      billNumber: `#${reservationId}-${resvRoomId}`,
      resourceName: reservation.reserver.resourceName,
      guestName: reservation.reserver.guest.name,
      arrivalDate: splitDateTime(reservation.arrivalDate).date,
      departureDate: splitDateTime(reservation.departureDate).date,
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
