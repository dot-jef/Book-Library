const app = document.getElementById("app");

app.innerHTML = `
  <form id="search-form">
    <input type="text" name="search-name" placeholder="Search a book...">
    <button type="submit">Search</button>
  </form>
`
const searchForm = document.getElementById("search-form");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(searchForm);

  const response = await fetch(`https://openlibrary.org/search.json?q=${formData.get("search-name")}`)
  const data = await response.json();

  const books = data.docs;

  for (let i = 0; i < 10; i++) {
    app.insertAdjacentHTML("beforeend",`
      <div class="book-container">
        <img src="https://covers.openlibrary.org/b/id/${books[i].cover_i}-L.jpg" class="cover">
        <h1 class="title">${books[i].title || "N/A"}</h1>
        <h3 class="author-name">${books[i].author_name || "N/A"}</h3>
        <h3 class="year-published">${books[i].first_publish_year || "N/A"}</h3>
      </div>`);
  }
  console.log(books);
});