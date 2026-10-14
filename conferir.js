/* =========================================================
   CONFERE O config.js (não precisa mexer aqui)
   - No site: deixa de fora o que estiver errado, sem quebrar a página.
   - No computador (node verificar.mjs) e no GitHub: mostra os erros antes de publicar.
   ========================================================= */
function conferirConfig(bruto) {
  const erros = [];
  const avisos = [];
  const C = bruto && typeof bruto === "object" ? bruto : {};
  if (C !== bruto) erros.push("Não encontrei o CONFIG no config.js.");

  const ehObjeto = (v) => v && typeof v === "object" && !Array.isArray(v);

  // Campo com nome digitado errado (ex.: "preco" no lugar de "precos")
  const camposConhecidos = (obj, conhecidos, onde) =>
    Object.keys(obj).forEach((k) => {
      if (!conhecidos.includes(k)) avisos.push(`${onde}: não conheço o campo "${k}" (erro de digitação?). Ele foi ignorado.`);
    });

  const texto = (v, onde, { max = 200, opcional = false } = {}) => {
    if (v === undefined || v === null || v === "") {
      if (!opcional) erros.push(`${onde}: está vazio.`);
      return "";
    }
    if (typeof v !== "string") {
      erros.push(`${onde}: o texto precisa estar "entre aspas".`);
      return "";
    }
    const t = v.trim();
    if (t.length > max) avisos.push(`${onde}: texto muito longo (máximo ${max} letras), foi cortado.`);
    return t.slice(0, max);
  };

  const preco = (v, onde) => {
    if (typeof v === "string" && /^\s*(R\$)?\s*\d+([.,]\d{1,2})?\s*$/.test(v)) {
      avisos.push(`${onde}: escreva o preço sem aspas e sem "R$" (ex.: 60).`);
      v = Number(v.replace(/R\$|\s/g, "").replace(",", "."));
    }
    if (typeof v !== "number" || !isFinite(v) || v < 0 || v > 10000) {
      erros.push(`${onde}: preço inválido. Use só o número, sem aspas (ex.: 60).`);
      return null;
    }
    return v;
  };

  const inteiro = (v, onde, min, max) => {
    if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) {
      erros.push(`${onde}: use um número inteiro entre ${min} e ${max}, sem aspas.`);
      return null;
    }
    return v;
  };

  const whatsapp = (v, onde, opcional) => {
    const n = String(v === undefined || v === null ? "" : v).replace(/\D/g, "");
    if (!n) {
      if (!opcional) erros.push(`${onde}: está vazio.`);
      return "";
    }
    if (!/^55\d{10,11}$/.test(n)) {
      (opcional ? avisos : erros).push(`${onde}: número inválido. Use 55 + DDD + número, só os dígitos (ex.: "5511970672297").`);
      return "";
    }
    return n;
  };

  // Fotos só da pasta images/ do próprio site
  const foto = (v, onde) => {
    if (typeof v === "string" && /^images\/[\w\-./]+\.(webp|jpe?g|png|avif)$/i.test(v) && !v.includes("..")) return v;
    avisos.push(`${onde}: foto inválida. Use o caminho da pasta images/ (ex.: "images/banho-p.webp"). A foto foi ignorada.`);
    return "";
  };

  const porPorte = (obj, portes, onde, cada) => {
    const saida = {};
    if (!ehObjeto(obj)) return null;
    for (const p of portes) {
      const v = cada(obj[p.id], `${onde} (${p.nome})`);
      if (v === null) return null;
      saida[p.id] = v;
    }
    Object.keys(obj).forEach((k) => {
      if (!portes.some((p) => p.id === k)) avisos.push(`${onde}: o porte "${k}" não existe na lista de portes. Foi ignorado.`);
    });
    return saida;
  };

  camposConhecidos(C, ["nome", "whatsapp", "whatsapp2", "email", "endereco", "naAreaPetDesde", "petsPorMes", "pagamento", "mensagemPadrao", "portes", "servicos", "adicionais"], "config.js");

  /* ---------- Contatos ---------- */
  const config = {
    nome: texto(C.nome, "nome", { max: 40 }) || "Genival",
    whatsapp: whatsapp(C.whatsapp, "whatsapp", false),
    whatsapp2: whatsapp(C.whatsapp2, "whatsapp2", true),
    email: "",
  };
  const email = texto(C.email, "email", { max: 80, opcional: true });
  if (email && /^[^\s@<>"'(),;:]+@[^\s@<>"'(),;:]+\.[a-z]{2,}$/i.test(email)) config.email = email;
  else if (email) avisos.push(`email: "${email}" não parece um email válido. Ele não vai aparecer no site.`);

  /* ---------- Endereço ---------- */
  const end = ehObjeto(C.endereco) ? C.endereco : {};
  if (!ehObjeto(C.endereco)) erros.push('endereco: precisa ter rua, bairro, cidade e estado (veja o modelo no config.js).');
  else camposConhecidos(end, ["rua", "bairro", "cidade", "estado"], "endereco");
  config.endereco = {
    rua: texto(end.rua, "endereco.rua", { max: 80 }),
    bairro: texto(end.bairro, "endereco.bairro", { max: 40 }),
    cidade: texto(end.cidade, "endereco.cidade", { max: 40 }),
    estado: texto(end.estado, "endereco.estado", { max: 2 }).toUpperCase(),
  };
  if (config.endereco.estado && !/^[A-Z]{2}$/.test(config.endereco.estado)) avisos.push('endereco.estado: use a sigla com 2 letras (ex.: "SP").');

  /* ---------- Sobre ---------- */
  config.naAreaPetDesde = inteiro(C.naAreaPetDesde, "naAreaPetDesde", 1950, new Date().getFullYear()) || new Date().getFullYear();
  config.petsPorMes = C.petsPorMes === undefined ? 0 : inteiro(C.petsPorMes, "petsPorMes", 0, 100000) || 0;
  config.pagamento = texto(C.pagamento, "pagamento", { max: 120, opcional: true });
  config.mensagemPadrao =
    texto(C.mensagemPadrao, "mensagemPadrao", { max: 300, opcional: true }) || `Olá, ${config.nome}! Vim pelo site e gostaria de agendar um horário para o meu pet 🐾`;

  /* ---------- Portes ---------- */
  config.portes = [];
  if (!Array.isArray(C.portes) || !C.portes.length) erros.push("portes: a lista de portes está vazia.");
  else
    C.portes.forEach((p, i) => {
      const onde = `portes, item ${i + 1}`;
      if (!ehObjeto(p)) return erros.push(`${onde}: formato inválido.`);
      camposConhecidos(p, ["id", "nome", "detalhe"], onde);
      const id = typeof p.id === "string" ? p.id.trim() : "";
      if (!/^[a-z0-9]{1,10}$/.test(id)) return erros.push(`${onde}: o id precisa ser uma letra curta em minúsculas (ex.: "p").`);
      if (config.portes.some((x) => x.id === id)) return erros.push(`${onde}: o id "${id}" está repetido.`);
      config.portes.push({ id, nome: texto(p.nome, `${onde} (nome)`, { max: 20 }), detalhe: texto(p.detalhe, `${onde} (detalhe)`, { max: 30 }) });
    });
  if (!config.portes.length) config.portes.push({ id: "p", nome: "Único", detalhe: "" });

  /* ---------- Serviços ---------- */
  config.servicos = [];
  if (!Array.isArray(C.servicos)) erros.push("servicos: a lista de serviços não foi encontrada.");
  else
    C.servicos.forEach((s, i) => {
      const onde = `servicos, item ${i + 1}${s && typeof s.nome === "string" ? ` ("${s.nome}")` : ""}`;
      if (!ehObjeto(s)) return erros.push(`${onde}: formato inválido.`);
      camposConhecidos(s, ["nome", "resumo", "precos", "aPartirDe", "destaque", "fotos", "foto", "foco"], onde);
      const nome = texto(s.nome, `${onde} (nome)`, { max: 60 });
      if (!nome) return;
      if (config.servicos.some((x) => x.nome === nome)) return erros.push(`${onde}: já existe outro serviço com esse nome.`);
      const precos = porPorte(s.precos, config.portes, `${onde} (precos)`, preco);
      if (!precos) return erros.push(`${onde}: precisa de "precos" com o valor de cada porte (${config.portes.map((p) => p.id).join(", ")}). O serviço ficou de fora do site.`);
      const item = {
        nome,
        resumo: texto(s.resumo, `${onde} (resumo)`, { max: 140, opcional: true }),
        precos,
        aPartirDe: s.aPartirDe === true,
        destaque: texto(s.destaque, `${onde} (destaque)`, { max: 20, opcional: true }),
        fotos: {},
        foto: s.foto ? foto(s.foto, `${onde} (foto)`) : "",
        foco: {},
      };
      if (s.aPartirDe !== undefined && typeof s.aPartirDe !== "boolean") avisos.push(`${onde}: aPartirDe deve ser true ou false, sem aspas.`);
      if (ehObjeto(s.fotos)) Object.keys(s.fotos).forEach((k) => (item.fotos[k] = foto(s.fotos[k], `${onde} (fotos.${k})`)));
      if (ehObjeto(s.foco))
        Object.keys(s.foco).forEach((k) => {
          if (typeof s.foco[k] === "string" && /^\d{1,3}%$/.test(s.foco[k]) && parseInt(s.foco[k], 10) <= 100) item.foco[k] = s.foco[k];
          else avisos.push(`${onde} (foco.${k}): use uma porcentagem de "0%" a "100%".`);
        });
      config.servicos.push(item);
    });
  if (!config.servicos.length) erros.push("servicos: nenhum serviço válido. O site precisa de pelo menos um.");

  /* ---------- Extras ---------- */
  config.adicionais = [];
  if (C.adicionais !== undefined && !Array.isArray(C.adicionais)) erros.push("adicionais: formato inválido.");
  else
    (C.adicionais || []).forEach((a, i) => {
      const onde = `adicionais, item ${i + 1}${a && typeof a.nome === "string" ? ` ("${a.nome}")` : ""}`;
      if (!ehObjeto(a)) return erros.push(`${onde}: formato inválido.`);
      camposConhecidos(a, ["nome", "preco", "precos", "aPartirDe"], onde);
      const nome = texto(a.nome, `${onde} (nome)`, { max: 40 });
      if (!nome) return;
      const item = { nome, aPartirDe: a.aPartirDe === true };
      if (a.precos !== undefined) {
        item.precos = porPorte(a.precos, config.portes, `${onde} (precos)`, preco);
        if (!item.precos) return erros.push(`${onde}: precisa do valor de cada porte em "precos". O extra ficou de fora do site.`);
      } else {
        item.preco = preco(a.preco, `${onde} (preco)`);
        if (item.preco === null) return;
      }
      config.adicionais.push(item);
    });

  return { config, erros, avisos };
}

if (typeof module !== "undefined" && module.exports) module.exports = conferirConfig;
