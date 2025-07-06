// NASA API configuration
const NASA_API_KEY = 'dnitBZf69TyKWGpFjTXgIyAPKVTdFyUPiHc5s1GM';
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

// Fun space facts array
const SPACE_FACTS = [
  "One day on Venus is longer than its year! Venus rotates so slowly that a day (243 Earth days) is longer than a year (225 Earth days).",
  "Saturn's moon Titan has lakes and rivers of liquid methane and ethane, making it the only other world in our solar system with stable bodies of liquid on its surface.",
  "The International Space Station travels at about 17,500 mph and orbits Earth every 90 minutes, meaning astronauts see 16 sunrises and sunsets each day!",
  "Jupiter's Great Red Spot is a storm that's been raging for over 300 years and is larger than Earth itself.",
  "Neutron stars are so dense that a teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
  "The footprints left by Apollo astronauts on the Moon will likely last for millions of years because there's no wind or water to erode them.",
  "Mars has the largest volcano in our solar system, Olympus Mons, which is about 16 miles high - nearly three times taller than Mount Everest!",
  "The Sun is so large that about 1.3 million Earths could fit inside it, yet it's just a medium-sized star!",
  "Uranus rotates on its side, likely due to a massive collision billions of years ago that knocked it over.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy, but don't worry - they won't collide for another 4.5 billion years!",
  "Space is completely silent because there's no air to carry sound waves. Astronauts communicate through radio waves.",
  "The largest known star, UY Scuti, is so big that if it replaced our Sun, its surface would extend beyond Jupiter's orbit!",
  "Earth's magnetic field extends about 370,000 miles into space, protecting us from harmful solar radiation.",
  "The temperature in space is about -454°F (-270°C), just above absolute zero.",
  "Ganymede, Jupiter's largest moon, is bigger than the planet Mercury and has its own magnetic field.",
  "The fastest spacecraft ever built, Parker Solar Probe, can travel at speeds up to 430,000 mph when near the Sun.",
  "There are more possible games of chess than there are atoms in the observable universe!",
  "The International Space Station is the most expensive object ever built, costing over $150 billion.",
  "A single solar flare can release more energy than 10 billion nuclear bombs exploding every second for millions of years.",
  "The center of the Milky Way tastes like raspberries and smells like rum, according to spectroscopic analysis of a gas cloud there!"
];

// Variables for fact rotation
let currentFactIndex = 0;
let factRotationInterval;

// Find our date picker inputs and button on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Modal elements
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalCopyright = document.getElementById('modalCopyright');

// Fun fact elements
const funFactText = document.getElementById('funFactText');
const newFactBtn = document.getElementById('newFactBtn');

// Create Bootstrap modal instance
let bootstrapModal;

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Function to clear any stuck modal states
function clearModalStates() {
  // Remove any stuck modal backdrops
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => {
    backdrop.remove();
  });
  
  // Ensure modal is hidden
  modal.classList.remove('show');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  modal.removeAttribute('aria-modal');
  
  // Restore body overflow
  document.body.style.overflow = 'auto';
  document.body.classList.remove('modal-open');
  
  // Remove any stuck styles
  document.body.style.paddingRight = '';
  
  console.log('Modal states cleared');
}

// Initialize Bootstrap modal when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Clear any stuck modal states first
  clearModalStates();
  
  // Then initialize the modal
  console.log('DOM loaded, initializing modal...');
  bootstrapModal = new bootstrap.Modal(modal);
  
  // Display initial fact and start rotation
  displayNewFact();
  startFactRotation();
  
  // Add event listener for manual fact button
  if (newFactBtn) {
    newFactBtn.addEventListener('click', handleManualFactRequest);
  }
});

// Add event listener to the button to fetch images when clicked
getImagesButton.addEventListener('click', fetchAndDisplayImages);

// Function to fetch images from NASA APOD API
async function fetchAndDisplayImages() {
  // Get the selected date range
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  // Check if dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates');
    return;
  }
  
  // Show loading message
  showLoading();
  
  try {
    // Build the API URL with our parameters
    const apiUrl = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    // Fetch data from NASA API
    const response = await fetch(apiUrl);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    // Convert response to JSON
    const data = await response.json();
    
    // Display the images in the gallery
    displayImages(data);
    
  } catch (error) {
    // Show error message if something goes wrong
    console.error('Error fetching NASA data:', error);
    showError('Failed to fetch space images. Please try again later.');
  }
}

// Function to show loading message
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🚀</div>
      <p>Loading amazing space images...</p>
    </div>
  `;
}

// Function to show error message
function showError(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">❌</div>
      <p>${message}</p>
    </div>
  `;
}

// Modify this gallery generator to handle both image and video entries from the NASA APOD API.
// If media_type is "image", display the image with title and date.
// If media_type is "video", embed the YouTube video using <iframe>, or show a styled clickable link if embedding fails.
// Make sure the gallery layout works for both types and doesn't break.
// Keep styling clean and consistent with NASA's brand.
function displayImages(apodData) {
  // Clear the gallery first
  gallery.innerHTML = '';
  
  // Check if we have any data
  if (!apodData || apodData.length === 0) {
    showError('No images found for the selected date range.');
    return;
  }
  
  // Create HTML for each image/video
  apodData.forEach(item => {
    // Create a card for each space image or video
    const card = document.createElement('div');
    card.className = 'image-card';
    
    // Build the card content with overlay
    let cardContent = '';
    
    // Check if it's an image or video
    if (item.media_type === 'image') {
      cardContent = `
        <img src="${item.url}" alt="${item.title}" />
        <div class="image-overlay">
          <div class="overlay-content">
            <h3 class="image-title">${item.title}</h3>
            <div class="hover-info">
              <p class="image-date">${item.date}</p>
              <p class="image-description">${item.explanation.substring(0, 100)}...</p>
              ${item.copyright ? `<p class="image-copyright">© ${item.copyright}</p>` : ''}
            </div>
          </div>
        </div>
      `;
    } else if (item.media_type === 'video') {
      // For videos, try to embed YouTube videos or show a styled link
      const videoId = extractYouTubeId(item.url);
      
      if (videoId) {
        // If it's a YouTube video, show thumbnail with play button overlay
        cardContent = `
          <div class="video-container">
            <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="${item.title}" />
            <div class="video-play-button">
              <div class="play-icon">▶</div>
            </div>
          </div>
          <div class="image-overlay">
            <div class="overlay-content">
              <h3 class="image-title">${item.title}</h3>
              <div class="hover-info">
                <p class="image-date">${item.date}</p>
                <p class="image-description">${item.explanation.substring(0, 100)}...</p>
                ${item.copyright ? `<p class="image-copyright">© ${item.copyright}</p>` : ''}
              </div>
            </div>
          </div>
        `;
      } else {
        // For non-YouTube videos or if thumbnail fails, show a styled placeholder
        cardContent = `
          <div class="video-placeholder">
            <div class="video-icon">🎥</div>
            <p class="video-title">${item.title}</p>
            <a href="${item.url}" target="_blank" class="video-link">Watch Video</a>
          </div>
          <div class="image-overlay">
            <div class="overlay-content">
              <h3 class="image-title">${item.title}</h3>
              <div class="hover-info">
                <p class="image-date">${item.date}</p>
                <p class="image-description">${item.explanation.substring(0, 100)}...</p>
                ${item.copyright ? `<p class="image-copyright">© ${item.copyright}</p>` : ''}
              </div>
            </div>
          </div>
        `;
      }
    }
    
    // Set the card content
    card.innerHTML = cardContent;
    
    // Add click event to open modal
    card.addEventListener('click', () => openModal(item));
    
    // Add cursor pointer to indicate it's clickable
    card.style.cursor = 'pointer';
    
    // Add the card to the gallery
    gallery.appendChild(card);
  });
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Also update the modal function:
// When a gallery item is clicked, check if it's an image or a video.
// If it's an image, show a larger version in the modal.
// If it's a video, embed it inside the modal or show a link to watch.
// Ensure the modal still shows title, date, and explanation for both types.
function openModal(apodItem) {
  // Set modal content
  modalTitle.textContent = apodItem.title;
  modalDate.textContent = apodItem.date;
  modalExplanation.textContent = apodItem.explanation;
  
  // Handle copyright information
  if (apodItem.copyright) {
    modalCopyright.textContent = `© ${apodItem.copyright}`;
    modalCopyright.style.display = 'block';
  } else {
    modalCopyright.style.display = 'none';
  }
  
  // Clear previous content
  const modalImageContainer = document.querySelector('.modal-image-container');
  modalImageContainer.innerHTML = '';
  
  // Handle different media types
  if (apodItem.media_type === 'image') {
    // For images, show a larger version
    const img = document.createElement('img');
    img.src = apodItem.hdurl || apodItem.url;
    img.alt = apodItem.title;
    img.className = 'img-fluid modal-image';
    modalImageContainer.appendChild(img);
  } else if (apodItem.media_type === 'video') {
    // For videos, try to embed YouTube videos
    const videoId = extractYouTubeId(apodItem.url);
    
    if (videoId) {
      // Embed YouTube video
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.width = '100%';
      iframe.height = '400';
      iframe.style.border = 'none';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.className = 'modal-video';
      modalImageContainer.appendChild(iframe);
    } else {
      // For non-YouTube videos, show a styled link
      const videoContainer = document.createElement('div');
      videoContainer.className = 'modal-video-placeholder';
      videoContainer.innerHTML = `
        <div class="video-placeholder-content">
          <div class="video-icon-large">🎥</div>
          <p class="video-message">This video cannot be embedded</p>
          <a href="${apodItem.url}" target="_blank" class="btn btn-primary">Watch Video</a>
        </div>
      `;
      modalImageContainer.appendChild(videoContainer);
    }
  }
  
  // Show the modal using Bootstrap
  bootstrapModal.show();
}

// Function to get a random space fact
function getRandomFact() {
  const randomIndex = Math.floor(Math.random() * SPACE_FACTS.length);
  return SPACE_FACTS[randomIndex];
}

// Function to display a new fact
function displayNewFact() {
  const fact = getRandomFact();
  if (funFactText) {
    funFactText.textContent = fact;
  }
}

// Function to start fact rotation
function startFactRotation() {
  // Clear any existing interval first to prevent multiple timers
  if (factRotationInterval) {
    clearInterval(factRotationInterval);
  }
  
  // Display initial fact only if it's the first time
  if (!funFactText || !funFactText.textContent.trim()) {
    displayNewFact();
  }
  
  // Set up interval to rotate facts every 10 seconds
  factRotationInterval = setInterval(displayNewFact, 10000);
}

// Function to stop fact rotation
function stopFactRotation() {
  if (factRotationInterval) {
    clearInterval(factRotationInterval);
    factRotationInterval = null;
  }
}

// Function to handle manual fact request
function handleManualFactRequest() {
  // Stop current rotation
  stopFactRotation();
  
  // Display new fact immediately
  displayNewFact();
  
  // Restart rotation with a fresh 10-second timer
  startFactRotation();
}
