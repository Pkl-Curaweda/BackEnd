const { ThrowError } = require("../../../../src/utils/helper")
const { prisma } = require("../../config")

const defaultTracks = [
    {
        label: ['Order Proccessed', 'Order is being packaged', 'Order is being delivered', 'Order received', 'Done'],
        finishOn: ['', '', '', '', '']
    },
    {
        label: ['Order Proccessed', 'Order is almost ready', 'Order is being packaged', 'Order is being delivered', 'Order received', 'Done'],
        finishOn: ['', '', '', '', '', '']
    },
    {
        label: ['Order Taken', 'Was washed', 'Order proccessed', 'Order received', 'Done'],
        finishOn: ['', '', '', '', '']
    }
]

async function orderTrackSeed() {
    try {
        for (let orderTrack of defaultTracks) {
            await prisma.orderTrack.create({
                data: { trackToDo: orderTrack }
            })
        }
    } catch (err) {
        ThrowError(err)
    }
}

module.exports = { orderTrackSeed }