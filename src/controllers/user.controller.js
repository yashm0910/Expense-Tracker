const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt")

// async function registerUser(req, res) {
//     try {
//       const { username, email, password } = req.body;
  
//       const exists = await userModel.findOne({ email });
//       if (exists) {
//         return res.status(409).json({ message: "User already exists" });
//       }
  
//       const user = await userModel.create({ username, email, password });

//     //   console.log("Secret in middleware:", process.env.JWT_SECRET);
//     //   console.log("Secret length:", process.env.JWT_SECRET?.length);

//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  
//       res.cookie("token", token);
//       res.status(201).json({ message: "User Registered Successfully" });
//     } catch (err) {
//       console.error("Register error:", err.message);
//       res.status(500).json({ message: err.message });
//     }
//   }

// async function findAllUsers(req, res) {
//     try {
//         const allUsers = await userModel.find().select("-password");

//         if (allUsers.length === 0) {
//         return res.status(404).json({ message: "no user found" });
//         }

//         res.status(200).json({
//         message: "users fetched successfully",
//         all_Users: allUsers
//         });
//     } catch (err) {
//         console.error("findAllUsers error:", err.message);
//         res.status(500).json({ message: err.message });
//     }
// }

// async function loginUser(req,res){
//     const {email,password} = req.body

//     const user = await userModel.findOne({email}).select("+password")

//     if (!user){
//         return res.status(404).json({message:"User not found"})
//     }
//     // console.log("=== LOGIN DEBUG ===");
//     // console.log("Submitted password:", JSON.stringify(password));
//     // console.log("DB password:       ", JSON.stringify(user.password));
//     // console.log("Submitted length:  ", password.length);
//     // console.log("DB length:         ", user.password.length);
//     // console.log("Types:", typeof password, typeof user.password);
//     // console.log("Match:", user.password === password);
//     // console.log("===================");

//     if (user.password!==password){
//         return res.status(401).json({message:"Invalid credentials"})
//     }

//     const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
//     res.cookie("token",token)
    
//     res.status(200).json({
//         message:"login successful",
//         user: {
//             _id: user._id,
//             username: user.username,
//             email: user.email
//         }
//     })
// }

// async function updateMe(req,res){
//     try{
//         const {username} = req.body

//         const user = await userModel.findByIdAndUpdate(
//             req.user._id,
//             {username},
//             {new:true}
//         ).select("-password")

//         if (!user){
//             return res.status(404).json({message:"User not found"})
//         }

//         res.status(200).json({
//             message:"Profile updated",
//             user:{
//                 _id:user._id,
//                 username:user.username,
//                 email:user.email
//             }
//         })
//     }catch(err){
//         res.status(500).json({
//             message:err.message
//         })
//     }
// }

const registerUser = catchAsync(async (req, res, next) => {
    const { username, email, password } = req.body;

    // No pre-check needed — the unique index on email throws 11000
    // which the error handler converts to 409 "email already exists"
    const user = await userModel.create({ username, email, password });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    });

    res.status(201).json({ message: "User Registered Successfully" });
});

// const findAllUsers = catchAsync(async (req, res, next) => {
//     const allUsers = await userModel.find().select("-password");

//     // Empty list is not an error — return 200 with empty array
//     res.status(200).json({
//         message: "users fetched successfully",
//         count: allUsers.length,
//         all_Users: allUsers
//     });
// });

const findAllUsers = catchAsync(async(req,res,next) =>{
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        userModel.find().select("-password").skip(skip).limit(limit),
        userModel.countDocuments()
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        all_Users: users
    });
})



const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    });

    res.status(200).json({
        message: "login successful",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email
        }
    });
});

const updateMe = catchAsync(async (req, res, next) => {
    const { username } = req.body;

    const user = await userModel
        .findByIdAndUpdate(req.user._id, { username }, { new: true })
        .select("-password");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    res.status(200).json({
        message: "Profile updated",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email
        }
    });
});


module.exports = {registerUser,findAllUsers,loginUser,updateMe}