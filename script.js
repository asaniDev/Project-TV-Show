// create global variables

let allShows = [];          // stores all TV shows (fetched once)
let allEpisodes = [];      // episodes of the currently selected show
let episodesCache = {};    // cache episodes by showId


let searchTerm = "";
let episodeCount = 0;



function setup() {
  fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load shows");
      }
      return response.json();
    })
    .then((shows) => {
      allShows = shows;          //  store shows globally
      populateShowSelect();     // fill dropdown
    })
    .catch(() => {
      const root = document.getElementById("root");
      root.innerHTML = "<p>Sorry, failed to load TV shows.</p>";
    });
}

function populateShowSelect() {
  const showSelect = document.getElementById("showSelect");

  allShows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  showSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select a show";
  defaultOption.value = "";
  showSelect.appendChild(defaultOption);

  allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  showSelect.addEventListener("change", () => {
    if (showSelect.value) {
      loadEpisodesForShow(showSelect.value);
    }
  });
}

function loadEpisodesForShow(showId) {
  searchTerm = "";

  if (episodesCache[showId]) {
    allEpisodes = episodesCache[showId];
    displayEpisodes();
    setupEpisodeSelector();
    setupSearch();
    return;
  }

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => response.json())
    .then((episodes) => {
      episodesCache[showId] = episodes;
      allEpisodes = episodes;

      displayEpisodes();
      setupEpisodeSelector();
      setupSearch();
    })
    .catch(() => {
      document.getElementById("root").innerHTML =
        "<p>Failed to load episodes.</p>";
    });
}



// Create ONE episode card and return it
function createEpisodeCard(episode) {
  const card = document.createElement("div");
  card.classList.add("card");

  // Episode Title — name + SxxExx code
  const episodeName = document.createElement("h1");
  const seasonCode = episode.season.toString().padStart(2, "0");
  const episodeCode = episode.number.toString().padStart(2, "0");

  episodeName.innerText = `${episode.name} S${seasonCode}E${episodeCode}`;

  // Image
  const image = document.createElement("img");
  image.src = episode.image.medium;

  // Summary
  const summary = document.createElement("p");
  summary.innerHTML = episode.summary;

  // Attribution / Credit
  const credit = document.createElement("a");
  credit.href = "https://tvmaze.com/";
  credit.target = "_blank";
  credit.innerText = "[TVMaze.com]";

  // Build the card
  card.appendChild(episodeName);
  card.appendChild(image);
  card.appendChild(summary);
  card.appendChild(credit);

  return card;
}

// Draw ALL episodes in the list
function displayEpisodes() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear old content before re-drawing
  episodeCount = 0;

  let filteredList = allEpisodes.filter((episode) => {
    if (searchTerm === episode.id.toString()) {
      return true;
    } else if (
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
    ) {
      return true;
    }
  });

  episodeCount = filteredList.length;

  const episodeCards = filteredList.map(createEpisodeCard);

  rootElem.append(...episodeCards);
}

// Add the search function.
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchCount = document.getElementById("searchCount");
  searchCount.innerText = "";

  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.toLowerCase();
    searchCount.innerText = `Displaying ${episodeCount} / ${allEpisodes.length} episodes.`;

    if (episodeCount > 0 && searchTerm !== "") {
      searchCount.style.display = "block";
    } else {
      searchCount.style.display = "none";
    }

    displayEpisodes();
  });
}

function setupEpisodeSelector() {
  // If a select exists in the page (we added it in index.html), use it.
  // Otherwise create one and insert before #root as a fallback.
  const rootElem = document.getElementById("root");
  let selectElem = document.getElementById("episodeSelect");
  if (!selectElem) {
    selectElem = document.createElement("select");
    selectElem.id = "episodeSelect";
    rootElem.before(selectElem); // fallback placement
  }

  // Clear existing options (in case setup is called more than once)
  selectElem.innerHTML = "";

  // Add the "Show All Episodes" option
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "Show All Episodes";
  selectElem.appendChild(defaultOption);

  // Populate the select options
  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    const seasonCode = episode.season.toString().padStart(2, "0");
    const episodeCode = episode.number.toString().padStart(2, "0");
    option.value = episode.id; // Use a unique identifier
    option.textContent = `S${seasonCode}E${episodeCode} - ${episode.name}`;
    selectElem.appendChild(option);
  });

  // create an object for searchCount display
  const searchCount = document.getElementById("searchCount");

  // Add event listener for selection
  selectElem.addEventListener("change", (event) => {
    // Clear any free-form search count text
    searchCount.innerText = "";

    if (selectElem.value === "all") {
      // show all
      searchTerm = "";
    } else {
      // set searchTerm to the selected episode id so displayEpisodes filters by id
      searchTerm = selectElem.value;
      console.log(`search Term is ${searchTerm}`);
    }

    displayEpisodes();
  });
}

window.onload = setup;
