require("dotenv").config()

const dns = require('node:dns');
const app = require("./src/app")
dns.setServers(['8.8.8.8', '1.1.1.1']); // Force Google/Cloudflare DNS

const connectDB = require("./src/db/db")

async function startServer() {
    await connectDB(); // Wait for DB to connect first
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`server running on port ${PORT}`);
    });
}

startServer();