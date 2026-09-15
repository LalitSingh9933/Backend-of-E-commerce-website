import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  try {

    await prisma.$connect();

    console.log("Database conneted successfully");
    
    app.listen(port, () => {
      console.log(`Auth API: http://localhost:${port}/api`);
    });
  } catch (error) {

    console.error("Could not connect to MySQL:");
    console.error(" Failed to start server:",error.message);
    await prisma.$disconnect;
    process.exit(1);
  }
}

startServer();