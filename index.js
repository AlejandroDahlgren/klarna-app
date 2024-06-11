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
        display: flex;
        justify-content: center; 
        flex-wrap: wrap; 
        width: 1200px; 
        margin: auto;
        ">
            <div style="
            background: rgb(8,102,255) ; 
            width: 100%; height: 100px; 
            padding: 10px;display: 
            flex; justify-content: center; align-items: center; 
            border: solid 2px black;border-radius: 10px; 
            padding: 10px;">
                <h1 style="color: white;">Refurbish your otherwise rubish, buy or sell old products that need a new home!<br>buy one pay for two, help someone in need! (thats me!)</br></h1>
            </div>
            ${limitedProducts
				.map(
					(p) => `
                <div style="
                margin: 10px;
                width: 400px; 
                height: 435px; 
                justify-content: center; 
                align-items: center;
                background: rgb(8,102,255);
                border-radius: 13px;
                ">
                    <div style="
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        justify-content: center;
                        color: white; 
                        border: solid 2px black;
                        border-radius: 10px; 
                        padding: 10px; 
                        text-align: center;"
                        >
                        <img    
                            src="${p.images}" 
                             
                            style="
                                max-width: 350px; 
                                max-height: 250px; 
                                margin-bottom: 10px;" />
                        <a 
                        href="/products/${p.id}"
                        style="
                            text-decoration: none; 
                            border: 2px solid darkblue;
                            border-radius: 5px; 
                            background-color: lightgray;
                            margin: 10px;
                            padding: 5px;
                        ">${p.title}</a>
                        <div 
                            style="font-weight: bold;">
                            ${p.price} kr
                        </div>
                        <p style="
                        overflow: hidden; 
                        text-overflow: ellipsis; 
                        max-height: 50px;
                        ">${p.description}</p>
                    </div>
                </div>
            `
				)
				.join('')}
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
