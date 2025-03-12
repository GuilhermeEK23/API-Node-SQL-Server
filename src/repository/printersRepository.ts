import { getConnection } from "../database/connection.js";
import sql from "mssql";

export const getPrinterByIdProduct = async (IdProduct: number) => {
  try {
    const pool = await getConnection();

    if (pool instanceof Error) {
      return pool;
    }

    const result = await pool.request().input("IdProduct", sql.Int, IdProduct)
      .query<string>(`
      SELECT Printer FROM ProductPrinters WHERE IdProduct = @IdProduct;
    `);

    return result.recordset[0] as string;
  } catch (error) {
    console.error("Error getting printer by IdProduct: ", error);
    return error as Error;
  }
};
