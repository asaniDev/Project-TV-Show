let allEpisodes = []; // Global storage for all episodes

// Runs when the page loads
function setup() {
  allEpisodes = getAllEpisodes(); // Store all episodes globally
  displayEpisodes(allEpisodes);   // Draw everything

  setupSearch();                // Setup the search functionality
  setupEpisodeSelector();       // Setup the episode dropdown selector
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
function displayEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear old content before re-drawing

  episodeList.forEach((episode) => {
    const card = createEpisodeCard(episode);
    rootElem.appendChild(card);
  });
}

// Add the search function.
function setupSearch() {

  const searchInput = document.getElementById("searchInput");
  const searchCount = document.getElementById("searchCount");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {

      const nameMatch = episode.name.toLowerCase().includes(searchTerm);

      const summaryMatch = episode.summary.toLowerCase().includes(searchTerm);

      return nameMatch || summaryMatch;
      
    });
   
    displayEpisodes(filteredEpisodes);
    

    // update counter
    searchCount.innerText = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episodes.`;
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
