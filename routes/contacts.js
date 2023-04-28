const express = require('express');
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });

router.get('/', async (req, res) => {
    const contacts = await req.db.getContacts();
    res.json({contacts: contacts});
});

router.post('/', async (req, res) => {
    let unfound = false;
    let filteredContacts = [];
    const result = await geocoder.geocode(req.body.address);
    
    if (result.length > 0) {
        filteredContacts = searchByProximity(req.body.contacts, result[0], req.body.range);
    }
    else {
        unfound = true;
        res.json({unfound: unfound});
        return;
    }

    res.json({filteredContacts: filteredContacts, lat: result[0].latitude, lng: result[0].longitude, unfound: unfound});
});

//This function takes an address and a list of contacts to search through. It returns a list of contacts that are within the proximity.
const searchByProximity = (contacts, address, range) => {
    const lat = address.latitude;
    const lng = address.longitude;
    let filteredContacts = [];
    
    for (c of contacts) {
        if (c.Latitude === 0 && c.Longitude === 0) continue;
        
        const dist = distance(lat, lng, c.Latitude, c.Longitude, 'M');
        if (dist <= range) {
            filteredContacts.push(c);
        }
    }

    return filteredContacts;
};

//This function calculates the distance between two lat/long pairs. 
const distance = (lat1, lon1, lat2, lon2, unit) => {
    if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

module.exports = router;