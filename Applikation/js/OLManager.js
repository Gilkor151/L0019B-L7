/**
 * Hanterar OpenLayers-kartan och dess konfiguration.
 *
 * @class
 */
export default class OLManager {
    constructor(uiManager, featuresManager) {
        /**
         * @constructor
         * @param {UIManager} uiManager - Hanterare för användargränssnittet.
         * @param {FeaturesManager} featuresManager - Hanterare för geoobjekt.
         */
        this.uiManager = uiManager;
        this.featuresManager = featuresManager;
        this.elementCreation = this.uiManager.elementCreation;
        this.map = null;
        this._initialize();
    }

    //Tilldelar en Features Manager till det aktuella objektet.
    setFeaturesManager = (featuresManager) => this.featuresManager = featuresManager;

    /**
     * Initialiserar kartan med fördefinierade parametrar och lager.
     */
    _initialize() {
        // Fördefinierade startparametrar för kartan
        const latitude = 22.117559, longitude = 65.611692, startZoom = 12;

        // Skapar lager
        const osmLayer = this._baseOSMLayer()
        const osmCycleLayer = this._OSMLayer('https://{a-c}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', 'osmCycleLayer');
        const satelliteLayer = this._OSMLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 'satelliteLayer');
        const openSeaMapLayer = this._OSMLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', 'openSeaMapLayer');
        const gammelstadLayer = this._groupLayer([this._WMSLayer('gammelstad', 'Byggnader_kyrkbyn'), this._WMSLayer('gammelstad', 'Fastighetsgranser'),  this._WMSLayer('gammelstad', 'Vagkontur')], 'Gammelstad');
        const hagnanLayer = this._groupLayer([this._WMSLayer('gammelstad', 'hagnan-polygons'), this._WMSLayer('gammelstad', 'hagnan-lines'),  this._WMSLayer('gammelstad', 'hagnan-points')], 'Hägnan');

        // Grupperar baslager & valfria lager för kartan
        const baseLayers = [osmLayer, osmCycleLayer, satelliteLayer];
        const optionalLayers = [gammelstadLayer, hagnanLayer, openSeaMapLayer];

        // Skapar karta
        this.map = this._createMap(baseLayers.concat(optionalLayers), latitude, longitude, startZoom);
        this.mapPosition = this._mapPosition.bind(this);

        // Justerar synligheten för vissa lager
        osmCycleLayer.setVisible(false);
        satelliteLayer.setVisible(false);
        gammelstadLayer.setVisible(true);

        for (const [index, layer] of baseLayers.entries()) {
            document.querySelector('#option-' + layer['values_'].title).addEventListener('click', function() {
                for (const [i, l] of baseLayers.entries()) l.setVisible(i === index);
            });
        }

        // Hanterar synlighet för lager och lagergrupper
        this.uiManager.handleLayerVisibility(gammelstadLayer, document.querySelector('#option-kyrkbyn'));
        this.uiManager.handleLayerVisibility(hagnanLayer, document.querySelector('#option-hagnan'));
        this.uiManager.handleLayerVisibility(openSeaMapLayer, document.querySelector('#option-openSeaMap'));

        // Avmarkerar alla valda lageralternativ och markerar standardalternativen
        this.uiManager.uncheckAll();
        document.querySelector('#option-osmLayer').checked = true;
        document.querySelector('#option-kyrkbyn').checked = true;

        // Hämtar användarens nuvarande position och uppdaterar UI:et
        navigator.geolocation.getCurrentPosition((position) => this.uiManager.updateUserPosition(position), this.elementCreation.errorMessage('Kunde ej hämta position.'));
        // Uppdaterar kartans position i UI:et
        this.uiManager.updateMapPosition(longitude, latitude);
        // Lyssnar på förändringar av kartans position
        this.map.getView().addEventListener("change", this.mapPosition);

        // Konfigurerar transparens-slider för valfria lager
        this.uiManager.setupTransparencySlider(optionalLayers, this.map);

        // Lägger till event-listener för att hantera objektinformation vid klick på kartan
        this.map.addEventListener('click', function(event) {
            this.featuresManager.makeFeatureInfoRequest(this.map, [gammelstadLayer, hagnanLayer], event.coordinate);
        }.bind(this));
    }

    /**
     * Skapar ett WMS-lager med angivet workspace, lagernamn och titel.
     *
     * @param {string} workspace - Arbetsutrymmet för lagret.
     * @param {string} layerName - Namnet på lagret.
     * @param {string} title - Titeln för lagret (valfri).
     * @return {ol.layer.Tile} En instans av OpenLayers-tilelager för WMS.
     */
    _WMSLayer(workspace, layerName, title) {
        // Om ingen titel anges används lagernamnet som titel
        const layerTitle = title || layerName;

        return new ol.layer.Tile({
            // Skapar källan för Geoserver-lagret med angiven URL, workspace och parametrar
            source: new ol.source.TileWMS({
                url: 'http://localhost:8080/geoserver/' + workspace + '/wms',
                params: {'LAYERS': layerName, 'TILED': true},
                serverelement: 'geoserver'
            }),
            title: layerTitle
        });
    }

    /**
     * Skapar ett baslager med OpenStreetMap.
     *
     * @return {ol.layer.Tile} En instans av OpenLayers-tilelager för OpenStreetMap.
     */

    _baseOSMLayer() {
        return new ol.layer.Tile({
            source: new ol.source.OSM(),
            title: 'osmLayer'
        });
    }

    /**
     * Skapar ett OpenStreetMap-lager med angiven URL och titel.
     *
     * @param {string} url - URL:en för OpenStreetMap-tjänsten.
     * @param {string} title - Titeln för lagret.
     * @return {ol.layer.Tile} En instans av OpenLayers-tilelager för OpenStreetMap.
     */
    _OSMLayer(url, title) {
        return new ol.layer.Tile({
            source: new ol.source.OSM({
                opaque: false,
                url: url
            }),
            title: title
        });
    }

    /**
     * Skapar en lagergrupp med angivna lager och titel.
     *
     * @param {Array<ol.layer.Layer>} layers - En array med lager att gruppera.
     * @param {string} title - Titeln för lagergruppen.
     * @return {ol.layer.Group} En instans av OpenLayers-lagergruppen.
     */
    _groupLayer(layers, title) {
        return new ol.layer.Group({
            title: title,
            layers: layers
        });
    }

    /**
     * Skapar en karta med angivna lager, latitud, longitud och zoomnivå.
     *
     * @param {Array<ol.layer.Layer>} layers - En array med lager att lägga till på kartan.
     * @param {number} lat - Latituden för kartcentret.
     * @param {number} lon - Longituden för kartcentret.
     * @param {number} zoom - Zoomnivån för kartan.
     * @return {ol.Map} En instans av OpenLayers-kartan.
     */
    _createMap(layers, lat, lon, zoom) {
        return new ol.Map({
            target: 'map',
            layers: layers,
            view: new ol.View({
                center: ol.proj.fromLonLat([lat, lon]),
                zoom: zoom
            }),
            controls: [
                new ol.control.Zoom(),
                new ol.control.ZoomSlider(),
                new ol.control.ZoomToExtent(),
                new ol.control.FullScreen(),
            ],
        });
    }

    /**
     * Kartlägger positionen baserat på händelsen.
     *
     * @param {Event} event - Händelsen som utlöser positionsmappningen.
     */
    _mapPosition(event) {
        const center = this.map.getView().getCenter();
        const lonLatCenter = ol.proj.toLonLat(center);
        this.uiManager.updateMapPosition(lonLatCenter[1].toFixed(6), lonLatCenter[0].toFixed(6));
    }
}