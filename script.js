let imageData = [];
const modal = document.getElementById('modal');
const track = document.getElementById('slider-track');

async function init() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        imageData = await response.json();

        renderGallery();
        renderSlides();
    } catch (e) { console.error(e); }
}

function renderGallery() {
    const gallery = document.getElementById('gallery');
    imageData.forEach((item, index) => {
        const img = document.createElement('img');
        img.fetchPriority = 'high';
        img.loading = 'lazy';
        img.src = item.thumb;
        img.className = 'thumbnail';
        img.onclick = () => openModal(index);
        gallery.appendChild(img);
    });
}

function renderSlides() {
    imageData.forEach((item) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        const img = document.createElement('img');
        img.dataset.src = item.full;
        slide.appendChild(img);
        track.appendChild(slide);
    });
}

function openModal(index) {
    modal.style.display = 'block';
    // Small delay to ensure display:block is applied before scrolling
    setTimeout(() => {
        const width = track.clientWidth;
        track.scrollTo({ left: index * width, behavior: 'instant' });
        loadImages(index);
    }, 10);
}

// Logic to load images when scrolling stops
track.addEventListener('scroll', () => {
    const x = track.scrollLeft / track.clientWidth;
    loadImages(Math.round(x));
});

function loadOneImage(index) {
    if (index < 0 || track.children.length <= index)
        return;

    const img = track.children[index].querySelector('img');
    if (!img)
        return;

    if (!img.src) {
        img.fetchPriority = 'high';
        img.src = img.dataset.src;
    }

    return img.complete;
}

function loadImages(index) {
    const ret = loadOneImage(index);
    setTimeout(() => {
        loadOneImage(index + 1);
        loadOneImage(index - 1);
    }, ret ? 1 : 100);
}

function closeModal() {
    modal.style.display = 'none';
}
function next() {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    loadImages(index + 1);
    track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
}
function prev() {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    loadImages(index - 1);
    track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
}

document.getElementById('next-btn').onclick = () => {
    next();
};
document.getElementById('prev-btn').onclick = () => {
    prev();
};
document.getElementById('close-btn').onclick = () => {
    closeModal();
}

document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'block') {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'Escape') closeModal();
    }
});

init();
