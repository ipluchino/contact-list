const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const contacts = await req.db.getContacts();
    res.json({contacts: contacts});
});

module.exports = router;