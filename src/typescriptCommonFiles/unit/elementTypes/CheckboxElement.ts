// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class CheckboxElement extends UnitElement {

    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, pageHTMLElementID);

        this.properties.addProperty('type', {
            value: 'checkbox',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        // the variableName property is currently deprecated, therefore it is set as hidden
        this.properties.addProperty('variableName', {
            value: this.elementID + '_data',
            userAdjustable: true,
            propertyType: 'text',
            hidden: true,
            caption: 'Variablename',
            tooltip: 'Der Name, der zusammen mit dem eingegeben Wert in den Testergebnissen gespeichert wird'
        });

        this.properties.addProperty('text', {
            value:'neue Checkbox',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Text',
            tooltip: 'Der Text, der neben der Checkbox angezeigt wird'
        });

        this.properties.addPropertyRenderer('text', 'textRenderer', (propertyValue: string) => {
            const textToShow: string = propertyValue;
            // const HTMLTextToShow: string = textToShow.replace(new RegExp(' ', 'g'), '&nbsp;');
            const HTMLTextToShow: string = textToShow;
            const textHTMLElement = (document.getElementById(this.elementID + '_text') as HTMLElement);
            textHTMLElement.innerHTML = HTMLTextToShow; // bug: modifying the entire innerhtml removes resize stuff (todo)
        });

        this.properties.addProperty('checked', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Abgehakt',
            tooltip: 'Ob diese Checkbox abgehakt ist'
        });

        this.properties.addPropertyRenderer('checked', 'checkboxRenderer', (propertyValue: string) => {
            const elementToBeChecked = elementID + '_checkbox';
            if (propertyValue === 'true')
            {
                (document.getElementById(elementToBeChecked) as HTMLInputElement).setAttribute('checked', 'true');
                (document.getElementById(elementToBeChecked) as HTMLInputElement).checked = true;
            }
            else
            {
                (document.getElementById(elementToBeChecked) as HTMLInputElement).removeAttribute('checked');
                (document.getElementById(elementToBeChecked) as HTMLInputElement).checked = false;
            }
            this.dispatchRefreshCheckedPropertyForAllElementsEvent();
        });

        this.properties.addProperty('disabled', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Deaktiviert',
            tooltip: 'Ob jemand die Checkbox benutzen kann'
        });

        this.properties.addPropertyRenderer('disabled', 'checkboxRenderer', (propertyValue: string) => {
            const elementToBeDisabledID = elementID + '_checkbox';
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
                <span id="${this.elementID}_style">
                    <input id="${this.elementID}_checkbox" class="${this.elementID}_variableHolder" name="${this.elementID}" type="checkbox">
                    <span id="${this.elementID}_text" style="">
                        ${this.properties.getPropertyValue('text')}
                    </span>
                </span>
            </div>
        </div>`;

        const pageHTMLElement = this.getPageHTMLElement();
        if (pageHTMLElement !== null)
        {
         pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);

         this.properties.renderProperties();

         (document.getElementById(this.elementID + '_checkbox') as HTMLInputElement).addEventListener('click', (event) => {
           this.dispatchRefreshCheckedPropertyForAllElementsEvent();
         });

         this.dispatchNewElementDrawnEvent();
        }
    }

}
