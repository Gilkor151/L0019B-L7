import ElementCreation from './elementCreation.js';
import UIManager from './UIManager.js';
import OLManager from './OLManager.js';
import FeaturesManager from './FeaturesManager.js';

/**
 * Klassen är ansvarig för att initialisera och samordna olika hanterare
 * och funktioner för en OpenLayers-applikationen.
 */

class MapApp {
    constructor() {
        // Initialiserar hanterare för olika verktyg och funktioner
        this.initializeManagers();
    }

    initializeManagers() {
        // Skapar instanser av hanterare
        this.elementCreation = new ElementCreation();
        this.uiManager = new UIManager();
        this.uiManager.setElementCreation(this.elementCreation);

        this.featuresManager = new FeaturesManager(this.uiManager);
        this.uiManager.setFeaturesManager(this.featuresManager);

        this.olManager = new OLManager(this.uiManager, this.featuresManager);
        this.olManager.setFeaturesManager(this.featuresManager);
        this.uiManager.setOLManager(this.olManager);
    }
}

// När dokumentet är färdigladdat, starta appen
document.addEventListener("DOMContentLoaded", function() {
    new MapApp();
});