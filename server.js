const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 4000;
const apiRouter = require('./Api/Api');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use('/api', apiRouter);
app.use(errorHandler());

app.listen(PORT, ()=> {
    console.log(`Server is listening on ${PORT}`);
}); 

module.exports = app;