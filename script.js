let imageData = [];
let currentIndex = 0;
let startX = 0;
let currentX = 0;
let isDragging = false;

const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const gallery = document.getElementById('gallery');

async function init() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        imageData = await response.json();

        renderGallery();
    } catch (error) {
        console.error('Failed to load image data:', error);
    }
}

function renderGallery() {
    imageData.forEach((item, index) => {
        const img = document.createElement('img');
        img.src = item.thumb;
        img.className = 'thumbnail';
        img.loading = 'lazy';
        img.onclick = () => openModal(index);
        gallery.appendChild(img);
    });
}

function preload(index) {
    if (imageData.length === 0) return;
    const targetIndex = (index + imageData.length) % imageData.length;
    const img = new Image();
    img.src = imageData[targetIndex].full;
}

function updateDisplay(index) {
    currentIndex = index;
    modalImg.style.transition = 'none';
    modalImg.style.transform = 'translateX(0)';
    modalImg.src = imageData[currentIndex].full;

    preload(currentIndex + 1);
    preload(currentIndex - 1);
}

modalImg.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX;
    isDragging = true;
    modalImg.style.transition = 'none';
}, { passive: true });

modalImg.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].pageX;
    const diffX = currentX - startX;
    modalImg.style.transform = 'translateX(' + diffX + 'px)';
}, { passive: true });

modalImg.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const diffX = currentX - startX;
    const threshold = 100;

    modalImg.style.transition = 'transform 0.3s ease';

    if (diffX > threshold) {
        prev();
    } else if (diffX < -threshold) {
        next();
    } else {
        modalImg.style.transform = 'translateX(0)';
    }
    currentX = 0;
});

function openModal(index) {
    modal.style.display = 'flex';
    updateDisplay(index);
}

function closeModal() {
    modal.style.display = 'none';
    modalImg.src = '';
}

function next() { updateDisplay((currentIndex + 1) % imageData.length); }
function prev() { updateDisplay((currentIndex - 1 + imageData.length) % imageData.length); }

document.getElementById('close-btn').onclick = closeModal;
document.getElementById('next-btn').onclick = (e) => { e.stopPropagation(); next(); };
document.getElementById('prev-btn').onclick = (e) => { e.stopPropagation(); prev(); };

modal.onclick = (e) => { if (e.target === modal) closeModal(); };

document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'Escape') closeModal();
    }
});

function openModal(index) {
    modal.style.display = 'flex';
    updateDisplay(index);
}

function closeModal() {
    modal.style.display = 'none';
    modalImg.src = '';
}

init();
