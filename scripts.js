let allPokemons = [];
let offset = 0;
const limit = 20;

const typeColors = {
  normal: "hsl(120, 0%, 64%)",
  fire: "hsl(17, 100%, 49%)",
  water: "hsl(212, 100.00%, 61.80%)",
  electric: "hsl(36, 95.00%, 46.70%)",
  grass: "hsl(119, 54.90%, 56.80%)",
  ice: "hsl(201, 96.50%, 55.30%)",
  fighting: "hsl(3, 66%, 45%)",
  poison: "hsl(168, 87.90%, 42.00%)",
  ground: "hsl(21, 38%, 42%)",
  flying: "hsl(199, 76%, 75%)",
  psychic: "hsl(279, 88%, 65%)",
  bug: "hsl(81, 79.70%, 61.40%)",
  rock: "hsl(266, 4.20%, 32.70%)",
  ghost: "hsl(242, 100%, 93%)",
  dragon: "hsl(0, 100.00%, 50.00%)",
  dark: "hsl(24, 20.00%, 9.80%)",
  steel: "hsl(214, 25%, 36%)",
  fairy: "hsl(298, 65%, 70%)",
};

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
  if (searchValue.length < 3) {
    renderCards();
    return;
  }
  const content = document.getElementById("content");
  content.innerHTML = "";

  const filtered = filterPokemonsByName(searchValue);
  if (filtered.length === 0) {
    content.innerHTML = "<p> No Pokemon found.</p>";
    return;
  }
  renderFilteredPokemons(filtered, content);
  renderCards();
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

function getPokemonBgColor(pokemon) {
  const mainType = pokemon.types[0];
  return typeColors[mainType] || "#DDD";
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
  const percentage = Math.min(statValue, 100);
  return getStatBarTemplate(statName, percentage);
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
  let current = chainRoot;

  while (current) {
    const name = current.species.name;
    const imgData = await fetchPokemonImage(name);
    chain.push({ name: name, image: imgData });
    current = current.evolves_to[0];
  }

  return chain;
}

async function fetchPokemonImage(name) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = await res.json();
  return data.sprites.other.home.front_default;
}

function renderEvoChain(container, evoChain) {
  if (!evoChain.length) {
    container.innerHTML = `<p>Evolution data not available</p>`;
    return;
  }

  let html = evoChain
    .map((stage, index) => {
      const arrow =
        index < evoChain.length - 1 ? `<span class="arrow">➜</span>` : "";
      return getEvoChainTemplateInfo(stage, arrow);
    })
    .join("");

  container.innerHTML = html;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function overlay(i) {
  let overlayRef = document.getElementById("overlay");
  overlayRef.innerHTML = "";
  overlayRef.innerHTML += renderOverlayMain(i);
  overlayRef.classList.toggle("d_none");
}

function dialogPrevention(event) {
  event.stopPropagation();
}

function toggleOff() {
  let overlayRef = document.getElementById("overlay");
  overlayRef.classList.toggle("d_none");
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
  renderEvoChain(container, evoChain);
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

function arrowRight(i) {
  if (i < allPokemons.length - 1) {
    i++;
  } else {
    i = 0;
  }
  switchCardOverlay(i);
}

function arrowLeft(i) {
  if (i > 0) {
    i--;
  } else {
    i = allPokemons.length - 1;
  }
  switchCardOverlay(i);
}

function switchCardOverlay(i) {
  let overlayRef = document.getElementById("overlay");

  overlayRef.innerHTML = "";
  overlayRef.innerHTML = renderOverlayMain(i);
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
