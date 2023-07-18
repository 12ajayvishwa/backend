// const { default: mongoose } = require('mongoose');
const mongoose = require('mongoose');


mongoose.connect("mongodb://127.0.0.1:27017/e-commerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log(`connection successful with mongo commpass`)
}).catch((err) => console.log(err));
// mongoose.connect("mongodb+srv://ajayvish21099:ajayvish21099@cluster0.sdpqsau.mongodb.net/e-commerce?retryWrites=true&w=majority", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     console.log(`connection successful`)
// }).catch((err) => console.log(err));