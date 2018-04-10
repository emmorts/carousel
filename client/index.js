import Carousel from './src/carousel.js';
import ApiProvider from './src/providers/api-provider.js';

document.addEventListener("DOMContentLoaded", () => { 
  new Carousel('.carousel', {
    provider: ApiProvider,
    loadCount: 10
  });
});