const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { sendContactFormEmail } = require('../services/emailService');
const Contact = require('../models/Contact');

// Submit contact form
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Create new contact message
    const contact = new Contact({
      name,
      email,
      message
    });

    // Save to database
    await contact.save();

    try {
      // Send email notification
      await sendContactFormEmail({ name, email, message });
      contact.emailSent = true;
      await contact.save();
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // We don't want to fail the request if email fails
      // Just log the error and continue
    }

    // Send response
    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.'
    });
  }
});

module.exports = router;
