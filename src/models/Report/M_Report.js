const { prisma } = require("../../../prisma/seeder/config");
const { ThrowError, PrismaDisconnect, countNight } = require("../../utils/helper");



//? REPORT
const findReportReservation = async () => {
    const report = await prisma.logAvailability.findMany({
      select:{
        id:true,
        roomHistory: true,
        created_at: true,
        updated_at: true,
      }
    });
  
    report.map(value => {
      value.roomAvailable = 0
      value.occupied = 0
      value.roomRevenue = 0
      value.totalRoom = 0

    for (const history in value.roomHistory) {
        if (value.roomHistory[history] !== 0) {
            value.roomAvailable++;
          if (value.roomHistory[history].roomPrice) {
            value.roomRevenue += value.roomHistory[history].roomPrice;
          }
        } else {
          value.occupied++;
        }
        value.totalRoom++
      }
      value.occ = value.occupied / value.totalRoom * 100; // 10 ubah agar dinamis
      value.arr = value.roomRevenue / value.occupied;

      //value.totalAvailableSatuBulan (date, room avail)


  
      return value
    });
  
    return report;
};


const getReportData = async () => {
    let month = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const toMonth = currentMonth - 3;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    for(let i = currentMonth; i > toMonth; i--){
        let perDay = [];
        const formattedMonth = i.toString().padStart(2, '0');
        const monthName = monthNames[i - 1];
        for(let date = 1; date < 31; date++){
            const formattedDate = date.toString().padStart(2, '0');
            const logAvailability = await prisma.logAvailability.findFirst({
                where:{
                    created_at:{
                        gte: `${currentYear}-${formattedMonth}-${formattedDate}T00:00:00.000Z`,
                        lte: `${currentYear}-${formattedMonth}-${formattedDate}T23:59:59.999Z`
                    }
                },
                select: {
                    roomHistory:true,
                }
            })
            
            let roomAvailable = 0, occupied = 0, occ = 0, roomRevenue = 0, arr = 0, totalRoom = 0;
            
            if (logAvailability && logAvailability.roomHistory) {
                for (const history in logAvailability.roomHistory) {
                    if (logAvailability.roomHistory[history] !== 0) {
                        roomAvailable++;
                        if (logAvailability.roomHistory[history].roomPrice) {
                            roomRevenue += logAvailability.roomHistory[history].roomPrice;
                        }
                    } else {
                        occupied++;
                    }
                    totalRoom++;
                }
            }

              occ = occupied / totalRoom * 100;
              arr = roomRevenue / occupied;

              const storedData = {
                  date: `${currentYear}-${formattedMonth}-${formattedDate}`,
                  roomAvailable,
                  occupied,
                  occ,
                  roomRevenue,
                  arr,
              }
  
              perDay.push(storedData);

        }

        const storedMonth = {
            monthName,
            perDay
        };

        month.push(storedMonth);
    }
    
    return month;
}


  module.exports = {
    findReportReservation,
    getReportData,
  }