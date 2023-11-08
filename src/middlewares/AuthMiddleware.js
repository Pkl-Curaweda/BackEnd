const jwt = require("jsonwebtoken");


const requireAuth = (req, res, next) => {
    const token = req.cookies.curtoken;

    //check jsob web token exist or not
    if(!token) res.status(404).json({
        error : "You have no token"
    });

    jwt.verify(token, process.env.SECRET_CODE, (err, decodedToken) => {
        if(err) {
            console.log(err.message);
            res.status(404).json({
                error: err.message
            });
        }
        console.log(decodedToken);
        next();
    })
    next();
}



module.exports = { requireAuth };
