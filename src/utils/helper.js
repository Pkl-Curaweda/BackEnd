const { randomInt } = require("crypto");
const { prisma } = require("../../prisma/seeder/config");

const PrismaDisconnect = async () => {
    await prisma.$disconnect();
}

const ThrowError = (err) => {
    console.log(err)
    throw err
}

function generateDateBetweenNowBasedOnDays(pastFuture, manyDays) {
    const dateArray = [];
    const currentDate = new Date();

    for (let i = 0; i <= manyDays; i++) {
        const listDate = new Date(currentDate);
        if (pastFuture === "past") {
            listDate.setDate(currentDate.getDate() - i);
        } else {
            listDate.setDate(currentDate.getDate() + i);
        }
        dateArray.push(listDate.toISOString().split('T')[0]);
    }
    return dateArray;
}


function generateDateBetweenStartAndEnd(startDate, endDate) {
    const dateArray = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
        dateArray.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
}

function generateExpire(currentDate) {
    var expiredDate = new Date(currentDate);
    expiredDate.setDate(currentDate.getDate() + 3); //3 days from now
    return expiredDate;
};

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

function generateStringRandomizer(inputString) {
    const characters = inputString.split('');
    for (let i = characters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [characters[i], characters[j]] = [characters[j], characters[i]];
    }
    return characters.join('');
}

function countNight(arrivalDate, departureDate) {
    const arrivalDateObj = new Date(arrivalDate);
    const departureDateObj = new Date(departureDate);

    const timeDifference = departureDateObj.getTime() - arrivalDateObj.getTime();
    const night = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return night;

}

const generateVoucherNo = async () => {
    let uniqueVoucherNo, existingResvRoom;
    do {
        uniqueVoucherNo = randomInt(1000)
        existingResvRoom = await prisma.resvRoom.findFirst({
            where: {
                voucherNo: uniqueVoucherNo
            }
        });
    } while (existingResvRoom);
    return uniqueVoucherNo;
};

const GenerateUsernameAndPassword = async (guestName) => {
    try {
        let username, usernameExist;
        guestName = guestName.split(' ')[0];
        do {
            username = generateStringRandomizer(guestName)
            usernameExist = await prisma.guest.findUnique({ where: { username } })
        } while (usernameExist)
        const password = generateRandomString(8);
        return { username, password }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect();
    }
}


const paginate = async (model, options, args = { where: undefined }) => {
    let { page = 1, perPage = 5 } = options;
    model = model
    try {
        const skip = (page - 1) * perPage;
        const [data, total] = await Promise.all([
            model.findMany({
                ...args,
                skip,
                take: perPage
            }),
            model.count({
                where: args.where
            })
        ])
        const lastPage = Math.ceil(total / perPage);

        return {
            [options.name]: data,
            meta: {
                total,
                currPage: page,
                lastPage,
                perPage,
                prev: page > 1 ? page - 1 : null,
                next: page < lastPage ? page + 1 : null,
            }
        }
    } catch (err) {
        ThrowError(err)
    } finally {
        await PrismaDisconnect()
    }
}

module.exports = {
    PrismaDisconnect, generateExpire, generateDateBetweenNowBasedOnDays, generateDateBetweenStartAndEnd, generateRandomString, generateStringRandomizer, countNight, ThrowError, paginate, generateVoucherNo, GenerateUsernameAndPassword
};