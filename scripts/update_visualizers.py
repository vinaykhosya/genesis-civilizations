import os

files = [
    'portal/public/visualizer.html',
    'visualizer.html',
    'portal/public/agent_analysis.html',
    'agent_analysis.html'
]

html_old = '''                <!-- Agent Grid -->
                <div class="card">
                    <h2>Simulated Population (Select an Agent)</h2>
                    <div class="agent-grid" id="agentGrid">
                        <!-- Inserted dynamically -->
                    </div>
                </div>'''

html_new = '''                <!-- Agent Grid Card with Collapsible Header & Dropdown Controls -->
                <div class="card" id="simulatedPopulationCard">
                    <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;" onclick="toggleAgentGridCollapse()">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <h2 style="margin: 0; font-size: 1.1rem;">Simulated Population (Select an Agent)</h2>
                            <span id="agentCountBadge" class="experiment-tag" style="background: rgba(0, 242, 254, 0.1); color: #00f2fe; border: 1px solid rgba(0, 242, 254, 0.3);">0 Agents</span>
                        </div>
                        <button type="button" class="btn" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: #fff; display: flex; align-items: center; gap: 0.3rem;">
                            <span id="agentGridToggleText">▼ Hide Agent Grid</span>
                        </button>
                    </div>

                    <!-- Dropdown & Filter Toolbar -->
                    <div id="agentControlsBar" style="margin-top: 0.85rem; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; background: #080d16; padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color);" onclick="event.stopPropagation()">
                        <!-- Dropdown Select Menu -->
                        <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 220px;">
                            <label for="agentSelectDropdown" style="font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; font-weight: 600;">Dropdown Select Menu:</label>
                            <select id="agentSelectDropdown" onchange="selectAgent(parseInt(this.value))" style="width: 100%; background: #0d1424; border: 1px solid var(--border-color); color: #00f2fe; padding: 0.35rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-family: monospace; font-weight: 700; cursor: pointer;">
                                <!-- Inserted dynamically -->
                            </select>
                        </div>

                        <!-- Colony Filter Buttons -->
                        <div style="display: flex; align-items: center; gap: 0.35rem;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); margin-right: 0.2rem; font-weight: 600;">Colony:</span>
                            <button type="button" class="btn col-filter-btn active" data-colony="All" onclick="filterAgentGridColony('All')" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">All</button>
                            <button type="button" class="btn col-filter-btn" data-colony="0" onclick="filterAgentGridColony(0)" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; border-color: #ef4444; color: #ef4444;">Alpha</button>
                            <button type="button" class="btn col-filter-btn" data-colony="1" onclick="filterAgentGridColony(1)" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; border-color: #00f2fe; color: #00f2fe;">Beta</button>
                            <button type="button" class="btn col-filter-btn" data-colony="2" onclick="filterAgentGridColony(2)" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; border-color: #10b981; color: #10b981;">Gamma</button>
                            <button type="button" class="btn col-filter-btn" data-colony="3" onclick="filterAgentGridColony(3)" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; border-color: #a855f7; color: #a855f7;">Delta</button>
                        </div>

                        <!-- Search Input -->
                        <div style="display: flex; align-items: center; gap: 0.35rem; width: 140px;">
                            <input type="text" id="agentSearchInput" placeholder="Search Agent ID..." oninput="filterAgentGridSearch(this.value)" style="width: 100%; background: #0d1424; border: 1px solid var(--border-color); color: #fff; padding: 0.3rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                        </div>
                    </div>

                    <!-- Collapsible Grid Container -->
                    <div class="agent-grid" id="agentGrid" style="margin-top: 1rem;">
                        <!-- Inserted dynamically -->
                    </div>
                </div>'''

js_old = '''        // Initialize Agent grid
        function buildAgentGrid() {
            const grid = document.getElementById('agentGrid');
            grid.innerHTML = '';
            SIMULATION_DATA.agents.forEach(agent => {
                const chip = document.createElement('div');
                chip.className = `agent-chip ${agent.dead ? 'dead' : ''} ${agent.id === selectedAgentId ? 'selected' : ''}`;
                chip.innerHTML = `
                    <div class="agent-color-box" style="background-color: ${getColonyColor(agent.colony_id)}"></div>
                    <div>Agent #${agent.id}</div>
                `;
                chip.onclick = () => selectAgent(agent.id);
                grid.appendChild(chip);
            });
        }'''

js_new = '''        // Initialize Agent grid, dropdown select menu & collapsible state
        let isAgentGridCollapsed = false;
        let activeAgentColonyFilter = 'All';
        let agentSearchQuery = '';
        let agentDisplayLimit = 100;

        function toggleAgentGridCollapse() {
            isAgentGridCollapsed = !isAgentGridCollapsed;
            const grid = document.getElementById('agentGrid');
            const toggleText = document.getElementById('agentGridToggleText');
            if (grid) {
                grid.style.display = isAgentGridCollapsed ? 'none' : 'grid';
            }
            if (toggleText) {
                toggleText.innerText = isAgentGridCollapsed ? '▲ Show Agent Grid' : '▼ Hide Agent Grid';
            }
        }

        function filterAgentGridColony(colonyId) {
            activeAgentColonyFilter = colonyId;
            agentDisplayLimit = 100;
            document.querySelectorAll('.col-filter-btn').forEach(btn => {
                if (btn.getAttribute('data-colony') === String(colonyId)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            buildAgentGrid();
        }

        function filterAgentGridSearch(query) {
            agentSearchQuery = (query || '').toLowerCase();
            agentDisplayLimit = 100;
            buildAgentGrid();
        }

        function buildAgentGrid() {
            const grid = document.getElementById('agentGrid');
            const dropdown = document.getElementById('agentSelectDropdown');
            const countBadge = document.getElementById('agentCountBadge');
            
            if (!SIMULATION_DATA || !SIMULATION_DATA.agents) return;

            const allAgents = SIMULATION_DATA.agents;

            if (countBadge) {
                countBadge.innerText = `${allAgents.length.toLocaleString()} Agents`;
            }

            // 1. Populate Dropdown Select Menu
            if (dropdown) {
                if (dropdown.options.length !== allAgents.length) {
                    dropdown.innerHTML = '';
                    allAgents.forEach(agent => {
                        const opt = document.createElement('option');
                        opt.value = agent.id;
                        const colonyName = typeof getColonyName === 'function' ? getColonyName(agent.colony_id) : `Colony ${agent.colony_id}`;
                        const status = agent.dead ? 'Dead' : 'Alive';
                        opt.innerText = `Agent #${agent.id} (${colonyName}, Gen ${agent.generation || 0}, ${status})`;
                        if (agent.id === selectedAgentId) opt.selected = true;
                        dropdown.appendChild(opt);
                    });
                } else {
                    dropdown.value = selectedAgentId;
                }
            }

            if (!grid) return;
            grid.style.display = isAgentGridCollapsed ? 'none' : 'grid';
            grid.innerHTML = '';

            // 2. Filter agents for grid display
            const filtered = allAgents.filter(agent => {
                if (activeAgentColonyFilter !== 'All' && agent.colony_id !== parseInt(activeAgentColonyFilter)) {
                    return false;
                }
                if (agentSearchQuery && !String(agent.id).includes(agentSearchQuery)) {
                    return false;
                }
                return true;
            });

            const toShow = filtered.slice(0, agentDisplayLimit);
            toShow.forEach(agent => {
                const chip = document.createElement('div');
                chip.className = `agent-chip ${agent.dead ? 'dead' : ''} ${agent.id === selectedAgentId ? 'selected' : ''}`;
                chip.innerHTML = `
                    <div class="agent-color-box" style="background-color: ${getColonyColor(agent.colony_id)}"></div>
                    <div>Agent #${agent.id}</div>
                `;
                chip.onclick = () => selectAgent(agent.id);
                grid.appendChild(chip);
            });

            if (filtered.length > agentDisplayLimit) {
                const moreBtn = document.createElement('button');
                moreBtn.className = 'btn';
                moreBtn.style.gridColumn = '1 / -1';
                moreBtn.style.padding = '0.4rem';
                moreBtn.style.fontSize = '0.8rem';
                moreBtn.innerText = `Show More Agents (${toShow.length} of ${filtered.length} shown)...`;
                moreBtn.onclick = (e) => {
                    e.stopPropagation();
                    agentDisplayLimit += 150;
                    buildAgentGrid();
                };
                grid.appendChild(moreBtn);
            }
        }'''

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        replaced_html = False
        replaced_js = False

        if html_old in content:
            content = content.replace(html_old, html_new)
            replaced_html = True
        else:
            print(f'Warning: html_old not found in {filepath}')

        if js_old in content:
            content = content.replace(js_old, js_new)
            replaced_js = True
        else:
            print(f'Warning: js_old not found in {filepath}')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f'{filepath}: HTML replaced={replaced_html}, JS replaced={replaced_js}')
