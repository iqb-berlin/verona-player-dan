// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class HtmlUnitElement extends UnitElement {

    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, pageHTMLElementID);

        this.properties.addProperty('type', {
            value: 'html',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        this.properties.addProperty('html', {
            value: 'html code',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'HTML',
            tooltip: 'Der HTML-Code, der benutzt wird, um etwas besonders zu zeigen.'
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

      this.properties.addPropertyRenderer('html', 'HtmlRenderer', (propertyValue: string) => {
        (document.getElementById(this.elementID + '_html') as HTMLInputElement).innerHTML = propertyValue;
      });

       // remove inherited properties that this element type does not use
       this.properties.removeProperty('font-family');
       this.properties.removeProperty('font-size');
       this.properties.removeProperty('color');
       this.properties.removeProperty('background-color');
    }

    drawElement()
    {
        const elementHTML = `<div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
        <div id="${this.elementID}_zIndexContainer" class="unitElementZIndexContainer">
            <span id="${this.elementID}_style">
                <span id="${this.elementID}_html"></span>
            </span>
        </div>
        </div>`;

        const pageHTMLElement = this.getPageHTMLElement();
        if (pageHTMLElement !== null)
        {
         pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);
         this.properties.renderProperties();

         this.dispatchNewElementDrawnEvent();
        }
    }

}
