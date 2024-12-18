import { getConnection } from "../database/connection.js";
import { getOrderData, putOrder } from "./orders.controllers.js";
import sql from "mssql";

export const postOrderProducts = async (req, res) => {
  try {
    await putOrder({ params: { IdPosOrder: req.body.IdPosOrder } });

    const dataOrder = await getOrderData(req.body.IdPosOrder);
    var totalOrder = dataOrder[0].Total;

    const products = req.body.ProductsOrder;
    console.log(products);
    const pool = await getConnection();

    for (const item of products) {
      const tempIdResult = await pool
        .request()
        .input("IdPosOrder", sql.Int, req.body.IdPosOrder)
        .query(
          "SELECT COALESCE(MAX(TempID), 0) + 1 AS NextTempID FROM POSOrdersProducts WHERE IdPosOrder = @IdPosOrder"
        );
      const nextTempID = tempIdResult.recordset[0].NextTempID;

      if (!item.Code) {
        throw new Error("Product code cannot be empty");
      }

      const result = await pool
        .request()
        .input("Code", sql.NVarChar(50), item.Code)
        .input("Description", sql.NVarChar(200), item.Description)
        .input("UnitPrice", sql.Decimal(19, 10), item.SalePrice)
        .input("Quantity", sql.Decimal(19, 10), item.Quantity)
        .input(
          "TotalPrice",
          sql.Decimal(19, 10),
          item.Quantity * item.SalePrice
        )
        .input("IdProduct", sql.Int, item.IdProduct)
        .input("IdPosOrder", sql.Int, req.body.IdPosOrder)
        .input("TempID", sql.Int, nextTempID)
        .input("Options", sql.NVarChar(sql.MAX), item.Options || "")
        .input("Observations", sql.NVarChar(sql.MAX), item.Observations || "")
        .input("Seller", sql.NVarChar(50), item.Seller || "")
        .query(
          `INSERT INTO POSOrdersProducts
              (Code, Description, Type, UnitPrice, Quantity, TotalPrice, CFOP, IdPosOrder, Printed, TempID, Options, Observations, Seller)
            VALUES
              (@Code, @Description, 0, @UnitPrice, @Quantity, @TotalPrice, (SELECT CFOPSale FROM Products WHERE IdProduct = @IdProduct),
              @IdPosOrder, 1, @TempID, @Options, @Observations, @Seller); SELECT SCOPE_IDENTITY() AS IdPosProduct`
        );
      const newIdPosProduct = result.recordset[0].IdPosProduct;

      await pool
        .request()
        .input("IdPosProduct", sql.Int, newIdPosProduct)
        .input("IdPosOrder", sql.Int, req.body.IdPosOrder)
        .query(
          "UPDATE POSOrdersProducts SET IdPosProduct = @IdPosProduct WHERE IdPosOrderProduct = @IdPosOrder"
        );

      totalOrder += item.Quantity * item.SalePrice;
    }

    await pool
      .request()
      .input("Total", sql.Decimal(10, 2), totalOrder)
      .input("IdPosOrder", sql.Int, req.body.IdPosOrder)
      .query(
        "UPDATE POSOrders SET Total = @Total WHERE IdPosOrder = @IdPosOrder"
      );

    res.status(200).send({
      message: "Produtos da comanda inseridos com sucesso",
      total: totalOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao gravar os dados no banco" });
  }
};
