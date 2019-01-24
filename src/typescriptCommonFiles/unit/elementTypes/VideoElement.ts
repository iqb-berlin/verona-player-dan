// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class VideoElement extends UnitElement {

    constructor(public elementID: string, public pageHTMLElementID: string, src: string)
    {
        super(elementID, pageHTMLElementID);

        this.properties.addProperty('type', {
            value: 'video',
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

        this.properties.addProperty('autoplay', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Autoplay',
            tooltip: 'Soll das Video automatisch gespielt werden?'
        });

        this.properties.addPropertyRenderer('autoplay', 'VideoRenderer', (propertyValue: string) => {
        });

        this.height = -1;
        this.width = -1;

        // remove inherited properties that this element type does not use
        this.properties.removeProperty('font-family');
        this.properties.removeProperty('font-size');
        this.properties.removeProperty('color');
        this.properties.removeProperty('background-color');
    }

    drawElement()
    {
        const elementHTML = `
        <div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
            <div id="${this.elementID}_zIndexContainer" class="unitElementZIndexContainer">
                <span id="${this.elementID}_style">
                    <video src="${this.properties.getPropertyValue('src')}" id="${this.elementID}_video"
                        style="width: 100%; height: 100%;"
                        controls controlsList="nodownload">
                    </video>
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

             jQuery('#' + this.elementID + '_video').on('load', () => {
                 // https://api.jquery.com/load-event/
                 // adjust height and width after loading video
                 this.updateSizePropertiesBasedOn(this.pageHTMLElementID, this.elementID);
                 this.properties.renderProperty('height');
                 this.properties.renderProperty('width');
             });
         }
         else
         {
             this.properties.renderProperties();
         }

         // add video events
        const videoElement = document.getElementById(this.elementID + '_video') as HTMLVideoElement;

        videoElement.onloadeddata = () => {

            // set volume
            // todo: adjustable defaultVolume
            videoElement.volume = 0.2;
            // end of setting video volume

            if (this.getPropertyValue('autoplay') === 'true')
            {
                videoElement.play();

                window.dispatchEvent(new CustomEvent('IQB.unit.videoElementStarted', {
                    detail: {'elementID': this.getElementID()}
                }));
            }
        };

        videoElement.onended = () => {
            window.dispatchEvent(new CustomEvent('IQB.unit.videoElementEnded', {
                detail: {'elementID': this.getElementID()}
            }));
        };
        // finished adding video events

         this.dispatchNewElementDrawnEvent();
        }
    }

}
