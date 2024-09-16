import { getConnection } from '../database/connection.js';
import sql from 'mssql';

export const getOrders = async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM POSOrders po WHERE po.OrderStatus = '1'");
    res.json(result.recordset)
}

export const getOrderData = async (number) => {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input("Code", sql.VarChar, number)
        .query(
            "SELECT po.Code, po.Description, po.Total FROM POSOrders po WHERE OrderStatus = '1' AND po.Code = @Code"
        );
    return result.recordset;
}

export const getOrder = async (req, res) => {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input("Code", sql.VarChar, req.params.code)
        .query(
            "SELECT po.Code, po.Description, po.Total FROM POSOrders po WHERE OrderStatus = '1' AND po.Code = @Code"
        );

    if(result.rowsAffected[0] === 0){
        console.log("comanda não encontrada");
        putOrder(req);

        const pool = await getConnection();
        const result = await pool
            .request()
            .input("Code", sql.VarChar, req.params.code)
            .query(
                "SELECT po.Code, po.Description, po.Total FROM POSOrders po WHERE OrderStatus = '1' AND po.Code = @Code"
            );
        return res.json(result.recordset);
    }
    res.json(result.recordset);
}

export const postOrder = async (req, res) => {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input("Code", sql.VarChar, req.body.Code)
        .input("Description", sql.VarChar, req.body.Description)
        .input("Discount", sql.Decimal, req.body.Discount)
        .input("Total", sql.Decimal, req.body.Total)
        .input("OrderStatus", sql.Int, req.body.OrderStatus)
        .input("ImageFile", sql.VarChar, req.body.ImageFile)
        .input("Sequence", sql.Int, req.body.Code - 1)
        .query(
            "INSERT INTO POSOrders (Code, Description, Date, Discount, Total, OrderStatus, RFID, IdEnterprise, ImageFile, Sequence) VALUES (@Code, @Description, CURRENT_TIMESTAMP, @Discount, @Total, @OrderStatus, '', 2043, @ImageFile, 20)"
        );

    console.log(result);
    res.json(result);
}

export const putOrder = async (req, res) => {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input('Code', sql.VarChar, req.params.code)
        .query(
            "UPDATE POSOrders SET OrderStatus = '1' WHERE Code = @Code"
        );

    console.log(result);
    //res.send("Atualizando uma comanda de código " + req.params.code);
}

export const deleteOrder = (req, res) => {
    res.send("Excluindo uma comanda de código " + req.params.code);
}