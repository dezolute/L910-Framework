const FileManager = require('../../.lib/utils/fileManager');
const toursDB = new FileManager('travel-agency', 'tours.json');


function generateRandomTour() {
  const destinations = [
    'Париж, Франция',
    'Барселона, Испания',
    'Дубай, ОАЭ',
    'Мальдивы',
    'Бали, Индонезия',
    'Прага, Чехия'
  ];
  
  const titles = [
    'Летний отпуск',
    'Выходные в',
    'Путешествие в',
    'Экскурсионный тур',
    'Пляжный рай'
  ];

  const services = [
    ['Перелет', 'Проживание', 'Завтраки'],
    ['Перелет', 'Трансфер', 'Экскурсии', 'Питание'],
    ['Проживание', 'Завтраки', 'Страховка'],
    ['Перелет', 'Проживание', 'Полный пансион', 'Экскурсии']
  ];

  const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomServices = services[Math.floor(Math.random() * services.length)];
  
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + Math.floor(Math.random() * 180) + 30);
  
  const duration = Math.floor(Math.random() * 14) + 3;
  const returnDate = new Date(departureDate);
  returnDate.setDate(returnDate.getDate() + duration);

  return {
    title: `${randomTitle} ${randomDestination.split(',')[0]}`,
    destination: randomDestination,
    hotelId: Math.floor(Math.random() * 10) + 1,
    departureDate: departureDate.toISOString(),
    returnDate: returnDate.toISOString(),
    price: Math.floor(Math.random() * 150000) + 30000,
    availableSeats: Math.floor(Math.random() * 30) + 5,
    isAvailable: Math.random() > 0.2,
    includedServices: randomServices,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    duration: duration,
    description: `Увлекательное путешествие в ${randomDestination}`
  };
}

const toursController = {
  // GET /tours - получить все туры
  getAll(req, res) {
    try {
      const tours = toursDB.read();
      res.json({
        success: true,
        count: tours.length,
        data: tours
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tours',
        message: error.message
      });
    }
  },

  // GET /tours/:id - получить тур по ID
  getById(req, res) {
    try {
      const tour = toursDB.findById(req.params.id);
      
      if (!tour) {
        return res.status(404).json({
          success: false,
          error: 'Tour not found'
        });
      }

      res.json({
        success: true,
        data: tour
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tour',
        message: error.message
      });
    }
  },

  // POST /tours - создать новый тур
  create(req, res) {
    try {
      let newTour;

      if (Object.keys(req.body).length === 0) {
        newTour = generateRandomTour();
      } else {
        const requiredFields = ['title', 'destination', 'departureDate', 'returnDate', 'price'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            fields: missingFields
          });
        }

        newTour = {
          title: req.body.title,
          destination: req.body.destination,
          hotelId: req.body.hotelId || null,
          departureDate: req.body.departureDate,
          returnDate: req.body.returnDate,
          price: Number(req.body.price),
          availableSeats: Number(req.body.availableSeats) || 0,
          isAvailable: Boolean(req.body.isAvailable) !== false,
          includedServices: Array.isArray(req.body.includedServices) ? req.body.includedServices : [],
          rating: Number(req.body.rating) || 0,
          duration: Number(req.body.duration) || 0,
          description: req.body.description || ''
        };
      }

      const created = toursDB.create(newTour);

      res.status(201).json({
        success: true,
        message: 'Tour created successfully',
        data: created
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create tour',
        message: error.message
      });
    }
  },

  // PUT /tours/:id - полное обновление тура
  update(req, res) {
    try {
      const existingTour = toursDB.findById(req.params.id);
      
      if (!existingTour) {
        return res.status(404).json({
          success: false,
          error: 'Tour not found'
        });
      }

      let updatedData;

      if (Object.keys(req.body).length === 0) {
        updatedData = generateRandomTour();
      } else {
        updatedData = {
          title: req.body.title,
          destination: req.body.destination,
          hotelId: req.body.hotelId,
          departureDate: req.body.departureDate,
          returnDate: req.body.returnDate,
          price: Number(req.body.price),
          availableSeats: Number(req.body.availableSeats),
          isAvailable: Boolean(req.body.isAvailable),
          includedServices: Array.isArray(req.body.includedServices) ? req.body.includedServices : [],
          rating: Number(req.body.rating),
          duration: Number(req.body.duration),
          description: req.body.description || ''
        };
      }

      const updated = toursDB.update(req.params.id, updatedData);

      res.json({
        success: true,
        message: 'Tour updated successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update tour',
        message: error.message
      });
    }
  },

  // PATCH /tours/:id - частичное обновление тура (не идемпотентное)
  patch(req, res) {
    try {
      const existingTour = toursDB.findById(req.params.id);
      
      if (!existingTour) {
        return res.status(404).json({
          success: false,
          error: 'Tour not found'
        });
      }

      const updates = { ...req.body };
      
      
      if (updates.availableSeats !== undefined) {
        updates.availableSeats = existingTour.availableSeats + Number(updates.availableSeats);
        
        if (updates.availableSeats < 0) {
          updates.availableSeats = 0;
          updates.isAvailable = false;
        }
      }

      
      if (updates.includedServices && Array.isArray(updates.includedServices)) {
        updates.includedServices = [...new Set([...existingTour.includedServices, ...updates.includedServices])];
      }

      const patched = toursDB.patch(req.params.id, updates);

      res.json({
        success: true,
        message: 'Tour patched successfully (non-idempotent operation)',
        data: patched,
        note: 'availableSeats changed relatively, services were merged'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to patch tour',
        message: error.message
      });
    }
  },

  // DELETE /tours/:id - удалить тур
  delete(req, res) {
    try {
      const deleted = toursDB.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Tour not found'
        });
      }

      res.json({
        success: true,
        message: 'Tour deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete tour',
        message: error.message
      });
    }
  }
};

module.exports = toursController;