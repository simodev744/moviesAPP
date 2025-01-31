          
const ITEMS_PER_PAGE = 8;
let currentPage = 1;






function getMovies() {
    return JSON.parse(localStorage.getItem('movies')) || [];
}

function setMovies(movies) {
    localStorage.setItem('movies', JSON.stringify(movies));
}


function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('d-none');
        }
        reader.readAsDataURL(input.files[0]);
    }
}


function saveMovie() {
    const imageInput = document.getElementById('movieImage');
    if (!imageInput.files[0]) {
        alert('Veuillez sélectionner une image');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const movie = {
            id: generateId(),
            name: document.getElementById('movieName').value,
            director: document.getElementById('director').value,
            releaseYear: document.getElementById('releaseYear').value,
            genre: document.getElementById('genre').value,
            status: document.getElementById('status').value,
            synopsis: document.getElementById('synopsis').value,
            imageUrl: e.target.result,
            createdAt: new Date().toISOString()
        };

        const movies = getMovies();
        movies.push(movie);
        setMovies(movies);
        
        document.getElementById('addMovieForm').reset();
        document.getElementById('imagePreview').classList.add('d-none');
        bootstrap.Modal.getInstance(document.getElementById('addMovieModal')).hide();
        displayMovies();
    };
    reader.readAsDataURL(imageInput.files[0]);
}

function editMovie(id) {
    const movie = getMovies().find(m => m.id === id);
    if (movie) {
        document.getElementById('editMovieId').value = movie.id;
        document.getElementById('editMovieName').value = movie.name;
        document.getElementById('editDirector').value = movie.director;
        document.getElementById('editReleaseYear').value = movie.releaseYear;
        document.getElementById('editGenre').value = movie.genre;
        document.getElementById('editStatus').value = movie.status;
        document.getElementById('editSynopsis').value = movie.synopsis;
        
        if (movie.imageUrl) {
            document.getElementById('editImagePreview').src = movie.imageUrl;
            document.getElementById('editImagePreview').classList.remove('d-none');
        }
        
        new bootstrap.Modal(document.getElementById('editMovieModal')).show();
    }
}

function updateMovie() {
    const id = document.getElementById('editMovieId').value;
    const movies = getMovies();
    const movieIndex = movies.findIndex(m => m.id === id);
    
    if (movieIndex !== -1) {
        const imageInput = document.getElementById('editMovieImage');
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updateMovieData(movieIndex, e.target.result);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            updateMovieData(movieIndex, movies[movieIndex].imageUrl);
        }
    }
}

function updateMovieData(movieIndex, imageUrl) {
    const movies = getMovies();
    movies[movieIndex] = {
        ...movies[movieIndex],
        name: document.getElementById('editMovieName').value,
        director: document.getElementById('editDirector').value,
        releaseYear: document.getElementById('editReleaseYear').value,
        genre: document.getElementById('editGenre').value,
        status: document.getElementById('editStatus').value,
        synopsis: document.getElementById('editSynopsis').value,
        imageUrl: imageUrl,
        lastModified: new Date().toISOString()
    };
    
    setMovies(movies);
    bootstrap.Modal.getInstance(document.getElementById('editMovieModal')).hide();
    displayMovies();
}

function deleteMovie(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) {
        const movies = getMovies().filter(movie => movie.id !== id);
        setMovies(movies);
        displayMovies();
    }
}

function viewMovie(id) {
    const movie = getMovies().find(m => m.id === id);
    if (movie) {
        const details = `
            <div class="text-center">
                <img src="${movie.imageUrl}" class="view-movie-image rounded" alt="${movie.name}">
                <h3 class="mt-3">${movie.name}</h3>
                <p><strong><i class="bi bi-person-fill"></i> Réalisateur:</strong> ${movie.director}</p>
                <p><strong><i class="bi bi-calendar-fill"></i> Année de sortie:</strong> ${movie.releaseYear}</p>
                <p><strong><i class="bi bi-film"></i> Genre:</strong> ${movie.genre}</p>
                <p><strong><i class="bi bi-check-circle-fill"></i> Status:</strong> 
                    <span class="badge ${movie.status === 'Disponible' ? 'bg-success' : 'bg-danger'}">
                        ${movie.status}
                    </span>
                </p>
                <div class="text-start">
                    <p><strong><i class="bi bi-text-paragraph"></i> Synopsis:</strong></p>
                    <p>${movie.synopsis}</p>
                </div>
            </div>
        `;
        document.getElementById('movieDetails').innerHTML = details;
        new bootstrap.Modal(document.getElementById('viewMovieModal')).show();
    }
}


function displayMovies(searchTerm = '') {
    let moviesToDisplay = getMovies();
    
    if (searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        moviesToDisplay = moviesToDisplay.filter(movie => 
            movie.name.toLowerCase().includes(searchTerm) ||
            movie.director.toLowerCase().includes(searchTerm) ||
            movie.genre.toLowerCase().includes(searchTerm)
        );
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedMovies = moviesToDisplay.slice(startIndex, endIndex);

    const container = document.getElementById('moviesContainer');
    container.innerHTML = '';

    paginatedMovies.forEach(movie => {
        const movieCard = `
            <div class="movie-card rounded">
                <img class="movie-image rounded" 
                    src="${movie.imageUrl}" 
                    alt="${movie.name}" 
                    onerror="handleImageError(this)">
                <div class="movie-controls rounded">
                    <h5 class="text-center">${movie.name}</h5>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-sm" 
                                style="background-color: royalblue; color: white;" 
                                onclick="editMovie('${movie.id}')"
                                title="Modifier">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm" 
                                style="background-color: seagreen; color: white;" 
                                onclick="viewMovie('${movie.id}')"
                                title="Afficher">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                        <button class="btn btn-sm" 
                                style="background-color: red; color: white;" 
                                onclick="deleteMovie('${movie.id}')"
                                title="Supprimer">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += movieCard;
    });

    updatePaginationButtons(moviesToDisplay.length);
}

function updatePaginationButtons(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    document.getElementById('prevButton').disabled = currentPage === 1;
    document.getElementById('nextButton').disabled = currentPage === totalPages || totalPages === 0;
}

function handleImageError(img) {
    img.onerror = null;
    img.src = 'images/default-movie.jpg';
}


function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayMovies(document.getElementById('searchInput').value);
    }
}

function nextPage() {
    const totalMovies = getMovies().length;
    const totalPages = Math.ceil(totalMovies / ITEMS_PER_PAGE);
    
    if (currentPage < totalPages) {
        currentPage++;
        displayMovies(document.getElementById('searchInput').value);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    displayMovies();
   
    setInterval(updateDateTime, 1000); 

  
    document.getElementById('currentUser').textContent = 'simodev744';
});


document.getElementById('searchInput').addEventListener('input', function(e) {
    currentPage = 1;
    displayMovies(e.target.value);
});
