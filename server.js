const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/binance-rate', async (req, res) => {
    try {
        const tradeType = req.query.type || 'BUY';
        
        const payload = {
            asset: 'USDT',
            fiat: 'VES',
            merchantCheck: false,
            page: 1,
            rows: 5,
            tradeType: tradeType,
            transAmount: 0
        };

        const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.code === '000000' && data.data && data.data.length > 0) {
            const prices = data.data.map(ad => parseFloat(ad.adv.price));
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

            res.json({
                success: true,
                rate: avgPrice,
                tradeType: tradeType
            });
        } else {
            res.json({
                success: false,
                error: 'No data available'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
