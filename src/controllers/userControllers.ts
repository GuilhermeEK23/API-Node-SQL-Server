import { Request, RequestHandler, Response } from "express";
import { getUsers } from "../repository/userRepository.js";
import {
  nullFields,
  invalidFields,
  serverError,
  successAction,
  notFound,
} from "../responses.js";

export const usersFromDatabase: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { IdEnterprise } = req.query;

  if (!IdEnterprise) {
    res.status(400).json(nullFields("IdEnterprise não informado"));
    return;
  } else if (isNaN(Number(IdEnterprise))) {
    res.status(400).json(invalidFields("IdEnterprise não é um número válido"));
    return;
  }

  const users = await getUsers(Number(IdEnterprise));

  if (users instanceof Error) {
    res.status(500).json(serverError(users.message));
    return;
  } else if (users.length === 0) {
    res.status(404).json(notFound("Nenhum usuário encontrado"));
    return;
  }

  res.status(200).json(successAction("Usuário encontrados com sucesso", users));
};
