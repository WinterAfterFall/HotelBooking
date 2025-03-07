const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer')
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const User = require('./models/User');

//Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route files
const hotels = require('./routes/hotels');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');

const app = express();

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Hotel Booking API',
            version: '1.0.0',
            description: 'API for Hotel Booking'
        },
        servers: [
            {
                url: 'http://localhost:5001/api/v1'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./routes/*.js']
};

const swaggerDocs=swaggerJsDoc(swaggerOptions);

app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 mins
    max: 100
});
app.use(limiter);

//check if database contain User with admin role
(async () => {
    try {
        // Check if admin exists
        const adminExists = await User.findOne({role: 'admin'});

        // ถ้าไม่มี admin ในฐานข้อมูล
        if (!adminExists) {
            // สร้าง user ใหม่ที่มี role เป็น admin

            const user = await User.create({
                name: 'MyAdmin',
                email: 'Admin@gmail.com',
                telephoneNumber: '0123456789',
                password: '12345678',
                role: 'admin'
            });
            

            console.log('First admin created successfully!');
        } 
    } catch (error) {
        console.error('Error creating first admin:', error.message);
    }
})();

//Prevent http param pollution
app.use(hpp());

//Enable CORS
app.use(cors());

//Mount routers
app.use('/api/v1/hotels', hotels);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

//Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise) => {
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(() => process.exit(1));
});