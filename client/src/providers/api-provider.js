import 'babel-polyfill';
import 'whatwg-fetch';
import Provider from './provider.js';

export default class ApiProvider extends Provider {
  constructor(options = {}) {
    super(options);
  }

  load(count) {
    const result = fetch(`/api/giphy?limit=${count}&query=random`)
      .then(response => response.json())
      .catch(error => console.error(error));
      
    return result;
  }
}