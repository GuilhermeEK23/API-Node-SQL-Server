import { getConnection } from "../database/connection.js";
import sql from "mssql";
import {
  nullFields,
  invalidFields,
  serverError,
  successCreated,
  successAction,
  notFound,
} from "../responses.js";

export const insertUser = async (req, res) => {
  const { name, password, status, idEnterprise } = req.body;

  // Verifica se todos os campos foram preenchidos
  if (!name || !password || !status || !idEnterprise) {
    return res.status(400).json(nullFields);
  } else if (isNaN(idEnterprise)) {
    return res
      .status(400)
      .json(
        invalidFields({ message: "O campo 'IdEnterprise' deve ser um número." })
      );
  }

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Name", sql.VarChar, name.trim())
      .input("Password", sql.VarChar, password)
      .input("Status", sql.Int, status)
      .input("IdEnterprise", sql.Int, idEnterprise).query(`
        INSERT INTO Cardapio_Users (Name, Password, Status, IdEnterprise)
        VALUES (@Name, @Password, @Status, @IdEnterprise);
        SELECT SCOPE_IDENTITY() AS IdUser
        `);
    const idUser = result.recordset[0].IdUser;
    return res.status(201).json(
      successCreated({
        message: "Usuário inserido com sucesso!",
        idUser: idUser,
      })
    );
  } catch (error) {
    console.error("Erro: ", error);
    res.status(500).json(serverError({ message: "Erro interno no servidor." }));
  }
};

export const updateUser = async (req, res) => {
  const { name, password, status, idEnterprise } = req.body;
  const idUser = req.params.id;

  // Verifica se todos os campos foram preenchidos
  if (!name || !password || !status || !idEnterprise) {
    return res.status(400).json(nullFields);
  } else if (isNaN(idEnterprise)) {
    return res
      .status(400)
      .json(
        invalidFields({ message: "O campo 'IdEnterprise' deve ser um número." })
      );
  } else if (isNaN(idUser)) {
    return res
      .status(400)
      .json(invalidFields({ message: "O campo 'IdUser' deve ser um número." }));
  }

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("IdUser", sql.Int, idUser)
      .input("Name", sql.VarChar, name.trim())
      .input("Password", sql.VarChar, password)
      .input("Status", sql.VarChar, status)
      .input("IdEnterprise", sql.Int, idEnterprise).query(`
        UPDATE Cardapio_Users
        SET Name = @Name, Password = @Password, Status = @Status, IdEnterprise = @IdEnterprise
        WHERE IdUser = @IdUser
      `);
    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json(invalidFields({ message: "Usuário não encontrado." }));
    }
    res.status(200).json(
      successAction({
        message: "Usuário atualizado com sucesso",
        idUser: idUser,
      })
    );
  } catch (error) {
    console.error("Erro: ", error);
    res.status(500).json(serverError({ message: "Erro interno no servidor." }));
  }
};

export const getUsers = async (req, res) => {
  try {
    const { IdEnterprise } = req.query;

    if (!IdEnterprise) {
      return res.status(400).json(nullFields);
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("IdEnterprise", sql.Int, IdEnterprise)
      .query(
        "SELECT IdUser, Name, Email, Password, Status, IdEnterprise, IdProfile, Notes, CellphoneNumber, ExtraFields FROM Users WHERE IdEnterprise = @IdEnterprise"
      );

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json(notFound({ message: "Usuários ou empresa não encontrado" }));
    }

    res.status(200).json(successAction({ result: result.recordset }));
  } catch (error) {
    console.error("Erro: ", error);
    res.status(500).json(serverError({ message: error }));
  }
};

export const getUser = async (req, res) => {
  try {
    const { Username, Password, IdEnterprise } = req.query;

    if (!Username || !Password || !IdEnterprise) {
      return res.status(400).json(nullFields);
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Username", sql.VarChar, Username)
      .input("Password", sql.VarChar, Password)
      .input("IdEnterprise", sql.Int, IdEnterprise)
      .query(
        "SELECT IdUser, Name, Email, Status, IdEnterprise, IdProfile, Notes, CellphoneNumber, ExtraFields FROM Users WHERE Name = @Username AND Password = @Password AND IdEnterprise = @IdEnterprise"
      );

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json(notFound({ message: "Usuário não encontrado" }));
    }

    res.status(200).json(successAction({ result: result.recordset }));
  } catch (error) {
    console.error("Erro: ", error);
    res.status(500).json(serverError({ message: error }));
  }
};

export const deleteUser = async (req, res) => {
  const idUser = req.params.id;

  if (isNaN(idUser)) {
    return res
      .status(400)
      .json(invalidFields({ message: "Id de usuário inválido!" }));
  }

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("IdUser", sql.Int, idUser)
      .query(`DELETE FROM Cardapio_Users WHERE IdUser = @IdUser`);

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json(invalidFields({ message: "Usuário não encontrado." }));
    }
    res.status(200).json(
      successAction({
        message: "Usuário excluído com sucesso!",
        idUser: idUser,
      })
    );
  } catch (error) {
    console.error("Erro: ", error);
    res.status(500).json(serverError({ message: "Erro interno no servidor." }));
  }
};
