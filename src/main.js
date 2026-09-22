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

  books.forEach(book => {
    app.insertAdjacentHTML("beforeend",`<h1>${(book.author_name)}</h1>`);
  });
});