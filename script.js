// script.js
document.addEventListener('DOMContentLoaded', () => {
    const genres = ["Fiction", "Drama", "Romance", "Science Fiction", "Horror", "Mystery"];
    const genrePage = document.getElementById('genre-page');
    const booksPage = document.getElementById('books-page');
    const genresContainer = document.getElementById('genres');
    const booksContainer = document.getElementById('books');
    const searchBar = document.getElementById('search-bar');
    const loadingIndicator = document.getElementById('loading');

    let selectedGenre = '';
    let nextPageUrl = '';
    let isLoading = false;

    // Initialize Genre Buttons
    genres.forEach(genre => {
        const button = document.createElement('button');
        button.textContent = genre;
        button.addEventListener('click', () => {
            selectedGenre = genre;
            loadBooks(genre);
            genrePage.classList.remove('active');
            booksPage.classList.add('active');
        });
        genresContainer.appendChild(button);
    });

    // Load Books Function
    function loadBooks(genre, search = '') {
        isLoading = true;
        booksContainer.innerHTML = ''; // Clear previous books
        const url = `http://skunkworks.ignitesol.com:8000/books?topic=${encodeURIComponent(genre)}&search=${encodeURIComponent(search)}&mime_type=image`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayBooks(data.results);
                nextPageUrl = data.next;
                isLoading = false;
            })
            .catch(error => {
                console.error('Error fetching books:', error);
                isLoading = false;
            });
    }

    // Display Books Function
    function displayBooks(books) {
        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-item');
            bookItem.innerHTML = `
                <h3>${book.title}</h3>
                <p>${book.authors.map(author => author.name).join(', ')}</p>
            `;
            bookItem.addEventListener('click', () => openBook(book));
            booksContainer.appendChild(bookItem);
        });
    }

    // Open Book Function
    function openBook(book) {
        const htmlUrl = book.formats['text/html'];
        const pdfUrl = book.formats['application/pdf'];
        const txtUrl = book.formats['text/plain'];

        if (htmlUrl) {
            window.open(htmlUrl, '_blank');
        } else if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        } else if (txtUrl) {
            window.open(txtUrl, '_blank');
        } else {
            alert('No viewable version available');
        }
    }

    // Infinite Scroll
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading && nextPageUrl) {
            isLoading = true;
            fetch(nextPageUrl)
                .then(response => response.json())
                .then(data => {
                    displayBooks(data.results);
                    nextPageUrl = data.next;
                    isLoading = false;
                })
                .catch(error => {
                    console.error('Error fetching more books:', error);
                    isLoading = false;
                });
        }
    });

    // Search Functionality
    searchBar.addEventListener('input', () => {
        const searchQuery = searchBar.value.trim();
        loadBooks(selectedGenre, searchQuery);
    });
});
