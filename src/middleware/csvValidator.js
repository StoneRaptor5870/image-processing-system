const csv = require('csv-parser');
const fs = require('fs');

module.exports = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const filePath = req.file.path;
  const results = [];
  let hasError = false;
  let errorMessage = '';
  let rowCount = 0;

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          rowCount++;
          
          const requiredColumns = ['S. No.', 'Product Name', 'Input Image Urls'];
          const missingColumns = requiredColumns.filter(column => !Object.keys(data).includes(column));
          
          if (missingColumns.length > 0) {
            hasError = true;
            errorMessage = `Missing required columns: ${missingColumns.join(', ')}`;
            reject(new Error(errorMessage));
            return;
          }
          
          if (isNaN(Number(data['S. No.']))) {
            hasError = true;
            errorMessage = `Invalid Serial Number at row ${rowCount}`;
            reject(new Error(errorMessage));
            return;
          }
          
          if (!data['Product Name'] || data['Product Name'].trim() === '') {
            hasError = true;
            errorMessage = `Empty Product Name at row ${rowCount}`;
            reject(new Error(errorMessage));
            return;
          }
          
          if (!data['Input Image Urls'] || data['Input Image Urls'].trim() === '') {
            hasError = true;
            errorMessage = `Empty Input Image Urls at row ${rowCount}`;
            reject(new Error(errorMessage));
            return;
          }
          
          const urls = data['Input Image Urls'].split(',').map(url => url.trim());
          const invalidUrls = urls.filter(url => !url.startsWith('http'));
          
          if (invalidUrls.length > 0) {
            hasError = true;
            errorMessage = `Invalid URLs at row ${rowCount}: ${invalidUrls.join(', ')}`;
            reject(new Error(errorMessage));
            return;
          }
          
          results.push(data);
        })
        .on('end', () => {
          if (results.length === 0) {
            hasError = true;
            errorMessage = 'CSV file is empty';
            reject(new Error(errorMessage));
            return;
          }
          resolve();
        })
        .on('error', (error) => {
          hasError = true;
          errorMessage = `Error parsing CSV: ${error.message}`;
          reject(new Error(errorMessage));
        });
    });
    
    if (hasError) {
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    next();
  } catch (error) {
    fs.unlinkSync(filePath);
    
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};