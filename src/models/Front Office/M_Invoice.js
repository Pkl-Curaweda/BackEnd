const { ar } = require("@faker-js/faker");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, generateDateBetweenStartAndEnd, generateBalanceAndTotal, countDPP, generateSubtotal, generateTotal, generateItemPrice, splitDateTime, countISORange } = require("../../utils/helper");
const { genearateListOfTask } = require("../House Keeping/IMPPS/M_MaidTask");
const { reduceRemainingStock, getAvailableArticleAndStock } = require("../House Keeping/M_Stock");
const { countAfterVoucher } = require("./M_Voucher");
const { getAllAvailableRoom } = require("../House Keeping/M_Room");

const sortInvoice = (ident = "paid", ascDesc = "asc") => {
  try {
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
    return { orderBy }
  } catch (err) {
    ThrowError(err.message)
  }
}

//?This one is only the invoice is by the room/ per resvRoom
const GetInvoiceByResvRoomId = async (reservationId, resvRoomId, sortIdentifier, page, perPage, search, date, articlePage = 1, articlePerPage = 5) => {
  try {
    let invoices = [], startIndex, endIndex, arrivalDate, departureDate, dates, ident, ascDesc, orderBy, startDate, endDate;
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({
      where: { id: resvRoomId, reservationId },
      select: {
        id: true,
        arrangment: {
          select: {
            rate: true,
          },
        },
        voucherId: true,
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
    })
    if (date) {
      startDate = date.split(' ')[0];
      endDate = date.split(' ')[1];
    }
    if (sortIdentifier != undefined) {
      [ident, ascDesc] = sortIdentifier.split('-')
      orderBy = sortInvoice(ident, ascDesc);
    }
    const inv = await prisma.invoice.findMany({
      where: {
        resvRoomId,
        ...(date && { created_at: { gte: `${startDate}T00:00:00.000Z`, lte: `${endDate}T23:59:59.999Z` } })
      },
      select: { id: true, paid: true, created_at: true, articleType: { select: { id: true, description: true, price: true, Stock: { select: { remain: true } } } }, qty: true, roomId: true, rate: true },
      ...(orderBy != false && { ...orderBy } || { orderBy: { paid: 'desc' } })
    })

    for (let i of inv) {
      invoices.push({
        art: i.articleType != null ? i.articleType.id : "In Room",
        uniqueId: i.id,
        qty: i.qty,
        rowColor: i.paid != false ? "#808080" : "#ffffff",
        desc: i.articleType != null ? i.articleType.description : "",
        rate: i.rate,
        amount: (i.rate * i.qty),
        roomNo: i.roomId,
        billDate: splitDateTime(i.created_at).date,
      })
    }

    if (orderBy === false) {
      if (ident === "rev") ident = "amount"
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

    const artList = await getAvailableArticleAndStock(+articlePerPage, +articlePage)
    return {
      invoices,
      added: {
        voucherNo: resvRoom.voucherId || '-'
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

const addNewInvoiceFromOrder = async (orderId, resvRoomId) => {
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({ where: { id: resvRoomId }, select: { id: true, reservation: { select: { reserver: { select: { guestId: true } } } }, roomId: true } })
    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        resvRoomId: resvRoom.id,
        qty: orderDetail.qty,
        roomId: resvRoom.roomId,
        rate: orderDetail.price,
      }
    })
    return invoice
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const addNewInvoiceFromArticle = async (b = [], reservationId, resvRoomId) => {
  let addedArticle = []
  try {
    const resvRoom = await prisma.resvRoom.findFirstOrThrow({ where: { id: resvRoomId, reservation: { id: +reservationId } }, select: { reservation: { select: { arrivalDate: true, departureDate: true, checkInDate: true } }, arrangment: { select: { rate: true } }, roomId: true, voucherId: true, voucher: { select: { id: true } } } })
    if (resvRoom.reservation.checkInDate === null) throw Error('Reseration must be Check In before adding another Invoice')
    await checkInvoiceRoom(resvRoomId).then(data => {
      for (let dt of data) b.push(dt)
    })
    let dateUsed, dateReturn, rate
    for (let body of b) {
      if (!(body.qty <= 0)) {
        if (body.articleId != 998) {
          const art = await prisma.articleType.findFirstOrThrow({ where: { id: body.articleId, deleted: false }, select: { price: true, id: true } })
          dateUsed = resvRoom.reservation.arrivalDate;
          dateReturn = resvRoom.reservation.departureDate;
          rate = art.price
          await reduceRemainingStock(art.id, body.qty)
        } else rate = resvRoom.voucherId != null ? await countAfterVoucher(resvRoom.arrangment.rate, resvRoom.voucher.id) : resvRoom.arrangment.rate
        const resvArt = await prisma.invoice.create({
          data: {
            resvRoom: {
              connect: { id: resvRoomId }
            },
            room: {
              connect: { id: resvRoom.roomId }
            },
            qty: body.qty,
            articleType: {
              connect: { id: body.articleId }
            },
            ...(dateUsed && { dateUsed }),
            ...(dateReturn && { dateReturn }),
            rate
          }
        })
        if (body.articleId != 998) await genearateListOfTask("GUEREQ", resvRoom.roomId, `Room ${resvRoom.roomId} need ${resvArt.qty}`, resvArt.articleTypeId, resvArt.qty)
        addedArticle.push(resvArt)
      } else continue
    }
    return addedArticle
  } catch (err) {
    ThrowError(err)
  } finally {
    await PrismaDisconnect()
  }
}

const checkInvoiceRoom = async (resvRoomId) => {
  try {
    let roomBill = []
    const currentDate = new Date()
    const resvRoom = await prisma.resvRoom.findFirst({ where: { id: resvRoomId }, select: { reservation: { select: { checkInDate: true } }, created_at: true } })
    const totalRoomBillExist = await prisma.invoice.count({
      where: {
        resvRoomId, articleTypeId: 998, AND: [
          { created_at: { gte: `${resvRoom.created_at.toISOString().split('T')[0]}T00:00:00.000Z` } },
          { created_at: { lte: `${currentDate.toISOString().split('T')[0]}T23:59:59.999Z` } }
        ], NOT: [{ created_at: { lte: `${resvRoom.reservation.checkInDate.toISOString()}` } }]
      }
    })
    let neededRoomBill = countISORange(resvRoom.reservation.checkInDate, currentDate)
    if (neededRoomBill === 0) neededRoomBill = 1 //? If the range is 0, it mean it was the first time/ first room price
    if (!(neededRoomBill < 0)) {
      for (let i = 0; i < (neededRoomBill - totalRoomBillExist); i++) {
        roomBill.push({
          articleId: 998, qty: 1
        })
      }
    }
    return roomBill
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
    let addressComment = await prisma.reservation.findFirst({ where: { id: reservationId }, select: { idCard: {select: { address: true } }, reservationRemarks: true } })
    addressComment = { address: addressComment.idCard[0]?.address || "", comment: addressComment.reservationRemarks }
    const i = await prisma.invoice.findFirstOrThrow({
      where: { id: invoiceId },
      select: { id: true, articleType: { select: { id: true, description: true, price: true } }, qty: true, rate: true }
    })

    detail = {
      art: i.articleType.id ? i.articleType.id : "In Room",
      qty: i.qty,
      desc: i.articleType.description ? i.articleType.description : "",
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
    const artList = await prisma.articleType.findMany({ where: { deleted: false }, select: { id: true } })
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
      prisma.invoice.delete({ where: { id, resvRoomId }})
    ])
    if(deleted.articleTypeId){
      const stocks = await prisma.stock.findFirst({ where:{ articleTypeId: deleted.articleTypeId } })
      await prisma.stock.update({ where: { articleTypeId: deleted.articleTypeId }, data: { remain: stocks.remain + deleted.qty } })
    }
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
  checkInvoiceRoom,
  addNewInvoiceFromArticle,
  deleteInvoiceData
};
