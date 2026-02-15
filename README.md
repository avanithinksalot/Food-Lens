# 🌾 Food-Lens: AI-Powered Food Safety Platform

A comprehensive full-stack platform for AI-powered food safety analysis, crop disease detection, and quality assurance using computer vision and machine learning.

![Food Safety Platform](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node.js-v16+-green)
![Python](https://img.shields.io/badge/Python-3.8+-blue)

## 🚀 Features

### Core Capabilities
- **🔬 AI-Powered Analysis**: Advanced image analysis using TensorFlow/Keras for crop disease detection
- **📸 Multi-Image Upload**: Batch processing of multiple images simultaneously
- **📊 Real-time Dashboard**: Interactive dashboard with comprehensive analytics
- **📄 PDF Report Generation**: Automated treatment plan and compliance report generation
- **🔐 Secure Authentication**: JWT-based user authentication system
- **📈 Historical Tracking**: Complete scan history and trend analysis

### Detection Features
- Disease identification (Blight, Rust, Mold, etc.)
- Chemical residue analysis
- Soil health assessment
- Product freshness evaluation
- Risk categorization (Safe/Monitor/High Risk)

### Supported Items
- **Crops**: Tomato, Potato, Corn, Wheat, Rice, Lettuce, Spinach, Peppers, etc.
- **Fruits**: Apple, Banana, Strawberry, Grape, Cherry
- **Household Foods**: Bread, Cheese, Milk, Meat products
- **Conditions**: Healthy, Mold, Rot, Blight, Rust, Staleness

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (React 19)
- **Styling**: TailwindCSS 3.4
- **Animations**: Framer Motion 12.34
- **Icons**: Lucide React
- **Charts**: Recharts 3.7
- **HTTP Client**: Axios 1.13

### Backend
- **Runtime**: Node.js with Express.js 5.2
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken 9.0)
- **File Upload**: Multer 2.0
- **PDF Generation**: PDFKit 0.17
- **Security**: bcryptjs 3.0

### AI/ML Engine
- **Framework**: TensorFlow 2.15+
- **API**: FastAPI 0.109+
- **Server**: Uvicorn 0.27+
- **Image Processing**: Pillow 10.2+
- **Model**: MobileNetV2 (Pre-trained on ImageNet)

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Git

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/avanithinksalot/Food-Lens.git
cd Food-Lens
```

### 2. Backend Setup

#### Install Node.js Dependencies
```bash
cd backend
npm install
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
JWT_SECRET=your_secret_key_here
MONGODB_URI=mongodb://localhost:27017/food_safety
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Start Backend Server (Node.js)
```bash
cd backend
npm start
```
Server runs on `http://localhost:5000`

### Start Frontend (Next.js)
```bash
cd frontend
npm run dev
```
Application runs on `http://localhost:3000`

### Create Default User (Optional)
```bash
cd backend
node create_user.js
```

**Default Login Credentials:**
- Username: `admin`
- Password: `password123`
- Role: `farmer`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password",
  "role": "farmer",
  "location": "California Farm"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password"
}

Response: { "token": "jwt_token", "role": "farmer", "username": "john_doe" }
```

### Analysis Endpoints

#### Analyze Images
```http
POST /api/analyze-image
Authorization: Bearer {token}
Content-Type: multipart/form-data

images: [file1.jpg, file2.jpg, ...]
```

#### Get Scan History
```http
GET /api/scans
Authorization: Bearer {token}
```

#### Generate PDF Report
```http
POST /api/generate-report
Content-Type: application/json

{
  "analysis": { /* analysis result object */ },
  "type": "treatment" | "compliance"
}
```

## 🧠 AI Model Details

### Architecture
- **Base Model**: MobileNetV2 (ImageNet pre-trained)
- **Multi-Task Learning**: 3 parallel output heads
  - Disease Classification (10 classes)
  - Chemical Residue Risk (3 classes)
  - Soil Health (3 classes)

### Fallback Analysis
When TensorFlow is unavailable, the system uses intelligent heuristics:
- **Filename-based detection**: Keyword matching for crops and conditions
- **Visual color analysis**: Saturation and brightness evaluation
- **Deterministic scoring**: Consistent results for reproducibility

## 🎯 User Roles

1. **Farmer**: Upload and analyze crop images, view history, download reports
2. **Vendor**: Access batch analysis, supply chain tracking
3. **Retailer**: Quality assurance checks, compliance reports

## 📊 Database Schema

### Users Table
- `id`, `username`, `password`, `role`, `location`, `subscription_tier`

### Scans Table
- `id`, `batch_id`, `overall_score`, `risk_category`, `residue_score`, `soil_score`, `UserId`

### ScanImages Table
- `id`, `image_path`, `disease_detected`, `confidence`, `severity`, `ScanId`

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Protected API routes with middleware
- Input validation and sanitization
- CORS configuration

## 📱 Screenshots

### Dashboard
![Dashboard Screenshot](./docs/dashboard.png)

### Multi-Image Analysis
![Analysis Screenshot](./docs/analysis.png)

### PDF Report
![Report Screenshot](./docs/report.png)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [avanithinksalot](https://github.com/avanithinksalot)

## 🙏 Acknowledgments

- TensorFlow team for the pre-trained models
- Next.js and React communities
- All contributors and testers

## 📧 Contact

For questions or support, please open an issue on GitHub or contact [your-email@example.com]

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time WebSocket notifications
- [ ] Advanced ML models (YOLOv8, Vision Transformers)
- [ ] Blockchain-based traceability
- [ ] Multi-language support
- [ ] Cloud deployment (AWS/Azure)
- [ ] Integration with IoT sensors

---

**Built with ❤️ for safer food systems**
