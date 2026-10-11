const {z} = require("zod")

const registerSchema = z.object({
    username: z.string().min(3,"Username must be of atleast 3 characters").max(20,"Username too long"),
    email : z.string().trim().toLowerCase().email("Invalid email format"),
    password: z.string().min(6,"Password must be atleast 6 characters")
})

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email format"),
    password: z.string().min(1,"Password must be there")
})

const updateUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username too long")
});

module.exports = {registerSchema,loginSchema,updateUserSchema}
