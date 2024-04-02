/**
 * Hanterar skapandet av olika HTML-element för att visa data och interagera med användargränssnittet.
 *
 * - Skapar kortelement för att visa data med olika flikar för beskrivning, omdöme och åtgärder.
 * - Skapar tabeller baserat på inkommande data och lägger till dem i angivna förälderelement.
 * - Skapar ett transparens-slider för kartan.
 * - Skapar HTML-listor.
 * - Skapar Felmeddelanden.
 *
 * @class
 */
export default class ElementCreation {
    /**
     * @constructor
     */
    constructor() {}

    /**
     * Genererar ett kortelement med alla nödvändiga komponenter för att visa data.
     *
     * @param {Object} data - Objekt som innehåller datan som ska visas på kortet.
     * @return {Element} Det konstruerade kortelementet.
     */
    card(data) {
        const card = this._create({ element: 'div', class: 'card mb-3 popup-card', parent: document.getElementById('popupContainer') });

        const navTabRow = this._create({ element: 'div', class: 'row no-gutters', parent: card });
        const navTabCol = this._create({ element: 'div', class: 'col-md-12 p-0', parent: navTabRow });
        const navTabCard = this._create({ element: 'div', class: 'card-body', parent: navTabCol });
        const navTabList = this._create({ element: 'div', class: 'nav nav-tabs justify-content-end', role: 'tablist', parent: navTabCard });
        const navTabTitleContainer = this._create({ element: 'button', class: 'nav-link', type: 'button', parent: navTabList });

        this._create({ element: 'button', class: 'nav-link active', 'data-bs-toggle': 'tab', 'data-bs-target': '#nav-description', role: 'tab', 'aria-controls': 'nav-description', 'aria-selected': 'true', type: 'button', textContent: 'Beskrivning', parent: navTabList });
        this._create({ element: 'button', class: 'nav-link', 'data-bs-toggle': 'tab', 'data-bs-target': '#nav-review', role: 'tab', 'aria-controls': 'nav-review', 'aria-selected': 'false', type: 'button', textContent: 'Omdöme',  parent: navTabList });
        this._create({ element: 'button', class: 'nav-link', 'data-bs-toggle': 'tab', 'data-bs-target': '#nav-action', role: 'tab', 'aria-controls': 'nav-action', 'aria-selected': 'false', type: 'button', textContent: 'Åtgärder', parent: navTabList });
        this._create({ element: 'button', class: 'nav-link close-button', type: 'button', textContent: 'X', parent: navTabList });

        this._create({ element: 'span', class: 'card-text', textContent: data.title, parent: navTabTitleContainer });
        this._create({ element: 'span', class: 'text-muted', textContent: data.location, parent: navTabTitleContainer });

        const contentRow = this._create({ element: 'div', class: 'row no-gutters', parent: card });

        const contentImageCol = this._create({ element: 'div', class: 'col-md-5 p-0 ov popup-card-text img-container', parent: contentRow });
        this._create({ element: 'img', class: 'card-img-top', src: data.image, alt: 'Bild', parent: contentImageCol });
        const contentImageFooter = this._create({ element: 'div', class: 'img-footer', textContent: data.imageFooter, parent: contentImageCol });

        const tabsCol = this._create({ element: 'div', class: 'col-md-7 p-0', parent: contentRow });
        const tabsContainer = this._create({ element: 'div', class: 'card-text tab-content', parent: tabsCol });
        this._create({ element: 'div', class: 'tab-pane fade show active', id: 'nav-description', role: 'tabpanel', 'aria-labelledby': 'nav-description', innerHTML: data.description, parent: tabsContainer });
        this._create({ element: 'div', class: 'tab-pane fade', id: 'nav-review', role: 'tabpanel', 'aria-labelledby': 'nav-review', innerHTML: data.review, parent: tabsContainer });
        this._create({ element: 'div', class: 'tab-pane fade', id: 'nav-action', role: 'tabpanel', 'nav-action': 'nav-description', innerHTML: data.action, parent: tabsContainer });

        return card;
    }

    /**
     * Genererar en tabell baserat på det data i parametern och lägger till den i det angivna elementet.
     *
     * @param {object} response - Svarobjektet som innehåller datan för tabellen.
     * @param {HTMLElement} parent - Förälderelementet till vilket tabellen kommer att läggas till.
     * @return {HTMLElement} - Det genererade tabellelementet.
     */

    featuresTable(response, parent) {
        const table = this._create({element: 'table', class: 'table table-bordered table-hover', parent: parent});

        // Loopar igenom egenskaperna för det första objektet för att skapa tabellhuvuden
        for (const key in response.features[0].properties) {
            const featureRow = table.insertRow(-1);

            // Skapar en tabellhuvud och lägger till det i raden
            this._create({ element: 'th', class: ('bg-light text-dark'), parent: featureRow, textContent: key });

            // Loopar igenom alla objekt för att fylla i tabellceller med egenskaper
            for (let i = 0; i < response.features.length; i++) {
                const featureProperties = response.features[i].properties;
                const featureCell = featureRow.insertCell(-1);
                featureCell.classList.add('align-middle');
                featureCell.innerHTML = featureProperties[key];
            }
        }

        return table;
    }

    /**
     * Genererar ett transparens-slider för kartan.
     *
     * @return {Object} Ett objekt som innehåller sliderns behållare, slidern och knappens element.
     */
    transparencySlider() {
        const uiParent = document.querySelector('.ol-overlaycontainer-stopevent');

        const sliderContainer = this._create({ element: 'div', style: 'pointer-events: auto; top: 290px', id: 'transparencyContainer', class: 'ol-zoomslider ol-unselectable ol-control', parent: uiParent });
        const slider = this._create({ element: 'button', type: 'button', class: 'ol-zoomslider-thumb ol-unselectable transition-enabled', style: 'top: 188px;', parent: sliderContainer });

        const buttonContainer = this._create({ element: 'div', style: 'pointer-events: auto; top: 291.5px', class: 'ol-zoom-extent ol-unselectable ol-control', parent: uiParent });
        const button = this._create({ element: 'button', type: 'button', title: 'Max transparency', textContent: 'T', parent: buttonContainer });

        return { sliderContainer, slider, button };
    }

    /**
     * Genererar en HTML-lista baserat på den angivna arrayen.
     *
     * @param {Array<string>} array - Arrayen som används för att fylla listan.
     * @return {string} Den yttre HTML-koden för den genererade listan.
     */
    list(array) {
        const list = document.createElement('ul');
        list.classList.add('list-group');

        // Loopar igenom varje element i arrayen
        for (const item of array) {
            // Skapar ett li-element för varje element i arrayen
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');

            // Om elementet är ett objekt och inte null, skapar ett nytt element baserat på objektet och lägger till det i li-elementet
            if (typeof item === 'object' && item !== null) listItem.appendChild(this._create(item));
            else listItem.appendChild(document.createTextNode(item));

            // Lägger till li-elementet i ul-listan
            list.appendChild(listItem);
        }

        return list.outerHTML;
    }

    /**
     * En funktion som visar ett felmeddelande på användargränssnittet.
     *
     * @param {string} message - Felmeddelandet att visa
     * @return {void}
     */
    errorMessage(message) {
        const errorContainer = document.getElementById("error-container");

        const alertDiv = this._create({ element: 'div', class: 'alert alert-warning alert-dismissible fade show', role: 'alert', parent: errorContainer });
        const icon = this._create({ element: 'svg', class: 'bi flex-shrink-0 me-2', width: '24', height: '24', role: 'img', 'aria-label': 'Warning:', parent: alertDiv });

        // Lägger till en olika element för felmeddelandet.
        this._create({ element: 'use', 'xlink:href': '#exclamation-triangle-fill', parent: icon });
        this._create({ element: 'button', class: 'btn-close', 'data-bs-dismiss': 'alert', 'aria-label': 'Close', parent: alertDiv });
        this._create({ element: 'strong', textContent: 'Fel! ', parent: alertDiv });
        this._create({ element: 'span', textContent: message, parent: alertDiv });

        // Ställer in en timeout för att dölja alerten efter 2 sekunder
        setTimeout(function() {
            alertDiv.classList.remove("show");
            setTimeout(function() {
                // Tar bort alertdiv-elementet från felcontainer-elementet efter en kort fördröjning för att få en fade-effekt
                if (errorContainer.contains(alertDiv)) errorContainer.removeChild(alertDiv);
            }, 250);
        }, 2000);
    }

    /**
     * Skapar ett element baserat på informationen i parametern och lägger till det i det i det angivna elementet.
     *
     * @param {Object} elementObject - Ett objekt som innehåller information för att skapa elementet.
     * @return {Element} Det skapade elementet.
     */
    _create(elementObject) {
        let element;

        // Skapar ett element med SVG-namespace om det är ett SVG-element, annars skapas ett vanligt element
        if (elementObject.element === 'svg' || elementObject.element === 'use') element = document.createElementNS('http://www.w3.org/2000/svg', elementObject.element);
        else element = document.createElement(elementObject.element);

        // Lägger till det skapade elementet i det angivna elementet
        elementObject.parent.appendChild(element);

        // Itererar genom attributen i elementobjektet och lägger till dem på det skapade elementet
        for (const key in elementObject) {
            // Undantar vissa egenskaper som inte är attribut
            if (key !== 'element' && key !== 'parent' && key !== 'textContent' && key !== 'innerHTML' && elementObject.hasOwnProperty(key)) {
                if (elementObject.element === 'use') element.setAttributeNS('http://www.w3.org/1999/xlink', key, elementObject[key]);
                else element.setAttribute(key, elementObject[key]);
            }
        }

        // Om elementet har textinnehåll/innerHTML, sätter textinnehållet/innerHTML
        if (elementObject.textContent) element.textContent = elementObject.textContent;
        if (elementObject.innerHTML) element.innerHTML = elementObject.innerHTML;

        return element;
    }
}