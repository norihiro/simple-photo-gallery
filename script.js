/* SPDX-License-Identifier: BSD-1-Clause
 *
 * Copyright (c) 2026
 *   Norihiro Kamae
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * THIS SOFTWARE IS PROVIDED BY Norihiro Kamae "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL Norihiro Kamae BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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

        const isVideo = item.full.match(/\.(mov|mp4|webm|ogg)$/i);

        if (!isVideo) {
            const a = document.createElement('a');
            a.href = item.full;
            slide.appendChild(a);
            const img = document.createElement('img');
            img.dataset.src = item.full;
            a.appendChild(img);
        } else {
	    const container = document.createElement('div');
	    container.className = 'video-container';

            const video = document.createElement('video');
            video.controls = true;
            video.preload = 'none';
            video.dataset.src = item.full;
            container.appendChild(video);

	    const dl = document.createElement('button');
	    dl.className = 'video-download';
	    dl.innerText = 'Download';

	    dl.onclick = async () => {
		const fileUrl = item.full;
		const fileName = fileUrl.split('/').pop();

		try {
		    const response = await fetch(fileUrl);
		    const blob = await response.blob();
		    const file = new File([blob], fileName, { type: blob.type });

		    if (navigator.canShare && navigator.canShare({ files: [file] })) {
			await navigator.share({
			    files: [file],
			    title: fileName,
			});
		    } else {
			window.open(fileUrl, '_blank');
		    }
		} catch (error) {
		    console.error('Sharing failed', error);
		    window.location.href = fileUrl;
		}
	    };
	    container.appendChild(dl);

	    slide.appendChild(container);
        }

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

    const media = track.children[index].querySelector('img, video');
    if (!media)
        return;

    let loading = false;

    if (!media.src) {
        media.fetchPriority = 'high';
        media.src = media.dataset.src;
        loading = true;
    }

    return media.tagName === 'IMG' ? media.complete : !loading;
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
    const videos = track.querySelectorAll('video');
    videos.forEach(v => v.pause());
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
