export const layoutPrint1 = (printer, orderNumber, user, products) => {
  printer
    // Cabeçalho
    .align("ct")
    .font("B")
    .style("b")
    .size(1, 1)
    .text(`COMANDA ${orderNumber}`)
    .size(0.5, 0.5)
    .text("\n")
    .style("normal")
    .align("lt")
    .text(`Usuário: ${user.Name}`)
    .text(`Email: ${user.Email}`)
    .text("\n")

    .font("B")
    .style("b")
    .align("ct")
    .size(1, 1)
    .text("PRODUTOS")
    .text("\n");

  // Detalhes dos produtos
  products.forEach((produto, index) => {
    printer
      // .align("lt")
      // .font("A")
      // .size(0.5, 0.5)
      // .style("B")
      // .text(`Produto ${index + 1}:`)
      // .tableCustom(
      //   [
      //     { text: `  Descrição: `, align: "LEFT", width: 0.3, style: "B" },
      //     { text: `${produto.Description}`, align: "RIGTH", width: 0.7 },
      //     { text: `  Preço: `, align: "LEFT", width: 0.3, style: "B" },
      //     {
      //       text: `R$ ${produto.SalePrice.toFixed(2)}`,
      //       align: "RIGTH",
      //       width: 0.7,
      //     },
      //     { text: `  Quantidade: `, align: "LEFT", width: 0.3, style: "B" },
      //     { text: `${produto.quantity}`, align: "RIGTH", width: 0.7 },
      //     { text: `  Total: `, align: "LEFT", width: 0.3, style: "B" },
      //     {
      //       text: `R$ ${(produto.SalePrice * produto.quantity).toFixed(2)}`,
      //       align: "RIGTH",
      //       width: 0.7,
      //     },
      //   ],
      //   { encoding: "CP850", size: [1, 1] } // Optional
      // )
      // .text("\n");

      .align("lt")
      .style("b")
      .size(0.5, 0.5)
      .text(`Produto ${index + 1}:`)
      .style("normal")
      .size(0.5, 0.5)
      .text(`  Descrição: ${produto.Description}`)
      .text(`  Código: ${produto.Code}`)
      .text(`  Preço: R$ ${produto.SalePrice.toFixed(2)}`)
      .text(`  Quantidade: ${produto.quantity}`)
      .text(`  Total: R$ ${(produto.SalePrice * produto.quantity).toFixed(2)}`)
      .text("\n");
  });

  // Rodapé
  printer.style("b").align("ct").text("*** FIM DO PEDIDO ***").text("\n").cut();
};
