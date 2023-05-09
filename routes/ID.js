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
        res.status(401).render('unauthorized', { });
    }
}

router.get('/:id', async (req, res) => {
    const contactInfo = await req.db.findContactByID(req.params.id);
    if (!contactInfo) {
        res.status(404).render('notfound', { });
        return;
    }
    res.render('viewID', { contact: contactInfo, msg: req.flash('msg')});
});

router.get('/:id/edit', logged_in, async(req, res) => {
    const contactInfo = await req.db.findContactByID(req.params.id);
    if (!contactInfo) {
        res.status(404).render('notfound', { });
        return;
    }

    //Determine who the refer is, so the application can send you back to the page you were last on.
    //This is because there are two edit buttons, one on the home page and one on :/id.
    let link = '';
    if (req.headers.referer) {
        link = req.headers.referer.substring(req.headers.referer.lastIndexOf('/'));

        if (link !== '/' && link !== ('/' + req.params.id)) {
            //Default to the root as the referer if the referer is not / or /:id.
            link = '/';
        }
    }
    else {
        //Make the default referer go back to the root if it doesn't exist (ex: someone blocking their referer information).
        link = '/';
    }

    //Clear the current refer flash.
    req.flash('refer');

    //Cet the refer flash to the newest link. 
    req.flash('refer', link);
    res.render('edit', { contact: contactInfo, refer: link });
});

router.post('/:id/edit', logged_in, async(req, res) => {
    const person = await req.db.findContactByID(req.params.id);
    const contactInfo = req.body;
    let unfound = false;

    //If there isn't a change to the address, no need to waste time geolocating.
    if (contactInfo.address === person.Address) {
        contactInfo.latitude = person.Latitude;
        contactInfo.longitude = person.Longitude;
        await req.db.updateContact(req.params.id, contactInfo);

        if (contactInfo.latitude === 0 && contactInfo.longitude === 0) unfound = true;
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

        if (lat === 0 && lng === 0) unfound = true;
    
        await req.db.updateContact(req.params.id, contact);
    }
    
    //Send over an error message if the contact that was just edited could not be geolocated.
    if (unfound) {
        const name = (!contactInfo.first && !contactInfo.last) ? 'No Name Provided' : `${contactInfo.title} ${contactInfo.first} ${contactInfo.last}`;
        req.flash('msg', `Warning: The address of the contact that you just edited, ${name}, could not be geolocated!`);
    }

    //Redirect to where the user clicked on the edit button (either / or /:id)
    res.redirect(req.flash('refer'));
});

router.get('/:id/delete', logged_in, async(req, res) => {
    const contactInfo = await req.db.findContactByID(req.params.id);
    if (!contactInfo) {
        res.status(404).render('notfound', { });
        return;
    }

    //Determine who the refer is, so the application can send you back to the page you were last on.
    //This is because there are two delete buttons, one on the home page and one on :/id.
    let link = '';
    if (req.headers.referer) {
        link = req.headers.referer.substring(req.headers.referer.lastIndexOf('/'));

        if (link !== '/' && link !== ('/' + req.params.id)) {
            //Default to the root as the referer if the referer is not / or /:id.
            link = '/';
        }
    }
    else {
        //Make the default referer go back to the root if it doesn't exist (ex: someone blocking their referer information).
        link = '/';
    }

    res.render('delete', { contact: contactInfo, refer: link });
});

router.post('/:id/delete', logged_in, async(req, res) => {
    await req.db.deleteContact(req.params.id);
    res.redirect('/');
});

module.exports = router;