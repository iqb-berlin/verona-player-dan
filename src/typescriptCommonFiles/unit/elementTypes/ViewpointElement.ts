// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2019
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class ViewpointElement extends UnitElement {

    public viewed: boolean;
    private callbacks: IntersectionObserverCallback[] = [];

    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, pageHTMLElementID);

        this.setPropertyValue('width', 25);
        this.setPropertyValue('height', 35);

        this.properties.addProperty('type', {
            value: 'viewpoint',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        /*
        this.properties.addProperty('name', {
            value: 'viewpoint-' + this.elementID,
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Name',
            tooltip: 'Der Name des Viewpoints'
        });
        */

        this.properties.addProperty('sendsResponses', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Antwortdaten',
            tooltip: 'Soll, ob der Viewpoint gesehen / nicht gesehen wurde, Teil der Antwort-Daten sein?'
        });

        this.properties.addProperty('partOfPresentation', {
            value: 'true',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Teil der Presentation',
            tooltip: 'Muss der Viewpoint gesehen werden, bevor man unter manchen Testeinstellungen die Aufgabe verlassen kann?'
        });

        this.viewed = false;

        this.addIntersectionObserverCallback((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting === true) {
                    // console.log(this.elementID + ' is viewed? ' + this.getPropertyValue('viewed'));


                    if (!this.viewed) {
                        // console.log('Viewpoint ' + this.elementID + ' has been viewed.');
                        // console.log(entry);
                        this.viewed = true;
                        window.dispatchEvent(new CustomEvent('IQB.unit.viewpointViewed', {
                            detail: {'elementID': this.getElementID()}
                        }));
                    }
                }
            });
        });

        this.properties.removeProperty('z-index');
        this.properties.removeProperty('style');
        this.properties.removeProperty('visible');
        this.properties.removeProperty('navigateToPage');
        this.properties.removeProperty('font-family');
        this.properties.removeProperty('font-size');
        this.properties.removeProperty('color');
        this.properties.removeProperty('background-color');

        const widthProperty: Property = this.properties.getProperty('width');
        widthProperty.hidden = true;
        this.properties.setProperty('width', widthProperty);

        const heightProperty: Property = this.properties.getProperty('width');
        heightProperty.hidden = true;
        this.properties.setProperty('height', heightProperty);
    }

    addIntersectionObserverCallback(callback: IntersectionObserverCallback) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

        /* e.g. for a callback:

        (entries) => {
            entries.forEach((entry) => {
                console.log(this.getPropertyValue('name') + ' has been triggered');
                console.log(entry);
            });
        }

        */

        this.callbacks.push(callback);
    }

    drawElement()
    {
        const elementHTML = `
                            <div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
                                <div id="${this.elementID}_viewpointAuthoringMarker" class="viewpointAuthoringMarker" style="display: none;">
                                  <i class="material-icons" style="top: 6px; position: relative; font-size: 24px;">gps_fixed</i>
                                </div>
                                <div id="${this.elementID}_viewpoint" class="viewpoint" style="width: 1px; height: 1px; position: absolute; top: 18px; left: 12px; z-index: 1000000">
                                </div>
                            </div>`;

        const pageHTMLElement = this.getPageHTMLElement();
        if (pageHTMLElement !== null)
        {
            pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);
            this.properties.renderProperties();

            this.callbacks.forEach((callback) => {
                const observer = new IntersectionObserver(callback, {threshold: [0, 1]});
                const viewpointHTMLElement = document.getElementById(this.elementID + '_viewpoint') as HTMLDivElement;
                observer.observe(viewpointHTMLElement);
            });

            this.dispatchNewElementDrawnEvent();
        }
    }

}
