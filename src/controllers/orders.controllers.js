import { getConnection } from "../database/connection.js";
import sql from "mssql";
import {
  notFound,
  nullFields,
  serverError,
  successAction,
  unauthorized,
} from "../responses.js";
import { formatAndPrint } from "../printer/index.js";

export const getOrderByNumber = async (CodeOrder) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("CodeOrder", sql.Int, CodeOrder)
    .query(
      `SELECT IdPosOrder, Code, Description, Date, Total, OrderStatus, IdEnterprise, Type, Seller, Observations FROM POSOrders WHERE Code = @CodeOrder`
    );
  return result.recordset[0] || null;
};

export const putOrder = async (req, res) => {
  const dataBody = req.body;
  const { user, orderNumber, products } = req.body;

  let pool;
  try {
    pool = await getConnection();

    if (!user || !orderNumber) {
      return res.status(400).json(nullFields);
    }

    // Verifica se a comanda existe
    const order = await getOrderByNumber(orderNumber);

    if (order === null) {
      return res.status(404).json(notFound({ message: "Order not found" }));
    } else if (order.OrderStatus === 0 || order.OrderStatus === 1) {
      // Calcula o total da comanda
      const total = products.reduce((acc, product) => {
        const productTotal = product.SalePrice * product.quantity;
        const totalOptional = product.optionals.reduce((acc, optional) => {
          const optionalTotal = optional.SalePrice * optional.quantity;
          return acc + optionalTotal;
        }, 0);
        return acc + productTotal + totalOptional;
      }, 0);

      let result = await pool
        .request()
        .input("total", sql.Decimal(18, 2), parseFloat(total))
        .input("orderStatus", sql.Int, 1)
        .input("seller", sql.VarChar, user.Name)
        .input("IdPosOrder", sql.Int, order.IdPosOrder).query(`
          UPDATE POSOrders
          SET Total = @total,
              OrderStatus = @orderStatus,
              Seller = @seller
          WHERE IdPosOrder = @IdPosOrder
        `);

      if (result.rowsAffected[0] === 1) {
        // Insere os produtos na tabela POSOrderProducts
        for (let i = 0; i < products.length; i++) {
          const SalePriceProduct =
            products[i].SalePrice +
            products[i].optionals.reduce(
              (acc, optional) => acc + optional.SalePrice * optional.quantity,
              0
            );

          let optionals = "";
          JSON.stringify(
            products[i].optionals.map((op) => {
              optionals += `${op.Description}(${op.quantity});`;
            })
          );

          result = await pool
            .request()
            .input("Code", sql.VarChar, products[i].Code)
            .input("Description", sql.VarChar, products[i].Description)
            .input("Type", sql.Int, products[i].Type)
            .input("UnitPrice", sql.Decimal(18, 2), SalePriceProduct)
            .input("Quantity", sql.Decimal(18, 2), products[i].quantity)
            .input(
              "TotalPrice",
              sql.Decimal(18, 2),
              SalePriceProduct * products[i].quantity
            )
            .input("CFOP", sql.Int, products[i].CFOPSale)
            .input("IdPosOrder", sql.Int, order.IdPosOrder)
            .input("Printed", sql.Bit, 1)
            .input("TempID", sql.Int, i + 1)
            .input("Observations", sql.VarChar, products[i].Observations || "")
            .input("Options", sql.VarChar, optionals || null)
            .input("Seller", sql.VarChar, user.Name || "").query(`
              INSERT INTO POSOrdersProducts
                (Code, Description, Type, UnitPrice, Quantity, TotalPrice, CFOP, IdPosOrder, Printed, TempID, Observations, Options, Seller)
              VALUES
                (@Code, @Description, @Type, @UnitPrice, @Quantity, @TotalPrice, @CFOP, @IdPosOrder, @Printed, @TempID, @Observations, @Options, @Seller)
            `);
        }
      }
      formatAndPrint(dataBody);
      return res
        .status(200)
        .json(successAction({ message: "Order is already closed" }));
    } else {
      return res
        .status(401)
        .json(
          unauthorized({ message: "Request not allowed to change status" })
        );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(serverError({ message: error.message }));
  }
};

// export const getOrderData = async (number) => {
//   const pool = await getConnection();
//   const result = await pool
//     .request()
//     .input("IdPosOrder", sql.Int, number)
//     .query(
//       `SELECT
//         po.IdPosOrder, po.Description, po.Code, po.Total, po.OrderStatus, po.IdEnterprise, po.Type, po.Observations
//       FROM
//         POSOrders po
//       WHERE
//         OrderStatus = '1' AND po.IdPosOrder = @IdPosOrder`
//     );
//   return result.recordset;
// };

// export const getOrder = async (req, res) => {
//   const pool = await getConnection();
//   const result = await pool
//     .request()
//     .input("Code", sql.VarChar, req.params.code)
//     .query(
//       "SELECT po.Code, po.Description, po.Total FROM POSOrders po WHERE OrderStatus = '1' AND po.Code = @Code"
//     );

//   if (result.rowsAffected[0] === 0) {
//     console.log("comanda não encontrada");
//     putOrder(req);

//     const pool = await getConnection();
//     const result = await pool
//       .request()
//       .input("Code", sql.VarChar, req.params.code)
//       .query(
//         "SELECT po.Code, po.Description, po.Total FROM POSOrders po WHERE OrderStatus = '1' AND po.Code = @Code"
//       );
//     return res.json(result.recordset);
//   }
//   res.json(result.recordset);
// };

// export const postOrder = async (req, res) => {
//   const pool = await getConnection();
//   const result = await pool
//     .request()
//     .input("Code", sql.VarChar, req.body.Code)
//     .input("Description", sql.VarChar, req.body.Description)
//     .input("Discount", sql.Decimal, req.body.Discount)
//     .input("Total", sql.Decimal, req.body.Total)
//     .input("OrderStatus", sql.Int, req.body.OrderStatus)
//     .input("ImageFile", sql.VarChar, req.body.ImageFile)
//     .input("Sequence", sql.Int, req.body.Code - 1).query(`
//       INSERT INTO POSOrders (Code, Description, Date, Discount, Total, OrderStatus, RFID, IdEnterprise, ImageFile, Sequence)
//       VALUES (@Code, @Description, CURRENT_TIMESTAMP, @Discount, @Total, @OrderStatus, '', 2043, @ImageFile, 20)
//     `);

//   console.log(result);
//   res.json(result);
// };

// export const putOrder = async (req, res) => {
//   const pool = await getConnection();
//   const result = await pool
//     .request()
//     .input("IdPosOrder", sql.NVarChar, req.params.IdPosOrder.toString())
//     .query(
//       "UPDATE POSOrders SET OrderStatus = '1' WHERE IdPosOrder = @IdPosOrder"
//     );

//   console.log(result);
//   // res.send("Atualizando uma comanda de código " + req.params.code);
// };
