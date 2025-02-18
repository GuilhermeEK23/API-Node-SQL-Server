import { Request, RequestHandler, Response } from "express";
import { getGroups } from "../repository/groupRepository.js";
import {
  nullFields,
  invalidFields,
  serverError,
  successAction,
  notFound,
} from "../responses.js";

export const groupsFromDatabase: RequestHandler = async (
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

  const groups = await getGroups(
    Number(IdEnterprise),
    CodeGroupBase.toString()
  );

  if (groups instanceof Error) {
    res.status(500).json(serverError(groups.message));
    return;
  } else if (groups.length === 0) {
    res.status(404).json(notFound("Nenhum grupo encontrado"));
    return;
  }

  res.status(200).json(successAction("Grupos encontrados com sucesso", groups));
};
