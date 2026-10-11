const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log("db connected successfully");
        console.log("Connected host:", mongoose.connection.host);
        console.log("Connected db:", mongoose.connection.name);

        // Test that a real query works
        const result = await mongoose.connection.db.admin().ping();
        console.log("Ping result:", result);
    } catch (err) {
        console.error("DB connection failed:", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;