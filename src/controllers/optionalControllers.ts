import { Request, RequestHandler, Response } from "express";
import { getOptionals } from "../repository/optionalRepository.js";
import {
  nullFields,
  invalidFields,
  serverError,
  successAction,
  notFound,
} from "../responses.js";

export const optionalsFromDatabase: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { IdProduct } = req.query;

  if (!IdProduct) {
    res.status(400).json(nullFields("IdProduct não informado"));
    return;
  } else if (isNaN(Number(IdProduct))) {
    res.status(400).json(invalidFields("IdProduct não é um número válido"));
    return;
  }

  const optionals = await getOptionals(Number(IdProduct));

  if (optionals instanceof Error) {
    res.status(500).json(serverError(optionals.message));
    return;
  } else if (optionals.length === 0) {
    res.status(404).json(notFound("Nenhum opcional encontrado"));
    return;
  }

  res
    .status(200)
    .json(successAction("Opcionais encontrados com sucesso", optionals));
};
