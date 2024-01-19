const { prisma } = require("../config");

const taskTypes = [
    {
        activity: "Full Clean Standard Room",
        standardTime: 30,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    },
    {
        activity: "Full Clean Deluxe Room",
        standardTime: 40,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    },
    {
        activity: "Full Clean Family Room",
        standardTime: 45,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    },
    {
        activity: "Regular Cleaning",
        standardTime: 15,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    },
    {
        activity: "Guest Request",
        standardTime: 0,
        UoM: "minute",
        department: {
            connect: { id: 1 }
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
