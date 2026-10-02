const app = document.getElementById("app");

app.innerHTML = `
  <form id="search-form">
    <input type="text" name="search-name" placeholder="Search a book...">
    <button type="submit">Search</button>
  </form>
  <div id="books-display"></div>
  <button id="load-more" hidden>Load More</button>

  <div class="book-details-modal" hidden>
    <div class="book-details-backdrop"></div>
    <section class="book-details-container" role="dialog" aria-modal="true" aria-labelledby="book-details-title">
        <button class="book-details-close" type="button" aria-label="Close book details">&times;</button>
        <div class="book-details-cover-wrap">
            <img src="" alt="" class="cover">
        </div>
        <div class="book-details-content">
            <p class="book-details-eyebrow">Book details</p>
            <h1 class="book-title" id="book-details-title"></h1>
            <p class="author-name"></p>
            <div class="book-details-facts">
                <div>
                    <span>First published</span>
                    <strong class="first-published-year"></strong>
                </div>
                <div>
                    <span>Language</span>
                    <strong class="language"></strong>
                </div>
            </div>
        </div>
    </section>
  </div>
`



const searchForm = document.getElementById("search-form");
const booksDisplay = document.getElementById("books-display");
const loadMoreBtn = document.getElementById("load-more");
const bookDetailsModal = document.querySelector(".book-details-modal");
const bookModalClose = bookDetailsModal.querySelector(".book-details-close");
const bookTitle = bookDetailsModal.querySelector(".book-title");
const bookAuthor = bookDetailsModal.querySelector(".author-name")
const firstPublishedYear = bookDetailsModal.querySelector(".first-published-year");
const language = bookDetailsModal.querySelector(".language");
let currentURL = "";
let booksDisplayCount = 0;
const baseURL = "https://openlibrary.org";
const baseCoverURL = "https://covers.openlibrary.org/b";

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
    const url = new URL(`${baseURL}/search.json?`);
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
      const cleanKey = books[i].key.replace(/^\/works\//, "");
      booksDisplay.innerHTML += `
        <div data-id="${cleanKey}" class="book-container">
          <img src="${books[i].cover_i ? `${baseCoverURL}/id/${books[i].cover_i}-L.jpg` : '/assets/No_Image_Available.jpg'}" class="cover">
          <h1 class="title">${books[i].title || "N/A"}</h1>
          <h3 data-authors='${JSON.stringify(books[i].author_name)}' class="author-name">${books[i].author_name?.length > 1 ? books[i].author_name[0] + " et al." : books[i].author_name[0] || "N/A"}</h3>
          <h3 data-year="${books[i].first_publish_year}" class="year-published">${books[i].first_publish_year || "N/A"}</h3>
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
      const cleanKey = books[i].key.replace(/^\/works\//, "");
      booksDisplay.innerHTML += `
        <div data-id="${cleanKey}" class="book-container">
          <img src="${books[i].cover_i ? `${baseCoverURL}/id/${books[i].cover_i}-L.jpg` : '/assets/No_Image_Available.jpg'}" class="cover">
          <h1 class="title">${books[i].title || "N/A"}</h1>
          <h3 data-authors='${JSON.stringify(books[i].author_name)}' class="author-name">${books[i].author_name?.length > 1 ? books[i].author_name[0] + " et al." : books[i].author_name[0] || "N/A"}</h3>
          <h3 data-year="${books[i].first_publish_year}" class="year-published">${books[i].first_publish_year || "N/A"}</h3>
        </div>`;
    }
    
  } catch (error) {
    console.error("Error loading more books:", error.message);
  } finally {
    loadMoreBtn.removeAttribute("disabled");
  }

});

// TODO: continue the event delegation for the specific book details
booksDisplay.addEventListener("click", async (e) => {
  const targetBook = e.target.closest(".book-container");
  if (targetBook) {
  const targetBookKey = targetBook.dataset.id;
    try {
      // TODO: target the actual element for authors, year and language
      const authors = JSON.parse(targetBook.dataset.authors);

      const response = await fetch(`${baseURL}/works/${targetBookKey}.json`);
      if (!response.ok) {
        throw new Error("Cannot get book details");
      }
      const data = await response.json();
      console.log(data);

      bookTitle.textContent = data.title;
      bookAuthor.textContent = authors.join(", ");
      firstPublishedYear.textContent = targetBook.dataset.year;
      language.textContent = "";
      bookDetailsModal.removeAttribute("hidden");
    } catch (error) {
      console.error("Error loading book details:", error.message);
    }
  }
  

});

bookModalClose.addEventListener("click", () => {
  closeBookModal();
});

function displayLoadingScreen() {
  booksDisplay.innerHTML = `<h1 class="loading-state" role="status" aria-live="polite">Loading...</h1>`;
}

function closeBookModal() {
  bookDetailsModal.setAttribute("hidden", "");
}