// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {Properties, PropertyRenderersLibrary} from './Properties.js';
import {ObjectWithProperties} from './ObjectWithProperties.js';
import {ObjectWithSpatialProperties} from './ObjectWithSpatialProperties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../models/Data.js';

import {TableElement} from './elementTypes/TableElement.js';
import {colorsObject} from '../models/Colors.js';
import { SupportedUnitElementType } from './UnitPage.js';
import { ViewpointElement } from './elementTypes/ViewpointElement.js';

export class UnitElement extends ObjectWithSpatialProperties {

    public propertyRenderers: PropertyRenderersLibrary = {};
    public elementCommonStyle = 'display: inline-block; position: absolute; overflow: visible;';

    private isDrawn: boolean = false;

    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, 'UnitElement', pageHTMLElementID);

        this.properties.addProperty('id', {
            value: this.elementID,
            userAdjustable: false,
            propertyType: 'text',
            hidden: true,
            caption: 'Element-ID'
        });

        this.properties.addProperty('style', {
            value: '',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Style',
            tooltip: 'Besondere Eigenschaft, wo man CSS-Code einführen kann.'
        });


        this.properties.addProperty('visible', {
            value: 'true',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Sichtbar'
        });


        this.properties.addProperty('z-index', {
            value: 100,
            userAdjustable: true,
            propertyType: 'number',
            hidden: false,
            caption: 'z-Index',
            tooltip: 'Was die Priorität, wenn dieses Element andere Elemente überschneidet, ist (je höher die Zahl desto höher die Priorität)'
        });

        this.properties.addProperty('font-family', {
            value: 'Arial, sans-serif',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: {'Times New Roman': `'Times New Roman', serif`,
                           'Arial': 'Arial, sans-serif',
                           'Lucida Console': `'Lucida Console', monospace`,
                           'serif': 'serif',
                           'sans-serif': 'sans-serif',
                           'monospace': 'monospace',
                           'cursive': 'cursive',
                           'fantasy': 'fantasy'
                          },
            hidden: false,
            caption: 'Schriftart',
            tooltip: 'Was die Schriftart des Texts in dem Element ist'
        });

        // prepare fontSizeObject, which contains all font sizes between 8px and 72px
        const fontSizeObject: {[fontSizeCaption: string]: string} = {};
        for (let i = 8; i <= 72; i++) {
            const fontSize = i + 'px';
            fontSizeObject[fontSize] = fontSize;
        }

        // add the 'font-size' property, use fontSizeObject as the selectable options for that property
        this.properties.addProperty('font-size', {
            value: '20px',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: fontSizeObject,
            hidden: false,
            caption: 'Schriftgröße',
            tooltip: 'Was die Schriftgröße des Texts in dem Element ist'
        });


        this.properties.addProperty('color', {
            value: 'black',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: colorsObject,
            hidden: false,
            caption: 'Schriftfarbe',
            tooltip: 'Was die Farbe des Texts in dem Element ist'
        });

        this.properties.addProperty('background-color', {
            value: 'transparent',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: colorsObject,
            hidden: false,
            caption: 'Hintergrundfarbe',
            tooltip: 'Was die Hintergrundfarbe des Elements ist'
        });

        this.initializeBasicPropertyRenderers();
    }

    public getData(): UnitElementData
    {
        const unitElementData = {
            'properties': this.properties.getData()
        };
        return unitElementData;
    }

    public loadData(unitElementData: UnitElementData)
    {
        // console.log('Loading data for element ' + this.getElementID());
        this.properties.loadData(unitElementData.properties);
    }
    /* functions that handle rendering element properties */

    public initializeBasicPropertyRenderers()
    {
        this.properties.addPropertyRenderer('style', 'basicRenderer', (propertyValue: any) => {
            (document.getElementById(this.elementID + '_style') as HTMLElement).setAttribute('style', propertyValue);
        });

        this.properties.addPropertyRenderer('z-index', 'basicRenderer', (propertyValue: any) => {
            (document.getElementById(this.elementID + '_zIndexContainer') as HTMLElement).style.zIndex = propertyValue;
            (document.getElementById(this.elementID + '_zIndexContainer') as HTMLElement).style.position = 'relative';
        });

        this.properties.addPropertyRenderer('visible', 'basicRenderer', (propertyValue: any) => {
                if (propertyValue === 'false') {
                    (document.getElementById(this.elementID) as HTMLElement).style.display = 'none';
                }
        });


        this.properties.addPropertyRenderer('navigateToPage', 'basicRenderer', (propertyValue: any) => {
            // console.log('Executing navigateTo renderer for ' + this.elementID);
            const elementNode = document.getElementById(this.elementID);
            if (elementNode !== null)
            {
                if (propertyValue !== '') {
                    elementNode.style.cursor = 'pointer';
                }
                else
                {
                    // todo: revert to default if navigateToPage is changed back to empty
                    // unclear if there is a use case where this is necessary, since the property cannot be changed in the player
                    // and in the authoring tool the default cursor for elements is the pointer
                }

                elementNode.ondblclick = (e) => {
                    console.log('double clicked');
                    const navigateToPage = this.properties.getPropertyValue('navigateToPage');
                    if (navigateToPage !== '')
                    {
                        this.dispatchNavigateToPageEvent(navigateToPage);
                    }
                };
            }
       });

    }
    /* end of functions that handle rendering element properties */

    public render()
    {
        // console.log('Rendering element ' + this.elementID + '...');
        if (this.isDrawn === false) {
            // console.log('Drawing element ' + this.elementID + '...');
            this.isDrawn = true;
            this.drawElement();
        }
        else
        {
            // console.log('Rendering properties of element ' + this.elementID + '...');
            this.properties.renderProperties();
        }
    }

    public drawElement()
    {
        // to be overwritten by element types classes who extend this class;
    }

    public undrawElement()
    {
        // todo: delete all nodes manually;
        this.isDrawn = false;
    }

    public getElementType(): SupportedUnitElementType
    {
        return this.properties.getPropertyValue('type');
    }

    public getElementID(): string
    {
        return this.elementID;
    }

    /* functions that handle element rendering */
    public dispatchNewElementDrawnEvent()
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.newElementDrawn', {
            detail: {'elementID': this.elementID}
        }));
    }
    /* end of functions that handle element rendering */

    public dispatchRefreshCheckedPropertyForAllElementsEvent()
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.refreshCheckedPropertyForAllElements', {
            detail: {}
        }));
    }

    public dispatchNavigateToPageEvent(pageID: string)
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.navigateToPage', {
            detail: {
                'pageID': pageID
            }
        }));
    }

    public getIsDrawn(): boolean {
        return this.isDrawn;
    }
}
