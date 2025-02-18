export const nullFields = (message: string) => ({
  status: 400,
  message: message || "Campos nulos ou vazios",
  success: false,
});

export const invalidFields = (message: string) => ({
  status: 400,
  message: message || "Campos inválidos",
  success: false,
});

export const serverError = (message: string) => ({
  status: 500,
  message: "Erro interno do servidor",
  success: false,
});

export const successCreated = (message: string) => ({
  status: 201,
  message: message || "Criado com sucesso",
  success: true,
});

export const successAction = (message: string, result: any) => ({
  status: 200,
  message: message || "Operação realizada com sucesso",
  success: true,
  result: result,
});

export const notFound = (message: string) => ({
  status: 404,
  message: message || "Não encontrado",
  success: false,
});
