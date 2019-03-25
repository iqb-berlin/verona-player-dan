// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class DropdownElement extends UnitElement {

    public responseGiven: boolean = false;

    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, pageHTMLElementID);

        this.setPropertyValue('width', 200);
        this.setPropertyValue('height', 40);

        this.properties.addProperty('type', {
            value: 'dropdown',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        this.properties.addProperty('placeholder', {
            value: 'Platzhaltertext',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Platzhalter',
            tooltip: 'Der Text, der angezeigt wird, falls noch keine Option ausgewählt ist'
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

        this.properties.addProperty('options', {
            value: 'erste Option|zweite Option|dritte Option',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Optionen',
            tooltip: 'Die Optionen. Das | Zeichen wird benutzt, um die Optionen voneinander zu trennen.'
        });

        this.properties.addProperty('selectedOption', {
            value: '',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Gewählte Option',
            tooltip: 'Die gewählte Option'
        });

        this.properties.addProperty('disabled', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Deaktiviert',
            tooltip: 'Ob jemand das Element benutzen kann (ob jemand eine Option wählen kann)'
        });

        this.properties.addPropertyRenderer('options', 'dropdownRenderer', (propertyValue: string) => {
            const options: Array<string> = propertyValue.split('|');
            let optionsHTML = '';
            if (this.properties.getPropertyValue('placeholder') !== '')
            {
                // idea on how to implement placeholder for dropdown boxes based on stackoverflow
                // URL: https://stackoverflow.com/a/5859221
                // Original answer: https://stackoverflow.com/users/295800/david
                // Later edits: https://stackoverflow.com/users/295800/david ,
                //              https://stackoverflow.com/users/2680216/josh-crozier ,
                //              https://stackoverflow.com/users/6999690/user1492534
                //              https://stackoverflow.com/users/885605/andreas-grapentin
                // License:cc by-sa 3.0
                optionsHTML += `<option value="placeholder" disabled selected>${this.properties.getPropertyValue('placeholder')}</option>`;
                // end of placeholder for dropdown boxes idea
            }
            options.forEach( (value, index, array) => {
                optionsHTML += `<option value="${value}">${value}</option>`;
            });

            (document.getElementById(elementID + '_select') as HTMLElement).innerHTML = optionsHTML;
        });

        this.properties.addPropertyRenderer('selectedOption', 'textboxRenderer', (propertyValue: string) => {

            const dropdownHTMLElement = document.getElementById(this.elementID + '_select') as HTMLSelectElement;

            // first check if the selected option exists (and thus is valid)
            let validOption: boolean = false;
            for (let i = 0; i < dropdownHTMLElement.options.length; i++) {
                if (dropdownHTMLElement.options[i].value === propertyValue) {
                    validOption = true;
                }
            }

            if (validOption) {
                // if the option exists, check if it is not already set, so as to avoid triggering unnecesary events
                if (propertyValue !== dropdownHTMLElement.value) {
                    // if it is a valid selectedOption and it is not currently select it, then select it
                    dropdownHTMLElement.value = propertyValue;
                }
            }
            else
            {
                // if the selectedOption is not valid, then set the property to ''
                this.setPropertyValue('selectedOption', '');
            }

        });

        this.properties.addPropertyRenderer('disabled', 'dropdownRenderer', (propertyValue: string) => {
            const elementToBeDisabledID = elementID + '_select';
            if (propertyValue === 'true')
            {
                (document.getElementById(elementToBeDisabledID) as HTMLInputElement).setAttribute('disabled', 'true');
                (document.getElementById(elementID + '_selectableDiv') as HTMLInputElement).style.display = 'inline-block';
            }
            else
            {
                (document.getElementById(elementToBeDisabledID) as HTMLInputElement).removeAttribute('disabled');
                (document.getElementById(elementID + '_selectableDiv') as HTMLInputElement).style.display = 'none';
            }
        });

        this.properties.addProperty('mandatory', {
            value: 'true',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Zwingend',
            tooltip: 'Ob man eine Antwort wählen muss.'
        });


        this.properties.addPropertyRenderer('font-size', 'fontSizeRenderer', (propertyValue: string) => {
            const selectElement = (document.getElementById(elementID + '_select') as HTMLElement);
            if (selectElement !== null) {
                selectElement.style.fontSize = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('font-family', 'fontFamilyRenderer', (propertyValue: string) => {
            const selectElement = (document.getElementById(elementID + '_select') as HTMLElement);
            if (selectElement !== null) {
                selectElement.style.fontFamily = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('color', 'colorRenderer', (propertyValue: string) => {
            const selectElement = (document.getElementById(elementID + '_select') as HTMLElement);
            if (selectElement !== null) {
                selectElement.style.color = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('background-color', 'backgroundColorRenderer', (propertyValue: string) => {
            const selectElement = (document.getElementById(elementID + '_select') as HTMLElement);
            if (selectElement !== null) {
                selectElement.style.backgroundColor = propertyValue;
            }
        });
    }

    drawElement()
    {
        const elementHTML = `
        <div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
            <div id="${this.elementID}_zIndexContainer" class="unitElementZIndexContainer">
                <div id="${this.elementID}_selectableDiv" style="height: 100%; width: 100%; background-color: transparent; display: none; position: absolute;"></div>
                <span id="${this.elementID}_style">
                    <select id="${this.elementID}_select" autocomplete="off" class="${this.elementID}_variableHolder ${this.elementID}_tabIndexable" style="height:100%; width: 100%">
                    </select>
                </span>
            </div>
        </div>`;

        const pageHTMLElement = this.getPageHTMLElement();
        if (pageHTMLElement !== null)
        {
         pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);

         this.properties.renderProperties();

         const dropdownHTMLElement = document.getElementById(this.elementID + '_select') as HTMLSelectElement;
         dropdownHTMLElement.addEventListener('change', (event) => {
            this.setPropertyValue('selectedOption', dropdownHTMLElement.value);
            this.responseGiven = true;
            window.dispatchEvent(new CustomEvent('IQB.unit.responseGiven', {
                detail: {'elementID': this.getElementID()}
            }));
         });

         this.dispatchNewElementDrawnEvent();
        }
    }

}
