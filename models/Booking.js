const mongoose = require('mongoose');

const Hotel = require('./Hotel');

const BookingSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },
    hotel : {
        type : mongoose.Schema.ObjectId,
        ref : 'Hotel',
        required : true
    },
    checkIn : {
        type : Date,
        required : true
    },
    checkOut: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                // Ensure checkOut is strictly after checkIn
                return this.checkOut && value.getTime() > this.checkIn.getTime();
            },
            message: 'Check-out date must be after check-in date'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// **Pre-validation hook to enforce booking constraints**
BookingSchema.pre('validate', function (next) {
    if (!this.checkIn || !this.checkOut) {
        return next(new Error('Both check-in and check-out dates are required.'));
    }

    // Convert dates to timestamps for proper comparison
    const checkInTime = this.checkIn.getTime();
    const checkOutTime = this.checkOut.getTime();

    // Ensure checkOut is after checkIn
    if (checkOutTime <= checkInTime) {
        return next(new Error('Check-out date must be after check-in date.'));
    }

    // Ensure booking duration does not exceed 3 nights
    const bookingDuration = (checkOutTime - checkInTime) / (1000 * 60 * 60 * 24); // Convert ms to days
    if (bookingDuration > 3) {
        return next(new Error('Booking cannot be made for more than 3 nights.'));
    }

    next();
});

module.exports = mongoose.model('Booking' , BookingSchema);