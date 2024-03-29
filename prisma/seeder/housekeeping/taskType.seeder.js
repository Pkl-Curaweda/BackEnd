const { prisma } = require("../config");

const taskTypes = [
    {
        id: "FCLN-STD",
        activity: "Full Clean Standard Room",
        standardTime: 30,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    },
    {
        id: "FCLN-DLX",
        activity: "Full Clean Deluxe Room",
        standardTime: 40,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    },
    {
        id: "FCLN-FML",
        activity: "Full Clean Family Room",
        standardTime: 45,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    },
    {
        id: "CLN",
        activity: "Regular Cleaning",
        standardTime: 15,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    },
    {
        id: "GREQ",
        activity: "Guest Request",
        standardTime: 0,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    },
    {
        id: "SPVTASK",
        activity: "Supervisor Task",
        standardTime: 0,
        UoM: "minute",
        department: {
            connect: { id: 1 }
        }
    }
];

async function taskTypeSeed() {
    for (let taskType of taskTypes) {
        await prisma.taskType.upsert({
            where: { id: taskType.id },
            update: { ...taskType },
            create: { ...taskType }
        });
    }
}

module.exports = { taskTypeSeed };
