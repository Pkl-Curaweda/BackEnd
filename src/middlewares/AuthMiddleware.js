const jwt = require("jsonwebtoken");


const requireAuth = (req, res, next) => {
    const token = req.cookies.curtoken;
    //check jsob web token exist or not
    console.log(token);
    if(!token) res.status(404).json({err: "you have no cookie"})
    // jwt.verify(token, process.env.SECRET_CODE, (err, decodedToken) => {
    //     if(err) {
    //         console.log(err.message);
    //         res.status(404).json({
    //             error: err.message
    //         })
    //     }
    //     console.log(decodedToken);
    //     next();
    // })
}

module.exports = { requireAuth };
