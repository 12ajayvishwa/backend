const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    path: String,

});

module.exports = mongoose.model("file", FileSchema)