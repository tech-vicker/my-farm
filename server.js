const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup - use persistent storage in production
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/tmp/farm.db' 
    : './farm.db';

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        initializeDatabase();
    }
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'smartfarm2024securekey12345',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Initialize database tables
function initializeDatabase() {
    // Drop existing users table to recreate with new schema
    db.run(`DROP TABLE IF EXISTS users`, (err) => {
        if (err) {
            console.error('Error dropping users table:', err);
        } else {
            console.log('Dropped old users table for migration');
        }
        
        // Create new users table with email
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT,
            farm_name TEXT,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
            } else {
                console.log('Created new users table with email field');
            }
        });
    });

    // Crops table
    db.run(`CREATE TABLE IF NOT EXISTS crops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        crop_name TEXT NOT NULL,
        variety TEXT,
        field_area REAL,
        planting_date DATE,
        expected_harvest_date DATE,
        status TEXT CHECK(status IN ('Seedling', 'Growing', 'Flowering', 'Harvested', 'Failed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Livestock table
    db.run(`CREATE TABLE IF NOT EXISTS livestock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT CHECK(category IN ('Poultry', 'Cattle', 'Sheep', 'Goats', 'Pigs')),
        health_status TEXT CHECK(health_status IN ('Healthy', 'Sick', 'Quarantined')),
        age_months INTEGER,
        breed TEXT,
        quantity INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Financial transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT CHECK(type IN ('Income', 'Expense')),
        category TEXT,
        description TEXT,
        amount REAL NOT NULL,
        date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Inventory table
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        category TEXT CHECK(category IN ('Fertilizer', 'Seeds', 'Tools', 'Equipment', 'Feed')),
        quantity REAL NOT NULL,
        unit TEXT,
        min_stock_level REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
}

// Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Signup page
app.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});

// Handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.render('login', { error: 'Database error' });
        }
        
        if (!user) {
            return res.render('login', { error: 'Invalid email or password' });
        }
        
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.user = { id: user.id, email: user.email, full_name: user.full_name, farm_name: user.farm_name };
                res.redirect('/dashboard');
            } else {
                res.render('login', { error: 'Invalid email or password' });
            }
        });
    });
});

// Handle signup
app.post('/signup', async (req, res) => {
    const { email, password, full_name, farm_name, phone } = req.body;
    
    if (!email || !password) {
        return res.render('signup', { error: 'Email and password are required' });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render('signup', { error: 'Please enter a valid email address' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run('INSERT INTO users (email, password, full_name, farm_name, phone) VALUES (?, ?, ?, ?, ?)', 
            [email, hashedPassword, full_name, farm_name, phone], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.render('signup', { error: 'Email already exists' });
                }
                return res.render('signup', { error: 'Registration failed' });
            }
            res.redirect('/login');
        });
    } catch (error) {
        res.render('signup', { error: 'Registration failed' });
    }
});

// Dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    
    // Get dashboard statistics
    const queries = {
        activeCrops: `SELECT COUNT(*) as count FROM crops WHERE user_id = ? AND status IN ('Seedling', 'Growing', 'Flowering')`,
        totalLivestock: `SELECT SUM(quantity) as count FROM livestock WHERE user_id = ?`,
        monthlyProfit: `SELECT 
            SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as expenses
            FROM transactions 
            WHERE user_id = ? AND date >= date('now', 'start of month')`
    };
    
    db.get(queries.activeCrops, [userId], (err, crops) => {
        db.get(queries.totalLivestock, [userId], (err, livestock) => {
            db.get(queries.monthlyProfit, [userId], (err, profit) => {
                const monthlyProfitLoss = (profit.income || 0) - (profit.expenses || 0);
                
                res.render('dashboard', {
                    user: req.session.user,
                    activeCrops: crops.count || 0,
                    totalLivestock: livestock.count || 0,
                    monthlyProfitLoss: monthlyProfitLoss,
                    isProfit: monthlyProfitLoss >= 0
                });
            });
        });
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Crop Management Routes
app.get('/crops', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    
    db.all('SELECT * FROM crops WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, crops) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        
        res.render('crops', { 
            user: req.session.user,
            crops: crops,
            message: null
        });
    });
});

app.get('/crops/add', isAuthenticated, (req, res) => {
    res.render('crop-form', { 
        user: req.session.user,
        crop: null,
        action: '/crops/add',
        title: 'Add New Crop'
    });
});

app.post('/crops/add', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { crop_name, variety, field_area, planting_date, expected_harvest_date, status } = req.body;
    
    db.run(`INSERT INTO crops (user_id, crop_name, variety, field_area, planting_date, expected_harvest_date, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [userId, crop_name, variety, field_area, planting_date, expected_harvest_date, status], 
        function(err) {
        if (err) {
            return res.status(500).send('Error adding crop');
        }
        res.redirect('/crops');
    });
});

app.get('/crops/edit/:id', isAuthenticated, (req, res) => {
    const cropId = req.params.id;
    const userId = req.session.user.id;
    
    db.get('SELECT * FROM crops WHERE id = ? AND user_id = ?', [cropId, userId], (err, crop) => {
        if (err || !crop) {
            return res.status(404).send('Crop not found');
        }
        
        res.render('crop-form', { 
            user: req.session.user,
            crop: crop,
            action: `/crops/edit/${cropId}`,
            title: 'Edit Crop'
        });
    });
});

app.post('/crops/edit/:id', isAuthenticated, (req, res) => {
    const cropId = req.params.id;
    const userId = req.session.user.id;
    const { crop_name, variety, field_area, planting_date, expected_harvest_date, status } = req.body;
    
    db.run(`UPDATE crops SET crop_name = ?, variety = ?, field_area = ?, planting_date = ?, 
            expected_harvest_date = ?, status = ? WHERE id = ? AND user_id = ?`, 
        [crop_name, variety, field_area, planting_date, expected_harvest_date, status, cropId, userId], 
        function(err) {
        if (err) {
            return res.status(500).send('Error updating crop');
        }
        res.redirect('/crops');
    });
});

app.post('/crops/delete/:id', isAuthenticated, (req, res) => {
    const cropId = req.params.id;
    const userId = req.session.user.id;
    
    db.run('DELETE FROM crops WHERE id = ? AND user_id = ?', [cropId, userId], function(err) {
        if (err) {
            return res.status(500).send('Error deleting crop');
        }
        res.redirect('/crops');
    });
});

// Livestock Management Routes
app.get('/livestock', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    
    db.all('SELECT * FROM livestock WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, livestock) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        
        res.render('livestock', { 
            user: req.session.user,
            livestock: livestock,
            message: null
        });
    });
});

app.get('/livestock/add', isAuthenticated, (req, res) => {
    res.render('livestock-form', { 
        user: req.session.user,
        animal: null,
        action: '/livestock/add',
        title: 'Add New Livestock'
    });
});

app.post('/livestock/add', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { category, health_status, age_months, breed, quantity } = req.body;
    
    db.run(`INSERT INTO livestock (user_id, category, health_status, age_months, breed, quantity) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
        [userId, category, health_status, age_months, breed, quantity], 
        function(err) {
        if (err) {
            return res.status(500).send('Error adding livestock');
        }
        res.redirect('/livestock');
    });
});

app.get('/livestock/edit/:id', isAuthenticated, (req, res) => {
    const livestockId = req.params.id;
    const userId = req.session.user.id;
    
    db.get('SELECT * FROM livestock WHERE id = ? AND user_id = ?', [livestockId, userId], (err, animal) => {
        if (err || !animal) {
            return res.status(404).send('Livestock not found');
        }
        
        res.render('livestock-form', { 
            user: req.session.user,
            animal: animal,
            action: `/livestock/edit/${livestockId}`,
            title: 'Edit Livestock'
        });
    });
});

app.post('/livestock/edit/:id', isAuthenticated, (req, res) => {
    const livestockId = req.params.id;
    const userId = req.session.user.id;
    const { category, health_status, age_months, breed, quantity } = req.body;
    
    db.run(`UPDATE livestock SET category = ?, health_status = ?, age_months = ?, 
            breed = ?, quantity = ? WHERE id = ? AND user_id = ?`, 
        [category, health_status, age_months, breed, quantity, livestockId, userId], 
        function(err) {
        if (err) {
            return res.status(500).send('Error updating livestock');
        }
        res.redirect('/livestock');
    });
});

app.post('/livestock/delete/:id', isAuthenticated, (req, res) => {
    const livestockId = req.params.id;
    const userId = req.session.user.id;
    
    db.run('DELETE FROM livestock WHERE id = ? AND user_id = ?', [livestockId, userId], function(err) {
        if (err) {
            return res.status(500).send('Error deleting livestock');
        }
        res.redirect('/livestock');
    });
});

// Financial Ledger Routes
app.get('/finance', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    
    db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC', [userId], (err, transactions) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        
        // Calculate running balance
        let balance = 0;
        const transactionsWithBalance = transactions.map(transaction => {
            if (transaction.type === 'Income') {
                balance += transaction.amount;
            } else {
                balance -= transaction.amount;
            }
            return {
                ...transaction,
                balance: balance
            };
        });
        
        res.render('finance', { 
            user: req.session.user,
            transactions: transactionsWithBalance,
            currentBalance: balance,
            message: null
        });
    });
});

app.get('/finance/add', isAuthenticated, (req, res) => {
    res.render('transaction-form', { 
        user: req.session.user,
        transaction: null,
        action: '/finance/add',
        title: 'Add Transaction'
    });
});

app.post('/finance/add', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { type, category, description, amount, date } = req.body;
    
    db.run(`INSERT INTO transactions (user_id, type, category, description, amount, date) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
        [userId, type, category, description, amount, date || new Date().toISOString().split('T')[0]], 
        function(err) {
        if (err) {
            return res.status(500).send('Error adding transaction');
        }
        res.redirect('/finance');
    });
});

app.get('/finance/edit/:id', isAuthenticated, (req, res) => {
    const transactionId = req.params.id;
    const userId = req.session.user.id;
    
    db.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userId], (err, transaction) => {
        if (err || !transaction) {
            return res.status(404).send('Transaction not found');
        }
        
        res.render('transaction-form', { 
            user: req.session.user,
            transaction: transaction,
            action: `/finance/edit/${transactionId}`,
            title: 'Edit Transaction'
        });
    });
});

app.post('/finance/edit/:id', isAuthenticated, (req, res) => {
    const transactionId = req.params.id;
    const userId = req.session.user.id;
    const { type, category, description, amount, date } = req.body;
    
    db.run(`UPDATE transactions SET type = ?, category = ?, description = ?, 
            amount = ?, date = ? WHERE id = ? AND user_id = ?`, 
        [type, category, description, amount, date, transactionId, userId], 
        function(err) {
        if (err) {
            return res.status(500).send('Error updating transaction');
        }
        res.redirect('/finance');
    });
});

app.post('/finance/delete/:id', isAuthenticated, (req, res) => {
    const transactionId = req.params.id;
    const userId = req.session.user.id;
    
    db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userId], function(err) {
        if (err) {
            return res.status(500).send('Error deleting transaction');
        }
        res.redirect('/finance');
    });
});

// Inventory Management Routes
app.get('/inventory', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    
    db.all('SELECT * FROM inventory WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, inventory) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        
        // Check for low stock items
        const lowStockItems = inventory.filter(item => item.quantity <= item.min_stock_level);
        
        res.render('inventory', { 
            user: req.session.user,
            inventory: inventory,
            lowStockItems: lowStockItems,
            message: null
        });
    });
});

app.get('/inventory/add', isAuthenticated, (req, res) => {
    res.render('inventory-form', { 
        user: req.session.user,
        item: null,
        action: '/inventory/add',
        title: 'Add Inventory Item'
    });
});

app.post('/inventory/add', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { item_name, category, quantity, unit, min_stock_level } = req.body;
    
    db.run(`INSERT INTO inventory (user_id, item_name, category, quantity, unit, min_stock_level) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
        [userId, item_name, category, quantity, unit, min_stock_level || 0], 
        function(err) {
        if (err) {
            return res.status(500).send('Error adding inventory item');
        }
        res.redirect('/inventory');
    });
});

app.get('/inventory/edit/:id', isAuthenticated, (req, res) => {
    const itemId = req.params.id;
    const userId = req.session.user.id;
    
    db.get('SELECT * FROM inventory WHERE id = ? AND user_id = ?', [itemId, userId], (err, item) => {
        if (err || !item) {
            return res.status(404).send('Inventory item not found');
        }
        
        res.render('inventory-form', { 
            user: req.session.user,
            item: item,
            action: `/inventory/edit/${itemId}`,
            title: 'Edit Inventory Item'
        });
    });
});

app.post('/inventory/edit/:id', isAuthenticated, (req, res) => {
    const itemId = req.params.id;
    const userId = req.session.user.id;
    const { item_name, category, quantity, unit, min_stock_level } = req.body;
    
    db.run(`UPDATE inventory SET item_name = ?, category = ?, quantity = ?, 
            unit = ?, min_stock_level = ? WHERE id = ? AND user_id = ?`, 
        [item_name, category, quantity, unit, min_stock_level || 0, itemId, userId], 
        function(err) {
        if (err) {
            return res.status(500).send('Error updating inventory item');
        }
        res.redirect('/inventory');
    });
});

app.post('/inventory/delete/:id', isAuthenticated, (req, res) => {
    const itemId = req.params.id;
    const userId = req.session.user.id;
    
    db.run('DELETE FROM inventory WHERE id = ? AND user_id = ?', [itemId, userId], function(err) {
        if (err) {
            return res.status(500).send('Error deleting inventory item');
        }
        res.redirect('/inventory');
    });
});

// User Profile Route
app.get('/profile', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(404).send('User not found');
        }
        
        res.render('profile', { 
            user: req.session.user,
            profile: user,
            message: null
        });
    });
});

app.post('/profile', isAuthenticated, async (req, res) => {
    const userId = req.session.user.id;
    const { full_name, farm_name, phone, current_password, new_password } = req.body;
    
    try {
        if (new_password) {
            // Verify current password first
            db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
                if (err || !user) {
                    return res.render('profile', { 
                        user: req.session.user,
                        profile: req.body,
                        error: 'User not found'
                    });
                }
                
                const isValid = await bcrypt.compare(current_password, user.password);
                if (!isValid) {
                    return res.render('profile', { 
                        user: req.session.user,
                        profile: req.body,
                        error: 'Current password is incorrect'
                    });
                }
                
                // Update with new password
                const hashedPassword = await bcrypt.hash(new_password, 10);
                db.run('UPDATE users SET full_name = ?, farm_name = ?, phone = ?, password = ? WHERE id = ?', 
                    [full_name, farm_name, phone, hashedPassword, userId], function(err) {
                    if (err) {
                        return res.render('profile', { 
                            user: req.session.user,
                            profile: req.body,
                            error: 'Update failed'
                        });
                    }
                    
                    // Update session
                    req.session.user = { 
                        id: req.session.user.id, 
                        email: req.session.user.email, 
                        full_name: full_name, 
                        farm_name: farm_name 
                    };
                    
                    res.render('profile', { 
                        user: req.session.user,
                        profile: { ...req.body, password: undefined },
                        success: 'Profile updated successfully'
                    });
                });
            });
        } else {
            // Update without password change
            db.run('UPDATE users SET full_name = ?, farm_name = ?, phone = ? WHERE id = ?', 
                [full_name, farm_name, phone, userId], function(err) {
                if (err) {
                    return res.render('profile', { 
                        user: req.session.user,
                        profile: req.body,
                        error: 'Update failed'
                    });
                }
                
                // Update session
                req.session.user = { 
                    id: req.session.user.id, 
                    email: req.session.user.email, 
                    full_name: full_name, 
                    farm_name: farm_name 
                };
                
                res.render('profile', { 
                    user: req.session.user,
                    profile: req.body,
                    success: 'Profile updated successfully'
                });
            });
        }
    } catch (error) {
        res.render('profile', { 
            user: req.session.user,
            profile: req.body,
            error: 'Update failed'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Smart Farm Management System running on http://localhost:${PORT}`);
});
