const app = document.getElementById("app");

app.innerHTML = `
  <form id="search-form">
    <input type="text" name="search-name" placeholder="Search a book...">
    <button type="submit">Search</button>
  </form>
  <div id="books-display"></div>
  <button id="load-more" hidden>Load More</button>
`
const searchForm = document.getElementById("search-form");
const booksDisplay = document.getElementById("books-display");
const loadMoreBtn = document.getElementById("load-more");
let currentURL = "";
let booksDisplayCount = 0;

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(searchForm);

  let input = formData.get("search-name");
  
  input = input.trim().replace(/\s+/g, " ");
  if (!input) {
    return;
  }

  displayLoadingScreen();

  try {
    const url = new URL("https://openlibrary.org/search.json?");
    url.searchParams.set("q", input);
    url.searchParams.set("limit", 10);
    url.searchParams.set("page", 1);
    
    currentURL = new URL(url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to fetch properly");
    }
    const data = await response.json();
    const books = data.docs;
    booksDisplayCount = books.length;

    booksDisplay.innerHTML = "";
    for (let i = 0; i < books.length; i++) { 
      booksDisplay.innerHTML += `
        <div class="book-container">
          <img src=${books[i].cover_i ? `https://covers.openlibrary.org/b/id/${books[i].cover_i}-L.jpg` : "/assets/No_Image_Available.jpg"} class="cover">
          <h1 class="title">${books[i].title || "N/A"}</h1>
          <h3 class="author-name">${books[i].author_name || "N/A"}</h3>
          <h3 class="year-published">${books[i].first_publish_year || "N/A"}</h3>
        </div>`;
    }
    console.log(data);

    if (data.numFound === 0) {
      loadMoreBtn.setAttribute("hidden", "");
      booksDisplay.innerHTML = `<h1 class="empty-state" role="status" aria-live="polite">No Books Found</h1>`;
    } else if (data.numFound <= 10) {
      loadMoreBtn.setAttribute("hidden", "");
    } else {
      loadMoreBtn.removeAttribute("hidden");
    }
  } catch (error) {
    console.error("Error found: ", error.message);
    booksDisplay.innerHTML = `<h1 class="error-state" role="alert">Something Went Wrong</h1>`;
  }
});

loadMoreBtn.addEventListener("click", async () => {
  loadMoreBtn.setAttribute("disabled", "");

  const currentPage = Number(currentURL.searchParams.get("page"));
  currentURL.searchParams.set("page", currentPage + 1);

  try {
    const response = await fetch(currentURL);
    if (!response.ok) {
      throw new Error("Can't get the next page");
    }
    const data = await response.json();
    const books = data.docs;
    booksDisplayCount += books.length;

    if (booksDisplayCount >= data.numFound) {
      loadMoreBtn.setAttribute("hidden", "");
    }

    for (let i = 0; i < books.length; i++) { 
      booksDisplay.innerHTML += `
        <div class="book-container">
          <img src=${books[i].cover_i ? `https://covers.openlibrary.org/b/id/${books[i].cover_i}-L.jpg` : "/assets/No_Image_Available.jpg"} class="cover">
          <h1 class="title">${books[i].title || "N/A"}</h1>
          <h3 class="author-name">${books[i].author_name || "N/A"}</h3>
          <h3 class="year-published">${books[i].first_publish_year || "N/A"}</h3>
        </div>`;
    }
    
  } catch (error) {
    console.error("Error loading more books:", error.message);
  } finally {
    loadMoreBtn.removeAttribute("disabled");
  }

});

function displayLoadingScreen() {
  booksDisplay.innerHTML = `<h1 class="loading-state" role="status" aria-live="polite">Loading...</h1>`;
}
