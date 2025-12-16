const endPoint = "https://api.tvmaze.com/shows/82/episodes";

async function fetchEpisodes() {
  const response = await fetch(endPoint);
  if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
  const data = await response.json();
  return data;
}

let searchTerm = "";
let episodeCount = 0;
let allEpisodes = []; // Global storage for all episodes

// Runs when the page loads
function setup() {
  fetchEpisodes()
    .then((episodes) => {
      allEpisodes = episodes; // Store all episodes globally

      displayEpisodes(); // Draw everything
      setupEpisodeSelector();
      setupSearch(); // Setup the search functionality
    })
    .catch((error) => console.error("Caught error:", error.message));
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
    }

    displayEpisodes();
  });
}

function setupEpisodeSelector() {
  const selectElem = document.createElement("select");
  const rootElem = document.getElementById("root");
  rootElem.before(selectElem); // Add the select element above the episode list

  // Add the "Show All Episodes" option
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "Show All Episodes";
  selectElem.insertBefore(defaultOption, selectElem.firstChild);

  // Populate the select options
  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    const seasonCode = episode.season.toString().padStart(2, "0");
    const episodeCode = episode.number.toString().padStart(2, "0");
    option.value = episode.id; // Use a unique identifier
    option.textContent = `S${seasonCode}E${episodeCode} - ${episode.name}`;
    selectElem.appendChild(option);
  });

  // Add event listener for selection
  selectElem.addEventListener("change", (event) => {
    if (event.target.value === "all") {
      displayEpisodes(allEpisodes);
    } else {
      const selectedId = parseInt(event.target.value, 10);
      const selectedEpisode = allEpisodes.find((ep) => ep.id === selectedId);
      displayEpisodes(selectedEpisode ? [selectedEpisode] : []);
    }
  });
}

window.onload = setup;
