const FileManager = require('../../.lib/utils/fileManager');
const performersDB = new FileManager('circus', 'performers.json');


function generateRandomPerformer() {
  const names = [
    'Иван Храбрый',
    'Мария Грациозная',
    'Петр Веселый',
    'Елена Летающая',
    'Дмитрий Сильный',
    'Ольга Гибкая'
  ];
  
  const specialties = [
    'Акробат',
    'Жонглер',
    'Клоун',
    'Иллюзионист',
    'Воздушный гимнаст',
    'Укротитель',
    'Эквилибрист'
  ];
  
  const countries = ['Россия', 'Франция', 'Италия', 'Китай', 'США', 'Германия'];
  
  const awardsPool = [
    'Золотой клоун',
    'Мастер циркового искусства',
    'Приз зрительских симпатий',
    'Лучший номер года',
    'Серебряный лев',
    'Гран-при фестиваля'
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  
  
  const awardsCount = Math.floor(Math.random() * 4) + 1;
  const shuffled = [...awardsPool].sort(() => 0.5 - Math.random());
  const randomAwards = shuffled.slice(0, awardsCount);

  return {
    name: `${randomName} ${Math.floor(Math.random() * 100)}`,
    specialty: randomSpecialty,
    country: randomCountry,
    experienceYears: Math.floor(Math.random() * 25) + 3,
    isActive: Math.random() > 0.1,
    hasInternationalAwards: Math.random() > 0.4,
    awards: randomAwards,
    teamSize: Math.floor(Math.random() * 10) + 1,
    salary: Math.floor(Math.random() * 400000) + 100000,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    biography: `Талантливый ${randomSpecialty.toLowerCase()} из ${randomCountry}`
  };
}

const performersController = {
  // GET /performers
  getAll(req, res) {
    try {
      const performers = performersDB.read();
      res.json({
        success: true,
        count: performers.length,
        data: performers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch performers',
        message: error.message
      });
    }
  },

  // GET /performers/:id
  getById(req, res) {
    try {
      const performer = performersDB.findById(req.params.id);
      
      if (!performer) {
        return res.status(404).json({
          success: false,
          error: 'Performer not found'
        });
      }

      res.json({
        success: true,
        data: performer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch performer',
        message: error.message
      });
    }
  },

  // POST /performers
  create(req, res) {
    try {
      let newPerformer;

      if (Object.keys(req.body).length === 0) {
        newPerformer = generateRandomPerformer();
      } else {
        const requiredFields = ['name', 'specialty', 'country'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            fields: missingFields
          });
        }

        newPerformer = {
          name: req.body.name,
          specialty: req.body.specialty,
          country: req.body.country,
          experienceYears: Number(req.body.experienceYears) || 0,
          isActive: Boolean(req.body.isActive) !== false,
          hasInternationalAwards: Boolean(req.body.hasInternationalAwards),
          awards: Array.isArray(req.body.awards) ? req.body.awards : [],
          teamSize: Number(req.body.teamSize) || 1,
          salary: Number(req.body.salary) || 0,
          rating: Number(req.body.rating) || 0,
          biography: req.body.biography || ''
        };
      }

      const created = performersDB.create(newPerformer);

      res.status(201).json({
        success: true,
        message: 'Performer created successfully',
        data: created
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create performer',
        message: error.message
      });
    }
  },

  // PUT /performers/:id
  update(req, res) {
    try {
      const existingPerformer = performersDB.findById(req.params.id);
      
      if (!existingPerformer) {
        return res.status(404).json({
          success: false,
          error: 'Performer not found'
        });
      }

      let updatedData;

      if (Object.keys(req.body).length === 0) {
        updatedData = generateRandomPerformer();
      } else {
        updatedData = {
          name: req.body.name,
          specialty: req.body.specialty,
          country: req.body.country,
          experienceYears: Number(req.body.experienceYears),
          isActive: Boolean(req.body.isActive),
          hasInternationalAwards: Boolean(req.body.hasInternationalAwards),
          awards: Array.isArray(req.body.awards) ? req.body.awards : [],
          teamSize: Number(req.body.teamSize),
          salary: Number(req.body.salary),
          rating: Number(req.body.rating),
          biography: req.body.biography || ''
        };
      }

      const updated = performersDB.update(req.params.id, updatedData);

      res.json({
        success: true,
        message: 'Performer updated successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update performer',
        message: error.message
      });
    }
  },

  // PATCH /performers/:id (не идемпотентное)
  patch(req, res) {
    try {
      const existingPerformer = performersDB.findById(req.params.id);
      
      if (!existingPerformer) {
        return res.status(404).json({
          success: false,
          error: 'Performer not found'
        });
      }

      const updates = { ...req.body };
      
      
      if (updates.teamSize !== undefined) {
        updates.teamSize = existingPerformer.teamSize + Number(updates.teamSize);
        if (updates.teamSize < 1) updates.teamSize = 1;
      }

      
      if (updates.experienceYears !== undefined) {
        updates.experienceYears = existingPerformer.experienceYears + Number(updates.experienceYears);
        if (updates.experienceYears < 0) updates.experienceYears = 0;
      }

      
      if (updates.awards && Array.isArray(updates.awards)) {
        updates.awards = [...new Set([...existingPerformer.awards, ...updates.awards])];
        
        
        if (updates.awards.length > 0) {
          updates.hasInternationalAwards = true;
        }
      }

      const patched = performersDB.patch(req.params.id, updates);

      res.json({
        success: true,
        message: 'Performer patched successfully (non-idempotent operation)',
        data: patched,
        note: 'teamSize and experienceYears changed relatively, awards were merged'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to patch performer',
        message: error.message
      });
    }
  },

  // DELETE /performers/:id
  delete(req, res) {
    try {
      const deleted = performersDB.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Performer not found'
        });
      }

      res.json({
        success: true,
        message: 'Performer deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete performer',
        message: error.message
      });
    }
  }
};

module.exports = performersController;
