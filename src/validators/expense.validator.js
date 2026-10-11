const {z} = require("zod")

const createExpenseSchema = z.object({
    amount : z.number().positive(),
    category : z.string().min(1, "category must have atleast 1 character"),
    description : z.string().optional(),
    date : z.coerce.date().optional()
})

const updateExpenseSchema = z.object({
    amount : z.number().positive().optional(),
    category : z.string().min(1, "category must have atleast 1 character").optional(),
    description : z.string().optional(),
    date : z.coerce.date().optional()
})


module.exports = {createExpenseSchema,updateExpenseSchema}