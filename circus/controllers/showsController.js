const FileManager = require('../../.lib/utils/fileManager');
const showsDB = new FileManager('circus', 'shows.json');


function generateRandomShow() {
  const titles = [
    'Цирк чудес',
    'Магическое шоу',
    'Акробаты высшего пилотажа',
    'Вечер жонглеров',
    'Дрессированные звери',
    'Комедийное представление',
    'Воздушные акробаты'
  ];
  
  const categoriesPool = [
    ['Акробатика', 'Гимнастика'],
    ['Жонглирование', 'Эквилибристика'],
    ['Клоунада', 'Пантомима'],
    ['Дрессировка', 'Животные'],
    ['Иллюзии', 'Магия'],
    ['Воздушная гимнастика', 'Трапеция']
  ];

  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomCategories = categoriesPool[Math.floor(Math.random() * categoriesPool.length)];
  
  const showDate = new Date();
  showDate.setDate(showDate.getDate() + Math.floor(Math.random() * 180) + 30);

  return {
    title: `${randomTitle} ${Math.floor(Math.random() * 100)}`,
    performerId: Math.floor(Math.random() * 10) + 1,
    showDate: showDate.toISOString(),
    duration: [60, 75, 90, 100, 120][Math.floor(Math.random() * 5)],
    price: Math.floor(Math.random() * 2000) + 800,
    availableSeats: Math.floor(Math.random() * 500) + 50,
    isSoldOut: Math.random() > 0.8,
    categories: randomCategories,
    ageRestriction: [0, 3, 6, 10, 12][Math.floor(Math.random() * 5)],
    hasAnimals: Math.random() > 0.6,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    description: `Незабываемое цирковое представление ${randomTitle.toLowerCase()}`
  };
}

const showsController = {
  // GET /shows - получить все представления
  getAll(req, res) {
    try {
      const shows = showsDB.read();
      res.json({
        success: true,
        count: shows.length,
        data: shows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch shows',
        message: error.message
      });
    }
  },

  // GET /shows/:id - получить представление по ID
  getById(req, res) {
    try {
      const show = showsDB.findById(req.params.id);
      
      if (!show) {
        return res.status(404).json({
          success: false,
          error: 'Show not found'
        });
      }

      res.json({
        success: true,
        data: show
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch show',
        message: error.message
      });
    }
  },

  // POST /shows - создать новое представление
  create(req, res) {
    try {
      let newShow;

      if (Object.keys(req.body).length === 0) {
        newShow = generateRandomShow();
      } else {
        const requiredFields = ['title', 'showDate', 'duration', 'price'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            fields: missingFields
          });
        }

        newShow = {
          title: req.body.title,
          performerId: req.body.performerId || null,
          showDate: req.body.showDate,
          duration: Number(req.body.duration),
          price: Number(req.body.price),
          availableSeats: Number(req.body.availableSeats) || 0,
          isSoldOut: Boolean(req.body.isSoldOut) || false,
          categories: Array.isArray(req.body.categories) ? req.body.categories : [],
          ageRestriction: Number(req.body.ageRestriction) || 0,
          hasAnimals: Boolean(req.body.hasAnimals),
          rating: Number(req.body.rating) || 0,
          description: req.body.description || ''
        };
      }

      const created = showsDB.create(newShow);

      res.status(201).json({
        success: true,
        message: 'Show created successfully',
        data: created
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create show',
        message: error.message
      });
    }
  },

  // PUT /shows/:id - полное обновление представления
  update(req, res) {
    try {
      const existingShow = showsDB.findById(req.params.id);
      
      if (!existingShow) {
        return res.status(404).json({
          success: false,
          error: 'Show not found'
        });
      }

      let updatedData;

      if (Object.keys(req.body).length === 0) {
        updatedData = generateRandomShow();
      } else {
        updatedData = {
          title: req.body.title,
          performerId: req.body.performerId,
          showDate: req.body.showDate,
          duration: Number(req.body.duration),
          price: Number(req.body.price),
          availableSeats: Number(req.body.availableSeats),
          isSoldOut: Boolean(req.body.isSoldOut),
          categories: Array.isArray(req.body.categories) ? req.body.categories : [],
          ageRestriction: Number(req.body.ageRestriction),
          hasAnimals: Boolean(req.body.hasAnimals),
          rating: Number(req.body.rating),
          description: req.body.description || ''
        };
      }

      const updated = showsDB.update(req.params.id, updatedData);

      res.json({
        success: true,
        message: 'Show updated successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update show',
        message: error.message
      });
    }
  },

  // PATCH /shows/:id - частичное обновление представления (не идемпотентное)
  patch(req, res) {
    try {
      const existingShow = showsDB.findById(req.params.id);
      
      if (!existingShow) {
        return res.status(404).json({
          success: false,
          error: 'Show not found'
        });
      }

      const updates = { ...req.body };
      
      
      if (updates.availableSeats !== undefined) {
        updates.availableSeats = existingShow.availableSeats + Number(updates.availableSeats);
        
        if (updates.availableSeats < 0) {
          updates.availableSeats = 0;
        }
        
        
        if (updates.availableSeats === 0) {
          updates.isSoldOut = true;
        } else if (existingShow.availableSeats === 0 && updates.availableSeats > 0) {
          updates.isSoldOut = false;
        }
      }

      
      if (updates.categories && Array.isArray(updates.categories)) {
        updates.categories = [...new Set([...existingShow.categories, ...updates.categories])];
      }

      const patched = showsDB.patch(req.params.id, updates);

      res.json({
        success: true,
        message: 'Show patched successfully (non-idempotent operation)',
        data: patched,
        note: 'availableSeats changed relatively, categories were merged, isSoldOut auto-updated'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to patch show',
        message: error.message
      });
    }
  },

  // DELETE /shows/:id - удалить представление
  delete(req, res) {
    try {
      const deleted = showsDB.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Show not found'
        });
      }

      res.json({
        success: true,
        message: 'Show deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete show',
        message: error.message
      });
    }
  }
};

module.exports = showsController;
