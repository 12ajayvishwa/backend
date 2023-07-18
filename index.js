const express = require("express");
const cors = require("cors");
const multer = require('multer');
const path = require('path')
require('./db/config');
const User = require("./db/User");
const Product = require("./db/Product")
const app = express();

const Jwt = require('jsonwebtoken');
const jwtKey = 'e-comm';

app.use(express.json());
app.use(cors())
const prepareResult = (error, data, msg) => {
    return { success: error, data: data, message: msg };
}

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({
    storage: storage,
    limits: { fileSize: 100000 },
    fileFilter: function (req, file, cb) {
        if (
            file.mimetype == 'text/csv' ||
            file.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            cb(null, true)
        } else {
            console.warn('only csv & xlsx files supported!')
            cb(null, false)
        }
    }
}).single("user_file")

app.use('/profile', express.static('uploads'));

app.post("/upload", upload, async (req, resp) => {
    console.log(req.file)
    if (req.file) {
        resp.json({
            success: 1,
            profile_url: `${req.file.filename}`
        })
    }else{
        resp.json({success:0,result:"only csv & xlsx files supported!"})
    }

})
function errHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        res.json({
            success: 0,
            message: err.message
        })
    }
}
app.use(errHandler);
app.post("/register", async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password
    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            resp.send({ result: "something went wrong, please try after somr time" })
        }
        resp.send({ result, auth: token })
    })

})

app.post("/login", async (req, resp) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password");
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    resp.send({ result: "something went wrong, please try after somr time" })
                }
                resp.send({ user, auth: token })
            })

        } else {
            resp.send({ result: "No User Found" })
        }
    } else {
        resp.send({ result: "No User Found" })
    }

});

app.post("/add-product", verifyToken, async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result);
});

app.get("/get-product", verifyToken, async (req, resp) => {
    let productList = await Product.find()
    if (productList.length > 0) {
        resp.send(productList)
    } else {
        resp.send({ result: "No Product Found" })
    }
});

app.delete("/product/:id", verifyToken, async (req, resp) => {
    let result = await Product.deleteOne({ _id: req.params.id })
    resp.send(result);
});

// app.get("/product/:id", async (req, resp) => {
//     try {
//         let result = await Product.findone({ _id: req.params.id });
//         resp.send(result);
//     } catch (e) {
//         resp.send(e)
//         console.log(e);
//     }
// });

app.get("/product/:id", verifyToken, async (req, resp) => {
    try {
        const info = await Product.findById({ _id: req.params?.id });
        if (info) {
            return resp.status(200).json(prepareResult(false, info));
        }
        return resp.status(500).json(prepareResult(false, []));
    } catch (error) {
        console.error(error);
        return resp.status(500).json(prepareResult(false, error.message));
    }
});

app.put("/product/:id", verifyToken, async (req, resp) => {
    try {
        let result = await Product.updateOne({ _id: req.params.id }, {
            $set: req.body
        })
        resp.send(result)
    } catch (e) {
        console.log(e)
    }
});

app.get("/search/:key", verifyToken, async (req, resp) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { category: { $regex: req.params.key } }
        ]
    });
    resp.send(result);
});

function verifyToken(req, resp, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                resp.status(401).send({ result: "please provide valid token" })
            } else {
                next();
            }
        })
    } else {
        resp.status(403).send({ result: "Please add token with header" })
    }
}
app.listen(5000);

