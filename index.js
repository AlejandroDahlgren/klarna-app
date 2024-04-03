import { getProducts, getProduct} from "./services/api.js";
import { createOrder, retrieveOrder } from "./services/klarna.js";
import express from "express";
const app = express();
import { config } from "dotenv";
config();



app.get('/', async (req, res) => {
    const Products = await getProducts();
    const limitedProducts = Products.filter(product => product.category.id === 3).slice(0,5);
    const markup = `
        <body style="display: flex; justify-content: center; flex-wrap: wrap; width: 90%;
            background: rgb(255,255,255);
                background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,0,0,1) 100%);">
            <div style="
                background: rgb(174,186,238);
                    background: radial-gradient(circle, rgba(174,186,238,1) 0%, rgba(178,233,148,1) 100%);
                        width: 90%; height: 100px; padding: 10px;display: flex; justify-content: center; align-items: center; border: solid 2px black;border-radius: 10px; padding: 10px;">
                <h1>Refurbish your otherwise rubish, buy or sell old products that need a new home!<br>buy one pay for two, help someone in need! (that's me)</br></h1>
            </div>
            ${limitedProducts.map(p => `
                <div style="margin: 30px;width: 400px; height: 400px; padding: 10px; justify-content: center; align-items: center">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;
                            background: rgb(174,186,238);
                                background: radial-gradient(circle, rgba(174,186,238,1) 0%, rgba(178,233,148,1) 100%);
                                    background-color: lightgrey; color: black; border: solid 2px black;border-radius: 10px; padding: 10px; text-align: center;">
                        <img src="${p.images}" style="max-width: 250px; max-height: 250px; margin-bottom: 10px;" />
                        <a style="text-decoration: none; border: 2px solid darkblue;border-radius: 5px; background-color: white;margin: 10px " href="/products/${p.id}">${p.title}</a>
                        <div style="font-weight: bold;">
                            ${p.price + 1500} kr
                        </div>
                        <p style="overflow: hidden; text-overflow: ellipsis; max-height: 50px;">${p.description}</p>
                    </div>
                </div>
            `).join('')}
        </body>
    `;
    res.send(markup);
});


app.get('/products/:id', async function (req, res) {
    try {
        const {id} = req.params;
        const product = await getProduct(id);
        const klarnaJsonResponse = await createOrder(product);
		const html_snippet = klarnaJsonResponse.html_snippet;
		res.send(html_snippet);
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/confirmation', async function (req,res) {
    const order_id = req.query.order_id;
	const klarnaJsonResponse = await retrieveOrder(order_id);
	const html_snippet = klarnaJsonResponse.html_snippet;
	res.send(html_snippet);
});

app.listen(process.env.PORT)