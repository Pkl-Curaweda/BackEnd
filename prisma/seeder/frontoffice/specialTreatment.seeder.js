const { prisma } = require("../config");

const specialTreatments = [
    {
        description: "VIP",
        rowColor: "#ffffff",
        textColor: "#f10000",
    },
    {
        description: "INCOGNITO",
        rowColor: "#f10000",
        textColor: "#ffffff",
    },
];
async function specialTreatmentSeed() {
    for (let specialTreatment of specialTreatments) {
        const exist = await prisma.specialTreatment.findFirst({ where: { description: specialTreatment.description } })
        if(!exist) await prisma.specialTreatment.create({ data: specialTreatment })
    }
}

module.exports = { specialTreatmentSeed };
