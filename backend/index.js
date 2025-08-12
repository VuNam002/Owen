const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;

dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(logger("dev"));
app.use(cookieParser());

require("./config/database").connect();
require("./v1/routers/admin/indexRouters")(app); 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
