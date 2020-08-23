// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from './UnitElement.js';
import {Property, Properties} from './Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData} from '../models/Data.js';
import {ObjectWithProperties} from './ObjectWithProperties.js';

import {AudioElement} from './elementTypes/AudioElement.js';
import {CheckboxElement} from './elementTypes/CheckboxElement.js';
import {DropdownElement} from './elementTypes/DropdownElement.js';
import {HtmlUnitElement} from './elementTypes/HtmlElement.js';
import {ImageElement} from './elementTypes/ImageElement.js';
import {MultipleChoiceElement} from './elementTypes/MultipleChoiceElement.js';
import {TableCell, TableElement, TableCellFunction} from './elementTypes/TableElement.js';
import {TextboxElement} from './elementTypes/TextboxElement.js';
import {TextElement} from './elementTypes/TextElement.js';
import {MultilineTextboxElement} from './elementTypes/MultilineTextboxElement.js';
import {VideoElement} from './elementTypes/VideoElement.js';
import {ViewpointElement} from './elementTypes/ViewpointElement.js';
import {ButtonElement} from './elementTypes/ButtonElement.js';

// todo - customizable volume
// import {VolumePickerElement} from './elementTypes/VolumePicker.js';

import {colorsObject} from '../models/Colors.js';

export type SupportedUnitElementType = 'text' | 'image' | 'audio' | 'video' | 'textbox' | 'multilineTextbox' | 'checkbox' |
'multipleChoice' | 'dropdown' | 'table' | 'volumePicker' | 'html' | 'viewpoint' | 'button';

export interface NewElementOptions {
    elementID: string;
    elementType: SupportedUnitElementType;
    elementContent?: string;

}

interface consideredElementForTabOrder {
    elementID: string;
    elementType: SupportedUnitElementType;
    left: number;
    top: number;
}

export class UnitPage extends ObjectWithProperties {
    public elements: Map<string, UnitElement> = new Map();

    private containerDiv: HTMLElement;
    private isDrawn: boolean = false;
    public viewed: boolean;

    constructor(public pageID: string, public containerDivID: string, pageData?: UnitPageData)
    {
        super(pageID, 'UnitPage');

        this.containerDiv = document.getElementById(containerDivID) as HTMLDivElement;

        this.viewed = false;

        if (typeof pageData === 'undefined')
        {
            this.properties.addProperty('type', {
                value: 'page',
                userAdjustable: false,
                propertyType: 'text',
                hidden: false,
                caption: 'Type',
                tooltip: 'Was für ein Objekt dieses Objekt ist'
            });

            /*
            this.properties.addProperty('style', {
                value: '',
                userAdjustable: true,
                propertyType: 'text',
                hidden: false,
                caption: 'Style',
                tooltip: 'Besondere Eigenschaft, wo man CSS-Code einführen kann.'
            });
            */

            this.properties.addProperty('background-color', {
                value: 'white',
                userAdjustable: true,
                propertyType: 'dropdown',
                propertyData: colorsObject,
                hidden: false,
                caption: 'Hintergrundfarbe',
                tooltip: 'Die Hintergrundfarbe der Seite'
            });

            this.properties.addProperty('width', {
                value: 700,
                userAdjustable: true,
                propertyType: 'number',
                hidden: false,
                caption: 'Breite',
                tooltip: 'Die horizontale Größe der Seite'
            });

            this.properties.addProperty('height', {
                value: 600,
                userAdjustable: true,
                propertyType: 'number',
                hidden: false,
                caption: 'Höhe',
                tooltip: 'Die vertikale Größe der Seite.'
            });

            this.properties.addProperty('alwaysOn', {
                value: 'no',
                userAdjustable: true,
                propertyType: 'dropdown',
                propertyData: {'nein' : 'no',
                               'Oben': 'top',
                               'Links': 'left'
               },
                hidden: false,
                caption: 'Immer angezeigt',
                tooltip: 'Falls diese Seite immer angezeigt werden soll, wo soll die angezeigt werden'
            });

            /*
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
            */

            this.properties.addProperty('padding', {
                value: '0',
                userAdjustable: true,
                propertyType: 'dropdown',
                propertyData: {'0px': '0',
                '10px': '10',
                '20px': '20',
                '30px': '30',
                '40px': '40',
                '50px': '50',
                '60px': '60',
                '70px': '70',
                '80px': '80',
                '90px': '90',
                '100px': '100'
                },
                hidden: false,
                caption: 'Seitenrand',
                tooltip: 'Wie viel Platz am Rand der Seite frei gelassen wird.'
            });


        }
        else
        {
            // use pageData to init it
            // todo
        }

        window.addEventListener('IQB.unit.refreshCheckedPropertyForAllElements', (e) => {
            this.refreshCheckedPropertyForAllElements();
        });
    }

    public getData(): UnitPageData
    {
        const unitPageData: UnitPageData = {
            properties: this.properties.getData(),
            elements: {}
        };

        this.elements.forEach((element: UnitElement, elementName: string) => {
            unitPageData.elements[elementName] = element.getData();
        });

        return unitPageData;
    }

    public loadData(unitPageData: UnitPageData): void
    {
        this.properties.loadData(unitPageData.properties);

        this.elements = new Map();

        for (const elementID in unitPageData.elements)
        {
            if (elementID in unitPageData.elements) {
                const elementType = unitPageData.elements[elementID].properties.type as SupportedUnitElementType;
                let elementContent = '';
                if ('src' in unitPageData.elements[elementID].properties) {
                    // console.log('src found for ' + elementID + ' when loading its data.');
                    elementContent = unitPageData.elements[elementID].properties.src;
                }
                const newElement =  this.newElement(elementID, elementType, elementContent);
                if (newElement !== null) {
                    newElement.loadData(unitPageData.elements[elementID]);
                }
            }
        }
    }

    public getPageHTMLElement()
    {
        return document.getElementById(this.pageID);
    }

    public getPageHTMLElementID()
    {
        return this.pageID;
    }

    public responseGivenForMultipleChoiceGroup(groupName: string) {
        let dispatchEvent = false;

        this.elements.forEach((element) => {
            const elementID: string = element.getElementID();
            const elementType: string = element.getElementType();
            if (elementType === 'multipleChoice')
            {
                const multipleChoiceElement = element as MultipleChoiceElement;
                if (multipleChoiceElement.getPropertyValue('groupName') === groupName) {
                    if (multipleChoiceElement.responseGiven === false) {
                        multipleChoiceElement.responseGiven = true;
                        dispatchEvent = true;
                    }
                }
            }
        });

        if (dispatchEvent) {
            // this event is used to notify a change in the response given property of the multiple choice elements belonging to the group
            window.dispatchEvent(new CustomEvent('IQB.unit.responseGiven', {
                detail: {}
            }));
        }
    }

    public refreshCheckedPropertyForAllElements() {
        this.elements.forEach((element) => {
            const elementID: string = element.getElementID();
            const elementType: string = element.getElementType();

            if (elementType === 'checkbox')
            {
                if (document.getElementById(elementID + '_checkbox') !== null)
                {
                    if ((document.getElementById(elementID + '_checkbox') as HTMLInputElement).checked) {
                        element.properties.setPropertyValue('checked', 'true');
                    }
                    else {
                        element.properties.setPropertyValue('checked', 'false');
                    }
                }
            }
            if (elementType === 'multipleChoice')
            {
                if (document.getElementById(elementID + '_multipleChoice') !== null)
                {
                    if ((document.getElementById(elementID + '_multipleChoice') as HTMLInputElement).checked) {
                        element.properties.setPropertyValue('checked', 'true');

                        this.responseGivenForMultipleChoiceGroup(element.getPropertyValue('groupName'));
                    }
                    else {
                        element.properties.setPropertyValue('checked', 'false');
                    }
                }
            }
        });
    }

    public getPropertyValue(propertyName: string): any
    {
        return this.properties.getPropertyValue(propertyName);
    }

    public setPropertyValue(propertyName: string, propertyValue: any): void
    {
        this.properties.setPropertyValue(propertyName, propertyValue);
    }


    public getElementsMap(): Map<string, UnitElement>
    {
        return this.elements;
    }
     /* functions that handle rendering page properties */

    private removeElementChildren(element: Element) {

        const children = [];

        if (element !== null) {
            for (let i = 0; i < element.children.length; i++) {
                children.push(element.children[i]);
            }

            for (let i = 0; i < children.length; i++) {
                this.removeElementChildren(children[i]);
                // console.log('removing dom element ' + children[i].id);
                element.removeChild(children[i]);
            }
        }
    }

    public drawPage()
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': 'Drawing page ' + this.pageID + '; Page container: ' + this.containerDivID}
        }));
        this.viewed = true;

        const pageStyle = `display: inline-block; position: relative; margin-left: auto; margin-right: auto; text-align: left;`;
        // the position needs to be relative, so that it is considered positioned,
        // so that its children with absolute coordinates get drawn in reference to it
        // see https://developer.mozilla.org/en-US/docs/Web/CSS/position for reference

        this.removeElementChildren(this.containerDiv);

        this.containerDiv.innerHTML = `<div id="${this.pageID}" class="UnitPage" style="${pageStyle}"></div>`;

        this.initializePagePropertyRenderers();
    }

    public undrawPage()
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': 'Undrawing page ' + this.pageID + ' ...'}
        }));
        this.elements.forEach( (element: UnitElement) => {
            if ((element.getElementType() === 'audio') || (element.getElementType() === 'video')) {
                // if the element is an audio or video, empty it's contents before removing it from the DOM
                window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
                    detail: {'msgType': 'info', 'msg': 'emptying source for ' + element.getElementID()}
                }));
               // element.setPropertyValue('src', '');

               let elementNode: HTMLElement | null;
               elementNode = document.getElementById(element.getElementID() + '_audio');
               if (elementNode !== null) {
                   const elementAudioNode = elementNode as HTMLAudioElement;
                   elementAudioNode.src = '';
               }
            }
        });

        this.removeElementChildren(this.containerDiv);

        this.elements.forEach( (element: UnitElement) => {
            element.undrawElement();
        });

        this.containerDiv.innerHTML = ``;

        this.isDrawn = false;
    }

    public render()
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': '---------------------------------Rendering page ' + this.pageID + ' (already drawn: ' + this.isDrawn + ' )'}
        }));

        if (this.isDrawn === false)
        {
            this.isDrawn = true;
            this.drawPage();

            this.dispatchNewPageDrawnEvent();
        }

        this.properties.renderProperties();

        this.elements.forEach((element) => {
            element.render();
        });

        // apply proper tab order (top down; left right;) to drawn elements
        const consideredElements: consideredElementForTabOrder[] = [];
        this.elements.forEach((element) => {
            if ((element.getElementType() === 'checkbox') ||
               (element.getElementType() === 'multipleChoice') ||
               (element.getElementType() === 'dropdown') ||
               (element.getElementType() === 'textbox')) {
                   consideredElements.push({
                       'elementID': element.getElementID(),
                       'elementType': element.getElementType(),
                       'left': element.left / 10, // divide by 10 for more natural ordering
                       'top': element.top / 10 // divide by 10 for more natural ordering
                    });
               }
        });

        consideredElements.sort((elementA: consideredElementForTabOrder, elementB: consideredElementForTabOrder): number => {
            if (elementA.top > elementB.top) {
                return 1;
            }
            else {
                if (elementA.top < elementB.top) {
                    return -1;
                }
                else {
                    // elementA.top === elementB.top
                    if (elementA.left > elementB.left) {
                        return 1;
                    }
                    else {
                        if (elementA.left < elementB.left) {
                            return -1;
                        }
                        else {
                            // elementA.left === elementB.left
                            return 0;
                        }
                    }
                }
            }
        });

        let tabIndex = 0;
        consideredElements.forEach( (consideredElement: consideredElementForTabOrder) => {
            document.querySelectorAll('.' + consideredElement.elementID + '_tabIndexable').forEach((element: Element) => {
                const tabIndexableElement = element as HTMLInputElement;
                if (consideredElement.elementType === 'textbox') {
                    // textboxes should be reachable via tab
                    tabIndex++;
                    tabIndexableElement.tabIndex = tabIndex;
                }
                else
                {
                    // checkboxes, multiple choices and dropdown boxes should not be reachable via keyboard tab
                    // so as not to then press arrows and not notice that the answer has changed
                    tabIndexableElement.tabIndex = -1;
                }
            });
        });

        // finished applying proper tab order to drawn elements
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': 'Render of page ' + this.pageID + ' complete.--------------------------------'}
        }));
    }

     public renderElementProperties()
     {
         window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
             detail: {'msgType': 'info', 'msg': 'Rendering properties of the elements on  page ' + this.pageID}
         }));
        this.elements.forEach((element: UnitElement, elementID: string) =>
        {
            element.properties.renderProperties();
        });
     }

     public initializePagePropertyRenderers()
     {
         const pageHTMLElement = document.getElementById(this.pageID) as HTMLElement;

         /*
         this.properties.addPropertyRenderer('style', 'basicRenderer', (propertyValue: any) => {
           pageHTMLElement.setAttribute('style', String(this.properties.getPropertyValue('style')));
         });
         */

         this.properties.addPropertyRenderer('background-color', 'basicRenderer', (propertyValue: any) => {
            pageHTMLElement.style.backgroundColor = String(this.properties.getPropertyValue('background-color'));
        });

         this.properties.addPropertyRenderer('width', 'basicRenderer', (propertyValue: any) => {
             // console.log('rendering page width - ' + this.properties.getPropertyValue('width'));
            let newWidth = this.properties.getPropertyValue('width');
            if (newWidth < 10) {
                newWidth = 10;
            }
            if (propertyValue !== newWidth) {
                this.properties.setPropertyValue('width', newWidth);
            }
            pageHTMLElement.style.width =  newWidth  + 'px';
         });

         this.properties.addPropertyRenderer('height', 'basicRenderer', (propertyValue: any) => {
            // console.log('rendering page height - ' + this.properties.getPropertyValue('height'));

            let newHeight = this.properties.getPropertyValue('height');
            if (newHeight < 10) {
              newHeight = 10;
            }
            if (propertyValue !== newHeight) {
                this.properties.setPropertyValue('height', newHeight);
            }
            pageHTMLElement.style.height = newHeight + 'px';
         });

         this.properties.addPropertyRenderer('padding', 'basicRenderer', (propertyValue: any) => {

            if ((propertyValue * 2 > this.properties.getPropertyValue('height')) ||
                (propertyValue * 2 > this.properties.getPropertyValue('width')))
            {
                this.setPropertyValue('padding', '0');
            }
            window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
             detail: {'msgType': 'info', 'msg': 'Der Seitenrand von ' + propertyValue + 'px ist zu groß! Der wird stattdessen auf 0px gesetzt.'}
            }));
         });

         // whenever a canvas property is rendered, re-render also element properties
        // this.properties.getPropertyNames().forEach((propertyName:string) => {
        //     // for each canvas property
        //     this.properties.addPropertyRenderer(propertyName, 'refreshElements', (propertyValue: any) => {
        //         // render all of the elements,
        //     });
        // });
    }

    public dispatchNewPageDrawnEvent()
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.newPageDrawn', {
            detail: {'pageID': this.getID()}
        }));
    }

     /* end of functions that handle rendering page properties */


    public newElement(elementID: string, elementType: SupportedUnitElementType, elementContent: string = ''): UnitElement | null
    {
        let element: UnitElement | null;

        element = null;

        if (elementType === 'text') {
          element = new TextElement(elementID, this.getPageHTMLElementID());
        }

        if (elementType === 'multilineTextbox') {
            element = new MultilineTextboxElement(elementID, this.getPageHTMLElementID());
          }

        if (elementType === 'image') {
         element = new ImageElement(elementID, this.getPageHTMLElementID(), elementContent);
        }

        if (elementType === 'audio') {
          element = new AudioElement(elementID, this.getPageHTMLElementID(), elementContent);
        }

        if (elementType === 'video') {
          element = new VideoElement(elementID, this.getPageHTMLElementID(), elementContent);
        }

        if (elementType === 'textbox')
        {
          element = new TextboxElement(elementID, this.getPageHTMLElementID());
        }

        if (elementType === 'checkbox')
        {
          element = new CheckboxElement(elementID, this.getPageHTMLElementID());
        }

        if (elementType === 'multipleChoice')
        {
          element = new MultipleChoiceElement(elementID, this.getPageHTMLElementID());
        }

        if (elementType === 'dropdown')
        {
          element = new DropdownElement(elementID, this.getPageHTMLElementID());
        }

        if (elementType === 'table')
        {
         element = new TableElement(elementID, this.getPageHTMLElementID());
        }

        // todo - customizable volume
        /*
        if (elementType === 'volumePicker')
        {
         element = new VolumePickerElement(elementID, this.getPageHTMLElementID());
        }
        */

        if (elementType === 'html')
        {
         element = new HtmlUnitElement(elementID, this.getPageHTMLElementID());
        }

        if (elementType === 'viewpoint')
        {
         element = new ViewpointElement(elementID, this.getPageHTMLElementID());
        }

        if (elementType === 'button')
        {
         element = new ButtonElement(elementID, this.getPageHTMLElementID());
        }

        if (element !== null) {
         this.elements.set(elementID, element);
        }
        else {
            window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
                detail: {'msgType': 'error', 'msg': 'IQB Visual Unit: Could not create new element ' + elementID + ' with type ' + elementType + '. Type not recognized.'}
            }));
        }

        return element;
    }

    public mapToAllTableCellsOnPage(f: TableCellFunction): void
    {
        this.getElementsMap().forEach((element: UnitElement) => {
            if (element.getElementType() === 'table')
            {
                const tableElement = element as TableElement;
                tableElement.mapToTableCells(f);
            }
        });
    }

    public getTableCell(tableCellID: string): TableCell | undefined
    {
        let desiredTableCell: TableCell | undefined = undefined;
        this.mapToAllTableCellsOnPage((tableCell: TableCell) => {
            if (tableCell.getID() === tableCellID) {
                desiredTableCell = tableCell;
            }
        });
        return desiredTableCell;
    }
}
