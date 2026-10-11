const mongoose = require("mongoose")

const expensesSchema = new mongoose.Schema({
    amount:{
        type:Number,
        required: [true,"Amount is required"]
    },
    category:{
        type:String,
        required: [true,"category is required"]
    },
    description:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    },
    userID:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: [true,"User ID is required"]
    },
},{timestamps:true})

const expenseModel = mongoose.model("Expense",expensesSchema)
module.exports = expenseModel