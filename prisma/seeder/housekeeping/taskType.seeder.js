const { prisma } = require("../config");

const taskTypes = [
    {
        activity: "Pembersihan Total",
        standardTime: 190,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    },
    {
        activity: "Perbaikan Ringan",
        standardTime: 40,
        UoM: "minute",
        department: {
            connect: { id: 2 }
        }
    },
    {
        activity: "Perbaikan Sedang",
        standardTime: 200,
        UoM: "minute",
        department: {
            connect: { id: 2 }
        }
    },
    {
        activity: "Perbaikan Berat",
        standardTime: 420,
        UoM: "minute",
        department: {
            connect: { id: 2 }
        }
    },
];

async function taskTypeSeed() {
    for (let taskType of taskTypes) {
        await prisma.taskType.create({
            data: taskType
        });
    }
}

module.exports = { taskTypeSeed };
