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

    if (!options.provider || !('load' in options.provider)) {
      throw new Error(`Provider was not supplied or it doesn't have a load() function!`);
    }

    this.currentPosition = 0;
    this.currentSlide = 0;
    this.slideCount = 0;
    this.slideWidth = 400;
    this.loadCount = options.loadCount || 10;
    this.provider = options.provider;

    this.videoElements = [];
    this.trackerElements = [];

    this._renderCarousel();
    this._load();
  }

  _load() {
    this._showLoader();

    return this.provider.load(this.loadCount)
      .then(videos => this._renderVideos(videos))
      .then(() => this._updateContainer())
      .then(() => this._hideLoader())
      .catch(ex => {
        if (ex instanceof Error) {
          throw ex;
        }
        throw new Error(`Failed to load all provided videos!`);
      });
  }

  _renderVideos(videos) {
    return new Promise((resolve, reject) => {
      if (videos && videos.length) {
        return videos
          .reduce((promise, video) => promise
              .then(() => this._addVideoToCarousel(video))
              .then(() => this.slideCount++)
              .catch(() => console.error(`Video '${video.url}' failed to load!`))
            , Promise.resolve())
          .then(() => resolve());
      } else {
        resolve();
      }
    });
  }

  _addVideoToCarousel(video) {
    return new Promise((resolve, reject) => {
      const videoContainerElement = this._createVideo(video);

      videoContainerElement.firstChild.addEventListener('loadeddata', () => resolve());

      videoContainerElement.firstChild.addEventListener('error', () => {
        this.contentContainerElement.removeChild(videoContainerElement);

        reject();
      });

      this.contentContainerElement.appendChild(videoContainerElement);
      this.trackerContainerElement.appendChild(this._createTracker());
    });
  }

  _showLoader() {
    if (this.loaderContainerElement) {
      this.loaderContainerElement.style.display = 'block';
    }
    if (this.arrowContainerElement) {
      this.arrowContainerElement.style.display = 'none';
    }
    if (this.trackerContainerElement) {
      this.trackerContainerElement.style.display = 'none';
    }
  }

  _hideLoader() {
    if (this.loaderContainerElement) {
      this.loaderContainerElement.style.display = 'none';
    }
    if (this.arrowContainerElement) {
      this.arrowContainerElement.style.display = 'block';
    }
    if (this.trackerContainerElement) {
      this.trackerContainerElement.style.display = 'block';
    }
  }

  _renderCarousel() {
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
    this.trackerContainerElement = document.createElement('div');
    this.trackerContainerElement.className = 'carousel-tracker';

    return this.trackerContainerElement;
  }

  _createTracker() {
    const trackerElement = document.createElement('div');
    trackerElement.className = 'carousel-tracker-item';

    if (!this.trackerElements.length) {
      trackerElement.className = trackerElement.className + ' active';
    }
    
    trackerElement.addEventListener('click', event => {
      if (event && event.target) {
        const index = this.trackerElements.indexOf(event.target);
        if (index !== -1) {
          this._slideTo(index);
        }
      }
    });

    this.trackerElements.push(trackerElement);

    return trackerElement;
  }

  _createVideo(image) {
    const videoContainerElement = document.createElement('div');
    videoContainerElement.className = 'carousel-video';

    const videoElement = document.createElement('video');
    videoElement.src = image.url;
    videoElement.width = 400;

    videoContainerElement.appendChild(videoElement);

    this.videoElements.push(videoElement);

    return videoContainerElement;
  }

  _onPreviousClick(ev) {
    ev.preventDefault();
    if (this.currentSlide === 0) {
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

  _slideTo(number) {
    this._trackCurrentSlide(number);

    const previousSlide = this.currentSlide;
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
    if (this.trackerElements.length > number) {
      this.trackerElements[this.currentSlide].className = this.trackerElements[this.currentSlide].className.replace('active', '');
      this.trackerElements[number].className = this.trackerElements[number].className + ' active';
    }
  }

}