import './carousel.css';
import ApiProvider from './providers/api-provider.js';

export default class Carousel {
  constructor(elementSelector, options = {}) {
    if (!elementSelector) {
      throw new Error(`Element selector for carousel initialization was not provided!`);
    }

    this.containerElement = document.querySelector(elementSelector);

    if (!this.containerElement) {
      throw new Error(`Failed to find an element with a given selector!`);
    }

    this.currentPosition = 0;
    this.currentSlide = 0;
    this.slideCount = 0;
    this.slideWidth = 400;

    this._initializeCarousel();

    this._showLoader();

    new ApiProvider()
      .load(10)
      .then(images => this._renderImages(images))
      .then(() => this._updateContainer())
      .then(() => this._hideLoader())
      .catch(ex => {
        if (ex instanceof Error) {
          throw ex;
        }
        throw new Error(`Failed to load all provided images!`);
      });
  }

  _renderImages(images) {
    return new Promise((resolve, reject) => {
      return images
        .reduce((promise, image) => promise
            .then(() => this._addImageToCarousel(image))
            .then(() => this.slideCount++)
            .catch(() => console.error(`Image '${image.url}' failed to load!`))
          , Promise.resolve())
        .then(() => resolve());
    });
  }

  _addImageToCarousel(image) {
    return new Promise((resolve, reject) => {
      const imageContainerElement = this._createImage(image);

      imageContainerElement.firstChild.addEventListener('loadeddata', () => resolve());

      imageContainerElement.firstChild.addEventListener('error', () => {
        this.contentContainerElement.removeChild(imageContainerElement);

        reject();
      });

      this.contentContainerElement.appendChild(imageContainerElement);
    });
  }

  _showLoader() {
    if (this.loaderContainerElement) {
      this.loaderContainerElement.style.display = 'block';
    }
    if (this.arrowContainerElement) {
      this.arrowContainerElement.style.display = 'none';
    }
  }

  _hideLoader() {
    if (this.loaderContainerElement) {
      this.loaderContainerElement.style.display = 'none';
    }
    if (this.arrowContainerElement) {
      this.arrowContainerElement.style.display = 'block';
    }
  }

  _initializeCarousel() {
    const carouselWrapperElement = this._createCarouselWrapper();

    carouselWrapperElement.appendChild(this._createArrowContainer());
    carouselWrapperElement.appendChild(this._createLoaderContainer());
    carouselWrapperElement.appendChild(this._createContentContainer());
    carouselWrapperElement.appendChild(this._createTrackerContainer());

    this.containerElement.appendChild(carouselWrapperElement);
  }

  _createCarouselWrapper() {
    const carouselWrapperElement = document.createElement('div');

    carouselWrapperElement.className = 'carousel-wrapper';

    return carouselWrapperElement;
  }

  _createArrowContainer() {
    this.arrowContainerElement = document.createElement('div');
    this.arrowContainerElement.className = 'carousel-arrows';

    const arrowLeftContainerElement = document.createElement('div');
    arrowLeftContainerElement.className = 'carousel-arrow left';
    this.arrowContainerElement.appendChild(arrowLeftContainerElement);

    const arrowLeftElement = document.createElement('a');
    arrowLeftElement.className = 'fas fa-angle-left';
    arrowLeftElement.setAttribute('title', 'Previous');
    arrowLeftElement.addEventListener('click', this._onPreviousClick.bind(this));
    arrowLeftContainerElement.appendChild(arrowLeftElement);

    const arrowRightContainerElement = document.createElement('div');
    arrowRightContainerElement.className = 'carousel-arrow right';
    this.arrowContainerElement.appendChild(arrowRightContainerElement);

    const arrowRightElement = document.createElement('a');
    arrowRightElement.className = 'fas fa-angle-right';
    arrowRightElement.setAttribute('title', 'Next');
    arrowRightElement.addEventListener('click', this._onNextClick.bind(this));
    arrowRightContainerElement.appendChild(arrowRightElement);

    return this.arrowContainerElement;
  }

  _createLoaderContainer() {
    this.loaderContainerElement = document.createElement('div');
    this.loaderContainerElement.className = 'carousel-loader'

    const loaderElement = document.createElement('span');
    loaderElement.className = 'fas fa-spinner rotating';
    this.loaderContainerElement.appendChild(loaderElement);

    return this.loaderContainerElement;
  }

  _createContentContainer() {
    this.contentContainerElement = document.createElement('div');
    this.contentContainerElement.className = 'carousel-content'

    return this.contentContainerElement;
  }

  _createTrackerContainer(parent) {
    const trackerContainerElement = document.createElement('div');
    trackerContainerElement.className = 'carousel-tracker';

    return trackerContainerElement;
  }

  _createImage(image) {
    const imageContainerElement = document.createElement('div');
    imageContainerElement.className = 'carousel-image';

    const imageElement = document.createElement('video');
    imageElement.src = image.url;
    imageElement.width = 400;

    imageContainerElement.appendChild(imageElement);

    return imageContainerElement;
  }

  _onPreviousClick(ev) {
    ev.preventDefault();
    if (this.currentSlide === 0){
      this._slideTo(this.slideCount - 1);
    } else {
      this._slideTo(this.currentSlide - 1);
    }
  }

  _onNextClick(ev) {
    ev.preventDefault();
    if (this.currentSlide === this.slideCount - 1) {
      this._slideTo(0);
    } else {
      this._slideTo(this.currentSlide + 1);
    }
  }

  _onImageLoad(ev) {
    if (ev.target && ev.target.parentElement && !this.slideWidth) {
      this.slideWidth = ev.target.parentElement.clientWidth;

      ev.target.removeEventListener('load', this._onImageLoad);
    }
  }

  _animate(options) {
    const start = Date.now();
    const intervalId = setInterval(() => {
      const timePassed = Date.now() - start;
      let progress = timePassed / options.duration;
      if (progress > 1) {
        progress = 1;
      }

      const delta = options.delta(progress);
      options.step(delta);

      if (progress === 1) {
        clearInterval(intervalId);
        options.callback();
      }
    }, options.delay || 17);
  }

  _slideTo(number) {
    const previousSlide = this.currentSlide;

    this._trackCurrentSlide(number);

    this.currentSlide = number;

    const direction = this.currentSlide > previousSlide ? 1 : -1;
    const slidesToSkip = Math.abs(previousSlide - this.currentSlide);

    this.currentPostion = previousSlide * this.slideWidth;

    this.contentContainerElement.style.left = '-' + parseInt(this.currentPostion + direction * this.slideWidth * slidesToSkip) + 'px';
  }

  _updateContainer() {
    if (this.contentContainerElement) {
      this.contentContainerElement.style.width = this.slideCount * this.slideWidth + 'px';
      this.contentContainerElement.style.display = 'block';
    }
  }

  _trackCurrentSlide(number) {
    // classes on trackers
  }

}