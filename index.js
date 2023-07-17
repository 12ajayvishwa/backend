const express = require("express");
const cors = require("cors")
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

app.post("/add-product", async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result);
});

app.get("/get-product", async (req, resp) => {
    let productList = await Product.find()
    if (productList.length > 0) {
        resp.send(productList)
    } else {
        resp.send({ result: "No Product Found" })
    }
});

app.delete("/product/:id", async (req, resp) => {
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

app.get("/product/:id", async (req, resp) => {
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

app.put("/product/:id", async (req, resp) => {
    try {
        let result = await Product.updateOne({ _id: req.params.id }, {
            $set: req.body
        })
        resp.send(result)
    } catch (e) {
        console.log(e)
    }
});

app.get("/search/:key", async (req, resp) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { category: { $regex: req.params.key } }
        ]
    });
    resp.send(result);
})

app.listen(5000);

