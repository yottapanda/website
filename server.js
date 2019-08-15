'use strict';

const express = require('express');

// App
const app = express();
app.use("/", express.static('public'));
app.use("/three", express.static('node_modules/three'));

let port = 8080;
if (process.env.PRODUCTION != undefined) port = 80
app.listen(port, '0.0.0.0');
console.log(`Server running on port ${port}...`);
