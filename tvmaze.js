async function searchShows(query) {
    const res = await axios.get('http://api.tvmaze.com/search/shows', {
        params: { q: query },
    });
    const showData = res.data.reduce((shows, show) => {
        shows.push({
            id: show.show.id,
            name: show.show.name,
            summary: show.show.summary,
            image: show.show.image,
        });
        return shows;
    }, []);
    return showData;
}

function populateShows(shows) {
    const $showsList = $('#shows-list');
    $showsList.empty();
    for (let show of shows) {
        show.image === null
            ? (show.image = 'https://tinyurl.com/tv-missing')
            : (show.image = show.image.original);
        let $item = $(
            `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <img class="card-img-top" src=${show.image}>
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-primary episodes">Episodes</button>
           </div>
         </div>
       </div>
      `
        );
        $showsList.append($item);
    }
}

$('#search-form').on('submit', async function handleSearch(evt) {
    evt.preventDefault();

    let query = $('#search-query').val();
    if (!query) return;

    $('#episodes-area').hide();

    let shows = await searchShows(query);

    populateShows(shows);
});

async function getEpisodes(id) {
    const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
    const episodeData = res.data.reduce((episodeArr, episode) => {
        episodeArr.push({
            name: episode.name,
            number: episode.number,
            season: episode.season,
        });
        return episodeArr;
    }, []);
    return episodeData;
}

function populateEpisodes(episodes) {
    const $episodesList = $('#episodes-list');
    $episodesList.empty();
    for (let episode of episodes) {
        let $item = $(
            `
          <li>${episode.name} (Season: ${episode.season}, Number: ${episode.number})</li>
          `
        );
        $episodesList.append($item);
    }
}

$('#shows-list').on('click', 'button', async function () {
    const showID = $(this).closest('div[data-show-id]').data().showId;
    const episodes = await getEpisodes(showID);
    populateEpisodes(episodes);
    $('#episodes-area').css('display', 'block');
});
