const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { prisma } = require("../../../prisma/seeder/config");
const { verifyToken, getAccessToken, generateTotal, ThrowError, PrismaDisconnect } = require('../../utils/helper');
const { prismaError } = require('../../utils/errors.util');
const { error, success } = require('../../utils/response');
const { generateItemPrice, generateDefaultTrack, generateSubtotal, getAllOrder } = require('../../models/In Room Service/M_OrderDetail');
const orderDetail = require('../../models/In Room Service/M_OrderDetail');
const { addNewInvoiceFromOrder } = require('../../models/Front Office/M_Invoice');


const get = async (req, res) => {
  try {
    const data = await getAllOrder(req.user, req.params.id)
    return success(res, 'Showing All Order...', data)
  } catch (err) {
    return error(res, err.message)
  }
}
async function findOne(req, res) {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        orderDetails: {
          include: {
            service: true,
          },
        },
      },
    });
    if (!order) {
      return error(res, 'Order not found', 404);
    }
    return success(res, 'Order retreived successfully', 200);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      return prismaError(err, err.meta?.cause, res);
    }
    return error(res, 'Internal server error', err.message, 500);
  }
}


async function create(req, res) {
  const { roomId, resvRoomId } = req.user, { paymentMethod, fees, items } = req.body
  try {
    if (resvRoomId === null) throw Error('Your account didnt attach to a reservation \n Please tell this to our Front Office')
    const subtotal = await generateSubtotal(items);
    const order = await prisma.order.create({
      data: {
        resvRoom: { connect: { id: resvRoomId } },
        room: { connect: { id: roomId } },
        subtotal,
        ppn: subtotal * 0.1, //TODO: PPN NEED TO BE CHANGED
        fees: 1000, //TODO: IS THIS ONE NEED TO BE CHANGED FROM THE DATA?
        total: generateTotal(subtotal),
      }
    })
    if (paymentMethod === "RESV") await addNewInvoiceFromOrder(order.id, resvRoomId)
    await orderDetail.createMany(await Promise.all(
      req.body.items.map(async (item) => ({
        serviceId: parseInt(item.serviceId, 10),
        price: await generateItemPrice(item.serviceId, item.qty),
        qty: parseInt(item.qty, 10),
        ...(item.notes && { notes: item.notes }),
        progress: await generateDefaultTrack(item.serviceId)
      })),
    ))
    return success(res, 'Order created successfully', order, 201);
  } catch (err) {
    console.log(err)
    if (err instanceof PrismaClientKnownRequestError) {
      return prismaError(err, err.message, res);
    }
    return error(res, err.message);
  }
}


async function updateQty(req, res) {
  try {
    const { id, dordId } = req.params;
    const { serviceId, qty } = req.body;
    const newPrice = await generateItemPrice(serviceId, parseInt(qty, 10));

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        orderDetails: {
          select: {
            id: true,
            serviceId: true,
            qty: true,
          },
        },
      },
    });
    if (!order) {
      return error(res, 'Order not found', 'Order not found', 404);
    }
    const orderDetailToUpdate = order.orderDetails.find(
      (orderDetail) =>
        orderDetail.id === parseInt(dordId, 10) &&
        orderDetail.serviceId === parseInt(serviceId, 10),
    );
    if (!orderDetailToUpdate) {
      return error(res, 'Order detail not found', 'Order detail not found', 404);
    }

    let updatedOrderDetails;

    if (parseInt(qty, 10) === 0) {
      await prisma.orderDetail.delete({
        where: {
          id: parseInt(dordId, 10),
        },
      });

      updatedOrderDetails = order.orderDetails.filter(
        (orderDetail) => orderDetail.id !== parseInt(dordId, 10),
      );
    } else {
      const updatedOrderDetail = await prisma.orderDetail.update({
        where: {
          id: parseInt(dordId, 10),
        },
        data: {
          price: newPrice,
          qty: parseInt(qty, 10),
        },
        select: {
          serviceId: true,
          qty: true,
        },
      });

      /**
       *
       * @constant { {serviceId:number, qty:number}[] } updatedOrderDetails
       */

      updatedOrderDetails = order.orderDetails.map((orderDetail) => {
        if (
          orderDetail.serviceId === orderDetailToUpdate.serviceId &&
          orderDetail.id === parseInt(dordId, 10)
        ) {
          return updatedOrderDetail;
        }
        return orderDetail;
      });
    }

    if (updatedOrderDetails.length === 0) {
      await prisma.order.delete({
        where: {
          id,
        },
      });
      return success(res, 'Order deleted successfully because no item found', null, 200);
    }

    const newSubtotal = await generateSubtotal(updatedOrderDetails);

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        subtotal: newSubtotal,
        ppn: newSubtotal * 0.1,
        total: generateTotal(newSubtotal),
      },
      include: {
        orderDetails: {
          include: {
            service: true,
          },
        },
      },
    });

    return success(res, 'Order updated successfully', updatedOrder, 200);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return prismaError(error, error.meta?.cause, res);
    }
    return error(res, 'Internal server error', error.message, 500);
  }
}

async function updateNewItem(req, res) {
  try {
    const { id } = req.params;
    const oldOrder = await prisma.order.findUnique({
      where: {
        id,
      },
      select: {
        subtotal: true,
      },
    });
    const subtotal = await generateSubtotal(req.body.items);
    const newSubtotal = oldOrder.subtotal + subtotal;
    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        subtotal: newSubtotal,
        ppn: newSubtotal * 0.1,
        total: generateTotal(newSubtotal),
        orderDetails: {
          createMany: {
            data: await Promise.all(
              req.body.items.map(async (item) => ({
                serviceId: parseInt(item.serviceId, 10),
                price: await generateItemPrice(item.serviceId, item.qty),
                qty: parseInt(item.qty, 10),
              })),
            ),
          },
        },
      },
      include: {
        orderDetails: {
          include: {
            service: true,
          },
        },
      },
    });

    return success(res, 'New item added successfully', order, 201);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return prismaError(error, error.meta?.cause, res);
    }
    return error(res, 'Internal server error', error.message, 500);
  }
}

/**
 *
 * @param {import ('express').Request} req
 * @param {import ('express').Response} res
 */
async function remove(req, res) {
  try {
    const { id } = req.params;
    await prisma.orderDetail.deleteMany({
      where: {
        orderId: id,
      },
    });

    await prisma.order.delete({
      where: {
        id,
      },
    });

    return success(res, 'Order deleted successfully', null, 200);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return prismaError(error, error.meta?.cause, res);
    }
    return error(res, 'Internal server error', error.message, 500);
  }
}

module.exports = {
  get,
  create,
  updateQty,
  updateNewItem,
  remove,
  findOne,
};
