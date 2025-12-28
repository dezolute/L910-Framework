const fs = require('fs');
const path = require('path');

class FileManager {
  constructor(service, filename) {
    this.filepath = path.join(__dirname, '..', '..', service, 'data', filename);
  }

  
  read() {
    try {
      const data = fs.readFileSync(this.filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading file ${this.filepath}:`, error.message);
      return [];
    }
  }

  
  write(data) {
    try {
      fs.writeFileSync(
        this.filepath,
        JSON.stringify(data, null, 2),
        'utf8'
      );
      return true;
    } catch (error) {
      console.error(`Error writing file ${this.filepath}:`, error.message);
      return false;
    }
  }

  
  getNextId() {
    const data = this.read();
    if (data.length === 0) return 1;
    const maxId = Math.max(...data.map(item => item.id));
    return maxId + 1;
  }

  
  findById(id) {
    const data = this.read();
    return data.find(item => item.id === parseInt(id));
  }

  
  create(newItem) {
    const data = this.read();
    newItem.id = this.getNextId();
    data.push(newItem);
    this.write(data);
    return newItem;
  }

  
  update(id, updatedItem) {
    const data = this.read();
    const index = data.findIndex(item => item.id === parseInt(id));
    
    if (index === -1) return null;
    
    updatedItem.id = parseInt(id);
    data[index] = updatedItem;
    this.write(data);
    return updatedItem;
  }

  
  patch(id, updates) {
    const data = this.read();
    const index = data.findIndex(item => item.id === parseInt(id));
    
    if (index === -1) return null;
    
    
    data[index] = { ...data[index], ...updates, id: parseInt(id) };
    this.write(data);
    return data[index];
  }

  
  delete(id) {
    const data = this.read();
    const filteredData = data.filter(item => item.id !== parseInt(id));
    
    if (filteredData.length === data.length) return false;
    
    this.write(filteredData);
    return true;
  }
}

module.exports = FileManager;