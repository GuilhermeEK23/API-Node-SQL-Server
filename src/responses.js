export const nullFields = {
  status: 400,
  type: "Fields null",
  title: "Campos nulos",
  detail: "Todos os campos são obrigatórios.",
};

export const invalidFields = ({ message }) => {
  return {
    status: 400,
    type: "Invalid fields",
    title: "Campos inválidos",
    detail: message,
  };
};

export const unauthorized = ({ message }) => {
  return {
    status: 401,
    type: "Unauthorized",
    title: "Não autorizado",
    detail: message,
  };
};

export const notFound = ({ message }) => {
  return {
    status: 404,
    type: "Not Found",
    title: "Solicitação não encontrada",
    detail: message,
  };
};

export const serverError = ({ message }) => {
  return {
    status: 500,
    type: "Server error",
    title: "Erro no servidor",
    detail: message,
  };
};

export const successCreated = (message) => {
  return {
    status: 201,
    type: "Success created",
    title: "Criado com sucesso",
    detail: message,
  };
};

export const successAction = (message) => {
  return {
    status: 200,
    type: "Action success",
    title: "Ação realizada com sucesso",
    detail: message,
  };
};
