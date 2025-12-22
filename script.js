// create global variables

const state = {
  currentView: "shows", // "shows" | "episodes"
  currentShowId: null,
};

const cache = {
  allShows: null, // Array of show objects
  episodesByShowId: {}, // { [showId]: episodes[] }
};

//let allShows = []; // stores all TV shows (fetched once)
let allEpisodes = []; // episodes of the currently selected show

let searchTerm = "";
let episodeCount = 0;

async function setup() {
  try {
    const shows = await getShows();
    displayShows(shows);
  } catch {
    // Message already shown by getShows
  }

  document
    .getElementById("showsContainer")
    .addEventListener("click", handleShowClick);

  document
    .getElementById("showSearchInput")
    .addEventListener("keyup", handleShowSearch);

  document
    .getElementById("episodeSelect")
    .addEventListener("change", handleEpisodeSelect);

  document.getElementById("searchInput").addEventListener("input", setupSearch);

  document
    .getElementById("backToShows")
    .addEventListener("click", handleBackToShows);
}

async function getShows() {
  if (cache.allShows) {
    return cache.shows;
  }

  try {
    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) {
      throw new Error("Unable to load shows at the moment.");
    }

    const shows = await response.json();
    cache.allShows = shows;
    return shows;
  } catch (error) {
    showMessage(
      "We couldn’t load the list of shows. Please check your connection and try again."
    );
    throw error; // rethrow so calling code knows it failed
  }
}

function setView(view) {
  state.currentView = view;

  document.getElementById("showsView").hidden = view !== "shows";
  document.getElementById("episodesView").hidden = view !== "episodes";
  document.getElementById("backToShows").hidden = view !== "episodes";
}

function showMessage(text, type = "error") {
  const message = document.getElementById("message");
  message.textContent = text;
  message.className = `message ${type}`;
  message.hidden = false;
}

function clearMessage() {
  const message = document.getElementById("message");
  message.hidden = true;
  message.textContent = "";
}

function handleBackToShows() {
  setView("shows");
  document.getElementById("episodeSelect").value = "";
  document.getElementById("searchInput").value = "";
}

function populateShowSelect() {
  const showSelect = document.getElementById("showSelect");

  cache.allShows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  showSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select a show";
  defaultOption.value = "";
  showSelect.appendChild(defaultOption);

  cache.allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name || "";
    showSelect.appendChild(option);
  });
}

function handleShowSearch(event) {
  const showSearchTerm = event.target.value.toLowerCase().trim();
  const shows = cache.allShows;

  const filteredList = shows.filter((show) => {
    const summary = (show.summary || "").toLowerCase();
    const name = (show.name || "").toLowerCase();
    const genres = Array.isArray(show.genres)
      ? show.genres.join(" ").toLowerCase()
      : "";
    return (
      summary.includes(showSearchTerm) ||
      name.includes(showSearchTerm) ||
      genres.includes(showSearchTerm)
    );
  });

  displayShows(filteredList);
}

function displayShows(shows) {
  const container = document.getElementById("showsContainer");
  const template = document.getElementById("showTemplate");

  // Clear previous render
  container.innerHTML = "";

  shows.forEach((show) => {
    // 1. Clone the template content
    const clone = template.content.cloneNode(true);

    // 2. Fill in the data "slots"
    const link = clone.querySelector(".show-link");
    link.textContent = show.name;
    link.dataset.showId = show.id;

    const image = clone.querySelector(".show-image");
    image.src = show.image?.medium || "";
    image.alt = show.name || "";

    clone.querySelector(".show-summary").innerHTML = show.summary || "";

    clone.querySelector(".show-genres").textContent = show.genres.join(", ");

    clone.querySelector(".show-status").textContent = show.status || "";

    clone.querySelector(".show-rating").textContent =
      show.rating.average ?? "N/A";

    clone.querySelector(".show-runtime").textContent = show.runtime ?? "N/A";

    // 3. Append to the container
    container.appendChild(clone);
  });
}

async function handleShowClick(event) {
  const link = event.target.closest("a[data-show-id]");
  if (!link) return;

  event.preventDefault();
  clearMessage();

  const showId = link.dataset.showId;
  state.currentShowId = showId;

  try {
    allEpisodes = await loadEpisodesForShow(showId);
    setupEpisodeSelector();
    displayEpisodes();
    setView("episodes");
  } catch {
    // App remains in shows view
    state.currentShowId = null;
  }
}

async function loadEpisodesForShow(showId) {
  if (cache.episodesByShowId[showId]) {
    return cache.episodesByShowId[showId];
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );

    if (!response.ok) {
      throw new Error("Unable to load episodes.");
    }

    const episodes = await response.json();
    cache.episodesByShowId[showId] = episodes;
    allEpisodes = episodes;
    return allEpisodes;
  } catch (error) {
    showMessage(
      "We couldn’t load episodes for this show. Please try again later."
    );
    throw error;
  }
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

  if (allEpisodes.length === 0) {
    container.textContent = "No episodes found.";
    return;
  }

  const lowerSearchTerm = (searchTerm || "").toLowerCase();

  let filteredList = allEpisodes.filter((episode) => {
    const name = (episode.name || "").toLowerCase();
    const summary = (episode.summary || "").toLowerCase();
    if (lowerSearchTerm === episode.id.toString()) {
      return true;
    } else if (
      name.toLowerCase().includes(lowerSearchTerm) ||
      summary.toLowerCase().includes(lowerSearchTerm)
    ) {
      return true;
    }
  });

  episodeCount = filteredList.length;

  const episodeCards = filteredList.map(createEpisodeCard);

  rootElem.append(...episodeCards);
}

function setupSearch(event) {
  searchTerm = event.target.value.toLowerCase();

  // compute filtered length here (same logic as displayEpisodes)
  const filteredLength = allEpisodes.filter((ep) => {
    const name = (ep.name || "").toLowerCase();
    const summary = (ep.summary || "").toLowerCase();
    return (
      searchTerm === ep.id.toString() ||
      name.includes(searchTerm) ||
      summary.includes(searchTerm)
    );
  }).length;

  searchCount.innerText = `Displaying ${filteredLength} / ${allEpisodes.length} episodes.`;
  searchCount.style.display =
    filteredLength > 0 && searchTerm !== "" ? "block" : "none";
  displayEpisodes();
  searchTerm = "";
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
}

function handleEpisodeSelect(event) {
  // create an object for searchCount display
  const searchCount = document.getElementById("searchCount");
  // Clear any free-form search count text
  searchCount.innerText = "";
  const selectedValue = event.target.value;

  if (selectedValue === "all") {
    // show all
    searchTerm = "";
  } else {
    // set searchTerm to the selected episode id so displayEpisodes filters by id
    searchTerm = selectedValue;
  }
  document.getElementById("searchInput").value = "";

  displayEpisodes();
  searchTerm = "";
}

window.onload = setup;

/*
async function handleShowSelect(event) {
  const showId = event.target.value;

  // If user selects the default/empty option, go back to shows view or clear episodes
  if (!showId) {
    state.currentShowId = null;
    allEpisodes = [];
    displayShows(cache.allShows || []);
    setView("shows");
    return;
  }

  // Disable the select while loading to prevent repeated clicks
  const select = event.target;
  select.disabled = true;
  clearMessage();

  try {
    state.currentShowId = showId;
    // loadEpisodesForShow returns the episodes; it sets cache and allEpisodes
    allEpisodes = await loadEpisodesForShow(showId);
    console.log(allEpisodes);

    // Setup episodes UI
    setupEpisodeSelector(); // populate episode select for the show
    displayEpisodes(); // render episode cards
    setView("episodes"); // show the episodes view and back button
  } catch (err) {
    // show a user-friendly message
    showMessage("Failed to load episodes for that show. Please try again.");
    console.error(err);
  } finally {
    select.disabled = false;
  }
}*/
