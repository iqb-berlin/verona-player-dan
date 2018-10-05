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
import {VideoElement} from './elementTypes/VideoElement.js';

// todo - customizable volume
// import {VolumePickerElement} from './elementTypes/VolumePicker.js';

import {colorsObject} from '../models/Colors.js';

export type SupportedUnitElementType = 'text' | 'image' | 'audio' | 'video' | 'textbox' | 'checkbox' |
'multipleChoice' | 'dropdown' | 'table' | 'volumePicker' | 'html';

export interface NewElementOptions {
    elementID: string;
    elementType: SupportedUnitElementType;
    elementContent?: string;

}

export class UnitPage extends ObjectWithProperties {
    public elements: Map<string, UnitElement> = new Map();

    private containerDiv: HTMLElement;
    private isDrawn: boolean = false;

    constructor(public pageID: string, public containerDivID: string, pageData?: UnitPageData)
    {
        super(pageID, 'UnitPage');

        this.containerDiv = document.getElementById(containerDivID) as HTMLDivElement;

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
        let unitPageData: UnitPageData = {
            properties: this.properties.getData(),
            elements: {}
        }

        this.elements.forEach((element:UnitElement, elementName: string) => {
            unitPageData.elements[elementName] = element.getData();
        });

        return unitPageData;
    }

    public loadData(unitPageData:UnitPageData): void
    {
        this.properties.loadData(unitPageData.properties);

        this.elements = new Map();

        for (const elementID in unitPageData.elements)
        {
            const elementType = unitPageData.elements[elementID].properties.type as SupportedUnitElementType;
            let elementContent = "";
            if ('src' in unitPageData.elements[elementID].properties) elementContent = unitPageData.elements[elementID].properties.src;

            let newElement =  this.newElement(elementID, elementType, elementContent);
            newElement.loadData(unitPageData.elements[elementID]);
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

        for (let i = 0; i < element.children.length; i++) {
            children.push(element.children[i]);
        }

        for (let i = 0; i < children.length; i++) {
            this.removeElementChildren(children[i]);
            // console.log('removing dom element ' + children[i].id);
            children[i].remove();
        }
    }

    public drawPage()
    {
       console.log('Drawing page ' + this.pageID);
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
        console.log('Undrawing page ' + this.pageID + ' ...');

        this.elements.forEach( (element: UnitElement) => {
            if ((element.getElementType() === 'audio') || (element.getElementType() === 'video')) {
                // if the element is an audio or video, empty it's contents before removing it from the DOM
               console.log('emptying source for ' + element.getElementID());
               element.setPropertyValue('src', '');

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
        console.log('----------------------------------------------------------------------------');
        console.log('Rendering page ' + this.pageID + ' (already drawn: ' + this.isDrawn + ' )');

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
    }

     public renderElementProperties()
     {
        console.log('Rendering properties of the elements on  page ' + this.pageID);
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


    public newElement(elementID: string, elementType: SupportedUnitElementType, elementContent: string = ''): UnitElement
    {
        let element: UnitElement;

        element = new UnitElement(elementID, this.getPageHTMLElementID());
        if (elementType === 'text') {
          element = new TextElement(elementID, this.getPageHTMLElementID());
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

        this.elements.set(elementID, element);

        return element;
    }

    public mapToAllTableCellsOnPage(f: TableCellFunction): void
    {
        this.getElementsMap().forEach((element:UnitElement) => {
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
