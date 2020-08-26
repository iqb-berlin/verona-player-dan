// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from './UnitElement.js';
import {UnitPage} from './UnitPage.js';
import {Property, Properties} from './Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../models/Data.js';

import {AudioElement} from './elementTypes/AudioElement.js';
import {CheckboxElement} from './elementTypes/CheckboxElement.js';
import {DropdownElement} from './elementTypes/DropdownElement.js';
import {HtmlUnitElement} from './elementTypes/HtmlElement.js';
import {ImageElement} from './elementTypes/ImageElement.js';
import {MultipleChoiceElement} from './elementTypes/MultipleChoiceElement.js';
import {TableElement, TableCell, TableCellFunction} from './elementTypes/TableElement.js';
import {TextboxElement} from './elementTypes/TextboxElement.js';
import {TextElement} from './elementTypes/TextElement.js';
import {VideoElement} from './elementTypes/VideoElement.js';

import {ObjectWithProperties} from './ObjectWithProperties.js';
import {SupportedUnitElementType} from './UnitPage.js';
import { ViewpointElement } from './elementTypes/ViewpointElement.js';

export type ElementFunction = (element: UnitElement) => any;
export type ViewpointFunction = (viewpoint: ViewpointElement) => any;
export enum AlwaysOnPagePropertyValueType {
    NO = 'no',
    TOP = 'top',
    LEFT = 'left'
}

export class Unit extends ObjectWithProperties {
    private pages: Map<string, UnitPage> = new Map();

    private canvasID = 'itemCanvas';
    private currentPageID = '';

    public alwaysOnPage: UnitPage | undefined;

    constructor (public containerDivID: string, public alwaysOnPageDivID?: string, public showAlwaysOnPage: boolean = true)
    {
        super('UnitID', 'Unit'); // todo: UnitID

        const containerDiv = document.getElementById(containerDivID);

        if (containerDiv !== null)
        {
            window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
                detail: {'msgType': 'info', 'msg': `IQB Unit Canvas: Container DIV (${containerDivID}) found. Initializing...`}
            }));

            this.properties.addProperty('elementsCounter', {
                value: 0,
                userAdjustable: false,
                propertyType: 'number',
                hidden: true,
                caption: 'Elements counter'
            });

            this.properties.addProperty('pagesCounter', {
                value: 0,
                userAdjustable: false,
                propertyType: 'number',
                hidden: true,
                caption: 'Elements counter'
            });

            this.properties.addProperty('player', {
                value: '',
                userAdjustable: false,
                propertyType: 'text',
                hidden: true,
                caption: 'The player format for this Unit'
            });


            const firstPage = this.newPage().getID();
            this.currentPageID = firstPage;
            window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
                detail: {'msgType': 'info', 'msg': 'IQB Unit Canvas: Initialized.'}
            }));
        }
        else
        {
            window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
                detail: {'msgType': 'info', 'msg': 'IQB Unit Canvas: Error. No container DIV found. Initialization halted.'}
            }));
        }
    }

    public getData(): UnitData
    {
        const unitData: UnitData = {
            properties: this.properties.getData(),
            pages: {}
        };

        this.pages.forEach((page: UnitPage, pageID: string) => {
            unitData.pages[pageID] = page.getData();
        });

        return unitData;
    }

    public loadData(unitData: UnitData)
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': '################## Loading new unit ################'}
        }));
        // console.log('Unit data: ');
        // console.log(unitData);

        // before loading a new unit, first, clear this one
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': 'Clearing up the old unit...'}
        }));
        this.pages.forEach((page: UnitPage, pageID: string) => {
            window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
                detail: {'msgType': 'info', 'msg': 'Deleting page ' + pageID}
            }));
            this.deletePage(pageID);
        });

        this.currentPageID  = '';

        // then load the new unit
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': 'Loading the new unit...'}
        }));
        this.properties.loadData(unitData.properties);

        this.pages = new Map();
        let currentPageIDInitialized = false;
        for (const pageID in unitData.pages)
        {
            if (pageID in unitData.pages) {

                let alwaysOnPagePropertyValue: AlwaysOnPagePropertyValueType = AlwaysOnPagePropertyValueType.NO; // default to no
                if ('alwaysOn' in unitData.pages[pageID].properties) {
                    // if the data specifies an alwaysOn property for the page, use that instead
                    alwaysOnPagePropertyValue = unitData.pages[pageID].properties['alwaysOn'];
                }

                const newPage = this.newPage(pageID, alwaysOnPagePropertyValue);
                newPage.loadData(unitData.pages[pageID]);

                if (alwaysOnPagePropertyValue === 'no') {
                    if (currentPageIDInitialized === false) {
                        this.currentPageID = pageID;
                        currentPageIDInitialized = true;
                    }
                }
            }
        }

        if (this.currentPageID === '') {
            // if there is no main page to show, create an empty one;
            window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
                detail: {'msgType': 'info', 'msg': 'No non-alwayson page identified while loading unit; creating a new normal page to show as a main page.'}
            }));
            const newPageID: string = this.newPage().getID();
            this.currentPageID = newPageID;
        }
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': 'Loaded unit.'}
        }));
        // console.log('It now looks like this:');
        // console.log(this);
        this.render();
    }

    public importDataFromJSON(dataAsJson: string)
    {
        const unitData: UnitData = JSON.parse(dataAsJson);
        this.loadData(unitData);
    }

    public exportDataToJSON(): string
    {
        // console.log(this.getData());
        return JSON.stringify(this.getData());
    }


    public newPage(pageID?: string, alwaysOn: AlwaysOnPagePropertyValueType = AlwaysOnPagePropertyValueType.NO  ): UnitPage
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': 'Creating new page; pageID: ' + pageID + ' ; alwaysOn: ' + alwaysOn}
        }));
        let newPageID = '';

        if (typeof pageID === 'undefined')
        {
            const newPagesCounter = this.properties.getPropertyValue('pagesCounter') + 1;
            this.properties.setPropertyValue('pagesCounter', newPagesCounter);

            newPageID = 'seite' + newPagesCounter;
        }
        else {
            newPageID = pageID;
        }

        let pageContainerDivID = this.containerDivID;
        if (alwaysOn !== 'no') {
            if (typeof this.alwaysOnPageDivID !== 'undefined') {
                pageContainerDivID = this.alwaysOnPageDivID;
            }
            else {
                pageContainerDivID = '';
            }
        }

        const newPage = new UnitPage(newPageID, pageContainerDivID);
        this.pages.set(newPageID, newPage);
        return newPage;
    }

    public navigateToPage(pageID: string): boolean
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': 'Attempting to navigate to page ' + pageID}
        }));
        if (this.pages.has(pageID))
        {
            // undraw current page
            if (this.currentPageID !== '')
            {
                const currentPage = this.getCurrentPage();
                if (currentPage) {
                    currentPage.undrawPage();
                }
            }

            // change page
            this.currentPageID = pageID;

            // draw new page
            const currentPage = this.getCurrentPage();
            if (typeof currentPage !== 'undefined') {
                this.renderCurrentPage();
            }

            return true;
        }
        return false;
    }

    public deletePage(pageID: string): boolean
    {
        if (this.pages.has(pageID))
        {
            // if page is currently being shown, undraw it
            if (this.currentPageID === pageID)
            {
                const currentPage = this.getCurrentPage();
                if (currentPage) {
                    currentPage.undrawPage();
                }
            }

            // then delete the page
            this.pages.delete(pageID);


            // if page was currently being shown, then show another one
            if (this.currentPageID === pageID)
            {
                this.currentPageID = '';

                let newPageToShow = '';
                this.pages.forEach( (page: UnitPage, newPageID: string) => {
                    newPageToShow = newPageID;
                });
                this.navigateToPage(newPageToShow);
            }

            return true;
        }
        return false;
    }

    public getPage(pageID: string): UnitPage | undefined
    {
        return this.pages.get(pageID);
    }

    public deleteElement(elementID: string): void
    {
        // todo: tables

        /*
        if (this.unitData.getElementType(elementID) === 'table')
        {
            // if the element is a table, also delete all of its cells

            this.mapToTableCells(elementID, (tableCellElementID) => {
                this.deleteElement(tableCellElementID);
            });
        }
        */

        // remove it from the unit model
        this.pages.forEach((page: UnitPage) => {
            page.elements.forEach((element: UnitElement) => {
                if (element.getElementID() === elementID) {
                   if (element.getElementType() === 'table')
                   {
                       // if element is a table, then dispatch table cell deleted events for its cells
                       // todo: consider position of this in whole deletion process
                       const tableElement = element as TableElement;
                       tableElement.mapToTableCells((tableCell: TableCell) => {
                           tableElement.dispatchTableCellDeletedEvent(tableCell);
                       });
                   }
                   page.elements.delete(elementID);
                }
            });
        });

        // remove it from the dom
         const DOMElement = document.getElementById(elementID);
         if (DOMElement !== null)
         {
             if (DOMElement.parentNode !== null) {
                DOMElement.parentNode.removeChild(DOMElement);
             }
         }

        // todo: docking

        /*
        // after deleting the element, delete also the elements that are docked within it
        // (done at the end to avoid infinite loops if elements contain eachother)
        for (const dockedElementID of this.unitRenderer.getAllDockedElementIDs(elementID))
        {
            this.deleteElement(dockedElementID);
        }
        */

    }

    public element(elementID: string): UnitElement | undefined
    {
        // looks in all pages for an element with the id elementID
        // if it finds it, returns the element
        // if it does't find it, returns undefined

        let elementFound: UnitElement | undefined = undefined;

        this.pages.forEach((page: UnitPage) => {
            // console.log('Looking for element ' + elementID + ' in page ' + page.pageID);
            page.elements.forEach((element: UnitElement) => {
                // console.log('Considering element ' + element.getElementID());
                if (element.getElementID() === elementID) {
                    // console.log('Found it!');
                    elementFound = element;
                }
            });
        });

        return elementFound;
    }

    public mapToElements(elementFunction: ElementFunction)
    {
        this.getPagesMap().forEach((page: UnitPage) => {
            page.getElementsMap().forEach((element: UnitElement) => {
                elementFunction(element);
            });
        });
    }

    public mapToViewpoints(viewpointFunction: ViewpointFunction)
    {
        this.mapToElements((element: UnitElement) => {
            if (element.getElementType() === 'viewpoint') {
                const viewpointElement = element as ViewpointElement;
                viewpointFunction(viewpointElement);
            }
        });
    }

    public render(): void
    {
        this.renderCurrentPage();

        if (this.showAlwaysOnPage) {
            this.renderAlwaysOnPage();
        }
    }

    public renderCurrentPage(): void
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
            detail: {'msgType': 'info', 'msg': '### Unit -> rendering current page...'}
        }));
        const currentPage = this.getCurrentPage();

        if (typeof currentPage !== 'undefined') {
            currentPage.render();
        }
    }

    public renderAlwaysOnPage(): void
    {
        // console.log('### Unit -> Checking if there is an always on page to render...');

        if (typeof this.alwaysOnPageDivID !== 'undefined') {

            let alwaysOnPage: UnitPage | undefined;

            this.getPagesMap().forEach((page) => {
                if (page.getPropertyValue('alwaysOn') !== 'no') {
                    alwaysOnPage = page;
                }
            });

            if (typeof alwaysOnPage !== 'undefined') {
                window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
                    detail: {'msgType': 'info', 'msg': 'Decided that an alwaysOn page is also to be shown; Using as always on page...' + alwaysOnPage}
                }));
                alwaysOnPage.render();
            }
        }
    }

    public getCanvasID(): string
    {
        const currentPage = this.getCurrentPage();
        if (currentPage) {
            return currentPage.getPageHTMLElementID();
        } else {
            return '';
        }
    }

    public getCurrentPage(): UnitPage | undefined
    {
        // todo: current page should always exist?
        const currentPage = this.pages.get(this.currentPageID);
        if (typeof currentPage === 'undefined') {
            // console.log('getCurrentPage() call resulted in undefined');
            // console.trace();
        }
        return currentPage;
    }

    public getPagesMap(): Map<string, UnitPage>
    {
        return this.pages;
    }

    public getCurrentPageHTMLElement(): HTMLDivElement | undefined
    {
        const currentPage = this.getCurrentPage();
        if (currentPage) {
            return document.getElementById(currentPage.getPageHTMLElementID()) as HTMLDivElement;
        } else {
            return undefined;
        }
    }

    public newElement(elementType: SupportedUnitElementType, elementContent: string = ''): UnitElement | undefined
    {
        if (this.currentPageID !== '')
        {
            const newElementsCounter = this.properties.getPropertyValue('elementsCounter') + 1;
            this.properties.setPropertyValue('elementsCounter', newElementsCounter);

            const elementID: string = 'canvasElement' + newElementsCounter;

            const currentPage = this.getCurrentPage();
            if (currentPage) {
                currentPage.newElement(elementID, elementType, elementContent);
                const newElement = this.element(elementID);
                if (typeof newElement !== 'undefined') {
                    newElement.render();
                }

                return newElement;
            } else {
                return undefined
            }
        }
        else
        {
            alert('Um ein Element hinzufügen, müssen Sie erst eine Seite erstellen.');
            return undefined;
        }
    }
}
