import { Request, RequestHandler, Response } from "express";
import { getProducts } from "../repository/productRepository.js";
import {
  nullFields,
  invalidFields,
  serverError,
  successAction,
  notFound,
} from "../responses.js";

export const productsFromDatabase: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { IdEnterprise, CodeGroupBase } = req.query;

  if (!IdEnterprise) {
    res.status(400).json(nullFields("IdEnterprise não informado"));
    return;
  } else if (!CodeGroupBase) {
    res.status(400).json(nullFields("CodeGruoupBase não informado"));
    return;
  } else if (isNaN(Number(IdEnterprise))) {
    res.status(400).json(invalidFields("IdEnterprise não é um número válido"));
    return;
  }

  const products = await getProducts(
    Number(IdEnterprise),
    CodeGroupBase.toString()
  );

  if (products instanceof Error) {
    res.status(500).json(serverError(products.message));
    return;
  } else if (products.length === 0) {
    res.status(404).json(notFound("Nenhum produto encontrado"));
    return;
  }

  res
    .status(200)
    .json(successAction("Produtos encontrados com sucesso", products));
};
