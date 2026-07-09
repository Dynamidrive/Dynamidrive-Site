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
  "Combi Satisfaction", // Greenville fictional
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
const themingStripes = {
  a: document.querySelectorAll('.theming-stripes-group.a .theming-stripe'),
  b: document.querySelectorAll('.theming-stripes-group.b .theming-stripe')
};
const themingStripeColors = [
  // No dark colors (e.g., black, gray) to avoid low contrast
  // Iconic BMW M colors
  '#0033A0', // BMW M Blue
  '#FF0000', // BMW M Red
  '#FFFFFF', // BMW M White
  // Iconic Audi RS colors
  '#BB0A30', // Audi RS Red
  // Iconic Porsche colors
  '#FFB81C', // Porsche Yellow
  // Iconic Ferrari colors
  '#FF2800', // Ferrari Red
  // Iconic McLaren colors
  '#FF5C00', // McLaren Orange
  // Iconic Mercedes-AMG colors
  '#00AEEF', // Mercedes-AMG Blue
  // Iconic Nissan GT-R colors
  '#C8102E', // Nissan GT-R Red
  // Other pastel colors for variety
  '#FF69B4', // Hot Pink
  '#8A2BE2', // Blue Violet
  '#00CED1', // Dark Turquoise
  '#2E8B57', // Sea Green
  '#FF4500', // Orange Red
  '#1E90FF', // Dodger Blue
  '#00FF7F', // Spring Green
];
const themingStripesAnimationDuration = 4000; // in milliseconds
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
let themingFirstUpdateDone = false; // To handle the first update differently
let themingStripesLastUpdate = 0; // To track time between theming updates
let themingStripesCurrentGroup = false; // To alternate between the two groups of stripes

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
      img.setAttribute("alt", `Soundtrack ${cardIndices[currentIndex]}`);
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

/**
 * @returns {string[]} An array of 3 hex color code strings.
 */
function getRandomColorCombination() {
  const shuffledColors = shuffleArray([...themingStripeColors]);
  return shuffledColors.slice(0, 3);
}

function updateThemingStripeElements(elements) {
  const colors = getRandomColorCombination();
  elements.forEach((stripe, index) => {
    stripe.style.backgroundColor = colors[index];
  });
}

/*
  Implements:
  - Updates each stripe with a random color every 6 seconds.
  - Alternates between two sets of stripes (a and b) to create a continuous animation effect.
  - Stripes "B" start their animation 50% of the way through the "A" animation cycle, which is when the CSS animation moves them in.
*/
function updateThemingStripes(timestamp) {
  const currentTime = timestamp || performance.now();
  if (currentTime - themingStripesLastUpdate >= themingStripesAnimationDuration) {
    themingStripesCurrentGroup = !themingStripesCurrentGroup; // Toggle between the two groups of stripes
    const currentGroup = themingStripesCurrentGroup ? themingStripes.b : themingStripes.a;
    updateThemingStripeElements(currentGroup);

    themingStripesLastUpdate = currentTime;
  }
}

function updateDistanceDisplay(timestamp) {
  const distance = (timestamp || 0) * distanceChangeSpeed;
  distanceDisplay.textContent = `${distance.toFixed(0)} mi`;
}

function animate(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = Math.min(timestamp - lastTimestamp, 100); // Cap deltaTime to avoid large jumps

  lastTimestamp = timestamp;
  updateCardAnimations(deltaTime);
  updateDistanceDisplay(timestamp);
  updateThemingStripes(timestamp);
  requestAnimationFrame(animate);
}

createAnimatedCards();
initializeCardPositions();
updateThemingVehicle();
requestAnimationFrame(animate);

setInterval(updateThemingVehicle, themingVehicleUpdateInterval);
// setInterval(() => updateThemingStripes(themingStripes.a), 6000);
// setTimeout(() => {
//   setInterval(() => updateThemingStripes(themingStripes.b), 6000);
// }, 6000 * 0.5); // Start the second set of stripes after a delay

updateThemingStripeElements(themingStripes.a);
updateThemingStripeElements(themingStripes.b);

window.addEventListener('resize', initializeCardPositions);