const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

//@desc    Get all bookings
//@route   GET /api/v1/bookings
//@access  Public
exports.getBookings = async (req, res, next) => {
    let query;

    if(req.user.role !== 'admin') {
        query = Booking.find({ user: req.user.id }).populate({
            path : 'hotel',
            select: 'name address telephoneNumber'
        });
    } else {
        if(req.params.hotelId) {
            console.log(req.params.hotelId);

            query = Booking.find({ hotel: req.params.hotelId }).populate({
                path : 'hotel',
                select: 'name address telephoneNumber'
            });
        }
        else {
            query = Booking.find().populate({
                path: 'hotel',
                select: 'name address telephoneNumber'
            });
        }
    }
    try {
        const bookings = await query;
        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

//@desc    Get single booking
//@route   GET /api/v1/bookings/:id
//@access  Public
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path : 'hotel',
            select: 'name address telephoneNumber'
        });

        if(!booking) {
            return res.status(404).json({
                success: false,
                error: `No booking with id ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });

    } catch(err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            error: 'Cannot find booking'
        });
    }
};

// @desc    Add booking
// @route   POST /api/v1/hotels/:hotelId/bookings
// @access  Private
exports.addBooking = async (req, res, next) => {
    try {
        req.body.hotel = req.params.hotelId;

        const hotel = await Hotel.findById(req.params.hotelId);
        if (!hotel) {
            return res.status(404).json({
                success: false,
                error: `No hotel with id : ${req.params.hotelId}`
            });
        }

        // add userId to req.body
        req.body.user = req.user.id;

        // check for existing booking
        const existedBooking = await Booking.findOne({ hotel: req.params.hotelId, user: req.user.id });
        if (existedBooking) {
            return res.status(400).json({
                success: false,
                error: 'You have already booked this hotel'
            });
        }

        const booking = await Booking.create(req.body);

        res.status(201).json({
            success: true,
            data: booking
        });

    } catch (err) {
        console.log(err);

        let errorMessage = 'Cannot add booking';
        if (err.message.includes('Booking cannot be made for more than 3 nights')) {
            errorMessage = err.message;
        }

        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

//@desc    Update booking
//@route   PUT /api/v1/bookings/:id
//@access  Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if(!booking) {
            return res.status(404).json({
                success: false,
                error: `No booking with id : ${req.params.id}`
            });
        }

        // Make sure user is booking owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to update this booking`
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: booking
        });

    } catch(err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            error: 'Cannot update booking'
        });
    }
};

//@desc    Delete booking
//@route   DELETE /api/v1/bookings/:id
//@access  Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if(!booking) {
            return res.status(404).json({
                success: false,
                error: `No booking with id : ${req.params.id}`
            });
        }

        // Make sure user is booking owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to delete this booking`
            });
        }

        await booking.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch(err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            error: 'Cannot delete booking'
        });
    }
};