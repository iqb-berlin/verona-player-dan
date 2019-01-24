// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class ImageElement extends UnitElement {

    constructor(public elementID: string, public pageHTMLElementID: string, src: string)
    {
        super(elementID, pageHTMLElementID);

        this.properties.addProperty('type', {
            value: 'image',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        this.properties.addProperty('src', {
            value: src,
            userAdjustable: false,
            propertyType: 'text',
            hidden: true,
            caption: 'Source'
        });

        this.properties.addProperty('navigateToPage', {
            value: '',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: {},
            hidden: false,
            caption: 'Navigate to',
            tooltip: 'Zeige eine andere Seite, wenn jemand auf dem Element doppelklickt'
        });

        this.width = -1;
        this.height = -1;

        // remove inherited properties that this element type does not use
        this.properties.removeProperty('font-family');
        this.properties.removeProperty('font-size');
        this.properties.removeProperty('color');
        this.properties.removeProperty('background-color');
    }

    drawElement()
    {
        // console.log('Drawing image element ' + this.getElementID());
        const elementHTML = `
                                <div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
                                    <div id="${this.elementID}_zIndexContainer" class="unitElementZIndexContainer">
                                        <span id="${this.elementID}_style">
                                            <img src="${this.properties.getPropertyValue('src')}"
                                            id="${this.elementID}_image"
                                            style="width: 100%; height: 100%;" />
                                        </span>
                                    </div>
                                </div>`;

        const pageHTMLElement = this.getPageHTMLElement();
        if (pageHTMLElement !== null)
        {
            pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);

            if ((this.width === -1) && (this.height === -1))
            {
                this.properties.renderProperties(['width', 'height']);

                jQuery('#' + this.elementID + '_image').on('load', () => {
                    // https://api.jquery.com/load-event/
                    // adjust height and width after loading image
                    this.updateSizePropertiesBasedOn(this.pageHTMLElementID, this.elementID);
                    this.properties.renderProperty('height');
                    this.properties.renderProperty('width');
                });
            }
            else
            {
                this.properties.renderProperties();
            }

            this.dispatchNewElementDrawnEvent();
        }
    }

}
