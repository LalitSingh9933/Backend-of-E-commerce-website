import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {PrismaClient} from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "ecommerce_db",
  connectionLimit: 5,
});

const prisma = new PrismaClient({
    adapter,
});
export default prisma;