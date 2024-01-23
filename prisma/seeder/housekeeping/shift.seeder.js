const { prisma } = require("../config")

const Shifts = [
    {
        description: "Shift 1",
        startTime: "06:00",
        endTime: "16:00",
        restTimeStart: "11:00",
        restTimeEnd: "12:00",
        workTime: 600,
        UoM: "Minute",
    },
    {
        description: "Shift 2",
        startTime: "10:00",
        endTime: "20:00",
        restTimeStart: "15:00",
        restTimeEnd: "16:00",
        workTime: 600,
        UoM: "Minute",
    },
    {
        description: "Shift 3",
        startTime: "13:00",
        endTime: "23:00",
        restTimeStart: "18:00",
        restTimeEnd: "19:00",
        workTime: 600,
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