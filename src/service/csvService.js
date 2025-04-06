const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.parseCSV = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      
      try {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const products = [];
        const productMap = new Map(); // To group URLs by product
        
        // Process each line after headers
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          if (line.match(/^https?:\/\//)) {
            if (products.length > 0) {
              const lastProduct = products[products.length - 1];
              lastProduct.inputImageUrls.push(line.trim());
            }
          } else {
            const values = line.split(',').map(v => v.trim());
            
            // Create a new product if we have at least 3 fields (S.No, Name, URL)
            if (values.length >= 3) {
              const serialNumber = parseInt(values[0]);
              const productName = values[1];
              
              const urls = [];
              for (let j = 2; j < values.length; j++) {
                const value = values[j].trim();
                if (value.startsWith('http')) {
                  urls.push(value);
                }
              }
              
              const key = `${serialNumber}-${productName}`;
              if (productMap.has(key)) {
                const product = productMap.get(key);
                product.inputImageUrls.push(...urls);
              } else {
                const product = {
                  serialNumber,
                  productName,
                  inputImageUrls: urls
                };
                products.push(product);
                productMap.set(key, product);
              }
            }
          }
        }
        
        console.log("Final parsed products:", products);
        resolve(products);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        reject(error);
      }
    });
  });
};

exports.generateOutputCSV = async (requestId, products) => {
  const outputDir = path.join(__dirname, '../../', process.env.OUTPUT_DIR);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, `${requestId}-output.csv`);
  
  const csvWriter = createCsvWriter({
    path: outputPath,
    header: [
      { id: 'serialNumber', title: 'S. No.' },
      { id: 'productName', title: 'Product Name' },
      { id: 'inputImageUrls', title: 'Input Image Urls' },
      { id: 'outputImageUrls', title: 'Output Image Urls' }
    ]
  });
  
  const records = products.map(product => ({
    serialNumber: product.serialNumber,
    productName: product.productName,
    inputImageUrls: product.inputImageUrls.join(', '),
    outputImageUrls: product.outputImageUrls.join(', ')
  }));
  
  await csvWriter.writeRecords(records);
  
  return outputPath;
};