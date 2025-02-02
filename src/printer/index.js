import escpos from "escpos";
import escposNetwork from "escpos-network";
import { layoutPrint1 } from "./layoutPrint1.js";

escpos.Network = escposNetwork;

const options = { encoding: "CP850" };

export const formatAndPrint = (data) => {
  const device = new escpos.Network("192.168.1.210", 9100);
  const printer = new escpos.Printer(device, options);
  const { user, orderNumber, products } = data;
  console.log(data, null, 2);

  device.open((error) => {
    if (error) {
      console.error("Erro ao abrir a conexão:", error);
      return;
    }

    try {
      console.log("Imprimindo...");
      // layoutPrint1(printer, orderNumber, user, products);
    } catch (err) {
      console.error("Erro durante a impressão:", err);
    } finally {
      printer.close(() => {
        device.close();
      });
    }
  });
};
