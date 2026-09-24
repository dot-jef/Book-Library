const app = document.getElementById("app");

app.innerHTML = `
  <form id="search-form">
    <input type="text" name="search-name" placeholder="Search a book...">
    <button type="submit">Search</button>
  </form>
  <div id="books-display"></div>
`
const searchForm = document.getElementById("search-form");
const booksDisplay = document.getElementById("books-display");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(searchForm);

  displayLoadingScreen();

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${formData.get("search-name")}`)
    const data = await response.json();
    const books = data.docs;

    booksDisplay.innerHTML = "";
    for (let i = 0; i < Math.min(books.length, 10); i++) { 
      booksDisplay.innerHTML += `
        <div class="book-container">
          <img src=${`https://covers.openlibrary.org/b/id/${books[i].cover_i}-L.jpg` || "/assets/No_Image_Available.jpg"} class="cover">
          <h1 class="title">${books[i].title || "N/A"}</h1>
          <h3 class="author-name">${books[i].author_name || "N/A"}</h3>
          <h3 class="year-published">${books[i].first_publish_year || "N/A"}</h3>
        </div>`;
    }
    console.log(books);

    if (books.length === 0) {
      booksDisplay.innerHTML = `<h1 class="empty-state" role="status" aria-live="polite">No Books Found</h1>`;
    }
  } catch (error) {
    console.error("Error searching books");
    booksDisplay.innerHTML = `<h1 class="error-state" role="alert">Something Went Wrong</h1>`;
  }
  
  
});


function displayLoadingScreen() {
  booksDisplay.innerHTML = `<h1 class="loading-state" role="status" aria-live="polite">Loading...</h1>`;
}
