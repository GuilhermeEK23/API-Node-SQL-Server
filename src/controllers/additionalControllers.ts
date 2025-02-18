import { Request, RequestHandler, Response } from "express";
import { getAdditionals } from "../repository/additionalRepository.js";
import {
  nullFields,
  invalidFields,
  serverError,
  successAction,
  notFound,
} from "../responses.js";

export const additionalsFromDatabase: RequestHandler = async (
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

  const additionals = await getAdditionals(Number(IdEnterprise));

  if (additionals instanceof Error) {
    res.status(500).json(serverError(additionals.message));
    return;
  } else if (additionals.length === 0) {
    res.status(404).json(notFound("Nenhum adicional encontrado"));
    return;
  }

  res
    .status(200)
    .json(successAction("Adicionais encontrados com sucesso", additionals));
};
