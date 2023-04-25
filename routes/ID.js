const express = require('express');
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });

const logged_in = (req, res, next) => {
    // If a user is logged in, go to the next request.
    if (req.session.user) {
        next();
    }
    else {
        res.status(401).send("Not Authorized");
    }
}

router.get('/:id/edit', logged_in, async(req, res) => {
    const contactInfo = await req.db.findContactByID(req.params.id);
    res.render('edit', { contact: contactInfo });
});

router.post('/:id/edit', logged_in, async(req, res) => {
    const person = await req.db.findContactByID(req.params.id);
    const contactInfo = req.body;

    //If there isn't a change to the address, no need to waste time geolocating.
    if (contactInfo.address === person.Address) {
        contactInfo.latitude = person.Latitude;
        contactInfo.longitude = person.Longitude;
        await req.db.updateContact(req.params.id, contactInfo);
    }
    else {
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
    
        await req.db.updateContact(req.params.id, contact);
    }
    
    res.redirect('/');
});

module.exports = router;