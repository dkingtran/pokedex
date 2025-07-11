function getOutsideCardTemplate(i, pokemon, bgColor, typeIconsHTML) {
  return /*html*/ `
  <div class="outside-card-position">
      <div onclick="overlay(${i})" class="card-outside" style="background-color: ${bgColor};">
          <header class="card-header">
              <span id="pokemon_id">#${i + 1}</span>
              <span class="pokemon-name" id="pokemon_name">${pokemon.name}</span>
              <span></span>
          </header>
          <main class="outside-card-main">
              <div>
                  <img class="pokemon-img" src="${pokemon.sprite}" alt="${pokemon.name}" id="pokemon_sprite">
              </div>                
          </main>
          <footer class="card-footer">
              ${typeIconsHTML}    
          </footer>
      </div>
  </div>
  `;
}

function getOverlayTemplate(i, pokemon, bgColor, typeIconsHTML) {
  return /*html*/ `
      <div class="overlay-template-position">
          <div class="overlay-template" onclick="dialogPrevention(event)" style="background-color: ${bgColor};">
              <header class="overlay-template-header">
                  <span id="pokemon_id">#${i + 1}</span>
                  <span class="pokemon-name-overlay" id="pokemon_name">${pokemon.name}</span>
                  <div class="cursor-pointer x" onclick="toggleOff()">X</div>
              </header>
              <main class="overlay-template-main">
                  <div class="pokemon-img-section-position">
                      <div>
                          <img class="pokemon-img" src="${pokemon.sprite}" alt="${pokemon.name}" id="pokemon_sprite">
                      </div>                
                  </div>
                  <div class="type-section card-footer-overlay type-switch-row">
                      <button class="switch-button switch-left" onclick="arrowLeft(${i}, 'main')">&#10094;</button>
                      <div class="type-icons-center">${typeIconsHTML}</div>
                      <button class="switch-button switch-right" onclick="arrowRight(${i}, 'main')">&#10095;</button> 
                  </div>
              </main>
              <footer class="overlay-template-footer">
                  <div class="info-sections">
                      <div onclick="switchToMainSection(${i})" id="main" class="main-section info-sections-hover cursor-pointer active">main</div>
                      <div onclick="switchToStatsSection(${i})" id="stats" class="stats-section info-sections-hover cursor-pointer">stats</div>
                      <div onclick="switchToEvoChainSection(${i})" id="evo_chain" class="evo-chain-section info-sections-hover cursor-pointer">evo chain</div>
                  </div>
                  <div class="main-infos">
                      <div id="overlay_spinner" class="spinner-overlay d_none">
                          <img src="assets/img/logo/pokeball.png" alt="Loading..." />
                      </div>
                      <div class="main-infos-divs infos-name">
                          <span class="main-infos-span">Height:</span>
                          <span class="main-infos-span">Weight:</span>
                          <span class="main-infos-span">Base experience:</span>
                          <span class="main-infos-span">Abilities:</span>
                      </div>
                      <div class="main-infos-divs main-info-value">
                          <span class="main-infos-span">${pokemon.height} cm</span>
                          <span class="main-infos-span">${pokemon.weight} kg</span>
                          <span class="main-infos-span">${pokemon.base_experience}</span>
                          <span class="main-infos-span">${pokemon.abilities.join(', ')}</span>
                      </div>
                  </div>
              </footer>
          </div>
      </div>
  `;
}

function getOverlayStatsTemplate(i, pokemon, bgColor, typeIconsHTML, statBarsHTML) {
  return /*html*/ `
  <div class="overlay-template-position">
      <div class="overlay-template" onclick="dialogPrevention(event)" style="background-color: ${bgColor};">
          <header class="overlay-template-header">
              <span id="pokemon_id">#${i + 1}</span>
              <span class="pokemon-name-overlay" id="pokemon_name">${pokemon.name}</span>
              <div class="cursor-pointer x" onclick="toggleOff()">X</div>
          </header>
          <main class="overlay-template-main">
              <div class="pokemon-img-section-position">
                  <div>
                      <img class="pokemon-img" src="${pokemon.sprite}" alt="${pokemon.name}" id="pokemon_sprite">
                  </div>                
              </div>
              <div class="type-section card-footer-overlay type-switch-row">
                  <button class="switch-button switch-left" onclick="arrowLeft(${i}, 'stats')">&#10094;</button>
                  <div class="type-icons-center">${typeIconsHTML}</div>
                  <button class="switch-button switch-right" onclick="arrowRight(${i}, 'stats')">&#10095;</button>  
              </div>
          </main>
          <footer class="overlay-template-footer">
              <div class="info-sections">
                  <div onclick="switchToMainSection(${i})" id="main" class="main-section info-sections-hover cursor-pointer">main</div>
                  <div onclick="switchToStatsSection(${i})" id="stats" class="stats-section info-sections-hover cursor-pointer active">stats</div>
                  <div onclick="switchToEvoChainSection(${i})" id="evo_chain" class="evo-chain-section info-sections-hover cursor-pointer">evo chain</div>
              </div>
              <div class="stats-info-container">
                  <div class="stats-bar-and-label">
                      <div class="stats-list">
                          <div id="overlay_spinner" class="spinner-overlay d_none">
                              <img src="assets/img/logo/pokeball.png" alt="Loading..." />
                          </div>
                          ${statBarsHTML}
                      </div>
                  </div> 
              </div>
          </footer>
      </div>
  </div>
  `;
}

function getOverlayEvoChainTemplate(i, pokemon, bgColor, typeIconsHTML) {
  return /*html*/ `
  <div class="overlay-template-position">
      <div class="overlay-template" onclick="dialogPrevention(event)" style="background-color: ${bgColor};">
          <header class="overlay-template-header">
              <span id="pokemon_id">#${i + 1}</span>
              <span class="pokemon-name-overlay" id="pokemon_name">${pokemon.name}</span>
              <div class="cursor-pointer x" onclick="toggleOff()">X</div>
          </header>
          <main class="overlay-template-main">
              <div class="pokemon-img-section-position">
                  <div>
                      <img class="pokemon-img" src="${pokemon.sprite}" alt="${pokemon.name}" id="pokemon_sprite">
                  </div>                
              </div>
              <div class="type-section card-footer-overlay type-switch-row">
                  <button class="switch-button switch-left" onclick="arrowLeft(${i}, 'evo_chain')">&#10094;</button>
                  <div class="type-icons-center">${typeIconsHTML}</div>
                  <button class="switch-button switch-right" onclick="arrowRight(${i}, 'evo_chain')">&#10095;</button>  
              </div>
          </main>
          <footer class="overlay-template-footer evo-chain-footer">
              <div class="info-sections">
                  <div onclick="switchToMainSection(${i})" id="main" class="main-section info-sections-hover cursor-pointer">main</div>
                  <div onclick="switchToStatsSection(${i})" id="stats" class="stats-section info-sections-hover cursor-pointer">stats</div>
                  <div onclick="switchToEvoChainSection(${i})" id="evo_chain" class="evo-chain-section info-sections-hover cursor-pointer active">evo chain</div>
              </div>
              <div class="Evo-Chain-infos" id="evo-chain-info-${i}">
                  <div id="overlay_spinner" class="spinner-overlay d_none">
                      <img src="assets/img/logo/pokeball.png" alt="Loading..." />
                  </div>
              </div>
          </footer>
      </div>
  </div>
  `;
}


function getStatBarTemplate(statName, percentage, color){
  return `
      <div class="stat-bar-row">
          <span class="stat-label">${statName}</span>
          <div class="stat-bar-bg">
              <div class="stat-bar-fill" style="width: ${percentage}%; background-color: ${color};"></div>
          </div>
      </div>
  `;
}

function getEvoChainTemplateInfo(stage, arrow){
return `
          <div class="evo-chain">
              <img class="evo-img" src="${stage.image}" alt="${stage.name}">
              <span class="evo-pokemon-name">${capitalize(stage.name)}</span>
          </div>
          ${arrow}
      `;
}

