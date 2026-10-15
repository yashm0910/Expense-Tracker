const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
// console.log("Secret in middleware:", process.env.JWT_SECRET);
// console.log("Secret length:", process.env.JWT_SECRET?.length);

function authFast(req, res, next) {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ message: "not logged in" })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { _id: new mongoose.Types.ObjectId(decoded.id) }
        next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired credentials" })
    }
}

async function authMiddleware(req,res,next){
    // console.log("Cookies received:", req.cookies);
    // console.log("Token:", req.cookies?.token ? "PRESENT" : "MISSING");
    try {
        const token = req.cookies.token

        if (!token){
            return res.status(401).json({
                message:"not logged in"
            })
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id)

        if (!user){
            return res.status(404).json({
                message:"User not found"
            })
        }
        req.user = user
        next()
    }
    catch(err){
        // console.log("=== AUTH MIDDLEWARE ERROR ===");
        // console.log("Error name:", err.name);
        // console.log("Error message:", err.message);
        // console.log("Full error:", err);
        // console.log("=============================");
        return res.status(401).json({ message: "Invalid or expired credentials" });
    }
}

module.exports = authMiddleware
module.exports.authFast = authFast