const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for OTP (in production, use Redis or database)
const otpStore = new Map();

// Helper function to read JSON files
async function readJsonFile(filename) {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Helper function to write JSON files
async function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// Generate random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// API Routes

// GET /api/sevas - List all Sevas with pagination
app.get('/api/sevas', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const sevas = await readJsonFile('sevas.json');
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSevas = sevas.slice(startIndex, endIndex);
    
    res.json(paginatedSevas);
  } catch (error) {
    console.error('Error fetching sevas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sevas/:code - Get Seva by code
app.get('/api/sevas/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const sevas = await readJsonFile('sevas.json');
    const seva = sevas.find(s => s.code === code);
    
    if (!seva) {
      return res.status(404).json({ error: 'Seva not found' });
    }
    
    res.json(seva);
  } catch (error) {
    console.error('Error fetching seva:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/identity-exist/:mobile - Check if user exists
app.get('/api/users/identity-exist/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    const users = await readJsonFile('users.json');
    const userExists = users.some(user => user.contact === mobile);
    
    res.json(userExists);
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:mobile - Get user details by mobile
app.get('/api/users/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    const users = await readJsonFile('users.json');
    const user = users.find(u => u.contact === mobile);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/otp - Send OTP
app.post('/api/otp', async (req, res) => {
  try {
    const { contact } = req.body;
    
    if (!contact) {
      return res.status(400).json({ error: 'Contact number is required' });
    }
    
    const otp = generateOTP();
    otpStore.set(contact, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });
    
    console.log(`OTP for ${contact}: ${otp}`); // In production, send via SMS
    
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/otp-verify - Verify OTP
app.post('/api/otp-verify', async (req, res) => {
  try {
    const { contact, otp } = req.body;
    
    if (!contact || !otp) {
      return res.status(400).json({ error: 'Contact and OTP are required' });
    }
    
    const storedData = otpStore.get(contact);
    
    if (!storedData) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }
    
    // Check if OTP is expired (5 minutes)
    if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
      otpStore.delete(contact);
      return res.status(400).json({ error: 'OTP expired' });
    }
    
    // Check attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(contact);
      return res.status(400).json({ error: 'Too many attempts' });
    }
    
    storedData.attempts++;
    
    if (storedData.otp !== otp) {
      return res.json({ valid: false, message: 'Invalid OTP' });
    }
    
    // OTP is valid
    otpStore.delete(contact);
    res.json({ valid: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users - Create user
app.post('/api/users', async (req, res) => {
  try {
    const { contact, name, email } = req.body;
    
    if (!contact || !name || !email) {
      return res.status(400).json({ error: 'Contact, name, and email are required' });
    }
    
    const users = await readJsonFile('users.json');
    
    // Check if user already exists
    const existingUser = users.find(u => u.contact === contact);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      contact,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeJsonFile('users.json', users);
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/address-by-pincode/:pincode - Get address details by pincode
app.get('/api/address-by-pincode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    const addresses = await readJsonFile('addresses.json');
    const address = addresses.find(a => a.pincode === pincode);
    
    if (!address) {
      return res.status(404).json({ error: 'Pincode not found' });
    }
    
    res.json(address);
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/order - Place order
app.post('/api/order', async (req, res) => {
  try {
    const { items, address } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const orders = await readJsonFile('orders.json');
    
    // Calculate total amount
    const amountToPay = items.reduce((total, item) => total + (item.discountedPrice || 0), 0);
    
    // Create new order
    const newOrder = {
      orderId: orders.length > 0 ? Math.max(...orders.map(o => o.orderId)) + 1 : 1001,
      paymentId: `PAY${Date.now()}`,
      amountToPay,
      userId: 1, // In real app, get from authenticated user
      items,
      address,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    await writeJsonFile('orders.json', orders);
    
    res.status(201).json({
      orderId: newOrder.orderId,
      paymentId: newOrder.paymentId,
      amountToPay: newOrder.amountToPay
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/:userId - Get user orders (for user page)
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await readJsonFile('orders.json');
    const userOrders = orders.filter(order => order.userId === parseInt(userId));
    
    res.json(userOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Seva Booking API server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   GET  /api/sevas - List all Sevas`);
  console.log(`   GET  /api/sevas/:code - Get Seva by code`);
  console.log(`   GET  /api/users/identity-exist/:mobile - Check if user exists`);
  console.log(`   GET  /api/users/:mobile - Get user details`);
  console.log(`   POST /api/otp - Send OTP`);
  console.log(`   POST /api/otp-verify - Verify OTP`);
  console.log(`   POST /api/users - Create user`);
  console.log(`   GET  /api/address-by-pincode/:pincode - Get address details`);
  console.log(`   POST /api/order - Place order`);
  console.log(`   GET  /api/orders/:userId - Get user orders`);
  console.log(`   GET  /api/health - Health check`);
}); 