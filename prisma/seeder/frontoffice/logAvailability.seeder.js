const { prisma } = require("../config");

const logAvail = [
    {
        roomHistory: {
            room_1: {
                "reservationId": 1,
                "resvRoomId": 1,
                "guestName": "Akeem",
                "resvStatus": {
                    "rowColor": "#16a75c",
                    "textColor": "#ffffffD"
                },
                "room": {
                    "id": 1,
                    "roomType": "STANDARD",
                    "bedSetup": "KING"
                },
                "occupied": 1,
                "roomPrice": 530000
            },
            room_2: {
                "reservationId": 1,
                "resvRoomId": 2,
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "room": {
                    "id": 2,
                    "roomType": "DELUXE",
                    "bedSetup": "KING"
                },
                "occupied": 1,
                "roomPrice": 300000,
            },
            room_3: {
                "room": {
                    "id": 3,
                    "roomType": "DELUXE",
                    "bedSetup": "KING"
                },
                "occupied": 0
            },
            room_4: {
                "room": {
                    "id": 4,
                    "roomType": "DELUXE",
                    "bedSetup": "KING"
                },
                "occupied": 0
            },
            room_5: {
                "reservationId": 2,
                "resvRoomId": 4,
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "room": {
                    "id": 5,
                    "roomType": "FAMILY",
                    "bedSetup": "TWIN"
                },
                "occupied": 1,
                "roomPrice": 300000
            },
            room_6: {
                "reservationId": 2,
                "resvRoomId": 3,
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "room": {
                    "id": 6,
                    "roomType": "FAMILY",
                    "bedSetup": "TWIN"
                },
                "occupied": 1,
                "roomPrice": 300000,
            },
            room_7: {
                "reservationId": 1,
                "resvRoomId": 5,
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "room": {
                    "id": 7,
                    "roomType": "FAMILY",
                    "bedSetup": "TWIN"
                },
                "occupied": 1,
                "roomPrice": 300000,
            },
            room_8: {
                "reservationId": 3,
                "resvRoomId": 6,
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "room": {
                    "id": 8,
                    "roomType": "STANDARD",
                    "bedSetup": "SINGLE"
                },
                "occupied": 1,
                "roomPrice": 300000,
            },
            room_9: {
                "reservationId": 3,
                "resvRoomId": 7,
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "room": {
                    "id": 9,
                    "roomType": "STANDARD",
                    "bedSetup": "SINGLE"
                },
                "occupied": 1,
                "roomPrice": 300000,
            },
            room_10: {
                "reservationId": 3,
                "resvRoomId": 8,
                "guestName": "Kenbrid",
                "resvStatus": {
                    rowColor: "#fffc06",
                    textColor: "#000000",
                },
                "room": {
                    "id": 10,
                    "roomType": "STANDARD",
                    "bedSetup": "SINGLE"
                },
                "occupied": 1,
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