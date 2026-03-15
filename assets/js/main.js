document.querySelector('.hero-video').playbackRate = 0.5;

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
const findUsSection = document.getElementById('find-us');
const findUsObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) map.invalidateSize();
  },
  { root: scrollContainer, threshold: 0.5 }
);

findUsObserver.observe(findUsSection);
