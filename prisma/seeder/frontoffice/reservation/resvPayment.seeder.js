const { prisma } = require("../../config");

const resvPayments = {
    resvRoomId: 1,
    paymentMethod: "BANK-BRI",
    orders: {
        details: [
            {
                "art": 998,
                "uniqueId": 1,
                "qty": 1,
                "desc": "Room",
                "rate": 500000,
                "amount": 500000,
                "billDate": "2023-12-17"
            }]
    },
    total: 4900000,
    created_at: new Date(),
    updated_at: new Date(),
};

async function ResvPaymentSeed(resvRoomId) {
    resvPayments.resvRoomId = resvRoomId
    await prisma.resvPayment.create({
        data: resvPayments
    });
}

module.exports = { ResvPaymentSeed };
