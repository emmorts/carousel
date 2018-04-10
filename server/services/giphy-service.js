const giphy = require('giphy-api');

class GiphyService {

  constructor() {
    this.giphyClient = giphy();
  }

  async search(query, rating, skip = 0, limit = 10) {
    let results = [];

    const giphyResponse = await this.giphyClient.search({
      q: query,
      rating: rating,
      offset: skip,
      limit: limit
    });
    if (giphyResponse && giphyResponse.data && giphyResponse.data.length) {
      results = giphyResponse.data
        .map(result => result.images.downsized_small)
        .filter(downsizedImage => Number(downsizedImage.mp4_size) <= 100 * 1024)
        .map(downsizedImage => ({
          url: downsizedImage.mp4,
          width: parseInt(downsizedImage.width),
          height: parseInt(downsizedImage.height)
        }));
    }

    return results;
  }

}

module.exports = GiphyService;