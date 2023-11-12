const ThrowError = (err) => {
    console.log(err.message)
    throw err;
}

module.exports = { ThrowError };