// hometogo-dash/js/app.js

// App State
let chatState = {
    messages: [],
    currentTurn: 0,
    userId: null,
    tripId: null,
    family: null,
    currentCarouselHomes: []
};

let mockData = null;

// Initialize app
async function init() {
    await loadMockData();

    const params = new URLSearchParams(window.location.search);
    chatState.userId = params.get('user_id') || '123';
    chatState.tripId = params.get('trip_id') || 'xyz';

    const family = mockData.familyProfiles[chatState.userId];
    if (!family) {
        console.error('Family not found for user_id:', chatState.userId, '- using default.');
        chatState.family = mockData.familyProfiles['123'];
    } else {
        chatState.family = family;
    }

    renderInitialMessage();
    attachEventListeners();
}

// Load mock data from JSON file
async function loadMockData() {
    try {
        const response = await fetch('mock-data.json');
        mockData = await response.json();
    } catch (error) {
        console.error('Error loading mock data:', error);
    }
}

// Render initial agent message
function renderInitialMessage() {
    const chatContainer = document.getElementById('chat-container');

    const greetingText = `Hey ${chatState.family.name}, you booked ${chatState.family.lastTrip.destination} last ${chatState.family.lastTrip.season} for a getaway with the kids.`;
    const greeting = createAgentMessage(greetingText, false);
    chatContainer.appendChild(greeting);

    const initialResponse = mockData.agentResponses.initial;
    const message = createAgentMessage(initialResponse.message);
    chatContainer.appendChild(message);

    chatState.messages.push({ type: 'agent', content: greetingText });
    chatState.messages.push({ type: 'agent', content: initialResponse.message });

    chatState.currentCarouselHomes = initialResponse.homes;
    renderCarousel(initialResponse.homes);
}

// Create agent message element. Pass showFeedback=false for lead-in lines that aren't the "answer" itself.
function createAgentMessage(content, showFeedback = true) {
    const div = document.createElement('div');
    div.className = 'agent-message';

    const feedbackHtml = showFeedback ? `
        <div class="feedback-buttons">
            <button class="feedback-btn upvote-btn" title="Helpful">
                &#128077; Helpful
            </button>
            <button class="feedback-btn downvote-btn" title="Not helpful">
                &#128078; Not helpful
            </button>
        </div>
    ` : '';

    div.innerHTML = `<p>${content}</p>${feedbackHtml}`;
    return div;
}

// Attach event listeners
function attachEventListeners() {
    document.querySelectorAll('.intent-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const intent = e.currentTarget.dataset.intent;
            handleUserIntent(intent);
        });
    });

    document.getElementById('send-btn').addEventListener('click', () => {
        handleFreeText();
    });

    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleFreeText();
        }
    });

    document.getElementById('modal-close').addEventListener('click', closeModal);

    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            closeModal();
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('upvote-btn')) {
            handleFeedback(e.target, 'upvote');
        }
        if (e.target.classList.contains('downvote-btn')) {
            handleFeedback(e.target, 'downvote');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);

// ---------------------------------------------------------------------------
// Carousel
// ---------------------------------------------------------------------------

function renderCarousel(homeIds) {
    const chatContainer = document.getElementById('chat-container');

    const carouselDiv = document.createElement('div');
    carouselDiv.className = 'carousel-container';
    carouselDiv.innerHTML = `
        <button class="carousel-nav prev" aria-label="Previous home">&lsaquo;</button>
        <div class="carousel-wrapper"></div>
        <button class="carousel-nav next" aria-label="Next home">&rsaquo;</button>
    `;

    const wrapper = carouselDiv.querySelector('.carousel-wrapper');
    homeIds.forEach(homeId => {
        const home = mockData.homes[homeId];
        if (!home) return;
        const card = createHomeCard(home);
        wrapper.appendChild(card);
    });

    carouselDiv.querySelector('.carousel-nav.prev').addEventListener('click', () => {
        scrollCarousel(wrapper, -1);
    });
    carouselDiv.querySelector('.carousel-nav.next').addEventListener('click', () => {
        scrollCarousel(wrapper, 1);
    });

    chatContainer.appendChild(carouselDiv);
}

function createHomeCard(home) {
    const card = document.createElement('div');
    card.className = 'home-card';
    card.innerHTML = `
        <img src="${home.image}" alt="${home.name}" class="home-card-image">
        <div class="home-card-info">
            <div class="home-card-location">${home.location}</div>
            <div class="home-card-price">&euro;${home.price}/night</div>
            <div class="home-card-cta">
                <button class="wishlist-btn" data-home-id="${home.id}">
                    &#10084;&#65039; Save
                </button>
                <button class="view-more-btn primary" data-home-id="${home.id}">
                    View More
                </button>
            </div>
        </div>
    `;

    card.querySelector('.view-more-btn').addEventListener('click', (e) => {
        const homeId = e.currentTarget.dataset.homeId;
        openModal(homeId);
    });

    card.querySelector('.wishlist-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        btn.classList.toggle('active');
        btn.innerHTML = btn.classList.contains('active') ? '&#10084;&#65039; Saved' : '&#10084;&#65039; Save';
    });

    return card;
}

function scrollCarousel(wrapper, direction) {
    const cardWidth = wrapper.querySelector('.home-card')?.offsetWidth || 200;
    const scrollAmount = direction * (cardWidth + 12);
    wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function openModal(homeId) {
    const home = mockData.homes[homeId];
    if (!home) return;

    const modalBody = document.getElementById('modal-body');

    const amenitiesHtml = home.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('');
    const allAmenitiesHtml = home.allAmenities.map(a => `<span class="amenity-tag">${a}</span>`).join('');

    const fullStars = Math.floor(home.rating);
    const hasHalfStar = home.rating % 1 >= 0.5;
    const stars = '&#9733;'.repeat(fullStars) + (hasHalfStar ? '&#189;' : '');

    modalBody.innerHTML = `
        <img src="${home.image}" alt="${home.name}" class="modal-image">
        <div class="modal-title">${home.name}</div>
        <div class="modal-meta">${home.location}</div>
        <div class="modal-price">&euro;${home.price}/night</div>

        <div class="rating">
            <span class="star">${stars}</span>
            <span class="modal-meta">${home.rating}</span>
        </div>

        <div class="modal-section-title">Amenities</div>
        <div class="amenities-list" id="amenities-preview">
            ${amenitiesHtml}
        </div>
        <button id="show-all-amenities-btn" class="text-[#9B8AFB] text-sm underline mb-2">
            Show All
        </button>
        <div id="all-amenities" class="hidden">
            <div class="amenities-list">
                ${allAmenitiesHtml}
            </div>
        </div>

        <div class="modal-section-title">Available During the Holidays</div>
        <div class="modal-meta">${home.availableDates}</div>

        <div class="modal-cta">
            <button id="modal-wishlist-btn">
                &#10084;&#65039; Add to Wishlist
            </button>
            <button class="primary" id="modal-book-btn">
                Book Now
            </button>
        </div>
    `;

    document.getElementById('show-all-amenities-btn').addEventListener('click', (e) => {
        const preview = document.getElementById('amenities-preview');
        const allAmenities = document.getElementById('all-amenities');

        if (allAmenities.classList.contains('hidden')) {
            allAmenities.classList.remove('hidden');
            preview.classList.add('hidden');
            e.currentTarget.textContent = 'Show Less';
        } else {
            allAmenities.classList.add('hidden');
            preview.classList.remove('hidden');
            e.currentTarget.textContent = 'Show All';
        }
    });

    document.getElementById('modal-wishlist-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        btn.classList.toggle('active');
        btn.innerHTML = btn.classList.contains('active') ? '&#10084;&#65039; Saved' : '&#10084;&#65039; Add to Wishlist';
    });

    document.getElementById('modal-book-btn').addEventListener('click', () => {
        window.open('https://www.hometogo.com', '_blank');
    });

    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// ---------------------------------------------------------------------------
// User Interaction Handlers
// ---------------------------------------------------------------------------

const INTENT_LABELS = {
    cheaper: 'I want something cheaper',
    nature: 'I want something closer to nature',
    pool: 'I want to have indoor pool',
    sights: 'I want important sights at walking distance'
};

function getIntentText(intent) {
    return INTENT_LABELS[intent] || intent;
}

function appendUserMessage(text) {
    const chatContainer = document.getElementById('chat-container');
    const userMsg = document.createElement('div');
    userMsg.className = 'user-message';
    userMsg.textContent = text;
    chatContainer.appendChild(userMsg);

    chatState.messages.push({ type: 'user', content: text });

    const mainEl = chatContainer.parentElement;
    mainEl.scrollTop = mainEl.scrollHeight;
}

function showTypingIndicator() {
    const chatContainer = document.getElementById('chat-container');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatContainer.appendChild(typingDiv);

    const mainEl = chatContainer.parentElement;
    mainEl.scrollTop = mainEl.scrollHeight;

    return typingDiv;
}

function deliverAgentResponse(response) {
    const chatContainer = document.getElementById('chat-container');

    const agentMsg = createAgentMessage(response.message);
    chatContainer.appendChild(agentMsg);

    chatState.messages.push({ type: 'agent', content: response.message });

    chatState.currentCarouselHomes = response.homes;
    renderCarousel(response.homes);

    const mainEl = chatContainer.parentElement;
    mainEl.scrollTop = mainEl.scrollHeight;

    chatState.currentTurn += 1;
}

function handleUserIntent(intent) {
    appendUserMessage(getIntentText(intent));

    const typingDiv = showTypingIndicator();

    setTimeout(() => {
        typingDiv.remove();

        const response = mockData.agentResponses[intent];
        if (!response) {
            console.error('Response not found for intent:', intent);
            return;
        }

        deliverAgentResponse(response);
    }, 1500);
}

function handleFreeText() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();

    if (!text) return;

    appendUserMessage(text);
    input.value = '';

    const typingDiv = showTypingIndicator();

    setTimeout(() => {
        typingDiv.remove();

        const response = mockData.agentResponses.default;
        deliverAgentResponse(response);
    }, 1500);
}

// ---------------------------------------------------------------------------
// Feedback Handlers
// ---------------------------------------------------------------------------

function handleFeedback(button, type) {
    const container = button.parentElement;
    const otherType = type === 'upvote' ? 'downvote' : 'upvote';
    const otherBtn = container.querySelector(`.${otherType}-btn`);

    const wasActive = button.classList.contains('active');
    button.classList.remove('active');
    otherBtn.classList.remove('active');

    if (!wasActive) {
        button.classList.add('active');
    }

    console.log(`User ${type}d message:`, container.previousElementSibling?.textContent);
}
