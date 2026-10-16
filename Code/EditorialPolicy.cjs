"use strict";
const path = require("node:path");
const standardsHome = process.env.BOOK_STANDARDS_HOME
  ? path.resolve(process.env.BOOK_STANDARDS_HOME)
  : path.resolve(__dirname, "../../Book Standards");
module.exports = require(path.join(standardsHome, "EditorialPolicy.cjs"));
