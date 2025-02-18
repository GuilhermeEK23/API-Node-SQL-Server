import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { Order } from "../types.js";

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

// export const putOrder = async (req, res) => {
//   const dataBody = req.body;
//   console.log(JSON.stringify(dataBody, null, 2));
//   const { user, orderNumber, products } = req.body;

//   let pool;
//   try {
//     pool = await getConnection();

//     if (!user || !orderNumber) {
//       return res.status(400).json(nullFields);
//     }

//     // Verifica se a comanda existe
//     const order = await getOrderByNumber(orderNumber);

//     if (order === null) {
//       return res.status(404).json(notFound({ message: "Order not found" }));
//     } else if (order.OrderStatus === 0 || order.OrderStatus === 1) {
//       // Calcula o total da comanda
//       const total = products.reduce((acc, product) => {
//         const productTotal = product.SalePrice * product.quantity;
//         const totalOptional = product.optionals.reduce((acc, optional) => {
//           const optionalTotal = optional.SalePrice * optional.quantity;
//           return acc + optionalTotal;
//         }, 0);
//         return acc + productTotal + totalOptional;
//       }, 0);

//       let result = await pool
//         .request()
//         .input("total", sql.Decimal(18, 2), parseFloat(total))
//         .input("orderStatus", sql.Int, 1)
//         .input("seller", sql.VarChar, user.Name)
//         .input("IdPosOrder", sql.Int, order.IdPosOrder).query(`
//           UPDATE POSOrders
//           SET Total = @total,
//               OrderStatus = @orderStatus,
//               Seller = @seller
//           WHERE IdPosOrder = @IdPosOrder
//         `);

//       if (result.rowsAffected[0] === 1) {
//         // Insere os produtos na tabela POSOrderProducts
//         for (let i = 0; i < products.length; i++) {
//           const SalePriceProduct =
//             products[i].SalePrice +
//             products[i].optionals.reduce(
//               (acc, optional) => acc + optional.SalePrice * optional.quantity,
//               0
//             );

//           let optionals = "";
//           JSON.stringify(
//             products[i].optionals.map((op) => {
//               optionals += `${op.Description}(${op.quantity});`;
//             })
//           );

//           result = await pool
//             .request()
//             .input("Code", sql.VarChar, products[i].Code)
//             .input("Description", sql.VarChar, products[i].Description)
//             .input("Type", sql.Int, products[i].Type)
//             .input("UnitPrice", sql.Decimal(18, 2), SalePriceProduct)
//             .input("Quantity", sql.Decimal(18, 2), products[i].quantity)
//             .input(
//               "TotalPrice",
//               sql.Decimal(18, 2),
//               SalePriceProduct * products[i].quantity
//             )
//             .input("CFOP", sql.Int, products[i].CFOPSale)
//             .input("IdPosOrder", sql.Int, order.IdPosOrder)
//             .input("Printed", sql.Bit, 1)
//             .input("TempID", sql.Int, i + 1)
//             .input("Observations", sql.VarChar, products[i].Observations || "")
//             .input("Options", sql.VarChar, optionals || null)
//             .input("Seller", sql.VarChar, user.Name || "").query(`
//               INSERT INTO POSOrdersProducts
//                 (Code, Description, Type, UnitPrice, Quantity, TotalPrice, CFOP, IdPosOrder, Printed, TempID, Observations, Options, Seller)
//               VALUES
//                 (@Code, @Description, @Type, @UnitPrice, @Quantity, @TotalPrice, @CFOP, @IdPosOrder, @Printed, @TempID, @Observations, @Options, @Seller)
//             `);
//         }
//       }
//       formatAndPrint(dataBody);
//       return res
//         .status(200)
//         .json(successAction({ message: "Order is already closed" }));
//     } else {
//       return res
//         .status(401)
//         .json(
//           unauthorized({ message: "Request not allowed to change status" })
//         );
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(serverError({ message: error.message }));
//   }
// };
