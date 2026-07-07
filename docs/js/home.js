// Card configuration
const cardImageCount = 100; // All are assumed to be named: 1.png, 2.png, etc.
const cardImageRows = 3; // Number of rows
const cardStartingOffset = 3; // Number of cards to push the first card off-screen
const cardImagePath = 'img/soundtracks/';
const cardAnimationDuration = 20000; // in milliseconds
const cardGap = 16; // Gap between cards in pixels
const cardAnimationSpeedMultiplier = 1.5; // Multiplier to speed up the animation
const cardAnimationRowFactor = 4; // Factor to slow down lower rows (higher = more consistent speed)
const animatedCardsContainer = document.getElementById('animated-cards-container');

// Section animation configuration
const themingVehicles = [
  "Airbus A380", // Not a car but funny
  "Audi A4",
  "Audi RS5",
  "Bandit Advance", // Greenville fictional
  "BMW 3-Series",
  "BMW X5",
  "Boeing 747", // Not a car but funny
  "Cadillac Escalade",
  "Cadillac CT5",
  "Caseus E2", // Greenville fictional
  "Chevrolet Camaro",
  "Chevrolet HHR",
  "Chevrolet SS",
  "Chevrolet Tahoe",
  "Cool Car", // not a car just funny
  "Dodge Charger",
  "Durant Manta", // Greenville fictional
  "Fiat 500",
  "Fiat Multipla",
  "Ford Bronco",
  "Ford Crown Victoria",
  "Ford F-150",
  "Ford Falcon",
  "Ford Mustang",
  "Ford Ranger",
  "GMC Sierra",
  "GMC Yukon",
  "Honda Accord",
  "Honda Civic",
  "Honda Fit",
  "Honda Prelude",
  "HSV GTSR W1",
  "Hyundai Elantra",
  "Hyundai Sonata",
  "Hummer H1",
  "Jaguar XE",
  "Jeep Cherokee",
  "Jeep Wrangler",
  "Kia Optima",
  "Kia Stinger",
  "Lexus IS",
  "Lotus Evora",
  "Mazda 3",
  "Mazda 6",
  "Mazda MX-5",
  "Nissan Altima",
  "Nissan Cube",
  "Nissan GT-R",
  "NVNA Opus", // Greenville fictional
  "Peterbilt 579",
  "Pontiac GTO",
  "Porsche 911",
  "Rivian R1T",
  "Rivian R1S",
  "Saab 9-3",
  "Scion FR-S",
  "Smart Fortwo",
  "Subaru BRZ",
  "Subaru Impreza",
  "Subaru WRX",
  "Toyota Camry",
  "Toyota Corolla",
  "Toyota Prius",
  "Toyota Supra",
  "Tesla Model S",
  "Volkswagen Golf",
  "Volkswagen Jetta",
  "Volvo S60",
  "Volvo XC90"
];
const themingVehicleUpdateInterval = 2000; // in milliseconds
const themingVehicleSpan1 = document.getElementById('theming-vehicle-span-1');
const themingVehicleSpan2 = document.getElementById('theming-vehicle-span-2');
const distanceDisplay = document.getElementById('distance-display');
const distanceChangeSpeed = 0.001; // miles per millisecond

// Card state variables
let cardWidth = 613; // Default width, will be automatically updated on card creation
/**
 * @type {Array<{ element: HTMLDivElement, cards: Array<HTMLImageElement>, reversed: boolean }>} cardRows
 */
let cardRows = [];
let lastTimestamp = null; // To track time between frames

// Theming state variables
let themingVehicleIndex = 0;
let themingShuffled = shuffleArray([...themingVehicles]);
let themingSpanIndex = false; // To alternate between the two spans for animation

// Fisher-Yates array shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updateCardAnimations(deltaTime) {
  cardRows.forEach((row, index) => {
    const containerWidth = animatedCardsContainer.clientWidth;
    const direction = row.reversed ? -1 : 1;
    const speed = ((containerWidth / cardAnimationDuration) / ((index / cardAnimationRowFactor) + 1)) * cardAnimationSpeedMultiplier;

    row.cards.forEach((card, index) => {
      let currentX = parseFloat(card.dataset.x || '0');
      currentX += (speed * direction) * deltaTime;

      // Handle wrapping - when card exits one side, move it to the other side
      if (direction === 1 && currentX > containerWidth) {
        // Moving right, when card goes off right edge, wrap to left
        const leftMostX = Math.min(...row.cards.map(c => parseFloat(c.dataset.x || '0')));
        currentX = leftMostX - cardWidth - cardGap;
      } else if (direction === -1 && currentX < -cardWidth) {
        // Moving left, when card goes off left edge, wrap to right
        const rightMostX = Math.max(...row.cards.map(c => parseFloat(c.dataset.x || '0')));
        currentX = rightMostX + cardWidth + cardGap;
      }

      card.style.transform = `translateX(${currentX}px)`;
      card.dataset.x = currentX;
    });
  });
}

function createAnimatedCards() {
  const cardIndices = shuffleArray([...Array(cardImageCount).keys()].map(i => i + 1));
  const cardsPerRow = Math.ceil(cardImageCount / cardImageRows);
  let currentIndex = 0;

  for (let row = 0; row < cardImageRows; row++) {
    const reversed = row % 2 === 1;
    let rowCards = [];

    const rowDiv = document.createElement('div');
    rowDiv.classList.add('card-row');

    for (let col = 0; col < cardsPerRow && currentIndex < cardImageCount; col++) {
      const img = document.createElement('img');
      img.classList.add('animated-card');
      img.setAttribute("loading", "lazy");
      img.addEventListener("load", () => img.classList.add('loaded')); // Add loaded class on load
      img.src = `${cardImagePath}${cardIndices[currentIndex]}.png`;

      // Set initial position for proper spacing
      const initialX = reversed
        ? animatedCardsContainer.clientWidth + col * (cardWidth + cardGap)  // Start from right side if reversed
        : -cardWidth + col * (cardWidth + cardGap);  // Start from left side if not reversed

      img.style.transform = `translateX(${initialX}px)`;
      img.dataset.x = initialX.toString();

      rowDiv.appendChild(img);
      rowCards.push(img);
      currentIndex++;
    }

    animatedCardsContainer.appendChild(rowDiv);
    cardRows.push({ element: rowDiv, cards: rowCards, reversed });
  }
}

// Initialize cards and set up proper spacing
function initializeCardPositions() {
  // Wait for first card to load to get actual dimensions
  const firstCard = cardRows[0]?.cards[0];
  if (firstCard && firstCard.complete) {
    cardWidth = firstCard.offsetWidth;

    // Reposition all cards with proper spacing
    cardRows.forEach(row => {
      row.cards.forEach((card, cardIndex) => {
        let initialX;
        if (row.reversed) {
          // Start cards off-screen to the right
          initialX = cardIndex * (cardWidth + cardGap);
          card.style.left = `0`;
        } else {
          // Start cards off-screen to the left
          initialX = -cardIndex * (cardWidth + cardGap);
          card.style.right = `0`;
        }

        card.style.transform = `translateX(${initialX}px)`;
        card.dataset.x = initialX.toString();
      });
    });
  } else if (firstCard) {
    // Wait for image to load
    firstCard.onload = initializeCardPositions;
  }
}

function updateThemingVehicle() {
  themingVehicleIndex++;
  if (themingVehicleIndex >= themingShuffled.length) {
    themingShuffled = shuffleArray([...themingVehicles]);
    themingVehicleIndex = 0;
  }

  themingSpanIndex = !themingSpanIndex; // Toggle between 0 and 1

  const previousVehicleSpan = themingSpanIndex ? themingVehicleSpan2 : themingVehicleSpan1;
  previousVehicleSpan.classList.remove('incoming');
  previousVehicleSpan.classList.add('outgoing');
  const currentVehicleSpan = themingSpanIndex ? themingVehicleSpan1 : themingVehicleSpan2;
  currentVehicleSpan.textContent = themingShuffled[themingVehicleIndex];
  currentVehicleSpan.classList.remove('outgoing');
  currentVehicleSpan.classList.add('incoming');
}

function updateDistanceDisplay(timestamp) {
  const distance = (timestamp || 0) * distanceChangeSpeed;
  distanceDisplay.textContent = `${distance.toFixed(1)} mi`;
}

function animate(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = Math.min(timestamp - lastTimestamp, 100); // Cap deltaTime to avoid large jumps

  lastTimestamp = timestamp;
  updateCardAnimations(deltaTime);
  updateDistanceDisplay(timestamp);
  requestAnimationFrame(animate);
}

createAnimatedCards();
initializeCardPositions();
updateThemingVehicle();
requestAnimationFrame(animate);

setInterval(updateThemingVehicle, themingVehicleUpdateInterval);

window.addEventListener('resize', initializeCardPositions);