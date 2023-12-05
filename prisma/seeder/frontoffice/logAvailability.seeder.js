const { prisma } = require("../config");

const logAvail = [
    {
        roomHistory: {
            room_1: {
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "roomPrice": 300000,

            }, 
            room_2: {
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "roomPrice": 300000,
            },
            room_3: 0, 
            room_4: 0, 
            room_5: {
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "roomPrice": 300000,
            },
            room_6: {
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "roomPrice": 300000,
            },
            room_7: {
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "roomPrice": 300000,
            },
            room_8: {
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "roomPrice": 300000,
            },
            room_9: {
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "roomPrice": 300000,
            },
            room_10: {
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "roomPrice": 300000,
            },
        },
        created_at: new Date(),
        updated_at: new Date(),
    }
]

async function LogAvailability() {
    for (let log of logAvail) {
        await prisma.logAvailability.create({
            data: log
        });
    }
}

module.exports = { LogAvailability }