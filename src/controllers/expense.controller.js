const expenseModel = require("../models/expenses.model")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/AppError")

// async function createExpense(req,res){
//     try{
//         const expense = await expenseModel.create({
//             ...req.body,
//             userID: req.user._id
//         })
//         res.status(201).json({message: "expense created",expense})
//     }catch(err){
//         res.status(500).json({message: err.message})
//     }
// }
const createExpense = catchAsync(async (req, res, next) => {
    const expense = await expenseModel.create({
        ...req.body,
        userID: req.user._id
    });
    res.status(201).json({ message: "Expense created", expense });
});

// async function getMyExpense(req,res){
//     try{
//         const expenses = await expenseModel.find({
//             userID: req.user._id
//         })
//         if (!expenses){
//             return res.status(404).json({message:"Expense not found"})
//         }
//         res.status(200).json({expenses})    
//     }catch(err){
//         res.status(500).json(err.message)
//     }
// }
const getMyExpense = catchAsync(async (req, res, next) => {
    // 1. Parse query params with safe defaults
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    // 2. Calculate how many to skip
    const skip = (page - 1) * limit;

    const filter = { userID: req.user._id };

    // Filter by category (exact match)
    if (req.query.category) {
        filter.category = req.query.category;
    }

    // Filter by date range
    if (req.query.from || req.query.to) {
        filter.date = {};
        if (req.query.from) filter.date.$gte = new Date(req.query.from);
        if (req.query.to)   filter.date.$lte = new Date(req.query.to);
    }

    // Filter by amount range
    if (req.query.minAmount || req.query.maxAmount) {
        filter.amount = {};
        if (req.query.minAmount) filter.amount.$gte = Number(req.query.minAmount);
        if (req.query.maxAmount) filter.amount.$lte = Number(req.query.maxAmount);
    }

    // --- Sorting ---
    // Default: newest first. Client can override with ?sort=amount or ?sort=-amount
    let sortBy = { date: -1 };
    if (req.query.sort) {
        // "amount"  → { amount: 1 }  (ascending)
        // "-amount" → { amount: -1 } (descending)
        const direction = req.query.sort.startsWith("-") ? -1 : 1;
        const field = req.query.sort.replace("-", "");
        sortBy = { [field]: direction };
    }

    // --- Execute both queries in parallel ---
    const [expenses, total] = await Promise.all([
        expenseModel.find(filter).skip(skip).limit(limit).sort(sortBy),
        expenseModel.countDocuments(filter)
    ]);

    // --- Pagination metadata ---
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        expenses
    });
});

const getExpenseById = catchAsync(async (req, res, next) => {
    const expense = await expenseModel.findOne({
        _id: req.params.id,
        userID: req.user._id
    });

    if (!expense) {
        throw new AppError("Expense not found", 404);
    }

    res.status(200).json({ expense });
});


// findById(id) alone returns the expense regardless of who owns it.
// Adding userId to the filter means: "Find the expense with this ID that belongs to me." 
// If User B tries to fetch User A's expense ID, this returns null → 404. User B never sees it.

// async function updateExpense(req,res){
//     try{
//         const { amount, category, description, date } = req.body;
//         const expense = await expenseModel.findOneAndUpdate(
//             { _id: req.params.id, userID: req.user._id },
//             { amount, category, description, date },
//             { new: true }
//         );
//         if (!expense) {
//             return res.status(404).json({ message: "Expense not found" });
//         }
//         res.status(200).json({message:"udated successfull",expense})
//     }catch(err){
//         res.status(400).json({message:"Bad request , update failed"})
//     }
// }
const updateExpense = catchAsync(async (req, res, next) => {
    const { amount, category, description, date } = req.body;

    const expense = await expenseModel.findOneAndUpdate(
        { _id: req.params.id, userID: req.user._id },
        { amount, category, description, date },
        { new: true }
    );

    if (!expense) {
        throw new AppError("Expense not found", 404);
    }

    res.status(200).json({ message: "Updated successfully", expense });
});

// async function deleteExpense(req,res){
//     try{
//         const expense = await expenseModel.findOneAndDelete({
//             _id:req.params.id,
//             userID: req.user._id
//         })
//         if (!expense) {
//             return res.status(404).json({ message: "Expense not found" });
//         }
//         res.status(200).json({ message: "expense deleted", expense })
//     }catch(err){
//         res.status(500).json({message: err.message})
//     }
// }
const deleteExpense = catchAsync(async (req, res, next) => {
    const expense = await expenseModel.findOneAndDelete({
        _id: req.params.id,
        userID: req.user._id
    });

    if (!expense) {
        throw new AppError("Expense not found", 404);
    }

    res.status(200).json({ message: "Expense deleted", expense });
});

const getSummary = catchAsync(async (req,res,next)=>{
    const matchStage = {userID: req.user._id}

    if (req.query.month){
        const [year, month] = req.query.month.split("-").map(Number);
        const start = new Date(year, month - 1, 1);
        const end   = new Date(year, month, 1); // first day of NEXT month

        matchStage.date = { $gte: start, $lt: end };
    }

    const results = await expenseModel.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: "$category",
                total: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } }

    ])

    const totalSpent = results.reduce((sum, r) => sum + r.total, 0);
    const transactionCount = results.reduce((sum, r) => sum + r.count, 0);

    // --- Reshape into a friendly response ---
    const byCategory = {};
    results.forEach((r) => {
        byCategory[r._id] = r.total;
    });

    res.status(200).json({
        month: req.query.month || "all time",
        totalSpent,
        transactionCount,
        byCategory
    });
})

module.exports = {
    createExpense,
    getMyExpense,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getSummary
};