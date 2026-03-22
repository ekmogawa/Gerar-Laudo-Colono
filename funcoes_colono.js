// ============================================================
// FUNÇÕES — Gerar Laudo Colonoscopia
// Depende de: dados_colono.js (deve ser carregado antes)
// Persistência: localStorage (chave "colonoDB")
// ============================================================

// ----------------------------------------------------------
// CARREGA O BANCO ATIVO:
//   1º) localStorage (alterações do usuário)
//   2º) DB_PADRAO   (definido em dados_colono.js)
// ----------------------------------------------------------
let DB;
(function () {
  try {
    const salvo = localStorage.getItem('colonoDB');
    DB = salvo ? JSON.parse(salvo) : JSON.parse(JSON.stringify(DB_PADRAO));
  } catch (e) {
    DB = JSON.parse(JSON.stringify(DB_PADRAO));
  }
})();

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
  const div = document.createElement('div');
  div.className = 'item ui-sortable-handle';
  div.style.display = 'block';
  div.innerHTML = `<input type="checkbox" name="${name}" value="${text}" checked><label>${text}</label>`;
  return div;
}

function appendToSortable(elementId, div) {
  document.getElementById(elementId).appendChild(div);
}

const PLURAIS = {
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
  "fragmentada":         "fragmentadas",
};

function pluralizar(texto) {
  for (const [s, p] of Object.entries(PLURAIS)) texto = texto.replace(s, p);
  return texto;
}

// ----------------------------------------------------------
// TOAST (notificação visual)
// ----------------------------------------------------------

function mostrarToast(msg, cor) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = cor || '#1a3a1a';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ----------------------------------------------------------
// INDICADOR DE STATUS DO BANCO
// ----------------------------------------------------------

function atualizarIndicadorStorage() {
  const dot   = document.getElementById('storage-dot');
  const label = document.getElementById('storage-label');
  if (!dot || !label) return;
  if (localStorage.getItem('colonoDB')) {
    dot.className   = 'dot';
    label.textContent = 'Banco salvo no navegador';
  } else {
    dot.className   = 'dot unsaved';
    label.textContent = 'Usando banco padrão';
  }
}

// ----------------------------------------------------------
// INICIALIZAÇÃO — popula a página com o DB
// ----------------------------------------------------------

function popularSelect(id, opcoes) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = "";
  opcoes.forEach(op => {
    const opt = document.createElement('option');
    opt.value = op.valor !== undefined ? op.valor : op;
    opt.textContent = op.label !== undefined ? op.label : op;
    if (op.extra !== undefined) opt.setAttribute('data-extra', op.extra);
    sel.appendChild(opt);
  });
}

function popularCheckboxSection(containerId, itens, nomeSortable) {
  const container = document.getElementById(containerId);
  if (!container) return;
  itens.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item ui-sortable-handle';
    const id = item.id || (item.nome + '-' + nomeSortable);
    const valorEscapado = (item.valor || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    div.innerHTML = `<input type="checkbox" name="${item.nome}" value="${valorEscapado}" id="${id}">` +
                    `<label for="${id}" contenteditable="true">${item.nome}</label>`;
    container.appendChild(div);
  });
}

function inicializar() {
  popularCheckboxSection('sortable-indicacao',  DB.indicacao,  'sortable-indicacao');
  popularCheckboxSection('sortable-equipamento',DB.equipamento,'sortable-equipamento');
  popularCheckboxSection('sortable-sedacao',    DB.sedacao,    'sortable-sedacao');
  popularCheckboxSection('sortable-preparo',    DB.preparo,    'sortable-preparo');
  popularCheckboxSection('sortable-exame',      DB.exame,      'sortable-exame');
  popularCheckboxSection('sortable-conclusao',  DB.conclusao,  'sortable-conclusao');
  popularCheckboxSection('sortable-obs',        DB.obs,        'sortable-obs');
  popularCheckboxSection('sortable-outros',     DB.outros,     'sortable-outros');

  popularSelect('fentanil',  DB.sedacaoSelects.fentanil.map(v => ({ valor: v, label: v || '-' })));
  popularSelect('midazolam', DB.sedacaoSelects.midazolam.map(v => ({ valor: v, label: v || '-' })));

  popularSelect('localizacao', DB.lesoes.localizacao);
  popularSelect('lesao',       DB.lesoes.paris);
  popularSelect('numero',      DB.lesoes.numero);
  popularSelect('tamanho',     DB.lesoes.tamanho.map(v => ({ valor: String(v), label: v + 'mm' })));
  popularSelect('atetamanho',  DB.lesoes.ateTamanho);
  popularSelect('kudo',        DB.lesoes.kudo);
  popularSelect('vasc',        DB.lesoes.vasc);
  popularSelect('jnet',        DB.lesoes.jnet);
  popularSelect('resseccao',   DB.lesoes.resseccao);
  popularSelect('resseccao3',  DB.lesoes.resseccao3);
  popularSelect('hemostasia',  DB.lesoes.hemostasia);

  popularSelect('diver-local',  DB.diverticulos.local);
  popularSelect('diver-local2', DB.diverticulos.local2);
  popularSelect('diver-freq',   DB.diverticulos.frequencia);

  popularSelect('alt-anal',   DB.canalAnal.alteracao);
  popularSelect('local-anal', DB.canalAnal.local);

  popularSelect('numero-conc',    DB.conclusaoSimples.numero);
  popularSelect('lesao-conc',     DB.conclusaoSimples.lesao);
  popularSelect('local-conc',     DB.conclusaoSimples.local);
  popularSelect('resseccao-conc', DB.conclusaoSimples.resseccao);

  popularSelect('lesao2-conc',    DB.conclusaoComposta.lesao);
  popularSelect('resseccao2-conc',DB.conclusaoComposta.resseccao);

  Object.values(DB.conclusaoComposta.quantidades).forEach(seg => {
    const opcoes = [{ valor: "", label: "0" }];
    for (let i = 1; i <= 8; i++) {
      const n = String(i).padStart(2, '0');
      opcoes.push({ valor: seg.prefixo.replace('{n}', n), label: String(i) });
    }
    popularSelect(seg.id, opcoes);
  });

  inicializarSortable();
  inicializarSincronizacaoCheckboxes();
  inicializarMultiplosAchados();
  atualizarIndicadorStorage();
  atualizarStatusGitHub();
}

// ----------------------------------------------------------
// DRAG & DROP
// ----------------------------------------------------------

function inicializarSortable() {
  ['#sortable-indicacao','#sortable-equipamento','#sortable-sedacao',
   '#sortable-preparo','#sortable-exame','#sortable-alteracao',
   '#sortable-canalanal','#sortable-conclusao','#sortable-obs','#sortable-outros']
  .forEach(sel => {
    $(sel).sortable({
      update: function() {
        const c = $(this);
        const items = c.children('.item').get();
        c.empty();
        items.forEach(i => { c.append(i); c.append("\n"); });
      }
    });
  });
}

// ----------------------------------------------------------
// SINCRONIZAÇÃO DE CHECKBOXES
// ----------------------------------------------------------

function inicializarSincronizacaoCheckboxes() {
  document.addEventListener('change', function(e) {
    if (e.target.type !== 'checkbox') return;
    const name = e.target.name, checked = e.target.checked;
    document.querySelectorAll(`input[type="checkbox"][name="${name}"]`).forEach(cb => {
      if (cb !== e.target) cb.checked = checked;
    });
  });
}

// ----------------------------------------------------------
// MÚLTIPLOS ACHADOS
// ----------------------------------------------------------

function inicializarMultiplosAchados() {
  ['segmento','diver-segmento','canal-segmento'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.addEventListener('change', function(e) {
    if (e.target.id !== 'Multiplos-achados-sortable-exame') return;
    const val = e.target.checked ? '2' : '1';
    ['segmento','diver-segmento','canal-segmento'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  });
}

// ----------------------------------------------------------
// CHECKBOXES DINÂMICOS
// ----------------------------------------------------------

function addParametersedacao() {
  const texto = `Fentanil ${getVal('fentanil')} + Midazolam ${getVal('midazolam')} + Propofol titulado IV.<br>Suplementação de O2 por catéter nasal a 3 L/min.<br>Monitorização de oximetria de pulso e PNI.`;
  appendToSortable('sortable-sedacao', createCheckboxDiv(texto, 'sedacao'));
}

function addParameter() {
  const localizacao    = getVal('localizacao');
  const lesaoSel       = document.getElementById('lesao');
  const lesao          = lesaoSel.value;
  const lesaoExtra     = getSelectedOptionExtra(lesaoSel);
  const numeroSel      = document.getElementById('numero');
  const numero         = numeroSel.value;
  const numeroExtra    = getSelectedOptionExtra(numeroSel);
  const tamanho        = getVal('tamanho');
  const ateTamanho     = getVal('atetamanho');
  const kudoSel        = document.getElementById('kudo');
  const kudo           = kudoSel.value;
  const kudoExtra      = getSelectedOptionExtra(kudoSel);
  const vasc           = getVal('vasc');
  const jnet           = getVal('jnet');
  const resseccaoSel   = document.getElementById('resseccao');
  const resseccao      = resseccaoSel.value;
  const resseccaoExtra = getSelectedOptionExtra(resseccaoSel);
  const segmentoSel    = document.getElementById('segmento');
  const hemostasia     = getVal('hemostasia');

  let alteracaoText;

  if (segmentoSel.value === '1') {
    const numExib      = (numero === "") ? "" : `${numero} `;
    const numExtraExib = (numeroExtra === "01") ? "" : `${numeroExtra} `;

    alteracaoText = `A mucosa colorretal apresenta aspecto geral preservado, exceto pela presença de ${numExib}${lesao} ${tamanho}${ateTamanho}mm no ${localizacao}${kudo}${vasc}${kudoExtra}${jnet}${resseccao}${hemostasia}.`;

    let conclusaoText = `- ${numExtraExib}${lesaoExtra} em ${localizacao}${resseccaoExtra}.`;
    if (lesaoExtra.includes("plano"))
      conclusaoText = conclusaoText.replace("Polipectomia", "Ressecção com alça a frio (polipectomia)");
    if (numeroExtra !== "01") conclusaoText = pluralizar(conclusaoText);

    const diverSeg = document.getElementById('diver-segmento');
    if (diverSeg) diverSeg.selectedIndex = 2;

    appendToSortable('sortable-conclusao', createCheckboxDiv(conclusaoText, 'conclusao'));

  } else if (segmentoSel.value === '2') {
    alteracaoText = `- ${localizacao}: ${numero} ${lesao} ${tamanho}${ateTamanho}mm${kudo}${vasc}${kudoExtra}${jnet}${resseccao}${hemostasia}.`;
  } else {
    return;
  }

  if (numero !== "") alteracaoText = pluralizar(alteracaoText);
  if (lesao.includes("lesão") || lesao.includes("angiectasia"))
    alteracaoText = alteracaoText.replace("um", "uma").replace("dois", "duas");

  appendToSortable('sortable-alteracao', createCheckboxDiv(alteracaoText, 'alteracao'));
}

function addParameterdiv() {
  const diverLocal     = getVal('diver-local');
  const diverLocal2    = getVal('diver-local2');
  const diverFreqSel   = document.getElementById('diver-freq');
  const diverFreq      = diverFreqSel.value;
  const diverFreqExtra = getSelectedOptionExtra(diverFreqSel);
  const diverSegSel    = document.getElementById('diver-segmento');

  let diverticuloText = `A mucosa colorretal apresenta aspecto geral preservado, exceto pela presença de ${diverFreq} óstios diverticulares sem sinais inflamatórios em ${diverLocal}${diverLocal2}.`;
  let conclusaoText   = `- ${diverFreqExtra} ${diverLocal}${diverLocal2}.`;

  if (diverSegSel.value === '2')
    diverticuloText = `- ${diverFreq} óstios diverticulares sem sinais inflamatórios em ${diverLocal}${diverLocal2}.`;
  else if (diverSegSel.value === '3')
    diverticuloText = `Ainda no ${diverLocal}${diverLocal2}, encontram-se ${diverFreq} óstios diverticulares sem sinais inflamatórios.`;

  if (diverLocal.includes("todos")) conclusaoText = "- Doença diverticular difusa dos cólons.";
  if (diverLocal2 !== "") {
    diverticuloText = diverticuloText.replace("cólon", "cólons");
    conclusaoText   = conclusaoText.replace("cólon", "cólons");
  }

  appendToSortable('sortable-diverticulo', createCheckboxDiv(diverticuloText, 'diverticulo'));
  appendToSortable('sortable-conclusao',   createCheckboxDiv(conclusaoText, 'conclusao'));
}

function addParametercanal() {
  const altanalSel     = document.getElementById('alt-anal');
  const localanalSel   = document.getElementById('local-anal');
  const canalSegSel    = document.getElementById('canal-segmento');
  const altanal        = altanalSel.value;
  const localanal      = localanalSel.value;
  const altanalExtra   = getSelectedOptionExtra(altanalSel);
  const localanalExtra = getSelectedOptionExtra(localanalSel);

  let canalText = `À retroversão no reto, ${altanal} ${localanal}.`;
  if (canalSegSel.value === '2') canalText = `- à retroversão no reto, ${altanal} ${localanal}.`;

  appendToSortable('sortable-canalanal', createCheckboxDiv(canalText, 'canalanal'));
  if (altanalExtra && altanalExtra.trim() !== "")
    appendToSortable('sortable-conclusao', createCheckboxDiv(`- ${altanalExtra}${localanalExtra}.`, 'conclusao'));
}

function addConclusaoCheckbox() {
  let texto = `- ${getVal('numero-conc')} ${getVal('lesao-conc')} no ${getVal('local-conc')}. ${getVal('resseccao-conc')}`;
  if (Number(getVal('numero-conc')) > 1) texto = pluralizar(texto);
  appendToSortable('sortable-conclusao', createCheckboxDiv(texto, 'conclusao'));
}

function addConclusao2Checkbox() {
  const segIds = ['numeroceco-conc','numeroasc-conc','numeroanghep-conc',
                  'numerotransv-conc','numeroangesp-conc','numerodesc-conc',
                  'numerosig-conc','numeroreto-conc'];
  const partes = segIds.map(id => getVal(id)).join('');
  let texto = `- ${getVal('lesao2-conc')} (${partes}). ${getVal('resseccao2-conc')}.`;
  texto = texto.replace(/\( /g, "(").replace(/;\)/g, ")").replace(/cólon /g, "");
  appendToSortable('sortable-conclusao', createCheckboxDiv(texto, 'conclusao'));
}

// ----------------------------------------------------------
// EDITAR / CRIAR / EXCLUIR ITENS
// ----------------------------------------------------------

function showPopup() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  const container  = document.getElementById("checkbox-list");
  container.innerHTML = "";
  if (checkboxes.length === 0) {
    container.innerHTML = "<p>Nenhum item selecionado para editar.</p>";
    document.getElementById("popup").style.display = "block";
    return;
  }
  checkboxes.forEach(cb => {
    const label     = document.querySelector(`label[for="${cb.id}"]`);
    const labelText = label ? label.innerText : "";
    const suffix    = cb.id.replace(cb.name, "");
    const itemDiv   = document.createElement('div');
    itemDiv.className = "edit-group";
    itemDiv.style.cssText = "border-bottom:1px solid #ccc;padding:10px 0;";
    itemDiv.innerHTML = `
      <div><strong>Nome do Item:</strong><br>
        <input type="text" class="edit-name-input" style="width:300px;margin-bottom:10px;"
          oninput="updateEverything('${cb.id}', this.value, '${suffix}', this)" value="${labelText}">
      </div>
      <div><strong>Texto da entrada:</strong><br>
        <textarea class="edit-value-input" style="height:60px;width:90%;"
          oninput="updateOnlyValue('${cb.id}', this.value)">${cb.value}</textarea>
      </div>`;
    container.appendChild(itemDiv);
  });
  document.getElementById("popup").style.display = "block";
}

function updateEverything(currentId, newName, suffix, inputEl) {
  const checkbox = document.getElementById(currentId);
  const label    = document.querySelector(`label[for="${currentId}"]`);
  const newId    = newName + suffix;
  if (checkbox && label) {
    checkbox.id = newId; checkbox.name = newName;
    label.setAttribute('for', newId); label.innerText = newName;
    inputEl.setAttribute('oninput', `updateEverything('${newId}', this.value, '${suffix}', this)`);
    inputEl.closest('.edit-group').querySelector('.edit-value-input')
      .setAttribute('oninput', `updateOnlyValue('${newId}', this.value)`);
  }
}

function updateOnlyValue(id, newValue) {
  const cb = document.getElementById(id);
  if (cb) cb.value = newValue;
}

function hidePopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("checkbox-list").innerHTML = "";
}

function deleteCheckedCheckboxes() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  if (checkboxes.length > 0 && confirm("Deseja excluir os itens selecionados?")) {
    checkboxes.forEach(cb => (cb.closest('.item') || cb.parentElement).remove());
    hidePopup();
  }
}

function showCreatePopup() { document.getElementById("create-popup").style.display = "block"; }
function hideCreatePopup() { document.getElementById("create-popup").style.display = "none"; }

function createCheckbox() {
  const nome      = document.getElementById("checkbox-name").value;
  const valor     = document.getElementById("checkbox-value").value.replace(/\n/g, "<br>");
  const sectionId = getVal("section-select");
  const section   = document.getElementById(sectionId);
  const div = document.createElement("div");
  div.className = "item";
  const cb = document.createElement("input");
  cb.type = "checkbox"; cb.name = nome; cb.value = valor; cb.id = nome + "-" + sectionId;
  const lbl = document.createElement("label");
  lbl.htmlFor = cb.id; lbl.setAttribute("contenteditable", "true"); lbl.innerHTML = nome;
  div.appendChild(cb); div.appendChild(lbl);
  section.appendChild(document.createTextNode("\n"));
  section.appendChild(div);
  document.getElementById("create-popup").style.display = "none";
  document.getElementById("checkbox-name").value = "";
  document.getElementById("checkbox-value").value = "";
  mostrarToast('✅ Item criado! Clique em "Salvar" para persistir.');
}

// ----------------------------------------------------------
// LIMPAR SELEÇÃO
// ----------------------------------------------------------

function uncheckAll() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
}

// ----------------------------------------------------------
// SERIALIZAR DOM → objeto JS
// ----------------------------------------------------------

const IDS_CONTROLE = new Set([
  'polipos', 'diver-sortable', 'canal-sortable', 'sedacao-dinamico',
  'alteracao-conc-sortable-conclusao', 'alteracoes-conc-sortable-conclusao'
]);

function serializarSecao(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const itens = [];
  container.querySelectorAll(':scope > .item').forEach(div => {
    const cb = div.querySelector('input[type="checkbox"]');
    if (!cb || IDS_CONTROLE.has(cb.id) || IDS_CONTROLE.has(cb.name)) return;
    const label = div.querySelector('label');
    const nome  = label ? label.innerText.trim() : cb.name;
    if (!nome) return;
    const tmp = document.createElement('textarea');
    tmp.innerHTML = cb.value;
    const valor = tmp.value;
    const item = { nome };
    const idPadrao = nome + '-' + containerId;
    if (cb.id && cb.id !== idPadrao) item.id = cb.id;
    item.valor = valor;
    itens.push(item);
  });
  return itens;
}

function serializarSelect(id) {
  const sel = document.getElementById(id);
  if (!sel) return [];
  return Array.from(sel.options).map(opt => {
    const obj = { valor: opt.value, label: opt.text };
    const extra = opt.getAttribute('data-extra');
    if (extra !== null) obj.extra = extra;
    return obj;
  });
}

// ----------------------------------------------------------
// SERIALIZAR DB PARA CONTEÚDO DO ARQUIVO JS
// ----------------------------------------------------------

function montarConteudoJS(dbObj) {
  return `// ============================================================
// BANCO DE DADOS — Gerar Laudo Colonoscopia
// Salvo em: ${new Date().toLocaleString('pt-BR')}
// Para adicionar/remover/editar itens, edite apenas este arquivo.
// ATENÇÃO: este arquivo define o banco PADRÃO (DB_PADRAO).
// As alterações feitas pela interface ficam salvas no navegador
// (localStorage). Use "Exportar backup" para salvar uma cópia.
// ============================================================

const DB_PADRAO = ${JSON.stringify(dbObj, null, 2)};
`;
}

function coletarDB() {
  return {
    indicacao:   serializarSecao('sortable-indicacao'),
    equipamento: serializarSecao('sortable-equipamento'),
    sedacao:     serializarSecao('sortable-sedacao'),
    sedacaoSelects: {
      fentanil:  Array.from(document.getElementById('fentanil').options).map(o => o.value),
      midazolam: Array.from(document.getElementById('midazolam').options).map(o => o.value),
    },
    preparo:  serializarSecao('sortable-preparo'),
    exame:    serializarSecao('sortable-exame'),
    lesoes: {
      localizacao: serializarSelect('localizacao'),
      paris:       serializarSelect('lesao'),
      numero:      serializarSelect('numero'),
      tamanho:     serializarSelect('tamanho').map(o => Number(o.valor)).filter(Boolean),
      ateTamanho:  serializarSelect('atetamanho'),
      kudo:        serializarSelect('kudo'),
      vasc:        serializarSelect('vasc'),
      jnet:        serializarSelect('jnet'),
      resseccao:   serializarSelect('resseccao'),
      resseccao3:  serializarSelect('resseccao3'),
      hemostasia:  serializarSelect('hemostasia'),
    },
    diverticulos: {
      local:      serializarSelect('diver-local'),
      local2:     serializarSelect('diver-local2'),
      frequencia: serializarSelect('diver-freq'),
    },
    canalAnal: {
      alteracao: serializarSelect('alt-anal'),
      local:     serializarSelect('local-anal'),
    },
    conclusao: serializarSecao('sortable-conclusao'),
    conclusaoSimples: {
      numero:    serializarSelect('numero-conc'),
      lesao:     serializarSelect('lesao-conc'),
      local:     serializarSelect('local-conc'),
      resseccao: serializarSelect('resseccao-conc'),
    },
    conclusaoComposta: {
      lesao:      serializarSelect('lesao2-conc'),
      quantidades: DB.conclusaoComposta.quantidades,
      resseccao:  serializarSelect('resseccao2-conc'),
    },
    obs:    serializarSecao('sortable-obs'),
    outros: serializarSecao('sortable-outros'),
  };
}

// ----------------------------------------------------------
// CONFIGURAÇÃO DO GITHUB
// ----------------------------------------------------------

function lerConfigGitHub() {
  try {
    return JSON.parse(localStorage.getItem('colono_github_cfg') || '{}');
  } catch(e) { return {}; }
}

function githubConfigurado() {
  const c = lerConfigGitHub();
  return !!(c.token && c.owner && c.repo);
}

function showConfigPopup() {
  const c = lerConfigGitHub();
  document.getElementById('cfg-token').value = c.token || '';
  document.getElementById('cfg-owner').value = c.owner || '';
  document.getElementById('cfg-repo').value  = c.repo  || '';
  document.getElementById('cfg-branch').value= c.branch|| 'main';
  document.getElementById('cfg-path').value  = c.path  || 'dados_colono.js';
  document.getElementById('config-popup').style.display = 'block';
  atualizarStatusGitHub();
}

function hideConfigPopup() {
  document.getElementById('config-popup').style.display = 'none';
}

function salvarConfigGitHub() {
  const cfg = {
    token:  document.getElementById('cfg-token').value.trim(),
    owner:  document.getElementById('cfg-owner').value.trim(),
    repo:   document.getElementById('cfg-repo').value.trim(),
    branch: document.getElementById('cfg-branch').value.trim() || 'main',
    path:   document.getElementById('cfg-path').value.trim()   || 'dados_colono.js',
  };
  if (!cfg.token || !cfg.owner || !cfg.repo) {
    alert('Preencha Token, Usuário e Repositório.');
    return;
  }
  localStorage.setItem('colono_github_cfg', JSON.stringify(cfg));
  atualizarStatusGitHub();
  mostrarToast('⚙️ Configuração salva!', '#1a2e3a');
  hideConfigPopup();
}

function limparConfigGitHub() {
  if (!confirm('Remover configuração do GitHub?')) return;
  localStorage.removeItem('colono_github_cfg');
  atualizarStatusGitHub();
  mostrarToast('🔌 Configuração removida.', '#555');
  hideConfigPopup();
}

function atualizarStatusGitHub() {
  const el = document.getElementById('github-status');
  if (!el) return;
  if (githubConfigurado()) {
    const c = lerConfigGitHub();
    el.textContent = `✅ GitHub: ${c.owner}/${c.repo}`;
    el.style.color = '#2a6e3f';
  } else {
    el.textContent = '⚠️ GitHub não configurado';
    el.style.color = '#a04000';
  }
}

// ----------------------------------------------------------
// SALVAR NO GITHUB VIA API
// ----------------------------------------------------------

async function salvarNoGitHub(dbAtualizado) {
  const c = lerConfigGitHub();
  if (!c.token || !c.owner || !c.repo) {
    mostrarToast('⚠️ Configure o GitHub primeiro.', '#7a4000');
    showConfigPopup();
    return false;
  }

  const apiBase = `https://api.github.com/repos/${c.owner}/${c.repo}/contents/${c.path}`;
  const headers = {
    'Authorization': `token ${c.token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  mostrarToast('🔄 Enviando para o GitHub…', '#1a2e3a');

  try {
    // 1) Busca o SHA atual do arquivo (necessário para o PUT)
    const getResp = await fetch(`${apiBase}?ref=${c.branch}`, { headers });
    if (!getResp.ok && getResp.status !== 404) {
      const err = await getResp.json();
      throw new Error(err.message || `HTTP ${getResp.status}`);
    }
    const getSha = getResp.ok ? (await getResp.json()).sha : undefined;

    // 2) Codifica o conteúdo em base64
    const conteudo = montarConteudoJS(dbAtualizado);
    const conteudoB64 = btoa(unescape(encodeURIComponent(conteudo)));

    // 3) Envia o arquivo atualizado
    const body = {
      message: `Atualização automática via interface — ${new Date().toLocaleString('pt-BR')}`,
      content: conteudoB64,
      branch:  c.branch,
    };
    if (getSha) body.sha = getSha;

    const putResp = await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!putResp.ok) {
      const err = await putResp.json();
      throw new Error(err.message || `HTTP ${putResp.status}`);
    }

    mostrarToast('✅ dados_colono.js salvo no GitHub!', '#1a3a1a');
    return true;

  } catch (e) {
    mostrarToast(`❌ Erro GitHub: ${e.message}`, '#7a1a1a');
    console.error('GitHub API error:', e);
    return false;
  }
}

// ----------------------------------------------------------
// SALVAR DADOS  (localStorage + GitHub)
// ----------------------------------------------------------

async function salvarDados() {
  const dbAtualizado = coletarDB();

  // 1) Salva localmente sempre
  try {
    localStorage.setItem('colonoDB', JSON.stringify(dbAtualizado));
    Object.assign(DB, dbAtualizado);
    atualizarIndicadorStorage();
  } catch (e) {
    mostrarToast('⚠️ Erro no localStorage: ' + e.message, '#7a1a1a');
    return;
  }

  // 2) Envia para o GitHub se configurado
  if (githubConfigurado()) {
    await salvarNoGitHub(dbAtualizado);
  } else {
    mostrarToast('💾 Salvo no navegador. Configure o GitHub para salvar lá também.', '#1a3a1a');
  }
}

// ----------------------------------------------------------
// EXPORTAR BACKUP JS  (download local)
// ----------------------------------------------------------

function exportarJS() {
  const db = JSON.parse(localStorage.getItem('colonoDB') || JSON.stringify(DB_PADRAO));
  const conteudo = montarConteudoJS(db);
  const blob = new Blob([conteudo], { type: 'text/javascript' });
  const link = document.createElement('a');
  link.download = 'dados_colono.js';
  link.href = URL.createObjectURL(blob);
  link.click();
  mostrarToast('⬇️ dados_colono.js exportado!', '#1a2e3a');
}

// ----------------------------------------------------------
// RESTAURAR BANCO PADRÃO
// ----------------------------------------------------------

function restaurarPadrao() {
  if (!confirm('Isso apagará TODAS as alterações salvas no navegador e voltará ao banco padrão (dados_colono.js).\n\nTem certeza?')) return;
  localStorage.removeItem('colonoDB');
  mostrarToast('↩️ Banco padrão restaurado. Recarregando…', '#3a1a00');
  setTimeout(() => location.reload(), 1200);
}

// ----------------------------------------------------------
// GERAR LAUDO
// ----------------------------------------------------------

function generateText() {
  let text = `<span class='bold'>COLONOSCOPIA</span><br><br><br>`;

  const sections = [
    { id: 'sortable-indicacao',  prefix: "<span class='bold'>Indicação: </span>", suffix: '<br><br>' },
    { id: 'sortable-equipamento',prefix: "<span class='bold'>Equipamento: </span>", suffix: '<br><br>' },
    { id: 'Sedação',             prefix: "<span class='bold'>Sedação: </span>", suffix: '<br><br><br>' },
    { id: 'Exame',               prefix: '', suffix: '<br>' },
    { id: 'alteracao',           prefix: '', suffix: '<br>' },
    { id: 'diverticulo',         prefix: '', suffix: '<br>' },
    { id: 'canalanal',           prefix: '', suffix: '<br>' },
    { id: 'Conclusão',           prefix: '<br><br><span class="bold">Conclusão:</span><br><br>', suffix: '<br>' },
    { id: 'obs',                 prefix: '<br>Observação: ', suffix: '<br>' },
    { id: 'Outros',              prefix: '', suffix: '<br><br>' },
  ];

  let preparoText = '';
  $('#Preparo input[type="checkbox"]:checked').each(function() { preparoText += $(this).val(); });

  for (const section of sections) {
    let sectionText = '';
    let prefix = section.prefix;
    if (section.id === 'Sedação' && $('#geral').is(':checked')) prefix = '';
    $(`#${section.id} input[type='checkbox']:checked`).each(function() {
      sectionText += `${$(this).val()}${section.suffix}`;
    });
    if (sectionText) text += `${prefix}${sectionText}`;
  }

  if ($("[id='Ressecção de lesão-sortable-indicacao']:checked, [id='Retossigmoidoscopia-sortable-exame']:checked").length === 2)
    text = text.replace("COLONOSCOPIA", "RETOSSIGMOIDOSCOPIA TERAPÊUTICA");
  if ($("[id='Ressecção de lesão-sortable-indicacao']").is(':checked'))
    text = text.replace("COLONOSCOPIA", "COLONOSCOPIA TERAPÊUTICA");
  if (preparoText)
    text = text.replace("Preparo adequado para o exame (Boston 9).", preparoText);
  if (text.includes("no ceco") || text.includes("em ceco") || text.includes("- ceco"))
    text = text.replace("Ceco, válvula ileocecal e óstio apendicular", "Válvula ileocecal e óstio apendicular");
  if (text.includes("Preparo regular"))
    text = text.replace("com trama vascular e mucosa de aspecto normal.", "sem lesões visíveis.");
  if (text.includes("Introdução do colonoscópio pelo canal anal até o cólon descendente."))
    text = text.replace(`<span class='bold'>COLONOSCOPIA</span><br><br><br>`, `<span class='bold'>RETOSSIGMOIDOSCOPIA</span><br><br><br>`);
  if ($("#Outros input[type='checkbox']:checked").length > 0)
    text = text.replace("<span class='bold'>COLONOSCOPIA</span><br><br><br>", "");
  if (text.includes("Material utilizado"))
    text = text.replace("Observação: Material utilizado: ", "Material utilizado: ");

  let canalanalText = '';
  $('#canalanal input[type="checkbox"]:checked').each(function() { canalanalText += $(this).val(); });
  if (canalanalText.length > 0) text = text.replace(/Reto sem alterações./g, "");

  $("#output").html(text);
  const out = document.getElementById("output");
  out.focus();
  document.execCommand("selectAll");
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
  mostrarToast('📋 Laudo gerado e copiado!', '#1a3a1a');
}

// ----------------------------------------------------------
// COPIAR TEXTO
// ----------------------------------------------------------

function copiarConteudo() {
  navigator.clipboard.writeText(document.getElementById('output').innerText)
    .then(() => mostrarToast('📄 Texto copiado!'));
}

async function copiarFormatado() {
  const output = document.getElementById('output');
  output.style.fontSize = "11pt";
  await navigator.clipboard.write([new ClipboardItem({
    "text/html":  new Blob([`<div style="font-size:11pt;">${output.innerHTML}</div>`], { type: "text/html" }),
    "text/plain": new Blob([output.innerText], { type: "text/plain" }),
  })]);
  mostrarToast('🖨️ Copiado em fonte 11!');
}

// ----------------------------------------------------------
// INICIALIZA AO CARREGAR
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', inicializar);
