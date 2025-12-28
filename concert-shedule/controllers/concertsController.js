const FileManager = require('../../.lib/utils/fileManager');
const concertsDB = new FileManager('concert-shedule', 'concerts.json');


function generateRandomConcert() {
  const titles = [
    'Summer Music Fest',
    'Night of the Stars',
    'Urban Beats',
    'Classical Evening',
    'Pop Extravaganza'
  ];
  
  const venues = [
    'Olympic Stadium',
    'Arena Hall',
    'Concert Palace',
    'Open Air Theatre',
    'Music Club'
  ];
  
  const genres = [
    ['Rock', 'Alternative'],
    ['Pop', 'Dance'],
    ['Jazz', 'Soul'],
    ['Electronic', 'House'],
    ['Classical', 'Opera']
  ];

  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomVenue = venues[Math.floor(Math.random() * venues.length)];
  const randomGenres = genres[Math.floor(Math.random() * genres.length)];
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 365));

  return {
    title: `${randomTitle} ${Math.floor(Math.random() * 1000)}`,
    artistId: Math.floor(Math.random() * 10) + 1,
    venue: randomVenue,
    date: futureDate.toISOString(),
    price: Math.floor(Math.random() * 5000) + 500,
    availableTickets: Math.floor(Math.random() * 50000),
    isSoldOut: Math.random() > 0.7,
    genres: randomGenres,
    description: `Amazing concert at ${randomVenue}`
  };
}

const concertsController = {
  // GET /concerts - получить все концерты
  getAll(req, res) {
    try {
      const concerts = concertsDB.read();
      res.json({
        success: true,
        count: concerts.length,
        data: concerts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch concerts',
        message: error.message
      });
    }
  },

  // GET /concerts/:id - получить концерт по ID
  getById(req, res) {
    try {
      const concert = concertsDB.findById(req.params.id);
      
      if (!concert) {
        return res.status(404).json({
          success: false,
          error: 'Concert not found'
        });
      }

      res.json({
        success: true,
        data: concert
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch concert',
        message: error.message
      });
    }
  },

  // POST /concerts - создать новый концерт
  create(req, res) {
    try {
      let newConcert;

      if (Object.keys(req.body).length === 0) {
        newConcert = generateRandomConcert();
      } else {
        const requiredFields = ['title', 'venue', 'date', 'price'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            fields: missingFields
          });
        }

        newConcert = {
          title: req.body.title,
          artistId: req.body.artistId || null,
          venue: req.body.venue,
          date: req.body.date,
          price: Number(req.body.price),
          availableTickets: Number(req.body.availableTickets) || 0,
          isSoldOut: Boolean(req.body.isSoldOut) || false,
          genres: Array.isArray(req.body.genres) ? req.body.genres : [],
          description: req.body.description || ''
        };
      }

      const created = concertsDB.create(newConcert);

      res.status(201).json({
        success: true,
        message: 'Concert created successfully',
        data: created
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create concert',
        message: error.message
      });
    }
  },

  // PUT /concerts/:id - полное обновление концерта
  update(req, res) {
    try {
      const existingConcert = concertsDB.findById(req.params.id);
      
      if (!existingConcert) {
        return res.status(404).json({
          success: false,
          error: 'Concert not found'
        });
      }

      let updatedData;

      if (Object.keys(req.body).length === 0) {
        updatedData = generateRandomConcert();
      } else {
        updatedData = {
          title: req.body.title,
          artistId: req.body.artistId,
          venue: req.body.venue,
          date: req.body.date,
          price: Number(req.body.price),
          availableTickets: Number(req.body.availableTickets),
          isSoldOut: Boolean(req.body.isSoldOut),
          genres: Array.isArray(req.body.genres) ? req.body.genres : [],
          description: req.body.description || ''
        };
      }

      const updated = concertsDB.update(req.params.id, updatedData);

      res.json({
        success: true,
        message: 'Concert updated successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update concert',
        message: error.message
      });
    }
  },

  // PATCH /concerts/:id - частичное обновление концерта (не идемпотентное)
  patch(req, res) {
    try {
      const existingConcert = concertsDB.findById(req.params.id);
      
      if (!existingConcert) {
        return res.status(404).json({
          success: false,
          error: 'Concert not found'
        });
      }

      // PATCH не идемпотентный - изменяем availableTickets относительно
      const updates = { ...req.body };
      
      if (updates.availableTickets !== undefined) {
        updates.availableTickets = existingConcert.availableTickets + Number(updates.availableTickets);
        
        
        if (updates.availableTickets < 0) {
          updates.availableTickets = 0;
        }
      }
      
      if (updates.genres && Array.isArray(updates.genres)) {
        updates.genres = [...new Set([...existingConcert.genres, ...updates.genres])];
      }

      const patched = concertsDB.patch(req.params.id, updates);

      res.json({
        success: true,
        message: 'Concert patched successfully (non-idempotent operation)',
        data: patched,
        note: 'availableTickets changed relatively, genres were merged'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to patch concert',
        message: error.message
      });
    }
  },

  // DELETE /concerts/:id - удалить концерт
  delete(req, res) {
    try {
      const deleted = concertsDB.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Concert not found'
        });
      }

      res.json({
        success: true,
        message: 'Concert deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete concert',
        message: error.message
      });
    }
  }
};

module.exports = concertsController;
