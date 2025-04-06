# Image Processing System API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Upload CSV File
Upload a CSV file containing product and image information.

**URL**: `/upload`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`

**Request Body Parameters**:
| Parameter | Type   | Required | Description                      |
|-----------|--------|----------|----------------------------------|
| file      | File   | Yes      | CSV / TXT file to be processed   |

**Expected CSV Format**:
```
S. No.,Product Name,Input Image Urls
1,SKU1,https://www.public-image-url1.jpg,https://www.public-image-url2.jpg,https://www.public-image-url3.jpg
2,SKU2,https://www.public-image-url1.jpg,https://www.public-image-url2.jpg,https://www.public-image-url3.jpg
```

**Success Response**:
- **Code**: 200
- **Content**:
```json
{
  "success": true,
  "requestId": "13f5b378-1d34-4601-a8c3-5678bb1234cd",
  "message": "File uploaded successfully. Processing started."
}
```

**Error Responses**:
- **Bad Request (400)**:
```json
{
  "success": false,
  "message": "No file uploaded"
}
```
OR
```json
{
  "success": false,
  "message": "Only CSV and TXT files are allowed"
}
```
OR
```json
{
  "success": false,
  "message": "Missing required columns: Product Name, Input Image Urls"
}
```

- **Internal Server Error (500)**:
```json
{
  "success": false,
  "message": "An error occurred during file upload",
  "error": "Error message details"
}
```

### 2. Check Processing Status
Check the status of a previously submitted processing request.

**URL**: `/status/:requestId`  
**Method**: `GET`  
**URL Parameters**:
| Parameter | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| requestId | String | Yes      | ID returned from upload request |

**Success Response**:
- **Code**: 200
- **Content**:
```json
{
  "success": true,
  "data": {
    "requestId": "13f5b378-1d34-4601-a8c3-5678bb1234cd",
    "status": "processing",
    "progress": 45,
    "totalImages": 10,
    "processedImages": 4,
    "createdAt": "2023-10-10T10:15:30.000Z",
    "updatedAt": "2023-10-10T10:16:20.000Z"
  }
}
```

**For Completed Requests**:
```json
{
  "success": true,
  "data": {
    "requestId": "13f5b378-1d34-4601-a8c3-5678bb1234cd",
    "status": "completed",
    "progress": 100,
    "totalImages": 10,
    "processedImages": 10,
    "createdAt": "2023-10-10T10:15:30.000Z",
    "updatedAt": "2023-10-10T10:20:45.000Z",
    "outputCsvUrl": "http://localhost:3000/processed/13f5b378-1d34-4601-a8c3-5678bb1234cd-output.csv"
  }
}
```

**Error Responses**:
- **Not Found (404)**:
```json
{
  "success": false,
  "message": "Request not found"
}
```

- **Internal Server Error (500)**:
```json
{
  "success": false,
  "message": "An error occurred while checking status",
  "error": "Error message details"
}
```

## Status Codes
- `pending`: Request has been received but processing has not yet started
- `processing`: Request is currently being processed
- `completed`: Request has been fully processed successfully
- `failed`: Request processing failed

## Webhook Integration
If enabled, a webhook notification will be sent to the configured URL when processing is completed.

**Webhook Payload**:
```json
{
  "requestId": "13f5b378-1d34-4601-a8c3-5678bb1234cd",
  "status": "completed",
  "totalImages": 10,
  "processedImages": 10,
  "outputCsvUrl": "http://localhost:3000/processed/13f5b378-1d34-4601-a8c3-5678bb1234cd-output.csv",
  "completedAt": "2023-10-10T10:20:45.000Z"
}
```