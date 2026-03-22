// ============================================================
// FUNÇÕES — Gerar Laudo Colonoscopia
// Depende de: config.js e dados_colono.js (carregados antes)
// ============================================================

// ----------------------------------------------------------
// BANCO ATIVO
// Usa _DB internamente para nunca colidir com variáveis do
// dados_colono.js (que pode declarar DB ou DB_PADRAO).
// Prioridade: localStorage > DB_PADRAO > DB
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
        '&#10060; Erro: <b>dados_colono.js</b> n&#227;o carregou.<br><br>' +
        'Certifique-se de que o reposit&#243;rio cont&#233;m os 4 arquivos:<br>' +
        '<code>index.html &nbsp; config.js &nbsp; dados_colono.js &nbsp; funcoes_colono.js</code>' +
        '</div>';
    });
    return;
  }
  try {
    var salvo = localStorage.getItem('colonoDB');
    _DB = salvo ? JSON.parse(salvo) : JSON.parse(JSON.stringify(fonte));
  } catch (e) {
    _DB = JSON.parse(JSON.stringify(fonte));
  }
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

function createCheckboxDiv(text, name) {
  var div = document.createElement('div');
  div.className = 'item ui-sortable-handle';
  div.style.display = 'block';
  div.innerHTML = '<input type="checkbox" name="' + name + '" value="' + text + '" checked><label>' + text + '</label>';
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
  for (var s in PLURAIS) texto = texto.replace(s, PLURAIS[s]);
  return texto;
}

// ----------------------------------------------------------
// TOAST
// ----------------------------------------------------------

function mostrarToast(msg, cor) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = cor || '#1a3a1a';
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 2800);
}

// ----------------------------------------------------------
// INDICADOR DE STATUS — localStorage
// ----------------------------------------------------------

function atualizarIndicadorStorage() {
  var dot   = document.getElementById('storage-dot');
  var label = document.getElementById('storage-label');
  if (!dot || !label) return;
  if (localStorage.getItem('colonoDB')) {
    dot.className     = 'dot';
    label.textContent = 'Banco salvo no navegador';
  } else {
    dot.className     = 'dot unsaved';
    label.textContent = 'Usando banco padrão';
  }
}

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
  itens.forEach(function (item) {
    var div = document.createElement('div');
    div.className = 'item ui-sortable-handle';
    var id = item.id || (item.nome + '-' + nomeSortable);
    var valorEscapado = (item.valor || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    div.innerHTML =
      '<input type="checkbox" name="' + item.nome + '" value="' + valorEscapado + '" id="' + id + '">' +
      '<label for="' + id + '" contenteditable="true">' + item.nome + '</label>';
    container.appendChild(div);
  });
}

function inicializar() {
  popularCheckboxSection('sortable-indicacao',  _DB.indicacao,  'sortable-indicacao');
  popularCheckboxSection('sortable-equipamento',_DB.equipamento,'sortable-equipamento');
  popularCheckboxSection('sortable-sedacao',    _DB.sedacao,    'sortable-sedacao');
  popularCheckboxSection('sortable-preparo',    _DB.preparo,    'sortable-preparo');
  popularCheckboxSection('sortable-exame',      _DB.exame,      'sortable-exame');
  popularCheckboxSection('sortable-conclusao',  _DB.conclusao,  'sortable-conclusao');
  popularCheckboxSection('sortable-obs',        _DB.obs,        'sortable-obs');
  popularCheckboxSection('sortable-outros',     _DB.outros,     'sortable-outros');

  popularSelect('fentanil',  _DB.sedacaoSelects.fentanil.map(function (v) { return { valor: v, label: v || '-' }; }));
  popularSelect('midazolam', _DB.sedacaoSelects.midazolam.map(function (v) { return { valor: v, label: v || '-' }; }));

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
  atualizarIndicadorStorage();
  atualizarStatusGitHub();
  inicializarTokenGitHub();
}

// ----------------------------------------------------------
// DRAG & DROP
// ----------------------------------------------------------

function inicializarSortable() {
  ['#sortable-indicacao','#sortable-equipamento','#sortable-sedacao',
   '#sortable-preparo','#sortable-exame','#sortable-alteracao',
   '#sortable-canalanal','#sortable-conclusao','#sortable-obs','#sortable-outros']
  .forEach(function (sel) {
    $(sel).sortable({
      update: function () {
        var c = $(this), items = c.children('.item').get();
        c.empty();
        items.forEach(function (i) { c.append(i); c.append('\n'); });
      }
    });
  });
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
    if (e.target.id !== 'Multiplos-achados-sortable-exame') return;
    var val = e.target.checked ? '2' : '1';
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
  appendToSortable('sortable-alteracao', createCheckboxDiv(alteracaoText, 'alteracao'));
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
  var texto = '- ' + getVal('numero-conc') + ' ' + getVal('lesao-conc') + ' no ' + getVal('local-conc') + '. ' + getVal('resseccao-conc');
  if (Number(getVal('numero-conc')) > 1) texto = pluralizar(texto);
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
    container.innerHTML = '<p>Nenhum item selecionado para editar.</p>';
    document.getElementById('popup').style.display = 'block';
    return;
  }
  checkboxes.forEach(function (cb) {
    var label     = document.querySelector('label[for="' + cb.id + '"]');
    var labelText = label ? label.innerText : '';
    var suffix    = cb.id.replace(cb.name, '');
    var itemDiv   = document.createElement('div');
    itemDiv.style.cssText = 'border-bottom:1px solid #ccc;padding:10px 0;';
    itemDiv.innerHTML =
      '<div><strong>Nome do Item:</strong><br>' +
      '<input type="text" style="width:300px;margin-bottom:10px;"' +
      ' oninput="updateEverything(\'' + cb.id + '\',this.value,\'' + suffix + '\',this)"' +
      ' value="' + labelText + '"></div>' +
      '<div><strong>Texto da entrada:</strong><br>' +
      '<textarea class="edit-value-input" style="height:60px;width:90%;"' +
      ' oninput="updateOnlyValue(\'' + cb.id + '\',this.value)">' + cb.value + '</textarea></div>';
    container.appendChild(itemDiv);
  });
  document.getElementById('popup').style.display = 'block';
}

function updateEverything(currentId, newName, suffix, inputEl) {
  var checkbox = document.getElementById(currentId);
  var label    = document.querySelector('label[for="' + currentId + '"]');
  var newId    = newName + suffix;
  if (checkbox && label) {
    checkbox.id = newId; checkbox.name = newName;
    label.setAttribute('for', newId); label.innerText = newName;
    inputEl.setAttribute('oninput', 'updateEverything(\'' + newId + '\',this.value,\'' + suffix + '\',this)');
    inputEl.closest('div').parentElement.querySelector('.edit-value-input')
      .setAttribute('oninput', 'updateOnlyValue(\'' + newId + '\',this.value)');
  }
}

function updateOnlyValue(id, newValue) {
  var cb = document.getElementById(id);
  if (cb) cb.value = newValue;
}

function hidePopup() {
  document.getElementById('popup').style.display = 'none';
  document.getElementById('checkbox-list').innerHTML = '';
}

function deleteCheckedCheckboxes() {
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  if (checkboxes.length > 0 && confirm('Deseja excluir os itens selecionados?')) {
    checkboxes.forEach(function (cb) { (cb.closest('.item') || cb.parentElement).remove(); });
    hidePopup();
  }
}

function showCreatePopup() { document.getElementById('create-popup').style.display = 'block'; }
function hideCreatePopup() { document.getElementById('create-popup').style.display = 'none'; }

function createCheckbox() {
  var nome      = document.getElementById('checkbox-name').value;
  var valor     = document.getElementById('checkbox-value').value.replace(/\n/g, '<br>');
  var sectionId = getVal('section-select');
  var section   = document.getElementById(sectionId);
  var div = document.createElement('div');
  div.className = 'item';
  var cb = document.createElement('input');
  cb.type = 'checkbox'; cb.name = nome; cb.value = valor; cb.id = nome + '-' + sectionId;
  var lbl = document.createElement('label');
  lbl.htmlFor = cb.id; lbl.setAttribute('contenteditable', 'true'); lbl.innerHTML = nome;
  div.appendChild(cb); div.appendChild(lbl);
  section.appendChild(document.createTextNode('\n'));
  section.appendChild(div);
  document.getElementById('create-popup').style.display = 'none';
  document.getElementById('checkbox-name').value  = '';
  document.getElementById('checkbox-value').value = '';
  mostrarToast('✅ Item criado! Clique em "Salvar" para persistir.');
}

// ----------------------------------------------------------
// LIMPAR SELEÇÃO
// ----------------------------------------------------------

function uncheckAll() {
  document.querySelectorAll('input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
}

// ----------------------------------------------------------
// SERIALIZAR DOM → objeto JS
// ----------------------------------------------------------

var IDS_CONTROLE = new Set([
  'polipos','diver-sortable','canal-sortable','sedacao-dinamico',
  'alteracao-conc-sortable-conclusao','alteracoes-conc-sortable-conclusao'
]);

function serializarSecao(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return [];
  var itens = [];
  container.querySelectorAll(':scope > .item').forEach(function (div) {
    var cb = div.querySelector('input[type="checkbox"]');
    if (!cb || IDS_CONTROLE.has(cb.id) || IDS_CONTROLE.has(cb.name)) return;
    var label = div.querySelector('label');
    var nome  = label ? label.innerText.trim() : cb.name;
    if (!nome) return;
    var tmp = document.createElement('textarea');
    tmp.innerHTML = cb.value;
    var item = { nome: nome };
    var idPadrao = nome + '-' + containerId;
    if (cb.id && cb.id !== idPadrao) item.id = cb.id;
    item.valor = tmp.value;
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
    'const DB_PADRAO = ' + JSON.stringify(dbObj, null, 2) + ';\n';
}

function coletarDB() {
  return {
    indicacao:   serializarSecao('sortable-indicacao'),
    equipamento: serializarSecao('sortable-equipamento'),
    sedacao:     serializarSecao('sortable-sedacao'),
    sedacaoSelects: {
      fentanil:  Array.from(document.getElementById('fentanil').options).map(function (o) { return o.value; }),
      midazolam: Array.from(document.getElementById('midazolam').options).map(function (o) { return o.value; })
    },
    preparo:  serializarSecao('sortable-preparo'),
    exame:    serializarSecao('sortable-exame'),
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
    conclusao: serializarSecao('sortable-conclusao'),
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
    obs:    serializarSecao('sortable-obs'),
    outros: serializarSecao('sortable-outros')
  };
}

// ----------------------------------------------------------
// CONFIGURAÇÃO DO GITHUB
// Prioridade: config.js (GITHUB_CONFIG) > localStorage (popup manual)
// Token criptografado: descriptografado uma vez por sessão
// ----------------------------------------------------------

function lerConfigGitHub() {
  if (typeof GITHUB_CONFIG !== 'undefined') return GITHUB_CONFIG;
  try { return JSON.parse(localStorage.getItem('colono_github_cfg') || '{}'); }
  catch (e) { return {}; }
}

function githubConfigurado() {
  if (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG.tokenCriptografado)
    return !!sessionStorage.getItem('colono_github_token');
  var c = lerConfigGitHub();
  return !!(c.token && c.owner && c.repo);
}

async function descriptografarToken(senha) {
  try {
    var cfg     = lerConfigGitHub();
    var fromB64 = function (b64) { return Uint8Array.from(atob(b64), function (c) { return c.charCodeAt(0); }); };
    var salt    = fromB64(cfg.salt);
    var iv      = fromB64(cfg.iv);
    var cifrado = fromB64(cfg.tokenCriptografado);
    var keyMat  = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveKey']);
    var key     = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: 200000, hash: 'SHA-256' },
      keyMat, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    var dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, cifrado);
    return new TextDecoder().decode(dec);
  } catch (e) { return null; }
}

async function inicializarTokenGitHub() {
  if (typeof GITHUB_CONFIG === 'undefined' || !GITHUB_CONFIG.tokenCriptografado) {
    atualizarStatusGitHub(); return;
  }
  if (sessionStorage.getItem('colono_github_token')) { atualizarStatusGitHub(); return; }
  var tentativas = 0;
  while (tentativas < 3) {
    var msg   = tentativas === 0 ? '\uD83D\uDD10 Digite a senha para ativar o GitHub:'
                                 : '\u274C Senha incorreta. Tentativa ' + (tentativas + 1) + '/3:';
    var senha = prompt(msg);
    if (senha === null) break;
    var token = await descriptografarToken(senha);
    if (token) {
      sessionStorage.setItem('colono_github_token', token);
      mostrarToast('\uD83D\uDD13 GitHub ativado para esta sessão!', '#1a3a1a');
      atualizarStatusGitHub(); return;
    }
    tentativas++;
  }
  if (tentativas >= 3) mostrarToast('\u26A0\uFE0F Senha incorreta 3\u00D7. GitHub inativo nesta sessão.', '#7a1a1a');
  atualizarStatusGitHub();
}

function atualizarStatusGitHub() {
  var el = document.getElementById('github-status');
  if (!el) return;
  var c = lerConfigGitHub();
  if (typeof GITHUB_CONFIG !== 'undefined' && GITHUB_CONFIG.tokenCriptografado) {
    if (sessionStorage.getItem('colono_github_token')) {
      el.textContent = '\u2705 GitHub: ' + c.owner + '/' + c.repo + ' (\uD83D\uDD13 ativo)';
      el.style.color = '#2a6e3f';
    } else {
      el.textContent = '\uD83D\uDD12 GitHub: ' + c.owner + '/' + c.repo + ' (sessão inativa)';
      el.style.color = '#a04000';
    }
  } else if (githubConfigurado()) {
    el.textContent = '\u2705 GitHub: ' + c.owner + '/' + c.repo;
    el.style.color = '#2a6e3f';
  } else {
    el.textContent = '\u26A0\uFE0F GitHub não configurado';
    el.style.color = '#a04000';
  }
}

function showConfigPopup() {
  var c = lerConfigGitHub();
  document.getElementById('cfg-token').value  = c.token  || '';
  document.getElementById('cfg-owner').value  = c.owner  || '';
  document.getElementById('cfg-repo').value   = c.repo   || '';
  document.getElementById('cfg-branch').value = c.branch || 'main';
  document.getElementById('cfg-path').value   = c.path   || 'dados_colono.js';
  document.getElementById('config-popup').style.display = 'block';
}
function hideConfigPopup() { document.getElementById('config-popup').style.display = 'none'; }

function salvarConfigGitHub() {
  var cfg = {
    token:  document.getElementById('cfg-token').value.trim(),
    owner:  document.getElementById('cfg-owner').value.trim(),
    repo:   document.getElementById('cfg-repo').value.trim(),
    branch: document.getElementById('cfg-branch').value.trim() || 'main',
    path:   document.getElementById('cfg-path').value.trim()   || 'dados_colono.js'
  };
  if (!cfg.token || !cfg.owner || !cfg.repo) { alert('Preencha Token, Usuário e Repositório.'); return; }
  localStorage.setItem('colono_github_cfg', JSON.stringify(cfg));
  mostrarToast('\u2699\uFE0F Configuração salva!', '#1a2e3a');
  atualizarStatusGitHub();
  hideConfigPopup();
}

function limparConfigGitHub() {
  if (!confirm('Remover configuração do GitHub?')) return;
  localStorage.removeItem('colono_github_cfg');
  atualizarStatusGitHub();
  mostrarToast('\uD83D\uDD0C Configuração removida.', '#555');
  hideConfigPopup();
}

// ----------------------------------------------------------
// SALVAR NO GITHUB VIA API
// ----------------------------------------------------------

async function salvarNoGitHub(dbAtualizado) {
  var c     = lerConfigGitHub();
  var token = sessionStorage.getItem('colono_github_token') || c.token;
  if (!token || !c.owner || !c.repo) {
    mostrarToast('\u26A0\uFE0F GitHub não configurado ou sessão inativa. Recarregue a página.', '#7a4000');
    return false;
  }
  var apiBase = 'https://api.github.com/repos/' + c.owner + '/' + c.repo + '/contents/' + c.path;
  var headers = {
    'Authorization': 'token ' + token,
    'Accept':        'application/vnd.github+json',
    'Content-Type':  'application/json'
  };
  mostrarToast('\uD83D\uDD04 Enviando para o GitHub\u2026', '#1a2e3a');
  try {
    var getResp = await fetch(apiBase + '?ref=' + c.branch, { headers: headers });
    if (!getResp.ok && getResp.status !== 404) {
      var err = await getResp.json();
      throw new Error(err.message || 'HTTP ' + getResp.status);
    }
    var getSha      = getResp.ok ? (await getResp.json()).sha : undefined;
    var conteudo    = montarConteudoJS(dbAtualizado);
    var conteudoB64 = btoa(unescape(encodeURIComponent(conteudo)));
    var body = {
      message: 'Atualização via interface — ' + new Date().toLocaleString('pt-BR'),
      content: conteudoB64,
      branch:  c.branch
    };
    if (getSha) body.sha = getSha;
    var putResp = await fetch(apiBase, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
    if (!putResp.ok) {
      var err2 = await putResp.json();
      throw new Error(err2.message || 'HTTP ' + putResp.status);
    }
    mostrarToast('\u2705 dados_colono.js salvo no GitHub!', '#1a3a1a');
    return true;
  } catch (e) {
    mostrarToast('\u274C Erro GitHub: ' + e.message, '#7a1a1a');
    return false;
  }
}

// ----------------------------------------------------------
// SALVAR DADOS (localStorage + GitHub)
// ----------------------------------------------------------

async function salvarDados() {
  var dbAtualizado = coletarDB();
  try {
    localStorage.setItem('colonoDB', JSON.stringify(dbAtualizado));
    Object.assign(_DB, dbAtualizado);
    atualizarIndicadorStorage();
  } catch (e) {
    mostrarToast('\u26A0\uFE0F Erro localStorage: ' + e.message, '#7a1a1a');
    return;
  }
  if (githubConfigurado()) {
    await salvarNoGitHub(dbAtualizado);
  } else {
    mostrarToast('\uD83D\uDCBE Salvo no navegador. Configure o GitHub para salvar lá também.', '#1a3a1a');
  }
}

// ----------------------------------------------------------
// EXPORTAR BACKUP JS (download local)
// ----------------------------------------------------------

function exportarJS() {
  var fonte    = (typeof DB_PADRAO !== 'undefined') ? DB_PADRAO : (typeof DB !== 'undefined') ? DB : {};
  var db       = JSON.parse(localStorage.getItem('colonoDB') || JSON.stringify(fonte));
  var conteudo = montarConteudoJS(db);
  var blob = new Blob([conteudo], { type: 'text/javascript' });
  var link = document.createElement('a');
  link.download = 'dados_colono.js';
  link.href = URL.createObjectURL(blob);
  link.click();
  mostrarToast('\u2B07\uFE0F dados_colono.js exportado!', '#1a2e3a');
}

// ----------------------------------------------------------
// RESTAURAR BANCO PADRÃO
// ----------------------------------------------------------

function restaurarPadrao() {
  if (!confirm('Apagar todas as alterações salvas e voltar ao banco padrão?\n\nEsta ação não pode ser desfeita.')) return;
  localStorage.removeItem('colonoDB');
  mostrarToast('\u21A9\uFE0F Banco padrão restaurado. Recarregando\u2026', '#3a1a00');
  setTimeout(function () { location.reload(); }, 1200);
}

// ----------------------------------------------------------
// GERAR LAUDO
// ----------------------------------------------------------

function generateText() {
  var text = "<span class='bold'>COLONOSCOPIA</span><br><br><br>";
  var sections = [
    { id: 'sortable-indicacao',  prefix: "<span class='bold'>Indicação: </span>", suffix: '<br><br>' },
    { id: 'sortable-equipamento',prefix: "<span class='bold'>Equipamento: </span>", suffix: '<br><br>' },
    { id: 'Sedação',             prefix: "<span class='bold'>Sedação: </span>", suffix: '<br><br><br>' },
    { id: 'Exame',               prefix: '', suffix: '<br>' },
    { id: 'alteracao',           prefix: '', suffix: '<br>' },
    { id: 'diverticulo',         prefix: '', suffix: '<br>' },
    { id: 'canalanal',           prefix: '', suffix: '<br>' },
    { id: 'Conclusão',           prefix: '<br><br><span class="bold">Conclusão:</span><br><br>', suffix: '<br>' },
    { id: 'obs',                 prefix: '<br>Observação: ', suffix: '<br>' },
    { id: 'Outros',              prefix: '', suffix: '<br><br>' }
  ];
  var preparoText = '';
  $('#Preparo input[type="checkbox"]:checked').each(function () { preparoText += $(this).val(); });
  for (var i = 0; i < sections.length; i++) {
    var s = sections[i], sectionText = '', prefix = s.prefix;
    if (s.id === 'Sedação' && $('#geral').is(':checked')) prefix = '';
    $('#' + s.id + ' input[type="checkbox"]:checked').each(function () { sectionText += $(this).val() + s.suffix; });
    if (sectionText) text += prefix + sectionText;
  }
  if ($("[id='Ressecção de lesão-sortable-indicacao']:checked, [id='Retossigmoidoscopia-sortable-exame']:checked").length === 2)
    text = text.replace('COLONOSCOPIA', 'RETOSSIGMOIDOSCOPIA TERAPÊUTICA');
  if ($("[id='Ressecção de lesão-sortable-indicacao']").is(':checked'))
    text = text.replace('COLONOSCOPIA', 'COLONOSCOPIA TERAPÊUTICA');
  if (preparoText)
    text = text.replace('Preparo adequado para o exame (Boston 9).', preparoText);
  if (text.includes('no ceco') || text.includes('em ceco') || text.includes('- ceco'))
    text = text.replace('Ceco, válvula ileocecal e óstio apendicular', 'Válvula ileocecal e óstio apendicular');
  if (text.includes('Preparo regular'))
    text = text.replace('com trama vascular e mucosa de aspecto normal.', 'sem lesões visíveis.');
  if (text.includes('Introdução do colonoscópio pelo canal anal até o cólon descendente.'))
    text = text.replace("<span class='bold'>COLONOSCOPIA</span><br><br><br>", "<span class='bold'>RETOSSIGMOIDOSCOPIA</span><br><br><br>");
  if ($('#Outros input[type="checkbox"]:checked').length > 0)
    text = text.replace("<span class='bold'>COLONOSCOPIA</span><br><br><br>", '');
  if (text.includes('Material utilizado'))
    text = text.replace('Observação: Material utilizado: ', 'Material utilizado: ');
  var canalanalText = '';
  $('#canalanal input[type="checkbox"]:checked').each(function () { canalanalText += $(this).val(); });
  if (canalanalText.length > 0) text = text.replace(/Reto sem alterações./g, '');
  $('#output').html(text);
  var out = document.getElementById('output');
  out.focus();
  document.execCommand('selectAll');
  document.execCommand('copy');
  window.getSelection().removeAllRanges();
  mostrarToast('\uD83D\uDCCB Laudo gerado e copiado!', '#1a3a1a');
}

// ----------------------------------------------------------
// COPIAR TEXTO
// ----------------------------------------------------------

function copiarConteudo() {
  navigator.clipboard.writeText(document.getElementById('output').innerText)
    .then(function () { mostrarToast('\uD83D\uDCC4 Texto copiado!'); });
}

async function copiarFormatado() {
  var output = document.getElementById('output');
  output.style.fontSize = '11pt';
  await navigator.clipboard.write([new ClipboardItem({
    'text/html':  new Blob(['<div style="font-size:11pt;">' + output.innerHTML + '</div>'], { type: 'text/html' }),
    'text/plain': new Blob([output.innerText], { type: 'text/plain' })
  })]);
  mostrarToast('\uD83D\uDDA8\uFE0F Copiado em fonte 11!');
}

// ----------------------------------------------------------
// INICIALIZA AO CARREGAR
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', inicializar);
