require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connection = require('./src/db'); // Import the connection from db.js
const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});