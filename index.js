import { getProducts, getProduct } from './services/api.js';
import { createOrder, retrieveOrder } from './services/klarna.js';
import express from 'express';
const app = express();
import { config } from 'dotenv';
config();

app.get('/', async (req, res) => {
    const Products = await getProducts();
    const limitedProducts = Products.filter((product) => product.category.id === 3).slice(0, 5);
    const markup = `
        <body style="
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        ">
            <div class="title"
            style="
            position:fixed;
            top: 0;
            left: 0;
            z-index: 10;
            background: rgb(69,102,255); 
            width: 100%; 
            height: 100px; 
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            ">
                <h1 style="
                color: white; 
                text-align: center;
                ">Test site for buying products using Klarnas API</h1>
            </div>
            <div class="products-container" style="
            position: relative;
            top: 140px;
            display: flex; 
            flex-wrap: wrap;
            gap: 25px;
            width: 100%;
            max-width: 1200px;
            ">
            ${limitedProducts
                .map(
                    (p) => `
                <div class="product-card" style="
                width: 380px; 
                height: auto;
                align-items: center;
                background: rgb(69,102,255);
                border-radius: 5px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-sizing: border-box;
                ">
                    <div class="product-card-content" style="
                        display: flex; 
                        flex-direction: column;
                        align-items: center; 
                        justify-content: center;
                        color: white; 
                        border-radius: 10px; 
                        padding: 10px; 
                        text-align: center;
                        width: 100%;
                        box-sizing: border-box;
                        ">
                        <img    
                            src="${p.images}" 
                            style="
                                max-width: 100%; 
                                max-height: 250px; 
                                margin-bottom: 10px;
                                padding-top: 10px;
                                " />
                        <a 
                        href="/products/${p.id}"
                        style="
                            text-decoration: none;
                            border-radius: 5px; 
                            background-color: lightgray;
                            color: black;
                            margin: 10px;
                            padding: 5px;
                            width: 100%;
                            box-sizing: border-box;
                        ">${p.title}</a>
                        <div 
                            style="font-weight: bold;">
                            ${p.price} kr
                        </div>
                        <p style="
                        overflow: hidden; 
                        text-overflow: ellipsis; 
                        max-height: 50px;
                        width: 100%;
                        box-sizing: border-box;
                        ">${p.description}</p>
                    </div>
                </div>
            `
                )
                .join('')}
            </div>
            <style>
                @media (max-width: 980px) {
                    .title {
                        transform: scale(3);
                    }
                    .title h1{
                        font-size: 15px;
                        margin-top: 40px;
                    }
                    .products-container {
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-around;
                    }
                    .product-card {
                        margin-top: 350px;
                        transform: scaleY(1.8) scaleX(1.8);
                    }
                }
            </style>
        </body>
    `;
    res.send(markup);
});

app.get('/products/:id', async function (req, res) {
    try {
        const { id } = req.params;
        const product = await getProduct(id);
        const klarnaJsonResponse = await createOrder(product);
        const html_snippet = klarnaJsonResponse.html_snippet;
        res.send(html_snippet);
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/confirmation', async function (req, res) {
    const order_id = req.query.order_id;
    const klarnaJsonResponse = await retrieveOrder(order_id);
    const html_snippet = klarnaJsonResponse.html_snippet;
    res.send(html_snippet);
});

app.listen(process.env.PORT);
