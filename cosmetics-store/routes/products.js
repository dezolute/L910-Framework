const createRouter = require('../../.lib/createRouter');
const productsController = require('../controllers/productsController');

const router = createRouter();

router.get('/', productsController.getAll);
router.get('/:id', productsController.getById);
router.post('/', productsController.create);
router.put('/:id', productsController.update);
router.patch('/:id', productsController.patch);
router.delete('/:id', productsController.delete);

module.exports = router;
