const { prisma } = require("../config");

const logAvail = [
    {
        roomHistory: {
            room_1: {
                "guestName": "Septian Nugroho",
                "resvStatus": {
                    "rowColor": "#16a75c",
                    "textColor": "#ffffff"
                },
                
            },
            room_2: {
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                }
            },
            room_3: 0,
            room_4: 0,
            room_5: {
                "guestName": "Kedick",
                "resvStatus": {
                    rowColor: "#16a75c",
                    textColor: "#ffffff"
                }
            },
            room_6: {
                "guestName": "Legs Io",
                "resvStatus": {
                    rowColor: "#16a75c",
                    textColor: "#ffffff"
                }
            },
            room_7: {
                "guestName": "Refi Hikman",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                }
            },
            room_8: {
                "guestName": "Barack Obama",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                }
            },
            room_9: {
                "guestName": "HardBreed",
                "resvStatus": {
                    rowColor: "#16a75c",
                    textColor: "#ffffff"
                }
            },
            room_10: {
                "guestName": "Gustavo Fring",
                "resvStatus": {
                    rowColor: "#fe0001",
                    textColor: "#ffffff"
                }
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