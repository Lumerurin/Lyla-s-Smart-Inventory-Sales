require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connection = require('./src/db'); // Import the connection from db.js
const app = express();
const port = process.env.PORT || 5000;

 app.use(cors()); 

 app.use(express.json());


 app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT EmployeeUsername FROM employee WHERE EmployeeUsername = ? AND EmployeePassword = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      res.status(500).send('Server error');
      return;
    }
    if (results.length > 0) {
      const user = results[0];
      res.status(200).json({ username: user.EmployeeUsername, fullName: user.EmployeeUsername });
    } else {
      res.status(401).send('Invalid username or password');
    }
  });
});

// Define a route to get all products with category names
app.get('/api/products', (req, res) => {
  const query = `
    SELECT p.ProductID, p.ProductName, p.Price, c.CategoryName, c.CategoryID
    FROM products p
    JOIN category c ON p.CategoryID = c.CategoryID
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});

// Define a route to add a new product
app.post('/api/products', (req, res) => {
  const { name, category, price } = req.body;
  const query = 'INSERT INTO products (ProductName, CategoryID, Price) VALUES (?, ?, ?)';
  connection.query(query, [name, category, price], (err, results) => {
    if (err) {
      console.error('Error adding product:', err);
      res.status(500).send('Server error');
      return;
    }
    res.status(201).send('Product added successfully');
  });
});

// Define a route to update a product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const query = 'UPDATE products SET ProductName = ?, Price = ? WHERE ProductID = ?';
  connection.query(query, [name, price, id], (err, results) => {
    if (err) {
      console.error('Error updating product:', err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).send('Product updated successfully');
  });
});

// Define a route to delete a product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE ProductID = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting product:', err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).send('Product deleted successfully');
  });
});

// Define a route to get all events with schedule and event type details
app.get('/api/events', (req, res) => {
  const query = `
    SELECT e.EventID, e.EventTitle, s.ScheduleID, s.ScheduleStartDate, s.ScheduleEndDate, e.EventTypeID
    FROM event e
    JOIN schedule s ON e.EventID = s.EventID
    JOIN eventtype et ON e.EventTypeID = et.EventTypeID
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});

// Define a route to get all event types
app.get('/api/eventtypes', (req, res) => {
  const query = 'SELECT * FROM eventtype';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching event types:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});

// Define a route to add a new event
app.post('/api/events', (req, res) => {
  const { EventTitle, ScheduleStartDate, ScheduleEndDate, EventTypeID } = req.body;
  const eventQuery = 'INSERT INTO event (EventTitle, EventTypeID) VALUES (?, ?)';
  connection.query(eventQuery, [EventTitle, EventTypeID], (err, eventResults) => {
    if (err) {
      console.error('Error adding event:', err);
      res.status(500).send('Server error');
      return;
    }
    const eventID = eventResults.insertId;
    const scheduleQuery = 'INSERT INTO schedule (EventID, ScheduleStartDate, ScheduleEndDate) VALUES (?, ?, ?)';
    connection.query(scheduleQuery, [eventID, ScheduleStartDate, ScheduleEndDate], (err, scheduleResults) => {
      if (err) {
        console.error('Error adding schedule:', err);
        res.status(500).send('Server error');
        return;
      }
      res.status(201).send('Event added successfully');
    });
  });
});

// Define a route to delete an event
app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const deleteScheduleQuery = 'DELETE FROM schedule WHERE EventID = ?';
  const deleteEventQuery = 'DELETE FROM event WHERE EventID = ?';

  connection.query(deleteScheduleQuery, [id], (err, scheduleResults) => {
    if (err) {
      console.error('Error deleting schedule:', err);
      res.status(500).send('Server error');
      return;
    }

    connection.query(deleteEventQuery, [id], (err, eventResults) => {
      if (err) {
        console.error('Error deleting event:', err);
        res.status(500).send('Server error');
        return;
      }

      res.status(200).send('Event deleted successfully');
    });
  });
});

// Define a route to get all stock-in items
app.get('/api/stockin', (req, res) => {
  // Make sure to properly format the SQL query with backticks
  const query = `
    SELECT s.StockID, s.Quantity, CAST(s.Price AS DECIMAL(10,2)) AS Price, 
           s.ExpiryDate, p.ProductName
    FROM stockin s
    JOIN products p ON s.ProductID = p.ProductID
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching stock-in items:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    try {
      // Convert to a simple array of objects to avoid circular reference issues
      const formattedResults = results.map(item => ({
        StockID: item.StockID,
        Quantity: item.Quantity,
        Price: parseFloat(item.Price) || 0,
        ExpiryDate: item.ExpiryDate,
        ProductName: item.ProductName
      }));
      
      return res.status(200).json(formattedResults);
    } catch (formatErr) {
      console.error('Error formatting results:', formatErr);
      return res.status(500).json({ error: 'Data formatting error', details: formatErr.message });
    }
  });
});

// Define a route to update stock-in items
app.put('/api/stockin/:id', (req, res) => {
  const { id } = req.params;
  const { Quantity, Price, ExpiryDate } = req.body;
  const query = 'UPDATE stockin SET Quantity = ?, Price = ?, ExpiryDate = ? WHERE StockID = ?';
  connection.query(query, [Quantity, Price, ExpiryDate, id], (err, results) => {
    if (err) {
      console.error('Error updating stock-in item:', err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).send('Stock-in item updated successfully');
  });
});


app.get('/api/eventdetails', (req, res) => {

  const query = `
    SELECT e.EventID, e.EventTitle, et.EventCategory, 
           s.ScheduleID, s.ScheduleStartDate, s.ScheduleEndDate
    FROM event e
    JOIN schedule s ON e.EventID = s.EventID
    JOIN eventtype et ON e.EventTypeID = et.EventTypeID
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching event details:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    try {
      // Format the results
      const formattedResults = results.map(item => ({
        EventID: item.EventID,
        EventTitle: item.EventTitle,
        EventCategory: item.EventCategory,
        ScheduleID: item.ScheduleID,
        ScheduleStartDate: item.ScheduleStartDate,
        ScheduleEndDate: item.ScheduleEndDate
      }));
      
      return res.status(200).json(formattedResults);
    } catch (formatErr) {
      console.error('Error formatting results:', formatErr);
      return res.status(500).json({ error: 'Data formatting error', details: formatErr.message });
    }
  });
});

app.get('/api/stockout', (req, res) => {
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
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching stockout data:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    try {
      const formattedResults = results.map(row => ({
        ProductName: row.ProductName,
        NumberOfStocks: row.NumberOfStocks,
        AvailableStocks: row.AvailableStocks,
        ExpiryDate: row.ExpiryDate,
        Price: parseFloat(row.Price) || 0
      }));
      
      return res.status(200).json(formattedResults);
    } catch (formatErr) {
      console.error('Error formatting results:', formatErr);
      return res.status(500).json({ error: 'Data formatting error', details: formatErr.message });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});