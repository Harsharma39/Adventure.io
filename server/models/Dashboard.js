// backend/models/Dashboard.js
const dashboardSchema = new mongoose.Schema({
  date: Date,
  visitors: Number,
  revenue: Number,
  attractions: [{
    name: String,
    utilization: Number,
    waitTime: Number
  }],
  bookings: {
    total: Number,
    confirmed: Number,
    cancelled: Number
  }
});