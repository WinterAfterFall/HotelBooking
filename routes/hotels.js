const express = require('express');
const router = express.Router();

// Include other resource routers
const bookingRouter = require('./bookings');

const {getAllHotels, getOneHotel, createHotel, updateHotel, deleteHotel} = require('../controllers/hotels');

const {protect, authorize} = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:hotelId/bookings', bookingRouter);

/**
 * @swagger
 * components:
 *   schemas:
 *     Hotel:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - telephoneNumber
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the hotel
 *         name:
 *           type: string
 *           description: The name of the hotel
 *         address:
 *           type: string
 *           description: The address of the hotel
 *         telephoneNumber:
 *           type: string
 *           description: The telephone number of the hotel
 *       example:
 *         id: "60c72b2f9b1d8e001c8e4b8e"
 *         name: "Hotel California"
 *         address: "42 Sunset Boulevard, Los Angeles, CA"
 *         telephoneNumber: "+1234567890"
 */
/**
* @swagger
* tags:
*   name: Hotels
*   description: The hotels managing API
*/
/**
 * @swagger
 * /hotels:
 *   get:
 *     summary: Get all hotels
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: The list of hotels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hotel'
 *   post:
 *     summary: Create a new hotel
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hotel'
 *     responses:
 *       201:
 *         description: The hotel was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 */
router.route('/')
    .get(protect, getAllHotels)
    .post(protect, authorize('admin'), createHotel);

/**
 * @swagger
 * /hotels/{id}:
 *   get:
 *     summary: Get a single hotel
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hotel id
 *     responses:
 *       200:
 *         description: The hotel description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *   put:
 *     summary: Update a hotel
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hotel id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Hotel'
 *     responses:
 *       200:
 *         description: The hotel was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hotel'
 *   delete:
 *     summary: Delete a hotel
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hotel id
 *     responses:
 *       200:
 *         description: The hotel was deleted
 */
router.route('/:id')
    .get(protect, getOneHotel)
    .put(protect, authorize('admin'), updateHotel)
    .delete(protect, authorize('admin'), deleteHotel);

module.exports = router;