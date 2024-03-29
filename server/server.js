const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const path = require('path');

const GiphyService = require('./services/giphy-service.js');

const app = new Koa();
const router = new Router();
const giphyService = new GiphyService();

router.get('/api/giphy', async (ctx, next) => {
  const { query, skip, limit } = ctx.query;
  if (query) {
    ctx.body = await giphyService.search(query, 'r', skip, limit);
  } else {
    ctx.body = [];
  }
  next();
});

app.use(serve(path.join(__dirname, '../', 'client/dist')));
app.use(router.routes());

app.listen(3000, () => console.log('Listening on 3000'));