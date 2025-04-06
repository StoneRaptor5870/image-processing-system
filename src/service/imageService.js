const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

exports.processImage = async (imageUrl, outputDir, requestId, productName, index) => {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer'
    });

    const foldername = `${requestId}`;
    const filename = `${requestId}-${productName.replace(/\s+/g, '-')}-${index}.jpg`;
    const outputPath = path.join(outputDir, filename);

    await sharp(response.data)
      .jpeg({ quality: 50 })
      .toFile(outputPath);

    // image url path is local right now
    const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
    const imageUrlPath = `${baseUrl}/processed/${foldername}/${filename}`;

    return imageUrlPath;
  } catch (error) {
    console.error(`Error processing image ${imageUrl}:`, error);
    throw error;
  }
};