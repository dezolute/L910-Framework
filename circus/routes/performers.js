const createRouter = require('../../.lib/createRouter');
const performersController = require('../controllers/performersController');

const router = createRouter();

router.get('/', performersController.getAll);
router.get('/:id', performersController.getById);
router.post('/', performersController.create);
router.put('/:id', performersController.update);
router.patch('/:id', performersController.patch);
router.delete('/:id', performersController.delete);

module.exports = router;
