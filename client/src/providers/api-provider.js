import 'babel-polyfill';
import 'whatwg-fetch';
import Provider from './provider.js';

export default class ApiProvider extends Provider {
  constructor(options = {}) {
    super(options);
  }

  load(count) {
    const result = fetch('/api', {
      mode: 'no-cors'
    })
      .then(response => {
        return response.json();
      })
      .catch(error => console.error(error))
      .then(result => {
        console.log(result);
        return result;
      });
    return result;
  }
}