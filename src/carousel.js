import LocalProvider from "./providers/local-provider";

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
    this.slideWidth = 0;
    this.slideCount = 0;

    this._initializeCarousel();

    new LocalProvider()
      .load(10)
      .then(imageUrls => this._loadImages(imageUrls))
      .then(() => {
        if (!this.slideWidth) {
          this.slideWidth = this.contentContainerElement.firstChild.clientWidth;
        }

        this.contentContainerElement.style.width = this.slideCount * this.slideWidth + 'px';
      })
      .catch(ex => {
        if (ex instanceof Error) {
          throw ex;
        }
        throw new Error(`Failed to load all provided images!`);
      });
  }

  _loadImages(imageUrls) {
    return new Promise((resolve, reject) => {
      this.slideCount = 0;
      return imageUrls
        .reduce((promise, imageUrl) => {
          return promise
            .then(() => this._addImageToCarousel(imageUrl))
            .then(() => this.slideCount++)
            .catch(() => {
              console.error(`Image '${imageUrl}' failed to load!`);
            });
        }, Promise.resolve())
        .then(() => resolve());
    });
  }

  _addImageToCarousel(imageUrl) {
    return new Promise((resolve, reject) => {
      const imageContainerElement = this._createImage(imageUrl);

      imageContainerElement.firstChild.addEventListener('load', () => resolve());

      imageContainerElement.firstChild.addEventListener('error', () => {
        this.contentContainerElement.removeChild(imageContainerElement);

        reject();
      });
      
      this.contentContainerElement.appendChild(imageContainerElement);
    });
  }

  _initializeCarousel() {
    const carouselWrapperElement = this._createCarouselWrapper();

    carouselWrapperElement.appendChild(this._createArrowContainer());
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
    const arrowContainerElement = document.createElement('div');
    arrowContainerElement.className = 'carousel-arrows';

    const arrowLeftElement = document.createElement('a');
    arrowLeftElement.className = 'carousel-arrow left';
    arrowLeftElement.setAttribute('title', 'Previous');
    arrowLeftElement.addEventListener('click', this._onPreviousClick.bind(this));
    arrowContainerElement.appendChild(arrowLeftElement);

    const arrowRightElement = document.createElement('a');
    arrowRightElement.className = 'carousel-arrow right';
    arrowRightElement.setAttribute('title', 'Next');
    arrowRightElement.addEventListener('click', this._onNextClick.bind(this));
    arrowContainerElement.appendChild(arrowRightElement);

    return arrowContainerElement;
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

  _createImage(imageUrl) {
    const imageContainerElement = document.createElement('div');
    imageContainerElement.className = 'carousel-image';

    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;

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

    this.currentPostion = -1 * this.currentSlide * this.slideWidth;

    this.contentContainerElement.style.left = parseInt(this.currentPostion + direction * this.slideWidth * slidesToSkip) + 'px';
  }

  _trackCurrentSlide(number) {
    // classes on trackers
  }

}