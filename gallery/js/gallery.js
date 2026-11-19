/* =================================
   BRIDE'S RIGHT HAND | GALLERY
================================= */

const categories = [
  {
    id: "detailsGrid",
    name: "The Details",
    images: [
      "images/detail-01.jpg",
      "images/detail-02.jpg",
      "images/detail-03.jpg",
      "images/detail-04.jpg"
    ]
  },
  {
    id: "floralGrid",
    name: "Floral & Décor",
    images: [
      "images/decor-01.jpg",
      "images/decor-02.jpg",
      "images/decor-03.jpg",
      "images/decor-04.jpg",
      "images/decor-05.jpg"
    ]
  },
  {
    id: "celebrationsGrid",
    name: "The Celebrations",
    images: [
      "images/cel-01.jpg",
      "images/cel-02.jpg",
      "images/cel-03.jpg",
      "images/cel-04.jpg"
    ]
  },
  {
    id: "couplesGrid",
    name: "The Couples",
    images: [
      "images/couple-01.jpg",
      "images/couple-02.jpg",
      "images/couple-03.jpg",
      "images/couple-04.jpg"
    ]
  },
  {
    id: "behindScenesGrid",
    name: "Behind the Scenes",
    images: [
      "images/behind-01.jpg",
      "images/behind-02.jpg",
      "images/behind-03.jpg",
      "images/behind-04.jpg"
    ]
  }
];

/* =================================
   GENERATE GALLERY ITEMS
================================= */

categories.forEach(category => {
  const grid = document.getElementById(category.id);
  if (!grid) return;

  category.images.forEach((imagePath, index) => {
    const item = document.createElement("button");
    item.className = "gallery-item";
    item.type = "button";
    item.setAttribute(
      "aria-label",
      `View ${category.name} photograph ${index + 1}`
    );

    const img = document.createElement("img");
    img.src = imagePath;
    img.alt = `${category.name} wedding photograph ${index + 1}`;
    img.loading = "lazy";

    const placeholder = document.createElement("span");
    placeholder.className = "image-placeholder";
    placeholder.innerHTML = `<span class="placeholder-number">${String(index + 1).padStart(2, "0")}</span><span class="placeholder-label">PHOTO ${index + 1}</span>`;

    const overlay = document.createElement("span");
    overlay.className = "image-overlay";
    overlay.innerHTML = `<span>VIEW MOMENT</span><span class="overlay-arrow">↗</span>`;

    item.appendChild(img);
    item.appendChild(placeholder);
    item.appendChild(overlay);

    grid.appendChild(item);
  });
});

/* =================================
   COLLECT ALL GALLERY ITEMS
================================= */

const items = Array.from(document.querySelectorAll(".gallery-item"));
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const counter = document.getElementById("lightboxCounter");

let currentIndex = 0;

/* =================================
   IMAGE LOADING DETECTION
================================= */

items.forEach(item => {
  const img = item.querySelector("img");
  if (!img) return;

  const showImage = () => {
    item.classList.add("has-image");
  };

  if (img.complete && img.naturalWidth > 0) {
    showImage();
  }

  img.addEventListener("load", showImage);
  img.addEventListener("error", () => {
    item.classList.remove("has-image");
    console.error("Image could not load:", img.src);
  });
});

/* =================================
   REPEATING SCROLL REVEAL
================================= */

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = items.indexOf(entry.target);
          entry.target.style.transitionDelay = `${(index % 4) * 100}ms`;
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
          entry.target.style.transitionDelay = "0ms";
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  items.forEach(item => {
    revealObserver.observe(item);
  });
} else {
  items.forEach(item => item.classList.add("is-visible"));
}

/* =================================
   LIGHTBOX FUNCTIONALITY
================================= */

items.forEach((item, index) => {
  item.addEventListener("click", () => {
    if (!item.classList.contains("has-image")) return;
    currentIndex = index;
    openLightbox();
  });
});

function openLightbox() {
  const img = items[currentIndex]?.querySelector("img");
  if (!img || !items[currentIndex].classList.contains("has-image")) {
    return;
  }

  lightboxImage.src = img.src;
  lightboxImage.alt = img.alt;

  if (counter) {
    counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
  }

  lightbox?.classList.add("open");
  lightbox?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox?.classList.remove("open");
  lightbox?.setAttribute("aria-hidden", "true");
  if (lightboxImage) lightboxImage.src = "";
  document.body.style.overflow = "";
}

function moveImage(direction) {
  for (let step = 0; step < items.length; step++) {
    currentIndex = (currentIndex + direction + items.length) % items.length;
    if (items[currentIndex].classList.contains("has-image")) {
      openLightbox();
      return;
    }
  }
}

/* Lightbox Controls */
document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
document.querySelector(".lightbox-prev")?.addEventListener("click", () => moveImage(-1));
document.querySelector(".lightbox-next")?.addEventListener("click", () => moveImage(1));

lightbox?.addEventListener("click", event => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", event => {
  if (!lightbox?.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") moveImage(-1);
  if (event.key === "ArrowRight") moveImage(1);
});

/* =================================
   FOOTER YEAR FALLBACK
================================= */

const yearElement = document.getElementById("year");
if (yearElement && !yearElement.textContent) {
  yearElement.textContent = new Date().getFullYear();
}
