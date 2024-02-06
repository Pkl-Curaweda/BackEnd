const { prisma } = require("../../config");

const vouchers = [
    {
        id: process.env.COMP_VOUCHER,
        abilites: "100% diskon to arrangment",
        arithmatic: "* 1000 / 100"
    }
];
async function VoucherSeed() {
    for (let voucher of vouchers) {
        await prisma.voucher.upsert({
            where: { id: voucher.id },
            update: voucher,
            create: voucher
        })
    }
}

module.exports = { VoucherSeed };
