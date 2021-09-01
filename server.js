//using express for API
const express = require('express');
require('dotenv').config()

const app = express();

app.use('/post/', require('./routes/api/post'));
app.use('/auth/', require('./routes/api/auth'));
app.use('/user/', require('./routes/api/user'));

const PORT = 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));