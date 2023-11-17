const { reservationClient } =  require("../Helpers/Config/Front Office/ReservationConfig");

const getAllCheckIn = async () => {
    const checkin = await reservationClient.findMany({
        where: {
            finishedReservation: false,
        },
        select: {
            reserverId: true,
            reserver: {
                select:{
                    groupName: true,
                    guest_id: {
                        select: {
                            name: true,
                        }
                    }
                }
            },
            resvRooms:{
                select: {
                    roomId: true,
                }
            },
            
            currency: true,
            code: true,
            arrivalDate: true,
        }
    })
    return checkin;
}

const getChekInById = async (reservationId) => {
    try {
        let data;
        const checkin = await reservationClient.findFirst({
            where: {
                id: reservationId,
                finishedReservation: false,
            },
            select: {
                reserver: {
                    select:{
                        groupName: true,
                        guest_id:{
                            select: {
                                name: true,
                            }
                        },
                        kCard: true,
                    }
                },
                reserverId: true,
                
                resvQty: {
                    select: {
                        manyRoom: true,
                    }
                },
                resvRooms:{
                    select:{
                        room: {
                            select:{
                                id:true,
                                roomType: true,
                                bedSetup: true,
                                roomCapacity:{
                                    select:{
                                        adultCapacity: true,
                                        childCapacity: true,
                                        manyRoom: true,
                                    }
                                }
                            }
                        }
                    }
                },
    
                arrivalDate: true,
                departureDate: true,
                night: true,
    
                resvStatus: {
                    select:{
                        desc: true,
                    }
                },
    
                resvFlights: {
                    select: {
                        arrivalFlight: true,
                        departureFlight: true,
                    }
                },
    
                //DepTime
    
                departureDate: true,
    
                argtCode: true,
    
                currency: true,
            }
        });

        console.log(checkin);

        const depDate = devideDateAndTime(checkin.departureDate);

        if (!checkin) {
            return null;
        }

        data = {
            checkin,
            depDate
        }
    
        return data;

    } catch (error) {
        console.log("Error : ", error);
        throw error;
    }
}; 

const devideDateAndTime = (datetime) => {
    let generetedDatetime;
    const date = datetime.getFullYear()+"/"+datetime.getMonth() + 1 + "/" + datetime.getDate();
    const time = datetime.getHours()+ ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
    generetedDatetime = {
        date,
        time,
    }
    return  generetedDatetime;
}

module.exports = { getAllCheckIn, getChekInById};