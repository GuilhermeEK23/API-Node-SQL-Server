import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { nullFields, serverError, successAction } from "../responses.js";

export const getAdditional = async (req, res) => {
  try {
    const { IdEnterprise } = req.query;

    if (!IdEnterprise) {
      return res.status(400).json(nullFields);
    }

    const pool = await getConnection();
    await pool
      .request()
      .input("IdEnterprise", sql.Int, IdEnterprise)
      .query(
        `
        SELECT * FROM Additional WHERE IdEnterprise = @IdEnterprise
      `
      )
      .then((result) => result.recordset)
      .then((data) => {
        res.status(200).json(successAction({ result: data }));
      });
  } catch (error) {
    console.error(error);
    res.status(500).json(serverError({ message: "Internal Server Error" }));
  }
};
