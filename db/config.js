// const { default: mongoose } = require('mongoose');
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://ajayvish21099:ajayvish21099@cluster0.sdpqsau.mongodb.net/e-commerce?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(() => {
        console.log(`connection successful`)
    }).catch((err) => console.log(err));