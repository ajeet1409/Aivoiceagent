# 🤖 AI Voice HR Agent

An AI-powered HR calling agent that automates candidate screening through voice conversations.

## ✨ Features

- 📞 **Single Call** - Make individual calls to candidates
- 📊 **Bulk Campaigns** - Upload CSV and call multiple candidates
- 📝 **Call History** - View all past calls with details
- 🎙️ **Call Recordings** - Listen to and download call recordings
- 📋 **Transcripts** - Read full conversation transcripts
- 🔍 **Candidate Info** - Extract structured data from interviews
- 👤 **User Authentication** - Secure login/signup system

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- MongoDB database

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/aivoice-hr.git
cd aivoice-hr

# Install backend dependencies
npm install

# Install frontend dependencies
cd AiVoiceHragent
npm install
cd ..

# Create .env file in root
cp .env.example .env
# Edit .env with your MongoDB URI

# Create frontend .env file
cp AiVoiceHragent/.env.example AiVoiceHragent/.env
```

### **Run Development Server**

```bash
# Build frontend
npm run build

# Start backend (serves frontend + API)
npm start
```

Open `http://localhost:3000`

## 📁 Project Structure

```
.
├── Backend/
│   ├── routes/
│   │   ├── omnidimProxy.js    # OmniDim API proxy
│   │   └── userRoutes.js      # Auth routes
│   ├── models/                # MongoDB models
│   └── server.js              # Express server
├── AiVoiceHragent/            # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── Context/           # Auth context
│   │   └── styles/            # CSS styles
│   └── dist/                  # Production build
├── .env                       # Backend environment variables
├── package.json               # Backend dependencies
└── README.md                  # This file
```

## 🔧 Configuration

### **Backend (.env)**
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### **Frontend (AiVoiceHragent/.env)**
```env
VITE_BACKEND_URL=http://localhost:3000
```

## 📊 Campaign Feature

### **CSV Format**
```csv
phone,name,email,position
+1234567890,John Doe,john@example.com,Software Engineer
+1234567891,Jane Smith,jane@example.com,Product Manager
```

**Required:** `phone` column (case-insensitive)

**Optional:** Any additional columns (passed to AI agent)

See `sample_campaign.csv` for example.

## 🌐 API Endpoints

### **Authentication**
- `POST /api/users/signup` - Create account
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Get user profile

### **Calls**
- `POST /api/omnidim/calls/dispatch` - Initiate call
- `GET /api/omnidim/call/logs` - Get call history
- `GET /api/omnidim/call/log/:id` - Get call details

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide
- **[CAMPAIGN_FEATURE_FIXED.md](CAMPAIGN_FEATURE_FIXED.md)** - Campaign feature details

## 🐛 Troubleshooting

### **ERR_CONNECTION_REFUSED**
- ✅ Backend server is running (`npm start`)
- ✅ Frontend `.env` has correct `VITE_BACKEND_URL`
- ✅ Rebuild frontend after changing `.env`

### **Campaign Not Working**
- ✅ CSV has "phone" column
- ✅ Phone numbers include country code (+1...)
- ✅ Check browser console for errors

### **CORS Errors**
- ✅ Backend `.env` has `FRONTEND_URL` set
- ✅ Restart backend after changing `.env`

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite 5.4
- Tailwind CSS 4.1
- React Router 7
- Axios
- Lucide Icons

**Backend:**
- Node.js
- Express 5.1
- MongoDB + Mongoose
- JWT Authentication
- OmniDim API Integration

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues, please check:
1. Browser console for frontend errors
2. Backend terminal for server errors
3. MongoDB connection status
4. Environment variables are set correctly

---

**Built with ❤️ for automated HR screening**

