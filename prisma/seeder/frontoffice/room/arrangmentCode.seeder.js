const { prisma } = require("../../config");

const arrangmentCodes = [
    {
        id: "DLX-RB",
        rate: 530000,
        matchTypeId: "DLX"
    },
    {
        id: "DLX-RO",
        rate: 500000,
        matchTypeId: "DLX"
        
    },
    {
        id: "STD-RB",
        rate: 330000,
        matchTypeId: "STD"
    },
    {
        id: "STD-RO",
        rate: 300000,
        matchTypeId: "STD"
    },
    //?Still need to be changed, because family price is not mention in any of the frame
    {
        id: "FML-RB",
        rate: 530000,
        matchTypeId: "FML"
    },
    {
        id: "FML-RO",
        rate: 530000,
        matchTypeId: "FML"
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
