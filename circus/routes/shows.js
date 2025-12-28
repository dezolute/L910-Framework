const createRouter = require('../../.lib/createRouter');
const showsController = require('../controllers/showsController');

const router = createRouter();

router.get('/', showsController.getAll);
router.get('/:id', showsController.getById);
router.post('/', showsController.create);
router.put('/:id', showsController.update);
router.patch('/:id', showsController.patch);
router.delete('/:id', showsController.delete);

module.exports = router;
