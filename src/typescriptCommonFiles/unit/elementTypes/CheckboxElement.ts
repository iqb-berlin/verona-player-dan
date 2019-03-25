// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class CheckboxElement extends UnitElement {

    public responseGiven = false;

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
            value: 'neue Checkbox',
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

        this.properties.addProperty('mandatory', {
            value: 'true',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Zwingend',
            tooltip: 'Ob der Checkbox mindestens gesehen werden muss.'
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
        // checked SVG icon from Material Icon
        // https://material.io/tools/icons/?icon=check&style=baseline
        // http://google.github.io/material-design-icons/
        // http://www.apache.org/licenses/LICENSE-2.0.txt

        const elementHTML = `
        <div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
            <div id="${this.elementID}_zIndexContainer" class="unitElementZIndexContainer">
                <div id="${this.elementID}_selectableDiv" class="displayInAuthoringTool" style="height: 100%; width: 100%; background-color: transparent; display: none; position: absolute; z-index: 3;"></div>
                <span id="${this.elementID}_style">
                    <div class="pretty p-svg p-smooth">
                        <input id="${this.elementID}_checkbox" autocomplete="off" class="${this.elementID}_variableHolder ${this.elementID}_tabIndexable" name="${this.elementID}" type="checkbox">
                        <div class="state">
                            <svg xmlns="http://www.w3.org/2000/svg" class="svg svg-icon" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            <label for="${this.elementID}_checkbox" id="${this.elementID}_text" style="">
                                ${this.properties.getPropertyValue('text')}
                            </label>
                        </div>
                    </div>
                </span>
            </div>
        </div>`;

        const pageHTMLElement = this.getPageHTMLElement();
        if (pageHTMLElement !== null)
        {
         pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);

         this.properties.renderProperties();

         const checkboxHTMLElement = (document.getElementById(this.elementID + '_checkbox') as HTMLInputElement);
         checkboxHTMLElement.addEventListener('click', (event) => {
           this.dispatchRefreshCheckedPropertyForAllElementsEvent();

           this.responseGiven = true;
           window.dispatchEvent(new CustomEvent('IQB.unit.responseGiven', {
               detail: {'elementID': this.getElementID()}
           }));
         });

        // add intersection observer to figure out when responseGiven should be set to true
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting === true) {
                    if (this.responseGiven === false) {
                        this.responseGiven = true;
                        window.dispatchEvent(new CustomEvent('IQB.unit.responseGiven', {
                            detail: {'elementID': this.getElementID()}
                        }));
                    }
                }
            });
        }, {threshold: [1]});

        observer.observe(checkboxHTMLElement);
        // end of responseGiven observer

         this.dispatchNewElementDrawnEvent();
        }
    }

}
