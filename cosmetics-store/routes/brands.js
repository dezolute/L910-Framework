const createRouter = require('../../.lib/createRouter');
const brandsController = require('../controllers/brandsController');

const router = createRouter();

router.get('/', brandsController.getAll);
router.get('/:id', brandsController.getById);
router.post('/', brandsController.create);
router.put('/:id', brandsController.update);
router.patch('/:id', brandsController.patch);
router.delete('/:id', brandsController.delete);

module.exports = router;
