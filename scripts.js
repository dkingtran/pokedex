let allPokemons = [];
let offset = 0;
const limit = 20;

function getTypeBgClass(type) {
  return `type-bg-${type}`;
}

function getPokemonBgColor(pokemon) {
  return getTypeBgClass(pokemon.types[0]);
}


// State für aktuelle Evo-Position pro Overlay
const evoChainState = { };

function getTypeIconURL(type) {
  return `assets/img/types/${type}.png`;
}

async function init() {
  document.getElementById("search_bar").oninput = debounce(filterAndShowNames, 200);
  toggleSpinner(true);
  offset = 0;
  const pokemonList = await fetchPokemonList(offset, limit);
  const firstBatch = await fetchFullPokemonDetails(pokemonList);
  allPokemons = firstBatch;
  offset += limit;
  renderCards();
  toggleSpinner(false);
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

function filterAndShowNames() {
  const searchValue = getSearchInput();
  const content = document.getElementById("content");
  content.innerHTML = "";

  if (searchValue.length < 3) return renderCards();

  const filtered = filterPokemonsByName(searchValue);
  filtered.length === 0
    ? (
        content.innerHTML = '<p class="not-found-alert" id="not-found-msg">No Pokémon found.</p>',
        setTimeout(() => {
          const msg = document.getElementById('not-found-msg');
          if (msg) msg.remove();
        }, 4000)
      )
    : renderFilteredPokemons(filtered, content);
}


function getSearchInput() {
  return document.getElementById("search_bar").value.toLowerCase();
}


function filterPokemonsByName(query) {
  return allPokemons.filter((p) => p.name.toLowerCase().includes(query));
}


function renderFilteredPokemons(pokemons, container) {
  pokemons.forEach((pokemon) => {
    const i = allPokemons.indexOf(pokemon);
    container.innerHTML += renderOutsideCard(i);
  });
}


function renderCards() {
  let outsideCard = document.getElementById("content");
  outsideCard.innerHTML = ""; // Kartenbereich immer leeren
  for (let i = 0; i < allPokemons.length; i++) {
    outsideCard.innerHTML += renderOutsideCard(i);
  }
  renderOverlayCards();
}


function renderOverlayCards() {
  let OverlayCard = document.getElementById("overlay");
  for (let i = 0; i < allPokemons.length; i++) {
    OverlayCard.innerHTML += renderOverlayMain(i);
  }
}


function getTypeIconsHTML(types) {
  return types
    .map((type) => {
      const iconURL = getTypeIconURL(type);
      return `<img src="${iconURL}" alt="${type}" class="type-icon" title="${type}">`;
    })
    .join("");
}


function getStatBarsHTML(stats) {
  return `
        ${getStatBar("hp", stats.hp)}
        ${getStatBar("attack", stats.attack)}
        ${getStatBar("defense", stats.defense)}
        ${getStatBar("special-attack", stats["special-attack"])}
        ${getStatBar("special-defense", stats["special-defense"])}
        ${getStatBar("speed", stats.speed)}
    `;
}


function renderOutsideCard(i) {
  const pokemon = allPokemons[i];
  const bgColor = getPokemonBgColor(pokemon);
  const typeIconsHTML = getTypeIconsHTML(pokemon.types);
  return getOutsideCardTemplate(i, pokemon, bgColor, typeIconsHTML);
}


function renderOverlayMain(i) {
  const pokemon = allPokemons[i];
  const bgColor = getPokemonBgColor(pokemon);
  const typeIconsHTML = getTypeIconsHTML(pokemon.types);
  return getOverlayTemplate(i, pokemon, bgColor, typeIconsHTML);
}


function renderOverlayStats(i) {
  const pokemon = allPokemons[i];
  const bgColor = getPokemonBgColor(pokemon);
  const typeIconsHTML = getTypeIconsHTML(pokemon.types);
  const statBarsHTML = getStatBarsHTML(pokemon.stats);
  return getOverlayStatsTemplate(
    i,
    pokemon,
    bgColor,
    typeIconsHTML,
    statBarsHTML
  );
}


function renderOverlayEvoChain(i) {
  const pokemon = allPokemons[i];
  const bgColor = getPokemonBgColor(pokemon);
  const typeIconsHTML = getTypeIconsHTML(pokemon.types);
  return getOverlayEvoChainTemplate(i, pokemon, bgColor, typeIconsHTML);
}


async function fetchPokemonData() {
  try {
    const pokemonList = await fetchPokemonList();
    allPokemons = await fetchFullPokemonDetails(pokemonList);
  } catch (error) {
    console.error("Failed to fetch Pokémon data:", error);
  }
}


async function fetchPokemonList(offset, limit) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  );
  const data = await response.json();
  return data.results;
}


async function fetchFullPokemonDetails(pokemonResults) {
  return await Promise.all(
    pokemonResults.map(async (pokemon) => {
      const res = await fetch(pokemon.url);
      const fullData = await res.json();
      return {
        name: pokemon.name,
        sprite: fullData.sprites.other.home.front_default,
        types: fullData.types.map((t) => t.type.name),
        height: fullData.height * 10,
        weight: fullData.weight / 10,
        base_experience: fullData.base_experience,
        abilities: fullData.abilities.map((ab) => ab.ability.name),
        stats: fullData.stats.reduce((acc, stat) => {
          acc[stat.stat.name] = stat.base_stat;
          return acc;
        }, {}),
      };
    })
  );
}


function getStatBar(statName, statValue) {
  const maxStat = 150; 
  const percentage = Math.min((statValue / maxStat) * 100, 100);
  const color = percentage < 50 ? "#e74c3c" : "#27ae60";
  return getStatBarTemplate(statName, percentage, color);
}


async function getEvolutionChain(pokemonName) {
  try {
    const speciesData = await fetchSpeciesData(pokemonName);
    const evoData = await fetchEvolutionData(speciesData.evolution_chain.url);
    return await extractEvolutionChain(evoData.chain);
  } catch (err) {
    console.error("Evolution chain error:", err);
    return [];
  }
}


async function fetchSpeciesData(pokemonName) {
  const speciesRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`
  );
  return await speciesRes.json();
}


async function fetchEvolutionData(url) {
  const evoRes = await fetch(url);
  return await evoRes.json();
}


async function extractEvolutionChain(chainRoot) {
  const chain = [];

  for (let current = chainRoot; current; current = current.evolves_to[0]) {
    const name = current.species.name;
    const imgData = await fetchPokemonImage(name);
    chain.push({ name: name, image: imgData });
  }

  return chain;
}


async function fetchPokemonImage(name) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = await res.json();
  return data.sprites.other.home.front_default;
}


function renderEvoChain(container, evoChain, i) {
  if (!evoChain.length) {
    container.innerHTML = `<p>Evolution data not available</p>`;
    return;
  }
  container.innerHTML = window.matchMedia("(max-width: 410px)").matches
    ? (evoChainState[i] === undefined && (evoChainState[i] = 0), getEvoChainWithNavTemplate(evoChain, evoChainState[i], i))
    : evoChain
        .map((stage, index) =>
          getEvoChainTemplateInfo(stage, index < evoChain.length - 1 ? `<span class="arrow">➜</span>` : "")
        )
        .join("");
  container._evoChain = evoChain;
}


function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


function overlay(i) {
  let overlayRef = document.getElementById("overlay");
  overlayRef.innerHTML = "";
  overlayRef.innerHTML += renderOverlayMain(i);
  overlayRef.classList.toggle("d_none");

  document.body.classList.add("no-scroll");
}



function dialogPrevention(event) {
  event.stopPropagation();
}


function toggleOff() {
  let overlayRef = document.getElementById("overlay");
  overlayRef.classList.toggle("d_none");

  document.body.classList.remove("no-scroll");
}



async function loadAndRenderMain(i) {
  const overlayRef = document.getElementById("overlay");
  overlayRef.innerHTML = renderOverlayMain(i);
}


async function loadAndRenderStats(i) {
  const overlayRef = document.getElementById("overlay");
  overlayRef.innerHTML = renderOverlayStats(i);
}


async function loadAndRenderEvoChain(i) {
  const pokemon = allPokemons[i];
  const container = document.getElementById(`evo-chain-info-${i}`);
  const evoChain = await getEvolutionChain(pokemon.name);
  evoChainState[i] = 0; // State zurücksetzen
  renderEvoChain(container, evoChain, i);
}


async function switchToMainSection(i) {
  toggleOverlaySpinner(true);
  setTimeout(async () => {
    await loadAndRenderMain(i);
    toggleOverlaySpinner(false);
  }, 0);
}


async function switchToStatsSection(i) {
  toggleOverlaySpinner(true);
  setTimeout(async () => {
    await loadAndRenderStats(i);
    toggleOverlaySpinner(false);
  }, 0);
}


async function switchToEvoChainSection(i) {
  let overlayRef = document.getElementById("overlay");
  overlayRef.innerHTML = "";
  overlayRef.innerHTML += renderOverlayEvoChain(i);
  toggleOverlaySpinner(true);
  setTimeout(async () => {
    await loadAndRenderEvoChain(i);
    toggleOverlaySpinner(false);
  }, 200);
}


function toggleSpinner(show) {
  const spinner = document.getElementById("spinner");
  if (show) {
    spinner.classList.remove("hidden");
  } else {
    spinner.classList.add("hidden");
  }
}


function toggleOverlaySpinner(show) {
  const overlaySpinner = document.getElementById("overlay_spinner");
  if (!overlaySpinner) return;

  if (show) {
    overlaySpinner.classList.remove("d_none");
  } else {
    overlaySpinner.classList.add("d_none");
  }
}


function arrowRight(i, section = null) {
  if (i < allPokemons.length - 1) {
    i++;
  } else {
    i = 0;
  }
  switchCardOverlay(i, section);
}


function arrowLeft(i, section = null) {
  if (i > 0) {
    i--;
  } else {
    i = allPokemons.length - 1;
  }
  switchCardOverlay(i, section);
}


function switchCardOverlay(i, section = null) {
  let overlayRef = document.getElementById("overlay");
  overlayRef.innerHTML = "";
 
  if (section === "stats") {
    overlayRef.innerHTML = renderOverlayStats(i);
  } else if (section === "evo_chain") {
    overlayRef.innerHTML = renderOverlayEvoChain(i);
  
    setTimeout(() => loadAndRenderEvoChain(i), 0);
  } else {
    overlayRef.innerHTML = renderOverlayMain(i);
  }
}


async function loadMorePokemons() {
  toggleSpinner(true);
  const pokemonList = await fetchPokemonList(offset, limit);
  const newPokemons = await fetchFullPokemonDetails(pokemonList);
  allPokemons = allPokemons.concat(newPokemons);
  offset += limit;
  renderNewCards(newPokemons);
  toggleSpinner(false);
}


function renderNewCards(pokemonList) {
  const content = document.getElementById("content");
  const overlay = document.getElementById("overlay");

  pokemonList.forEach((pokemon, index) => {
    const i = allPokemons.indexOf(pokemon);
    content.innerHTML += renderOutsideCard(i);
    overlay.innerHTML += renderOverlayMain(i);
  });
}


function showPrevEvo(i) {
  const container = document.getElementById(`evo-chain-info-${i}`);
  const evoChain = container._evoChain;
  if (!evoChain) return;
  if (evoChainState[i] > 0) {
    evoChainState[i]--;
    container.innerHTML = getEvoChainWithNavTemplate(evoChain, evoChainState[i], i);
  }
}

function showNextEvo(i) {
  const container = document.getElementById(`evo-chain-info-${i}`);
  const evoChain = container._evoChain;
  if (!evoChain) return;
  if (evoChainState[i] < evoChain.length - 1) {
    evoChainState[i]++;
    container.innerHTML = getEvoChainWithNavTemplate(evoChain, evoChainState[i], i);
  }
}


window.addEventListener('resize', handleEvoChainResize);

function handleEvoChainResize() {
    document.querySelectorAll('.Evo-Chain-infos').forEach(container => {
        const match = container.id && container.id.match(/^evo-chain-info-(\d+)$/);
        if (!match) return;
        const i = Number(match[1]);
        const evoChain = container._evoChain;
        if (!evoChain) return;
        if (window.matchMedia("(max-width: 410px)").matches) {
            if (window.evoChainState && window.evoChainState[i] === undefined) window.evoChainState[i] = 0;
            container.innerHTML = getEvoChainWithNavTemplate(evoChain, window.evoChainState ? window.evoChainState[i] : 0, i);
        } else {
            let html = evoChain
                .map((stage, index) => {
                    const arrow =
                        index < evoChain.length - 1 ? `<span class="arrow">➜</span>` : "";
                    return getEvoChainTemplateInfo(stage, arrow);
                })
                .join("");
            container.innerHTML = html;
        }
    });
}


