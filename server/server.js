const Koa = require('koa');
const Router = require('koa-router');
// const cors = require('@koa/cors');
const serve = require('koa-static');
const Bundler = require('parcel-bundler');

const GiphyService = require('./services/giphy-service.js');

const app = new Koa();
const router = new Router();
const giphyService = new GiphyService();
const bundler = new Bundler('../client/index.html');

router.get('/api', async (ctx, next) => {
  const gifs = await giphyService.search('specter', 'r');
  ctx.body = gifs;
  next();
});

// app.use(cors());
app.use(serve('./dist'));
app.use(router.routes());

app.use(bundler.middleware());

app.listen(3000);