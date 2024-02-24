require('dotenv').config();
console.log(process.env.NODE_ENV);
// dependencies
const express = require('express')
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const { logger, logEvents } = require('./middlwares/logger');
const errorHandler = require('./middlwares/errHandler');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const { default: mongoose } = require('mongoose');
const PORT = process.env.PORT || 1000;
// Middlewares
app.use(logger);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', require('./routes/root'))
// Routes
app.all('*', (req, res)=>{
    // res.status(404);
    if(req.accepts('html')) res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    else if(req.accepts('json')) res.status(404).json({'message': '404 not found'})
    else res.type('txt').status(404).send('404 not found');
})
// connection with database
connectDB();
app.use(errorHandler);
mongoose.connection.once('open', ()=>{
    console.log('Connected to MongoDB')
    app.listen(PORT, ()=> console.log(`Server is running on PORT: ${PORT}`));
})

mongoose.connection.on('error', err =>{
    console.log(err);

    logEvents(`${err.no}\t${err.code}\t${err.syscall}\t${err.hostname}\n`, 'mongoErrLogs.log');
})