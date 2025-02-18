import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { Optional } from "../types.js";

export const getOptionals = async (IdProduct: number) => {
  try {
    const pool = await getConnection();

    if (pool instanceof Error) {
      return pool;
    }

    const result = await pool.request().input("IdProduct", sql.Int, IdProduct)
      .query(`
        SELECT
          IdProductGrill as IdProductGrillServer, Description, SalePrice, IdProduct
        FROM
          ProductGrill
        WHERE IdProduct = @IdProduct;
      `);

    return result.recordset as Optional[];
  } catch (error) {
    console.error("Erro ao buscar opcionais do banco de dados: ", error);
    return error as Error;
  }
};
