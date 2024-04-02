/**
 * Hanterar förfrågningar om objektinformation från olika typer av lager/lagergrupper och visar informationen på kartan.
 *
 * @class
 */
export default class FeaturesManager {
    /**
     * @constructor
     * @param {UIManager} uiManager - Hanterare för användargränssnittet.
     */
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.elementCreation = this.uiManager.elementCreation;
    }

    /**
     * Gör en förfrågan om objektinformation till geoserverLayerGroup för den angivna kartan och koordinaten.
     *
     * @param {ol.Map} map - Kartobjektet.
     * @param {Array<ol.layer.Layer>} geoserverLayerGroups - Gruppen av lager.
     * @param {Array<number>} coordinate - Koordinaterna för platsen.
     */
    makeFeatureInfoRequest(map, geoserverLayerGroups, coordinate) {
        // Initialiserar variabler för att spåra sökstatus och antal bearbetade lager
        let foundData = false, layerCount = 0, processedLayers = 0;

        // Loopar igenom alla lagergrupper
        for (const group of geoserverLayerGroups) {
            layerCount += group.getLayers().getArray().length;

            // Loopar igenom varje lager i lagergruppen
            for (const layer of group.getLayers().getArray()) {
                const source = layer.getSource();

                if (source) {
                    // Hämtar URL för att begära objektinformation från källan vid den givna koordinaten på kartan
                    const url = this._getFeatureInfoUrl(source, coordinate, map);

                    if (url) {
                        // Utför en fetch-anrop för att hämta objektinformation från den angivna URL:en
                        fetch(url)
                            .then(response => {
                                // Om svaret inte är ok, visa ett felmeddelande
                                if (!response.ok) this.elementCreation.errorMessage('Nätverksfel.');
                                return response.json();
                            })
                            .then(data => {
                                // Om det finns geoobjekt i svaret och inga data har hittats ännu
                                if (data.features.length > 0 && foundData === false) {
                                    // Hantera responsen för objektinformation och visa den i en popup
                                    this._handleFeatureInfoResponse(data, map, coordinate);
                                    foundData = true;
                                } else if (!foundData && processedLayers === layerCount - 1) {
                                    // Om inga data har hittats och alla lager har bearbetats, visa ett meddelande om att inga objekt har hittats
                                    this.elementCreation.errorMessage('Inga objekt funna.');
                                }
                                processedLayers++;
                            })
                            // Hanterar eventuella fel som kan uppstå vid hämtning eller bearbetning av JSON-data
                            .catch(error => { this.elementCreation.errorMessage('Kunde ej hämta objekt. Detaljer: ' + error.message); });
                    }
                }
            }
        }
    }

    /**
     * Hanterar svaret från förfrågan om feature information.
     *
     * @param {object} response - Svarobjektet från förfrågan om feature information.
     * @param {ol.Map} map - Kartobjektet.
     * @param {Array<number>} coordinate - Koordinaterna för platsen.
     */
    _handleFeatureInfoResponse(response, map, coordinate) {
        // Rensar befintliga geoobjekt och visar nya i en tabell i UI:et
        this.uiManager.clearFeatures();
        this.elementCreation.featuresTable(response, document.querySelector('#features'));

        // Extraherar egenskaperna för det första geoobjektet från responsen
        const featureProperties = response.features[0].properties;

        // Om geoobjektet har ett giltigt BID, hämta data för det från en JSON-fil
        if ('BID' in featureProperties && featureProperties['BID'] !== '') {
            // Söker efter data för det aktuella BID:et i JSON-filen
            this._searchJson('data/data.json', featureProperties['BID'].slice(1))
                .then(result => {
                    // Förbereder kortelement och kortdata för det hittade objektet och dess egenskaper
                    const data = this._prepareCardData(result, featureProperties);
                    const card = this.elementCreation.card(data);

                    // Justerar placeringen av titeln för popupen för att passa innehållet
                    setTimeout(function() {
                        const navTabTitleContainer = card.querySelector('button.nav-link');
                        navTabTitleContainer.style.marginRight = (425 - navTabTitleContainer.getBoundingClientRect().width) + 'px';
                    }, 10);

                    // Lägger till en event-lyssnare för stängknappen för att stänga popupen
                    card.querySelector('.close-button').addEventListener('click', () => {
                        popup.setPosition(undefined);
                        map.removeOverlay(popup);
                    });

                    // Skapar en ny popup med kortdata
                    const popup = this._newPopup(card);
                    map.addOverlay(popup);
                    popup.setPosition(coordinate);
                })
                // Hanterar fel som kan uppstå vid sökning efter objektdatan
                .catch(error => this.elementCreation.errorMessage('Kunde inte hitta objekt.'));
        }
    }

    /**
     * Söker igenom en JSON-fil som finns på den angivna URL:en och returnerar objektet med matchande ID.
     *
     * @param {string} jsonUrl - URL:en till JSON-filen som ska sökas igenom.
     * @param {string} targetId - ID:t som söks efter i JSON-filen.
     * @return {Object} Ett objekt som innehåller resultatet av sökningen. Om ingen matchning hittas, returneras undefined.
     */

    _searchJson(jsonUrl, targetId) {
        return fetch(jsonUrl)
            // Parsar JSON-svaret från fetch-anropet
            .then(response => response.json())
            // Söker efter objektet med rätt ID och returnerar det om det finns
            .then(data => {
                const result = data.find(obj => obj.ID === targetId);
                if (result) return result;
            })
            // Hanterar fel som kan uppstå under hämtning eller bearbetning av JSON
            .catch(error => {
                this.elementCreation.errorMessage("Kunde inte hämta JSON.");
            });
    }

    /**
     * Kontrollerar om den angiven URL:en existerar genom att skicka en HEAD-förfrågan.
     *
     * @param {string} url - URL:en att kontrollera.
     * @return {boolean} Returnerar true om URL:en existerar, annars false.
     */
    _UrlExists(url) {
        let http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status!=404;
    }

    /**
     * Kontrollerar om sträng existerar och returnerar den, returnerar annars 'N/A'.
     *
     * @param {string} str - variabeln som ska kontrolleras.
     * @return {string} variabeln om den existerar, annars 'N/A'.
     */
    _stringExists(str) {
        if (str !== undefined && str !== null && str !== '') return str;
        else return 'N/A';
    }

    /**
     * Kontrollerar om den angivna arrayen existerar och har element,
     * och returnerar den. Annars returneras ['N/A'].
     *
     * @param {array<any>} array - den angivna arrayen som ska kontrolleras.
     * @return {Array} den angivna arrayen om den existerar, annars ['N/A'].
     */
    _arrayExists(array) {
        if (array !== undefined && array !== null && array.length > 0) return array;
        else return ['N/A'];
    }

    /**
     * Hämtar URL:en för feature information baserat på källan, koordinaterna och kartan.
     *
     * @param {ol.source.Source} source - Källan för informationen.
     * @param {Array<number>} coordinate - Koordinaterna för platsen.
     * @param {ol.Map} map - Kartobjektet.
     * @return {string} URL:en för feature information.
     */
    _getFeatureInfoUrl(source, coordinate, map) {
        return source.getFeatureInfoUrl(
            coordinate, map.getView().getResolution(), map.getView().getProjection(),
            {'INFO_FORMAT': 'application/json'}
        );
    }

    /**
     * En funktion för att förbereda kartdata baserat på den angivna resultatet och funktionsegenskaperna.
     *
     * @param {Object} result - Objektet för resultatet att extrahera data från.
     * @param {Object} featureProperties - Objektet för funktionsegenskaperna att extrahera data från.
     * @return {Object} Det förberedda kortdataobjektet.
     */
    _prepareCardData(result, featureProperties) {
        let data = {};
        // Skapar URL:er för bilder baserat på funktionsegenskaper och resultat
        const bidImage = './data/inv/' + featureProperties['FOTO_1'] + '.jpg';
        const jsonImage = './data/inv/' + result.photo.urls[0] + '.jpg';

        // Om bild-URL:en från funktionsegenskaper finns, använd den som bild
        if (this._UrlExists(bidImage)) data.image = bidImage;
        // Om bild-URL:en från resultatet finns, använd den som bild
        if (this._UrlExists(jsonImage)) data.image = jsonImage;
        // Om ingen av bild-URL:erna finns, använd standardbilden
        else data.image = 'data/inv/default.png';

        // Skapar kortdata för titel, plats, bildtext, beskrivning, omdöme och åtgärder
        data.title = 'Stuga ' + this._stringExists(result.name);
        data.location = ' (' + this._stringExists(result.name) + ')';
        data.imageFooter = this._stringExists(result.photo.name);
        data.description = this.elementCreation.list(this._arrayExists(result.description));
        data.review = this._stringExists(result.review);
        data.action = this.elementCreation.list(this._arrayExists(result.action));

        return data;
    }

    /**
     * Skapar en ny popup för OpenLayers-kartan.
     *
     * @param {Element} element - HTML-elementet som ska användas som popup.
     * @return {ol.Overlay} En overlay för popupen.
     */
    _newPopup(element) {
        return new ol.Overlay({
            element: element,
            positioning: 'bottom-center',
            stopEvent: true
        });
    }
}