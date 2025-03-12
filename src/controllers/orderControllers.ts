import { Request, RequestHandler, Response } from "express";
import {
  getOrders,
  getOrder,
  putOrder,
  getOrderProducts,
} from "../repository/orderRepository.js";
import {
  nullFields,
  invalidFields,
  serverError,
  successAction,
  notFound,
} from "../responses.js";
import { Order } from "../types.js";

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

export const orderFromDatabase: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json(nullFields("Id não informado"));
    return;
  } else if (isNaN(Number(id))) {
    res.status(400).json(invalidFields("Id não é um número válido"));
    return;
  }

  const order = await getOrder(Number(id));

  if (order instanceof Error) {
    res.status(500).json(serverError(order.message));
    return;
  } else {
    const products = await getOrderProducts(Number(id));
    if (products instanceof Error) {
      res.status(500).json(serverError(products.message));
      return;
    }

    order.Products = products;
  }

  res.status(200).json(successAction("Comanda encontrada com sucesso", order));
};

export const updateOrderDatabase: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json(nullFields("Id não informado"));
    return;
  } else if (isNaN(Number(id))) {
    res.status(400).json(invalidFields("Id não é um número válido"));
    return;
  }

  const order: Order = req.body;
  console.log(JSON.stringify(order, null, 2));

  if (!order.Products || !order.User) {
    res.status(400).json(nullFields("Produtos ou Usuário não informados"));
    return;
  }

  const result = await putOrder(order);
  if (result instanceof Error) {
    res
      .status(500)
      .json(serverError("Erro ao atualizar comanda e produtos da comanda"));
    return;
  } else if (result[0].rowsAffected[0] === 0) {
    res.status(404).json(notFound("Comanda não encontrada"));
    return;
  }
  res.status(201).json({
    message: "Comanda atualizada com sucesso",
    status: 201,
    success: true,
  });
};
