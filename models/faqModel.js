const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  title: {
    type: String
  },
  faqs: [
    {
      question: {
        type: String,
        required: true,
        trim: true,
      },
      answer: {
        type: String,
        required: true,
        trim: true,
      },
      isActive: {
        type: Boolean,
        default: true, 
      },
    },
  ],
}, { timestamps: true });

faqSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;

