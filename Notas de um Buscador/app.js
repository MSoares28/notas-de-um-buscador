// ─────────────────────────────────────────
//  NOTAS DO CAMINHO — app.js
//  Renderiza o livro a partir de LIVRO_DATA
//  definido em data/conteudo.js
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (typeof LIVRO_DATA === 'undefined') {
    document.getElementById('chapters-container').innerHTML =
      '<p style="color:#a09880;text-align:center;padding:4rem;font-style:italic;">Erro: conteudo.js não encontrado.</p>';
    return;
  }
  renderizar(LIVRO_DATA);
});

// ── RENDERIZAÇÃO PRINCIPAL ──────────────
function renderizar(data) {
  renderCapa(data);
  renderPrefacio(data.prefacio);
  renderCapitulos(data.capitulos);
  renderFinal(data.epigrafe);
  renderNav(data.capitulos);
  iniciarScrollReveal();
}

// ── CAPA ────────────────────────────────
function renderCapa(data) {
  setText('cover-title',   data.titulo);
  setText('cover-sub',     data.subtitulo);
  setText('epigrafe-texto', `"${data.epigrafe.texto}"`);
  setText('epigrafe-fonte', `— ${data.epigrafe.fonte}`);
}

// ── PREFÁCIO ────────────────────────────
function renderPrefacio(paragrafos) {
  const el = document.getElementById('preface-content');
  el.innerHTML = paragrafos.map(p => `<p>${p}</p>`).join('');
}

// ── CAPÍTULOS ───────────────────────────
function renderCapitulos(capitulos) {
  const container = document.getElementById('chapters-container');
  container.innerHTML = '';

  capitulos.forEach((cap, i) => {
    // Capítulo
    const div = document.createElement('div');
    div.className = 'chapter';
    div.id = `cap-${cap.numero}`;
    div.innerHTML = `
      <div class="chapter__number">${cap.numero}</div>
      <h2 class="chapter__title">${cap.titulo}</h2>
      <span class="chapter__subtitle">${cap.subtitulo}</span>
      <div class="chapter__body">${renderCorpo(cap.paragrafos)}</div>
    `;
    container.appendChild(div);

    // Interlúdio após o capítulo (exceto no último)
    if (cap.interludio && i < capitulos.length - 1) {
      const il = document.createElement('div');
      il.className = 'interlude';
      il.innerHTML = `
        <p>"${cap.interludio.texto}"</p>
        <cite>${cap.interludio.fonte}</cite>
      `;
      container.appendChild(il);
    }
  });
}

// ── CORPO DO CAPÍTULO ───────────────────
function renderCorpo(paragrafos) {
  return paragrafos.map(p => {
    // Blocos de citação já vêm com tag <blockquote>
    if (p.trim().startsWith('<blockquote>')) return p;
    return `<p>${p}</p>`;
  }).join('\n');
}

// ── FINAL ───────────────────────────────
function renderFinal(epigrafe) {
  setText('final-texto', `"${epigrafe.texto}"`);
  setText('final-fonte', `— ${epigrafe.fonte}`);
}

// ── NAVEGAÇÃO ───────────────────────────
function renderNav(capitulos) {
  const nav = document.getElementById('nav-links');
  const fixos = [{ href: '#prefacio', label: 'Prefácio' }];
  // Adiciona link para primeiro, meio e último capítulo
  const indices = [0, Math.floor(capitulos.length / 2), capitulos.length - 1];
  const unicos = [...new Set(indices)];
  const caps = unicos.map(i => ({
    href: `#cap-${capitulos[i].numero}`,
    label: capitulos[i].titulo
  }));
  const todos = [...fixos, ...caps];
  nav.innerHTML = todos.map(n =>
    `<li><a href="${n.href}">${n.label}</a></li>`
  ).join('');
}

// ── SCROLL REVEAL ───────────────────────
function iniciarScrollReveal() {
  const chapters = document.querySelectorAll('.chapter');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.06 });
  chapters.forEach(ch => observer.observe(ch));
}

// ── UTIL ────────────────────────────────
function setText(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}
