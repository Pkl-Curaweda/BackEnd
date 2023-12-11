const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, countNight } = require("../../utils/helper")

//?This one is only the invoice is by the room/ per resvRoom
const GetInvoiceByResvRoomId = async (reservationId, resvRoomId) => {
    try{
        const invoices = {};
        let { arrivalDate, departureDate } = await prisma.reservation.findFirstOrThrow({where: {id: reservationId }, select: { arrivalDate: true, departureDate: true }})
        const manyDay = countNight(arrivalDate, departureDate)
        const searchedDate = new Date(arrivalDate.toISOString().split('T')[0])
        console.log(manyDay, searchedDate)
        let day = 0;
        do{
            const propertieName = searchedDate()
        }while(day <= searchedDate)
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect()
    }
}

module.exports = { GetInvoiceByResvRoomId }