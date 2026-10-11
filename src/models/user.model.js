const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    username:String,
    email:{
        type:String,
        unique:true
    },
    password:{
        type:String,
        select:false
    }
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

const userModel = mongoose.model("User",userSchema)

module.exports = userModel