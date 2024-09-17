import { getConnection } from '../database/connection.js';
import { getOrderData } from './orders.controllers.js';
import sql from 'mssql';

export const postOrderProducts = async (req, res) => {
  try {
    const dataOrder = await getOrderData(req.body.numberOrder);
    var totalOrder = dataOrder[0].Total;

    const products = req.body.productsOrder;
    var TempID = 1;
  
    for (const item of products) {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("Code", sql.VarChar, item.Code)
        .input("Description", sql.VarChar, item.Description)
        .input("UnitPrice", sql.Decimal(10, 2), item.SalePrice)
        .input("Quantity", sql.Decimal(10, 2), item.Quantity)
        .input("TotalPrice", sql.Decimal(10, 2), (item.Quantity * item.SalePrice))
        .input("IdProduct", sql.Int, item.IdProduct)
        .input("IdPosOrder", sql.Int, req.body.numberOrder)
        .input("TempID", sql.Int, TempID)
        .query(
          "INSERT INTO POSOrdersProducts (Code, Type, Description, UnitPrice, Quantity, TotalPrice, CFOP, IdPosOrder, Printed, TempID, Observations, Seller) VALUES (@Code, 0, @Description, @UnitPrice, @Quantity, @TotalPrice, (SELECT CFOPSale FROM Products WHERE IdProduct = @IdProduct), (SELECT IdPosOrder FROM POSOrders WHERE Code = @IdPosOrder), 1, @TempID, '', ''); SELECT SCOPE_IDENTITY() AS IdPosProduct"
        );

      const newIdPosProduct = result.recordset[0].IdPosProduct;

      await pool
        .request()
        .input("IdPosProduct", sql.Int, newIdPosProduct)
        .input("IdPosOrder", sql.Int, newIdPosProduct)
        .query(
          "UPDATE POSOrdersProducts SET IdPosProduct = @IdPosProduct WHERE IdPosOrderProduct = @IdPosOrder"
        );

      TempID++;
      totalOrder += item.Quantity * item.SalePrice;
    }
  
    const pool = await getConnection();
    await pool
      .request()
      .input("Total", sql.Decimal(10, 2), totalOrder)
      .input("Code", sql.VarChar, (req.body.numberOrder))
      .query(
        "UPDATE POSOrders SET Total = @Total WHERE Code = @Code"
      )
  
    res.status(200).send({ message: 'Produtos da comanda inseridos com sucesso', total: totalOrder });
  } catch (error) {
    console.error(error);
    res.status(500).send({message: 'Erro ao gravar os dados no banco'});
  }

}