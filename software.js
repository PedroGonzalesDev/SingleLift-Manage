// --- DADOS E CONFIGURAÇÕES ---
let athletes = [];
let idCounter = 1;

const categories = {
    'M': ['59kg', '66kg', '74kg', '83kg', '93kg', '105kg', '120kg', '+120kg'],
    'F': ['47kg', '52kg', '57kg', '63kg', '69kg', '76kg', '84kg', '+84kg']
};

// --- INICIALIZAÇÃO ---
window.onload = function() {
    updateCategoryOptions(); // Preenche select de categoria ao carregar
    renderRoster(); // Renderiza lista vazia
}

// --- NAVEGAÇÃO ---
function openTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    if(event) event.currentTarget.classList.add('active');

    // Atualiza as telas de competição baseado nos dados atuais
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

// --- CADASTRO (SECRETARIA) ---
function registerAthlete() {
    const name = document.getElementById('reg-name').value;
    const gender = document.getElementById('reg-gender').value;
    const bodyWeight = document.getElementById('reg-bodyweight').value;
    const category = document.getElementById('reg-category').value;
    const age = document.getElementById('reg-age').value;
    
    // Checkboxes de participação
    const doBench = document.getElementById('check-bench').checked;
    const doDead = document.getElementById('check-dead').checked;
    
    // Pedidas iniciais
    const openBench = document.getElementById('opener-bench').value;
    const openDead = document.getElementById('opener-dead').value;

    if(!name || !bodyWeight || !age) {
        alert("Preencha os campos obrigatórios!");
        return;
    }

    if(!doBench && !doDead) {
        alert("O atleta precisa participar de pelo menos uma prova.");
        return;
    }

    const athlete = {
        id: idCounter++,
        name, gender, bodyWeight, weightClass: category, age,
        competesBench: doBench,
        competesDeadlift: doDead,
        bench: [
            {val: openBench, status: 0}, 
            {val: '', status: 0}, 
            {val: '', status: 0}
        ],
        deadlift: [
            {val: openDead, status: 0}, 
            {val: '', status: 0}, 
            {val: '', status: 0}
        ]
    };

    athletes.push(athlete);
    
    // Limpar Form
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-bodyweight').value = '';
    document.getElementById('opener-bench').value = '';
    document.getElementById('opener-dead').value = '';
    
    alert(`Atleta ${name} cadastrado com sucesso!`);
    renderRoster();
}

function renderRoster() {
    const list = document.getElementById('roster-list');
    if(athletes.length === 0) {
        list.innerHTML = '<p style="color:#999; text-align:center">Nenhum atleta cadastrado.</p>';
        return;
    }

    let html = `
    <table class="roster-table">
        <thead>
            <tr>
                <th>Nome</th>
                <th>Categ.</th>
                <th>Peso</th>
                <th>Idade</th>
                <th>Provas</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    athletes.forEach(a => {
        html += `
            <tr>
                <td>${a.name}</td>
                <td>${a.weightClass} (${a.gender})</td>
                <td>${a.bodyWeight}</td>
                <td>${a.age}</td>
                <td>
                    ${a.competesBench ? '<span class="tag-lift">Supino</span>' : ''}
                    ${a.competesDeadlift ? '<span class="tag-lift">Terra</span>' : ''}
                </td>
                <td><button onclick="removeAthlete(${a.id})" style="color:red;border:none;background:none;cursor:pointer">Excluir</button></td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    list.innerHTML = html;
}

function removeAthlete(id) {
    if(confirm('Tem certeza?')) {
        athletes = athletes.filter(a => a.id !== id);
        renderRoster();
    }
}

// --- COMPETIÇÃO (MESA) ---

function getSortValue(athlete, type) {
    // Retorna a próxima pedida pendente para ordenação (Bar Loading)
    for(let i=0; i<3; i++) {
        if(athlete[type][i].status === 0) return parseFloat(athlete[type][i].val) || 9999;
    }
    return 9999; // Terminou
}

function renderCompetitionBoard(gender, type) {
    // CORREÇÃO AQUI: Mapeia 'deadlift' para 'dead' para bater com o ID do HTML
    const typeSuffix = type === 'bench' ? 'bench' : 'dead';
    const containerId = `container-${gender === 'F' ? 'fem' : 'masc'}-${typeSuffix}`;
    
    const container = document.getElementById(containerId);
    
    // Segurança caso o HTML não carregue
    if(!container) return; 

    container.innerHTML = '';

    const cats = categories[gender];

    cats.forEach(cat => {
        // Filtra: Genero Certo + Categoria Certa + PARTICIPA DAQUELE MOVIMENTO
        let group = athletes.filter(a => 
            a.gender === gender && 
            a.weightClass === cat &&
            ((type === 'bench' && a.competesBench) || (type === 'deadlift' && a.competesDeadlift))
        );
        
        if(group.length > 0) {
            // Ordenação por Bar Loading (Menor peso pedido sobe)
            group.sort((a, b) => getSortValue(a, type) - getSortValue(b, type));

            const section = document.createElement('div');
            section.className = 'group-section';
            section.innerHTML = `<div class="group-header">Categoria ${cat}</div>`;
            
            group.forEach(ath => {
                section.appendChild(createCompetitionCard(ath, type));
            });
            container.appendChild(section);
        }
    });
}

function createCompetitionCard(athlete, type) {
    const div = document.createElement('div');
    div.className = 'athlete-card';
    
    div.innerHTML = `
        <div class="athlete-details">
            <h4>${athlete.name}</h4>
            <span>Peso: ${athlete.bodyWeight}kg | Idade: ${athlete.age}</span>
        </div>
        <div class="lift-row">
            ${renderAttempts(athlete, type)}
        </div>
    `;
    return div;
}

function renderAttempts(athlete, type) {
    let html = '';
    for(let i=0; i<3; i++) {
        const att = athlete[type][i];
        
        // Bloqueio: pedida 2 travada se a 1 não foi julgada
        let locked = false;
        if(i > 0 && athlete[type][i-1].status === 0) locked = true;

        let statusClass = '';
        if(att.status === 1) statusClass = 'status-good';
        if(att.status === 2) statusClass = 'status-bad';

        html += `
            <div class="attempt-wrapper ${statusClass}">
                <label>${i+1}ª Pedida</label>
                <input type="number" step="0.5" class="attempt-input"
                    id="input-${athlete.id}-${type}-${i}"
                    value="${att.val}"
                    ${locked ? 'disabled' : ''}
                    onblur="updateLiftValue(${athlete.id}, '${type}', ${i}, this.value)">
                
                <div class="judge-actions">
                    <button class="judge-btn btn-good" ${locked ? 'disabled' : ''}
                        onclick="judge(${athlete.id}, '${type}', ${i}, 1)">✓</button>
                    <button class="judge-btn btn-bad" ${locked ? 'disabled' : ''}
                        onclick="judge(${athlete.id}, '${type}', ${i}, 2)">X</button>
                </div>
            </div>
        `;
    }
    return html;
}

function updateLiftValue(id, type, idx, val) {
    const ath = athletes.find(a => a.id === id);
    if(ath) {
        ath[type][idx].val = val;
        renderCompetitionBoard(ath.gender, type); // Reordena a fila
    }
}

function judge(id, type, idx, status) {
    const ath = athletes.find(a => a.id === id);
    if(ath) {
        ath[type][idx].status = status;
        
        // Lógica automática +2.5kg
        if(idx < 2) {
            setTimeout(() => {
                const currentVal = parseFloat(ath[type][idx].val);
                const nextVal = ath[type][idx+1].val;
                
                if((!nextVal || nextVal === '') && !isNaN(currentVal)) {
                    ath[type][idx+1].val = currentVal + 2.5;
                    // Atualiza a tela se estiver nela
                    const el = document.getElementById(`input-${id}-${type}-${idx+1}`);
                    if(el) el.value = currentVal + 2.5;
                }
            }, 60000); // 1 minuto
        }
        
        renderCompetitionBoard(ath.gender, type);
    }
}

// --- RESULTADOS (RANKING SINGLE LIFT) ---

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

    // Função auxiliar para gerar bloco de ranking
    const generateRankBlock = (liftName, liftType) => {
        const container = document.createElement('div');
        container.className = 'ranking-container';
        container.innerHTML = `<h2 class="ranking-title">🏆 Ranking - ${liftName}</h2>`;
        
        const sections = [
            { title: 'OPEN (Até 39 anos)', filter: a => !a.age || parseInt(a.age) < 40 },
            { title: 'MASTERS (40+ anos)', filter: a => parseInt(a.age) >= 40 }
        ];

        let hasDataGlobal = false;

        sections.forEach(sec => {
            let sectionHasData = false;
            let sectionHtml = `<h3 style="margin-left:10px; color:#555">${sec.title}</h3>`;

            ['F', 'M'].forEach(gender => {
                const gLabel = gender === 'F' ? 'Feminino' : 'Masculino';
                categories[gender].forEach(cat => {
                    // Filtra: Genero + Categoria + Idade + PARTICIPA DO LIFT
                    let list = athletes.filter(a => 
                        a.gender === gender && 
                        a.weightClass === cat && 
                        sec.filter(a) &&
                        ((liftType === 'bench' && a.competesBench) || (liftType === 'deadlift' && a.competesDeadlift))
                    );

                    if(list.length > 0) {
                        hasDataGlobal = true;
                        sectionHasData = true;

                        // Calcula Melhor Lift
                        list.forEach(a => a.bestRes = getBest(a, liftType));

                        // Ordena: Maior Peso Levantado > Menor Peso Corporal
                        list.sort((a, b) => {
                            if(b.bestRes !== a.bestRes) return b.bestRes - a.bestRes;
                            const wA = parseFloat(a.bodyWeight) || 999;
                            const wB = parseFloat(b.bodyWeight) || 999;
                            return wA - wB;
                        });

                        sectionHtml += `
                            <div class="cat-result-box">
                                <div class="cat-result-header">${gLabel} - ${cat}</div>
                                <table>
                                    <tbody>
                                        ${list.map((a, i) => `
                                            <tr>
                                                <td width="30"><strong>${a.bestRes > 0 ? i+1+'º' : '-'}</strong></td>
                                                <td>${a.name}</td>
                                                <td>${a.bodyWeight}kg</td>
                                                <td style="text-align:right; font-weight:bold; color:#2563eb; font-size:1.1rem">${a.bestRes}kg</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }
                });
            });

            if(sectionHasData) container.innerHTML += sectionHtml;
        });

        if(!hasDataGlobal) container.innerHTML += '<p style="text-align:center;color:#999">Nenhum resultado.</p>';
        display.appendChild(container);
    };

    // Gera ranking de Supino
    generateRankBlock('SUPINO (Bench Press)', 'bench');
    
    // Gera ranking de Terra
    generateRankBlock('LEVANTAMENTO TERRA (Deadlift)', 'deadlift');
}