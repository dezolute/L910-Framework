const createRouter = require('../../.lib/createRouter');
const toursController = require('../controllers/toursController');

const router = createRouter();

router.get('/', toursController.getAll);
router.get('/:id', toursController.getById);
router.post('/', toursController.create);
router.put('/:id', toursController.update);
router.patch('/:id', toursController.patch);
router.delete('/:id', toursController.delete);

module.exports = router;