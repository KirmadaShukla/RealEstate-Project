const mongoose = require('mongoose');

const leadershipSchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: true
    },
    ar: {
      type: String,
      required: true
    }
  },
  designation: {
    en: {
      type: String,
      required: true
    },
    ar: {
      type: String,
      required: true
    }
  },
  image: {
    url: {
      type: String,
      required: true
    },
    fileId: {
      type: String,
      required: true
    }
  },
  socialMedia: {
    linkedin: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Leadership', leadershipSchema);