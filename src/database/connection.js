import sql from "mssql";
import dbConfig from "../dataConnection.json" assert { type: "json" };

const dbSettings = {
  user: dbConfig.user,
  password: dbConfig.password,
  server: dbConfig.server,
  port: parseInt(dbConfig.port),
  database: dbConfig.database,
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
  }
};
