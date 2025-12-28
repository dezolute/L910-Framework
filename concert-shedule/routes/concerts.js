const createRouter = require('../../.lib/createRouter');
const concertsController = require('../controllers/concertsController');

const router = createRouter();

router.get('/', concertsController.getAll);
router.get('/:id', concertsController.getById);
router.post('/', concertsController.create);
router.put('/:id', concertsController.update);
router.patch('/:id', concertsController.patch);
router.delete('/:id', concertsController.delete);

module.exports = router;