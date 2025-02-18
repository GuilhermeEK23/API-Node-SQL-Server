import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const dbSettings = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASS || "",
  server: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "1433"),
  database: process.env.DB_BASE || "test",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// console.log(dataConnection);

export const getConnection = async () => {
  try {
    const pool = await sql.connect(dbSettings);
    return pool;
  } catch (error) {
    console.error(error);
    return error as Error;
  }
};
