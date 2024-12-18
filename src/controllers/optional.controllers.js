import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { invalidFields, serverError, successAction } from "../responses.js";

export const getOptionalByProductId = async (req, res) => {
  try {
    const { IdProduct } = req.query;

    if (!IdProduct) {
      return res
        .status(400)
        .json(invalidFields({ message: "IdProduct is required" }));
    }

    const pool = await getConnection();
    const result = await pool.request().input("IdProduct", sql.Int, IdProduct)
      .query(`
        SELECT * FROM ProductGrill WHERE IdProduct = @IdProduct
      `);
    res.status(200).json(successAction({ result: result.recordset }));
  } catch (error) {
    res.status(500).json(serverError({ message: error.message }));
  }
};
