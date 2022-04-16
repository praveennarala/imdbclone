// ****** SELECT ITEMS **********
const showHome = document.getElementById('showHome');
const showFav = document.getElementById('showFav');
const searchInput = document.getElementById('movie-search-box');
const searchList = document.querySelector('.search-list');
const movieDetailsPage = document.getElementById('movie-details');
const favouriteMovieList = document.querySelector('.grid-of-fav');
const alertP = document.getElementById('alert');

// ****** EVENT LISTENERS **********
showHome.addEventListener('click', function () {
  document.getElementById('home').classList.remove('hide');
  document.getElementById('favourites').classList.add('hide');
});

showFav.addEventListener('click', function () {
  document.getElementById('favourites').classList.remove('hide');
  document.getElementById('home').classList.add('hide');
  setupItems();
})

// ****** FUNCTIONS **********
// alert function
function displayAlert(text, action) {
  alertP.textContent = text;
  alertP.classList.add(action);
  // remove alert
  setTimeout(function () {
    alertP.textContent = '';
    alertP.classList.remove(action);
  }, 1000);
}

// search using input
function searchMovies() {
  let searchText = searchInput.value;
  if (searchText.length > 0) {
    loadMovies(searchText);
  }
}

// load movies with search value
async function loadMovies(searchText) {
  const URL = `https://omdbapi.com/?s=${searchText}&page=1&apikey=fc1fef96`;
  const res = await fetch(`${URL}`);
  const data = await res.json();
  if (data.Response == "True") {
    displayMovieList(data.Search)
  };
}

// display search results
function displayMovieList(movieList) {
  searchList.innerHTML = ``;
  let moviesLi = movieList.map(function (movie) {
    return `<li data-id=${movie.imdbID} class='list-item'> <div class='movie-name'>${movie.Title}</div> <i class="bi bi-heart-fill""></i></li>`;
  }).join('');
  searchList.innerHTML = moviesLi;
  loadMovie();
}

// load movie page
function loadMovie() {
  const searchListMovies = document.querySelectorAll('.list-item');
  searchListMovies.forEach(function (movie) {
    let movieTitle = movie.children[0];
    let addFav = movie.children[1];
    movieTitle.addEventListener('click', async function () {
      searchInput.value = '';
      searchList.innerHTML = ``;
      const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=fc1fef96`);
      const movieDetails = await result.json();
      displayMovieDetails(movieDetails);
    });

    // add to favourites on clicking heart icon
    addFav.addEventListener('click', async function () {
      const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=fc1fef96`);
      const movieDetails = await result.json();
      addToFavourites(movieDetails);
    })
  })
}

// display movie details in movie page
function displayMovieDetails(details) {
  movieDetailsPage.innerHTML = `<div class="col-xs-6 movie-img">
            <img
              src=${(details.Poster != "N/A") ? details.Poster : "notfound.jpg"}
              alt=${details.Title} class="movie-poster">
          </div>
          <div class="col-xs-6 movie-info">
            <h1 class="movie-title">${details.Title}</h1>
            <p>Year: ${details.Year}</p>
            <p>Genre: ${details.Genre}</p>
            <p>Writer: ${details.Writer}</p>
            <p>Actors: ${details.Actors}</p>
            <p>Plot: ${details.Plot}</p>
          </div>`
}

// remove favourite
function deleteItem(e) {
  const element = e.currentTarget.parentElement.parentElement;
  const id = element.dataset.id;
  console.log(id);
  favouriteMovieList.removeChild(element);
  let items = getLocalStorage();
  items = items.filter(function (item) {
    if (item.imdbID !== id) {
      return item;
    }
  })
  localStorage.setItem('favourites', JSON.stringify(items));
  displayAlert('Removed from favourites', 'danger');
  if (items.length === 0) {
    localStorage.removeItem('favourites');
  }
}

// ****** LOCAL STORAGE **********
// add to favourite in local storage
function addToFavourites(details) {
  let items = getLocalStorage();
  let exists = false;
  for (let index = 0; index < items.length; index++) {
    if (items[index].imdbID === details.imdbID) {
      exists = true;
    }
  }
  if (!exists) {
    items.push(details);
    displayAlert('Added to favourites', 'success');
  } else {
    displayAlert('Already in favourites', 'danger');
  }
  localStorage.setItem('favourites', JSON.stringify(items));
}

// retrieve favourite movie list from local storage
function getLocalStorage() {
  return localStorage.getItem('favourites') ? JSON.parse(localStorage.getItem('favourites')) : [];
}

// ****** SETUP ITEMS **********
function setupItems() {
  favouriteMovieList.innerHTML = ``;
  let items = getLocalStorage();
  if (items.length > 0) {
    items.forEach(function (item) {
      createListItem(item.imdbID, item.Poster, item.Title, item.Plot);
    })
  }
}

// create list item of favourite movie
function createListItem(id, poster, title, plot) {
  const element = document.createElement('div');
  element.classList.add('card');
  element.classList.add('favourite-movie');
  const attr = document.createAttribute('data-id');
  attr.value = id;
  element.setAttributeNode(attr);
  element.innerHTML = `<img class="card-img-top" src=${(poster != "N/A") ? poster : "notfound.jpg"} alt=${title}>
        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <p class="card-text">${plot}
          </p>
          <button class="btn btn-danger delete-btn">Remove from Favourites</button>
        </div>`;
  const deleteBtn = element.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', deleteItem);
  favouriteMovieList.appendChild(element);
}