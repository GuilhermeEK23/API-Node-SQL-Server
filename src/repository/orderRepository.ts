import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { Order, Product } from "../types.js";

export const getOrders = async (IdEnterprise: number) => {
  try {
    const pool = await getConnection();

    if (pool instanceof Error) {
      return pool;
    }

    const result = await pool
      .request()
      .input("IdEnterprise", sql.Int, IdEnterprise).query(`
        SELECT IdPosOrder as IdPosOrderServer, Code, Description, Date, Total, OrderStatus, Seller, Observations FROM POSOrders WHERE IdEnterprise = @IdEnterprise;
      `);

    return result.recordset as Order[];
  } catch (error) {
    console.error("Erro ao buscar usuários do banco de dados: ", error);
    return error as Error;
  }
};

const putOrderProducts = async (
  pool: sql.ConnectionPool,
  IdPosOrder: number,
  products: Product[],
  seller: string
) => {
  try {
    // Obter o próximo TempID para o IdPosOrder especificado
    const tempIdResult = await pool
      .request()
      .input("IdPosOrder", sql.Int, IdPosOrder)
      .query(
        "SELECT COALESCE(MAX(TempID), 0) AS LastTempID FROM POSOrdersProducts WHERE IdPosOrder = @IdPosOrder"
      );
    const lastTempID = tempIdResult.recordset[0].LastTempID;

    const result = await Promise.all(
      products.map(async (product) => {
        const nextTempID = lastTempID + products.indexOf(product) + 1;

        const result = await pool
          .request()
          .input("IdProduct", sql.Int, product.IdProductServer)
          .input("Description", sql.NVarChar, product.Description)
          .input("UnitPrice", sql.Decimal(18, 2), product.SalePrice)
          .input("Quantity", sql.Int, product.Quantity)
          .input("TotalPrice", sql.Decimal(18, 2), product.Total)
          .input("IdPosOrder", sql.Int, IdPosOrder)
          .input("TempID", sql.Int, nextTempID)
          .input("Observations", sql.NVarChar, product.Observations)
          .input(
            "Options",
            sql.NVarChar(500),
            product.Optionals?.map((option) => option.Description).join(", ") ||
              ""
          )
          .input("Seller", sql.NVarChar, seller).query(`
            INSERT INTO POSOrdersProducts (
              Code,
              Description,
              Type,
              UnitPrice,
              Quantity,
              TotalPrice,
              CFOP,
              IdPosOrder,
              Printed,
              TempID,
              Observations,
              Options,
              Seller
            ) VALUES (
              (SELECT Code FROM Products WHERE IdProduct = @IdProduct),
              @Description,
              0,
              @UnitPrice,
              @Quantity,
              @TotalPrice,
              (SELECT CFOPSale FROM Products WHERE IdProduct = @IdProduct),
              @IdPosOrder,
              1,
              @TempID,
              @Observations,
              @Options,
              @Seller
            );
            SELECT SCOPE_IDENTITY() AS IdPosProduct;
            `);

        return result;
      })
    );

    return result;
  } catch (error) {
    console.log("Erro ao inserir os produtos da comanda: ", error);
    return error as Error;
  }
};

export const putOrder = async (order: Order) => {
  try {
    const pool = await getConnection();

    if (pool instanceof Error) return pool;
    if (!order.Products || order.Products.length === 0 || !order.User)
      return new Error("Pedido inválido");
    const resultTotalInOrder = await pool
      .request()
      .input("IdPosOrder", sql.Int, order.IdPosOrderServer)
      .query(`SELECT Total FROM POSOrders WHERE IdPosOrder = @IdPosOrder;`);

    const totalInDatabase = resultTotalInOrder.recordset[0].Total;

    const getLocalDateTimeWithMs = () => {
      const now = new Date();
      return (
        now.toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" }) +
        `.${now.getMilliseconds().toString().padStart(3, "0")}`
      );
    };

    const result = await pool
      .request()
      .input("date", sql.NVarChar, getLocalDateTimeWithMs())
      .input("total", sql.Decimal(18, 2), order.Total + totalInDatabase)
      .input(
        "orderStatus",
        sql.Int,
        order.OrderStatus === 0 ? 1 : order.OrderStatus
      )
      .input("seller", sql.VarChar, order.User.Name)
      .input("IdPosOrder", sql.Int, order.IdPosOrderServer).query(`
          UPDATE
            POSOrders
          SET
            Date = @date,
            Total = @total,
            OrderStatus = @orderStatus,
            Seller = @seller
          WHERE
            IdPosOrder = @IdPosOrder;
        `);

    if (result.rowsAffected[0] === 1) {
      // Insere os produtos na tabela POSOrderProducts
      const resultProducts = await putOrderProducts(
        pool,
        order.IdPosOrderServer,
        order.Products,
        order.User.Name
      );
      if (resultProducts instanceof Error) {
        // Se houver um erro ao inserir os produtos, reverte a atualização do pedido e retorna o erro
        await pool
          .request()
          .input("date", sql.DateTime, order.Date)
          .input("total", sql.Decimal(18, 2), totalInDatabase)
          .input("orderStatus", sql.Int, order.OrderStatus)
          .input("seller", sql.VarChar, null)
          .input("IdPosOrder", sql.Int, order.IdPosOrderServer).query(`
          UPDATE
            POSOrders
          SET
            Date = @date,
            Total = @total,
            OrderStatus = @orderStatus,
            Seller = @seller
          WHERE
            IdPosOrder = @IdPosOrder;
        `);
        return new Error(
          "Erro ao inserir os produtos na tabela POSOrderProducts."
        );
      }

      // Se não houver erro, retorna o resultado da atualização do pedido
      return [...resultProducts, result];
    }
    // formatAndPrint(dataBody);
    return new Error("Erro ao atualizar o pedido, nenhuma linha afetada.");
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};
