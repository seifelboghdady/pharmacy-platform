const app = require("./app");
require("dotenv").config();
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");


const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();