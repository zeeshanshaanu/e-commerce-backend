const express = require('express');
const cors = require("cors")//cors error resolve
const jwt = require("jsonwebtoken");
const jwtkey = "e-comm"


require("./db/config");
const User = require("./db/Users");
const Product = require("./db/Product");


const app = express();

app.use(express.json()); //these are middleware
app.use(cors()); //these are middleware

// REGISTER API
app.post("/register", async (req, res) => {
    let user = await new User(req.body);
    let result = await user.save();
    result = result.toObject();// for not show the password in response
    delete result.password;// for not show the password in response
    // res.send(result);
    jwt.sign({ result }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            res.send({ result: "something went wrong." });
        }
        res.send({ result, auth: token });
    })
})

// LOGIN api 
app.post("/login", async (req, res) => {
    let user = await User.findOne(req.body).select("-password");

    if (req.body.email && req.body.password) {
        if (user) {
            jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    res.send({ result: "something went wrong." });
                }
                res.send({ user, auth: token });
            })
        } else {
            res.send({ result: "No user found." });
        }
    }
    else {
        res.send({ result: "No user found." });
    }
}
)

// ADD PRODUCT-API
app.post("/add-product", verifytoken, async (req, res) => {
    let product = new Product(req.body);
    let result = await product.save()
    console.log(result);
    res.send(result);
})

// GET ALL PRODUCTS-API
app.get("/products", verifytoken, async (req, res) => {
    let data = await Product.find();

    if (data?.length > 0) {
        res.send(data)
    } else {
        res.send({ result: "products not found." });
    }
})
// DELETE PRODUCY-API
app.delete("/product/:id", verifytoken, async (req, res) => {
    let product = await Product.deleteOne({ _id: req.params.id });
    res.send(product);

})

// GET SPECIFIC PRODUCT BY ID
app.get("/product/:id", verifytoken, async (req, res) => {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
        res.send(result);
    } else {
        res.send({ result: "No data found." })
    }
})

// UPDATE PRODUCT-API
app.put("/product/:id", verifytoken, async (req, res) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    );
    res.send(result);
})

// SEARCH PRODUCT-API
app.get("/search/:key", verifytoken, async (req, res) => {
    let data = await Product.find(
        {
            "$or": [
                { name: { $regex: req.params.key } },
                { price: { $regex: req.params.key } },
                { category: { $regex: req.params.key } },
                { company: { $regex: req.params.key } },
            ]
        }
    )
    res.send(data)
})
// VERIFY TOKEN MIDDLEWARE
function verifytoken(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(" ")[1]
        jwt.verify(token, jwtkey, (err, valid) => {
            if (err) {
                res.status(401).send({ result: "please provide valid token." })
            } else {
                next();
            }
        })
    } else {
        res.status(403).send({ result: "please add the token." })
    }
}

// 
// 
// 
// 
app.listen(5000); 