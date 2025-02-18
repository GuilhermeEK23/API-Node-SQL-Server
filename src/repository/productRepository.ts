import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { Group, Product } from "../types.js";
import { configServer } from "../config.js";

export const getProducts = async (
  IdEnterprise: number,
  CodeGroupBase: string
) => {
  try {
    const response = await fetch(
      `http://localhost:${configServer.port}/api/groups?IdEnterprise=${IdEnterprise}&CodeGroupBase=${CodeGroupBase}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const responseData = await response.json();
    const groups = responseData.result;

    if (groups.length === 0) return new Error("Grupos não encontrados");

    let conditionGroups = groups
      .map((group: Group) => `IdGroup = ${group.IdGroupServer}`)
      .join(" OR ");
    if (!conditionGroups) {
      conditionGroups = "1 = 0";
    }

    const pool = await getConnection();

    if (pool instanceof Error) {
      return pool;
    }

    const result = await pool
      .request()
      .input("IdEnterprise", sql.Int, IdEnterprise)
      .input("ConditionGroups", sql.VarChar, conditionGroups).query(`
      SELECT
  	    IdProduct as IdProductServer, Description, Type, SalePrice, ImageSmall, Unit, IdGroup, Observations
      FROM
  	    Products
      WHERE
  	    ExtraFields LIKE '%Cardapio=Sim;%' AND POS = 1 AND IdEnterprise = @IdEnterprise AND (${conditionGroups})
      `);

    return result.recordset as Product[];
  } catch (error) {
    console.error("Erro ao buscar produtos do banco de dados: ", error);
    return error as Error;
  }
};
