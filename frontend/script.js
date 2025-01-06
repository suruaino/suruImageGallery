
document.addEventListener("DOMContentLoaded", function () {

  const searchInput = document.querySelector("#search-input");
  const searchBtn = document.querySelector(".search-btn");
  const imagesBox = document.querySelector(".images-box");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageNumber = document.getElementById("pageNumber");
  const dateBox = document.querySelector(".date-box");

  setInterval(() => {
    const date = new Date();
    dateBox.innerHTML = date.toUTCString();
  }, 1000);

  let currentPage = 1; 
  const perPage = 9;
  let currentQuery = "nature"; 

  const loader = document.createElement("div");
  loader.className = "loader";
  loader.style.display = "none";
  imagesBox.parentElement.insertBefore(loader, imagesBox);

  searchBtn.disabled = true;

  searchInput.addEventListener("input", () => {
    searchBtn.disabled = searchInput.value.trim() === "";
  });

  const toggleLoader = (show) => {
    loader.style.display = show ? "block" : "none";
  };

  const toggleNavigationButtons = (disabled) => {
    prevBtn.disabled = disabled || currentPage === 1;
    if(!prevBtn.disabled){
      prevBtn.style.backgroundColor = "#3498db";
      prevBtn.style.color = "#ffffff";
    } else{
      prevBtn.style.backgroundColor = "";
      prevBtn.style.color = "";
    }
    nextBtn.disabled = disabled;
    nextBtn.style.backgroundColor = "#3498db";
    nextBtn.style.color = "#ffffff";
  };

  const sanitizeQuery = (query) => query.replace(/[^a-zA-Z0-9\s]/g, "").trim();

  const fetchImages = async (query, page) => {
    toggleLoader(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/proxy?query=${query}&perPage=${perPage}&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching images:", error);
      throw error;
    } finally {
      toggleLoader(false);
    }
  };

  const updateImages = async () => {
    imagesBox.innerHTML = "Loading...";
    toggleNavigationButtons(true);

    try {
      const results = await fetchImages(currentQuery, currentPage);
      imagesBox.innerHTML = "";

      if (results.length === 0) {
        imagesBox.innerHTML = "<p>No results found.</p>";
        imagesBox.style.textAlign = "center";
      } else {
        results.forEach((image) => {
          const imgElement = document.createElement("img");
          imgElement.src = image.urls.small;
          imgElement.alt = image.alt_description;
          imgElement.className = "gallery-image";
          imgElement.loading = "lazy";
          imagesBox.appendChild(imgElement);
        });
      }

      pageNumber.textContent = currentPage;
    } catch (error) {
      imagesBox.innerHTML = `<p class="error-message">An error occurred: ${error.message}</p>`;
    } finally {
      toggleNavigationButtons(false);
    }
  };

  searchBtn.addEventListener("click", () => {
    let query = searchInput.value.trim();
    query = sanitizeQuery(query);

    if (query === "") {
      alert("Query cannot be empty!");
      return;
    }

    currentQuery = query;
    currentPage = 1;
    updateImages();
  });

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updateImages();
    }
  });

  nextBtn.addEventListener("click", () => {
    currentPage++;
    updateImages();
  });

  updateImages();
});
