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
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  /* ---------- Indicar para um amigo (menu de compartilhar do celular) ---------- */
  const indicar = $("[data-indicar]");
  if (indicar && navigator.share) {
    indicar.hidden = false;
    indicar.addEventListener("click", () => {
      const url = ($('link[rel="canonical"]') || location).href;
      navigator
        .share({ title: "Genival Groomer Petshop", text: "Banho e tosa com carinho em Santana, SP. Olha os preços e agenda pelo WhatsApp 🐾", url })
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
  const plataforma = ehIOS ? "ios" : ehAndroid ? "android" : "pc";
  let convite = null; // evento "beforeinstallprompt": botão de instalar automático (Chrome, Edge, Samsung)

  secao.hidden = false;

  const dicas = {
    pronto: "Grátis · instala em segundos",
    ios: "No iPhone: Compartilhar e depois Adicionar à Tela de Início",
    android: "No menu do navegador: Instalar app",
    pc: "Funciona no celular e no computador",
    social: "Abra no navegador (Chrome ou Safari) para instalar",
  };
  const atualizarDica = () => (dica.textContent = convite ? dicas.pronto : ehRedeSocial ? dicas.social : dicas[plataforma]);
  atualizarDica();

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // usamos o nosso botão no lugar da faixa padrão do navegador
    convite = e;
    atualizarDica();
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
    // Sem botão automático (iPhone, Firefox...): mostra o passo a passo
    sheet.querySelectorAll("[data-passos]").forEach((ol) => (ol.hidden = ol.dataset.passos !== plataforma));
    sheet.querySelector("[data-social]").hidden = !ehRedeSocial;
    sheet.showModal();
  }

  $$("[data-instalar]").forEach((b) =>
    b.addEventListener("click", () => {
      fecharToast(false);
      instalar();
    })
  );
  $$("[data-fechar]").forEach((b) => b.addEventListener("click", () => sheet.close()));
  sheet.addEventListener("click", (e) => e.target === sheet && sheet.close()); // toque fora fecha

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
