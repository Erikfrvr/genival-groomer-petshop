/* =========================================================
   CONFIGURAÇÕES DO SITE: edite só este arquivo
   para trocar contatos, serviços, preços e dias de atendimento.
   ========================================================= */

const CONFIG = {
  nome: "Genival",

  // WhatsApp principal (recebe os agendamentos): só números, com 55 + DDD + número
  whatsapp: "5511970672297",

  // Contatos que aparecem no fim da página
  whatsapp2: "5511939617274",
  email: "sgenivalramos@gmail.com",
  endereco: "Rua Dona Elfrida, 252, Santana, São Paulo, SP",

  // Ano em que começou na área pet (os "anos de experiência" são calculados sozinhos)
  naAreaPetDesde: 2001,

  // Mensagem dos botões "Falar no WhatsApp"
  mensagemPadrao: "Olá, Genival! Vim pelo site e gostaria de agendar um horário para o meu pet 🐾",

  portes: [
    { id: "p", nome: "Pequeno", detalhe: "até 10 kg" },
    { id: "m", nome: "Médio", detalhe: "10 a 25 kg" },
    { id: "g", nome: "Grande", detalhe: "acima de 25 kg" },
  ],

  // Serviços principais (o cliente escolhe um)
  //   precos: valor de cada porte · aPartirDe: true mostra "a partir de"
  //   fotos: uma por porte (troca quando o cliente escolhe o porte)
  //   foco: onde o cão está na foto, da esquerda (0%) para a direita (100%).
  //         Deixa o cão centralizado no quadrinho do celular. Sem foco = 50% (meio)
  //   destaque: etiqueta opcional ("Mais pedido", "Premium"...)
  servicos: [
    {
      nome: "Banho",
      resumo: "Shampoo certo para o pelo, secagem, escovação, ouvidos e unhas.",
      precos: { p: 60, m: 90, g: 130 },
      aPartirDe: true,
      fotos: { p: "images/banho-p.webp", m: "images/banho-m.webp", g: "images/banho-g.webp" },
      foco: { p: "46%", m: "56%", g: "42%" },
    },
    {
      nome: "Banho + Tosa Higiênica",
      resumo: "Banho completo + aparo de patinhas, barriga e região íntima.",
      precos: { p: 80, m: 100, g: 140 },
      aPartirDe: true,
      destaque: "Mais pedido",
      fotos: { p: "images/banho-tosa-higienica-p.webp", m: "images/banho-tosa-higienica-m.webp", g: "images/banho-tosa-higienica-g.webp" },
      foco: { p: "42%", m: "36%", g: "14%" },
    },
    {
      nome: "Banho + Tosa na Máquina",
      resumo: "Banho completo + tosa uniforme no corpo todo, na altura que você quiser.",
      precos: { p: 110, m: 130, g: 180 },
      aPartirDe: true,
      fotos: { p: "images/tosa-maquina-p.webp", m: "images/tosa-maquina-m.webp", g: "images/tosa-maquina-g.webp" },
      foco: { p: "30%", m: "72%", g: "14%" },
    },
    {
      nome: "Banho + Tosa na Tesoura",
      resumo: "Banho completo + acabamento feito à mão, no padrão da raça ou do seu jeito.",
      precos: { p: 150, m: 180, g: 250 },
      aPartirDe: true,
      destaque: "Premium",
      fotos: { p: "images/tosa-tesoura-p.webp", m: "images/tosa-tesoura-m.webp", g: "images/tosa-tesoura-g.webp" },
      foco: { p: "46%", m: "42%", g: "62%" },
    },
    {
      nome: "Banho e Tosa Bebê",
      resumo: "O primeiro banho e tosa do filhote, com produtos suaves e muita paciência.",
      precos: { p: 50, m: 60, g: 75 },
      fotos: { p: "images/tosa-bebe-p.webp", m: "images/tosa-bebe-m.webp", g: "images/tosa-bebe-g.webp" },
      foco: { p: "52%", m: "64%", g: "46%" },
    },
  ],

  // Extras (o cliente pode marcar vários)
  //   preco: valor único · precos: valor por porte · preco: 0 mostra "Cortesia"
  adicionais: [
    { nome: "Hidratação", precos: { p: 30, m: 40, g: 60 } },
    { nome: "Escovação de dentes", preco: 15 },
    { nome: "Banho antipulgas", preco: 20 },
    { nome: "Desembolo de nós", preco: 20, aPartirDe: true },
    { nome: "Remoção de subpelo", preco: 30, aPartirDe: true },
    { nome: "Tosa higiênica avulsa", preco: 30, aPartirDe: true },
    { nome: "Corte de unhas avulso", preco: 30, aPartirDe: true },
    { nome: "Lacinho ou gravatinha", preco: 0 },
  ],
};
