const { ThrowError } = require("../../../../src/utils/helper")
const { prisma } = require("../../config")

const roomTypes = [
    {
        id: "REMOVED",
        longDesc: "REMOVED",
        bedSetup: "UNKNOWN"
    },
    {
        id: "DLX",
        longDesc: "DELUXE",
        bedSetup: "KING"
    },
    {
        id: "FML",
        longDesc: "FAMILY",
        bedSetup: "TWIN"
    },
    {
        id: "STD",
        longDesc: "STANDARD",
        bedSetup: "SINGLE"
    }
]

const roomTypeSeed = async () => {
    try {
        for (let roomType of roomTypes) {
            await prisma.roomType.upsert({
                where: { id: roomType.id },
                update: roomType,
                create: roomType
            })
        }
    } catch (err) {
        ThrowError(err)
    }
}

module.exports = { roomTypeSeed }