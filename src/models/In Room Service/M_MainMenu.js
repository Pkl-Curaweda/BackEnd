const { prisma } = require("../../../prisma/seeder/config")
const { ThrowError, PrismaDisconnect, convertAmPm } = require("../../utils/helper")

const mainMenuIRSData = async (userData) => {
    let listOfMenu = [], { name } = userData.role
    try {
        const currentHour = new Date().getHours()
        const serviceType = await prisma.serviceType.findMany({
            where: {
                ...(name === "Mitra" && { accessibleToMitra: true }),
                AND: [
                    { closeHour: { gte: currentHour } },
                    { openHour: { lte: currentHour } }

                ]
            }, select: { name: true, openHour: true, closeHour: true, path: true, picture: true }
        })
        console.log(name)
        if (name != "Admin" && name != "Mitra") name = "user"
        for (let service of serviceType) {
            listOfMenu.push({
                name: service.name,
                schedule: `${convertAmPm(service.openHour)} - ${convertAmPm(service.closeHour)}`,
                picture: service.picture,
                path: `${service.path}/${name.toLowerCase()}`
            })
        }
        return listOfMenu
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = { mainMenuIRSData }