const FileManager = require('../../.lib/utils/fileManager');
const hotelsDB = new FileManager('travel-agency', 'hotels.json');


function generateRandomHotel() {
  const names = [
    'Grand Palace Hotel',
    'Seaside Resort',
    'Mountain View Lodge',
    'City Center Inn',
    'Luxury Suites'
  ];
  
  const countries = ['Россия', 'Турция', 'Греция', 'Испания', 'Италия', 'Франция'];
  const cities = ['Москва', 'Анталья', 'Афины', 'Барселона', 'Рим', 'Париж'];
  
  const amenitiesOptions = [
    ['Бассейн', 'Ресторан', 'WiFi'],
    ['Спа', 'Фитнес', 'Бар', 'Парковка'],
    ['Конференц-зал', 'Ресторан', 'Бассейн', 'WiFi'],
    ['Пляж', 'Бассейн', 'Спа', 'Ресторан', 'Бар']
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const countryIndex = Math.floor(Math.random() * countries.length);
  const randomAmenities = amenitiesOptions[Math.floor(Math.random() * amenitiesOptions.length)];

  return {
    name: `${randomName} ${Math.floor(Math.random() * 100)}`,
    country: countries[countryIndex],
    city: cities[countryIndex],
    address: `Street ${Math.floor(Math.random() * 200) + 1}`,
    stars: Math.floor(Math.random() * 3) + 3,
    hasPool: Math.random() > 0.3,
    hasWifi: Math.random() > 0.1,
    roomCount: Math.floor(Math.random() * 300) + 50,
    amenities: randomAmenities,
    pricePerNight: Math.floor(Math.random() * 15000) + 3000,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    description: `Comfortable hotel in ${cities[countryIndex]}`
  };
}

const hotelsController = {
  // GET /hotels
  getAll(req, res) {
    try {
      const hotels = hotelsDB.read();
      res.json({
        success: true,
        count: hotels.length,
        data: hotels
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch hotels',
        message: error.message
      });
    }
  },

  // GET /hotels/:id
  getById(req, res) {
    try {
      const hotel = hotelsDB.findById(req.params.id);
      
      if (!hotel) {
        return res.status(404).json({
          success: false,
          error: 'Hotel not found'
        });
      }

      res.json({
        success: true,
        data: hotel
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch hotel',
        message: error.message
      });
    }
  },

  // POST /hotels
  create(req, res) {
    try {
      let newHotel;

      if (Object.keys(req.body).length === 0) {
        newHotel = generateRandomHotel();
      } else {
        const requiredFields = ['name', 'country', 'city'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            fields: missingFields
          });
        }

        newHotel = {
          name: req.body.name,
          country: req.body.country,
          city: req.body.city,
          address: req.body.address || '',
          stars: Number(req.body.stars) || 3,
          hasPool: Boolean(req.body.hasPool),
          hasWifi: Boolean(req.body.hasWifi) !== false,
          roomCount: Number(req.body.roomCount) || 0,
          amenities: Array.isArray(req.body.amenities) ? req.body.amenities : [],
          pricePerNight: Number(req.body.pricePerNight) || 0,
          rating: Number(req.body.rating) || 0,
          description: req.body.description || ''
        };
      }

      const created = hotelsDB.create(newHotel);

      res.status(201).json({
        success: true,
        message: 'Hotel created successfully',
        data: created
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create hotel',
        message: error.message
      });
    }
  },

  // PUT /hotels/:id
  update(req, res) {
    try {
      const existingHotel = hotelsDB.findById(req.params.id);
      
      if (!existingHotel) {
        return res.status(404).json({
          success: false,
          error: 'Hotel not found'
        });
      }

      let updatedData;

      if (Object.keys(req.body).length === 0) {
        updatedData = generateRandomHotel();
      } else {
        updatedData = {
          name: req.body.name,
          country: req.body.country,
          city: req.body.city,
          address: req.body.address,
          stars: Number(req.body.stars),
          hasPool: Boolean(req.body.hasPool),
          hasWifi: Boolean(req.body.hasWifi),
          roomCount: Number(req.body.roomCount),
          amenities: Array.isArray(req.body.amenities) ? req.body.amenities : [],
          pricePerNight: Number(req.body.pricePerNight),
          rating: Number(req.body.rating),
          description: req.body.description || ''
        };
      }

      const updated = hotelsDB.update(req.params.id, updatedData);

      res.json({
        success: true,
        message: 'Hotel updated successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update hotel',
        message: error.message
      });
    }
  },

  // PATCH /hotels/:id (не идемпотентное)
  patch(req, res) {
    try {
      const existingHotel = hotelsDB.findById(req.params.id);
      
      if (!existingHotel) {
        return res.status(404).json({
          success: false,
          error: 'Hotel not found'
        });
      }

      const updates = { ...req.body };
      
      
      if (updates.roomCount !== undefined) {
        updates.roomCount = existingHotel.roomCount + Number(updates.roomCount);
        if (updates.roomCount < 0) updates.roomCount = 0;
      }

      
      if (updates.amenities && Array.isArray(updates.amenities)) {
        updates.amenities = [...new Set([...existingHotel.amenities, ...updates.amenities])];
      }

      const patched = hotelsDB.patch(req.params.id, updates);

      res.json({
        success: true,
        message: 'Hotel patched successfully (non-idempotent operation)',
        data: patched,
        note: 'roomCount changed relatively, amenities were merged'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to patch hotel',
        message: error.message
      });
    }
  },

  // DELETE /hotels/:id
  delete(req, res) {
    try {
      const deleted = hotelsDB.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Hotel not found'
        });
      }

      res.json({
        success: true,
        message: 'Hotel deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete hotel',
        message: error.message
      });
    }
  }
};

module.exports = hotelsController;