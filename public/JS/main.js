const carouselContainer = document.querySelector('.carousel-container');
const carouselImages = document.querySelector('.carousel-images');
const description = document.querySelector('.carousel-description');
const images = document.querySelectorAll('.carousel-image');

let currentIndex = 0;

function showImage(index) {
    const imageWidth = images[0].clientWidth;
    carouselImages.style.transform = `translateX(${-index * imageWidth}px)`;
}

let counter = 1;

function nextImage() {
    if (counter >= 3) {
        return prevImage();
    }
    counter++;
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
}

function prevImage() {
    if (counter == 5) {
        counter = 1;
        return nextImage();
    }
    counter++;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
}

setInterval(nextImage, 4000);
