const createRouter = require('../../.lib/createRouter');
const hotelsController = require('../controllers/hotelsController');

const router = createRouter();

router.get('/', hotelsController.getAll);
router.get('/:id', hotelsController.getById);
router.post('/', hotelsController.create);
router.put('/:id', hotelsController.update);
router.patch('/:id', hotelsController.patch);
router.delete('/:id', hotelsController.delete);

module.exports = router;
