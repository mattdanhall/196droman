const heroVideo = document.querySelector('.hero-video');
const heroSource = heroVideo.querySelector('source');
const fullSrc = `assets/video/hero_${Math.floor(Math.random() * 6)}.webm`;

heroVideo.playbackRate = 0.7;

function loadFullVideo() {
  const fullVideo = document.createElement('video');
  fullVideo.preload = 'auto';
  fullVideo.src = fullSrc;

  fullVideo.addEventListener(
    'canplay',
    () => {
      heroSource.src = fullSrc;
      heroVideo.load();
      heroVideo.playbackRate = 0.8;
      heroVideo.play().catch(() => {});
    },
    { once: true }
  );

  fullVideo.load();
}

if (heroVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
  loadFullVideo();
} else {
  heroVideo.addEventListener('canplay', loadFullVideo, { once: true });
}

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
const cottageImg     = document.querySelector('.cottage-photo img');
const cottageCaption = document.querySelector('.cottage-photo figcaption');
const cottagePrev    = document.querySelector('.cottage-photo__arrow--prev');
const cottageNext    = document.querySelector('.cottage-photo__arrow--next');
const defaultCottageSrc = 'assets/images/IMG_0966.webp';
const featureGrid    = document.querySelector('.feature-grid');
const featureButtons = [...document.querySelectorAll('.feature-card button[data-image]')];

const cottageImages = [
  {
    src: defaultCottageSrc,
    label: 'Cottage on the right',
    alt: '196 Droman seen from across the way',
  },
  ...featureButtons.map((button) => ({
    src: `assets/images/${button.dataset.image}`,
    label: button.textContent.trim(),
    alt: button.textContent.trim(),
  })),
];

let cottageIndex = 0;
let selectedCottageIndex = 0;
let cottageImagesPreloaded = false;
let cottageFadeTimer;

function preloadCottageImages() {
  if (cottageImagesPreloaded) return;

  cottageImagesPreloaded = true;
  cottageImages.forEach((image) => {
    new Image().src = image.src;
  });
}

function showCottageImage(index) {
  cottageIndex = (index + cottageImages.length) % cottageImages.length;
  const image = cottageImages[cottageIndex];

  clearTimeout(cottageFadeTimer);
  cottageImg.style.opacity = '0';
  cottageFadeTimer = setTimeout(() => {
    cottageImg.src = image.src;
    cottageImg.alt = image.alt;
    cottageImg.style.opacity = '1';
    cottageCaption.textContent = image.label;
  }, 200);
}

function selectCottageImage(index) {
  selectedCottageIndex = index;
  showCottageImage(index);
}

featureButtons.forEach((button) => {
  const index = featureButtons.indexOf(button) + 1;
  button.addEventListener('mouseenter', () => showCottageImage(index));
  button.addEventListener('focus', () => showCottageImage(index));
  button.addEventListener('click', () => selectCottageImage(index));
});

cottagePrev.addEventListener('click', () => selectCottageImage(cottageIndex - 1));
cottageNext.addEventListener('click', () => selectCottageImage(cottageIndex + 1));

featureGrid.addEventListener('pointerenter', preloadCottageImages, { once: true });
featureGrid.addEventListener('focusin', preloadCottageImages, { once: true });
featureGrid.addEventListener('mouseleave', () => showCottageImage(selectedCottageIndex));
cottageImg.addEventListener('click', () => selectCottageImage(0));

const cottageObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) preloadCottageImages();
  },
  { root: scrollContainer, threshold: 0.1 }
);

cottageObserver.observe(document.getElementById('cottage'));

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

// Fully non-interactive on touch devices so swipes always scroll the page past the map
const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches;

const map = L.map('map', {
  zoomControl: !isTouchPrimary,
  scrollWheelZoom: false, // prevent scroll hijack when snap-scrolling the page
  dragging: !isTouchPrimary,
  touchZoom: !isTouchPrimary,
  doubleClickZoom: !isTouchPrimary,
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
