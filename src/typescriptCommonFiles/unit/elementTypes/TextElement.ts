// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class TextElement extends UnitElement {

    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, pageHTMLElementID);

        this.setPropertyValue('width', 200);
        this.setPropertyValue('height', 50);

        this.properties.addProperty('type', {
            value: 'text',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
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

        this.properties.addProperty('text', {
            value: 'neuer Text',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Text',
            tooltip: 'Der Text, der angezeigt wird'
        });

        this.properties.addPropertyRenderer('text', 'textRenderer', (propertyValue: string) => {
            const textToShow: string = propertyValue;
            // const HTMLTextToShow: string = textToShow.replace(new RegExp(' ', 'g'), '&nbsp;');
            const HTMLTextToShow: string = textToShow;
            const textHTMLElement = (document.getElementById(this.elementID + '_text') as HTMLElement);
            textHTMLElement.innerHTML = HTMLTextToShow; // bug: modifying the entire innerhtml removes resize stuff (todo)
        });

        this.properties.addProperty('underlined', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Unterstrichen',
            tooltip: 'Soll der Text unterstrichen sein?'
        });

        this.properties.addPropertyRenderer('underlined', 'textRenderer', (propertyValue: string) => {
            const textHTMLElement = (document.getElementById(this.elementID + '_text') as HTMLElement);
            if (propertyValue === 'true') {
                textHTMLElement.style.textDecoration = 'underline';
            }
            else {
                textHTMLElement.style.textDecoration = 'none';
            }
        });

        this.properties.addProperty('bolded', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Fettgedruckt',
            tooltip: 'Soll der Text fettgedruckt sein?'
        });

        this.properties.addPropertyRenderer('bolded', 'textRenderer', (propertyValue: string) => {
            const textHTMLElement = (document.getElementById(this.elementID + '_text') as HTMLElement);
            if (propertyValue === 'true') {
                textHTMLElement.style.fontWeight = 'bold';
            }
            else {
                textHTMLElement.style.fontWeight = 'normal';
            }
        });


        this.properties.addProperty('italics', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Kursivgedruckt',
            tooltip: 'Soll der Text kursivgedruckt sein?'
        });

        this.properties.addPropertyRenderer('italics', 'textRenderer', (propertyValue: string) => {
            const textHTMLElement = (document.getElementById(this.elementID + '_text') as HTMLElement);
            if (propertyValue === 'true') {
                textHTMLElement.style.fontStyle = 'italic';
            }
            else {
                textHTMLElement.style.fontStyle = 'normal';
            }
        });

        // other property renderers for properties inherited from UnitElement

        this.properties.addPropertyRenderer('font-size', 'fontSizeRenderer', (propertyValue: string) => {
            const element =  document.getElementById(this.elementID);
            if (element !== null) {
                 element.style.fontSize = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('font-family', 'fontFamilyRenderer', (propertyValue: string) => {
            const element =  document.getElementById(this.elementID);
            if (element !== null) {
                element.style.fontFamily = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('color', 'colorRenderer', (propertyValue: string) => {
            const element =  document.getElementById(this.elementID);
            if (element !== null) {
                element.style.color = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('background-color', 'backgroundColorRenderer', (propertyValue: string) => {
            const element =  document.getElementById(this.elementID);
            if (element !== null) {
                element.style.backgroundColor = propertyValue;
            }
        });
    }

    drawElement()
    {
        const elementHTML = `
                            <div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
                                <div id="${this.elementID}_zIndexContainer" class="unitElementZIndexContainer">
                                    <div id="${this.elementID}_divContainer" style="width: 100%; height: 100%; text-align: left; overflow: hidden;">
                                            <span id="${this.elementID}_style">
                                                <span id="${this.elementID}_text" style="white-space: pre-wrap;"></span>
                                        </span>
                                    </div>
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
