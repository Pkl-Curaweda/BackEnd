const { ThrowError } = require("../../../../src/utils/helper")
const { prisma } = require("../../config")

const defaultTracks = [
    {
        1: {
            label: "Order Processed",
            finishOn: "",
        },
        2: {
            label: "Order is being packaged",
            finishOn: "",
        },
        3: {
            label: "Order is being delivered",
            finishOn: "",
        },
        4: {
            label: "Order received",
            finishOn: "",
        },
    },
    {
        1: {
            label: "Order Processed",
            finishOn: "",
        },
        2: {
            label: "Order is almost ready",
            finishOn: "",
        },
        3: {
            label: "Order is being packaged",
            finishOn: "",
        },
        4: {
            label: "Order is being delivered",
            finishOn: "",
        },
        5: {
            label: "Order received",
            finishOn: "",
        },
    },
    {
        1: {
            label: "Order Taken",
            finishOn: "",
        },
        2: {
            label: "Was washed",
            finishOn: "",
        },
        3: {
            label: "Order Proccessed",
            finishOn: "",
        }
    },
]

async function orderTrackSeed() {
    try{
        for(let orderTrack of defaultTracks){
            await prisma.orderTrack.create({
                data: { trackToDo: orderTrack }
            })
        }
    }catch(err){
        ThrowError(err)
    }
}

module.exports = { orderTrackSeed }