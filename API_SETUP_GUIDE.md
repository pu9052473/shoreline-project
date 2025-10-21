# API Integration Setup Guide

This guide will help you integrate your model API keys with the coastal erosion prediction application.

## 🚀 Quick Setup

### 1. Environment Configuration

#### Server-side (Flask) Configuration
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual API credentials:
   ```env
   MODEL_API_KEY=your_actual_model_api_key_here
   MODEL_API_BASE_URL=https://your-model-api-endpoint.com
   MODEL_TIMEOUT=30000
   MODEL_MAX_RETRIES=3
   ```

#### Client-side (Next.js) Configuration
1. Copy the example environment file:
   ```bash
   cd client
   cp .env.local.example .env.local
   ```

2. Edit `client/.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

### 2. Install Dependencies

#### Python Dependencies (Server)
```bash
cd server
pip install -r requirements.txt
```

#### Node.js Dependencies (Client)
```bash
cd client
npm install
```

### 3. Start the Applications

#### Start the Flask Server
```bash
cd server
python server.py
```
The server will run on `http://localhost:5000`

#### Start the Next.js Client
```bash
cd client
npm run dev
```
The client will run on `http://localhost:3000`

## 🔧 API Integration Details

### Model API Requirements

Your model API should accept POST requests to `/predict` with the following format:

#### Request Format
```json
{
  "model_type": "short_term" | "long_term",
  "timestamp": "2024-01-01T00:00:00Z",
  "duration": "7_days" | "1_month"
}
```

#### Response Format
```json
{
  "success": true,
  "predictions": [
    {
      "erosion_rate": 0.25,
      "confidence": 95,
      "image_url": "https://example.com/image.jpg"
    }
  ]
}
```

### Authentication

The Flask server will send requests to your model API with:
- **Header**: `Authorization: Bearer {MODEL_API_KEY}`
- **Content-Type**: `application/json`

## 🛠️ Configuration Options

### Environment Variables

#### Server (.env)
- `MODEL_API_KEY`: Your model API authentication key
- `MODEL_API_BASE_URL`: Base URL for your model API
- `MODEL_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `MODEL_MAX_RETRIES`: Maximum retry attempts (default: 3)

#### Client (.env.local)
- `NEXT_PUBLIC_API_BASE_URL`: Flask server URL (default: http://localhost:5000)
- `NEXT_PUBLIC_USE_MOCK_DATA`: Set to 'true' to use demo data instead of real API

## 🔍 Testing the Integration

### 1. Health Check
Visit `http://localhost:5000/api/health` to verify:
- Flask server is running
- Model API configuration is loaded

### 2. Test Predictions
1. Go to `http://localhost:3000/model`
2. Click "Run Prediction" on either model
3. Check browser console for any errors
4. Verify results display correctly

### 3. Debug Mode
- Set `NEXT_PUBLIC_USE_MOCK_DATA=true` to test with demo data
- Check Flask server logs for API request/response details
- Use browser developer tools to inspect network requests

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your model API allows requests from your Flask server
2. **Authentication Errors**: Verify your `MODEL_API_KEY` is correct
3. **Timeout Errors**: Increase `MODEL_TIMEOUT` if your model takes longer to respond
4. **Connection Errors**: Check that `MODEL_API_BASE_URL` is accessible

### Error Handling

The application includes fallback mechanisms:
- If the model API is unavailable, it falls back to mock data
- Error messages are displayed to users
- All errors are logged to the console

## 📝 Customization

### Modifying API Endpoints

Edit `server/server.py` to change:
- API endpoint paths
- Request/response format
- Error handling logic

### Modifying Client Behavior

Edit `client/src/app/model/page.tsx` to change:
- API call logic
- Error display
- Loading states

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Consider using a secrets management service for production
- Implement proper API rate limiting and authentication

## 📞 Support

If you encounter issues:
1. Check the Flask server logs
2. Verify your model API is accessible
3. Test with mock data first (`NEXT_PUBLIC_USE_MOCK_DATA=true`)
4. Check browser console for client-side errors
