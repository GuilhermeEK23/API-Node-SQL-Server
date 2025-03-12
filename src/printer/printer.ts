import { exec } from "child_process";
import fs from "fs";
import iconv from "iconv-lite";
import { Order } from "../types";

type printers = [{ [key: string]: string }];

const config: { printers: printers } = JSON.parse(
  fs.readFileSync("config.json", "utf-8")
);

// export const printOrder = (order: Order, printers: printers) => {};

export const printOrder = (pedido: Order, layout: { impressora: string }) => {
  const arquivo = "pedido.bin";

  // Gerar conteúdo formatado
  let conteudo = `
                COMANDA Nº ${pedido.Code}
  ===============================================

  Produtos:
`;

  pedido.Products?.forEach((item) => {
    conteudo += `  ${item.Description.padEnd(30)} x${item.Quantity}\n`;

    if (item.Optionals && item.Optionals.length > 0) {
      conteudo += `    -> Opcionais:\n`;
      item.Optionals.forEach((opcional) => {
        conteudo += `       - ${opcional.Description}\n`;
      });
    }

    conteudo += "\n";
  });

  conteudo += `  -----------------------------------------------
              Total: R$${pedido.Total.toFixed(2)}
  -----------------------------------------------
             Obrigado e bom trabalho!\n\n`;

  // Converter para CP860
  const buffer = Buffer.concat([
    Buffer.from("\x1B\x40", "binary"), // Resetar impressora
    iconv.encode(conteudo, "cp860"),
    Buffer.from("\x1D\x56\x41\x00", "binary"), // Corte de papel
  ]);

  // Salvar o arquivo binário
  fs.writeFileSync(arquivo, buffer);

  // Enviar o arquivo binário para a impressora
  const impressora = layout.impressora;
  exec(`copy /b ${arquivo} "${impressora}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Erro ao imprimir: ${stderr}`);
      return;
    }
    console.log("🖨️ Impressão enviada com sucesso:", stdout);
  });
};
