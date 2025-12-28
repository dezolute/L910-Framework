const createRouter = require('../../.lib/createRouter');
const artistsController = require('../controllers/artistsController');

const router = createRouter();

router.get('/', artistsController.getAll);
router.get('/:id', artistsController.getById);
router.post('/', artistsController.create);
router.put('/:id', artistsController.update);
router.patch('/:id', artistsController.patch);
router.delete('/:id', artistsController.delete);

module.exports = router;
