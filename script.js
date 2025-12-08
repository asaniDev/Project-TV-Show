let allEpisodes = []; // Global storage for all episodes

// Runs when the page loads
function setup() {
  allEpisodes = getAllEpisodes(); // Store all episodes globally
  displayEpisodes(allEpisodes);   // Draw everything
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

window.onload = setup;
