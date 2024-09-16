import { getConnection } from "../database/connection.js";

export const getProducts = async (req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .query(
        "SELECT IdProduct, Code, Image, Description, SalePrice, RealStock, Unit FROM Products p WHERE Type = 0 AND POS = 1"
    );
    res.json(result.recordset);
}