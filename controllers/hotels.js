const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const User = require('../models/User');
// @desc    Get all hotels
// @route   GET /api/v1/hotels
// @access  Public
exports.getAllHotels = async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    console.log(reqQuery);

    // Create operators ($gt, $gte, etc)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Hotel.find(JSON.parse(queryStr));

    //Conditional Populating
    if (req.user.role === 'admin') {
        query = query.populate('bookings'); // Populate all bookings for admins
    }

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Hotel.countDocuments();

    query = query.skip(startIndex).limit(limit);

    try {
        const hotels = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: hotels.length,
            pagination,
            data: hotels
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Get single hotel
// @route   GET /api/v1/hotels/:id
// @access  Public
exports.getOneHotel = async (req, res, next) => {
    try {
        let query = Hotel.findById(req.params.id);

        //Conditional Populating
        if (req.user.role === 'admin') {
            query = query.populate('bookings'); // Populate all bookings for admins
        }

        const hotel = await query;
        if (!hotel) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: hotel });
    }
    catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Create new hotel
// @route   POST /api/v1/hotels
// @access  Private
exports.createHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.create(req.body);
        res.status(201).json({ success: true, data: hotel });
    } catch (err) {
        let errorMessage = "Server error";

        // Handle Mongoose validation errors
        if (err.name === "ValidationError") {
            errorMessage = Object.values(err.errors).map(val => val.message).join(", ");
        }

        res.status(400).json({ success: false, error: errorMessage });
    }
};

// @desc    Update hotel
// @route   PUT /api/v1/hotels/:id
// @access  Private
exports.updateHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!hotel) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: hotel });
    }
    catch (err) {
        res.status(400).json({ success: false });
    }
};

// @desc    Delete hotel
// @route   DELETE /api/v1/hotel/:id
// @access  Private
exports.deleteHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return res.status(400).json({
                success: false,
                message: `Hotel not found with id ${req.params.id}`
            });
        }

        await Booking.deleteMany({ hotel: req.params.id });
        await Hotel.deleteOne({ _id: req.params.id });
        res.status(200).json({ success: true, data: {} });
    }
    catch (err) {
        res.status(400).json({ success: false });
    }
};
