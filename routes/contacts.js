const express = require('express');
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });

router.get('/', async (req, res) => {
    const contacts = await req.db.getContacts();
    res.json({contacts: contacts});
});

router.post('/', async (req, res) => {
    const result = await geocoder.geocode(req.body.address);
    res.json({result: result});
});

module.exports = router;