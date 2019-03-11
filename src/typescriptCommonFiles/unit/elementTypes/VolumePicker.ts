// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

// todo - customizable volume
/*
import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class VolumePickerElement extends UnitElement {

    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, pageHTMLElementID);

        this.setPropertyValue('width', 200);
        this.setPropertyValue('height', 50);

        this.properties.addProperty('type', {
            value: 'volumePicker',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        this.properties.addProperty('volume', {
            value: '0.2',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Lautstärke',
            tooltip: 'Wie laut der Sound ist'
        });

        this.properties.addPropertyRenderer('volume', 'volumePickerRenderer', (propertyValue: string) => {
            const rangeDomElement = document.getElementById(this.elementID + '_volumePicker_range') as HTMLInputElement;

            // first, set the range selected value to this property value
            if (rangeDomElement.value !== propertyValue) {
                rangeDomElement.value = propertyValue;
            }

            // then, update the unit volume;
            window.dispatchEvent(new CustomEvent('IQB.unit.newVolume', {
                detail: {'setByElementID': this.getElementID(),
                         'newVolume': propertyValue}
            }));
        });

        this.properties.removeProperty('style');
        this.properties.removeProperty('font-family');
        this.properties.removeProperty('font-size');
        this.properties.removeProperty('color');
        this.properties.removeProperty('background-color');
    }

    drawElement()
    {
        const elementHTML = `
                            <div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
                                <div id="${this.elementID}_divContainer" style="width: 100%; height: 100%;">
                                    <input type="range"
                                           style="width: 95%; height: 95%; margin: 0px;"
                                           id="${this.elementID}_volumePicker_range"
                                           name="${this.elementID}_volumePicker_range"
                                           min="0"
                                           max="1"
                                           step="0.01" />
                                </div>
                            </div>`;

        const pageHTMLElement = this.getPageHTMLElement();
        if (pageHTMLElement !== null)
        {
            pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);

            this.properties.renderProperties();

            const rangeDomElement = document.getElementById(this.elementID + '_volumePicker_range') as HTMLInputElement;
            rangeDomElement.addEventListener('change', (event) => {
                this.setPropertyValue('volume', rangeDomElement.value);

                window.dispatchEvent(new CustomEvent('IQB.unit.newVolume', {
                    detail: {'setByElementID': this.getElementID(),
                             'newVolume': rangeDomElement.value}
                }));
              });

             // listen for other volume changes, so as to maintain one unified volume level
             window.addEventListener('IQB.unit.newVolume', (e) => {
                const newVolume = e.detail.newVolume;
                if (this.getPropertyValue('volume') !== newVolume) {
                    this.setPropertyValue('volume', newVolume);
                    this.render();
                }
             });
             // end of listening for other volume changes

            this.dispatchNewElementDrawnEvent();
        }
    }

}
*/
