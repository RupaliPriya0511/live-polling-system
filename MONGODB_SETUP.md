# MongoDB Setup Instructions

## For Development

### Option 1: Local MongoDB
```
MONGODB_URI=mongodb://localhost:27017/polling-system
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Replace in `.env`:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/polling-system?retryWrites=true&w=majority
```

## For Production

Set environment variables in your hosting platform:
- Railway: Settings → Variables
- Render: Environment → Environment Variables
- Heroku: Settings → Config Vars

**Never commit your actual MongoDB credentials to Git!**