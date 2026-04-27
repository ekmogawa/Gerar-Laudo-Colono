// ============================================================
// FUNÇÕES — Gerar Laudo Colonoscopia (Firebase Edition)
// Depende de: firebase-config.js + config.js + dados_colono.js
// ============================================================

// ----------------------------------------------------------
// FIREBASE — instâncias globais
// ----------------------------------------------------------

var _auth      = null;
var _firestore = null;
var _user      = null;
var _modoVisitante  = false;
var _CADASTRO_ABERTO = false;

function inicializarFirebase() {
  if (typeof FIREBASE_CONFIG === 'undefined' ||
      FIREBASE_CONFIG.apiKey === 'COLE_SUA_API_KEY_AQUI') {
    document.body.innerHTML =
      '<div style="font:16px Arial;padding:48px;color:#900;max-width:560px;margin:auto">' +
      '<h2 style="margin-bottom:12px">&#9888; Firebase não configurado</h2>' +
      '<p>Edite <b>firebase-config.js</b> com as credenciais do projeto Firebase.</p></div>';
    return;
  }

  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    _auth      = firebase.auth();
    _firestore = firebase.firestore();

    _firestore.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
      if (err.code !== 'failed-precondition' && err.code !== 'unimplemented')
        console.warn('[Firestore] Persistência offline:', err.code);
    });

    ['auth-password', 'cad-password2'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        id === 'auth-password' ? loginUsuario() : registrarUsuario();
      });
    });

    var tabCad = document.getElementById('tab-cadastrar');
    if (tabCad) tabCad.style.display = _CADASTRO_ABERTO ? '' : 'none';

    _auth.onAuthStateChanged(function (user) {
      _user = user;
      _modoVisitante = !!(user && user.isAnonymous);
      if (user) {
        ocultarModalAuth();
        atualizarStatusUsuario();
        carregarDados();
      } else {
        _modoVisitante = false;
        mostrarModalAuth();
        atualizarStatusUsuario();
      }
    });

  } catch (e) {
    console.error('[Firebase] Erro na inicialização:', e);
    mostrarToast('&#10060; Erro ao conectar ao Firebase: ' + e.message, '#7a1a1a', 10000);
  }
}

// ----------------------------------------------------------
// AUTH — UI
// ----------------------------------------------------------

function mostrarModalAuth() {
  var overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.classList.add('show');
}

function ocultarModalAuth() {
  var overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.classList.remove('show');
}

function mostrarTabAuth(tab) {
  document.getElementById('form-entrar').style.display    = tab === 'entrar'    ? '' : 'none';
  document.getElementById('form-cadastrar').style.display = tab === 'cadastrar' ? '' : 'none';
  document.getElementById('tab-entrar').classList.toggle('active',    tab === 'entrar');
  document.getElementById('tab-cadastrar').classList.toggle('active', tab === 'cadastrar');
  document.getElementById('auth-erro').textContent = '';
  document.getElementById(tab === 'entrar' ? 'auth-email' : 'cad-email').focus();
}

function _mostrarErroAuth(msg) {
  var el = document.getElementById('auth-erro');
  if (el) el.textContent = msg;
}

var _MSGS_AUTH = {
  'auth/user-not-found':        'Usuário não encontrado.',
  'auth/wrong-password':        'Senha incorreta.',
  'auth/invalid-credential':    'E-mail ou senha incorretos.',
  'auth/email-already-in-use':  'Este e-mail já está cadastrado.',
  'auth/weak-password':         'A senha deve ter pelo menos 6 caracteres.',
  'auth/invalid-email':         'E-mail inválido.',
  'auth/network-request-failed':'Sem conexão. Verifique a internet.',
  'auth/too-many-requests':     'Muitas tentativas. Aguarde alguns minutos.',
  'auth/missing-password':      'Digite a senha.'
};

async function loginUsuario() {
  var email = document.getElementById('auth-email').value.trim();
  var senha = document.getElementById('auth-password').value;
  if (!email || !senha) { _mostrarErroAuth('Preencha e-mail e senha.'); return; }
  var btn = document.getElementById('btn-login');
  btn.disabled = true;
  try {
    await _auth.signInWithEmailAndPassword(email, senha);
  } catch (e) {
    _mostrarErroAuth(_MSGS_AUTH[e.code] || e.message);
  } finally {
    btn.disabled = false;
  }
}

async function registrarUsuario() {
  if (!_CADASTRO_ABERTO) {
    _mostrarErroAuth('Cadastro de novas contas está temporariamente suspenso.');
    return;
  }
  var email  = document.getElementById('cad-email').value.trim();
  var senha  = document.getElementById('cad-password').value;
  var senha2 = document.getElementById('cad-password2').value;
  var codigo = document.getElementById('cad-codigo').value.trim().toUpperCase();

  if (!email || !senha || !codigo) { _mostrarErroAuth('Preencha todos os campos, incluindo o código de acesso.'); return; }
  if (senha !== senha2)            { _mostrarErroAuth('As senhas não coincidem.'); return; }
  if (senha.length < 6)            { _mostrarErroAuth('Mínimo de 6 caracteres na senha.'); return; }

  var btn = document.getElementById('btn-cadastrar');
  btn.disabled = true;

  try {
    var codigoDoc = await _firestore.collection('codigos').doc(codigo).get();
    if (!codigoDoc.exists || codigoDoc.data().usado) {
      _mostrarErroAuth('Código de acesso inválido ou já utilizado.');
      return;
    }
    var cred = await _auth.createUserWithEmailAndPassword(email, senha);
    await _firestore.collection('codigos').doc(codigo).update({
      usado:    true,
      usadoPor: cred.user.uid,
      usadoEm:  firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {
    _mostrarErroAuth(_MSGS_AUTH[e.code] || e.message);
  } finally {
    btn.disabled = false;
  }
}

async function entrarComoVisitante() {
  var btn = document.getElementById('btn-visitante');
  if (btn) { btn.disabled = true; btn.textContent = 'Aguarde…'; }
  try {
    await _auth.signInAnonymously();
  } catch (e) {
    _mostrarErroAuth(
      e.code === 'auth/operation-not-allowed'
        ? 'Acesso como visitante não habilitado. Contate o administrador.'
        : ('Erro: ' + (e.message || e))
    );
    if (btn) { btn.disabled = false; btn.textContent = '👤 Entrar como Visitante'; }
  }
}

async function resetarSenha() {
  var email = document.getElementById('auth-email').value.trim();
  if (!email) { _mostrarErroAuth('Digite seu e-mail acima para redefinir a senha.'); return; }
  try {
    await _auth.sendPasswordResetEmail(email);
    _mostrarErroAuth('');
    mostrarToast('&#128231; E-mail de redefinição enviado!', '#1a3a1a', 5000);
  } catch (e) {
    _mostrarErroAuth(_MSGS_AUTH[e.code] || e.message);
  }
}

async function sairUsuario() {
  if (!confirm('Deseja sair?')) return;
  await _auth.signOut();
}

function atualizarStatusUsuario() {
  var el = document.getElementById('user-status');
  if (!el) return;
  if (_user && _modoVisitante) {
    el.innerHTML =
      '<span class="user-email" style="background:rgba(255,180,0,.18);border-color:rgba(255,180,0,.4);color:rgba(255,240,180,.95);">&#128100; Visitante</span>' +
      '<button class="btn-ghost btn-xs" onclick="sairUsuario()">Sair</button>';
  } else if (_user) {
    el.innerHTML =
      '<span class="user-email">' + _user.email + '</span>' +
      '<button class="btn-ghost btn-xs" onclick="sairUsuario()">Sair</button>';
  } else {
    el.innerHTML = '';
  }
}

// ----------------------------------------------------------
// AUTO-SAVE
// ----------------------------------------------------------

var _autoSaveAtivo = localStorage.getItem('colono_autosave') === '1';
var _autoSaveTimer = null;
var _temAlteracoes = false;

function agendarAutoSave() {
  if (_modoVisitante) return;
  _temAlteracoes = true;
  atualizarIndicadorSalvo();
  registrarSnapshot();
  if (typeof _agendarLiveLaudo === 'function') _agendarLiveLaudo();
  if (!_autoSaveAtivo) return;
  clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(salvarDados, 1500);
}

function toggleAutoSave() {
  _autoSaveAtivo = !_autoSaveAtivo;
  localStorage.setItem('colono_autosave', _autoSaveAtivo ? '1' : '0');
  atualizarBotaoAutoSave();
  if (_autoSaveAtivo && _temAlteracoes) salvarDados();
}

function atualizarBotaoAutoSave() {
  var btn = document.getElementById('btn-autosave');
  if (!btn) return;
  if (_autoSaveAtivo) {
    btn.textContent = '🔄 Auto-save: ON';
    btn.className   = 'btn-save btn-autosave-on';
  } else {
    btn.textContent = '🔄 Auto-save: OFF';
    btn.className   = 'btn-ghost';
  }
}

function atualizarIndicadorSalvo() {
  var el = document.getElementById('save-indicator');
  if (!el) return;
  el.textContent = _temAlteracoes ? '● Não salvo' : '✓ Salvo';
  el.style.opacity = _temAlteracoes ? '0.75' : '0.4';
}

// ----------------------------------------------------------
// FIRESTORE — CARREGAR / SALVAR
// ----------------------------------------------------------

async function carregarDados() {
  if (!_user || !_firestore) return;
  mostrarToast('⌛ Carregando…', '#1a2e3a', 8000);

  if (_modoVisitante) {
    try {
      var vDoc = await _firestore.collection('visitante').doc('publico').get();
      var vDados = (vDoc.exists && vDoc.data() && vDoc.data().dbColono)
        ? vDoc.data().dbColono
        : (typeof DB_PADRAO !== 'undefined' ? DB_PADRAO : {});
      _DB = JSON.parse(JSON.stringify(vDados));
      window._inicializado = false;
      inicializar();
      mostrarToast('👤 Modo visitante — somente leitura', '#1a3a5a', 3500);
    } catch (e) {
      console.error('[carregarDados visitante]', e);
      _DB = JSON.parse(JSON.stringify(typeof DB_PADRAO !== 'undefined' ? DB_PADRAO : {}));
      window._inicializado = false;
      inicializar();
      mostrarToast('👤 Visitante (banco padrão)', '#1a3a5a', 3500);
    }
    return;
  }

  try {
    var doc = await _firestore.collection('users').doc(_user.uid).get();
    var dados;
    if (doc.exists && doc.data().dbColono) {
      dados = doc.data().dbColono;
    } else {
      dados = (typeof DB_PADRAO !== 'undefined') ? DB_PADRAO : {};
      await _firestore.collection('users').doc(_user.uid).set(
        { dbColono: dados, email: _user.email },
        { merge: true }
      );
    }
    _DB = JSON.parse(JSON.stringify(dados));
    window._inicializado = false;
    inicializar();
    mostrarToast('✓ Dados carregados.', '#1a3a1a', 2000);
  } catch (e) {
    console.error('[carregarDados]', e);
    mostrarToast('❌ Erro ao carregar: ' + e.message, '#7a1a1a', 10000);
  }
}

async function salvarDados() {
  if (_modoVisitante) {
    mostrarToast('👤 Modo visitante — salvamento não permitido.', '#7a4000', 4000);
    return;
  }
  if (!_user || !_firestore) {
    mostrarToast('⚠ Faça login para salvar.', '#7a4000', 5000);
    return;
  }
  clearTimeout(_autoSaveTimer);
  mostrarToast('🔄 Salvando…', '#1a2e3a', 6000);
  try {
    var db = coletarDB({ semDinamicos: true });
    await _firestore.collection('users').doc(_user.uid).set(
      { dbColono: db, atualizadoEm: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    _DB = JSON.parse(JSON.stringify(db));
    _temAlteracoes = false;
    atualizarIndicadorSalvo();
    mostrarToast('✓ Salvo!', '#1a3a1a', 2500);

    if (_user.email === 'ekmogawa@gmail.com') {
      _firestore.collection('visitante').doc('publico').set({ dbColono: db }, { merge: true })
        .catch(function (e) { console.warn('[visitante sync]', e); });
    }
  } catch (e) {
    console.error('[salvarDados]', e);
    mostrarToast('❌ Erro ao salvar: ' + e.message, '#7a1a1a', 10000);
  }
}

// ----------------------------------------------------------
// BANCO ATIVO
// ----------------------------------------------------------
var _DB;
(function () {
  var fonte = (typeof DB_PADRAO !== 'undefined') ? DB_PADRAO
            : (typeof DB       !== 'undefined') ? DB
            : null;
  if (!fonte) {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.innerHTML =
        '<div style="font:16px Arial;padding:40px;color:#900">' +
        '&#10060; Erro: <b>dados_colono.js</b> não carregou.</div>';
    });
    return;
  }
  _DB = JSON.parse(JSON.stringify(fonte));
}());

// ----------------------------------------------------------
// UTILITÁRIOS GERAIS
// ----------------------------------------------------------

function getVal(id) {
  return document.getElementById(id).value;
}

function getSelectedOptionExtra(sel) {
  return sel.options[sel.selectedIndex].getAttribute('data-extra');
}

var _contadorDinamico = 0;

function createCheckboxDiv(text, name) {
  var div = document.createElement('div');
  div.className = 'item item-dinamico ui-sortable-handle';
  div.setAttribute('data-populated', '1');
  var nomeUnico = name + '_d' + (++_contadorDinamico);
  div.innerHTML = '<input type="checkbox" name="' + nomeUnico + '" value="' + text + '" checked><label>' + text + '</label>';
  return div;
}

function appendToSortable(elementId, div) {
  document.getElementById(elementId).appendChild(div);
}

var PLURAIS = {
  "ólipo séssil":        "ólipos sésseis",
  "ólipo subpediculado": "ólipos subpediculados",
  "ólipo pediculado":    "ólipos pediculados",
  "esão":                "esões",
  "planoelevada":        "planoelevadas",
  "planodeprimida":      "planodeprimidas",
  "essecção":            "essecções",
  "tomia":               "tomias",
  "ectasia":             "ectasias",
  "granular":            "granulares",
  "nodular mista":       "nodulares mistas",
  "deprimida":           "deprimidas",
  "fragmentada":         "fragmentadas"
};

function pluralizar(texto) {
  return Object.keys(PLURAIS).reduce(function (t, s) { return t.replace(s, PLURAIS[s]); }, texto);
}

// ----------------------------------------------------------
// TOAST
// ----------------------------------------------------------

function mostrarToast(msg, cor, duracao) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = cor || '#1a3a1a';
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.classList.remove('show'); }, duracao || 3200);
}

// HISTÓRICO + BUSCA RÁPIDA — ver historico_colono.js

// ----------------------------------------------------------
// INICIALIZAÇÃO — popula a página
// ----------------------------------------------------------

function popularSelect(id, opcoes) {
  var sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '';
  opcoes.forEach(function (op) {
    var opt = document.createElement('option');
    opt.value       = op.valor !== undefined ? op.valor : op;
    opt.textContent = op.label !== undefined ? op.label : op;
    if (op.extra !== undefined) opt.setAttribute('data-extra', op.extra);
    sel.appendChild(opt);
  });
}

function popularCheckboxSection(containerId, itens, nomeSortable) {
  var container = document.getElementById(containerId);
  if (!container) return;
  // Remove apenas itens adicionados por esta função — preserva HTML estático (ex: widget de sedação)
  container.querySelectorAll('.item[data-populated]').forEach(function (el) { el.remove(); });
  itens.forEach(function (item) {
    if (item.separador) {
      var sep = document.createElement('div');
      sep.className = 'item';
      sep.setAttribute('data-sep', '1');
      sep.setAttribute('data-populated', '1');
      sep.style.cssText = 'width:100%;height:0;border-top:1px solid var(--border2);margin:3px 0;padding:0;background:transparent;border-radius:0;box-shadow:none;cursor:default;pointer-events:none;flex-basis:100%;';
      container.appendChild(sep);
      return;
    }
    var div = document.createElement('div');
    div.className = 'item';
    div.setAttribute('data-populated', '1');
    var id = item.id || (item.nome + '-' + nomeSortable);
    var valorEscapado = (item.valor || '')
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    div.innerHTML =
      '<input type="checkbox" name="' + item.nome + '" value="' + valorEscapado + '" id="' + id + '">' +
      '<label for="' + id + '">' + item.nome + '</label>';
    container.appendChild(div);
  });
}

var _SECOES_COLONO = [
  { sortable: 'sortable-indicacao',   chave: 'indicacao' },
  { sortable: 'sortable-equipamento', chave: 'equipamento' },
  { sortable: 'sortable-sedacao',     chave: 'sedacao' },
  { sortable: 'sortable-preparo',     chave: 'preparo' },
  { sortable: 'sortable-exame',       chave: 'exame' },
  { sortable: 'sortable-conclusao',   chave: 'conclusao' },
  { sortable: 'sortable-obs',         chave: 'obs' },
  { sortable: 'sortable-outros',      chave: 'outros' }
];

var _ZONAS_DRAG = _SECOES_COLONO.map(function (s) { return s.sortable; })
  .concat(['sortable-alteracao', 'sortable-diverticulo', 'sortable-canalanal']);

function _strParaOpcao(v) { return { valor: v, label: v || '-' }; }

function inicializar() {
  if (window._inicializado) return;
  window._inicializado = true;

  _SECOES_COLONO.forEach(function (s) {
    popularCheckboxSection(s.sortable, _DB[s.chave], s.sortable);
  });

  popularSelect('fentanil',  _DB.sedacaoSelects.fentanil.map(_strParaOpcao));
  popularSelect('midazolam', _DB.sedacaoSelects.midazolam.map(_strParaOpcao));

  popularSelect('localizacao', _DB.lesoes.localizacao);
  popularSelect('lesao',       _DB.lesoes.paris);
  popularSelect('numero',      _DB.lesoes.numero);
  popularSelect('tamanho',     _DB.lesoes.tamanho.map(function (v) { return { valor: String(v), label: v + 'mm' }; }));
  popularSelect('atetamanho',  _DB.lesoes.ateTamanho);
  popularSelect('kudo',        _DB.lesoes.kudo);
  popularSelect('vasc',        _DB.lesoes.vasc);
  popularSelect('jnet',        _DB.lesoes.jnet);
  popularSelect('resseccao',   _DB.lesoes.resseccao);
  popularSelect('resseccao3',  _DB.lesoes.resseccao3);
  popularSelect('hemostasia',  _DB.lesoes.hemostasia);

  popularSelect('diver-local',  _DB.diverticulos.local);
  popularSelect('diver-local2', _DB.diverticulos.local2);
  popularSelect('diver-freq',   _DB.diverticulos.frequencia);

  popularSelect('alt-anal',   _DB.canalAnal.alteracao);
  popularSelect('local-anal', _DB.canalAnal.local);

  popularSelect('numero-conc',    _DB.conclusaoSimples.numero);
  popularSelect('lesao-conc',     _DB.conclusaoSimples.lesao);
  popularSelect('local-conc',     _DB.conclusaoSimples.local);
  popularSelect('resseccao-conc', _DB.conclusaoSimples.resseccao);

  popularSelect('lesao2-conc',    _DB.conclusaoComposta.lesao);
  popularSelect('resseccao2-conc',_DB.conclusaoComposta.resseccao);

  Object.values(_DB.conclusaoComposta.quantidades).forEach(function (seg) {
    var opcoes = [{ valor: '', label: '0' }];
    for (var i = 1; i <= 8; i++) {
      var n = String(i).padStart(2, '0');
      opcoes.push({ valor: seg.prefixo.replace('{n}', n), label: String(i) });
    }
    popularSelect(seg.id, opcoes);
  });

  inicializarSortable();
  inicializarSincronizacaoCheckboxes();
  inicializarMultiplosAchados();
  atualizarStatusGitHub();

  _instalarHistorico();
  if (!_histAplicando) _resetHistorico();

  setTimeout(function () {
    _temAlteracoes = false;
    if (typeof atualizarIndicadorSalvo === 'function') atualizarIndicadorSalvo();
    if (typeof atualizarBotaoAutoSave === 'function') atualizarBotaoAutoSave();
  }, 200);
}

// ----------------------------------------------------------
// DRAG & DROP — Pointer Events (sem flickering)
// ----------------------------------------------------------

function inicializarSortable() {
  _ZONAS_DRAG.forEach(function (id) {
    var zone = document.getElementById(id);
    if (zone) ativarZona(zone);
  });
}

function ativarZona(zone) {
  zone.querySelectorAll('.item').forEach(ativarItem);
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1 && n.classList.contains('item')) ativarItem(n);
      });
    });
  }).observe(zone, { childList: true });
}

function ativarItem(item) {
  if (item.getAttribute('data-sep') === '1') return;
  if (item.getAttribute('data-drag-init')) return;
  item.setAttribute('data-drag-init', '1');

  var wasDragged = false;

  item.addEventListener('click', function (e) {
    if (e.target.matches('input[type=checkbox], label, button, select')) return;
    if (wasDragged) { wasDragged = false; return; }
    var cb = item.querySelector('input[type=checkbox]');
    if (cb) {
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  item.addEventListener('pointerdown', function (e) {
    if (e.target.matches('input[type=checkbox], button, select')) return;
    if (e.button !== 0) return;

    item.setPointerCapture(e.pointerId);

    var zone       = item.closest('.sortable-zone');
    var rect       = item.getBoundingClientRect();
    var offX       = e.clientX - rect.left;
    var offY       = e.clientY - rect.top;
    var moved      = false;
    var ghost      = null;
    var ph         = null;
    var lastTarget = undefined;

    function startDrag() {
      moved = true;
      wasDragged = true;

      ph = document.createElement('div');
      ph.className = 'item';
      ph.setAttribute('data-ph', '1');
      ph.style.cssText =
        'width:'  + rect.width  + 'px;' +
        'height:' + rect.height + 'px;' +
        'border:2px dashed var(--accent);background:var(--accent-l);' +
        'border-radius:6px;pointer-events:none;flex-shrink:0;';
      zone.insertBefore(ph, item);
      item.style.display = 'none';

      ghost = item.cloneNode(true);
      ghost.style.cssText =
        'position:fixed;z-index:9999;pointer-events:none;' +
        'width:'  + rect.width + 'px;' +
        'opacity:.88;box-shadow:0 8px 24px rgba(0,0,0,.22);' +
        'transform:rotate(1.5deg) scale(1.03);' +
        'left:' + (e.clientX - offX) + 'px;' +
        'top:'  + (e.clientY - offY) + 'px;';
      document.body.appendChild(ghost);
    }

    function onMove(ev) {
      var dx = ev.clientX - (rect.left + offX);
      var dy = ev.clientY - (rect.top  + offY);
      if (!moved) {
        if (Math.sqrt(dx*dx + dy*dy) < 5) return;
        startDrag();
      }
      ghost.style.left = (ev.clientX - offX) + 'px';
      ghost.style.top  = (ev.clientY - offY) + 'px';

      ghost.style.visibility = 'hidden';
      var elUnder = document.elementFromPoint(ev.clientX, ev.clientY);
      ghost.style.visibility = '';
      var targetZone = elUnder ? elUnder.closest('.sortable-zone') : null;
      if (!targetZone) targetZone = zone;

      if (ph.parentElement !== targetZone) {
        targetZone.appendChild(ph);
        lastTarget = undefined;
      }
      var after = getAfterElement(targetZone, ev.clientX, ev.clientY, ph);
      var key   = after || null;
      if (key === lastTarget) return;
      lastTarget = key;
      after ? targetZone.insertBefore(ph, after) : targetZone.appendChild(ph);
    }

    function onUp() {
      item.removeEventListener('pointermove',   onMove);
      item.removeEventListener('pointerup',     onUp);
      item.removeEventListener('pointercancel', onUp);
      if (moved) {
        if (ph && ph.parentElement) ph.parentElement.insertBefore(item, ph);
        if (ph)    ph.remove();
        if (ghost) ghost.remove();
        item.style.display = '';
      } else {
        wasDragged = false;
      }
    }

    item.addEventListener('pointermove',   onMove);
    item.addEventListener('pointerup',     onUp);
    item.addEventListener('pointercancel', onUp);
  });
}

function getAfterElement(zone, x, y, exclude) {
  var items = Array.from(zone.querySelectorAll('.item'))
    .filter(function (el) {
      return el !== exclude &&
             !el.getAttribute('data-ph') &&
             el.getAttribute('data-sep') !== '1';
    });

  var rows = [];
  items.forEach(function (el) {
    var r    = el.getBoundingClientRect();
    var rowY = Math.round(r.top / 8) * 8;
    var row  = rows.find(function (rw) { return rw.y === rowY; });
    if (!row) { row = { y: rowY, bottom: r.bottom, els: [] }; rows.push(row); }
    row.bottom = Math.max(row.bottom, r.bottom);
    row.els.push({ el: el, midX: r.left + r.width / 2 });
  });
  rows.sort(function (a, b) { return a.y - b.y; });

  if (!rows.length) return null;

  var targetRow = null;
  for (var i = 0; i < rows.length; i++) {
    if (y <= rows[i].bottom) { targetRow = rows[i]; break; }
  }
  if (!targetRow) return null;

  var sorted = targetRow.els.slice().sort(function (a, b) { return a.midX - b.midX; });
  for (var j = 0; j < sorted.length; j++) {
    if (x < sorted[j].midX) return sorted[j].el;
  }

  var ri = rows.indexOf(targetRow);
  if (ri < rows.length - 1) {
    var next = rows[ri + 1].els.slice().sort(function (a, b) { return a.midX - b.midX; });
    return next[0].el;
  }
  return null;
}

// ----------------------------------------------------------
// SINCRONIZAÇÃO DE CHECKBOXES
// ----------------------------------------------------------

function inicializarSincronizacaoCheckboxes() {
  document.addEventListener('change', function (e) {
    if (e.target.type !== 'checkbox') return;
    var name = e.target.name, checked = e.target.checked;
    document.querySelectorAll('input[type="checkbox"][name="' + name + '"]').forEach(function (cb) {
      if (cb !== e.target) cb.checked = checked;
    });
  });
}

// ----------------------------------------------------------
// MÚLTIPLOS ACHADOS
// ----------------------------------------------------------

function inicializarMultiplosAchados() {
  ['segmento','diver-segmento','canal-segmento'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.addEventListener('change', function (e) {
    if (!e.target || e.target.type !== 'checkbox') return;
    if (!e.target.closest || !e.target.closest('#exame-sec')) return;
    var multAch = document.getElementById('Multiplos-achados-sortable-exame');
    var val = (multAch && multAch.checked) ? '2' : '1';
    ['segmento','diver-segmento','canal-segmento'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = val;
    });
  });
}

// ----------------------------------------------------------
// CHECKBOXES DINÂMICOS
// ----------------------------------------------------------

function addParametersedacao() {
  var texto = 'Fentanil ' + getVal('fentanil') + ' + Midazolam ' + getVal('midazolam') +
    ' + Propofol titulado IV.<br>Suplementação de O2 por catéter nasal a 3 L/min.<br>Monitorização de oximetria de pulso e PNI.';
  appendToSortable('sortable-sedacao', createCheckboxDiv(texto, 'sedacao'));
}

function addParameter() {
  var localizacao    = getVal('localizacao');
  var lesaoSel       = document.getElementById('lesao');
  var lesao          = lesaoSel.value;
  var lesaoExtra     = getSelectedOptionExtra(lesaoSel);
  var numeroSel      = document.getElementById('numero');
  var numero         = numeroSel.value;
  var numeroExtra    = getSelectedOptionExtra(numeroSel);
  var tamanho        = getVal('tamanho');
  var ateTamanho     = getVal('atetamanho');
  var kudoSel        = document.getElementById('kudo');
  var kudo           = kudoSel.value;
  var kudoExtra      = getSelectedOptionExtra(kudoSel);
  var vasc           = getVal('vasc');
  var jnet           = getVal('jnet');
  var resseccaoSel   = document.getElementById('resseccao');
  var resseccao      = resseccaoSel.value;
  var resseccaoExtra = getSelectedOptionExtra(resseccaoSel);
  var segmentoSel    = document.getElementById('segmento');
  var hemostasia     = getVal('hemostasia');
  var alteracaoText;

  if (segmentoSel.value === '1') {
    var numExib      = (numero === '') ? '' : numero + ' ';
    var numExtraExib = (numeroExtra === '01') ? '' : numeroExtra + ' ';
    alteracaoText = 'A mucosa colorretal apresenta aspecto geral preservado, exceto pela presença de ' +
      numExib + lesao + ' ' + tamanho + ateTamanho + 'mm no ' + localizacao +
      kudo + vasc + kudoExtra + jnet + resseccao + hemostasia + '.';
    var conclusaoText = '- ' + numExtraExib + lesaoExtra + ' em ' + localizacao + resseccaoExtra + '.';
    if (lesaoExtra.includes('plano'))
      conclusaoText = conclusaoText.replace('Polipectomia', 'Ressecção com alça a frio (polipectomia)');
    if (numeroExtra !== '01') conclusaoText = pluralizar(conclusaoText);
    var diverSeg = document.getElementById('diver-segmento');
    if (diverSeg) diverSeg.selectedIndex = 2;
    appendToSortable('sortable-conclusao', createCheckboxDiv(conclusaoText, 'conclusao'));
  } else if (segmentoSel.value === '2') {
    alteracaoText = '- ' + localizacao + ': ' + numero + ' ' + lesao + ' ' +
      tamanho + ateTamanho + 'mm' + kudo + vasc + kudoExtra + jnet + resseccao + hemostasia + '.';
  } else { return; }

  if (numero !== '') alteracaoText = pluralizar(alteracaoText);
  if (lesao.includes('lesão') || lesao.includes('angiectasia'))
    alteracaoText = alteracaoText.replace('um', 'uma').replace('dois', 'duas');
  var divLesao = createCheckboxDiv(alteracaoText, 'alteracao');
  if (segmentoSel.value === '2') {
    divLesao.setAttribute('data-paris', lesaoExtra || '');
    divLesao.setAttribute('data-loc',   localizacao || '');
    divLesao.setAttribute('data-numero', numeroExtra || '01');
    divLesao.setAttribute('data-resseccao', resseccaoExtra || '');
  }
  appendToSortable('sortable-alteracao', divLesao);
}

var LESAO_PARIS_TO_COMPOSTA = {
  'Pólipo séssil':                'Pólipos sésseis',
  'Pólipo subpediculado':         'Pólipos subpediculados',
  'Pólipo pediculado':            'Pólipos pediculados',
  'Lesão planoelevada':           'Lesões planoelevadas',
  'Lesão planodeprimida':         'Lesões planodeprimidas',
  'LST-GH':                       'LSTs-GH',
  'LST granular nodular mista':   'LSTs granulares nodulares mistas',
  'LST-NG planoelevada':          'LSTs-NG planoelevadas',
  'LST-NG pseudodeprimida':       'LSTs-NG pseudodeprimidas'
};

var LESAO_LOC_TO_SEG = {
  'ceco':              'ceco',
  'cólon ascendente':  'ascendente',
  'ângulo hepático':   'anghep',
  'cólon transverso':  'transverso',
  'ângulo esplênico':  'angesp',
  'cólon descendente': 'descendente',
  'cólon sigmoide':    'sigmoide',
  'reto':              'reto'
};

var LESAO_RESS_TO_COMPOSTA = {
  '. Polipectomia':                                                'Polipectomias',
  '. Polipectomia com eletrocauterização':                         'Polipectomias com eletrocauterização',
  '. Mucosectomia em monobloco':                                   'Mucosectomias em monobloco',
  '. Ressecção em monobloco por ESD':                              'Ressecções em monobloco por ESD',
  '. Ressecção em monobloco por técnica híbrida (ESD + mucosectomia)': 'Ressecções em monobloco por técnica híbrida (ESD + mucosectomia)'
};

var ORDEM_SEGMENTOS = ['ceco','ascendente','anghep','transverso','angesp','descendente','sigmoide','reto'];

var SEG_TO_LOC_DISPLAY = {
  'ceco':        'ceco',
  'ascendente':  'cólon ascendente',
  'anghep':      'ângulo hepático',
  'transverso':  'cólon transverso',
  'angesp':      'ângulo esplênico',
  'descendente': 'cólon descendente',
  'sigmoide':    'cólon sigmoide',
  'reto':        'reto'
};

function gerarConclusoesCompostas() {
  document.querySelectorAll('#sortable-conclusao .item[data-auto="1"]').forEach(function (el) { el.remove(); });

  var quantidades = (_DB.conclusaoComposta && _DB.conclusaoComposta.quantidades) || {};
  var grupos = {};
  document.querySelectorAll('#sortable-alteracao .item[data-paris]').forEach(function (div) {
    var cb = div.querySelector('input[type="checkbox"]');
    if (cb && !cb.checked) return;
    var paris = div.getAttribute('data-paris');
    var loc   = div.getAttribute('data-loc');
    var ress  = div.getAttribute('data-resseccao');
    var num   = parseInt(div.getAttribute('data-numero'), 10) || 1;
    var seg   = LESAO_LOC_TO_SEG[loc];
    if (!seg) return;
    var key = paris + '||' + ress;
    if (!grupos[key]) grupos[key] = { paris: paris, ress: ress, segmentos: {} };
    grupos[key].segmentos[seg] = (grupos[key].segmentos[seg] || 0) + num;
  });

  var keys = Object.keys(grupos);
  if (keys.length === 0) {
    if (typeof mostrarToast === 'function') mostrarToast('Nenhuma lesão com dados estruturados encontrada.', '#7a5a1a', 3000);
    return;
  }

  keys.forEach(function (key) {
    var g = grupos[key];
    var segKeys = ORDEM_SEGMENTOS.filter(function (s) { return g.segmentos[s] > 0; });
    if (segKeys.length === 0) return;
    var isPlano = g.paris && g.paris.indexOf('plano') !== -1;
    var texto;

    if (segKeys.length === 1) {
      var seg = segKeys[0];
      var count = g.segmentos[seg];
      var locDisplay = SEG_TO_LOC_DISPLAY[seg];
      var numExtraExib = (count === 1) ? '' : String(count).padStart(2, '0') + ' ';
      texto = '- ' + numExtraExib + g.paris + ' em ' + locDisplay + g.ress + '.';
      if (isPlano) texto = texto.replace('Polipectomia', 'Ressecção com alça a frio (polipectomia)');
      if (count !== 1) texto = pluralizar(texto);
    } else {
      var lesao2 = LESAO_PARIS_TO_COMPOSTA[g.paris];
      var ress2  = LESAO_RESS_TO_COMPOSTA[g.ress];
      if (!lesao2 || !ress2) return;
      if (isPlano && ress2 === 'Polipectomias') ress2 = 'Ressecções com alça a frio (polipectomia)';
      var partes = '';
      ORDEM_SEGMENTOS.forEach(function (s) {
        var n = g.segmentos[s];
        if (!n || !quantidades[s]) return;
        partes += quantidades[s].prefixo.replace('{n}', String(n).padStart(2, '0'));
      });
      texto = '- ' + lesao2 + ' (' + partes + '). ' + ress2 + '.';
      texto = texto.replace(/\( /g, '(').replace(/;\)/g, ')').replace(/cólon /g, '');
    }

    var div = createCheckboxDiv(texto, 'conclusao');
    div.setAttribute('data-auto', '1');
    appendToSortable('sortable-conclusao', div);
  });
}

function addParameterdiv() {
  var diverLocal     = getVal('diver-local');
  var diverLocal2    = getVal('diver-local2');
  var diverFreqSel   = document.getElementById('diver-freq');
  var diverFreq      = diverFreqSel.value;
  var diverFreqExtra = getSelectedOptionExtra(diverFreqSel);
  var diverSegSel    = document.getElementById('diver-segmento');
  var diverticuloText = 'A mucosa colorretal apresenta aspecto geral preservado, exceto pela presença de ' +
    diverFreq + ' óstios diverticulares sem sinais inflamatórios em ' + diverLocal + diverLocal2 + '.';
  var conclusaoText = '- ' + diverFreqExtra + ' ' + diverLocal + diverLocal2 + '.';
  if (diverSegSel.value === '2')
    diverticuloText = '- ' + diverFreq + ' óstios diverticulares sem sinais inflamatórios em ' + diverLocal + diverLocal2 + '.';
  else if (diverSegSel.value === '3')
    diverticuloText = 'Ainda no ' + diverLocal + diverLocal2 + ', encontram-se ' + diverFreq + ' óstios diverticulares sem sinais inflamatórios.';
  if (diverLocal.includes('todos')) conclusaoText = '- Doença diverticular difusa dos cólons.';
  if (diverLocal2 !== '') {
    diverticuloText = diverticuloText.replace('cólon', 'cólons');
    conclusaoText   = conclusaoText.replace('cólon', 'cólons');
  }
  appendToSortable('sortable-diverticulo', createCheckboxDiv(diverticuloText, 'diverticulo'));
  appendToSortable('sortable-conclusao',   createCheckboxDiv(conclusaoText,   'conclusao'));
}

function addParametercanal() {
  var altanalSel     = document.getElementById('alt-anal');
  var localanalSel   = document.getElementById('local-anal');
  var canalSegSel    = document.getElementById('canal-segmento');
  var altanal        = altanalSel.value;
  var localanal      = localanalSel.value;
  var altanalExtra   = getSelectedOptionExtra(altanalSel);
  var localanalExtra = getSelectedOptionExtra(localanalSel);
  var canalText = 'À retroversão no reto, ' + altanal + ' ' + localanal + '.';
  if (canalSegSel.value === '2') canalText = '- à retroversão no reto, ' + altanal + ' ' + localanal + '.';
  appendToSortable('sortable-canalanal', createCheckboxDiv(canalText, 'canalanal'));
  if (altanalExtra && altanalExtra.trim() !== '')
    appendToSortable('sortable-conclusao', createCheckboxDiv('- ' + altanalExtra + localanalExtra + '.', 'conclusao'));
}

function addConclusaoCheckbox() {
  var num = getVal('numero-conc');
  var numExib = num === '' ? '' : num + ' ';
  var texto = '- ' + numExib + getVal('lesao-conc') + ' no ' + getVal('local-conc') + '. ' + getVal('resseccao-conc');
  if (Number(num) > 1) texto = pluralizar(texto);
  appendToSortable('sortable-conclusao', createCheckboxDiv(texto, 'conclusao'));
}

function addConclusao2Checkbox() {
  var segIds = ['numeroceco-conc','numeroasc-conc','numeroanghep-conc',
                'numerotransv-conc','numeroangesp-conc','numerodesc-conc',
                'numerosig-conc','numeroreto-conc'];
  var partes = segIds.map(function (id) { return getVal(id); }).join('');
  var texto = '- ' + getVal('lesao2-conc') + ' (' + partes + '). ' + getVal('resseccao2-conc') + '.';
  texto = texto.replace(/\( /g, '(').replace(/;\)/g, ')').replace(/cólon /g, '');
  appendToSortable('sortable-conclusao', createCheckboxDiv(texto, 'conclusao'));
}

// ----------------------------------------------------------
// EDITAR / CRIAR / EXCLUIR ITENS
// ----------------------------------------------------------

function showPopup() {
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  var container  = document.getElementById('checkbox-list');
  container.innerHTML = '';
  if (checkboxes.length === 0) {
    var p = document.createElement('p');
    p.textContent = 'Nenhum item selecionado para editar.';
    container.appendChild(p);
    document.getElementById('popup').style.display = 'block';
    document.getElementById('backdrop').classList.add('show');
    return;
  }
  checkboxes.forEach(function (cb) {
    var label     = document.querySelector('label[for="' + cb.id + '"]');
    var labelText = label ? label.innerText : '';
    var suffix    = cb.id.replace(cb.name, '');

    var itemDiv = document.createElement('div');
    itemDiv.style.cssText = 'border-bottom:1px solid #ccc;padding:10px 0;';

    var nomeWrap = document.createElement('div');
    var nomeStrong = document.createElement('strong');
    nomeStrong.textContent = 'Nome do Item:';
    nomeWrap.appendChild(nomeStrong);
    nomeWrap.appendChild(document.createElement('br'));
    var nomeInput = document.createElement('input');
    nomeInput.type = 'text';
    nomeInput.style.cssText = 'width:300px;margin-bottom:10px;';
    nomeInput.value = labelText;
    nomeInput.dataset.targetId = cb.id;
    nomeInput.dataset.suffix   = suffix;
    nomeWrap.appendChild(nomeInput);

    var valorWrap = document.createElement('div');
    var valorStrong = document.createElement('strong');
    valorStrong.textContent = 'Texto da entrada:';
    valorWrap.appendChild(valorStrong);
    valorWrap.appendChild(document.createElement('br'));
    var valorTa = document.createElement('textarea');
    valorTa.className = 'edit-value-input';
    valorTa.style.cssText = 'height:60px;width:90%;';
    valorTa.value = cb.value;
    valorTa.dataset.targetId = cb.id;
    valorWrap.appendChild(valorTa);

    nomeInput.addEventListener('input', function () {
      updateEverything(this.dataset.targetId, this.value, this.dataset.suffix, this, valorTa);
    });
    valorTa.addEventListener('input', function () {
      updateOnlyValue(this.dataset.targetId, this.value);
    });

    itemDiv.appendChild(nomeWrap);
    itemDiv.appendChild(valorWrap);
    container.appendChild(itemDiv);
  });
  document.getElementById('popup').style.display = 'block';
  document.getElementById('backdrop').classList.add('show');
}

function updateEverything(currentId, newName, suffix, nomeInput, valorTa) {
  var checkbox = document.getElementById(currentId);
  var label    = document.querySelector('label[for="' + currentId + '"]');
  if (checkbox && label) {
    var newId = newName + suffix;
    checkbox.id   = newId;
    checkbox.name = newName;
    label.setAttribute('for', newId);
    label.innerText = newName;
    if (nomeInput) nomeInput.dataset.targetId = newId;
    if (valorTa)   valorTa.dataset.targetId   = newId;
  }
}

function updateOnlyValue(id, newValue) {
  var cb = document.getElementById(id);
  if (cb) cb.value = newValue;
}

function hidePopup() {
  document.getElementById('popup').style.display = 'none';
  document.getElementById('checkbox-list').innerHTML = '';
  document.getElementById('backdrop').classList.remove('show');
}

function deleteCheckedCheckboxes() {
  if (_modoVisitante) {
    mostrarToast('👤 Modo visitante — exclusão não permitida.', '#7a4000', 4000);
    return;
  }
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  if (checkboxes.length > 0 && confirm('Deseja excluir os itens selecionados?')) {
    checkboxes.forEach(function (cb) { (cb.closest('.item') || cb.parentElement).remove(); });
    hidePopup();
  }
}

function showCreatePopup() {
  document.getElementById('create-popup').style.display = 'block';
  document.getElementById('backdrop').classList.add('show');
}
function hideCreatePopup() {
  document.getElementById('create-popup').style.display = 'none';
  document.getElementById('backdrop').classList.remove('show');
}

function createCheckbox() {
  if (_modoVisitante) {
    mostrarToast('👤 Modo visitante — criação não permitida.', '#7a4000', 4000);
    return;
  }
  var nome      = document.getElementById('checkbox-name').value;
  var valor     = document.getElementById('checkbox-value').value.replace(/\n/g, '<br>');
  var sectionId = getVal('section-select');
  var section   = document.getElementById(sectionId);
  var div = document.createElement('div');
  div.className = 'item';
  div.setAttribute('data-populated', '1');
  var cb = document.createElement('input');
  cb.type = 'checkbox'; cb.name = nome; cb.value = valor; cb.id = nome + '-' + sectionId;
  var lbl = document.createElement('label');
  lbl.htmlFor = cb.id; lbl.innerHTML = nome;
  div.appendChild(cb); div.appendChild(lbl);
  section.appendChild(document.createTextNode('\n'));
  section.appendChild(div);
  document.getElementById('create-popup').style.display = 'none';
  document.getElementById('checkbox-name').value  = '';
  document.getElementById('checkbox-value').value = '';
  mostrarToast('✅ Item criado! Clique em "Salvar no GitHub" para persistir.');
}

// ----------------------------------------------------------
// LIMPAR SELEÇÃO
// ----------------------------------------------------------

function uncheckAll() {
  document.querySelectorAll('input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
  registrarSnapshot();
  if (typeof _agendarLiveLaudo === 'function') _agendarLiveLaudo();
}

// ----------------------------------------------------------
// SERIALIZAR DOM → objeto JS
// ----------------------------------------------------------

var IDS_CONTROLE = new Set([
  'polipos','diver-sortable','canal-sortable','sedacao-dinamico',
  'alteracao-conc-sortable-conclusao','alteracoes-conc-sortable-conclusao'
]);

function serializarSecao(containerId, opts) {
  opts = opts || {};
  var container = document.getElementById(containerId);
  if (!container) return [];
  var itens = [];
  container.querySelectorAll(':scope > .item').forEach(function (div) {
    if (opts.semDinamicos && div.classList.contains('item-dinamico')) return;
    if (div.getAttribute('data-sep') === '1') { itens.push({ separador: true }); return; }
    if (div.getAttribute('data-ph')) return; // placeholder de drag — ignorar
    var cb = div.querySelector('input[type="checkbox"]');
    if (!cb || IDS_CONTROLE.has(cb.id) || IDS_CONTROLE.has(cb.name)) return;
    var label = div.querySelector('label');
    var nome  = label ? label.innerText.trim() : cb.name;
    if (!nome) return;
    var item = { nome: nome };
    var idPadrao = nome + '-' + containerId;
    if (cb.id && cb.id !== idPadrao) item.id = cb.id;
    item.valor = cb.value;
    itens.push(item);
  });
  return itens;
}

function serializarSelect(id) {
  var sel = document.getElementById(id);
  if (!sel) return [];
  return Array.from(sel.options).map(function (opt) {
    var obj   = { valor: opt.value, label: opt.text };
    var extra = opt.getAttribute('data-extra');
    if (extra !== null) obj.extra = extra;
    return obj;
  });
}

// ----------------------------------------------------------
// MONTAR CONTEÚDO DO dados_colono.js
// ----------------------------------------------------------

function montarConteudoJS(dbObj) {
  return '// ============================================================\n' +
    '// BANCO DE DADOS \u2014 Gerar Laudo Colonoscopia\n' +
    '// Salvo em: ' + new Date().toLocaleString('pt-BR') + '\n' +
    '// ============================================================\n\n' +
    'var DB_PADRAO = ' + JSON.stringify(dbObj, null, 2) + ';\n';
}

function _valoresDoSelect(id) {
  var sel = document.getElementById(id);
  return sel ? Array.from(sel.options).map(function (o) { return o.value; }) : [];
}

function coletarDB(opts) {
  return {
    indicacao:   serializarSecao('sortable-indicacao', opts),
    equipamento: serializarSecao('sortable-equipamento', opts),
    sedacao:     serializarSecao('sortable-sedacao', opts),
    sedacaoSelects: {
      fentanil:  _valoresDoSelect('fentanil'),
      midazolam: _valoresDoSelect('midazolam')
    },
    preparo:  serializarSecao('sortable-preparo', opts),
    exame:    serializarSecao('sortable-exame', opts),
    lesoes: {
      localizacao: serializarSelect('localizacao'),
      paris:       serializarSelect('lesao'),
      numero:      serializarSelect('numero'),
      tamanho:     serializarSelect('tamanho').map(function (o) { return Number(o.valor); }).filter(Boolean),
      ateTamanho:  serializarSelect('atetamanho'),
      kudo:        serializarSelect('kudo'),
      vasc:        serializarSelect('vasc'),
      jnet:        serializarSelect('jnet'),
      resseccao:   serializarSelect('resseccao'),
      resseccao3:  serializarSelect('resseccao3'),
      hemostasia:  serializarSelect('hemostasia')
    },
    diverticulos: {
      local:      serializarSelect('diver-local'),
      local2:     serializarSelect('diver-local2'),
      frequencia: serializarSelect('diver-freq')
    },
    canalAnal: {
      alteracao: serializarSelect('alt-anal'),
      local:     serializarSelect('local-anal')
    },
    conclusao: serializarSecao('sortable-conclusao', opts),
    conclusaoSimples: {
      numero:    serializarSelect('numero-conc'),
      lesao:     serializarSelect('lesao-conc'),
      local:     serializarSelect('local-conc'),
      resseccao: serializarSelect('resseccao-conc')
    },
    conclusaoComposta: {
      lesao:      serializarSelect('lesao2-conc'),
      quantidades: _DB.conclusaoComposta.quantidades,
      resseccao:  serializarSelect('resseccao2-conc')
    },
    obs:    serializarSecao('sortable-obs', opts),
    outros: serializarSecao('sortable-outros', opts)
  };
}

// ----------------------------------------------------------
// CONFIGURAÇÃO DO GITHUB (via config.js)
// Token criptografado: descriptografado uma vez por sessão
// ----------------------------------------------------------

function lerConfigGitHub() {
  if (typeof GITHUB_CONFIG !== 'undefined') return GITHUB_CONFIG;
  return {};
}

function githubConfigurado() {
  var c = lerConfigGitHub();
  if (c.tokenCriptografado) return !!sessionStorage.getItem('colono_github_token');
  return !!(c.token && c.owner && c.repo);
}

function atualizarStatusGitHub() {
  var el = document.getElementById('github-status');
  if (!el) return;
  var c = lerConfigGitHub();
  if (!c.owner) {
    el.textContent = '⚠️ config.js não configurado';
    el.style.color = 'rgba(255,255,255,.55)';
    return;
  }
  if (c.tokenCriptografado) {
    if (sessionStorage.getItem('colono_github_token')) {
      el.textContent = '✅ GitHub: ' + c.owner + '/' + c.repo + ' (🔓 ativo)';
      el.style.color = 'rgba(255,255,255,.88)';
    } else {
      el.textContent = '🔒 GitHub: ' + c.owner + '/' + c.repo + ' (password necessário para salvar)';
      el.style.color = 'rgba(255,255,255,.62)';
    }
  } else if (c.token) {
    el.textContent = '✅ GitHub: ' + c.owner + '/' + c.repo;
    el.style.color = 'rgba(255,255,255,.88)';
  } else {
    el.textContent = '⚠️ Token não configurado em config.js';
    el.style.color = 'rgba(255,255,255,.55)';
  }
}

async function descriptografarToken(senha) {
  try {
    var c       = lerConfigGitHub();
    var fromB64 = function (b64) { return Uint8Array.from(atob(b64), function (ch) { return ch.charCodeAt(0); }); };
    var salt    = fromB64(c.salt);
    var iv      = fromB64(c.iv);
    var cifrado = fromB64(c.tokenCriptografado);
    var keyMat  = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveKey']);
    var key     = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: 200000, hash: 'SHA-256' },
      keyMat, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    var dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, cifrado);
    return new TextDecoder().decode(dec);
  } catch (e) { return null; }
}

// Exibe o modal de senha e resolve com o valor digitado (ou null se cancelar)
function pedirSenha(msg) {
  return new Promise(function (resolve) {
    var overlay  = document.getElementById('senha-overlay');
    var msgEl    = document.getElementById('senha-msg');
    var input    = document.getElementById('senha-input');
    var btnOk    = document.getElementById('senha-ok');
    var btnCanc  = document.getElementById('senha-cancelar');

    msgEl.textContent = msg;
    input.value = '';
    overlay.classList.add('show');
    input.focus();

    function fechar(valor) {
      overlay.classList.remove('show');
      btnOk.removeEventListener('click', onOk);
      btnCanc.removeEventListener('click', onCanc);
      input.removeEventListener('keydown', onKey);
      resolve(valor);
    }
    function onOk()          { fechar(input.value); }
    function onCanc()        { fechar(null); }
    function onKey(e)        { if (e.key === 'Enter') fechar(input.value); if (e.key === 'Escape') fechar(null); }

    btnOk.addEventListener('click', onOk);
    btnCanc.addEventListener('click', onCanc);
    input.addEventListener('keydown', onKey);
  });
}

async function inicializarTokenGitHub() {
  var c = lerConfigGitHub();

  if (!c.tokenCriptografado) {
    atualizarStatusGitHub();
    return;
  }

  if (sessionStorage.getItem('colono_github_token')) {
    atualizarStatusGitHub();
    return;
  }

  var tentativas = 0;
  while (tentativas < 3) {
    var msg   = tentativas === 0 ? '🔐 Digite a senha para ativar o GitHub:'
                                 : '❌ Senha incorreta. Tentativa ' + (tentativas + 1) + '/3:';
    var senha = await pedirSenha(msg);
    if (senha === null) break;
    var token = await descriptografarToken(senha);
    if (token) {
      sessionStorage.setItem('colono_github_token', token);
      mostrarToast('🔓 GitHub ativado para esta sessão!', '#1a3a1a');
      atualizarStatusGitHub();
      return;
    }
    tentativas++;
  }
  if (tentativas >= 3) mostrarToast('⚠️ Senha incorreta 3×. GitHub inativo nesta sessão.', '#7a1a1a');
  atualizarStatusGitHub();
}

// ----------------------------------------------------------
// BACKUP NO GITHUB VIA API
// ----------------------------------------------------------

async function salvarBackupGitHub() {
  var c = lerConfigGitHub();

  if (c.tokenCriptografado && !sessionStorage.getItem('colono_github_token')) {
    await inicializarTokenGitHub();
    if (!sessionStorage.getItem('colono_github_token')) return;
  }

  var token = sessionStorage.getItem('colono_github_token') || c.token;

  if (!c.owner || !c.repo) {
    mostrarToast('⚠️ config.js sem owner/repo.', '#7a4000', 6000);
    return;
  }
  if (!token) {
    mostrarToast('⚠️ Token ausente. Verifique config.js.', '#7a4000', 6000);
    return;
  }

  var branch  = c.branch || 'main';
  var path    = c.path   || 'dados_colono.js';
  var apiBase = 'https://api.github.com/repos/' + c.owner + '/' + c.repo + '/contents/' + path;
  var headers = {
    'Authorization': 'token ' + token,
    'Accept':        'application/vnd.github+json',
    'Content-Type':  'application/json'
  };

  mostrarToast('🔄 Enviando para o GitHub…', '#1a2e3a', 10000);

  try {
    var getResp = await fetch(apiBase + '?ref=' + encodeURIComponent(branch), { headers: headers });
    if (!getResp.ok && getResp.status !== 404) {
      var errGet = await getResp.json().catch(function () { return {}; });
      throw new Error(errGet.message || 'HTTP ' + getResp.status);
    }
    var getSha = getResp.ok ? (await getResp.json().catch(function () { return {}; })).sha : undefined;

    var dbAtualizado = coletarDB({ semDinamicos: true });
    var conteudo     = montarConteudoJS(dbAtualizado);
    var conteudoB64  = btoa(unescape(encodeURIComponent(conteudo)));
    var body = {
      message: 'Atualização via interface — ' + new Date().toLocaleString('pt-BR'),
      content: conteudoB64,
      branch:  branch
    };
    if (getSha) body.sha = getSha;

    var putResp = await fetch(apiBase, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
    if (!putResp.ok) {
      var errPut = await putResp.json().catch(function () { return {}; });
      var msg = errPut.message || ('HTTP ' + putResp.status);
      if (putResp.status === 401) msg = 'Token inválido ou expirado (401).';
      if (putResp.status === 403) msg = 'Sem permissão de escrita (403). Token precisa de Contents: Read and write.';
      if (putResp.status === 404) msg = '404 no PUT — token sem acesso ao repositório ou caminho errado.';
      if (putResp.status === 409) msg = 'Conflito de versão (409). Recarregue e tente novamente.';
      if (putResp.status === 422) msg = 'SHA inválido (422). Recarregue e tente novamente.';
      throw new Error(msg);
    }

    Object.assign(_DB, dbAtualizado);
    mostrarToast('✅ dados_colono.js salvo no GitHub!', '#1a3a1a', 4000);
    console.log('[salvarDados] Sucesso!');

  } catch (e) {
    mostrarToast('❌ ' + e.message, '#7a1a1a', 8000);
    console.error('[salvarDados]', e);
  }
}

// ----------------------------------------------------------
// GERAR LAUDO
// ----------------------------------------------------------

function montarLaudo() {
  var text = "<span class='bold'>COLONOSCOPIA</span><br><br><br>";
  var sections = [
    { id: 'sortable-indicacao',  prefix: "<span class='bold'>Indicação: </span>", suffix: '<br><br>' },
    { id: 'sortable-equipamento',prefix: "<span class='bold'>Equipamento: </span>", suffix: '<br><br>' },
    { id: 'sedacao-sec',         prefix: "<span class='bold'>Sedação: </span>", suffix: '<br><br><br>' },
    { id: 'exame-sec',           prefix: '', suffix: '<br>' },
    { id: 'alteracao',           prefix: '', suffix: '<br>' },
    { id: 'diverticulo',         prefix: '', suffix: '<br>' },
    { id: 'canalanal',           prefix: '', suffix: '<br>' },
    { id: 'conclusao-sec',       prefix: '<br><br><span class="bold">Conclusão:</span><br><br>', suffix: '<br>' },
    { id: 'obs',                 prefix: '<br>Observação: ', suffix: '<br>' },
    { id: 'outros-sec',          prefix: '', suffix: '<br><br>' }
  ];

  function _qChecked(seletor) {
    return Array.from(document.querySelectorAll(seletor + ' input[type="checkbox"]:checked'));
  }
  function _isChecked(id) {
    var el = document.getElementById(id);
    return !!(el && el.checked);
  }

  var preparoText = '';
  _qChecked('#preparo-sec').forEach(function (cb) { preparoText += cb.value; });

  for (var i = 0; i < sections.length; i++) {
    var s = sections[i], sectionText = '', prefix = s.prefix;
    if (s.id === 'sedacao-sec' && _isChecked('geral')) prefix = '';
    _qChecked('#' + s.id).forEach(function (cb) { sectionText += cb.value + s.suffix; });
    if (sectionText) text += prefix + sectionText;
  }

  var ressIndic = document.querySelector("[id='Ressecção de lesão-sortable-indicacao']");
  var retoExame = document.querySelector("[id='Retossigmoidoscopia-sortable-exame']");
  if (ressIndic && ressIndic.checked && retoExame && retoExame.checked)
    text = text.replace('COLONOSCOPIA', 'RETOSSIGMOIDOSCOPIA TERAPÊUTICA');
  if (ressIndic && ressIndic.checked)
    text = text.replace('COLONOSCOPIA', 'COLONOSCOPIA TERAPÊUTICA');
  if (preparoText)
    text = text.replace('Preparo adequado para o exame (Boston 9).', preparoText);
  if (text.includes('no ceco') || text.includes('em ceco') || text.includes('- ceco'))
    text = text.replace('Ceco, válvula ileocecal e óstio apendicular', 'Válvula ileocecal e óstio apendicular');
  if (text.includes('Preparo regular'))
    text = text.replace('com trama vascular e mucosa de aspecto normal.', 'sem lesões visíveis.');
  if (text.includes('Introdução do colonoscópio pelo canal anal até o cólon descendente.'))
    text = text.replace("<span class='bold'>COLONOSCOPIA</span><br><br><br>", "<span class='bold'>RETOSSIGMOIDOSCOPIA</span><br><br><br>");
  if (_qChecked('#outros-sec').length > 0)
    text = text.replace("<span class='bold'>COLONOSCOPIA</span><br><br><br>", '');
  if (text.includes('Material utilizado'))
    text = text.replace('Observação: Material utilizado: ', 'Material utilizado: ');

  var canalanalText = '';
  _qChecked('#canalanal').forEach(function (cb) { canalanalText += cb.value; });
  if (canalanalText.length > 0) text = text.replace(/Reto sem alterações./g, '');

  text = text.replace(/<span class='bold'>/g, '<span style="font-weight:bold">')
             .replace(/<span class="bold">/g, '<span style="font-weight:bold">');

  var output = document.getElementById('output');
  if (!output) return null;
  if (document.activeElement === output) return output;
  output.innerHTML = text;
  return output;
}

async function _copiarSaida(output, fontSizePt, msgSucesso) {
  var html = '<div style="font-family:Arial,sans-serif;font-size:' + fontSizePt + 'pt;">' + output.innerHTML + '</div>';
  if (navigator.clipboard && window.ClipboardItem) {
    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html':  new Blob([html],             { type: 'text/html' }),
        'text/plain': new Blob([output.innerText], { type: 'text/plain' })
      })]);
      mostrarToast(msgSucesso, '#1a3a1a');
      return;
    } catch (e) { /* fallback abaixo */ }
  }
  copiarPorSelecao(output);
  mostrarToast(msgSucesso, '#1a3a1a');
}

function generateText() {
  var output = montarLaudo();
  if (!output) return;
  try { output.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  salvarUltimoLaudo();
  _copiarSaida(output, 12, '📋 Laudo gerado e copiado!');
}

function copiarPorSelecao(output) {
  output.focus();
  var sel   = window.getSelection();
  var range = document.createRange();
  range.selectNodeContents(output);
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand('copy');
  sel.removeAllRanges();
}

// ----------------------------------------------------------
// COPIAR TEXTO
// ----------------------------------------------------------

function copiarConteudo() {
  _copiarSaida(document.getElementById('output'), 12, '📄 Texto copiado!');
}

function copiarFormatado() {
  _copiarSaida(document.getElementById('output'), 11, '🖨️ Copiado em Arial 11!');
}

// ----------------------------------------------------------
// INICIALIZA AO CARREGAR
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', inicializarFirebase);
