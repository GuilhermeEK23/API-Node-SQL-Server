import app from "./app.js";
import { configServer } from "./config.js";

app.listen(configServer.port);

console.log("Servidor iniciado na porta " + configServer.port);
