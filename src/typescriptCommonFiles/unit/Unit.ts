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

export type ElementFunction = (element: UnitElement) => any;

export class Unit extends ObjectWithProperties {
    private pages: Map<string, UnitPage> = new Map();

    private canvasID = 'itemCanvas';
    private currentPageID = '';

    public alwaysOnPage: UnitPage | undefined;

    constructor (public containerDivID: string, public alwaysOnPageDivID?: string)
    {
        super('UnitID', 'Unit'); // todo: UnitID

        const containerDiv = document.getElementById(containerDivID);

        if (containerDiv !== null)
        {
            console.log(`IQB Item Canvas: Container DIV (${containerDivID}) found. Initializing...`);

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

            const firstPage = this.newPage().getID();
            this.currentPageID = firstPage;

            console.log('IQB Item Canvas: Initialized.');
        }
        else
        {
            console.log('IQB Item Canvas: Error. No container DIV found. Initialization halted.');
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
        console.log('##################Loading new unit ################');
        // console.log('Unit data: ');
        // console.log(unitData);

        // before loading a new unit, first, clear this one
        this.pages.forEach((page: UnitPage, pageID: string) => {
            console.log('Deleting page ' + pageID);
            this.deletePage(pageID);
        });

        // then load the new unit
        console.log('Loading new unit...');
        this.properties.loadData(unitData.properties);

        this.pages = new Map();
        let currentPageIDInitialized = false;
        for (const pageID in unitData.pages)
        {
            if (pageID in unitData.pages) {
                const newPage = this.newPage(pageID);
                newPage.loadData(unitData.pages[pageID]);

                if (currentPageIDInitialized === false) {
                    this.currentPageID = pageID;
                    currentPageIDInitialized = true;
                }
            }
        }

        console.log('Loaded unit.');
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

    public newPage(pageID?: string): UnitPage
    {
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

        const newPage = new UnitPage(newPageID, this.containerDivID);
        this.pages.set(newPageID, newPage);
        return newPage;
    }

    public navigateToPage(pageID: string): boolean
    {
        console.log('Attempting to navigate to page ' + pageID);
        if (this.pages.has(pageID))
        {
            // undraw current page
            if (this.currentPageID !== '')
            {
                this.getCurrentPage().undrawPage();
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
                this.getCurrentPage().undrawPage();
            }

            // then delete the page
            this.pages.delete(pageID);


            // if page was currently being shown, then show another one
            if (this.currentPageID === pageID)
            {
                this.currentPageID = '';

                let newPageToShow = '';
                this.pages.forEach( (page: UnitPage, pageID: string) => {
                    newPageToShow = pageID;
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

    public render(): void
    {
        this.renderCurrentPage();

        this.renderAlwaysOnPage();
    }

    public renderCurrentPage(): void
    {
        console.log('### Unit -> rendering current page...');

        const currentPage = this.getCurrentPage();

        if (typeof currentPage !== 'undefined') {
            currentPage.render();
        }
    }

    public renderAlwaysOnPage(): void
    {
        console.log('### Unit -> rendering always on page (if there is one)...');

        if (typeof this.alwaysOnPageDivID !== 'undefined') {

            let alwaysOnPageBasis: UnitPage | undefined;

            this.getPagesMap().forEach((page) => {
                if (page.getPropertyValue('alwaysOn') !== 'no') {
                    alwaysOnPageBasis = page;
                }
            });

            if (typeof alwaysOnPageBasis !== 'undefined') {
                console.log('Using as basis for always on page...');
                console.log(alwaysOnPageBasis);

                console.log('Summarized in the following data...');
                const alwaysOnPageData = alwaysOnPageBasis.getData();
                console.log(alwaysOnPageBasis.getData());

                const alwaysOnPage = new UnitPage(alwaysOnPageBasis.getID(), this.alwaysOnPageDivID);
                alwaysOnPage.loadData(alwaysOnPageData);

                console.log('Obtained the following always on page:');
                console.log(alwaysOnPage);

                alwaysOnPage.render();
            }
        }
    }

    public getCanvasID(): string
    {
        return this.getCurrentPage().getPageHTMLElementID();
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

    public getCurrentPageHTMLElement(): HTMLDivElement
    {
        return document.getElementById(this.getCurrentPage().getPageHTMLElementID()) as HTMLDivElement;
    }

    public newElement(elementType: SupportedUnitElementType, elementContent: string = ''): UnitElement | undefined
    {
        if (this.currentPageID !== '')
        {
            const newElementsCounter = this.properties.getPropertyValue('elementsCounter') + 1;
            this.properties.setPropertyValue('elementsCounter', newElementsCounter);

            const elementID: string = 'canvasElement' + newElementsCounter;

            this.getCurrentPage().newElement(elementID, elementType, elementContent);
            const newElement = this.element(elementID);
            if (typeof newElement !== 'undefined') {
                newElement.render();
            }

            return newElement;
        }
        else
        {
            alert('Um ein Element hinzufügen, müssen Sie erst eine Seite erstellen.');
            return undefined;
        }
    }
}