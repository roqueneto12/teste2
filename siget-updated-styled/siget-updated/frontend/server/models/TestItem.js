const mongoose = require('mongoose');

const testItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['funcional', 'performance', 'seguranca', 'usabilidade', 'compatibilidade', 'regressao'],
    default: 'funcional'
  },
  priority: {
    type: String,
    enum: ['baixa', 'media', 'alta', 'critica'],
    default: 'media'
  },
  estimatedTime: {
    type: Number, // em horas
    default: 1
  },
  prerequisites: {
    type: String,
    trim: true
  },
  expectedResult: {
    type: String,
    required: true,
    trim: true
  },
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isTemplate: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestItem', testItemSchema);

