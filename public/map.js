let map = undefined;
markers = [];

//Initializes the map
const initializeMap = () => {
    map = L.map('map').setView([39, -95], 3);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

const loadMarkers = (contacts) => {
    //Clearing the markers currently on the map
    for (let i = 0; i < markers.length; i++) {
        map.removeLayer(markers[i]);
    }

    for (const c of contacts) {
        //Adding each place as a marker on the map
        const place_info = {
            label: (!c.First_Name && !c.Last_Name) ? 'No Name Provided' : c.Title + ' ' + c.First_Name + ' ' + c.Last_Name,
            address: c.Address,
            lat: c.Latitude,
            lng: c.Longitude
        };

        //If the place is unfound or the lat/long is missing, don't add a marker to the map
        if (place_info.lat === '' || place_info.lng === '' || (place_info.lat === 0 && place_info.lng === 0)) {
            continue;
        }

        const marker = L.marker([place_info.lat, place_info.lng]).addTo(map).bindPopup(`<b>${place_info.label}</b><br/>${place_info.address}`);
            markers.push(marker);
        }
}


