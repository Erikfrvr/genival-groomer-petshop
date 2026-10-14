/* =========================================================
   SERVICE WORKER: faz o site funcionar como app
   - Páginas, estilos e scripts: busca sempre a versão nova na internet
     (confere com o servidor a cada visita, então preço mudado no config.js
     aparece na hora) e guarda uma cópia. Sem sinal, abre a cópia guardada.
   - Fotos: mostra a cópia guardada na hora e atualiza por trás.
   Só precisa mexer aqui se mudar a lista ESSENCIAIS
   (aí aumente o número do CACHE para todo mundo baixar de novo).

   Em caso de invasão: depois de recuperar a conta do GitHub, troque TODO este arquivo por
     self.addEventListener("install", () => self.skipWaiting());
     self.addEventListener("activate", (e) => e.waitUntil(
       caches.keys()
         .then((n) => Promise.all(n.filter((k) => k.startsWith("genival-")).map((k) => caches.delete(k))))
         .then(() => self.registration.unregister())
     ));
   Em até 24 h todo celular que abrir o site apaga as cópias guardadas.
   ========================================================= */

// O endereço erikfrvr.github.io é dividido com outros sites (Giovanna etc.), e o espaço
// de cópias guardadas também: este service worker só mexe nas cópias com este prefixo.
const PREFIXO = "genival-";
const CACHE = PREFIXO + "v2";

// Baixados já na instalação, para o app abrir completo mesmo sem internet
const ESSENCIAIS = [
  "./",
  "style.css",
  "config.js",
  "conferir.js",
  "script.js",
  "app.js",
  "manifest.webmanifest",
  "fonts/jakarta-latin.woff2",
  "fonts/fraunces-normal-latin.woff2",
  "fonts/fraunces-italic-latin.woff2",
  "favicon.png",
  "apple-touch-icon.png",
  "images/logo.webp",
  "images/avatar.webp",
  "images/perfil.webp",
];

const INICIO = new URL("./", self.location).href;
const ESPERA_REDE = 3500; // em internet muito lenta, abre a cópia guardada depois disso

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ESSENCIAIS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      // apaga só as versões antigas do Genival (nunca as cópias dos outros sites)
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith(PREFIXO) && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return; // WhatsApp, mapa etc. seguem direto

  // Uma cópia por arquivo: "style.css?v=9" fica guardado como "style.css",
  // e a página (com ou sem "#agendar", "?utm=..." etc.) fica guardada como o início
  const ehPagina = req.mode === "navigate" && /\/(index\.html)?$/.test(url.pathname);
  const chave = ehPagina ? INICIO : url.origin + url.pathname;

  if (req.destination === "image" || req.destination === "font") {
    e.respondWith(guardadoPrimeiro(e, req, chave));
  } else {
    e.respondWith(redePrimeiro(e, req, chave));
  }
});

// Só guarda resposta completa e do próprio site (nada de redirecionamento ou resposta opaca)
const guardar = (cache, chave) => (res) => {
  if (res.ok && res.type === "basic" && !res.redirected) cache.put(chave, res.clone());
  return res;
};

async function redePrimeiro(e, req, chave) {
  const cache = await caches.open(CACHE);
  // "no-cache": pergunta ao servidor se mudou (quando não mudou, a resposta é rapidinha)
  const rede = fetch(req.mode === "navigate" ? req : new Request(req, { cache: "no-cache" })).then(guardar(cache, chave));
  e.waitUntil(rede.catch(() => {}));

  try {
    if (req.mode !== "navigate") return await rede;
    // Página: se a internet demorar demais, abre a cópia guardada (a nova fica para a próxima)
    return await Promise.race([
      rede,
      new Promise((ok, falha) =>
        setTimeout(async () => {
          const salvo = await cache.match(chave);
          salvo ? ok(salvo) : rede.then(ok, falha);
        }, ESPERA_REDE)
      ),
    ]);
  } catch (erro) {
    const salvo = await cache.match(chave);
    if (salvo) return salvo;
    throw erro;
  }
}

async function guardadoPrimeiro(e, req, chave) {
  const cache = await caches.open(CACHE);
  const salvo = await cache.match(chave);
  const rede = fetch(req).then(guardar(cache, chave));
  if (salvo) {
    e.waitUntil(rede.catch(() => {}));
    return salvo;
  }
  return rede;
}
