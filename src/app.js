const express = require("express")
const cookieParser = require("cookie-parser") 
const authRouter = require("../src/routes/auth.routes")
const expenseRouter = require("../src/routes/expense.routes")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.set("trust proxy", 1);

app.get("/status",(req,res)=>{
    res.status(201).json({
        message: "status ok"
    })
})

app.use("/users/auth",authRouter)
app.use("/api/expenses",expenseRouter)

app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong";

    // Mongoose: invalid ObjectId format (e.g. /expenses/ABC)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Mongoose: duplicate key (e.g. duplicate email)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }

    // Mongoose: schema validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(", ");
    }

    res.status(statusCode).json({
        status: "error",
        message
    });
});

module.exports = app