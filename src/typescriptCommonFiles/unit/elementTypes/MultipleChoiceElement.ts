// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class MultipleChoiceElement extends UnitElement {

    public responseGiven: boolean = false;
    
    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, pageHTMLElementID);

        this.properties.addProperty('type', {
            value: 'multipleChoice',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        this.properties.addProperty('text', {
            value: 'neue Multiple Choice',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Text',
            tooltip: 'Der Text, der neben dem Multiple Choice angezeigt wird'
        });

        this.properties.addPropertyRenderer('text', 'multipleChoiceRenderer', (propertyValue: string) => {
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
            tooltip: 'Ob dieses Multiple Choice schon gewählt ist'
        });

        this.properties.addPropertyRenderer('checked', 'multipleChoiceRenderer', (propertyValue: string) => {
            const elementToBeChecked = elementID + '_multipleChoice';
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

        this.properties.addProperty('groupName', {
                value: 'default multiple choice group',
                userAdjustable: true,
                propertyType: 'text',
                hidden: false,
                caption: 'Gruppename',
                tooltip: 'Der Name von der Multiple Choice Antwort Gruppe, wozu dieses Multiple Choice gehört. Wenn mehrere Multiple Choice Elemente den selben Gruppennamen haben, kann nur eins davon gewählt werden.'
            });

        this.properties.addPropertyRenderer('groupName', 'multipleChoiceRenderer', (propertyValue: string) => {
            document.querySelectorAll('.' + this.elementID + '_variableHolder').forEach( (element) => {
                element.setAttribute('name', propertyValue);
            });

            this.dispatchRefreshCheckedPropertyForAllElementsEvent();
        });

        this.properties.addProperty('disabled', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Deaktiviert',
            tooltip: 'Ob jemand das Multiple Choice benutzen kann'
        });

        this.properties.addPropertyRenderer('disabled', 'multipleChoiceRenderer', (propertyValue: string) => {
            const elementToBeDisabledID = elementID + '_multipleChoice';
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
            tooltip: 'Ob der Multiple Choice-Gruppe geantwortet werden muss.'
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
                <div id="${this.elementID}_selectableDiv" class="displayInAuthoringTool" style="height: 100%; width: 100%; background-color: transparent; display: none; position: absolute; z-index: 3;"></div>
                <span id="${this.elementID}_style">
                    <div class="pretty p-default p-round">
                        <input id="${this.elementID}_multipleChoice" autocomplete="off" class="${this.elementID}_variableHolder ${this.elementID}_tabIndexable" name="${this.elementID}" type="radio">
                        <div class="state">
                            <label for="${this.elementID}_multipleChoice" id="${this.elementID}_text" style="">
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

         (document.getElementById(this.elementID + '_multipleChoice') as HTMLInputElement).addEventListener('click', (event) => {
            this.responseGiven = true;

            // this event propagation will also update the responseGiven properties for the other MCs
            this.dispatchRefreshCheckedPropertyForAllElementsEvent();
            // end of MC specific event propagation

            window.dispatchEvent(new CustomEvent('IQB.unit.responseGiven', {
                detail: {'elementID': this.getElementID()}
            }));
        });

         this.dispatchNewElementDrawnEvent();
        }
    }

}
