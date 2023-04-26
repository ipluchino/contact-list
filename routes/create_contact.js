const express = require('express');
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });

router.get('/', async (req, res) => {
    res.render('create', {});
});

router.post('/', async (req, res) => {
    const contactInfo = req.body;
    let unfound = false;

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

    if (lat === 0 && lng === 0) unfound = true;

    await req.db.createContact(contact);

    //Send over an error message if the contact that was just created could not be geolocated.
    if (unfound) {
        const name = (!contactInfo.first && !contactInfo.last) ? 'No Name Provided' : `${contactInfo.title} ${contactInfo.first} ${contactInfo.last}`;
        req.flash('msg', `Warning: The address of the contact that you just created, ${name}, could not be geolocated!`);
    }

    res.redirect('/');
});

module.exports = router;