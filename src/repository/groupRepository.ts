import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { Group, OrderGroup } from "../types.js";

// Busca as ordems dos grupos e subgrupos a partir de um grupo base passado
export const getGroupOrder = async (groupBase: Group, IdEnterprise: number) => {
  try {
    const pool = await getConnection();
    if (pool instanceof Error) return pool;

    const result = await pool
      .request()
      .input("IdEnterprise", sql.Int, IdEnterprise).query(`
        SELECT "Order" FROM GroupsOrder where IdEnterprise = @IdEnterprise;
      `);

    const groupsOrderString = result.recordset[0].Order;
    const groupsOrder: OrderGroup[] | null = JSON.parse(groupsOrderString);

    if (groupsOrder === null)
      return new Error("Nenhuma ordem de grupo encontrada");

    const idGroupBase = groupBase.IdGroupServer.toString();
    const groupOrder: OrderGroup | null =
      groupsOrder.find(
        (order: OrderGroup) => order.id.toString() === idGroupBase.toString()
      ) || null;

    if (groupOrder === null)
      return new Error(
        "Nenhuma ordem de grupo encontrada para este grupo base"
      );

    return groupOrder;
  } catch (error) {
    console.error("Erro ao buscar a ordem dos grupos:", error);
    return error as Error;
  }
};

// Busca todos os grupos cadastrados
export const getAllGroups = async (IdEnterprise: number) => {
  const pool = await getConnection();

  if (pool instanceof Error) {
    return pool;
  }

  const result = await pool
    .request()
    .input("IdEnterprise", sql.Int, IdEnterprise).query(`
      SELECT
        IdGroup as IdGroupServer, Code, Description, Image
      FROM
        Groups
      WHERE
        Notes LIKE '%Cardapio=Sim;%' AND Category = 'PROD' AND IdEnterprise = @IdEnterprise
    `);

  if (result.recordset.length === 0) {
    return new Error("Nenhum grupo encontrado");
  }

  return result.recordset as Group[];
};

// Monta o objeto de grupo com o Id do grupo pai, se houver
const buildGroup = (group: Group, paternIdGroup: number | null): Group => {
  return {
    ...group,
    ParentIdGroup: paternIdGroup,
  };
};

// Função recursiva para processar os grupos e subgrupos
const processGroupOrder = (
  allGroups: Group[],
  groupOrder: OrderGroup,
  paternIdGroup: number | null,
  listGroups: Group[]
) => {
  const group = allGroups.find(
    (g) => g.IdGroupServer.toString() === groupOrder.id.toString()
  );

  if (group !== undefined) {
    listGroups.push(buildGroup(group, paternIdGroup));

    // Processa subgrupos recursivamente, se existirem
    if (groupOrder.children && groupOrder.children.length > 0) {
      groupOrder.children.forEach((child) => {
        processGroupOrder(allGroups, child, group.IdGroupServer, listGroups);
      });
    }
  }
  return listGroups;
};

export const getGroups = async (
  IdEnterprise: number,
  CodeGruoupBase: string
): Promise<Group[] | Error> => {
  try {
    const allGroups = await getAllGroups(IdEnterprise);
    if (allGroups instanceof Error) return allGroups;

    const groupBase = allGroups.find((g) => g.Code === CodeGruoupBase);
    if (!groupBase) return new Error("Grupo base não encontrado");

    const groupOrder = await getGroupOrder(groupBase, IdEnterprise);
    if (groupOrder instanceof Error) return groupOrder;

    return processGroupOrder(allGroups, groupOrder, null, []);
  } catch (error) {
    console.error(
      "Erro ao buscar os grupos e subgrupos do banco de dados: ",
      error
    );
    return error as Error;
  }
};
