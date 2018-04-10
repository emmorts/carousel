import 'babel-polyfill';
import 'whatwg-fetch';

export default class ApiProvider {
  static load(count = 10, query = 'random') {
    return fetch(`/api/giphy?limit=${count}&query=${query}`)
      .then(response => response.json())
      .catch(error => console.error(error));
  }
}