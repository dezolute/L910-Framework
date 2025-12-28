const App = require('./.lib/app');

const concertsRouter = require('./concert-shedule/routes/concerts');
const artistsRouter = require('./concert-shedule/routes/artists');

const toursRouter = require('./travel-agency/routes/tours');
const hotelsRouter = require('./travel-agency/routes/hotels');

const showsRouter = require('./circus/routes/shows');
const performersRouter = require('./circus/routes/performers');

const productsRouter = require('./cosmetics-store/routes/products');
const brandsRouter = require('./cosmetics-store/routes/brands');

const app = new App();

app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.url}`);
  next();
});

app.use('/concerts', concertsRouter);
app.use('/artists', artistsRouter);
app.use('/tours', toursRouter);
app.use('/hotels', hotelsRouter);
app.use('/products', productsRouter);
app.use('/brands', brandsRouter);
app.use('/shows', showsRouter);
app.use('/performers', performersRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Concert Schedule API',
    version: '1.0.0',
    endpoints: {
      concerts: '/concerts',
      artists: '/artists'
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
  console.log('Test endpoints:');
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log(`  GET  http://localhost:${PORT}/concerts`);
  console.log(`  GET  http://localhost:${PORT}/artists`);
  console.log(`  GET  http://localhost:${PORT}/hotels`);
  console.log(`  GET  http://localhost:${PORT}/tours`);
  console.log(`  GET  http://localhost:${PORT}/products`);
  console.log(`  GET  http://localhost:${PORT}/brands`);
  console.log(`  GET  http://localhost:${PORT}/shows`);
  console.log(`  GET  http://localhost:${PORT}/performers`);
  console.log('');
});