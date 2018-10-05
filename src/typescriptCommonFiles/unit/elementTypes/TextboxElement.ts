import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class TextboxElement extends UnitElement {

    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, pageHTMLElementID);

        this.setPropertyValue('width', 200);
        this.setPropertyValue('height', 25);

        this.properties.addProperty('type', {
            value: 'textbox',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        this.properties.addProperty('placeholder', {
            value: '',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Platzhalter',
            tooltip: 'Der Text, der angezeigt wird, falls der Textboxinhalt leer ist, bis etwas eingetippt wird.'
        });

        this.properties.addProperty('variableName', {
            value: this.elementID + '_data',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Variablename',
            tooltip: 'Der Name, der zusammen mit dem eingegeben Wert in den Testergebnissen gespeichert wird'
        });

        this.properties.addProperty('text', {
            value: '',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Text',
            tooltip: 'Der Text in dem Textbox (Textboxinhalt).'
        });

        this.properties.addProperty('disabled', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Deaktiviert',
            tooltip: 'Ob jemand etwas in dem Textbox eingeben kann'
        });

        this.properties.addPropertyRenderer('text', 'textboxRenderer', (propertyValue: string) => {
            const textToShow: string = propertyValue;
            const textboxHTMLElement = (document.getElementById(this.elementID + '_textbox') as HTMLInputElement);
            textboxHTMLElement.value = textToShow;
        });

        this.properties.addPropertyRenderer('placeholder', 'textboxRenderer', (propertyValue: string) => {
            const placeholderText: string = propertyValue;
            const textboxHTMLElement = (document.getElementById(this.elementID + '_textbox') as HTMLInputElement);
            textboxHTMLElement.placeholder = placeholderText;
        });


        this.properties.addPropertyRenderer('disabled', 'textboxRenderer', (propertyValue: string) => {
            const elementToBeDisabledID = elementID + '_textbox';
            if (propertyValue === 'true')
            {
                (document.getElementById(elementToBeDisabledID) as HTMLInputElement).setAttribute('disabled', 'true');
            }
            else
            {
                (document.getElementById(elementToBeDisabledID) as HTMLInputElement).removeAttribute('disabled');
            }
        });

        this.properties.addPropertyRenderer('font-size', 'fontSizeRenderer', (propertyValue: string) => {
            const textboxElement = (document.getElementById(elementID + '_textbox') as HTMLElement);
            if (textboxElement !== null) {
                textboxElement.style.fontSize = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('font-family', 'fontFamilyRenderer', (propertyValue: string) => {
            const textboxElement = (document.getElementById(elementID + '_textbox') as HTMLElement);
            if (textboxElement !== null) {
                textboxElement.style.fontFamily = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('color', 'colorRenderer', (propertyValue: string) => {
            const textboxElement = (document.getElementById(elementID + '_textbox') as HTMLElement);
            if (textboxElement !== null) {
                textboxElement.style.color = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('background-color', 'backgroundColorRenderer', (propertyValue: string) => {
            const textboxElement = (document.getElementById(elementID + '_textbox') as HTMLElement);
            if (textboxElement !== null) {
                textboxElement.style.backgroundColor = propertyValue;
            }
        });
    }

    drawElement()
    {
        const elementHTML = `<div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
                            <span id="${this.elementID}_style">
                                <input id="${this.elementID}_textbox" type="text" style="width: 100%; height: 100%;" />
                            </span>
                        </div>`;

        const pageHTMLElement = this.getPageHTMLElement();
        if (pageHTMLElement !== null)
        {
            pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);

            this.properties.renderProperties();

            const textboxHTMLElement = document.getElementById(this.elementID + '_textbox') as HTMLInputElement;
            textboxHTMLElement.addEventListener('keyup', (event) => {
                this.setPropertyValue('text', textboxHTMLElement.value);
              });

            this.dispatchNewElementDrawnEvent();
        }
    }

}
