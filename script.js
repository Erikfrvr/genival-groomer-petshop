(function () {
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const waLink = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nome e links gerais ---------- */
  document.querySelectorAll("[data-nome]").forEach((el) => (el.textContent = CONFIG.nome));
  document.querySelectorAll("[data-wa]").forEach((el) => (el.href = waLink(CONFIG.mensagemPadrao)));
  document.getElementById("ano").textContent = new Date().getFullYear();

  /* ---------- Contatos ---------- */
  const fone = (n) => n.replace(/^55(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  document.querySelectorAll("[data-fone]").forEach((el) => (el.textContent = fone(CONFIG[el.dataset.fone])));
  document.querySelectorAll("[data-wa2]").forEach(
    (el) => (el.href = `https://wa.me/${CONFIG.whatsapp2}?text=${encodeURIComponent(CONFIG.mensagemPadrao)}`)
  );
  document.querySelectorAll("[data-email]").forEach((el) => (el.href = `mailto:${CONFIG.email}`));
  document.querySelectorAll("[data-email-texto]").forEach((el) => (el.textContent = CONFIG.email));
  document.querySelectorAll("[data-endereco]").forEach((el) => (el.textContent = CONFIG.endereco));
  document.querySelectorAll("[data-mapa]").forEach(
    (el) => (el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.endereco)}`)
  );

  /* ---------- Anos de experiência (desde o ano configurado) ---------- */
  const anos = new Date().getFullYear() - CONFIG.naAreaPetDesde;
  document.querySelectorAll("[data-anos]").forEach((el) => {
    el.textContent = anos;
    if ("count" in el.dataset) el.dataset.count = anos;
  });

  /* ---------- Seletor de porte ---------- */
  const picker = document.getElementById("size-picker");
  let porteAtual = CONFIG.portes[0].id;

  picker.innerHTML =
    CONFIG.portes
      .map(
        (p, i) => `
      <button class="size-picker__btn" role="tab" data-porte="${p.id}" aria-selected="${i === 0}">
        <span class="size-picker__emoji" aria-hidden="true">${p.icone}</span>
        <strong>${p.nome}</strong>
        <small>${p.detalhe}</small>
      </button>`
      )
      .join("") + `<span class="size-picker__glider" aria-hidden="true"></span>`;

  picker.style.setProperty("--count", CONFIG.portes.length);

  picker.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-porte]");
    if (!btn || btn.dataset.porte === porteAtual) return;
    porteAtual = btn.dataset.porte;
    picker.querySelectorAll("[data-porte]").forEach((b, i) => {
      const on = b === btn;
      b.setAttribute("aria-selected", on);
      if (on) picker.style.setProperty("--index", i);
    });
    atualizarPrecos();
  });

  /* ---------- Cards de serviços ---------- */
  const lista = document.getElementById("servicos-lista");
  lista.innerHTML = CONFIG.servicos
    .map(
      (s, i) => `
    <article class="service reveal ${s.destaque ? "service--featured" : ""}" style="--d:${(i % 3) * 80}ms">
      <figure class="ph service__photo" data-label="${s.nome}">
        <img src="${s.foto}" alt="${s.nome}" loading="lazy" onerror="this.parentNode.classList.add('empty');this.remove()" />
        ${s.destaque ? `<span class="service__tag"><svg><use href="#i-star"/></svg>${s.destaque}</span>` : ""}
      </figure>
      <div class="service__body">
        <div class="service__top">
          <h3>${s.nome}</h3>
          <span class="service__time"><svg><use href="#i-clock"/></svg>${s.duracao}</span>
        </div>
        <p>${s.descricao}</p>
        <div class="service__foot">
          <div class="price">
            <small>Porte <span data-porte-nome></span></small>
            <strong data-preco="${i}"></strong>
          </div>
          <a class="btn btn--wa btn--sm" data-servico="${i}" target="_blank" rel="noopener">
            <svg><use href="#i-wa"/></svg>Agendar
          </a>
        </div>
      </div>
    </article>`
    )
    .join("");

  function atualizarPrecos() {
    const porte = CONFIG.portes.find((p) => p.id === porteAtual);
    lista.querySelectorAll("[data-porte-nome]").forEach((el) => (el.textContent = porte.nome.toLowerCase()));
    lista.querySelectorAll("[data-preco]").forEach((el) => {
      const s = CONFIG.servicos[el.dataset.preco];
      el.textContent = brl(s.precos[porteAtual]);
      if (!reduceMotion) {
        el.classList.remove("bump");
        void el.offsetWidth; // reinicia a animação
        el.classList.add("bump");
      }
    });
    lista.querySelectorAll("[data-servico]").forEach((a) => {
      const s = CONFIG.servicos[a.dataset.servico];
      a.href = waLink(
        `Olá, ${CONFIG.nome}! Vi seu site e gostaria de agendar:\n\n🐾 *${s.nome}*\n📏 Porte: ${porte.nome} (${porte.detalhe})\n💰 Valor: ${brl(s.precos[porteAtual])}\n\nQual horário você tem disponível?`
      );
    });
  }
  atualizarPrecos();

  /* ---------- Adicionais ---------- */
  document.getElementById("adicionais-lista").innerHTML = CONFIG.adicionais
    .map(
      (a) => `
    <li>
      <span class="extras__icon" aria-hidden="true">${a.icone}</span>
      <span class="extras__name">${a.nome}</span>
      <span class="extras__price">${
        a.preco === 0 ? '<em class="free">Cortesia</em>' : (a.aPartirDe ? "<small>a partir de</small> " : "") + brl(a.preco)
      }</span>
    </li>`
    )
    .join("");

  /* ---------- Topo com sombra ao rolar + botão fixo ---------- */
  const nav = document.querySelector(".nav");
  const float = document.querySelector(".wa-float");
  const hero = document.querySelector(".hero");
  const footer = document.querySelector(".footer");
  let footerVisivel = false;

  const onScroll = () => {
    nav.classList.toggle("nav--scrolled", window.scrollY > 10);
    const passouHero = window.scrollY > hero.offsetHeight * 0.6;
    float.classList.toggle("wa-float--show", passouHero && !footerVisivel);
  };
  new IntersectionObserver(([e]) => {
    footerVisivel = e.isIntersecting;
    onScroll();
  }).observe(footer);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Animações ao aparecer ---------- */
  const reveals = document.querySelectorAll(".reveal");
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Contadores ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const animar = (el) => {
    const alvo = +el.dataset.count;
    if (reduceMotion) return (el.textContent = alvo.toLocaleString("pt-BR"));
    const t0 = performance.now();
    const dur = 1600;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(alvo * eased).toLocaleString("pt-BR");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver((entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animar(e.target);
        cio.unobserve(e.target);
      }
    })
  );
  counters.forEach((el) => cio.observe(el));

  /* ---------- FAQ: abre um por vez ---------- */
  const faqs = document.querySelectorAll(".faq details");
  faqs.forEach((d) =>
    d.addEventListener("toggle", () => {
      if (d.open) faqs.forEach((o) => o !== d && (o.open = false));
    })
  );
})();
