/**
 * Hanterar användargränssnittet för kartan genom att tillhandahålla funktioner för att hantera olika komponenter och händelser.
 *
 * - Initierar och uppdaterar kartans visuella element baserat på användarinteraktion.
 * - Anpassar gränssnittet för olika fönsterstorlekar.
 *
 * @class
 */
export default class UIManager {
    /**
     * @constructor
     */
    constructor() {
        this.olManager = null;
        this.featuresManager = null;
        this.elementCreation = null;
        this.isDragging = false;
        this.initial = {X: null, Y: null, Top: null};
        this.layers = null;
        this.map = null;
        this.transparencyElements = null;
        this._initialize();
    }

    setOLManager = (olManager) => this.olManager = olManager;
    setFeaturesManager = (featuresManager) => this.featuresManager = featuresManager;
    setElementCreation = (elementCreation) => this.elementCreation = elementCreation;

    /**
     * Initialiserar funktionen genom att justera fönsterinställningarna,
     * lägga till en händelselyssnare för fönsterstorleksändring och
     * ställa in kartans position för latitud och longitud.
     */
    _initialize() {
        // Justerar fönsterinställningar och lägger till händelselyssnare för fönsterstorleksändringar
        this._adjustWindowSettings();
        window.addEventListener('resize', this._adjustWindowSettings);

        // Hämtar referenser till DOM-elementen för latitud och longitud
        this.mapPositionLatitude = document.querySelector('#position-latitude');
        this.mapPositionLongitude = document.querySelector('#position-longitude');
    }

    /**
     * Rensar features-elementet.
     */
    clearFeatures() {
        document.querySelector('#features').innerHTML = '';
    }

    /**
     * Uppdaterar kartpositionen med den angivna latituden och longituden.
     *
     * @param {string} latitude - beskrivning av parameter
     * @param {string} longitude - beskrivning av parameter
     */
    updateMapPosition(latitude, longitude) {
        this.mapPositionLatitude.innerHTML = latitude;
        this.mapPositionLongitude.innerHTML = longitude;
    }

    /**
     * Avmarkerar alla radioknappar och kryssrutor i dokumentet.
     */
    uncheckAll() {
        for (const radioButton of document.querySelectorAll('input[type="radio"]')) radioButton.checked = false;
        for (const checkbox of document.querySelectorAll('input[type="checkbox"]')) checkbox.checked = false;
    }

    /**
     * Uppdaterar användarens position på webbsidan.
     *
     * @param {position} position - de nya positionskoordinaterna
     */

    updateUserPosition(position) {
        document.querySelector('#user-latitude').innerHTML = position.coords.latitude;
        document.querySelector('#user-longitude').innerHTML = position.coords.longitude;
    }

    /**
     * Funktion för att hantera synligheten av ett lager baserat på värdet av en checkbox.
     *
     * @param {ol.layer.Layer} layer - Lagret vars synlighet ska kontrolleras.
     * @param {Element} checkbox - Checkbox-elementet som styr synligheten.
     */
    handleLayerVisibility(layer, checkbox) {
        if (!checkbox.checked) layer.setVisible(checkbox.checked);
        checkbox.addEventListener('change', function () { layer.setVisible(this.checked); });
    }

    /**
     * Justerar den maximala höjden av elementet #features baserat på fönsterstorlek.
     */
    _adjustWindowSettings() {
        document.querySelector('#features').style.height = (window.innerHeight - 395) + 'px';
        document.querySelector('#error-container').style.left = (window.innerWidth - 400) + 'px';
    }

    /**
     * Ställer in transparens-slidern.
     *
     * @param {Array<ol.layer>} layers - Lagren att ställa in transparensreglaget för.
     * @param {ol.Map} map - Kartobjektet.
     */
    setupTransparencySlider(layers, map) {
        this.layers = layers; this.map = map;
        this.transparencyElements = this.elementCreation.transparencySlider();
        this.transparencyElements.sliderContainer.addEventListener('click', (event) => { this._handleSliderContainerClick(event); });
        this.transparencyElements.slider.addEventListener('mousedown', (event) => { this._startTransparencySliderDrag(event); });
        this.transparencyElements.button.addEventListener('click', () => { this._handleTransparencyButtonClick(); });
        document.body.addEventListener('mousedown', (event) => { this._handleBodyMouseDown(event); });
    }

    /**
     * Hanterar musrörelsehändelser för att justera positionen på transparens-slidern och ställa in opacitet därefter.
     *
     * @param {MouseEvent} moveEvent - Objektet för musrörelsehändelsen.
     */
    _moveHandler = (moveEvent) => {
        // Beräknar förändringen av musens y-koordinat sedan föregående händelse
        const deltaY = moveEvent.clientY - this.initial.Y;
        // Beräknar den nya toppositionen för slidern med hänsyn till min- och maxvärden
        const newTop = Math.min(188, Math.max(0, this.initial.Top + deltaY));
        // Uppdaterar toppositionen för transparens-slidern
        this.transparencyElements.slider.style.top = newTop + 'px';
        // Ställer in opacitet för lagren baserat på den nya toppositionen för slidern
        this._setOpacity(this.layers, newTop);
    };

    /**
     * Hanterar händelser när musknappen släpps och uppdaterar interaktionen därefter.
     */
    _upHandler = () => {
        // Ställer in isDragging-flaggan till false efter en kort fördröjning för att undvika kollision av händelselyssnare flr dragning och klick
        setTimeout(() => { this.isDragging = false; }, 1);
        // Aktiverar övergångseffekten för transparens-slidern
        this.transparencyElements.slider.classList.add('transition-enabled');

        // Avlägsnar händelselyssnare för musrörelser och musklick
        document.removeEventListener('mousemove', this._moveHandler);
        document.removeEventListener('mouseup', this._upHandler);
        document.removeEventListener('mouseup', this._mouseupHandler);
    };

    /**
     * Hanterar händelser när musknappen släpps och utför åtgärder beroende på interaktionen, som klick eller dragning.
     *
     * @param {MouseEvent} upEvent - Objektet för musrörelsehändelsen.
     */
    _mouseupHandler = (upEvent) => {
        // Hämtar startkoordinaterna som sparades under mousedown-händelsen
        const startCoords = { x: this.initial.X, y: this.initial.Y }; // Using initial coordinates captured during mousedown
        const endCoords = { x: upEvent.clientX, y: upEvent.clientY };

        // Kontrollerar om koordinaterna är giltiga
        if (!isNaN(startCoords.x) && !isNaN(startCoords.y) && !isNaN(endCoords.x) && !isNaN(endCoords.y)) {
            // Beräknar avståndet mellan start- och slutkoordinaterna
            const distance = Math.sqrt(
                Math.pow(endCoords.x - startCoords.x, 2) +
                Math.pow(endCoords.y - startCoords.y, 2)
            );

            // Om avståndet är mindre än 5 pixlar betraktas det som en klickhändelse
            if (distance < 5) {
                const containingElement = document.querySelector('.card');

                // Om det finns en popup och om klicket är utanför popup:en, rensa alla popups
                if (!containingElement || !containingElement.contains(upEvent.target)) this.map.getOverlays().clear();
            }
        }
        // Avlägsnar händelseslyssnaren för mouseup
        document.removeEventListener('mouseup', this._mouseupHandler);
    };

    /**
     * Hanterar klickhändelser på transparens-slidern.
     *
     * @param {MouseEvent} event - Objektet för klickhändelse.
     */
    _handleSliderContainerClick = (event) => {
        // Kontrollerar om ingen dragning pågår
        if (!this.isDragging) {
            // Hämtar rektangeln som omger transparens-sliderns behållare
            const containerRect = this.transparencyElements.sliderContainer.getBoundingClientRect();
            // Beräknar den nya toppositionen för slidern baserat på klickhändelsen och behållarens position
            const newTop = Math.min(190, Math.max(0, event.clientY - containerRect.top));
            // Uppdaterar toppositionen för transparens-slidern
            this.transparencyElements.slider.style.top = newTop + 'px';
            // Ställer in opacitet för lagren baserat på den nya toppositionen för slidern
            this._setOpacity(this.layers, newTop);
        }
    };

    /**
     * Börjar dra transparens-slidern baserat på musnedtryckningshändelsen.
     *
     * @param {MouseEvent} event - Objektet för musnedtryckning.
     */
    _startTransparencySliderDrag = (event) => {
        // Sätter isDragging-flaggan till true för att indikera pågående dragning
        this.isDragging = true;
        // Tar bort övergångseffekten
        this.transparencyElements.slider.classList.remove('transition-enabled');
        // Sparar startkoordinaterna för muspekaren vid musnedtryckningshändelsen
        this.initial.Y = event.clientY;
        this.initial.Top = this.transparencyElements.slider.offsetTop;
        // Lägger till händelseslyssnare för mousemove och mouseup för att fortsätta hantera dragningen
        document.addEventListener('mousemove', this._moveHandler);
        document.addEventListener('mouseup', this._upHandler);
    };

    /**
     * Hanterar klickhändelser för transparensknappen genom att justera transparens-slidern till maxvärde och uppdatera opaciteten.
     */
    _handleTransparencyButtonClick = () => {
        // Tar bort övergångseffekten
        this.transparencyElements.slider.classList.remove('transition-enabled');
        // Justerar transparens-slidern till maxvärdet
        this.transparencyElements.slider.style.top = '188px';
        // Ställer in opacitet för lagren till maxvärde
        this._setOpacity(this.layers, 188)

        // Lägger tillbaka övergångseffekten efter en kort fördröjning för att undvika blinkningar
        setTimeout(() => {
            this.transparencyElements.slider.classList.add('transition-enabled');
        }, 200);
    };

    /**
     * Hanterar musnedtryckningshändelser på dokumentet genom att spara initiala muskoordinater och lägga till en lyssnare för musupphändelser.
     *
     * @param {MouseEvent} event - Objektet för musnedtryckning.
     */
    _handleBodyMouseDown = (event) => {
        // Sparar startkoordinaterna för muspekaren vid musnedtryckningshändelsen
        this.initial.X = event.clientX;
        this.initial.Y = event.clientY;
        // Lägger till händelselyssnare för mouseup för att avsluta dragoperationen
        document.addEventListener('mouseup', this._mouseupHandler);
    };

    /**
     * Ställer in genomskinligheten för lagren baserat på det angivna nivåvärdet.
     *
     * @param {Array<ol.layer.Layer>} layers - En array med lagerobjekt.
     * @param {number} level - Nivån för genomskinlighet, en siffra mellan 0 och 188.
     */
    _setOpacity = (layers, level) => {
        // Beräknar opacitetsvärdet baserat på det givna nivåvärdet
        const opacity = level / 188;

        for (const layer of layers) {
            // Om lagret är en lagergrupp, loopa igenom dess underliggande lager och ställ in opaciteten för varje lager
            if (layer instanceof ol.layer.Group) {
                layer.getLayers().forEach(function(innerLayer) {
                    innerLayer.setOpacity(opacity);
                });
            // Annars ställ in opaciteten för det enskilda lagret
            } else layer.setOpacity(opacity);
        }
    };
}