const { af_ZA } = require("@faker-js/faker");
const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect } = require("../../utils/helper");

/**
 * @param { {serviceId:number, qty:number}[] } items
 */
const generateSubtotal = async (items) => {
    let subTotal = 0;

    const services = await prisma.service.findMany({
        where: {
            id: {
                in: items.map((item) => parseInt(item.serviceId, 10)),
            },
        },
    });

    for (const item of items) {
        const service = services.find((s) => s.id === parseInt(item.serviceId, 10));

        if (!service) {
            const err = new PrismaClientKnownRequestError('Service not found', {
                code: 'P2025',
                meta: {
                    target: ['service id'],
                },
            });
            throw err;
        }

        subTotal += service.price * parseInt(item.qty, 10);
    }

    return subTotal;
}


/**
 * @param {number} id
 * @param {number} qty
 */

const generateItemPrice = async (id, qty) => {
    const service = await prisma.service.findUnique({
        where: {
            id: parseInt(id, 10),
        },
    });
    if (!service)
        throw new PrismaClientKnownRequestError('Service not found', {
            code: 'P2025',
            meta: {
                target: ['id'],
            },
        });

    return service.price * parseInt(qty, 10);
}

const generateDefaultTrack = async (serviceId) => {
    try{
        const service = await prisma.service.findFirst({ where: { id: +serviceId }, select: { serviceType: { select: { orderTrack: { select: { trackToDo: true } } } } } })
        return service.serviceType.orderTrack.trackToDo
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { generateSubtotal, generateItemPrice, generateDefaultTrack }