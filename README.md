# 🌱 Smart Farm Management System

A comprehensive, vibrant, and mobile-first farm management system built with Node.js, Express.js, and SQLite. This application helps farmers manage their crops, livestock, finances, and inventory in one unified platform.

## 🚀 Features

### 🔐 Authentication & Security
- Secure user registration and login system
- Password hashing with bcryptjs
- Session management with express-session
- Protected routes that redirect to login if not authenticated

### 📊 Dashboard
- Real-time farm overview with key metrics
- Active crops count
- Total livestock count
- Monthly profit/loss calculation (green for profit, red for loss)
- Quick action cards for easy navigation
- Download report functionality (placeholder)

### 🌾 Crop Management
- Add, edit, and delete crops
- Track crop name, variety, field area, planting dates, and expected harvest dates
- Status tracking: Seedling, Growing, Flowering, Harvested, Failed
- Color-coded status badges
- Responsive card-based layout

### 🐄 Livestock Tracker
- Manage animals by category: Poultry, Cattle, Sheep, Goats, Pigs
- Track health status: Healthy, Sick, Quarantined
- Monitor age in months, breed, and quantity
- Visual category icons
- Health status indicators with color coding

### 💰 Financial Ledger
- Record income and expenses
- Categories: Crop Sales, Livestock Sales, Grants, Seeds, Feed, Labor, Fertilizer, Equipment
- Automatic running balance calculation
- Transaction history with date tracking
- Visual indicators for income (green) and expenses (red)

### 📦 Inventory Management
- Track farm supplies: Fertilizer, Seeds, Tools, Equipment, Feed
- Monitor quantity and units
- Low-stock alerts with visual warnings
- Minimum stock level configuration
- Category-based organization

## 🎨 Design Features

### 📱 Mobile-First Responsive Design
- Optimized for all screen sizes
- Touch-friendly buttons and interactions
- Sticky bottom navigation bar
- Smooth hover effects and transitions

### 🌈 Vibrant Agricultural Theme
- Rich greens for crops and growth
- Warm yellows/oranges for livestock
- Deep purples for finance
- Bright blues for inventory
- Clean card-based layout throughout

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Templating**: EJS (Embedded JavaScript)
- **Database**: SQLite (lightweight, file-based)
- **Authentication**: bcryptjs + express-session
- **Styling**: Custom CSS with gradients and animations
- **Icons**: Emoji icons for universal compatibility

## 📁 Project Structure

```
my-farm/
├── server.js              # Main application server
├── package.json           # Dependencies and scripts
├── farm.db               # SQLite database file (auto-created)
├── views/                # EJS templates
│   ├── login.ejs         # Login page
│   ├── signup.ejs        # Registration page
│   ├── dashboard.ejs     # Main dashboard
│   ├── crops.ejs         # Crop management list
│   ├── crop-form.ejs     # Add/edit crop form
│   ├── livestock.ejs     # Livestock list
│   ├── livestock-form.ejs # Add/edit livestock form
│   ├── finance.ejs       # Financial ledger
│   ├── transaction-form.ejs # Add/edit transaction form
│   ├── inventory.ejs     # Inventory list
│   └── inventory-form.ejs # Add/edit inventory form
├── public/               # Static assets (CSS, JS, images)
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 20 recommended)
- npm (comes with Node.js)

### Local Development

1. **Clone or download the project**
   ```bash
   cd "my farm"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

### Production (Render Deployment)

1. **Push to GitHub** (no `farm.db`, ignored in .gitignore)
2. **Render.com**: New Web Service → GitHub repo → Node
   - Build Command: (blank)
   - Start Command: auto-detects `npm start`
3. **Environment Variables** (Render Dashboard > Environment):
   ```
   NODE_ENV=production
   SESSION_SECRET=your-64-char-secret-here!! (generate with openssl rand -base64 32)
   ```
4. **Deploy** → App live at your-app.onrender.com
5. **Demo login**: admin@farm.com / admin123 (seeded in prod)

**Note**: Production uses in-memory DB (data resets per deploy). For persistence, add Render Postgres DB.

Test prod locally:
```bash
set NODE_ENV=production
set SESSION_SECRET=testsecret123
npm start
```
Health: http://localhost:$PORT/health

### First Time Setup
1. Click "Sign up here" on the login page
2. Create your account with a username and password
3. Optionally add your farm name
4. Start managing your farm!

## 📱 Usage Guide

### Dashboard
- View your farm's key metrics at a glance
- Navigate to different modules using the quick action cards
- Access all features via the bottom navigation bar

### Managing Crops
1. Go to Crops → Click "+ Add New Crop"
2. Fill in crop details (name, variety, field area, dates, status)
3. Save to see it in your crops list
4. Edit or delete crops using the action buttons

### Tracking Livestock
1. Navigate to Livestock → Click "+ Add New Livestock"
2. Select animal category, health status, breed, age, and quantity
3. Monitor health status with color-coded indicators
4. Update information as animals grow or health changes

### Financial Management
1. Go to Finance → Click "+ Add Transaction"
2. Choose Income or Expense type
3. Select appropriate category and enter amount
4. View running balance and transaction history
5. Edit or delete transactions as needed

### Inventory Control
1. Navigate to Inventory → Click "+ Add Item"
2. Enter item name, category, quantity, and unit
3. Set minimum stock level for alerts
4. Receive visual warnings when stock is low
5. Update quantities as you use or purchase supplies

## 🔧 Database Schema

The application uses SQLite with the following tables:

- **users**: User accounts and authentication
- **crops**: Crop information and status tracking
- **livestock**: Animal records and health monitoring
- **transactions**: Financial transactions (income/expenses)
- **inventory**: Supply and equipment tracking

## 🎯 Key Features Highlight

### Security
- All passwords are hashed using bcryptjs
- Sessions are managed securely
- All routes are protected behind authentication

### User Experience
- Intuitive navigation with sticky bottom menu
- Color-coded status indicators throughout
- Smooth animations and hover effects
- Mobile-optimized touch targets

### Data Management
- Real-time calculations for financial summaries
- Automatic low-stock alerts
- Running balance in financial ledger
- Comprehensive filtering and categorization

## 🌟 Future Enhancements

- [ ] Advanced reporting and analytics
- [ ] Weather integration
- [ ] Mobile app (React Native)
- [ ] Multi-farm support
- [ ] Data export functionality
- [ ] Photo uploads for crops/livestock
- [ ] Task scheduling and reminders
- [ ] Supplier management
- [ ] Market price tracking

## 🐛 Troubleshooting

### Common Issues

1. **Database connection error**
   - Ensure the application has write permissions
   - Check that `farm.db` can be created in the project directory

2. **Port already in use**
   - The default port is 3000. If occupied, the app will show an error
   - You can change the port by setting the PORT environment variable

3. **Session issues**
   - Clear browser cookies if login/logout behaves unexpectedly
   - Restart the server to clear all sessions

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this farm management system!

---

**Happy Farming! 🚜🌾**
