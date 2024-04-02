/**
 * Visar ett felmeddelande.
 *
 * @param {string} message - Det felmeddelande som ska visas.
 */
function errorMessage(message) {
    document.querySelector('#message').innerHTML = '<div class="alert alert-warning" role="alert">' + message + '</div>';
}

/**
 * Funktionen uppdaterar användarens latitud och longitud på webbsidan
 * och placerar en markör på kartan vid den aktuella positionen.
 *
 * @param {position} position - Användarens positionobjekt som innehåller latitud och longitud.
 * @param {L.Map} map - Kartan där markören ska placeras.
 */
function positionSuccess(position, map) {
    const userLatitude = position.coords.latitude;
    const userLongitude = position.coords.longitude;

    document.querySelector('#user-latitude').innerHTML = userLatitude;
    document.querySelector('#user-longitude').innerHTML = userLongitude;

    // Skapa en markör och placera den på kartan vid användarens position
    const userMarker = L.marker([userLatitude, userLongitude]).addTo(map);

    // Skapa en popup för markören
    const popupContent = "Din position";
    const markerPopup = L.popup({ autoPan: false }).setContent(popupContent);

    // Lägg till popup till markören
    userMarker.bindPopup(markerPopup).openPopup();
}

/**
 * Funktion för att hantera positionsfel.
 *
 * @param {Error} error - Felobjektet.
 */
function positionError(error) {
    if (error.code === error.PERMISSION_DENIED) errorMessage('Fel! Användaren har nekat åtkomst till platsinformation.');
    else errorMessage('Fel! Kunde ej hämta position.');
}

/**
 * Skapar ett WMS-kartlager för det angivna arbetsutrymmet och lagernamnet.
 *
 * @param {string} workspace - Workspacet för WMS-kartlagret.
 * @param {string} layerName - Namnet för WMS-kartlagret.
 */
function createLayer(workspace, layerName) {
    return L.tileLayer.wms('http://localhost:8080/geoserver/' + workspace + '/wms', {
        layers: layerName,
        format: 'image/png',
        transparent: true
    });
}

/**
 * Skapar och returnerar ett nytt kartlager med specificerad URL, minsta och högsta zoomnivå samt alternativ text.
 *
 * @param {string} tileURL - URL-mallen för kartlagret.
 * @param {number} minZoom - Minsta zoomnivå för kartlagret.
 * @param {number} maxZoom - Högsta zoomnivå för kartlagret.
 * @param {string} alt - Alternativ text för kartlagret.
 */
function addTileLayer(tileURL, minZoom, maxZoom, alt) {
    return L.tileLayer(tileURL, {
        attribution: '© OpenStreetMap contributors',
        subdomains: 'abc',
        minZoom: minZoom,
        maxZoom: maxZoom,
        alt: alt
    });
}

/**
 * Initialiserar kartapplikationen med fördefinierade startparametrar, lägger till lager och funktioner.
 */
function init() {
    // Fördefinierade startparametrar
    const startLat = 59.272137;
    const startLon = 15.228644;
    const startZoom = 16;

    let parkLayerGroup = L.layerGroup();

    // Skapar kartan med startparametrar och sätter stadsparksgruppen standardlager
    const map = L.map('map', {
        center: [startLat, startLon],
        zoom: startZoom,
        layers: [parkLayerGroup]
    });

    // Skapar och lägger till olika kartlager
    const osmStandardLayer = addTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 1, 18, 'OSM');
    const osmCycleLayer = addTileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', 1, 18, 'CyclOSM');

    // Skapar stadsparkslager och lägger till dem i grupp
    const parkLayers = [1, 2, 3, 4];
    for (const layer of parkLayers) createLayer('stadsparken', 'stadsparken-s' + layer).addTo(parkLayerGroup);

    // Skapar lager för länder och kustlinjer
    const countriesLayer = createLayer('ne', 'countries');
    const coastLayer = createLayer('ne', 'coastlines');

    // Lägger till lager på kartan
    parkLayerGroup.addTo(map);
    countriesLayer.addTo(map);
    coastLayer.addTo(map);

    // Lägg till en lagerväljare
    const baseMaps = {
        "OpenStreetMap": osmStandardLayer.addTo(map),
        "CyclOSM": osmCycleLayer
    };

    const overlayMaps = {
        "Stadsparken": parkLayerGroup,
        "Länder": countriesLayer,
        "Kustlinjer": coastLayer
    };

    // Skapar och lägger till en kartkontroll för lagerval på kartan
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

    // Ta bort länder och kustlinjer från kartan när applikation startas
    map.removeLayer(countriesLayer);
    map.removeLayer(coastLayer);

    // Aktivera geolokalisering för att hämta användarens position
    navigator.geolocation.getCurrentPosition((position) => positionSuccess(position, map), positionError, { enableHighAccuracy: true });

    // Referenser till HTML-element för att visa information om kartposition
    const positionLatitude = document.querySelector('#position-latitude');
    const positionLongitude = document.querySelector('#position-longitude');
    const positionZoom = document.querySelector('#position-zoom');

    // Initialiserar koordinater vid start av applikationen
    positionLatitude.innerHTML = startLat;
    positionLongitude.innerHTML = startLon;
    positionZoom.innerHTML = startZoom;

    map.on('moveend', function() {
        const center = map.getCenter();

        // Uppdaterar HTML-elementen med aktuella koordinater och zoomnivå
        positionLatitude.innerHTML = center.lat.toFixed(6);
        positionLongitude.innerHTML = center.lng.toFixed(6);
        positionZoom.innerHTML = map.getZoom().toFixed(0);
    });
}

// Körs när fönsterinnehållet har laddats
window.addEventListener('DOMContentLoaded', function () {
    init();
});