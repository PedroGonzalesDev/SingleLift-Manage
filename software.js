// --- DADOS E CONFIGURAÇÕES ---
const API_URL = '/api/atletas';
let athletes = [];
let editingId = null;

const categories = {
    'M': ['59kg', '66kg', '74kg', '83kg', '93kg', '105kg', '120kg', '+120kg'],
    'F': ['47kg', '52kg', '57kg', '63kg', '69kg', '76kg', '84kg', '+84kg']
};

const viewModes = {
    'F-bench': 'category', 'F-deadlift': 'category',
    'M-bench': 'category', 'M-deadlift': 'category'
};

// --- INICIALIZAÇÃO ---
window.onload = function() {
    updateCategoryOptions();
    fetchAthletes();
}

async function fetchAthletes() {
    try {
        const response = await fetch(API_URL);
        athletes = await response.json();
        renderRoster();
        
        const activeTab = document.querySelector('.tab-content.active');
        if(activeTab) {
            const tabId = activeTab.id;
            if(tabId === 'fem-bench') renderCompetitionBoard('F', 'bench');
            else if(tabId === 'fem-dead') renderCompetitionBoard('F', 'deadlift');
            else if(tabId === 'masc-bench') renderCompetitionBoard('M', 'bench');
            else if(tabId === 'masc-dead') renderCompetitionBoard('M', 'deadlift');
            else if(tabId === 'results') renderResults();
        }
    } catch (error) { console.error("Erro ao buscar dados:", error); }
}

async function syncAthlete(athlete) {
    try {
        await fetch(`${API_URL}/${athlete.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(athlete)
        });
    } catch (error) { console.error("Erro ao salvar:", error); }
}

// --- NAVEGAÇÃO E SECRETARIA ---
function openTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    if(event) event.currentTarget.classList.add('active');

    if(tabName === 'fem-bench') renderCompetitionBoard('F', 'bench');
    if(tabName === 'fem-dead')  renderCompetitionBoard('F', 'deadlift');
    if(tabName === 'masc-bench') renderCompetitionBoard('M', 'bench');
    if(tabName === 'masc-dead')  renderCompetitionBoard('M', 'deadlift');
    if(tabName === 'results') renderResults();
}

function toggleInput(inputId, isChecked) {
    const input = document.getElementById(inputId);
    input.disabled = !isChecked;
    if(!isChecked) input.value = '';
}

function updateCategoryOptions() {
    const gender = document.getElementById('reg-gender').value;
    const select = document.getElementById('reg-category');
    select.innerHTML = '';
    categories[gender].forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        select.appendChild(opt);
    });
}

async function registerAthlete() {
    const name = document.getElementById('reg-name').value;
    const gender = document.getElementById('reg-gender').value;
    const bodyWeight = document.getElementById('reg-bodyweight').value;
    const category = document.getElementById('reg-category').value;
    const age = document.getElementById('reg-age').value;
    const doBench = document.getElementById('check-bench').checked;
    const doDead = document.getElementById('check-dead').checked;
    const openBench = document.getElementById('opener-bench').value;
    const openDead = document.getElementById('opener-dead').value;

    if(!name || !bodyWeight || !age) { alert("Preencha os campos obrigatórios!"); return; }
    if(!doBench && !doDead) { alert("O atleta precisa participar de pelo menos uma prova."); return; }

    try {
        if(editingId) {
            const a = athletes.find(x => x.id == editingId);
            a.name = name; a.gender = gender; a.bodyWeight = bodyWeight; 
            a.weightClass = category; a.age = age;
            a.competesBench = doBench; a.competesDeadlift = doDead;
            if(a.bench[0].status === 0) a.bench[0].val = openBench;
            if(a.deadlift[0].status === 0) a.deadlift[0].val = openDead;

            await fetch(`${API_URL}/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) });
            cancelEdit(); 
        } else {
            const newAthlete = {
                name, gender, bodyWeight, weightClass: category, age, competesBench: doBench, competesDeadlift: doDead,
                bench: [{val: openBench, status: 0}, {val: '', status: 0}, {val: '', status: 0}],
                deadlift: [{val: openDead, status: 0}, {val: '', status: 0}, {val: '', status: 0}]
            };
            await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newAthlete) });
            cancelEdit(); 
        }
        fetchAthletes();
    } catch (error) { alert("Erro ao salvar no banco."); }
}

function editAthlete(id) {
    const a = athletes.find(x => x.id == id);
    if(!a) return;
    editingId = id;
    document.getElementById('reg-name').value = a.name;
    document.getElementById('reg-gender').value = a.gender;
    updateCategoryOptions();
    document.getElementById('reg-category').value = a.weightClass;
    document.getElementById('reg-bodyweight').value = a.bodyWeight;
    document.getElementById('reg-age').value = a.age;
    document.getElementById('check-bench').checked = a.competesBench;
    toggleInput('opener-bench', a.competesBench);
    document.getElementById('opener-bench').value = a.competesBench ? a.bench[0].val : '';
    document.getElementById('check-dead').checked = a.competesDeadlift;
    toggleInput('opener-dead', a.competesDeadlift);
    document.getElementById('opener-dead').value = a.competesDeadlift ? a.deadlift[0].val : '';

    document.getElementById('btn-save-athlete').innerText = "Salvar Alterações";
    document.getElementById('btn-cancel-edit').style.display = 'block';
    window.scrollTo(0, 0);
}

function cancelEdit() {
    editingId = null;
    document.getElementById('btn-save-athlete').innerText = "Cadastrar Atleta";
    document.getElementById('btn-cancel-edit').style.display = 'none';
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-bodyweight').value = '';
    document.getElementById('opener-bench').value = '';
    document.getElementById('opener-dead').value = '';
    document.getElementById('reg-age').value = '';
}

function renderRoster() {
    const list = document.getElementById('roster-list');
    if(athletes.length === 0) { list.innerHTML = '<p style="color:#999; text-align:center">Nenhum atleta cadastrado.</p>'; return; }

    let html = `<table class="roster-table"><thead><tr><th>Nome</th><th>Categ.</th><th>Peso</th><th>Idade</th><th>Provas</th><th>Ações</th></tr></thead><tbody>`;
    athletes.forEach(a => {
        html += `<tr><td>${a.name}</td><td>${a.weightClass} (${a.gender})</td><td>${a.bodyWeight}</td><td>${a.age}</td>
            <td>${a.competesBench ? '<span class="tag-lift">Supino</span>' : ''}${a.competesDeadlift ? '<span class="tag-lift">Terra</span>' : ''}</td>
            <td><div class="action-buttons">
                <button class="btn-icon edit" onclick="editAthlete('${a.id}')">✏️ Editar</button>
                <button class="btn-icon delete" onclick="removeAthlete('${a.id}')">🗑️ Excluir</button>
            </div></td></tr>`;
    });
    html += '</tbody></table>';
    list.innerHTML = html;
}

async function removeAthlete(id) {
    if(confirm('Tem certeza que deseja excluir?')) {
        try { await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); fetchAthletes(); } 
        catch (error) { alert("Erro ao excluir."); }
    }
}

// --- COMPETIÇÃO E MESA ---
let isAnimating = false;
function animatedRender(gender, type) {
    if (document.startViewTransition && !isAnimating) {
        isAnimating = true;
        const transition = document.startViewTransition(() => renderCompetitionBoard(gender, type));
        transition.finished.finally(() => isAnimating = false);
    } else { renderCompetitionBoard(gender, type); }
}

function setViewMode(gender, type, mode) {
    viewModes[`${gender}-${type}`] = mode;
    const idSuf = type === 'bench' ? 'bench' : 'dead';
    document.getElementById(`btn-view-cat-${gender}-${idSuf}`).classList.toggle('active', mode === 'category');
    document.getElementById(`btn-view-lift-${gender}-${idSuf}`).classList.toggle('active', mode === 'lift');
    animatedRender(gender, type);
}

function getActiveAttempt(athlete, type) {
    for(let i=0; i<3; i++) {
        if(athlete[type][i].status === 0) return { weight: parseFloat(athlete[type][i].val), round: i + 1 };
    }
    return { weight: NaN, round: 4 };
}

function renderCompetitionBoard(gender, type) {
    const idSuf = type === 'bench' ? 'bench' : 'dead';
    const container = document.getElementById(`container-${gender === 'F' ? 'fem' : 'masc'}-${idSuf}`);
    if(!container) return; 
    container.innerHTML = '';

    const searchInput = document.getElementById(`search-${gender}-${idSuf}`);
    const nameFilter = searchInput ? searchInput.value.toLowerCase() : '';
    const mode = viewModes[`${gender}-${type}`];

    let baseGroup = athletes.filter(a => {
        const participates = (type === 'bench' && a.competesBench) || (type === 'deadlift' && a.competesDeadlift);
        return a.gender === gender && participates && a.name.toLowerCase().includes(nameFilter);
    });

    const sortBarLoading = (a, b) => {
        const attA = getActiveAttempt(a, type);
        const attB = getActiveAttempt(b, type);
        if(attA.round !== attB.round) return attA.round - attB.round;
        const wA = isNaN(attA.weight) ? 9000 : attA.weight;
        const wB = isNaN(attB.weight) ? 9000 : attB.weight;
        if(wA !== wB) return wA - wB;
        return (parseFloat(a.bodyWeight) || 999) - (parseFloat(b.bodyWeight) || 999);
    };

    if (mode === 'category') {
        categories[gender].forEach(cat => {
            let group = baseGroup.filter(a => a.weightClass === cat);
            if(group.length > 0) {
                group.sort(sortBarLoading);
                const section = document.createElement('div');
                section.className = 'group-section';
                section.innerHTML = `<div class="group-header">Categoria ${cat}</div>`;
                group.forEach(ath => section.appendChild(createCompetitionCard(ath, type)));
                container.appendChild(section);
            }
        });
    } else {
        if(baseGroup.length > 0) {
            baseGroup.sort(sortBarLoading);
            const section = document.createElement('div');
            section.className = 'group-section';
            section.innerHTML = `<div class="group-header" style="color:#2563eb;">Ordenação Global por Pedida (Bar Loading)</div>`;
            baseGroup.forEach(ath => section.appendChild(createCompetitionCard(ath, type)));
            container.appendChild(section);
        }
    }
    if(container.innerHTML === '') container.innerHTML = '<p style="color:#999; text-align:center">Nenhum atleta encontrado.</p>';
}

function createCompetitionCard(athlete, type) {
    const div = document.createElement('div');
    div.className = 'athlete-card';
    div.style.viewTransitionName = `card-ath-${athlete.id}-${type}`;
    if(getActiveAttempt(athlete, type).round === 4) div.style.opacity = '0.4';

    div.innerHTML = `
        <div class="athlete-details">
            <h4>${athlete.name}</h4>
            <span>Categ: <strong>${athlete.weightClass}</strong> | Peso: ${athlete.bodyWeight}kg | Idade: ${athlete.age}</span>
        </div>
        <div class="lift-row">${renderAttempts(athlete, type)}</div>
    `;
    return div;
}

function renderAttempts(athlete, type) {
    let html = '';
    for(let i=0; i<3; i++) {
        const att = athlete[type][i];
        let locked = (i > 0 && athlete[type][i-1].status === 0);
        let statusClass = '';
        if(att.status === 1) statusClass = 'status-good';
        if(att.status === 2) statusClass = 'status-bad';

        html += `
            <div class="attempt-wrapper ${statusClass}">
                <label>${i+1}ª Pedida</label>
                <input type="number" step="0.5" class="attempt-input" id="input-${athlete.id}-${type}-${i}"
                    value="${att.val}" ${locked ? 'disabled' : ''} onblur="updateLiftValue('${athlete.id}', '${type}', ${i}, this.value)">
                <div class="judge-actions">
                    <button class="judge-btn btn-good" ${locked ? 'disabled' : ''} onclick="judge('${athlete.id}', '${type}', ${i}, 1)" title="Válido">✓</button>
                    <button class="judge-btn btn-undo" ${locked ? 'disabled' : ''} onclick="judge('${athlete.id}', '${type}', ${i}, 0)" title="Anular">↺</button>
                    <button class="judge-btn btn-bad" ${locked ? 'disabled' : ''} onclick="judge('${athlete.id}', '${type}', ${i}, 2)" title="Inválido">X</button>
                </div>
            </div>`;
    }
    return html;
}

function updateLiftValue(id, type, idx, val) {
    const ath = athletes.find(a => a.id == id);
    if(ath) {
        ath[type][idx].val = val;
        animatedRender(ath.gender, type); 
        syncAthlete(ath); 
    }
}

function judge(id, type, idx, status) {
    const ath = athletes.find(a => a.id == id);
    if(ath) {
        ath[type][idx].status = status;
        
        // NOVIDADE: Gera o sinal das luzes para o Telão!
        if(status === 1 || status === 2) {
            ath.lastSignal = { status: status, time: Date.now() };
        }
        
        if(idx < 2 && status !== 0) {
            const currentVal = parseFloat(ath[type][idx].val);
            const nextVal = ath[type][idx+1].val;
            if((!nextVal || nextVal === '') && !isNaN(currentVal)) {
                if(status === 1) ath[type][idx+1].val = currentVal + 2.5; 
                if(status === 2) ath[type][idx+1].val = currentVal;       
            }
        }
        
        animatedRender(ath.gender, type);
        syncAthlete(ath); 
    }
}

// --- RESULTADOS ---
function getBest(ath, type) {
    let max = 0;
    ath[type].forEach(at => {
        if(at.status === 1 && at.val) {
            const v = parseFloat(at.val);
            if(v > max) max = v;
        }
    });
    return max;
}

function renderResults() {
    const display = document.getElementById('results-display');
    display.innerHTML = '';
    const generateRankBlock = (liftName, liftType) => {
        const container = document.createElement('div');
        container.className = 'ranking-container';
        container.innerHTML = `<h2 class="ranking-title">🏆 Ranking - ${liftName}</h2>`;
        
        const sections = [ { title: 'OPEN (Até 39 anos)', filter: a => !a.age || parseInt(a.age) < 40 }, { title: 'MASTERS (40+ anos)', filter: a => parseInt(a.age) >= 40 } ];

        let hasDataGlobal = false;
        sections.forEach(sec => {
            let sectionHasData = false;
            let sectionHtml = `<h3 style="margin-left:10px; color:#555">${sec.title}</h3>`;

            ['F', 'M'].forEach(gender => {
                const gLabel = gender === 'F' ? 'Feminino' : 'Masculino';
                categories[gender].forEach(cat => {
                    let list = athletes.filter(a => a.gender === gender && a.weightClass === cat && sec.filter(a) && ((liftType === 'bench' && a.competesBench) || (liftType === 'deadlift' && a.competesDeadlift)));
                    if(list.length > 0) {
                        hasDataGlobal = true; sectionHasData = true;
                        list.forEach(a => a.bestRes = getBest(a, liftType));
                        list.sort((a, b) => {
                            if(b.bestRes !== a.bestRes) return b.bestRes - a.bestRes;
                            return (parseFloat(a.bodyWeight) || 999) - (parseFloat(b.bodyWeight) || 999);
                        });
                        sectionHtml += `<div class="cat-result-box"><div class="cat-result-header">${gLabel} - ${cat}</div><table><tbody>
                            ${list.map((a, i) => `<tr><td width="30"><strong>${a.bestRes > 0 ? i+1+'º' : '-'}</strong></td><td>${a.name}</td><td>${a.bodyWeight}kg</td><td style="text-align:right; font-weight:bold; color:#2563eb; font-size:1.1rem">${a.bestRes}kg</td></tr>`).join('')}
                            </tbody></table></div>`;
                    }
                });
            });
            if(sectionHasData) container.innerHTML += sectionHtml;
        });
        if(!hasDataGlobal) container.innerHTML += '<p style="text-align:center;color:#999">Nenhum resultado.</p>';
        display.appendChild(container);
    };
    generateRankBlock('SUPINO (Bench Press)', 'bench');
    generateRankBlock('LEVANTAMENTO TERRA (Deadlift)', 'deadlift');
}