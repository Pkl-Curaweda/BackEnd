const { prisma } = require("../../config");

const logAvail = [
    {
        room_1: true,
        room_2: true,
        room_3: true,
        room_4: true,
        room_5: false,
        room_6: false,
        room_7: true,
        room_8: false,
        room_9: false,
        room_10: true,
        availBeforeAllotment: 4,
        allotment: 6,
        availAfterAllotment: 6,
        totalOverbooking: 0,
        ooo: 2,
        tentative: 2,
        standardRoom: 5,
        familyRoom: 3,
        deluxeRoom: 2,
        occupiedRoom: 6,
        cleanedRoom: 5,
        dirtyRoom: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
]

async function LogAvailability() {
    for (let log of logAvail){
        await prisma.logAvailability.create({
            data: log
        });
    }
}

module.exports = { LogAvailability }