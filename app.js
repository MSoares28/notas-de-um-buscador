// ─────────────────────────────────────────
//  NOTAS DE UM BUSCADOR — app.js
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (typeof LIVRO_DATA === 'undefined') {
    document.getElementById('chapters-container').innerHTML =
      '<p style="color:#a09880;text-align:center;padding:4rem;font-style:italic;">Erro: conteudo.js não encontrado.</p>';
    return;
  }
  renderizar(LIVRO_DATA);
  iniciarProgressBar();
  iniciarBackTop();
  iniciarFontControls();
  iniciarTOC();
  iniciarScrollReveal();
});

// ── RENDERIZAÇÃO PRINCIPAL ──────────────
function renderizar(data) {
  renderCapa(data);
  renderPrefacio(data.prefacio);
  renderCapitulos(data.capitulos);
  renderFinal(data.epigrafe);
  renderTOC(data.capitulos);
}

// ── CAPA ────────────────────────────────
function renderCapa(data) {
  setText('cover-title',    data.titulo);
  setText('cover-sub',      data.subtitulo);
  setText('epigrafe-texto', '"' + data.epigrafe.texto + '"');
  setText('epigrafe-fonte', '— ' + data.epigrafe.fonte);
  setText('nav-brand',      data.titulo.toUpperCase());
}

// ── PREFÁCIO ────────────────────────────
function renderPrefacio(paragrafos) {
  var el = document.getElementById('preface-content');
  el.innerHTML = paragrafos.map(function(p) { return '<p>' + p + '</p>'; }).join('');
}

// ── CAPÍTULOS ───────────────────────────
function renderCapitulos(capitulos) {
  var container = document.getElementById('chapters-container');
  container.innerHTML = '';

  capitulos.forEach(function(cap, i) {
    var div = document.createElement('div');
    div.className = 'chapter';
    div.id = 'cap-' + cap.numero;
    div.innerHTML =
      '<div class="chapter__number">' + cap.numero + '</div>' +
      '<h2 class="chapter__title">' + cap.titulo + '</h2>' +
      '<span class="chapter__subtitle">' + cap.subtitulo + '</span>' +
      '<div class="chapter__body">' + renderCorpo(cap.paragrafos) + '</div>';
    container.appendChild(div);

    if (cap.interludio && i < capitulos.length - 1) {
      var il = document.createElement('div');
      il.className = 'interlude';
      il.innerHTML =
        '<p>"' + cap.interludio.texto + '"</p>' +
        '<cite>' + cap.interludio.fonte + '</cite>';
      container.appendChild(il);
    }
  });
}

function renderCorpo(paragrafos) {
  return paragrafos.map(function(p) {
    if (p.trim().indexOf('<blockquote>') === 0) return p;
    return '<p>' + p + '</p>';
  }).join('\n');
}

// ── FINAL ───────────────────────────────
function renderFinal(epigrafe) {
  setText('final-texto', '"' + epigrafe.texto + '"');
  setText('final-fonte', '— ' + epigrafe.fonte);
}

// ── ÍNDICE (TOC) ────────────────────────
function renderTOC(capitulos) {
  var nav = document.getElementById('toc-nav');
  var html = '<a href="#prefacio" class="toc__prefacio" data-toc>Prefácio</a>';
  capitulos.forEach(function(cap) {
    html +=
      '<a href="#cap-' + cap.numero + '" class="toc__item" data-toc>' +
        '<span class="toc__item-num">' + cap.numero + '</span>' +
        '<span class="toc__item-title">' + cap.titulo + '</span>' +
      '</a>';
  });
  nav.innerHTML = html;
}

function iniciarTOC() {
  var btn     = document.getElementById('menu-btn');
  var toc     = document.getElementById('toc');
  var overlay = document.getElementById('toc-overlay');
  var close   = document.getElementById('toc-close');

  function abrirTOC() {
    toc.classList.add('active');
    overlay.classList.add('active');
  }
  function fecharTOC() {
    toc.classList.remove('active');
    overlay.classList.remove('active');
  }

  btn.addEventListener('click', abrirTOC);
  close.addEventListener('click', fecharTOC);
  overlay.addEventListener('click', fecharTOC);
  document.getElementById('toc-nav').addEventListener('click', function(e) {
    if (e.target.closest('[data-toc]')) fecharTOC();
  });
}

// ── BARRA DE PROGRESSO ──────────────────
function iniciarProgressBar() {
  var bar = document.getElementById('progress-bar');
  window.addEventListener('scroll', function() {
    var total = document.documentElement.scrollHeight - window.innerHeight;
    var pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ── BOTÃO VOLTAR AO TOPO ─────────────────
function iniciarBackTop() {
  var btn = document.getElementById('back-top');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── CONTROLES DE FONTE ───────────────────
function iniciarFontControls() {
  var tamanho = 18;
  var MIN = 14, MAX = 24;

  function aplicarFonte() {
    // Aplica no html para que todos os rem escalem junto
    document.documentElement.style.fontSize = tamanho + 'px';
  }

  document.getElementById('font-up').addEventListener('click', function() {
    if (tamanho < MAX) { tamanho += 2; aplicarFonte(); }
  });

  document.getElementById('font-down').addEventListener('click', function() {
    if (tamanho > MIN) { tamanho -= 2; aplicarFonte(); }
  });
}

// ── SCROLL REVEAL ───────────────────────
function iniciarScrollReveal() {
  var chapters = document.querySelectorAll('.chapter');

  // Se o browser não suporta IntersectionObserver, mostra tudo
  if (!('IntersectionObserver' in window)) {
    chapters.forEach(function(ch) { ch.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -50px 0px' });

  chapters.forEach(function(ch) {
    // Verifica se já está visível no viewport ao carregar
    var rect = ch.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      ch.classList.add('visible');
    } else {
      observer.observe(ch);
    }
  });
}

// ── UTIL ────────────────────────────────
function setText(id, valor) {
  var el = document.getElementById(id);
  if (el) el.textContent = valor;
}
