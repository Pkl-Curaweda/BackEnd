const { prisma } = require("../../config")

const art = [
    
    {
        id: 108,
        description: "Extra Blanket",
        price: 0.00
    },
    {
        id: 109,
        description: "Extra Pillow",
        price: 0.00
    },
    {
        id: 110,
        description: "Extra Bed",
        price: 0.00
    },
    {
        id: 112,
        description: "Additional Room",
        price: 0.00
    },
    {
        id: 113,
        description: "Early C/I",
        price: 0.00
    },
    {
        id: 114,
        description: "Late C/O",
        price: 0.00
    },
    {
        id: 115,
        description: "Cancelation Fee",
        price: 0.00
    },
    {
        id: 116,
        description: "No Show Fee",
        price: 0.00
    },
    {
        id: 120,
        description: "Phone Local Cell",
        price: 0.00
    },
    {
        id: 121,
        description: "Phone SLJJ",
        price: 0.00
    },
    {
        id: 122,
        description: "Phome IDD",
        price: 0.00
    },
    {
        id: 131,
        description: "BC Printing & Photocopy",
        price: 0.00
    },
    {
        id: 134,
        description: "BC Facsimile",
        price: 0.00
    },
    {
        id: 139,
        description: "BC Miscellaneous",
        price: 0.00
    },
    {
        id: 140,
        description: "Transportation",
        price: 0.00
    },
    {
        id: 180,
        description: "Loss & Breakage",
        price: 0.00
    },
    {
        id: 181,
        description: "Surcharge Paid Out",
        price: 0.00
    },
    {
        id: 182,
        description: "Loss Keycard",
        price: 0.00
    },
    {
        id: 183,
        description: "Drugstore Pool",
        price: 0.00
    },
    {
        id: 185,
        description: "Bubba Card Revenue",
        price: 0.00
    },
    {
        id: 188,
        description: "Service AC",
        price: 0.00
    },
    {
        id: 998,
        description: "Room Price",
        price: 0.00
    }
]

async function articleTypeSeed() {
    for(artType of art){
        await prisma.articleType.upsert({
            where: { id: artType.id },
            update: { ...artType },
            create: { ...artType }
        })
    }
}

module.exports = { articleTypeSeed }