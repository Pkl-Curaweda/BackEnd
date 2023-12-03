const { prisma } = require("../../config");

const arrangmentCodes = [
    {
        id: "DLX-RB",
        rate: 530000
    },
    {
        id: "DLX-RO",
        rate: 500000
    },
    {
        id: "STD-RB",
        rate: 330000
    },
    {
        id: "STD-RO",
        rate: 300000
    },
    //?Still need to be changed, because family price is not mention in any of the frame
    {
        id: "FML-RB",
        rate: 530000 
    },
    {
        id: "FML-RO",
        rate: 530000
    }
];

async function arrangmentCodeSeed() {
    for (let arrangmentCode of arrangmentCodes) {
        await prisma.arrangmentCode.upsert({
            where: { id: arrangmentCode.id },
            update: { ...arrangmentCode },
            create: { ...arrangmentCode },
        });
    }
}

module.exports = { arrangmentCodeSeed };
