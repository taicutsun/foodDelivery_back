const jwt = require("jsonwebtoken");

//for tokens
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token === undefined) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCSESS_TOKEN_SECRET, (err) => {
        if (err){console.log(err); return res.sendStatus(403);}
        //req.user = loginuser;
        next();
    });
}

function generateAccessToken(user) {
    return jwt.sign(
        { username: user.username },
        process.env.ACCSESS_TOKEN_SECRET,
        { expiresIn: "15s" }
    );
}
//for tokens

module.exports = {
    authenticateToken,
    generateAccessToken
}
