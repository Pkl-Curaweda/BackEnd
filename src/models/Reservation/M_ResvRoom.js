const { reservationClient } = require("../Helpers/Config/Front Office/ReservationConfig");
const { ResvRoomClient } = require("../Helpers/Config/Front Office/ResvRoomConfig");
const { PrismaDisconnect } = require("../Helpers/DisconnectPrisma");
const { ThrowError } = require("../Helpers/ThrowError");

function getTotalPrice(orders) {
    const flattenedOrders = orders.flatMap(order => order.orderDetails);
    const totalPrice = flattenedOrders.reduce((acc, curr) => {
        const servicePrice = curr.service ? curr.service.price : 0;
        return acc + curr.qty * servicePrice;
    }, 0);
    return totalPrice;
}

function getDatesBetween(startDate, endDate){
    const dates = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1; // Months are zero-based
        const year = currentDate.getFullYear();

        const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
        dates.push(formattedDate);

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

const getAllOrderFromReservationId = async (reservationId, filter) => {
    try{
        const reservation = await reservationClient.findFirst({
            where: {
                id: parseInt(reservationId)
            },
            select: {
                arrivalDate: true,
                departureDate: true,
                reserver: true
            }
        })

        console.log(reservationId, filter);
        const orders = await getAllOrderBasedOnFilter(filter, reservation);
        return orders;
    }catch(err){
        ThrowError(err);
    }finally{
        await PrismaDisconnect();
    }
}

const getAllOrderBasedOnFilter = async (filterContext, reservationData) => {
    try{
        const guestId = reservationData.reserver.guestId;
        const orders = [];
        let searchedFilter;
        // if (filterContext != "day" || filterContext != "month" || filterContext != "year") return null;

        if (filterContext === "day") {
            searchedFilter = getDatesBetween(reservationData.arrivalDate, reservationData.departureDate);
        } else if (filterContext === "month") {
            searchedFilter = reservationData.arrivalDate.getMonth() + 1;
        } else if (filterContext === "year") {
            searchedFilter = reservationData.arrivalDate.getFullYear();
        }

        const orderData = searchedFilter.map(async (filter) => {
            return await getAllOrderWithFilter(filterContext, guestId, searchedFilter);
        })

        const result = await Promise.all(orderData);
        orders.push(...result);

        console.log(orders);
        return orders;
    }catch(err){
        ThrowError(err);
    }finally{
        await PrismaDisconnect();
    }
}

const getAllOrderWithFilter = async (filter, guestId, searchedFilter) => {
    try{
        let orderData;
        let createdFilter;
        let currentYear;
        if (filter === "month") currentYear = new Date().getFullYear();
        switch (filter) {
            case 'year':
                createdFilter = {
                    lte: '${searchedFilter}-1-1T23:59:59.999Z',
                    gte: '${searchedFilter}-12-31T00:00:00.000Z'
                }
                break;
            case 'month':
                createdFilter = {
                    lte: '${currentYear}-${searchedFilter}-1T23:59:59.999Z',
                    gte: '${currentYear}-${searchedFilter}-31T00:00:00.000Z'
                }
                break;
            case 'date':
                createdFilter = {
                    lte: '${searchedFilter}T23:59:59.999Z',
                    gte: '${searchedFilter}T00:00:00.000Z'
                }
                break;
            default:
                console.log("Invalid filter type");
                return null;
        }

        let orders = await orderClient.findMany({
            where: {
                guestId,
                created_at: createdFilter
            },
            select: {
                orderDetails: {
                    select: {
                        qty: true,
                        service: {
                            select: {
                                name: true,
                                price: true
                            }
                        }
                    }
                }
            }
        })

        total = getTotalPrice(orders);

        orderData = {
            year: searchedYear,
            orders, total
        }

        console.log(orderData)

        return orderData;
    }catch(err){
        ThrowError(err);
    }finally{
        await PrismaDisconnect();
    }
}

const getAllRoomReservedById = async (reservationId) => {
    let reservedRoom = [];
    try{
        const rooms = await ResvRoomClient.findMany({where: { reservationId }});
        for(let room in rooms){
            reservedRoom.push(room);
        }
    }catch(err){
        ThrowError(err)
    }finally{
        await PrismaDisconnect();
    }
}

module.exports = {  getAllOrderFromReservationId, getAllRoomReservedById };