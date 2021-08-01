const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQyIiwibmJmIjoxNjI3Mjg3Njk2LCJleHAiOjE2Mjk4Nzk2OTYsImlhdCI6MTYyNzI4NzY5Nn0.v9kkvkjZYxVnESVP1sluIJG-6MAap1_GObdRarpoX68";
const apiUrl = "https://api.aniapi.com/v1/anime";

const ul = document.getElementById("anime-list");
const input = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const showPage = document.getElementById("show-anime");
const showPageBtn = document.querySelector(".close-show-anime");
const pageBtns = document.getElementById("pages");
const searchSection = document.getElementById("search-section");
const load = document.getElementById("loading");
const footer = document.querySelector("footer");
const loadMoreBtn = document.querySelector(".load-btn");
const toTop = document.querySelector(".to-top");
const banner = document.querySelector(".img-banner");
const score = document.querySelector(".score");
const episodes = document.querySelector(".episodes");
const duration = document.querySelector(".duration");
const startDate = document.querySelector(".start-date");
const endDate = document.querySelector(".end-date");
const seasonPeriod = document.querySelector(".season-period");
const seasonYear = document.querySelector(".season-year");
const status = document.querySelector(".status");
const titles = document.querySelector(".titles");
const animeDesc = document.querySelector(".anime-description");
const genres = document.querySelector(".genres");
const format = document.querySelector(".format");
const vid = document.querySelector(".embedded-vid");

let pg = 1;

async function fetchAnime(url) {
  try {
    load.classList.add("display");
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${JWT}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    load.classList.remove("display");
    return await response.json();
  } catch (e) {
    document.body.innerHTML = `I'm sorry, something went wrong. ${e}`;
  }
}

renderAnimes(pg);

loadMoreBtn.addEventListener("click", () => {
  if (pg >= 162) {
    return;
  } else {
    pg++;
    renderAnimes(pg);
  }
});

showPageBtn.addEventListener("click", () => {
  showPage.style.display = "none";
});

input.addEventListener("search", search);

searchBtn.addEventListener("click", search);

toTop.addEventListener("click", () => {
  scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

function renderAnimes(num) {
  fetchAnime(`${apiUrl}?page=${num}`)
    .then((data) => {
      addCard(data);
      showAnime(data);
    })
    .catch((e) => {
      document.body.innerHTML = `I'm sorry, something went wrong.`;
    });
}

function addCard(data) {
  for (let doc of data.data.documents) {
    const li = document.createElement("li");
    const img = document.createElement("img");
    const div = document.createElement("div");
    const linkTitle = document.createElement("a");
    const pID = document.createElement("p");
    img.setAttribute("src", `${doc.cover_image}`);
    div.setAttribute("class", "card-body");
    linkTitle.setAttribute("href", "#show-page");
    linkTitle.classList.add("card-title");
    linkTitle.innerHTML = `${doc.titles.en}`;
    pID.innerHTML = `${doc.id}`;
    li.appendChild(img);
    div.appendChild(pID);
    div.appendChild(linkTitle);
    li.appendChild(div);
    ul.appendChild(li);
  }
}

function injectHTML(el, value) {
  el.innerHTML = value;
}

function showAnime(data) {
  ul.addEventListener("click", (e) => {
    if (e.target.classList.contains("card-title")) {
      showPage.style.display = "block";
      data.data.documents.map((el) => {
        if (el.titles.en === e.target.innerHTML) {
          insertShowHTML(el);
        }
      });
    }
  });
}

async function search() {
  try {
    let html = "";
    for (let i = 1; i <= 162; i++) {
      await fetchAnime(`${apiUrl}?page=${i}`)
        .then((data) => {
          data.data.documents.forEach((obj) => {
            const loweredCase = obj.titles.en.toLowerCase();
            if (loweredCase.includes(input.value.toLowerCase())) {
              html += `<li>
              <img src="${obj.cover_image}" alt="${obj.titles.en}" />
              <div class="card-body">
                <p>${obj.id}</p>
                <a class="card-title" href="#show-page">${obj.titles.en}</a>
                <p class="card-desc">${obj.descriptions.en}</p>
              </div>
            </li>`;
            }
          });
          showAnime(data);
        })
        .catch((e) => {
          document.body.innerHTML = `I'm sorry, something went wrong. ${e}`;
        });
    }
    ul.innerHTML = html;
  } catch (e) {
    document.body.innerHTML = `I'm sorry, something went wrong.`;
  }
}

function insertShowHTML(el) {
  const arrTitles = [];
  banner.setAttribute("src", `${el.banner_image}`);
  injectHTML(score, `${el.score}%`);
  //Episodes
  if (el.episodes_count === 1) {
    injectHTML(episodes, `${el.episodes_count} episode`);
    injectHTML(duration, `${el.episode_duration}min. `);
  } else {
    injectHTML(episodes, `${el.episodes_count} episodes`);
    injectHTML(duration, `${el.episode_duration}min. per episodes`);
  }
  injectHTML(startDate, `${el.start_date}`.slice(0, 10));
  injectHTML(endDate, `${el.end_date}`.slice(0, 10));
  //Season Period
  if (el.season_period === 0) {
    injectHTML(seasonPeriod, "Winter");
  } else if (el.season_period === 1) {
    injectHTML(seasonPeriod, "Spring");
  } else if (el.season_period === 2) {
    injectHTML(seasonPeriod, "Summer");
  } else if (el.season_period === 3) {
    injectHTML(seasonPeriod, "Fall");
  } else {
    injectHTML(seasonPeriod, "Unknown");
  }
  el.season_year ? injectHTML(seasonYear, `${el.season_year}`) : "";
  el.trailer_url
    ? vid.setAttribute("src", `${el.trailer_url}`)
    : vid.setAttribute("src", "");
  //Titles
  for (let [prop, value] of Object.entries(el.titles)) {
    arrTitles.push(value);
  }
  injectHTML(titles, `${arrTitles.map((e) => e).join(", ")}`);
  injectHTML(animeDesc, `${el.descriptions.en}`);
  injectHTML(genres, `${el.genres.map((e) => e).join(", ")}`);
  // Cover Color
  el.cover_color
    ? (showPage.style.backgroundColor = `${el.cover_color}`)
    : (showPage.style.backgroundColor = "");
  // Status
  if (el.status === 0) {
    injectHTML(status, "Finished");
  } else if (el.status === 1) {
    injectHTML(status, "Releasing");
  } else if (el.status === 2) {
    injectHTML(status, "Not Yet Released");
  } else {
    injectHTML(status, "Cancelled");
  }
  //Format
  if (el.format === 0) {
    injectHTML(format, "TV");
  } else if (el.format === 1) {
    injectHTML(format, "Short TV Episode");
  } else if (el.format === 2) {
    injectHTML(format, "Movie");
  } else if (el.format === 3) {
    injectHTML(format, "Special");
  } else if (el.format === 4) {
    injectHTML(format, "OVA");
  } else if (el.format === 5) {
    injectHTML(format, "ONA");
  } else {
    injectHTML(format, "MUSIC");
  }
}

const options = {
  root: null,
  threshold: 0,
  rootMargin: "0px",
};

const footerObserver = new IntersectionObserver((entries, footerObserver) => {
  entries.forEach((entry) => {
    entry.isIntersecting
      ? (footer.style.transform = "scale(1)")
      : (footer.style.transform = "scale(0)");
  });
}, options);

const scrollObserver = new IntersectionObserver((entries, scrollObserver) => {
  entries.forEach((entry) => {
    entry.isIntersecting
      ? (toTop.style.transform = "scale(0)")
      : (toTop.style.transform = "scale(1)");
  });
}, options);

scrollObserver.observe(searchSection);
footerObserver.observe(pageBtns);
