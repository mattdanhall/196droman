const heroVideo = document.querySelector('.hero-video');
heroVideo.querySelector('source').src = `assets/video/hero_${Math.floor(Math.random() * 6)}.webm`;
heroVideo.load();
heroVideo.playbackRate = 0.8;

const scrollContainer = document.getElementById('scroll-container');
const sections = document.querySelectorAll('.section');
const dots = document.querySelectorAll('.dot');

// Update active dot when a section reaches 50% visibility in the container
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        dots.forEach((dot) => {
          dot.classList.toggle('active', dot.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { root: scrollContainer, threshold: 0.5 }
);

sections.forEach((section) => observer.observe(section));

// Scroll-to on dot click (targets the container, not window)
dots.forEach((dot) => {
  dot.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(dot.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Cottage photo swap ───────────────────────────────────────────────────────
const cottageImg        = document.querySelector('.cottage-photo img');
const cottageCaption    = document.querySelector('.cottage-photo figcaption');
const defaultCottageSrc = 'assets/images/IMG_0966.webp';

function fadeSwap(src) {
  cottageImg.style.opacity = '0';
  setTimeout(() => {
    cottageImg.src = src;
    cottageImg.style.opacity = '1';
    cottageCaption.style.visibility = src === defaultCottageSrc ? 'visible' : 'hidden';
  }, 200);
}

document.querySelectorAll('.feature-card li[data-image]').forEach((li) => {
  li.addEventListener('mouseenter', () => fadeSwap(`assets/images/${li.dataset.image}`));
  li.addEventListener('click',      () => fadeSwap(`assets/images/${li.dataset.image}`));
});

document.querySelector('.feature-grid').addEventListener('mouseleave', () => fadeSwap(defaultCottageSrc));
cottageImg.addEventListener('click', () => fadeSwap(defaultCottageSrc));

// ── Lightbox ─────────────────────────────────────────────────────────────────
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">&#8249;</button>
  <img class="lightbox__img" src="" alt="">
  <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">&#8250;</button>
  <button class="lightbox__close" aria-label="Close image">&#215;</button>
`;
document.body.appendChild(lightbox);

const lightboxImg   = lightbox.querySelector('.lightbox__img');
const lightboxClose = lightbox.querySelector('.lightbox__close');
const lightboxPrev  = lightbox.querySelector('.lightbox__nav--prev');
const lightboxNext  = lightbox.querySelector('.lightbox__nav--next');

const galleryImgs = [...document.querySelectorAll('.gallery-grid img')];
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  const img = galleryImgs[index];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add('is-open');
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
}

function showPrev() {
  openLightbox((currentIndex - 1 + galleryImgs.length) % galleryImgs.length);
}

function showNext() {
  openLightbox((currentIndex + 1) % galleryImgs.length);
}

galleryImgs.forEach((img, i) => {
  img.addEventListener('click', () => openLightbox(i));
});

lightbox.addEventListener('click', (e) => { if (e.target !== lightboxImg) closeLightbox(); });
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
lightboxClose.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showPrev();
  if (e.key === 'ArrowRight') showNext();
});

// ── Map ──────────────────────────────────────────────────────────────────────
const DROMAN_LAT  = 58.485568;
const DROMAN_LNG  = -5.109298;
const W3W_ADDRESS = 'pleaser.bandaged.skis';

const map = L.map('map', {
  zoomControl: true,
  scrollWheelZoom: false, // prevent scroll hijack when snap-scrolling the page
}).setView([54.5, -3.5], 5); // UK overview

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA',
  maxZoom: 18,
}).addTo(map);

const markerIcon = L.divIcon({
  className: 'map-marker',
  html: '<div class="map-marker__dot"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const marker = L.marker([DROMAN_LAT, DROMAN_LNG], { icon: markerIcon })
  .addTo(map)
  .bindPopup(
    `<strong>196 Droman</strong><br>
    <a href="https://what3words.com/${W3W_ADDRESS}" target="_blank" rel="noopener">
      ///${W3W_ADDRESS}
    </a>`,
    { className: 'map-popup' }
  )
  .openPopup();

// Recalculate map dimensions when the section becomes visible
const locationSection = document.getElementById('location');
const locationObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) map.invalidateSize();
  },
  { root: scrollContainer, threshold: 0.5 }
);

locationObserver.observe(locationSection);
