const { prisma } = require("../../config");

const resvPayments = [
    {
        reservationId: 1,
        paymentMethod: "BANK-BRI",
        orders: { details: [
            {
                description: "Room Rate",
                amount: 123000
            }]
        },
        total: 4900000,
        created_at: new Date(),
        updated_at: new Date(),
    },
];
async function ResvPaymentSeed() {
    for (let resvPayment of resvPayments) {
        await prisma.resvPayment.create({
            data: resvPayment
        });
    }
}

module.exports = { ResvPaymentSeed };
