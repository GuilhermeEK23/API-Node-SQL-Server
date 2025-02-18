import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { Additional } from "../types.js";

export const getAdditionals = async (IdEnterprise: number) => {
  try {
    const pool = await getConnection();

    if (pool instanceof Error) {
      return pool;
    }

    const result = await pool
      .request()
      .input("IdEnterprise", sql.Int, IdEnterprise).query(`
        SELECT
          IdAdditional as IdAdditionalServer, Description, SalePrice
        FROM
          Additional
        WHERE
          IdEnterprise = @IdEnterprise;
      `);

    return result.recordset as Additional[];
  } catch (error) {
    console.error("Erro ao buscar adicionais do banco de dados: ", error);
    return error as Error;
  }
};
