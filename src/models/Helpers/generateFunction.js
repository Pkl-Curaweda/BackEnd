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

module.exports = { generateExpire, generateRandomString, generateStringRandomizer, countNight }