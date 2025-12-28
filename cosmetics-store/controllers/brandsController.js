const FileManager = require('../../.lib/utils/fileManager');
const brandsDB = new FileManager('cosmetics-store', 'brands.json');


function generateRandomBrand() {
  const names = [
    'Luxe Beauty',
    'Pure Essence',
    'Crystal Glow',
    'Natural Charm',
    'Elite Cosmetics',
    'Silk Touch',
    'Golden Rose'
  ];
  
  const countries = [
    'Франция',
    'Италия',
    'Южная Корея',
    'Япония',
    'США',
    'Германия',
    'Швейцария'
  ];

  const certificationsPool = [
    'ISO 9001',
    'GMP',
    'ECOCERT',
    'COSMOS',
    'Cruelty-Free',
    'Vegan Society',
    'Dermatologically tested',
    'Organic'
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  
  
  const certsCount = Math.floor(Math.random() * 3) + 2;
  const shuffled = [...certificationsPool].sort(() => 0.5 - Math.random());
  const randomCertifications = shuffled.slice(0, certsCount);

  return {
    name: `${randomName} ${Math.floor(Math.random() * 100)}`,
    country: randomCountry,
    foundedYear: Math.floor(Math.random() * (2024 - 1950)) + 1950,
    isOrganic: Math.random() > 0.5,
    hasCrueltyFree: Math.random() > 0.3,
    certifications: randomCertifications,
    productCount: Math.floor(Math.random() * 200) + 10,
    website: `https://${randomName.toLowerCase().replace(/\s/g, '')}.com`,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    description: `Качественная косметика от ${randomName}`
  };
}

const brandsController = {
  // GET /brands
  getAll(req, res) {
    try {
      const brands = brandsDB.read();
      res.json({
        success: true,
        count: brands.length,
        data: brands
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch brands',
        message: error.message
      });
    }
  },

  // GET /brands/:id
  getById(req, res) {
    try {
      const brand = brandsDB.findById(req.params.id);
      
      if (!brand) {
        return res.status(404).json({
          success: false,
          error: 'Brand not found'
        });
      }

      res.json({
        success: true,
        data: brand
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch brand',
        message: error.message
      });
    }
  },

  // POST /brands
  create(req, res) {
    try {
      let newBrand;

      if (Object.keys(req.body).length === 0) {
        newBrand = generateRandomBrand();
      } else {
        const requiredFields = ['name', 'country'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            fields: missingFields
          });
        }

        newBrand = {
          name: req.body.name,
          country: req.body.country,
          foundedYear: Number(req.body.foundedYear) || new Date().getFullYear(),
          isOrganic: Boolean(req.body.isOrganic),
          hasCrueltyFree: Boolean(req.body.hasCrueltyFree) !== false,
          certifications: Array.isArray(req.body.certifications) ? req.body.certifications : [],
          productCount: Number(req.body.productCount) || 0,
          website: req.body.website || '',
          rating: Number(req.body.rating) || 0,
          description: req.body.description || ''
        };
      }

      const created = brandsDB.create(newBrand);

      res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        data: created
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create brand',
        message: error.message
      });
    }
  },

  // PUT /brands/:id
  update(req, res) {
    try {
      const existingBrand = brandsDB.findById(req.params.id);
      
      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          error: 'Brand not found'
        });
      }

      let updatedData;

      if (Object.keys(req.body).length === 0) {
        updatedData = generateRandomBrand();
      } else {
        updatedData = {
          name: req.body.name,
          country: req.body.country,
          foundedYear: Number(req.body.foundedYear),
          isOrganic: Boolean(req.body.isOrganic),
          hasCrueltyFree: Boolean(req.body.hasCrueltyFree),
          certifications: Array.isArray(req.body.certifications) ? req.body.certifications : [],
          productCount: Number(req.body.productCount),
          website: req.body.website || '',
          rating: Number(req.body.rating),
          description: req.body.description || ''
        };
      }

      const updated = brandsDB.update(req.params.id, updatedData);

      res.json({
        success: true,
        message: 'Brand updated successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update brand',
        message: error.message
      });
    }
  },

  // PATCH /brands/:id (не идемпотентное)
  patch(req, res) {
    try {
      const existingBrand = brandsDB.findById(req.params.id);
      
      if (!existingBrand) {
        return res.status(404).json({
          success: false,
          error: 'Brand not found'
        });
      }

      const updates = { ...req.body };
      
      
      if (updates.productCount !== undefined) {
        updates.productCount = existingBrand.productCount + Number(updates.productCount);
        if (updates.productCount < 0) updates.productCount = 0;
      }

      
      if (updates.certifications && Array.isArray(updates.certifications)) {
        updates.certifications = [...new Set([...existingBrand.certifications, ...updates.certifications])];
      }

      const patched = brandsDB.patch(req.params.id, updates);

      res.json({
        success: true,
        message: 'Brand patched successfully (non-idempotent operation)',
        data: patched,
        note: 'productCount changed relatively, certifications were merged'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to patch brand',
        message: error.message
      });
    }
  },

  // DELETE /brands/:id
  delete(req, res) {
    try {
      const deleted = brandsDB.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Brand not found'
        });
      }

      res.json({
        success: true,
        message: 'Brand deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete brand',
        message: error.message
      });
    }
  }
};

module.exports = brandsController;
