import { Request, RequestHandler, Response } from "express";
import { getOrders } from "../repository/orderRepository.js";
import {
  nullFields,
  invalidFields,
  serverError,
  successAction,
  notFound,
} from "../responses.js";

export const ordersFromDatabase: RequestHandler = async (
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

  const orders = await getOrders(Number(IdEnterprise));

  if (orders instanceof Error) {
    res.status(500).json(serverError(orders.message));
    return;
  } else if (orders.length === 0) {
    res.status(404).json(notFound("Nenhuma comanda encontrado"));
    return;
  }

  res
    .status(200)
    .json(successAction("Comandas encontradas com sucesso", orders));
};
