const { prisma } = require("../config")

const notification = [
    { content: "Andi found a phone" },
    { content: "Room 104 has been declared" }
]

const NotificationSeed = async () => {
    for(let notif of notification){
        await prisma.notification.create({
            data: notif
        })
    }

}

module.exports = { NotificationSeed }