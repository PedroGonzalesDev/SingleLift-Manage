const API_URL = '/api/atletas';
let athletes = [];
let lastProcessedTime = 0;

const categories = {
    'M': ['59kg', '66kg', '74kg', '83kg', '93kg', '105kg', '120kg', '+120kg'],
    'F': ['47kg', '52kg', '57kg', '63kg', '69kg', '76kg', '84kg', '+84kg']
};

window.onload = function() {
    fetchLiveAthletes();
    // Atualiza o ranking a cada 1.5 segundos
    setInterval(fetchLiveAthletes, 1500);
}

async function fetchLiveAthletes() {
    try {
        const response = await fetch(API_URL);
        const newData = await response.json();
        
        // --- RADAR DE LUZES DE ARBITRAGEM ---
        let latestSignalAth = null;
        let maxTime = 0;
        let isFirstLoad = (athletes.length === 0);

        newData.forEach(a => {
            if (a.lastSignal && a.lastSignal.time > maxTime) {
                maxTime = a.lastSignal.time;
                latestSignalAth = a;
            }
        });

        // Pisca as luzes se tiver um julgamento novo
        if (latestSignalAth && maxTime > lastProcessedTime) {
            if (!isFirstLoad) { 
                showRefereeLights(latestSignalAth.name, latestSignalAth.lastSignal.status);
            }
            lastProcessedTime = maxTime;
        }

        // --- ATUALIZA O RANKING GERAL ---
        if(JSON.stringify(newData) !== JSON.stringify(athletes)) {
            athletes = newData;
            renderLiveResults(); // Atualiza a tabela geral
        }
    } catch (error) {
        console.error("Erro ao sincronizar telão:", error);
    }
}

// --- CONTROLE DAS LUZES DE POPUP ---
function showRefereeLights(name, status) {
    const overlay = document.getElementById('lights-overlay');
    const nameEl = document.getElementById('lights-name');
    const resultEl = document.getElementById('lights-result');

    nameEl.innerText = name;
    overlay.className = 'lights-overlay show'; 

    if (status === 1) {
        overlay.classList.add('valid');
        resultEl.innerText = 'VÁLIDO';
    } else if (status === 2) {
        overlay.classList.add('invalid');
        resultEl.innerText = 'INVÁLIDO';
    }

    // A tela fica com as luzes por 4 segundos e depois volta pro ranking
    setTimeout(() => {
        overlay.classList.remove('show');
        overlay.classList.remove('valid');
        overlay.classList.remove('invalid');
    }, 4000);
}

// --- LÓGICA DO RANKING GERAL ---
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

function renderLiveResults() {
    const display = document.getElementById('results-display');
    display.innerHTML = '';

    const generateRankBlock = (liftName, liftType) => {
        const container = document.createElement('div');
        container.className = 'ranking-container';
        container.innerHTML = `<h2 class="ranking-title">🏆 RANKING GERAL - ${liftName}</h2>`;
        
        const sections = [
            { title: 'OPEN (Até 39 anos)', filter: a => !a.age || parseInt(a.age) < 40 },
            { title: 'MASTERS (40+ anos)', filter: a => parseInt(a.age) >= 40 }
        ];

        let hasDataGlobal = false;

        sections.forEach(sec => {
            let sectionHasData = false;
            let sectionHtml = `<h3 style="margin-left:10px; color:#94a3b8; margin-top: 30px; font-size: 1.5rem;">${sec.title}</h3>`;

            ['F', 'M'].forEach(gender => {
                const gLabel = gender === 'F' ? 'Feminino' : 'Masculino';
                categories[gender].forEach(cat => {
                    let list = athletes.filter(a => 
                        a.gender === gender && a.weightClass === cat && sec.filter(a) &&
                        ((liftType === 'bench' && a.competesBench) || (liftType === 'deadlift' && a.competesDeadlift))
                    );

                    if(list.length > 0) {
                        hasDataGlobal = true;
                        sectionHasData = true;

                        list.forEach(a => a.bestRes = getBest(a, liftType));

                        // Ordena pelo maior peso validado
                        list.sort((a, b) => {
                            if(b.bestRes !== a.bestRes) return b.bestRes - a.bestRes;
                            const wA = parseFloat(a.bodyWeight) || 999;
                            const wB = parseFloat(b.bodyWeight) || 999;
                            return wA - wB; // Critério de desempate: mais leve ganha
                        });

                        sectionHtml += `
                            <div class="cat-result-box">
                                <div class="cat-result-header">${gLabel} - ${cat}</div>
                                <table>
                                    <tbody>
                                        ${list.map((a, i) => `
                                            <tr>
                                                <td width="50" style="color:white"><strong>${a.bestRes > 0 ? i+1+'º' : '-'}</strong></td>
                                                <td style="color:white; font-weight:800">${a.name}</td>
                                                <td width="150">BW: ${a.bodyWeight}kg</td>
                                                <td width="150" style="text-align:right; font-weight:900; color:#60a5fa; font-size:1.6rem">${a.bestRes}kg</td>
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

        if(!hasDataGlobal) container.innerHTML += '<p style="text-align:center;color:#64748b; font-size:1.3rem; margin-top:20px;">Aguardando resultados validados...</p>';
        display.appendChild(container);
    };

    generateRankBlock('SUPINO (Bench Press)', 'bench');
    generateRankBlock('LEVANTAMENTO TERRA (Deadlift)', 'deadlift');
}