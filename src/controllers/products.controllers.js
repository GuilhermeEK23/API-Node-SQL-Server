import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { invalidFields, serverError, successAction } from "../responses.js";
import { configServer } from "../config.js";

export const getProducts = async (req, res) => {
  const { IdEnterprise } = req.params.IdEnterprise;

  const pool = await getConnection();
  const result = await pool
    .request()
    .input("IdEnterprise", sql.Int, IdEnterprise).query(`
      SELECT
        IdProduct, Code, Description, SalePrice, RealStock, Unit, IdGroup, IdEnterprise
      FROM
        Products
      WHERE
        Type = 0 AND POS = 1 AND IdEnterprise = 2043
    `);
  res.json(result.recordset);
};

export const getProductsApp = async (req, res) => {
  try {
    const { IdEnterprise, CodeGroupBase } = req.query;

    if (!IdEnterprise || !CodeGroupBase) {
      return res
        .status(400)
        .json(invalidFields({ message: "IdEnterprise is required" }));
    }

    const response = await fetch(
      `http://localhost:${configServer.port}/groups?IdEnterprise=${IdEnterprise}&CodeGroupBase=${CodeGroupBase}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const responseData = await response.json();
    const groups = responseData.detail.result || [];

    if (groups.length === 0) {
      return res
        .status(404)
        .json(invalidFields({ message: "No groups found" }));
    }

    let conditionGroups = groups
      .map((group) => `IdGroup = ${group.IdGroup}`)
      .join(" OR ");
    if (!conditionGroups) {
      conditionGroups = "1 = 0";
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("IdEnterprise", sql.Int, IdEnterprise)
      .input("ConditionGroups", sql.VarChar, conditionGroups).query(`
      SELECT
  	    IdProduct, Code, Description, Type, SalePrice, ImageSmall, CFOPSale, Unit, IdGroup, IdEnterprise, Observations, AskOption
      FROM
  	    Products
      WHERE
  	    ExtraFields LIKE '%Cardapio=Sim;%' AND POS = 1 AND IdEnterprise = @IdEnterprise AND (${conditionGroups})
      `);
    res.status(200).json(successAction({ result: result.recordset }));
  } catch (error) {
    res.status(500).json(serverError({ message: error.message }));
  }
};
