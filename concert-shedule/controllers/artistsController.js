const FileManager = require('../../.lib/utils/fileManager');
const artistsDB = new FileManager('concert-shedule', 'artists.json');

function generateRandomArtist() {
  const names = ['The Rockers', 'Jazz Masters', 'Pop Stars', 'Electronic Wizards', 'Classical Ensemble'];
  const countries = ['USA', 'UK', 'Germany', 'France', 'Russia'];
  const genres = ['Rock', 'Jazz', 'Pop', 'Electronic', 'Classical'];
  const albumPrefixes = ['Greatest Hits', 'Live at', 'The Best of', 'Legacy', 'Collection'];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  const randomGenre = genres[Math.floor(Math.random() * genres.length)];
  
  const albums = [];
  const albumCount = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < albumCount; i++) {
    albums.push(`${albumPrefixes[Math.floor(Math.random() * albumPrefixes.length)]} ${i + 1}`);
  }

  return {
    name: `${randomName} ${Math.floor(Math.random() * 100)}`,
    country: randomCountry,
    genre: randomGenre,
    foundedYear: Math.floor(Math.random() * (2024 - 1960)) + 1960,
    isActive: Math.random() > 0.2,
    memberCount: Math.floor(Math.random() * 10) + 1,
    albums: albums,
    biography: `Famous ${randomGenre} artist from ${randomCountry}`
  };
}

const artistsController = {
  // GET /artists - получить всех артистов
  getAll(req, res) {
    try {
      const artists = artistsDB.read();
      res.json({
        success: true,
        count: artists.length,
        data: artists
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch artists',
        message: error.message
      });
    }
  },

  // GET /artists/:id - получить артиста по ID
  getById(req, res) {
    try {
      const artist = artistsDB.findById(req.params.id);
      
      if (!artist) {
        return res.status(404).json({
          success: false,
          error: 'Artist not found'
        });
      }

      res.json({
        success: true,
        data: artist
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch artist',
        message: error.message
      });
    }
  },

  // POST /artists - создать нового артиста
  create(req, res) {
    try {
      let newArtist;

      if (Object.keys(req.body).length === 0) {
        newArtist = generateRandomArtist();
      } else {
        const requiredFields = ['name', 'country', 'genre'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            fields: missingFields
          });
        }

        newArtist = {
          name: req.body.name,
          country: req.body.country,
          genre: req.body.genre,
          foundedYear: Number(req.body.foundedYear) || new Date().getFullYear(),
          isActive: Boolean(req.body.isActive) !== false,
          memberCount: Number(req.body.memberCount) || 1,
          albums: Array.isArray(req.body.albums) ? req.body.albums : [],
          biography: req.body.biography || ''
        };
      }

      const created = artistsDB.create(newArtist);

      res.status(201).json({
        success: true,
        message: 'Artist created successfully',
        data: created
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create artist',
        message: error.message
      });
    }
  },

  // PUT /artists/:id - полное обновление артиста
  update(req, res) {
    try {
      const existingArtist = artistsDB.findById(req.params.id);
      
      if (!existingArtist) {
        return res.status(404).json({
          success: false,
          error: 'Artist not found'
        });
      }

      let updatedData;

      if (Object.keys(req.body).length === 0) {
        updatedData = generateRandomArtist();
      } else {
        updatedData = {
          name: req.body.name,
          country: req.body.country,
          genre: req.body.genre,
          foundedYear: Number(req.body.foundedYear),
          isActive: Boolean(req.body.isActive),
          memberCount: Number(req.body.memberCount),
          albums: Array.isArray(req.body.albums) ? req.body.albums : [],
          biography: req.body.biography || ''
        };
      }

      const updated = artistsDB.update(req.params.id, updatedData);

      res.json({
        success: true,
        message: 'Artist updated successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update artist',
        message: error.message
      });
    }
  },

  // PATCH /artists/:id - частичное обновление артиста (не идемпотентное)
  patch(req, res) {
    try {
      const existingArtist = artistsDB.findById(req.params.id);
      
      if (!existingArtist) {
        return res.status(404).json({
          success: false,
          error: 'Artist not found'
        });
      }

      const updates = { ...req.body };
    
      if (updates.memberCount !== undefined) {
        updates.memberCount = existingArtist.memberCount + Number(updates.memberCount);
        if (updates.memberCount < 0) updates.memberCount = 0;
      }

      if (updates.albums && Array.isArray(updates.albums)) {
        updates.albums = [...existingArtist.albums, ...updates.albums];
      }

      const patched = artistsDB.patch(req.params.id, updates);

      res.json({
        success: true,
        message: 'Artist patched successfully (non-idempotent operation)',
        data: patched,
        note: 'memberCount changed relatively, albums were appended'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to patch artist',
        message: error.message
      });
    }
  },

  // DELETE /artists/:id - удалить артиста
  delete(req, res) {
    try {
      const deleted = artistsDB.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Artist not found'
        });
      }

      res.json({
        success: true,
        message: 'Artist deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete artist',
        message: error.message
      });
    }
  }
};

module.exports = artistsController;