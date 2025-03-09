require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Execute SQL query
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Define a route to handle login requests
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT EmployeeUsername FROM employee WHERE EmployeeUsername = ? AND EmployeePassword = ?';
  try {
    const results = await executeQuery(query, [username, password]);
    if (results.length > 0) {
      const user = results[0];
      res.status(200).json({ username: user.EmployeeUsername, fullName: user.EmployeeUsername });
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Server error');
  }
});

// Define a route to get all products with category names
app.get('/api/products', async (req, res) => {
  const query = `
    SELECT p.ProductID, p.ProductName, p.Price, c.CategoryName, c.CategoryID
    FROM products p
    JOIN category c ON p.CategoryID = c.CategoryID
  `;
  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).send('Server error');
  }
});

// Define a route to add a new product
app.post('/api/products', async (req, res) => {
  const { name, category, price } = req.body;
  const query = 'INSERT INTO products (ProductName, CategoryID, Price) VALUES (?, ?, ?)';
  try {
    await executeQuery(query, [name, category, price]);
    res.status(201).send('Product added successfully');
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).send('Server error');
  }
});

// Define a route to update a product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const query = 'UPDATE products SET ProductName = ?, Price = ? WHERE ProductID = ?';
  try {
    await executeQuery(query, [name, price, id]);
    res.status(200).send('Product updated successfully');
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).send('Server error');
  }
});

// Define a route to delete a product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE ProductID = ?';
  try {
    await executeQuery(query, [id]);
    res.status(200).send('Product deleted successfully');
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).send('Server error');
  }
});

// Define a route to get all events with schedule and event type details
app.get('/api/events', async (req, res) => {
  const query = `
    SELECT e.EventID, e.EventTitle, s.ScheduleID, s.ScheduleStartDate, s.ScheduleEndDate, e.EventTypeID
    FROM event e
    JOIN schedule s ON e.EventID = s.EventID
    JOIN eventtype et ON e.EventTypeID = et.EventTypeID
  `;
  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).send('Server error');
  }
});

// Define a route to get all event types
app.get('/api/eventtypes', async (req, res) => {
  const query = 'SELECT * FROM eventtype';
  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching event types:', err);
    res.status(500).send('Server error');
  }
});

// Define a route to add a new event
app.post('/api/events', async (req, res) => {
  const { EventTitle, ScheduleStartDate, ScheduleEndDate, EventTypeID } = req.body;
  const eventQuery = 'INSERT INTO event (EventTitle, EventTypeID) VALUES (?, ?)';
  try {
    const eventResults = await executeQuery(eventQuery, [EventTitle, EventTypeID]);
    const eventID = eventResults.insertId;
    const scheduleQuery = 'INSERT INTO schedule (EventID, ScheduleStartDate, ScheduleEndDate) VALUES (?, ?, ?)';
    await executeQuery(scheduleQuery, [eventID, ScheduleStartDate, ScheduleEndDate]);
    res.status(201).send('Event added successfully');
  } catch (err) {
    console.error('Error adding event:', err);
    res.status(500).send('Server error');
  }
});

// Define a route to delete an event
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const deleteScheduleQuery = 'DELETE FROM schedule WHERE EventID = ?';
  const deleteEventQuery = 'DELETE FROM event WHERE EventID = ?';
  try {
    await executeQuery(deleteScheduleQuery, [id]);
    await executeQuery(deleteEventQuery, [id]);
    res.status(200).send('Event deleted successfully');
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).send('Server error');
  }
});

// Define a route to get stock-in items
app.get('/api/stockin', async (req, res) => {
  const query = `
    SELECT s.StockID, s.Quantity, CAST(s.Price AS DECIMAL(10,2)) AS Price, 
           s.ExpiryDate, p.ProductName
    FROM stockin s
    JOIN products p ON s.ProductID = p.ProductID
  `;
  try {
    const results = await executeQuery(query);
    const formattedResults = results.map(item => ({
      StockID: item.StockID,
      Quantity: item.Quantity,
      Price: parseFloat(item.Price) || 0,
      ExpiryDate: item.ExpiryDate,
      ProductName: item.ProductName
    }));
    res.status(200).json(formattedResults);
  } catch (err) {
    console.error('Error fetching stock-in items:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/api/eventdetails', async(req, res) => {

  const query = `
    SELECT e.EventID, e.EventTitle, et.EventCategory, 
           s.ScheduleID, s.ScheduleStartDate, s.ScheduleEndDate
    FROM event e
    JOIN schedule s ON e.EventID = s.EventID
    JOIN eventtype et ON e.EventTypeID = et.EventTypeID
  `;
  try {
    const results = await executeQuery(query);
    const formattedResults = results.map(item => ({
      EventID: item.EventID,
      EventTitle: item.EventTitle,
      EventCategory: item.EventCategory,
      ScheduleID: item.ScheduleID,
      ScheduleStartDate: item.ScheduleStartDate,
      ScheduleEndDate: item.ScheduleEndDate
    }));
    res.status(200).json(formattedResults);
  } catch (err) {
    console.error('Error fetching event details:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Define a route to get stock-out items
app.get('/api/stockout', async (req, res) => {
  const query = `
    SELECT p.ProductName, 
           sod.Quantity AS NumberOfStocks, 
           si.Quantity AS AvailableStocks, 
           si.ExpiryDate, 
           sod.Price
    FROM stockoutdetails sod
    JOIN stockin si ON sod.StockID = si.StockID
    JOIN products p ON si.ProductID = p.ProductID
  `;
  try {
    const results = await executeQuery(query);
    const formattedResults = results.map(row => ({
      ProductName: row.ProductName,
      NumberOfStocks: row.NumberOfStocks,
      AvailableStocks: row.AvailableStocks,
      ExpiryDate: row.ExpiryDate,
      Price: parseFloat(row.Price) || 0
    }));
    res.status(200).json(formattedResults);
  } catch (err) {
    console.error('Error fetching stockout data:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Define a route to create a transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { CustomerID, EmployeeID, ScheduleID, TotalCost, TransactionDate, CashPayment } = req.body;
    if (!CustomerID || !EmployeeID || !ScheduleID || !TotalCost || !TransactionDate || !CashPayment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO transaction (CustomerID, EmployeeID, ScheduleID, TotalCost, TransactionDate, CashPayment)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [CustomerID, EmployeeID, ScheduleID, TotalCost, TransactionDate, CashPayment]);
    res.status(201).json({ message: 'Transaction created successfully', TransactionID: result.insertId });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Error creating transaction' });
  }
});

// Define a route to create order details
app.post('/api/orderdetails', async (req, res) => {
  try {
    const { TransactionID, StockID, Subtotal, DiscountedPrice, Quantity } = req.body;
    if (!TransactionID || !StockID || !Subtotal || !DiscountedPrice || !Quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO orderdetails (TransactionID, StockID, Subtotal, DiscountedPrice, Quantity)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(query, [TransactionID, StockID, Subtotal, DiscountedPrice, Quantity]);

    // Update stock quantity
    const updateStockQuery = `UPDATE stockin SET Quantity = Quantity - ? WHERE StockID = ?`;
    await executeQuery(updateStockQuery, [Quantity, StockID]);

    res.status(201).json({ message: 'Order details created successfully', OrderDetailsID: result.insertId });
  } catch (error) {
    console.error('Error creating order details:', error);
    res.status(500).json({ error: 'Error creating order details' });
  }
});

// Define a route to record payment method
app.post('/api/paymentmethod', async (req, res) => {
  try {
    const { TransactionID, PaymentMethodID, ReferenceNumber } = req.body;
    if (!TransactionID || !PaymentMethodID || !ReferenceNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO paymentmethod (TransactionID, PaymentMethodID, ReferenceNumber)
      VALUES (?, ?, ?)
    `;
    const result = await executeQuery(query, [TransactionID, PaymentMethodID, ReferenceNumber]);

    res.status(201).json({ message: 'Payment method recorded successfully', PaymentID: result.insertId });
  } catch (error) {
    console.error('Error recording payment method:', error);
    res.status(500).json({ error: 'Error recording payment method' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});