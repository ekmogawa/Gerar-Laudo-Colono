// ============================================================
// FUNÇÕES — Gerar Laudo Colonoscopia
// Depende de: config.js e dados_colono.js (carregados antes)
// ============================================================

// ----------------------------------------------------------
// BANCO ATIVO
// Usa _DB internamente para nunca colidir com variáveis do
// dados_colono.js (que pode declarar DB ou DB_PADRAO).
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
  div.style.display = 'block';
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
  for (var s in PLURAIS) texto = texto.replace(s, PLURAIS[s]);
  return texto;
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

function inicializar() {
  if (window._inicializado) return;
  window._inicializado = true;

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
  atualizarStatusGitHub();
}

// ----------------------------------------------------------
// DRAG & DROP — Pointer Events (sem flickering)
// ----------------------------------------------------------

function inicializarSortable() {
  [
    'sortable-indicacao','sortable-equipamento','sortable-sedacao',
    'sortable-preparo','sortable-exame','sortable-alteracao',
    'sortable-canalanal','sortable-conclusao','sortable-obs','sortable-outros'
  ].forEach(function (id) {
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

  var targetRow = rows[rows.length - 1];
  for (var i = 0; i < rows.length; i++) {
    if (y <= rows[i].bottom) { targetRow = rows[i]; break; }
  }

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
    document.getElementById('backdrop').classList.add('show');
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
  document.getElementById('backdrop').classList.add('show');
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
  document.getElementById('backdrop').classList.remove('show');
}

function deleteCheckedCheckboxes() {
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
  var nome      = document.getElementById('checkbox-name').value;
  var valor     = document.getElementById('checkbox-value').value.replace(/\n/g, '<br>');
  var sectionId = getVal('section-select');
  var section   = document.getElementById(sectionId);
  var div = document.createElement('div');
  div.className = 'item';
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
    item.valor = cb.value; // cb.value já contém HTML — não usar textarea.innerHTML (converte <br> em \n)
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
// SALVAR NO GITHUB VIA API
// ----------------------------------------------------------

async function salvarDados() {
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

    var dbAtualizado = coletarDB();
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

function generateText() {
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

  var preparoText = '';
  $('#preparo-sec input[type="checkbox"]:checked').each(function () { preparoText += $(this).val(); });

  for (var i = 0; i < sections.length; i++) {
    var s = sections[i], sectionText = '', prefix = s.prefix;
    if (s.id === 'sedacao-sec' && $('#geral').is(':checked')) prefix = '';
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
  if ($('#outros-sec input[type="checkbox"]:checked').length > 0)
    text = text.replace("<span class='bold'>COLONOSCOPIA</span><br><br><br>", '');
  if (text.includes('Material utilizado'))
    text = text.replace('Observação: Material utilizado: ', 'Material utilizado: ');

  var canalanalText = '';
  $('#canalanal input[type="checkbox"]:checked').each(function () { canalanalText += $(this).val(); });
  if (canalanalText.length > 0) text = text.replace(/Reto sem alterações./g, '');

  // Converte class="bold" → style inline antes de renderizar,
  // garantindo que a formatação sobreviva ao colar em qualquer browser
  text = text.replace(/<span class='bold'>/g, '<span style="font-weight:bold">')
             .replace(/<span class="bold">/g, '<span style="font-weight:bold">');

  $('#output').html(text);
  var output = document.getElementById('output');
  var htmlFormatado = '<div style="font-family:Arial,sans-serif;font-size:12pt;">' + output.innerHTML + '</div>';

  // Tenta Clipboard API (Edge/Chrome); fallback para seleção (Firefox)
  if (navigator.clipboard && window.ClipboardItem) {
    navigator.clipboard.write([new ClipboardItem({
      'text/html':  new Blob([htmlFormatado], { type: 'text/html' }),
      'text/plain': new Blob([output.innerText],  { type: 'text/plain' })
    })]).then(function () {
      mostrarToast('📋 Laudo gerado e copiado!', '#1a3a1a');
    }).catch(function () { copiarPorSelecao(output); });
  } else {
    copiarPorSelecao(output);
  }
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
  mostrarToast('📋 Laudo gerado e copiado!', '#1a3a1a');
}

// ----------------------------------------------------------
// COPIAR TEXTO
// ----------------------------------------------------------

function copiarConteudo() {
  var output = document.getElementById('output');
  var htmlFormatado = '<div style="font-family:Arial,sans-serif;font-size:12pt;">' + output.innerHTML + '</div>';
  if (navigator.clipboard && window.ClipboardItem) {
    navigator.clipboard.write([new ClipboardItem({
      'text/html':  new Blob([htmlFormatado], { type: 'text/html' }),
      'text/plain': new Blob([output.innerText], { type: 'text/plain' })
    })]).then(function () { mostrarToast('📄 Texto copiado!'); })
       .catch(function () { copiarPorSelecao(output); mostrarToast('📄 Texto copiado!'); });
  } else {
    copiarPorSelecao(output);
    mostrarToast('📄 Texto copiado!');
  }
}

async function copiarFormatado() {
  var output = document.getElementById('output');
  var htmlParaCopiar = '<div style="font-family:Arial,sans-serif;font-size:12pt;">' + output.innerHTML + '</div>';

  if (navigator.clipboard && window.ClipboardItem) {
    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html':  new Blob([htmlParaCopiar], { type: 'text/html' }),
        'text/plain': new Blob([output.innerText], { type: 'text/plain' })
      })]);
      mostrarToast('🖨️ Copiado em Arial 12!');
      return;
    } catch (e) { /* fallback abaixo */ }
  }
  copiarPorSelecao(output);
  mostrarToast('🖨️ Copiado em Arial 12!');
}

// ----------------------------------------------------------
// INICIALIZA AO CARREGAR
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', inicializar);
