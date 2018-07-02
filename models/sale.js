const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const saleSchema = new Schema({

  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Paddleboard', 'Kayak'],
    default: 'Kayak',
    required: true
  },
  maker: String,
  sku: String,
  cost: Schema.Types.Decimal128,
  price: Schema.Types.Decimal128,

  dateAcquired: Date,
  saleType: {
    type: String,
    enum: ['New', 'Used'],
    default: 'New'
  },
  condition: {
    type: String,
    enum: ['New', 'Excellent', 'Good', 'Fair', 'Poor'],
    default: 'New'
  },
  images: [{
    type: Schema.Types.ObjectId
  }],
  status: {
    type: String,
    enum: ['Available', 'Sold'],
    default: 'Available'
  },
  finalSale: {
    type: Schema.Types.Decimal128
  }
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;