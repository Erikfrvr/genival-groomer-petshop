/* =========================================================
   CONFIGURAÇÕES DO SITE — edite só este arquivo
   para trocar nome, WhatsApp, serviços e valores.
   ========================================================= */

const CONFIG = {
  // Nome dele (aparece no topo, na história e no rodapé)
  nome: "Genival",

  // WhatsApp principal (botões verdes): só números, com 55 + DDD + número
  whatsapp: "5511970672297",

  // Contatos que aparecem na seção "Contato" e no rodapé
  whatsapp2: "5511939617274",
  email: "sgenivalramos@gmail.com",
  endereco: "Rua Dona Elfrida, 252 - Santana, São Paulo - SP",

  // Ano em que começou na área pet (os "anos de experiência" são calculados sozinhos)
  naAreaPetDesde: 2001,

  // Mensagem enviada pelos botões gerais de WhatsApp
  mensagemPadrao: "Olá! Vi seu site e gostaria de agendar um banho para meu pet 🐶",

  // Portes (a chave é usada nos preços dos serviços)
  portes: [
    { id: "p", nome: "Pequeno", detalhe: "até 10 kg", icone: "🐕" },
    { id: "m", nome: "Médio", detalhe: "10 a 25 kg", icone: "🐕‍🦺" },
    { id: "g", nome: "Grande", detalhe: "acima de 25 kg", icone: "🦮" },
  ],

  // Serviços principais — fotos na pasta /images
  //   fotos: { p, m, g } -> foto de cada porte (troca quando o cliente escolhe o porte)
  //   foto: "..."      -> foto reserva, usada se a foto do porte não existir
  servicos: [
    {
      nome: "Banho",
      fotos: { p: "images/banho-p.jpg", m: "images/banho-m.jpg", g: "images/banho-g.jpg" },
      descricao: "Shampoo e condicionador para cada tipo de pelo, secagem cuidadosa, escovação, perfume, limpeza de ouvidos e corte de unhas.",
      duracao: "1h a 1h30",
      precos: { p: 60, m: 90, g: 130 },
      aPartirDe: true,
    },
    {
      nome: "Banho + Tosa Higiênica",
      fotos: { p: "images/banho-tosa-higienica-p.jpg", m: "images/banho-tosa-higienica-m.jpg", g: "images/banho-tosa-higienica-g.jpg" },
      descricao: "O banho completo + aparo das patinhas, barriga e região íntima. Mais conforto e higiene no dia a dia.",
      duracao: "1h30 a 2h",
      precos: { p: 80, m: 100, g: 140 },
      aPartirDe: true,
      destaque: "Mais pedido",
    },
    {
      nome: "Banho + Tosa na Máquina",
      fotos: { p: "images/tosa-maquina-p.jpg", m: "images/tosa-maquina-m.jpg", g: "images/tosa-maquina-g.jpg" },
      descricao: "Banho completo + tosa uniforme em todo o corpo na altura que você preferir. Prático e fresquinho.",
      duracao: "2h a 2h30",
      precos: { p: 110, m: 130, g: 180 },
      aPartirDe: true,
    },
    {
      nome: "Banho + Tosa na Tesoura",
      fotos: { p: "images/tosa-tesoura-p.jpg", m: "images/tosa-tesoura-m.jpg", g: "images/tosa-tesoura-g.jpg" },
      descricao: "Acabamento artesanal feito à mão, respeitando o padrão da raça ou o estilo que você quiser.",
      duracao: "2h30 a 3h",
      precos: { p: 150, m: 180, g: 250 },
      aPartirDe: true,
      destaque: "Premium",
    },
    {
      nome: "Banho e Tosa Bebê",
      fotos: { p: "images/tosa-bebe-p.jpg", m: "images/tosa-bebe-m.jpg", g: "images/tosa-bebe-g.jpg" },
      descricao: "O primeiro banho e tosa do filhote, com produtos suaves e muita paciência para ele se acostumar sem medo.",
      duracao: "1h a 1h30",
      precos: { p: 50, m: 60, g: 75 },
    },
    {
      nome: "Hidratação",
      fotos: { p: "images/hidratacao-p.jpg", m: "images/hidratacao-m.jpg", g: "images/hidratacao-g.jpg" },
      descricao: "Máscara hidratante que deixa o pelo macio, brilhante e fácil de pentear. Adicione a qualquer banho.",
      duracao: "+ 15 min",
      precos: { p: 30, m: 40, g: 60 },
    },
  ],

  // Adicionais (preço único). Use "a partir de" quando variar.
  adicionais: [
    { nome: "Tosa higiênica avulsa", preco: 30, aPartirDe: true, icone: "✂️" },
    { nome: "Corte de unhas avulso", preco: 30, aPartirDe: true, icone: "💅" },
    { nome: "Escovação de dentes", preco: 15, icone: "🦷" },
    { nome: "Desembolo de nós", preco: 20, aPartirDe: true, icone: "🪮" },
    { nome: "Remoção de subpelo", preco: 30, aPartirDe: true, icone: "🌬️" },
    { nome: "Banho antipulgas", preco: 20, icone: "🛡️" },
    { nome: "Lacinho ou gravatinha", preco: 0, icone: "🎀" },
  ],
};
