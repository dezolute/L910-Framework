const FileManager = require('../../.lib/utils/fileManager');
const productsDB = new FileManager('cosmetics-store', 'products.json');


function generateRandomProduct() {
  const names = [
    'Крем для лица',
    'Сыворотка',
    'Тональный крем',
    'Помада',
    'Шампунь',
    'Кондиционер',
    'Маска для лица',
    'Скраб для тела'
  ];
  
  const categories = [
    'Уход за лицом',
    'Макияж',
    'Уход за волосами',
    'Уход за телом',
    'Парфюмерия'
  ];

  const ingredientsPool = [
    'Гиалуроновая кислота',
    'Витамин C',
    'Ретинол',
    'Коллаген',
    'Алоэ вера',
    'Масло ши',
    'Пантенол',
    'Ниацинамид',
    'Керамиды',
    'Пептиды'
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  
  const ingredientsCount = Math.floor(Math.random() * 3) + 3;
  const shuffled = [...ingredientsPool].sort(() => 0.5 - Math.random());
  const randomIngredients = shuffled.slice(0, ingredientsCount);
  
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + Math.floor(Math.random() * 3) + 1);

  return {
    name: `${randomName} ${Math.floor(Math.random() * 100)}`,
    brandId: Math.floor(Math.random() * 10) + 1,
    category: randomCategory,
    price: Math.floor(Math.random() * 5000) + 500,
    stock: Math.floor(Math.random() * 100),
    isAvailable: Math.random() > 0.2,
    expiryDate: futureDate.toISOString(),
    ingredients: randomIngredients,
    volume: [30, 50, 100, 150, 250][Math.floor(Math.random() * 5)],
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    description: `Качественный ${randomName.toLowerCase()} от проверенного производителя`
  };
}

const productsController = {
  // GET /products - получить все продукты
  getAll(req, res) {
    try {
      const products = productsDB.read();
      res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        message: error.message
      });
    }
  },

  // GET /products/:id - получить продукт по ID
  getById(req, res) {
    try {
      const product = productsDB.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        message: error.message
      });
    }
  },

  // POST /products - создать новый продукт
  create(req, res) {
    try {
      let newProduct;

      if (Object.keys(req.body).length === 0) {
        newProduct = generateRandomProduct();
      } else {
        const requiredFields = ['name', 'category', 'price'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            fields: missingFields
          });
        }

        newProduct = {
          name: req.body.name,
          brandId: req.body.brandId || null,
          category: req.body.category,
          price: Number(req.body.price),
          stock: Number(req.body.stock) || 0,
          isAvailable: Boolean(req.body.isAvailable) !== false,
          expiryDate: req.body.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          ingredients: Array.isArray(req.body.ingredients) ? req.body.ingredients : [],
          volume: Number(req.body.volume) || 0,
          rating: Number(req.body.rating) || 0,
          description: req.body.description || ''
        };
      }

      const created = productsDB.create(newProduct);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: created
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        message: error.message
      });
    }
  },

  // PUT /products/:id - полное обновление продукта
  update(req, res) {
    try {
      const existingProduct = productsDB.findById(req.params.id);
      
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      let updatedData;

      if (Object.keys(req.body).length === 0) {
        updatedData = generateRandomProduct();
      } else {
        updatedData = {
          name: req.body.name,
          brandId: req.body.brandId,
          category: req.body.category,
          price: Number(req.body.price),
          stock: Number(req.body.stock),
          isAvailable: Boolean(req.body.isAvailable),
          expiryDate: req.body.expiryDate,
          ingredients: Array.isArray(req.body.ingredients) ? req.body.ingredients : [],
          volume: Number(req.body.volume),
          rating: Number(req.body.rating),
          description: req.body.description || ''
        };
      }

      const updated = productsDB.update(req.params.id, updatedData);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updated
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update product',
        message: error.message
      });
    }
  },

  // PATCH /products/:id - частичное обновление продукта (не идемпотентное)
  patch(req, res) {
    try {
      const existingProduct = productsDB.findById(req.params.id);
      
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      const updates = { ...req.body };
      
      
      if (updates.stock !== undefined) {
        updates.stock = existingProduct.stock + Number(updates.stock);
        
        if (updates.stock < 0) {
          updates.stock = 0;
        }
        
        
        if (updates.stock === 0) {
          updates.isAvailable = false;
        } else if (updates.stock > 0 && existingProduct.stock === 0) {
          updates.isAvailable = true;
        }
      }

      
      if (updates.ingredients && Array.isArray(updates.ingredients)) {
        updates.ingredients = [...new Set([...existingProduct.ingredients, ...updates.ingredients])];
      }

      const patched = productsDB.patch(req.params.id, updates);

      res.json({
        success: true,
        message: 'Product patched successfully (non-idempotent operation)',
        data: patched,
        note: 'stock changed relatively, ingredients were merged, availability auto-updated'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to patch product',
        message: error.message
      });
    }
  },

  // DELETE /products/:id - удалить продукт
  delete(req, res) {
    try {
      const deleted = productsDB.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete product',
        message: error.message
      });
    }
  }
};

module.exports = productsController;
