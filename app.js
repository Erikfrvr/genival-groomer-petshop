/* =========================================================
   APP: deixa o site ser instalado no celular como um aplicativo
   (ícone na tela inicial, abre em tela cheia e até sem internet)
   ========================================================= */
(function () {
  if (window.top !== window.self) return;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const ua = navigator.userAgent;
  const ehIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const ehAndroid = /android/i.test(ua);
  const ehRedeSocial = /Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok/i.test(ua); // navegador de dentro do app, não instala
  const ehApp = () => navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;

  const ler = (k) => {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  };
  const gravar = (k, v) => {
    try { localStorage.setItem(k, v); } catch (e) {}
  };

  /* ---------- Service worker: abre rápido e funciona sem internet ---------- */
  if ("serviceWorker" in navigator && window.isSecureContext) {
    // A página só aceita endereços de script por "políticas" conhecidas (Trusted Types): esta só libera o sw.js
    const swPolicy = window.trustedTypes
      ? trustedTypes.createPolicy("genival-sw", {
          createScriptURL: (u) => {
            if (u !== "sw.js") throw new TypeError("Endereço de service worker não permitido: " + u);
            return u;
          },
        })
      : null;
    const sw = swPolicy ? swPolicy.createScriptURL("sw.js") : "sw.js";
    window.addEventListener("load", () => navigator.serviceWorker.register(sw).catch(() => {}));
  }

  /* ---------- Indicar para um amigo (menu de compartilhar do celular) ---------- */
  const indicar = $("[data-indicar]");
  if (indicar && navigator.share) {
    indicar.hidden = false;
    indicar.addEventListener("click", () => {
      const url = ($('link[rel="canonical"]') || location).href;
      navigator
        .share({ title: "Genival Groomer Petshop", text: "Banho e tosa com muito carinho! Olha os preços e agenda pelo WhatsApp 🐾", url })
        .catch(() => {});
    });
  }

  // Aberto pelo ícone da tela inicial: já é app, não precisa convidar a instalar
  if (ehApp()) {
    document.documentElement.classList.add("is-app");
    return;
  }

  /* ---------- Instalar ---------- */
  const secao = $("#app");
  const dica = $("#app-dica");
  const ok = $("#app-ok");
  const sheet = $("#instalar");
  const toast = $("#toast-app");
  const plataforma = ehIOS ? (/CriOS/i.test(ua) ? "ios-chrome" : "ios") : ehAndroid ? "android" : "pc";
  // Chrome, Edge e Samsung têm botão de instalar automático, mas só o liberam depois que a pessoa
  // toca na página e fica uns 30 segundos nela (regra do navegador)
  const temBotaoAuto = "onbeforeinstallprompt" in window;
  const abriuEm = Date.now();
  let convite = null; // evento "beforeinstallprompt": quando chega, o botão instala direto

  secao.hidden = false;

  const dicas = {
    pronto: "Grátis · instala em segundos",
    ios: "No iPhone: Compartilhar e depois Adicionar à Tela de Início",
    "ios-chrome": "No Chrome do iPhone: Compartilhar e depois Adicionar à Tela de Início",
    android: "No menu do navegador: Instalar app",
    pc: "Funciona no celular e no computador",
    social: "Abra no navegador (Chrome ou Safari) para instalar",
  };
  const atualizarDica = () =>
    (dica.textContent = ehRedeSocial ? dicas.social : convite || temBotaoAuto ? dicas.pronto : dicas[plataforma]);
  atualizarDica();

  /* Espera do botão automático (dentro do passo a passo) */
  const auto = sheet.querySelector("[data-auto]");
  const espera = sheet.querySelector("[data-espera]");
  const esperaTitulo = sheet.querySelector("[data-espera-titulo]");
  const esperaTexto = sheet.querySelector("[data-espera-texto]");
  const esperaBarra = sheet.querySelector("[data-espera-barra]");
  const agora = sheet.querySelector("[data-instalar-agora]");
  let timerEspera;

  function esperarBotao() {
    agora.hidden = true;
    espera.hidden = false;
    espera.classList.remove("auto__espera--parou");
    esperaTitulo.textContent = "Preparando a instalação…";
    esperaTexto.textContent = "O navegador libera o botão em alguns segundos. Deixe esta tela aberta.";
    const falta = Math.max(4, 32 - (Date.now() - abriuEm) / 1000); // segundos até completar os ~30 s
    esperaBarra.style.animation = "none";
    void esperaBarra.offsetWidth; // reinicia a barrinha
    esperaBarra.style.animation = `encher ${falta}s linear forwards`;
    clearTimeout(timerEspera);
    timerEspera = setTimeout(() => {
      espera.classList.add("auto__espera--parou");
      esperaTitulo.textContent = "O botão não apareceu desta vez";
      esperaTexto.textContent = "Se o app já estiver instalado, procure o ícone Genival Pet na tela inicial. Se não, siga o passo a passo abaixo.";
    }, (falta + 8) * 1000);
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // usamos o nosso botão no lugar da faixa padrão do navegador
    convite = e;
    atualizarDica();
    // se o passo a passo estiver aberto esperando, aparece o "Instalar agora"
    clearTimeout(timerEspera);
    espera.hidden = true;
    agora.hidden = false;
  });

  function instalado() {
    convite = null;
    secao.classList.add("app--ok");
    secao.querySelector("[data-instalar]").hidden = true;
    dica.hidden = true;
    ok.hidden = false;
    fecharToast(false);
  }
  window.addEventListener("appinstalled", instalado);

  async function instalar() {
    if (convite) {
      const e = convite;
      convite = null; // o navegador só deixa usar uma vez
      try {
        e.prompt();
        const { outcome } = await e.userChoice;
        outcome === "accepted" ? instalado() : atualizarDica();
        return;
      } catch (erro) {
        atualizarDica(); // se o navegador recusar, segue para o passo a passo
      }
    }
    // Botão automático ainda não liberado (ou não existe, como no iPhone): mostra o passo a passo
    sheet.querySelectorAll("[data-passos]").forEach((ol) => (ol.hidden = ol.dataset.passos !== plataforma));
    sheet.querySelectorAll("[data-dica]").forEach((p) => (p.hidden = p.dataset.dica !== plataforma));
    sheet.querySelector("[data-social]").hidden = !ehRedeSocial;
    auto.hidden = !temBotaoAuto || ehRedeSocial;
    if (!auto.hidden) esperarBotao();
    sheet.showModal();
  }

  $$("[data-instalar]").forEach((b) =>
    b.addEventListener("click", () => {
      fecharToast(false);
      instalar();
    })
  );
  agora.addEventListener("click", () => {
    sheet.close();
    instalar(); // agora já tem o convite: abre a instalação do navegador
  });
  $$("[data-fechar]").forEach((b) => b.addEventListener("click", () => sheet.close()));
  sheet.addEventListener("click", (e) => e.target === sheet && sheet.close()); // toque fora fecha
  sheet.addEventListener("close", () => clearTimeout(timerEspera));

  /* ---------- Convite (toast): só em boas horas e sem insistir ----------
     1) quando a pessoa volta do WhatsApp depois de enviar o pedido
     2) quando é um cliente que já pediu antes (tem pedido salvo) */
  const CHAVE_TOAST = "genival:convite-app";
  const DIAS_SEM_INSISTIR = 10;
  const podeConvidar = () => {
    const ultima = +ler(CHAVE_TOAST) || 0;
    return (convite || ehIOS) && !ehRedeSocial && Date.now() - ultima > DIAS_SEM_INSISTIR * 864e5;
  };
  let timerToast;

  function abrirToast(titulo) {
    if (!podeConvidar() || !toast.hidden || sheet.open) return;
    $("#toast-titulo").textContent = titulo;
    toast.hidden = false;
    gravar(CHAVE_TOAST, Date.now());
    clearTimeout(timerToast);
    timerToast = setTimeout(() => fecharToast(false), 15000);
  }
  function fecharToast(animar = true) {
    clearTimeout(timerToast);
    if (toast.hidden) return;
    if (!animar) return (toast.hidden = true);
    toast.classList.add("toast--saindo");
    setTimeout(() => {
      toast.hidden = true;
      toast.classList.remove("toast--saindo");
    }, 300);
  }
  $("[data-fechar-toast]").addEventListener("click", () => fecharToast());

  // 1) Enviou o pedido (aviso vem do script.js) e voltou para o site
  let enviou = false;
  document.addEventListener("pedido-enviado", () => (enviou = true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && enviou) {
      enviou = false;
      setTimeout(() => abrirToast("Pedido enviado! 🐾"), 700);
    }
  });

  // 2) Cliente que volta
  if (ler("genival:ultimo-pedido")) setTimeout(() => abrirToast("Oi de novo! 🐾"), 6000);
})();
