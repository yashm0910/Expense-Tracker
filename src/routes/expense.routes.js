const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const expenseController = require("../controllers/expense.controller");
const validate = require("../middlewares/validate.middleware");
const {createExpenseSchema,updateExpenseSchema} = require("../validators/expense.validator")
const {apiLimiter} = require("../middlewares/rateLimit.middleware")
const authFast = require("../middlewares/auth.middleware").authFast


router.use(authMiddleware);
// router.use(apiLimiter);
router.use(authFast)

router.get("/summary",expenseController.getSummary);
router.post("/",validate(createExpenseSchema), expenseController.createExpense);
router.get("/", expenseController.getMyExpense);
router.get("/:id", expenseController.getExpenseById);
router.patch("/:id",validate(updateExpenseSchema), expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;