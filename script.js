//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  //rootElem.textContent = `Got ${episodeList.length} episode(s)`;

  for (let episode of episodeList) {
    const card = document.createElement("div");
    card.classList.add("card");

    const episodeName = document.createElement("h1");
    episodeName.innerText = `${episode.name}
  S${episode.season.toString().padStart(2, "0")}E${episode.number
      .toString()
      .padStart(2, "0")}`;

    const image = document.createElement("img");
    image.setAttribute("src", episode.image.medium);

    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;

    const credit = document.createElement("a");
    credit.setAttribute("href", "https://tvmaze.com/");
    credit.setAttribute("target", "blank");
    credit.innerText = `[TVMaze.com]`;

    //card.innerHTML = episodeList[0].summary;

    card.appendChild(episodeName);
    card.appendChild(image);
    card.appendChild(summary);
    card.appendChild(credit);
    rootElem.appendChild(card);
  }
}

window.onload = setup;
