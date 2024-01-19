const { prisma } = require("../config")

const Shifts = [
    {
        description: "Shift 1",
        startTime: "06:00",
        endTime: "16:00",
        workTime: 600,
        UoM: "Minute",
    },
    {
        description: "Shift 2",
        startTime: "09:00",
        endTime: "19:00",
        workTime: 600,
        UoM: "Minute",
    },
    {
        description: "Shift 3",
        startTime: "14:00",
        endTime: "23:00",
        workTime: 540,
        UoM: "Minute",
    },
]

async function ShiftSeed(){
    for(shift of Shifts){
        await prisma.shift.upsert({ 
            where: { description: shift.description },
            update: { ...shift },
            create: { ...shift }
        })
    }
}

module.exports = { ShiftSeed }