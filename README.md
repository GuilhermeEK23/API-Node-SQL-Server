Esta API está usando o padrão Problem Details for HTTP APIs (RFC 7807) para retornar erros.

Que segue o seguinte padrão de respota JSON como exemplo

{
  "status": 400,
  "type": "https://httpstatuses.com/400"
  "title": "Bad Request",
  "detail": "The request was invalid or cannot be otherwise served."
}

- Status(200) Para operações de leitura, atualização, ou exclusão bem-sucedidas (GET, PUT, DELETE).
- Status(201) Para operações de criação bem-sucedidas (POST).
- Status(400) Para requisições inválidas ou malformadas. Por exemplo, campos obrigatórios ausentes, tipos de dados incorretos, etc.
- Status(404) Para recursos não encontrados. Por exemplo, tentativa de acessar um recurso que não existe no sistema.
- Status(500) Para erros internos do servidor. Por exemplo, falhas de banco de dados, erros de servidor, etc.