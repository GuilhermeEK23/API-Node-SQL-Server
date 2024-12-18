import { getConnection } from "../database/connection.js";
import sql from "mssql";
import {
  notFound,
  nullFields,
  serverError,
  successAction,
} from "../responses.js";

// Busca as ordem dos grupos e subgrupos a partir de um grupo base passado
export const fetchGroupsOrder = async (groupBase) => {
  const pool = await getConnection();
  const result = await pool.request().query(`
      SELECT "Order" FROM GroupsOrder;
    `);
  const groupsOrderString = result.recordset[0].Order;
  const groupsOrder = JSON.parse(groupsOrderString);
  const idGroupBase = groupBase.IdGroup.toString() || "";
  const groupOrder = groupsOrder.find((order) => order.id === idGroupBase);
  return groupOrder || null;
};

// Busca todos os grupos cadastrados
export const fetchGroups = async (IdEnterprise) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("IdEnterprise", sql.Int, IdEnterprise)
    .query(
      "SELECT IdGroup, Code, Category, Description, IdEnterprise, Image FROM Groups WHERE Notes LIKE '%Cardapio=Sim;%' AND Category = 'PROD' AND IdEnterprise = @IdEnterprise"
    );
  return result.recordset;
};

// Monta o objeto de grupo com o Id do grupo pai, se houver
const buildGroup = (group, paternIdGroup) => {
  return {
    ...group,
    ParentIdGroup: paternIdGroup || null,
  };
};

// Função recursiva para processar os grupos e subgrupos
const processGroupOrder = (
  allGroups,
  groupOrder,
  paternIdGroup,
  listGroups
) => {
  const group = allGroups.find((g) => g.IdGroup.toString() === groupOrder.id);
  if (group) {
    listGroups.push(buildGroup(group, paternIdGroup));

    // Processa subgrupos recursivamente, se existirem
    if (groupOrder.children && groupOrder.children.length > 0) {
      groupOrder.children.forEach((child) => {
        processGroupOrder(allGroups, child, group.IdGroup, listGroups);
      });
    }
  }
};

// Busca todos os grupos e subgrupos a partir de um grupo base passado
export const getGroups = async (req, res) => {
  try {
    const { IdEnterprise, CodeGroupBase } = req.query;

    if (!IdEnterprise || !CodeGroupBase) {
      return res.status(400).json(nullFields);
    }

    const allGroups = await fetchGroups(IdEnterprise);
    const groupBase =
      allGroups.find((group) => group.Code === CodeGroupBase) || null;

    if (!groupBase) {
      return res
        .status(404)
        .json(notFound({ message: "Grupo base não encontrado" }));
    }

    const groupOrder = await fetchGroupsOrder(groupBase);

    if (!groupOrder) {
      return res
        .status(404)
        .json(notFound({ message: "Grupo base não encontrado" }));
    }

    let listGroups = [];
    processGroupOrder(allGroups, groupOrder, null, listGroups);

    res.status(200).json(successAction({ result: listGroups }));
  } catch (error) {
    console.log(error);
    res.status(500).json(serverError({ error: error }));
  }
};
