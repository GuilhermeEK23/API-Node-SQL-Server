import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { User } from "../types.js";

export const getUsers = async (IdEnterprise: number) => {
  try {
    const pool = await getConnection();

    if (pool instanceof Error) {
      return pool;
    }

    const result = await pool
      .request()
      .input("IdEnterprise", sql.Int, IdEnterprise)
      .query(
        "SELECT IdUser as IdUserServer, Name, Email, Password FROM Users WHERE IdEnterprise = @IdEnterprise"
      );

    return result.recordset as User[];
  } catch (error) {
    console.error("Erro ao buscar usuários do banco de dados: ", error);
    return error as Error;
  }
};
