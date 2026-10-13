(function () {
  /* ---------- Segurança: não deixa outro site exibir esta página dentro de um iframe ---------- */
  if (window.top !== window.self) {
    try {
      window.top.location = window.self.location.href;
    } catch (e) {
      document.documentElement.hidden = true;
    }
    return;
  }

  const C = CONFIG;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Escapa textos do config.js antes de colocar no HTML
  const esc = (v) =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const soNumeros = (v) => String(v).replace(/\D/g, "");
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const waLink = (msg, numero = C.whatsapp) => `https://wa.me/${soNumeros(numero)}?text=${encodeURIComponent(msg)}`;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pulsar = (el) => {
    if (reduceMotion) return;
    el.classList.remove("bump");
    void el.offsetWidth; // reinicia a animação
    el.classList.add("bump");
  };

  /* ---------- Textos e contatos ---------- */
  const anos = new Date().getFullYear() - C.naAreaPetDesde;
  $$("[data-anos]").forEach((el) => (el.textContent = anos));
  $$("[data-desde]").forEach((el) => (el.textContent = C.naAreaPetDesde));
  $$("[data-wa]").forEach((el) => (el.href = waLink(C.mensagemPadrao)));
  $$("[data-wa2]").forEach((el) => (el.href = waLink(C.mensagemPadrao, C.whatsapp2)));

  const fone = (n) => soNumeros(n).replace(/^55(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
  $$("[data-fone]").forEach((el) => (el.textContent = fone(C[el.dataset.fone])));
  $$("[data-email]").forEach((el) => (el.href = `mailto:${encodeURI(C.email)}`));
  $$("[data-email-texto]").forEach((el) => (el.textContent = C.email));
  $$("[data-endereco]").forEach((el) => (el.textContent = C.endereco));
  $$("[data-mapa]").forEach(
    (el) => (el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.endereco)}`)
  );
  $("#ano").textContent = new Date().getFullYear();

  /* =========================================================
     AGENDAMENTO
     ========================================================= */
  const escolha = { porte: C.portes[0].id, servico: -1, extras: new Set(), pet: "" };

  const precoDe = (item) => (item.precos ? item.precos[escolha.porte] : item.preco) || 0;
  const precoTexto = (item) => {
    const v = precoDe(item);
    return v === 0 ? "cortesia" : (item.aPartirDe ? "a partir de " : "") + brl(v);
  };

  // Liga/desliga um botão de escolha (aria-pressed)
  const marcar = (grupo, botao) =>
    grupo.querySelectorAll("[aria-pressed]").forEach((b) => b.setAttribute("aria-pressed", b === botao));

  /* ---------- 1. Porte ---------- */
  const portesEl = $("#portes");
  portesEl.innerHTML = C.portes
    .map(
      (p, i) => `
      <button type="button" class="porte porte--${i}" data-porte="${esc(p.id)}" aria-pressed="${i === 0}">
        <span class="porte__ico"><svg><use href="#i-paw"/></svg></span>
        <strong>${esc(p.nome)}</strong>
        <small>${esc(p.detalhe)}</small>
      </button>`
    )
    .join("");

  portesEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-porte]");
    if (!b || b.dataset.porte === escolha.porte) return;
    escolha.porte = b.dataset.porte;
    marcar(portesEl, b);
    atualizarPrecos();
    atualizarResumo();
  });

  /* ---------- 2. Serviços ---------- */
  const fotoDe = (s) => (s.fotos && s.fotos[escolha.porte]) || s.foto || "";
  const servicosEl = $("#servicos");
  let etiquetas = 0; // alterna a cor das etiquetas: amarela, roxa, amarela...
  servicosEl.innerHTML = C.servicos
    .map(
      (s, i) => `
      <button type="button" class="svc" data-servico="${i}" aria-pressed="false">
        ${s.destaque ? `<span class="svc__tag${etiquetas++ % 2 ? " svc__tag--alt" : ""}">${esc(s.destaque)}</span>` : ""}
        <span class="svc__img"><img data-foto="${i}" src="${esc(fotoDe(s))}" alt="" width="560" height="350" loading="lazy" /></span>
        <span class="svc__name">${esc(s.nome)}</span>
        <span class="svc__desc">${esc(s.resumo || "")}</span>
        <span class="svc__time"><svg><use href="#i-clock"/></svg>${esc(s.duracao || "")}</span>
        <span class="svc__price"><small>${s.aPartirDe ? "a partir de" : "&nbsp;"}</small><strong data-preco="${i}"></strong></span>
        <span class="svc__radio" aria-hidden="true"><svg><use href="#i-check"/></svg></span>
      </button>`
    )
    .join("");

  servicosEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-servico]");
    if (!b) return;
    const i = +b.dataset.servico;
    escolha.servico = escolha.servico === i ? -1 : i; // tocar de novo desmarca
    marcar(servicosEl, escolha.servico === -1 ? null : b);
    atualizarResumo();
  });

  // Foto que não existe: tenta a foto reserva ("foto") e, sem ela, mostra o fundo colorido
  servicosEl.querySelectorAll("[data-foto]").forEach((img) => {
    img.addEventListener("error", () => {
      const reserva = C.servicos[img.dataset.foto].foto;
      if (reserva && img.getAttribute("src") !== reserva) img.src = reserva;
      else img.parentNode.classList.add("noimg");
    });
    img.addEventListener("load", () => img.parentNode.classList.remove("noimg"));
  });

  /* ---------- 3. Extras ---------- */
  const extrasEl = $("#extras");
  extrasEl.innerHTML = C.adicionais
    .map(
      (a, i) => `
      <button type="button" class="extra" data-extra="${i}" aria-pressed="false">
        <span class="extra__ico" aria-hidden="true"><svg class="i-off"><use href="#i-plus"/></svg><svg class="i-on"><use href="#i-check"/></svg></span>
        <span class="extra__name">${esc(a.nome)}</span>
        <span class="extra__price" data-preco-extra="${i}"></span>
      </button>`
    )
    .join("");

  extrasEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-extra]");
    if (!b) return;
    const i = +b.dataset.extra;
    const on = !escolha.extras.has(i);
    on ? escolha.extras.add(i) : escolha.extras.delete(i);
    b.setAttribute("aria-pressed", on);
    atualizarResumo();
  });

  /* ---------- Nome do pet (opcional) ----------
     Não tem escolha de dia: o Genival responde com os horários livres,
     por ordem de chegada — assim duas pessoas nunca marcam o mesmo horário. */
  $("#pet").addEventListener("input", (e) => {
    escolha.pet = e.target.value.trim();
    atualizarResumo();
  });

  /* ---------- Preços e fotos conforme o porte ---------- */
  function atualizarPrecos() {
    servicosEl.querySelectorAll("[data-preco]").forEach((el) => {
      el.textContent = brl(precoDe(C.servicos[el.dataset.preco]));
      pulsar(el);
    });
    extrasEl.querySelectorAll("[data-preco-extra]").forEach((el) => {
      const a = C.adicionais[el.dataset.precoExtra];
      const v = precoDe(a);
      el.textContent = v === 0 ? "Cortesia" : "+" + brl(v);
      el.classList.toggle("free", v === 0);
    });
    servicosEl.querySelectorAll("[data-foto]").forEach((img) => {
      const src = fotoDe(C.servicos[img.dataset.foto]);
      if (!src) return img.parentNode.classList.add("noimg");
      if (img.getAttribute("src") === src) return;
      img.src = src;
      if (!reduceMotion) img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease" });
    });
  }

  // Depois que a página carregar, baixa as fotos dos outros portes para a troca ser instantânea
  window.addEventListener("load", () => {
    if (navigator.connection && navigator.connection.saveData) return;
    setTimeout(() => {
      C.servicos.forEach((s) => Object.values(s.fotos || {}).forEach((src) => (new Image().src = src)));
    }, 2500);
  });

  /* ---------- Resumo, mensagem do WhatsApp e barra fixa ---------- */
  const lista = $("#resumo-lista");
  const totalEl = $("#resumo-total");
  const aPartirEl = $("#resumo-apartir");
  const resumoBtn = $("#resumo-btn");
  const bar = $("#bar");
  const barRotulo = $("#bar-rotulo");
  const barValor = $("#bar-valor");
  const barBtn = $("#bar-btn");
  const menorPreco = Math.min(...C.servicos.flatMap((s) => Object.values(s.precos)));

  const linha = (titulo, texto, valor, vazio) => {
    const row = document.createElement("div");
    row.className = "resumo__row" + (vazio ? " resumo__row--vazio" : "");
    const dt = document.createElement("dt");
    dt.textContent = titulo;
    const dd = document.createElement("dd");
    dd.textContent = texto;
    row.append(dt, dd);
    if (valor) {
      const v = document.createElement("dd");
      v.className = "v";
      v.textContent = valor;
      row.append(v);
    }
    return row;
  };

  const linkAberto = (a, href) => {
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.removeAttribute("aria-disabled");
  };
  const linkInterno = (a, href) => {
    a.href = href;
    a.removeAttribute("target");
  };

  let totalAnterior = null;

  function atualizarResumo() {
    const porte = C.portes.find((p) => p.id === escolha.porte);
    const servico = C.servicos[escolha.servico];
    const extras = [...escolha.extras].sort((a, b) => a - b).map((i) => C.adicionais[i]);
    const itens = (servico ? [servico] : []).concat(extras);
    const total = itens.reduce((t, it) => t + precoDe(it), 0);
    const aPartir = itens.some((it) => it.aPartirDe);

    // Lista do resumo
    const rows = [linha("Porte", `${porte.nome} · ${porte.detalhe}`)];
    rows.push(servico ? linha("Serviço", servico.nome, brl(precoDe(servico))) : linha("Serviço", "Escolha no passo 2", "", true));
    if (extras.length) {
      rows.push(linha("Extras", extras.map((a) => a.nome).join(", "), "+" + brl(extras.reduce((t, a) => t + precoDe(a), 0))));
    }
    lista.replaceChildren(...rows);

    aPartirEl.hidden = !aPartir;

    if (!itens.length) {
      totalEl.textContent = "—";
      resumoBtn.setAttribute("aria-disabled", "true");
      resumoBtn.lastElementChild.textContent = "Escolha um serviço";
      linkInterno(resumoBtn, "#passo-servico");

      barRotulo.textContent = "Banho e tosa a partir de";
      barValor.textContent = brl(menorPreco);
      barBtn.className = "btn btn--gold";
      barBtn.innerHTML = "<span>Agendar</span>";
      linkInterno(barBtn, "#passo-servico");
      totalAnterior = null;
      return;
    }

    // Mensagem pronta para o WhatsApp
    const msg = [`Olá, ${C.nome}! Vim pelo site e quero agendar 🐾`, ""];
    if (escolha.pet) msg.push(`*Pet:* ${escolha.pet}`);
    msg.push(`*Porte:* ${porte.nome} (${porte.detalhe})`);
    if (servico) msg.push(`*Serviço:* ${servico.nome} — ${precoTexto(servico)}`);
    if (extras.length) msg.push(`*Extras:* ${extras.map((a) => `${a.nome} (${precoTexto(a)})`).join(", ")}`);
    msg.push(`*Total estimado:* ${aPartir ? "a partir de " : ""}${brl(total)}`, "", "Quais dias e horários você tem livres?");
    const link = waLink(msg.join("\n"));

    totalEl.textContent = brl(total);
    resumoBtn.lastElementChild.textContent = "Enviar pedido no WhatsApp";
    linkAberto(resumoBtn, link);

    const nome = servico ? servico.nome : extras.map((a) => a.nome).join(" + ");
    const qtdExtras = servico ? extras.length : 0;
    barRotulo.textContent = `${nome}${qtdExtras ? ` + ${qtdExtras} extra${qtdExtras > 1 ? "s" : ""}` : ""} · ${porte.nome}${aPartir ? " · a partir de" : ""}`;
    barValor.textContent = brl(total);
    barBtn.className = "btn btn--wa";
    barBtn.innerHTML = '<svg><use href="#i-wa"/></svg><span>Agendar</span>';
    linkAberto(barBtn, link);

    if (total !== totalAnterior) {
      pulsar(totalEl);
      pulsar(barValor);
    }
    totalAnterior = total;
  }

  atualizarPrecos();
  atualizarResumo();

  /* ---------- Topo com sombra ao rolar + barra fixa do celular ---------- */
  const nav = $(".nav");
  const heroCtas = $(".hero__ctas");
  const resumo = $("#resumo");
  const contato = $("#contato");
  let resumoVisivel = false;
  let contatoVisivel = false;

  const onScroll = () => {
    nav.classList.toggle("nav--scrolled", window.scrollY > 8);
    const passouHero = heroCtas.getBoundingClientRect().bottom < 0;
    bar.classList.toggle("bar--show", passouHero && !resumoVisivel && !contatoVisivel);
  };
  // A barra some quando o resumo ou o contato estão na tela (eles já têm o botão)
  const vigia = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.target === resumo) resumoVisivel = e.isIntersecting;
      else contatoVisivel = e.isIntersecting;
    });
    onScroll();
  });
  vigia.observe(resumo);
  vigia.observe(contato);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Carrossel de fotos (setas no computador) ---------- */
  const carrossel = $("#carrossel");
  $$("[data-dir]").forEach((b) =>
    b.addEventListener("click", () => {
      const passo = carrossel.firstElementChild.getBoundingClientRect().width + 12;
      carrossel.scrollBy({ left: +b.dataset.dir * passo, behavior: reduceMotion ? "auto" : "smooth" });
    })
  );

  /* ---------- Animações ao aparecer ---------- */
  const reveals = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Dúvidas: abre uma por vez ---------- */
  const faqs = $$(".faq details");
  faqs.forEach((d) =>
    d.addEventListener("toggle", () => {
      if (d.open) faqs.forEach((o) => o !== d && (o.open = false));
    })
  );
})();
