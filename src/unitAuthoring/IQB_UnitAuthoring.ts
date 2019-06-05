/*
IQB Unit Authoring Entry Point
*/

// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2019
// license: MIT

import { VO } from '../typescriptCommonFiles/interfaces/iqb.js';

import { Property } from '../typescriptCommonFiles/unit/Properties.js';
import { ObjectWithProperties } from '../typescriptCommonFiles/unit/ObjectWithProperties.js';
import { ObjectWithSpatialProperties } from '../typescriptCommonFiles/unit/ObjectWithSpatialProperties.js';
import { UnitElement } from '../typescriptCommonFiles/unit/UnitElement.js';
import { UnitElementData } from '../typescriptCommonFiles/models/Data.js';
import { UnitPage, SupportedUnitElementType } from '../typescriptCommonFiles/unit/UnitPage.js';
import { Unit } from '../typescriptCommonFiles/unit/Unit.js';
import { PropertiesToolbox } from './features/PropertiesToolbox.js';
import { PopupMenu } from './features/PopupMenu.js';
import { DockingFeatures } from './features/DockingFeatures.js';

import { AudioElement } from '../typescriptCommonFiles/unit/elementTypes/AudioElement.js';
import { CheckboxElement } from '../typescriptCommonFiles/unit/elementTypes/CheckboxElement.js';
import { DropdownElement } from '../typescriptCommonFiles/unit/elementTypes/DropdownElement.js';
import { HtmlUnitElement } from '../typescriptCommonFiles/unit/elementTypes/HtmlElement.js';
import { ImageElement } from '../typescriptCommonFiles/unit/elementTypes/ImageElement.js';
import { MultipleChoiceElement } from '../typescriptCommonFiles/unit/elementTypes/MultipleChoiceElement.js';
import { TableCell, TableElement } from '../typescriptCommonFiles/unit/elementTypes/TableElement.js';
import { TextboxElement } from '../typescriptCommonFiles/unit/elementTypes/TextboxElement.js';
import { TextElement } from '../typescriptCommonFiles/unit/elementTypes/TextElement.js';
import { VideoElement } from '../typescriptCommonFiles/unit/elementTypes/VideoElement.js';

const vo_UnitAuthoringInterface =
{
    player: 'IQBVisualUnitPlayerV2',
    containerWindow: window.parent,
    checkOrigin: false,
    acceptedOrigin: '*',
    sessionId: ''
};

class IQB_UnitAuthoringTool
{
    private currentUnit: Unit;
    private dockingFeatures: DockingFeatures;

    private selectedObjectWithProperties: ObjectWithProperties | undefined = undefined;

    private containerDivID = 'normalPageContainer';
    private currentPageSelectID = 'currentPageSelect';

    private shownPropertiesNeedToBeRefreshed = false;

    private propertiesToolbox = new PropertiesToolbox('elementProperties', 'elementPropertiesTitle');
    private popupMenus: Map<string, PopupMenu> = new Map();

    private nothingSelectedObject = new ObjectWithProperties('nothing selected', 'nothingSelected');

    private isLoaded: boolean = false;

    private doPaddingCheck: boolean = false;

    constructor(private standAloneMode: boolean = true)
    {
        this.initializeToolbar();

        window.addEventListener('IQB.unit.hasLoaded', (e) => {
            this.UnitHasLoadedListener(e);
        });

        window.addEventListener('IQB.unit.newPageDrawn', (e) => {
            this.newPageDrawnListener(e);
        });

        window.addEventListener('IQB.unit.newElementDrawn', (e) => {
            this.newElementDrawnListener(e);
        });

        window.addEventListener('IQB.unit.newTableCellDrawn', (e) => {
            this.newTableCellDrawnListener(e);
        });
        window.addEventListener('IQB.unit.tableCellDeleted', (e) => {
            this.tableCellDeletedListener(e);
        });

        window.addEventListener('IQB.unit.propertyUpdated', (e) => {
            this.propertyUpdatedListener(e);
        });

        window.addEventListener('IQB.unit.navigateToPage', (e) => {
            this.currentUnit.navigateToPage(e.detail.pageID);

            this.updateCurrentPageSelect();
        });

        window.addEventListener('IQB.unit.audioElementAutoplayed', (e) => {
            // if element is audio or video element, pause it (so as not to autoplay)
            const elementID: string = e.detail.elementID;
            const audioElement = this.currentUnit.element(elementID) as AudioElement;
            audioElement.pause();
        });

        window.addEventListener('IQB.unit.videoElementStarted', (e) => {
            // if element is audio or video element, pause it (so as not to autoplay)
            const videoElement = document.getElementById(e.detail.elementID + '_video') as HTMLVideoElement | null;
            if (videoElement !== null) {
               videoElement.pause();
            }
        });

        // end of pausing audios and videos when added so as not to autoplay


        // when clicking outside the page, select nothing
        const containerHTMLElement = document.getElementById(this.containerDivID) as HTMLDivElement;
        containerHTMLElement.addEventListener('mousedown', (e) => {
            if (e.target.id === this.containerDivID)
            {
                this.selectObject(this.nothingSelectedObject);
            }
        });
        // end of when clicking outside the page functionality

        this.currentUnit = new Unit(this.containerDivID, this.containerDivID, false);
        this.dockingFeatures = new DockingFeatures(this.currentUnit);

        this.currentUnit.render();


        this.initializeUnitAuthoringTools();

        setInterval(() => {
            if (this.shownPropertiesNeedToBeRefreshed)
            {
                if (typeof this.selectedObjectWithProperties !== 'undefined')
                {
                    this.propertiesToolbox.showPropertiesOf(this.selectedObjectWithProperties);
                }

                this.shownPropertiesNeedToBeRefreshed = false;
            }
        }, 100);

        setInterval(() => {
            // padding check
            // todo: only start interval when property has changed

            if (this.doPaddingCheck)
            {

                if (typeof this.currentUnit !== 'undefined') {
                    const currentPage = this.currentUnit.getCurrentPage();
                    if (typeof currentPage !== 'undefined') {
                        const padding = parseInt(currentPage.getPropertyValue('padding'), 10);
                        const pageWidth = parseInt(currentPage.getPropertyValue('width'), 10);
                        const pageHeight = parseInt(currentPage.getPropertyValue('height'), 10);

                        currentPage.getElementsMap().forEach((element: UnitElement) => {
                            let elementChanged: boolean = false;
                            if (element.left < padding) {
                                element.left = padding;

                                // check if element is too big to fit into padding; if so make it smaller;
                                if (element.left + element.width > pageWidth - padding) {
                                    element.width = pageWidth - padding - element.left - 10;
                                }

                                elementChanged = true;
                            }
                            if (element.left + element.width > pageWidth - padding) {
                                element.left = pageWidth - padding - element.width;

                                // check if element is too big to fit into padding; if so make it smaller;
                                if (element.left < padding) {
                                    element.width = pageWidth - 2 * padding - 10;
                                    element.left = padding;
                                }

                                elementChanged = true;
                            }
                            if (element.top < padding) {
                                element.top = padding;

                                // check if element is too big to fit into padding; if so make it smaller;
                                if (element.top + element.height > pageHeight - padding) {
                                    element.height = pageHeight - element.top - padding - 10;
                                }

                                elementChanged = true;
                            }
                            if (element.top + element.height > pageHeight - padding) {
                                element.top = pageHeight - padding - element.height;

                                // check if element is too big to fit into padding; if so make it smaller;
                                if (element.top < 0) {
                                    element.height = pageHeight - 2 * padding - 10;
                                    element.top = padding;
                                }

                                elementChanged = true;
                            }

                            if (elementChanged) {
                                // console.log('x:' + element.left + ' y:' + element.top + ' width:' + element.width + ' height:' + element.height);
                                element.render();
                            }
                        });
                    }
                }

                this.doPaddingCheck = false;
            }
        }, 100);

        this.dispatchUnitHasLoadedEvent();
    }

    private updateCurrentPageSelect()
    {

        function updatePropertiesWithPagesAsDropdownOptions(propertiesMap: Map<string, Property>,
                                                            pagesObject: object,
                                                            propertiesOwner: UnitElement | UnitPage)
        {
            propertiesMap.forEach( (property: Property, propertyName: string) => {
                if (propertyName === 'navigateToPage')
                {
                    property.propertyData = pagesObject;

                    let validValue = false;
                    for (const optionName in property.propertyData)
                    {
                        if (property.propertyData[optionName] === property.value) {
                            validValue = true;
                        }
                    }
                    if (validValue === false) {
                        property.value = '';
                        propertiesOwner.render();
                    }
                }
            });
        }

        // update the page selection dropdown
        const currentPageSelectHTMLElement = document.getElementById(this.currentPageSelectID) as HTMLSelectElement;
        let newSelectInnerHTML = '';

        const pagesMap = this.currentUnit.getPagesMap();
        pagesMap.forEach( (page: UnitPage, pageName: string) => {
            let selectedAttribute = '';
            if (this.currentUnit.getCurrentPage().getID() === pageName) {
                selectedAttribute = 'selected';
            }

            newSelectInnerHTML += `<option id="${pageName}" ${selectedAttribute}>${pageName}</option>`;
        });

        currentPageSelectHTMLElement.innerHTML = newSelectInnerHTML;

        // also update properties where the value is one of the pages that belong to the unit
        const pagesObject = {'': ''};
        pagesMap.forEach((page: UnitPage, pageName: string) => {
            pagesObject[pageName] = pageName;
        });

        // console.log(pagesObject);

        pagesMap.forEach((page: UnitPage, pageName: string) => {
            updatePropertiesWithPagesAsDropdownOptions(page.getPropertiesMap(), pagesObject, page); // update page properties

            page.getElementsMap().forEach( (element: UnitElement, elementName: string) => {
                // update element properties
                updatePropertiesWithPagesAsDropdownOptions(element.getPropertiesMap(), pagesObject, element);
            });
        });
    }

    public dispatchUnitHasChangedEvent()
    {
        // console.log('IQB Unit Authoring Tool: IQB.unit.hasChanged event has been dispatched.');
        window.dispatchEvent(new CustomEvent('IQB.unit.hasChanged', {
            detail: {}
        }));
    }

    public dispatchUnitHasLoadedEvent()
    {
        // instead of directly setting the this.isLoaded variable to true, an event is dispatched
        // so that all events triggered while the unit was loading will still be processed before the unit is marked as loaded
        window.dispatchEvent(new CustomEvent('IQB.unit.hasLoaded', {
            detail: {}
        }));
    }

    public UnitHasLoadedListener(e)
    {
        this.isLoaded = true;
    }

    private newPageDrawnListener(e)
    {
        // listens for the rendering of new elements
        const pageID = e.detail.pageID; // when a new element is rendered, its elementID is provided in e.detail.elementID
        this.drawPageAuthoringTools(pageID);
    }


    private newElementDrawnListener(e)
    {
        // console.log('New element rendered:');
        // console.log(e);

        // listens for the rendering of new elements
        const elementID = e.detail.elementID; // when a new element is rendered, its elementID is provided in e.detail.elementID

        this.drawElementAuthoringTools(elementID);
    }

    private newTableCellDrawnListener(e)
    {
        // console.log('New table cell rendered:');
        // console.log(e);

        // listens for the rendering of new table cells
        const tableCell = e.detail.tableCell; // when a new table cell is rendered, a reference to it is provided in e.detail.tableCell
        this.drawTableCellAuthoringTools(tableCell);
    }

    private tableCellDeletedListener(e)
    {
        // listens for the deletion of table cells so as to also delete their contents
        const tableCell = e.detail.tableCell; // when a new table cell is deleted, a reference to it is provided in e.detail.tableCell
        this.dockingFeatures.getAllDockedElements(tableCell).forEach((dockedElement: UnitElement) => {
            this.currentUnit.deleteElement(dockedElement.getElementID());
        });
    }


    private propertyUpdatedListener(e)
    {
        // console.log(e);

        // listens for the rendering of new elements
        const propertyOwner = e.detail.propertyOwner;
        const propertyOwnerID: string = e.detail.propertyOwnerID;
        const propertyOwnerType: string = e.detail.propertyOwnerType;
        const propertyName: string = e.detail.propertyName;

        if (typeof this.selectedObjectWithProperties !== 'undefined')
        {
            if (this.selectedObjectWithProperties.getID() === propertyOwnerID)
            {
                            // if the properties of the current object have changed, the properties that are shown need to be refreshed
                            this.shownPropertiesNeedToBeRefreshed = true;
            }
        }

        // enforce page padding
        this.doPaddingCheck = true;

        // end of enforcing page padding

        if (propertyOwnerType === 'TableCell') {
            const tableCell = propertyOwner as TableCell;
            if ((propertyName === 'height') || (propertyName === 'width'))
            {
                // if a cell has been resized, or somehow its size changed, then update the docked elements inside it
                this.dockingFeatures.getAllDockedElements(tableCell).forEach((dockedElement: UnitElement) => {
                    this.dockingFeatures.enforceElementDockingPosition(dockedElement);
                    this.dockingFeatures.enforceElementDockingSize(dockedElement);
                });

                // and update docking popup menu items
                this.updateAllPopupMenuItemsConcerningDocking();
            }

            if ((propertyName === 'top') || (propertyName === 'left'))
            {
                // if a cell has been moved, propagate its new position to its docked elements
                this.dockingFeatures.propagateObjectMoveToDockedElements(tableCell);

                // and update docking popup menu items
                this.updateAllPopupMenuItemsConcerningDocking();
            }
        }

        if (this.isLoaded) {
            // console.log('Unit has changed');
            // console.log(e);
            this.dispatchUnitHasChangedEvent();
        }
    }


    private initializeToolbar()
    {
        (document.getElementById('btnAddText') as HTMLInputElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('text');
        });

        (document.getElementById('btnAddMultilineTextbox') as HTMLInputElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('multilineTextbox');
        });

        (document.getElementById('btnAddImage') as HTMLInputElement).addEventListener('click', (e) => {
            this.AddFile('Bild hinzufügen', (uploadedFileContentAsUrl: string) =>
            {
                this.currentUnit.newElement('image', uploadedFileContentAsUrl);
            }, 'url');
        });

        (document.getElementById('btnAddAudio') as HTMLInputElement).addEventListener('click', (e) => {
            this.AddFile('Audio hinzufügen', (uploadedFileContentAsUrl: string) =>
            {
                this.currentUnit.newElement('audio', uploadedFileContentAsUrl);
            }, 'url');
        });

        (document.getElementById('btnAddVideo') as HTMLInputElement).addEventListener('click', (e) => {
            this.AddFile('Video hinzufügen', (uploadedFileContentAsUrl: string) =>
            {
                this.currentUnit.newElement('video', uploadedFileContentAsUrl);
            }, 'url');
        });

        (document.getElementById('btnAddTextbox') as HTMLButtonElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('textbox');
        });

        (document.getElementById('btnAddCheckbox') as HTMLButtonElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('checkbox');
        });

        (document.getElementById('btnAddMultipleChoice') as HTMLButtonElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('multipleChoice');
        });

        (document.getElementById('btnAddDropdown') as HTMLButtonElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('dropdown');
        });

        (document.getElementById('btnAddTable') as HTMLButtonElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('table');
        });

        // todo - customizable volume
        /*
        (document.getElementById('btnAddVolumePicker') as HTMLButtonElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('volumePicker');
        });
        */

        (document.getElementById('btnAddHTML') as HTMLButtonElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('html');
        });

        (document.getElementById('btnAddViewpoint') as HTMLButtonElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('viewpoint');
        });

        (document.getElementById('btnAddButton') as HTMLButtonElement).addEventListener('click', (e) => {
            this.currentUnit.newElement('button');
        });

        const btnSpreadfont = document.getElementById('btnSpreadFont') as HTMLElement;
        (document.getElementById('btnSpreadFont') as HTMLButtonElement).addEventListener('click', (e) => {
            if (btnSpreadfont.style.color === 'black') {
                if (typeof this.selectedObjectWithProperties !== 'undefined') {
                    const selectedObject = this.selectedObjectWithProperties;
                    const currentPage = this.currentUnit.getCurrentPage();
                    if (typeof currentPage !== 'undefined') {
                        currentPage.getElementsMap().forEach((element: UnitElement) => {

                            if (selectedObject.properties.hasProperty('font-family') && element.properties.hasProperty('font-family')) {
                                element.setPropertyValue('font-family', selectedObject.getPropertyValue('font-family'));
                            }
                            if (selectedObject.properties.hasProperty('font-size') && element.properties.hasProperty('font-size')) {
                                element.setPropertyValue('font-size', selectedObject.getPropertyValue('font-size'));
                            }
                            if (selectedObject.properties.hasProperty('color') && element.properties.hasProperty('color')) {
                                element.setPropertyValue('color', selectedObject.getPropertyValue('color'));
                            }
                            element.render();

                        });
                    }
                }
            }
        });

        const btnCopyElement = document.getElementById('btnCopyElement') as HTMLElement;
        btnCopyElement.addEventListener('click', (e) => {
            if (btnCopyElement.style.color === 'black') {
                this.copyCurrentlySelectedElementToClipboard();
            }
        });

        const btnPasteElement = document.getElementById('btnPasteElement') as HTMLElement;
        btnPasteElement.addEventListener('click', (e) => {
            if (btnPasteElement.style.color === 'black') {
                this.pasteElementFromClipboard();
            }
        });

        (document.getElementById('btnMoveUp') as HTMLButtonElement).addEventListener('click', (e) => {
            this.moveAllPageElements(0, -10);
        });

        (document.getElementById('btnMoveRight') as HTMLButtonElement).addEventListener('click', (e) => {
            this.moveAllPageElements(10, 0);
        });

        (document.getElementById('btnMoveLeft') as HTMLButtonElement).addEventListener('click', (e) => {
            this.moveAllPageElements(-10, 0);
        });

        (document.getElementById('btnMoveDown') as HTMLButtonElement).addEventListener('click', (e) => {
            this.moveAllPageElements(0, 10);
        });

        const btnCloneElement = document.getElementById('btnCloneElement') as HTMLElement;
        btnCloneElement.addEventListener('click', (e) => {
            if (btnCloneElement.style.color === 'black') {
                this.clearClipboard();
                this.copyCurrentlySelectedElementToClipboard();
                this.pasteElementFromClipboard();
                this.clearClipboard();
            }
        });

        (document.getElementById('btnDeleteElement') as HTMLButtonElement).addEventListener('click', (e) => {
            this.deleteCurrentlySelectedObject();
        });

        window.addEventListener('keydown', (e) => {
            let considerKey = true;
            if (e.srcElement !== null) {
                if (e.srcElement.classList.contains('propertyInput')) {
                    considerKey = false;
                }
                if ((e.srcElement.tagName === 'INPUT') || (e.srcElement.tagName === 'SELECT')) {
                    considerKey = false;
                }
            }
            if (considerKey) {
                if (e.key === 'Delete') {
                    this.deleteCurrentlySelectedObject();
                }
            }
        });

        (document.getElementById('btnSaveUnit') as HTMLButtonElement).addEventListener('click', (e) => {
            // unselect elements if any are selected
            this.selectObject(this.currentUnit.getCurrentPage());

            this.saveUnitToFile();
        });

        (document.getElementById('btnOpenUnit') as HTMLButtonElement).addEventListener('click', (e) => {
            // unselect elements if any are selected
            this.selectObject(this.currentUnit.getCurrentPage());

            this.AddFile('Aufgabe importieren', (uploadedFileContent: string) =>
            {
                this.loadUnitFromJson(uploadedFileContent);
                this.dispatchUnitHasChangedEvent();
            }, 'text');
        });


        (document.getElementById('btnSaveUnit') as HTMLButtonElement).addEventListener('click', (e) => {
            // unselect elements if any are selected
            this.selectObject(this.currentUnit.getCurrentPage());

            this.saveUnitToFile();
        });

        if (this.standAloneMode) {
            (document.getElementById('btnNewUnit') as HTMLInputElement).addEventListener('click', (e) => {
                window.location.reload();
            });
        }
        else
        {
            (document.getElementById('standAloneFeatures') as HTMLSpanElement).style.display = 'none';
            (document.getElementById('headerSection') as HTMLSpanElement).style.display = 'none';
            (document.getElementById('footerSection') as HTMLSpanElement).style.display = 'none';
        }

        // page functionality
        const currentPageSelectHTMLElement = (document.getElementById('currentPageSelect') as HTMLButtonElement);
        currentPageSelectHTMLElement.addEventListener('change', (e) => {
            const selectedPage = currentPageSelectHTMLElement.value;
            this.currentUnit.navigateToPage(selectedPage);
         });

        (document.getElementById('btnAddPage') as HTMLButtonElement).addEventListener('click', (e) => {
           const newPageID: string = this.currentUnit.newPage().getID();
           this.currentUnit.navigateToPage(newPageID);

           this.updateCurrentPageSelect();

           this.dispatchUnitHasChangedEvent();
        });

        (document.getElementById('btnDeletePage') as HTMLButtonElement).addEventListener('click', (e) => {
            const selectedPage = currentPageSelectHTMLElement.value;
            console.log('############################################');
            console.log('Attempting to delete: ' + selectedPage);

            this.currentUnit.deletePage(selectedPage);
            if (typeof this.currentUnit.getCurrentPage() === 'undefined') {
                this.selectObject(this.nothingSelectedObject);
            }

            this.updateCurrentPageSelect();

            this.dispatchUnitHasChangedEvent();
         });
        // end of page functionality
    }

    public initializeUnitAuthoringTools()
    {
        this.selectObject(this.nothingSelectedObject);

        this.updateCurrentPageSelect();
    }

    public moveAllPageElements(leftShift: number, topShift: number) {
        const currentPage = this.currentUnit.getCurrentPage();
        if (typeof currentPage !== 'undefined') {
            currentPage.getElementsMap().forEach((element) => {
                element.setPropertyValue('left', element.getPropertyValue('left') + leftShift);
                element.setPropertyValue('top', element.getPropertyValue('top') + topShift);
                element.render();
            });
        }
    }

    public drawPageAuthoringTools(pageID: string)
    {
        console.log('Rendering canvas authoring tools for page ' + pageID);

        const pageElementID = this.currentUnit.getCurrentPage().getPageHTMLElementID();
        const pageElement = document.getElementById(pageElementID) as HTMLElement;
        const $pageElement = jQuery('#' + pageElementID);

        pageElement.addEventListener('mousedown', (e) => {
            if (e.target.id === pageElementID)
            {
                this.selectObject(this.currentUnit.getCurrentPage());
            }
        });

        this.selectObject(this.currentUnit.getCurrentPage());

        jQuery('#' + pageElementID).resizable({
            grid: 10,
            handles: 'se'
        });

        jQuery('#' + pageElementID).on('resizestop', (event, ui) => {
            if (event.target.id === pageElementID)
            {
                const canvasWidth = jQuery('#' + pageElementID).width();
                const canvasHeight = jQuery('#' + pageElementID).height();

                this.currentUnit.getCurrentPage().properties.setPropertyValue('width', canvasWidth);
                this.currentUnit.getCurrentPage().properties.setPropertyValue('height', canvasHeight);

                this.currentUnit.render();
            }
        });
    }

    public drawElementAuthoringTools(elementID: string)
    {
        const element = this.currentUnit.element(elementID);
        const htmlElement = document.getElementById(elementID) as HTMLElement;

        // console.log('Rendering canvas element authoring tools for element:');
        // console.log(element);

        if (typeof element !== 'undefined')
        {
            const elementType = element.getElementType();

            // change cursor to pointer when editing
            (document.getElementById(elementID) as HTMLDivElement).style.cursor = 'pointer';


            // add draggable functionality
            if (elementType !== 'tableCell')
            {
                // all elements except table cells are draggable;

                if (elementType !== 'table')
                {
                    // normal elements are moved directly
                    jQuery('#' + elementID).draggable({
                        containment: '#' + this.currentUnit.getCurrentPage().getPageHTMLElementID(),
                        grid: [10, 10],
                        stop: (e, ui) => {

                            element.updatePositionPropertiesBasedOn(element.pageHTMLElementID, element.getElementID());

                            // snap to grid

                            element.left = element.left - (element.left % 10);
                            element.top = element.top - (element.top % 10);

                            element.render();

                            // end of snapping element to grid

                            this.dockingFeatures.enforceElementDockingPosition(element, true);
                            this.dockingFeatures.enforceElementDockingSize(element);

                            this.updateAllPopupMenuItemsConcerningDocking();
                            const popupMenu = this.popupMenus.get(element.getElementID());
                            if (typeof popupMenu !== 'undefined') {
                                popupMenu.showPopupMenu();
                            }
                        }
                    });
                }
                else
                {
                    // tables use a helper for moving

                    // todo: snap to grid

                    jQuery('#' + elementID).draggable({
                        containment: '#' + this.currentUnit.getCanvasID(),
                        grid: [10, 10],
                        helper: 'clone',
                        opacity: 0.4,
                        stop: (e, ui) => {
                            // console.log(e);
                            // console.log(ui);
                            htmlElement.style.left = ui.position.left + 'px';
                            htmlElement.style.top = ui.position.top + 'px';

                            const tableElement = element as TableElement;
                            tableElement.updatePositionPropertiesBasedOn(element.pageHTMLElementID, element.getElementID());
                            tableElement.updatePositionPropertiesOfTableCells();

                            // snap to grid

                            element.left = element.left - (element.left % 10);
                            element.top = element.top - (element.top % 10);

                            element.render();

                            // end of snapping table to grid

                            // this.dockingFeatures.propagateObjectMoveToDockedElements(element);
                            // this.updateAllPopupMenuItemsConcerningDocking();
                        }
                    });


                }

            }

            // add resizable functionality
            if ((elementType !== 'table') && (elementType !== 'viewpoint'))
            {
                // all elements are resizable, except tables (where the resizing happens at the individual cell level) and viewpoints

                if (elementType !== 'tableCell')
                {
                    // if the element is not a table cell, then apply the usual resize function
                    jQuery('#' + elementID).resizable({
                        containment: '#' + this.currentUnit.getCurrentPage().getPageHTMLElementID(),
                        grid: 10,
                        handles: 'se'
                    });

                    jQuery('#' + elementID).on('resizestop', (event, ui) => {
                        element.updateSizePropertiesBasedOn(element.pageHTMLElementID, element.getElementID());

                        this.updateAllPopupMenuItemsConcerningDocking();
                        this.dockingFeatures.enforceElementDockingPosition(element);
                        this.dockingFeatures.enforceElementDockingSize(element);
                    });
                }
            }

            /*
            if (elementType === 'viewpoint') {
                element.width = 25;
                element.height = 30;
            })
            */

            // add selectable functionality
            jQuery('#' + elementID).on('mousedown', (e) => {
                this.selectObject(element);
            });

            // add popup menu functionality
            const newPopupMenu = new PopupMenu(element);
            this.popupMenus.set(elementID, newPopupMenu);

            if (elementType === 'audio')
            {

                newPopupMenu.addPopupMenuItem({
                        'triggerOnMouseOverElementID' : elementID,
                        'containerElementID': '',
                        'innerHTML': 'Klicken Sie hier, um das Audio-Element zu ziehen.',
                        'tooltip': '',
                        'type': 'mover',
                        'position': 'beforeend'
                });
            }

            if (elementType === 'video')
            {
                newPopupMenu.addPopupMenuItem({
                        'triggerOnMouseOverElementID' : elementID,
                        'containerElementID': '',
                        'innerHTML': 'Klicken Sie hier, um das Video-Element zu ziehen.',
                        'tooltip': '',
                        'type': 'mover',
                        'position': 'beforeend'
                });
            }

            if (elementType === 'textbox')
            {
                newPopupMenu.addPopupMenuItem({
                    'triggerOnMouseOverElementID' : elementID,
                    'containerElementID': '',
                    'innerHTML': 'Klicken Sie hier, um die Textbox zu ziehen.',
                    'tooltip': '',
                    'type': 'mover',
                    'position': 'beforeend'
                });
            }

            if (elementType === 'html')
            {
                newPopupMenu.addPopupMenuItem({
                    'triggerOnMouseOverElementID' : elementID,
                    'containerElementID': '',
                    'innerHTML': 'Klicken Sie hier, um das HTML-Element zu ziehen.',
                    'tooltip': '',
                    'type': 'mover',
                    'position': 'beforeend'
                });
            }


            if (elementType === 'multilineTextbox')
            {
                newPopupMenu.addPopupMenuItem({
                    'triggerOnMouseOverElementID' : elementID,
                    'containerElementID': '',
                    'innerHTML': 'Klicken Sie hier, um die Multiline-Textbox zu ziehen.',
                    'tooltip': '',
                    'type': 'mover',
                    'position': 'beforeend'
                });
            }

            if (elementType === 'dropdown')
            {
                newPopupMenu.addPopupMenuItem({
                    'triggerOnMouseOverElementID' : elementID,
                    'containerElementID': '',
                    'innerHTML': 'Klicken Sie hier, um das Dropdown-Element zu ziehen.',
                    'tooltip': '',
                    'type': 'mover',
                    'position': 'beforeend'
                });
            }

            if (elementType === 'button')
            {
                newPopupMenu.addPopupMenuItem({
                    'triggerOnMouseOverElementID' : elementID,
                    'containerElementID': '',
                    'innerHTML': 'Klicken Sie hier, um den Button zu ziehen.',
                    'tooltip': '',
                    'type': 'mover',
                    'position': 'beforeend'
                });
            }

            if (elementType === 'table')
            {
                newPopupMenu.addPopupMenuItem({
                    'triggerOnMouseOverElementID' : elementID,
                    'containerElementID': '',
                    'innerHTML': 'Klicken Sie hier, um die ganze Tabelle auszuwählen.',
                    'tooltip': '',
                    'type' : 'mover',
                    'position': 'beforeend'
                });
            }


            /*
            // todo - customizable volume
            if (elementType === 'volumePicker')
            {
                newPopupMenu.addPopupMenuItem({
                    'triggerOnMouseOverElementID' : elementID + '_volumePicker_range',
                    'containerElementID': '',
                    'innerHTML': 'Klicken Sie hier, um das volumePicker-Element zu ziehen.',
                    'tooltip': '',
                    'type': 'mover',
                    'position': 'beforeend'
                });
            }
            */

        }

        // update properties that can take as value some of the pages currently in the unit
        this.updateCurrentPageSelect();
    }

    private drawTableCellAuthoringTools(tableCell: TableCell) {
        const tableCellID: string = tableCell.getID();

        // make it resizable
        jQuery('#' + tableCellID).resizable({
            helper: 'ui-resizable-helper',
            grid: 10,
            handles: 'se'
        });

        jQuery('#' + tableCellID).on('resizestop', (event, ui) => {
            // when resizing the cells, update their size properties
            tableCell.resize(ui.size.width, ui.size.height);

            event.stopPropagation();
        });

        // make it selectable
        jQuery('#' + tableCellID).on('mousedown', (e) => {
            // console.log(e);
            this.selectObject(tableCell);
            e.stopPropagation();
        });
    }

    private selectObject(obj: ObjectWithProperties) {
        // console.log('Selected:');
        // console.log(obj);

        if (typeof this.currentUnit.getCurrentPage() !== 'undefined')
        {
            // if there is a page currently being shown
            // if any item is currently showing as selected, don't show it anymore as selected

            // unmark all objects

            (document.getElementById(this.containerDivID) as HTMLElement).querySelectorAll('.selected').forEach( (element: Element) => {
                element.classList.remove('selected');
            });

            // mark desired object visually as selected
            if ((obj.getObjectType() === 'UnitPage') || (obj.getObjectType() === 'UnitElement') || (obj.getObjectType() === 'TableCell')) {
                const selectedHTMLElement = document.getElementById(obj.getID());
                if (selectedHTMLElement !== null) {
                    selectedHTMLElement.classList.add('selected');
                }
            }
        }

        // select desired object
        this.selectedObjectWithProperties = obj;

        // show its properties
        this.propertiesToolbox.showPropertiesOf(this.selectedObjectWithProperties);

        // if necessary, update its popup menus
        if (obj.getObjectType() === 'UnitElement')
        {
            // update popups
            this.updateAllPopupMenuItemsConcerningDocking();

            // show popup menus for the selected object
            const popupMenu = this.popupMenus.get(obj.getID());
            if (typeof popupMenu !== 'undefined')
            {
                popupMenu.showPopupMenu();
            }
        }

        // enable or disable the spread font button and the copy element button
        // currently, only a visual effect
        if (obj.getObjectType() === 'UnitElement')
        {
            (document.getElementById('btnSpreadFont') as HTMLButtonElement).style.color = 'black';
            (document.getElementById('btnCopyElement') as HTMLButtonElement).style.color = 'black';
            (document.getElementById('btnCloneElement') as HTMLButtonElement).style.color = 'black';
        }
        else
        {
            (document.getElementById('btnSpreadFont') as HTMLButtonElement).style.color = 'lightgray';
            (document.getElementById('btnCopyElement') as HTMLButtonElement).style.color = 'lightgray';
            (document.getElementById('btnCloneElement') as HTMLButtonElement).style.color = 'lightgray';
        }

        // enable or disable the paste element
        // currently, only a visual effect

        // if the clipboard data is older than 24h, then delete it;

        // enforcing expiry date inspired by stackoverflow answer
        // https://stackoverflow.com/a/4275854
        // Answer by: https://stackoverflow.com/users/506570/sebarmeli
        // License: cc by-sa 3.0

        if (localStorage) {
            try {
                const clipboardTextDate = localStorage.getItem('IQB.unitAuthoring.clipboardDate');
                if (clipboardTextDate !== null) {
                    const clipboardTextDateAsNumber = parseInt(clipboardTextDate, 10);
                    const timePassed = Date.now() - clipboardTextDateAsNumber;
                    if (timePassed > 1000 * 60 * 60 * 24) {
                        this.clearClipboard();
                    }
                }
            }
            catch (e)
            {
                console.log('IQB Unit Authoring Tool: error enforcing localStorage clipboard expiry');
                console.log(e);
            }
        }

        // end of enforcing clipboard expiry
        this.btnPasteElementCheck();
        window.setTimeout(this.btnPasteElementCheck, 250);
    }

    btnPasteElementCheck(): void {
        try {
            if (localStorage)
            {
                let elementAvailableInClipboard = false;
                const clipboardText = localStorage.getItem('IQB.unitAuthoring.clipboard');
                if (clipboardText !== null) {
                    if (clipboardText.indexOf('UnitElementJSON') !== -1) {
                        elementAvailableInClipboard = true;
                    }
                }

                if (elementAvailableInClipboard) {
                    (document.getElementById('btnPasteElement') as HTMLButtonElement).style.color = 'black';

                }
                else {
                    (document.getElementById('btnPasteElement') as HTMLButtonElement).style.color = 'lightgray';
                }
            }
        }
        catch (e)
        {
            console.log('IQB Unit Authoring Tool: error checking whether to enable or disable the paste element button');
            console.log(e);
        }
    }

    private getCurrentlySelectedElementJSON(): string | undefined
    {
        // work in progress


        if (typeof this.selectedObjectWithProperties !== 'undefined')
        {
            // if an object is selected
            if (this.selectedObjectWithProperties.getObjectType() === 'UnitElement') {
                // if the object is an element
                const selectedElement = this.selectedObjectWithProperties as UnitElement;

                const elementJSON = JSON.stringify({
                    elementData: selectedElement.getData(),
                    elementType: selectedElement.getElementType(),
                    thisIs: 'UnitElementJSON'
                });

                return elementJSON;
            }
            else {
                alert('Error: Only elements can be copied');
                return undefined;
            }
        }
        else {
            alert('Error: nothing currently selected');
            return undefined;
        }

        return undefined;
    }

    private newElementBasedOnElementJSON(elementJSON: string): void {

        // work in progress

        if (elementJSON.indexOf('UnitElementJSON') !== -1) {
            const elementData = (JSON.parse(elementJSON).elementData) as UnitElementData;
            const elementType = (JSON.parse(elementJSON).elementType) as SupportedUnitElementType;

            const currentPage = this.currentUnit.getCurrentPage();
            if (typeof currentPage !== 'undefined') {

                let elementContent: string = '';
                if ('src' in elementData.properties) {
                    elementContent = elementData.properties.src;
                }
                if ('dockedToObjectWithID' in elementData.properties) {
                    elementData.properties.dockedToObjectWithID = '';
                }
                if ('dockedToLeft' in elementData.properties) {
                    elementData.properties.dockedToLeft = '';
                }
                if ('dockedToTop' in elementData.properties) {
                    elementData.properties.dockedToTop = '';
                }

                const newElement = this.currentUnit.newElement(elementType, elementContent);

                if (typeof newElement !== 'undefined') {
                    // console.log('Initial Data');
                    // console.log(newElement.getData());
                    // console.log('New data');
                    // console.log(elementData);

                    newElement.loadData(elementData);

                    let elementInTheWay = false;
                    const page = this.currentUnit.getCurrentPage();
                    if (typeof page !== 'undefined') {
                        page.getElementsMap().forEach((element) => {
                            if (element.elementID !== newElement.elementID) {
                                if ((element.top === newElement.top) && (element.left === newElement.left)) {
                                    elementInTheWay = true;
                                }
                            }
                        });
                    }
                    if (elementInTheWay) {
                        newElement.top += 40;
                        newElement.left += 40;
                    }

                    newElement.render();

                    this.selectObject(newElement);
                }
            }
        }
    }

    private copyCurrentlySelectedElementToClipboard(): void {
        const currentlySelectedElementJSON = this.getCurrentlySelectedElementJSON();
        if (typeof currentlySelectedElementJSON !== 'undefined') {
            try {
                localStorage.setItem('IQB.unitAuthoring.clipboard', currentlySelectedElementJSON);
                localStorage.setItem('IQB.unitAuthoring.clipboardDate', String(Date.now()));
            }
            catch (e)
            {
                console.log(e);
                let errorText = 'Element konnte nicht kopiert werden.';
                if (e.toString().indexOf('QuotaExceededError') !== -1) {
                    errorText += ' Die Elementdaten sind zu groß.';
                }
                alert(errorText);
            }
        }
    }

    private pasteElementFromClipboard(): void {
        try  {
            const clipboardText = localStorage.getItem('IQB.unitAuthoring.clipboard');
            // console.log('Pasting from clipboard:');
            // console.log(clipboardText);
            if (clipboardText !== null) {
                if (clipboardText.indexOf('UnitElementJSON') !== -1) {
                    this.newElementBasedOnElementJSON(clipboardText);
                }
            }
        }
        catch (e)
        {
            console.log('IQB Unit Authoring Tool: error pasting element from clipboard');
            console.log(e);
        }
    }

    private clearClipboard(): void {
        try {
            if (localStorage.getItem('IQB.unitAuthoring.clipboard') !== null) {
                localStorage.removeItem('IQB.unitAuthoring.clipboard');
            }
            if (localStorage.getItem('IQB.unitAuthoring.clipboardDate') !== null) {
                localStorage.removeItem('IQB.unitAuthoring.clipboardDate');
            }
        }
        catch (e) {
            console.log('IQB Authoring Tool: Error cleaning clipboard');
            console.log(e);
        }
        this.btnPasteElementCheck();
    }

    /*
    private cloneCurrentlySelectedObject()
    {
        if (typeof this.selectedObjectWithProperties !== 'undefined')
        {
            // if an object is selected
            if (this.selectedObjectWithProperties.getObjectType() === 'UnitElement')
            {
                // if an unit element is selected
                const originalElement = this.selectedObjectWithProperties as UnitElement;

                if ((originalElement.getElementType() !== 'image') &&
                    (originalElement.getElementType() !== 'audio') &&
                    (originalElement.getElementType() !== 'video'))
                {
                    // console.log(originalElement);
                    const currentPage = this.currentUnit.getCurrentPage();
                    if (typeof currentPage !== 'undefined') {
                        // todo: properly handle SupportedUnitElemenType
                        const elementClone = this.currentUnit.newElement(originalElement.getElementType());
                        if (typeof elementClone !== 'undefined') {
                            elementClone.properties.getPropertiesMap().forEach((elementCloneProperty: Property, propertyName: string) => {
                                if (propertyName !== 'id') {
                                    const originalProperty = JSON.parse(JSON.stringify(originalElement.properties.getProperty(propertyName)));
                                    elementClone.properties.setProperty(propertyName, originalProperty);
                                }
                            });

                            console.log(elementClone);
                            elementClone.setPropertyValue('left', elementClone.getPropertyValue('left') + 40);
                            elementClone.setPropertyValue('top', elementClone.getPropertyValue('top') + 40);
                            elementClone.render();
                            this.selectObject(elementClone);
                        }
                        else
                        {
                            alert('Error: creation of the clone of the item failed.');
                        }
                    }
                    else
                    {
                        alert('Error: Cannot clone item. No page is currently selected.');
                    }
                }
                else
                {
                    alert('Images, audios and videos cannot currently be cloned.');
                }
                // end of the if an unit element is selected
            }
            else {
                alert('Error: Only elements can be cloned');
            }
        }
        else {
            alert('Error: nothing selected, so nothing to clone');
        }
    }
    */

    private deleteCurrentlySelectedObject() {
        if (typeof this.selectedObjectWithProperties !== 'undefined')
        {
            // if an object is selected
            if (this.selectedObjectWithProperties.getObjectType() === 'UnitElement')
            {
                // if an unit element is selected
                const elementID = this.selectedObjectWithProperties.getID();
                if (typeof this.currentUnit.element(elementID) !== 'undefined')
                {
                    // if the unit contains this element
                    this.currentUnit.deleteElement(elementID);

                    // when done, select the page canvas
                    this.selectObject(this.currentUnit.getCurrentPage());

                    // trigger unit has changed event
                    this.dispatchUnitHasChangedEvent();
                }
            }
            else if (this.selectedObjectWithProperties.getObjectType() === 'UnitPage')
            {
                alert('Nichts zu löschen: kein Element gewählt.');
            }
        }
        else
        {
            alert('Nichts zu löschen: kein Element gewählt.');

        }
    }

    public updateAllPopupMenuItemsConcerningDocking()
    {
        // console.log('Updating all popup menu items concerning docking...');

        // by default, elements don't have any docking popups, so remove them
        this.popupMenus.forEach((popupMenu: PopupMenu, elementID: string) => {
                // console.log('Updating popup menu for ' + elementID);
                popupMenu.removeDockingPopupMenuItems();

                const element = this.currentUnit.element(elementID);
                if (typeof element !== 'undefined')
                {
                    if (element.dockedToObjectWithID !== '')
                    {
                        if (element.getIsDrawn() === true) {
                            // only draw popups if the element is already drawn
                            // if element is docked to something, offer option to undock
                            const containerElementID = element.dockedToObjectWithID;

                            const popupMenuItemID = popupMenu.addPopupMenuItem({
                                'triggerOnMouseOverElementID': elementID,
                                'containerElementID': containerElementID,
                                'innerHTML': 'abdocken von Tabellenzelle',
                                'tooltip': 'Abdocken von ' + containerElementID,
                                'position': 'beforeend',
                                'type': 'undock'
                            });

                            const popupMenuItemDiv = document.getElementById(popupMenuItemID);
                            if (popupMenuItemDiv !== null) {
                                popupMenuItemDiv.addEventListener('mousedown', (e) => {
                                    element.dockedToObjectWithID = '';
                                    this.updateAllPopupMenuItemsConcerningDocking();
                                    e.stopPropagation();
                                });
                            }
                        }
                    }

                    // see if element can be docked into other things
                    // console.log('Container objects for ' + element.getID());
                    // console.log(this.dockingFeatures.getAllContainerObjects(element));

                    this.dockingFeatures.getAllContainerObjects(element).forEach((containerObject: ObjectWithSpatialProperties) => {
                        const potentialContainerObjectID = containerObject.getID();

                        if (element.dockedToObjectWithID !== potentialContainerObjectID) {
                                // if the element is not already docked to it, offer option to dock to it

                                const popupMenuItemID = popupMenu.addPopupMenuItem({
                                    'triggerOnMouseOverElementID': elementID,
                                    'containerElementID': potentialContainerObjectID,
                                    'innerHTML': 'docken an Tabellenzelle',
                                    'tooltip': 'Docken an ' + potentialContainerObjectID,
                                    'position': 'beforeend',
                                    'type': 'dock'
                                });

                                const popupMenuItemDiv = document.getElementById(popupMenuItemID);
                                if (popupMenuItemDiv !== null)
                                {
                                    popupMenuItemDiv.addEventListener('mousedown', (e) => {
                                        element.dockedToObjectWithID = potentialContainerObjectID;
                                        element.dockedToLeft = element.left - containerObject.left;
                                        element.dockedToTop =  element.top - containerObject.top;
                                        this.dockingFeatures.enforceElementDockingPosition(element);
                                        this.dockingFeatures.enforceElementDockingSize(element);

                                        this.updateAllPopupMenuItemsConcerningDocking();
                                        e.stopPropagation();
                                    });
                                }

                        }
                    });
                    // end of functionality that shows potential docking options

                } // end of if that checks if element is undefined
        }); // end of function that is executed for each popupmenu
    }

    public saveUnitToFile(): void {
        // estimate file size
        const estimatedFileSizeHTMLElement = (document.getElementById('spanEstimatedItemFileSize') as HTMLSpanElement);
        const estimatedFileSize = this.currentUnit.exportDataToJSON().length.toLocaleString('DE');
        estimatedFileSizeHTMLElement.innerHTML = estimatedFileSize;

        // open save item dialog
        jQuery('#saveItemDialog').dialog({
            width: 600,
            height: 225,
            dialogClass: '',
            title: 'Aufgabe exportieren',
            buttons: [
            {
                text: 'OK',
                click: () => {
                jQuery('#saveItemDialog').dialog('close');
                const saveFileName: string = (document.getElementById('saveFileName') as HTMLInputElement).value;

                const saveFileContent: string = this.currentUnit.exportDataToJSON();
                // console.log(saveFileContent);
                const saveFile =  new File([saveFileContent], saveFileName + '.voud',
                                            {type: 'text/plain;charset=utf-8'});
                saveAs(saveFile); // saveAs is external library for saving files
                }
            }
            ]
        });
    }

    public saveUnitToJson(): string
    {
        return this.currentUnit.exportDataToJSON();
    }

    public loadUnitFromJson(unitDataAsJson: string) {

        // todo: load unit

        // console.log('IQB Unit Authoring Tool: loading unit from the following JSON')
        // console.log(unitDataAsJson);
        this.isLoaded = false;

        this.currentUnit.importDataFromJSON(unitDataAsJson);

        this.initializeUnitAuthoringTools();

        this.dispatchUnitHasLoadedEvent();

        // update unit player version if needed
        if (this.currentUnit.getPropertyValue('player') !== vo_UnitAuthoringInterface.player) {
            console.log('IQB Unit Editor: Detected that the unit was last saved for an older player, ' + this.currentUnit.getPropertyValue('player'));
            console.log('Updated it to ' + vo_UnitAuthoringInterface.player);
            this.currentUnit.setPropertyValue('player', vo_UnitAuthoringInterface.player);
        }

        /*
        // first delete current elements
        for (const elementID of this.unitData.getElementIds()) {
            this.deleteElement(elementID);
        }

        // then clear any remaining data
        this.unitData.clearData();

        // then load the new data
        this.unitData.importDataFromJSON(itemContent);

        // make sure the ID of the HTML DOM Canvas Element coincides with the one used in the data model
        this.unitRenderer.canvasHTMLElement.id = this.currentUnit.getCanvasID();

        // apply canvas properties
        this.unitRenderer.renderCanvasProperties([], false);

        // finally, render the canvas elements

        // todo: support more than one level of containers, by recursively loading containers (tables)

        // first, render the elements which cannot be containers
        for (const elementID of this.unitData.getElementIds())
        {
            if ((this.unitData.getElementType(elementID) !== 'table') &&
                (this.unitData.getElementType(elementID) !== 'tableCell') &&
                (this.unitData.getElementType(elementID) !== 'itemCanvas'))
            {
                this.unitRenderer.renderCanvasElement(elementID, false, true);
                this.renderCanvasElementAuthoringTools(elementID);
            }
        }

        // then load the elements that can be containers
        for (const elementID of this.unitData.getElementIds())
        {
            if ((this.unitData.getElementType(elementID) === 'table'))
            {
                this.unitRenderer.renderCanvasElement(elementID, false, true);
                this.renderCanvasElementAuthoringTools(elementID);
            }
        }
        */

    }

    public AddFile(title = 'Datei hinzufügen', callback: Function, dataType = 'url')
    {
        jQuery('#fileDialog').dialog({
            width: 600,
            height: 200,
            dialogClass: '',
            title: title,
            buttons: [
              {
                text: 'OK',
                click: function() {
                  jQuery(this).dialog('close');
                  const uploadedFiles = (document.getElementById('inputFile') as HTMLInputElement).files;
                  if (uploadedFiles !== null)
                  {
                    if (uploadedFiles.length > 0)
                    {
                        const uploadedFile = uploadedFiles[0];
                        const myReader = new FileReader();
                        myReader.onload =  (e) => {
                            const uploadedFileContent = e.target.result;
                            // console.log(e);
                            callback(uploadedFileContent);
                        };

                        if (dataType === 'text') {
                            myReader.readAsText(uploadedFile);
                        }
                        else {
                            myReader.readAsDataURL(uploadedFile);
                        }

                    }
                  }
                }
              }
            ]
          });
    }

}

const emptyNewUnitData = {
    'properties':
         {'elementsCounter': 0,
         'pagesCounter': 1},
    'pages': {
        'seite1': {
            'properties': {
                'type': 'page',
                'style': '',
                'background-color': 'white',
                'width': 700,
                'height': 600
            },
            'elements': {}
        }
    }
};

document.addEventListener('DOMContentLoaded', (e) => {
    // instantiate editor functionality
    const standAloneMode = false;
    const unitAuthoringTool: IQB_UnitAuthoringTool = new IQB_UnitAuthoringTool(standAloneMode);

    // listen to messages from the host___________________________________________
    window.addEventListener('message', (e) => {

        // console.log('IQB Authoring Tool has received the following message:');
        // console.log(e);

        if ((e.origin === vo_UnitAuthoringInterface.acceptedOrigin) || (!vo_UnitAuthoringInterface.checkOrigin)) {
            if (('type' in e) && ('sessionId' in e.data)) {

                // LoadUnitDefinition
                if (e.data.type === 'vo.ToAuthoringModule.DataTransfer') {
                    if ('unitDefinition' in e.data) {
                        if (typeof e.data.sessionId !== 'undefined')
                        {
                            if ((e.data.unitDefinition !== '') && (e.data.unitDefinition != null)) {
                                unitAuthoringTool.loadUnitFromJson(e.data.unitDefinition);

                            }
                            else {
                                unitAuthoringTool.loadUnitFromJson(JSON.stringify(emptyNewUnitData));
                            }
                            vo_UnitAuthoringInterface.sessionId = e.data.sessionId;
                        }
                        else
                        {
                            console.error('IQB Authoring Tool Error: sessionId sent is undefined');
                        }
                    } else {
                        console.error('IQB Authoring Tool Error: unitDefinition missing in message LoadUnitDefinition');
                    }

                // UnitDefinitionRequest
                } else if (e.data.type === 'vo.ToAuthoringModule.DataRequest') {
                    if (typeof e.data.sessionId !== 'undefined')
                    {
                        if (e.data.sessionId === vo_UnitAuthoringInterface.sessionId) {

                            const changedDataTransferMessage: VO.FromAuthoringModule_DataTransfer = {
                                'type': 'vo.FromAuthoringModule.DataTransfer',
                                'sessionId': vo_UnitAuthoringInterface.sessionId,
                                'unitDefinition': unitAuthoringTool.saveUnitToJson(),
                                'player': vo_UnitAuthoringInterface.player
                            };

                            // console.log('IQB Authoring Tool: I have sent the following message to the host');
                            // console.log(changedDataTransferMessage);

                            vo_UnitAuthoringInterface.containerWindow.postMessage(changedDataTransferMessage,
                                                                                    vo_UnitAuthoringInterface.acceptedOrigin);
                        }
                        else {
                            console.error('IQB Authoring Tool Error: sessionId not valid in message UnitDefinitionRequest');
                        }
                   }
                   else
                   {
                       console.error('IQB Authoring Tool Error: sessionId sent is undefined');
                   }
                }
                else if ((e.data.type === 'vo.FromAuthoringModule.ChangedNotification') ||
                        (e.data.type === 'vo.FromAuthoringModule.ReadyNotification'))
                {
                    // this happens when vo_UnitAuthoringInterface.containerWindow is the same window as 'window'
                }
                else {
                    console.error('IQB Authoring Tool Error: message type is not known.');
                }

              // end of different types of messages

            } // end of the if that checks if the message contains a type and a sessionId
            else
            {
                console.error('IQB Authoring Tool Error: message received does not contain a type or sessionId');
            }
        } // end of the if that checks if the message origin is ok
        else
        {
            console.error('IQB Authoring Tool Error: message received has an invalid origin.');
        }
    }); // end of the message event listener

    window.addEventListener('IQB.unit.hasChanged', (e) => {
        const changedNotificationMessage: VO.FromAuthoringModule_ChangedNotification = {
            'type': 'vo.FromAuthoringModule.ChangedNotification',
            'sessionId': vo_UnitAuthoringInterface.sessionId
        };

        // console.log('IQB Authoring Tool: I have sent the following message to the host');
        // console.log(changedNotificationMessage);

        vo_UnitAuthoringInterface.containerWindow.postMessage(changedNotificationMessage,
                                                                   vo_UnitAuthoringInterface.acceptedOrigin);

    });

    const readyMessage: VO.FromAuthoringModule_ReadyNotification = {
        'type': 'vo.FromAuthoringModule.ReadyNotification'
    };

    // console.log('IQB Authoring Tool: I have sent the following message to the host');
    // console.log(readyMessage);

    vo_UnitAuthoringInterface.containerWindow.postMessage(readyMessage, vo_UnitAuthoringInterface.acceptedOrigin);

    // finish instantiating editor functionality
});
