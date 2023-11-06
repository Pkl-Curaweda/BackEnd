const { prisma } = require("../../config");

const logResv = [
    {
        reservationId: 1,
        arrivalDate: new Date(),
        departureDate: new Date(),
        quantity: 4,
        manyAdult: 2,
        manyChild: 2,
        manyRoom: 1,
        reserverId: 1,
        roomId: 1,
        resvStatusId: 1,
        fixRate: true,
        argtCode: "A35G",
        rate: 300000,
        created_at: new Date(),
        updated_at: new Date(),
    }
]

async function LogReservation() {
    for(let log of logResv){
        await prisma.logReservation.create({
            data: log
        })
    }
}

module.exports =  { LogReservation };