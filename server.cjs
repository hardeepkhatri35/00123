const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const { generateSignature } = require('./utils/signature.cjs');

const app = express();
const PORT = 3000;

// SANDBOX CREDENTIALS
const merchantId = 'MERCHANTUAT';
const saltKey = 'test_salt_key';
const saltIndex = 1;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Payment page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Payment success page
app.get('/payment-success', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'success.html'));
});

// Create payment route
app.post('/create-payment', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const amountPaise = parseInt(Number(amount) * 100);
    const txnId = 'TXN_' + Date.now();
    const payload = {
      merchantId,
      merchantTransactionId: txnId,
      merchantUserId: 'user_' + Date.now(),
      amount: amountPaise,
      redirectUrl: `http://localhost:${PORT}/payment-success`,
      redirectMode: 'REDIRECT',
      callbackUrl: `http://localhost:${PORT}/payment-success`,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const xVerify = generateSignature(base64Payload, '/pg/v1/pay', saltKey, saltIndex);
    const response = await axios.post(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId,
        },
      }
    );
    if (response.data && response.data.data && response.data.data.instrumentResponse && response.data.data.instrumentResponse.redirectInfo && response.data.data.instrumentResponse.redirectInfo.url) {
      return res.json({ redirectUrl: response.data.data.instrumentResponse.redirectInfo.url });
    } else {
      return res.status(500).json({ error: 'Failed to create payment', details: response.data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Payment creation failed', details: error.message });
  }
});

// Status check route (optional)
app.get('/status/:txnId', async (req, res) => {
  try {
    const { txnId } = req.params;
    const statusPath = `/pg/v1/status/${merchantId}/${txnId}`;
    const xVerify = generateSignature('', statusPath, saltKey, saltIndex);
    const response = await axios.get(
      `https://api-preprod.phonepe.com/apis/pg-sandbox${statusPath}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Status check failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 