const cardImageCount = 100; // All are assumed to be named: 1.png, 2.png, etc.
const cardImageRows = 3; // Number of rows
const cardStartingOffset = 3; // Number of cards to push the first card off-screen
const cardImagePath = 'img/soundtracks/';
const cardAnimationDuration = 20000; // in milliseconds
const cardGap = 16; // Gap between cards in pixels
const cardAnimationSpeedMultiplier = 1.5; // Multiplier to speed up the animation
const cardAnimationRowFactor = 4; // Factor to slow down lower rows (higher = more consistent speed)
const animatedCardsContainer = document.getElementById('animated-cards-container');

let cardWidth = 569; // Default width, will be automatically updated on card creation
let cardRows = []; // [ { element: HTMLDivElement, cards: [ HTMLImageElement ], reversed: boolean } ]
let lastTimestamp = null; // To track time between frames

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
      if (direction === 1 && currentX > cardWidth) {
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
    rowDiv.className = 'card-row';
    
    for (let col = 0; col < cardsPerRow && currentIndex < cardImageCount; col++) {
      const img = document.createElement('img');
      img.src = `${cardImagePath}${cardIndices[currentIndex]}.png`;
      img.className = 'animated-card';
      
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

function animate(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  updateCardAnimations(deltaTime);
  requestAnimationFrame(animate);
}

createAnimatedCards();
initializeCardPositions();
requestAnimationFrame(animate);