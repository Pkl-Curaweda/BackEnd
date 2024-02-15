const { prisma } = require("../config")

const Stocks =[
    {
        //Extra Bed
       articleTypeId: 110,
       remain: 10,
       rStock: 10,
    },
    {
        //Extra Pillow
       articleTypeId: 109,
       remain: 15,
       rStock: 15,
    },
    {
        //Extra Blanket
       articleTypeId: 108,
       remain: 15,
       rStock: 15,
    },
]

async function StockSeed(){
    for(let stock of Stocks){
        await prisma.stock.upsert({
            where: { articleTypeId:  stock.articleTypeId},
            update: { ...stock },
            create: { ...stock }
        })
    }
}

module.exports = { StockSeed }