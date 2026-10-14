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

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ---------- Informações do config.js, já conferidas pelo conferir.js ----------
     O que estiver errado fica de fora (e aparece no console), sem quebrar a página. */
  if (typeof CONFIG === "undefined" || typeof conferirConfig !== "function") {
    // config.js com erro de escrita: avisa com educação no lugar dos preços
    document.documentElement.classList.add("sem-config");
    $("#falha-config").hidden = false;
    console.error("[config.js] O arquivo tem um erro de escrita. Rode: node verificar.mjs");
    return;
  }
  const conferido = conferirConfig(CONFIG);
  conferido.erros.forEach((m) => console.error("[config.js]", m));
  conferido.avisos.forEach((m) => console.warn("[config.js]", m));
  const C = conferido.config;

  // Monta os elementos com createElement e textContent (nunca com HTML em texto):
  // assim nenhum texto, nem do config.js, consegue virar código na página
  const el = (tag, attrs, ...filhos) => {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => v != null && e.setAttribute(k, v));
    e.append(...filhos.filter((f) => f != null && f !== ""));
    return e;
  };
  const icone = (id, classe) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    if (classe) svg.setAttribute("class", classe);
    svg.append(use);
    return svg;
  };

  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const waLink = (msg, numero = C.whatsapp) => `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pulsar = (el) => {
    if (reduceMotion) return;
    el.classList.remove("bump");
    void el.offsetWidth; // reinicia a animação
    el.classList.add("bump");
  };

  /* ---------- Textos e contatos ---------- */
  const texto = (sel, valor) => $$(sel).forEach((e) => (e.textContent = valor));
  const end = C.endereco;
  const enderecoCompleto = [end.rua, end.bairro, end.cidade, end.estado].filter(Boolean).join(", ");

  texto("[data-anos]", new Date().getFullYear() - C.naAreaPetDesde);
  texto("[data-desde]", C.naAreaPetDesde);
  texto("[data-bairro]", [end.bairro, end.estado].filter(Boolean).join(", "));
  texto("[data-pets]", `+${C.petsPorMes}`);
  if (!C.petsPorMes) $$("[data-pets]").forEach((e) => (e.closest(".chip").hidden = true));
  texto("[data-pagamento]", C.pagamento ? C.pagamento + "." : "Pergunte no WhatsApp.");
  $$("[data-portes-faq]").forEach((e) => {
    const partes = C.portes.map((p) => [el("strong", null, p.nome.toLowerCase()), p.detalhe ? ` (${p.detalhe})` : ""]);
    e.replaceChildren(
      "Pelo peso: ",
      ...partes.flatMap((p, i) => [...p, i < partes.length - 2 ? ", " : i === partes.length - 2 ? " e " : ""]),
      ". Na dúvida, me manda uma foto!"
    );
  });

  $$("[data-wa]").forEach((e) => (e.href = waLink(C.mensagemPadrao)));
  $$("[data-wa2]").forEach((e) => (C.whatsapp2 ? (e.href = waLink(C.mensagemPadrao, C.whatsapp2)) : (e.closest("li").hidden = true)));
  const fone = (n) => n.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, "($1) $2 $3");
  $$("[data-fone]").forEach((e) => (e.textContent = fone(C[e.dataset.fone] || "")));
  $$("[data-email]").forEach((e) => (C.email ? (e.href = `mailto:${encodeURIComponent(C.email).replace("%40", "@")}`) : (e.closest("li").hidden = true)));
  texto("[data-email-texto]", C.email);
  texto("[data-endereco]", enderecoCompleto);
  $$("[data-mapa]").forEach((e) => (e.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`));
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
  portesEl.append(
    ...C.portes.map((p, i) =>
      el(
        "button",
        { type: "button", class: `porte porte--${i}`, "data-porte": p.id, "aria-pressed": String(i === 0) },
        el("span", { class: "porte__ico" }, icone("i-paw")),
        el("strong", null, p.nome),
        el("small", null, p.detalhe)
      )
    )
  );

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
  // Posição do cão na foto, para ele ficar centralizado no quadrinho (via CSSOM: a CSP bloqueia style="")
  const focar = (img, s) => (img.style.objectPosition = `${(s.foco && s.foco[escolha.porte]) || "50%"} 50%`);
  const servicosEl = $("#servicos");
  let etiquetas = 0; // alterna a cor das etiquetas: dourada, couro, dourada...
  servicosEl.append(
    ...C.servicos.map((s, i) =>
      el(
        "button",
        { type: "button", class: "svc", "data-servico": i, "aria-pressed": "false" },
        s.destaque ? el("span", { class: "svc__tag" + (etiquetas++ % 2 ? " svc__tag--alt" : "") }, s.destaque) : null,
        el("span", { class: "svc__img" }, el("img", { "data-foto": i, src: fotoDe(s), alt: "", width: 560, height: 350, loading: "lazy" })),
        el(
          "span",
          { class: "svc__body" },
          el("span", { class: "svc__name" }, s.nome),
          el("span", { class: "svc__desc" }, s.resumo),
          el("span", { class: "svc__price" }, s.aPartirDe ? el("small", null, "a partir de") : null, el("strong", { "data-preco": i }))
        ),
        el("span", { class: "svc__radio", "aria-hidden": "true" }, icone("i-check"))
      )
    )
  );

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
  extrasEl.append(
    ...C.adicionais.map((a, i) =>
      el(
        "button",
        { type: "button", class: "extra", "data-extra": i, "aria-pressed": "false" },
        el("span", { class: "extra__ico", "aria-hidden": "true" }, icone("i-plus", "i-off"), icone("i-check", "i-on")),
        el("span", { class: "extra__name" }, a.nome),
        el("span", { class: "extra__price", "data-preco-extra": i })
      )
    )
  );

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
     por ordem de chegada, assim duas pessoas nunca marcam o mesmo horário. */
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
      const s = C.servicos[img.dataset.foto];
      const src = fotoDe(s);
      if (!src) return img.parentNode.classList.add("noimg");
      focar(img, s);
      if (img.getAttribute("src") === src) return;
      img.src = src;
      if (!reduceMotion) img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease" });
    });
  }

  /* ---------- Dados para o Google (endereço, telefone, preços), gerados do config.js ---------- */
  // A página só aceita scripts criados por "políticas" conhecidas (Trusted Types): esta só deixa passar JSON válido
  const dadosPolicy = window.trustedTypes
    ? trustedTypes.createPolicy("genival-dados", { createScript: (s) => (JSON.parse(s), s) })
    : null;
  const precosTodos = C.servicos.flatMap((s) => Object.values(s.precos));
  const site = ($('link[rel="canonical"]') || location).href;
  const dados = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Genival Groomer Petshop",
    description: `Banho e tosa para cães de todos os portes em ${end.bairro}, ${end.cidade}.`,
    url: site,
    image: new URL("images/capa-link.jpg", site).href,
    telephone: "+" + C.whatsapp,
    email: C.email || undefined,
    priceRange: `R$ ${Math.min(...precosTodos)} a R$ ${Math.max(...precosTodos)}`,
    paymentAccepted: C.pagamento || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: [end.rua, end.bairro].filter(Boolean).join(", "),
      addressLocality: end.cidade,
      addressRegion: end.estado,
      addressCountry: "BR",
    },
  });
  const ld = el("script", { type: "application/ld+json" });
  ld.textContent = dadosPolicy ? dadosPolicy.createScript(dados) : dados;
  document.head.append(ld);

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
  const menorPreco = Math.min(...precosTodos);

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
      totalEl.textContent = brl(0);
      resumoBtn.setAttribute("aria-disabled", "true");
      resumoBtn.lastElementChild.textContent = "Escolha um serviço";
      linkInterno(resumoBtn, "#passo-servico");

      barRotulo.textContent = "Banho e tosa a partir de";
      barValor.textContent = brl(menorPreco);
      barBtn.className = "btn btn--gold";
      barBtn.replaceChildren(el("span", null, "Agendar"));
      linkInterno(barBtn, "#passo-servico");
      totalAnterior = null;
      return;
    }

    // Mensagem pronta para o WhatsApp
    const msg = [`Olá, ${C.nome}! Vim pelo site e quero agendar 🐾`, ""];
    if (escolha.pet) msg.push(`*Pet:* ${escolha.pet}`);
    msg.push(`*Porte:* ${porte.nome} (${porte.detalhe})`);
    if (servico) msg.push(`*Serviço:* ${servico.nome} (${precoTexto(servico)})`);
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
    barBtn.replaceChildren(icone("i-wa"), el("span", null, "Agendar"));
    linkAberto(barBtn, link);

    if (total !== totalAnterior) {
      pulsar(totalEl);
      pulsar(barValor);
    }
    totalAnterior = total;
  }

  atualizarPrecos();
  atualizarResumo();

  /* ---------- Último pedido: fica salvo só neste aparelho, para repetir em 1 toque ---------- */
  const CHAVE_PEDIDO = "genival:ultimo-pedido";

  const aoEnviar = (e) => {
    if (!e.currentTarget.target) return; // ainda sem pedido: o botão só leva ao passo 2
    const servico = C.servicos[escolha.servico];
    try {
      localStorage.setItem(
        CHAVE_PEDIDO,
        JSON.stringify({
          porte: escolha.porte,
          servico: servico ? servico.nome : null,
          extras: [...escolha.extras].map((i) => C.adicionais[i].nome),
          pet: escolha.pet,
        })
      );
    } catch (erro) {}
    document.dispatchEvent(new CustomEvent("pedido-enviado")); // o app.js convida a instalar o app
  };
  resumoBtn.addEventListener("click", aoEnviar);
  barBtn.addEventListener("click", aoEnviar);

  let ultimo = null;
  try {
    ultimo = JSON.parse(localStorage.getItem(CHAVE_PEDIDO));
  } catch (erro) {}

  // Busca pelo nome (e não pela posição) para continuar certo se a lista do config.js mudar
  const porteSalvo = ultimo && C.portes.find((p) => p.id === ultimo.porte);
  const servicoSalvo = ultimo ? C.servicos.findIndex((s) => s.nome === ultimo.servico) : -1;
  const extrasSalvos = ultimo && Array.isArray(ultimo.extras)
    ? ultimo.extras.map((n) => C.adicionais.findIndex((a) => a.nome === n)).filter((i) => i >= 0)
    : [];

  if (porteSalvo && (servicoSalvo >= 0 || extrasSalvos.length)) {
    const repetir = $("#repetir");
    const repetirBtn = $("#repetir-btn");
    const pet = String(ultimo.pet || "").slice(0, 60);
    const qtd = extrasSalvos.length;
    $("#repetir-texto").textContent = [
      pet,
      servicoSalvo >= 0 ? C.servicos[servicoSalvo].nome : "",
      qtd ? `${qtd} extra${qtd > 1 ? "s" : ""}` : "",
      porteSalvo.nome,
    ]
      .filter(Boolean)
      .join(" · ");
    repetir.hidden = false;

    repetirBtn.addEventListener("click", () => {
      escolha.porte = porteSalvo.id;
      marcar(portesEl, [...portesEl.children].find((b) => b.dataset.porte === porteSalvo.id));
      escolha.servico = servicoSalvo;
      marcar(servicosEl, servicoSalvo >= 0 ? servicosEl.children[servicoSalvo] : null);
      escolha.extras = new Set(extrasSalvos);
      extrasEl.querySelectorAll("[data-extra]").forEach((b) => b.setAttribute("aria-pressed", escolha.extras.has(+b.dataset.extra)));
      escolha.pet = pet;
      $("#pet").value = pet;
      atualizarPrecos();
      atualizarResumo();

      repetir.classList.add("repetir--ok");
      repetirBtn.textContent = "Pedido pronto!";
      $("#resumo").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

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
