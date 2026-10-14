// Confere o config.js antes de publicar.
// Uso: node verificar.mjs            (ou: node verificar.mjs outro-arquivo.js)
// Também roda sozinho a cada commit (pasta .githooks) e no GitHub (.github/workflows).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const pasta = dirname(fileURLToPath(import.meta.url));
const arquivo = process.argv[2] || join(pasta, "config.js");
const vermelho = (t) => `\x1b[31m${t}\x1b[0m`;
const amarelo = (t) => `\x1b[33m${t}\x1b[0m`;
const verde = (t) => `\x1b[32m${t}\x1b[0m`;

const ctx = vm.createContext({});
vm.runInContext(readFileSync(join(pasta, "conferir.js"), "utf8"), ctx, { filename: "conferir.js" });

// 1) O arquivo abre? (vírgula ou aspas faltando quebram tudo)
const fonte = readFileSync(arquivo, "utf8");
try {
  vm.runInContext(`${fonte}\n;globalThis.__CONFIG = typeof CONFIG === "undefined" ? undefined : CONFIG;`, ctx, {
    filename: "config.js",
    timeout: 1000,
  });
} catch (e) {
  const linha = +((String(e.stack).match(/config\.js:(\d+)/) || [])[1] || 0);
  const linhas = fonte.split(/\r?\n/);
  console.log(vermelho("\n✖ O config.js tem um erro de escrita e o site não conseguiria ler os preços.\n"));
  if (linha) {
    for (let n = Math.max(1, linha - 2); n <= Math.min(linhas.length, linha); n++)
      console.log(`${n === linha ? vermelho(">") : " "} ${String(n).padStart(3)} | ${linhas[n - 1]}`);
    console.log(`\nO problema está na linha ${linha} ou logo antes dela.`);
  }
  console.log("Dicas: faltou uma vírgula no fim da linha anterior? Alguma aspa ficou aberta? Um { ou [ sem fechar?");
  console.log(`(detalhe técnico: ${e.message})\n`);
  process.exit(1);
}

// 2) As informações estão certas?
const { config, erros, avisos } = ctx.conferirConfig(ctx.__CONFIG);

// 3) Trava do WhatsApp (opcional): o número oficial fica guardado no GitHub, fora do site.
//    Se alguém trocar o número no config.js sem trocar lá, o GitHub avisa por email.
const oficial = (process.env.WHATSAPP_OFICIAL || "").replace(/\D/g, "");
if (oficial && config.whatsapp !== oficial)
  erros.push(
    `ALERTA: o WhatsApp do config.js (${config.whatsapp || "vazio"}) é diferente do número oficial cadastrado no GitHub. ` +
      "Se foi você que trocou, atualize a variável WHATSAPP_OFICIAL. Se não foi, alguém mexeu no site: troque sua senha do GitHub agora!"
  );

// 4) O bairro também aparece no título da página e na prévia do link (index.html)
try {
  const html = readFileSync(join(pasta, "index.html"), "utf8");
  const titulo = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  if (config.endereco.bairro && !titulo.includes(config.endereco.bairro))
    avisos.push(`O bairro "${config.endereco.bairro}" não aparece no título do index.html. Se mudou de bairro, troque também no <title> e nas descrições do topo do index.html.`);
} catch (e) {}

if (avisos.length) {
  console.log(amarelo(`\n⚠ ${avisos.length} aviso(s):`));
  avisos.forEach((a) => console.log(amarelo("  • ") + a));
}
if (erros.length) {
  console.log(vermelho(`\n✖ ${erros.length} erro(s) no config.js:`));
  erros.forEach((a) => console.log(vermelho("  • ") + a));
  console.log("\nCorrija e rode de novo:  node verificar.mjs\n");
  process.exit(1);
}

const precos = config.servicos.flatMap((s) => Object.values(s.precos));
console.log(
  verde("\n✔ config.js conferido: tudo certo!") +
    `\n  ${config.servicos.length} serviços (de R$ ${Math.min(...precos)} a R$ ${Math.max(...precos)}), ${config.adicionais.length} extras, ` +
    `WhatsApp ${config.whatsapp}\n`
);
