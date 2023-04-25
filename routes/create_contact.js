const express = require('express');
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });

router.get('/', async (req, res) => {
    res.render('create', {});
});

router.post('/', async (req, res) => {
    const contactInfo = req.body;

    //Attempt to geolocate the address. If not found, set the latitude and longitude to 0.
    const result = await geocoder.geocode(contactInfo.address);
    const address = (result.length > 0) ? result[0].formattedAddress : contactInfo.address;
    const lat = (result.length > 0) ? result[0].latitude : 0;
    const lng = (result.length > 0) ? result[0].longitude : 0;

    //Add the contact to the database and redirect back to the main page.
    const contact = {
        first: contactInfo.first,
        last: contactInfo.last,
        address: address,
        phone: contactInfo.phone,
        email: contactInfo.email,
        title: contactInfo.title,
        contact_by_phone: contactInfo.contact_by_phone,
        contact_by_email: contactInfo.contact_by_email,
        contact_by_mail: contactInfo.contact_by_mail,
        latitude: lat,
        longitude: lng
    }

    await req.db.createContact(contact);

    res.redirect('/');
});

module.exports = router;