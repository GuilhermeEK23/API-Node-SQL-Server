import { getConnection } from "../database/connection.js";
import { nullFields, successAction } from "../responses.js";
import { putOrder } from "./orders.controllers.js";
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

export const postOrderProduct = async (req, res) => {
  try {
    const {
      Code,
      Description,
      UnitPrice,
      Quantity,
      TotalPrice,
      Discount,
      DiscountType,
      CFOP,
      IdPosOrder,
      Printed,
      Options,
      Observations,
      Seller,
    } = req.body;

    const pool = await getConnection();

    const tempIdResult = await pool
      .request()
      .input("IdPosOrder", sql.Int, IdPosOrder)
      .query(
        "SELECT COALESCE(MAX(TempID), 0) + 1 AS NextTempID FROM POSOrdersProducts WHERE IdPosOrder = @IdPosOrder"
      );
    const nextTempID = tempIdResult.recordset[0].NextTempID;

    if (!Code) {
      throw new Error("Product code cannot be empty");
    }

    const result = await pool
      .request()
      .input("Code", sql.NVarChar(50), Code)
      .input("Description", sql.NVarChar(200), Description)
      .input("UnitPrice", sql.Decimal(19, 10), UnitPrice)
      .input("Quantity", sql.Decimal(19, 10), Quantity)
      .input("TotalPrice", sql.Decimal(19, 10), TotalPrice)
      .input("Discount", sql.Int, Discount)
      .input("DiscountType", sql.Int, DiscountType)
      .input("CFOP", sql.Int, CFOP)
      .input("IdPosOrder", sql.Int, IdPosOrder)
      .input("Printed", sql.Int, Printed)
      .input("TempID", sql.Int, nextTempID)
      .input("Options", sql.NVarChar(sql.MAX), Options || "")
      .input("Observations", sql.NVarChar(sql.MAX), Observations || "")
      .input("Seller", sql.NVarChar(50), Seller || "")
      .query(
        `INSERT INTO POSOrdersProducts
              (Code, Description, Type, UnitPrice, Quantity, TotalPrice, CFOP, IdPosOrder, Printed, TempID, Options, Observations, Seller)
            VALUES
              (@Code, @Description, 0, @UnitPrice, @Quantity, @TotalPrice, @CFOP,
              @IdPosOrder, @Printed, @TempID, @Options, @Observations, @Seller); SELECT SCOPE_IDENTITY() AS IdPosProduct`
      );
    const newIdPosProduct = result.recordset[0].IdPosProduct;

    await pool
      .request()
      .input("IdPosProduct", sql.Int, newIdPosProduct)
      .input("IdPosOrder", sql.Int, IdPosOrder)
      .query(
        "UPDATE POSOrdersProducts SET IdPosProduct = @IdPosProduct WHERE IdPosOrderProduct = @IdPosOrder"
      );

    res.status(200).send({
      message: "Produtos da comanda inseridos com sucesso",
      IdPosOrderProduct: newIdPosProduct,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getOrdersProducts = async (req, res) => {
  try {
    const { IdEnterprise } = req.query;

    if (!IdEnterprise) {
      return res
        .status(400)
        .json(nullFields({ message: "IdEnterprise é obrigatório" }));
    }

    const pool = await getConnection();
    await pool
      .request()
      .input("IdEnterprise", sql.Int, IdEnterprise)
      .query(
        `
        select
          op.IdPosOrderProduct,
          op.Code,
          op.Description,
          op.Type,
          op.UnitPrice,
          op.Quantity,
          op.TotalPrice,
          op.Discount,
          op.DiscountType,
          op.CFOP,
          op.IdPosOrder,
          op.Printed,
          op.TempID,
          op.Observations,
          op.Grill,
          op.Options,
          op.Seller,
          op.Edited
        from
          POSOrdersProducts op
        join
          POSOrders o
        on
          op.IdPosOrder = o.IdPosOrder and o.IdEnterprise = @IdEnterprise;  
      `
      )
      .then((result) => result.recordset)
      .then((data) => {
        res.status(200).json(successAction({ result: data }));
      });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao buscar os dados no banco" });
  }
};
