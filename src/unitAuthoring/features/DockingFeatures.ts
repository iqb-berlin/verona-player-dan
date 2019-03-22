// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2019
// license: MIT

import {ObjectWithSpatialProperties} from '../../typescriptCommonFiles/unit/ObjectWithSpatialProperties.js';
import {UnitElement} from '../../typescriptCommonFiles/unit/UnitElement.js';
import {TableCell, TableElement} from '../../typescriptCommonFiles/unit/elementTypes/TableElement.js';
import {UnitPage} from '../../typescriptCommonFiles/unit/UnitPage.js';
import {Unit} from '../../typescriptCommonFiles/unit/Unit.js';

export class DockingFeatures
{
    constructor(public currentUnit: Unit)
    {

    }

    public doesSpatialObjectContainAnotherSpatialObject(containerObject: ObjectWithSpatialProperties,
                                                        containedObject: ObjectWithSpatialProperties): boolean
        {
            const containerStartsAtX: number = containerObject.left;
            const containerEndsAtX: number =  containerObject.left + containerObject.width;
            const containerStartsAtY: number = containerObject.top;
            const containerEndsAtY: number = containerObject.top + containerObject.height;

            const containedStartsAtX: number = containedObject.left;
            const containedEndsAtX: number = containedObject.left +  containedObject.width;

            const containedStartsAtY: number = containedObject.top;
            const containedEndsAtY: number = containedObject.top + containedObject.height;

            let elementIsContainedHorizontally: boolean;
            elementIsContainedHorizontally = (containedStartsAtX >= containerStartsAtX) && (containedEndsAtX <= containerEndsAtX);

            let elementIsContainedVertically: boolean;
            elementIsContainedVertically = (containedStartsAtY >= containerStartsAtY) && (containedEndsAtY <= containerEndsAtY);

            if (elementIsContainedHorizontally && elementIsContainedVertically) {
                return true;
            }
            else {
                return false;
            }
        }

    public getAllContainerObjects(containedElement: ObjectWithSpatialProperties): ObjectWithSpatialProperties[]
        {
            const containerObjects: ObjectWithSpatialProperties[] = [];
            const currentPage = this.currentUnit.getCurrentPage();
            if (typeof currentPage !== 'undefined') {
                currentPage.getElementsMap().forEach((candidateContainerElement: UnitElement, candidateContainerElementID: string) => {
                    if (candidateContainerElementID !== containedElement.getID())
                    {
                        // by convention, elements are not containers of themselves
                        // console.log('Considering ' + candidateContainerElementID + ' (of element type ' + candidateContainerElement.getElementType()  + ' ) as candidate container');

                        if  ((candidateContainerElement.getElementType() === 'table'))
                        {
                            // only table cells can oficially contain other elements
                            const candidateTable = candidateContainerElement as TableElement;
                            candidateTable.mapToTableCells((tableCell: TableCell) => {
                                // console.log('Considering table cell ' + tableCell.getID() + ' as candidate container');
                                if (this.doesSpatialObjectContainAnotherSpatialObject(tableCell, containedElement))
                                {
                                    containerObjects.push(tableCell);
                                }
                            });
                        }
                    }
                });
            }

            return containerObjects;
        }

    public getAllContainedElements(containerObject: ObjectWithSpatialProperties): UnitElement[]
        {
            const containedElements: UnitElement[] = [];
            const currentPage = this.currentUnit.getCurrentPage();
            if (typeof currentPage !== 'undefined') {
                currentPage.getElementsMap().forEach((candidateContainedElement: UnitElement, candidateContainedElementID: string) => {
                        if (this.doesSpatialObjectContainAnotherSpatialObject(containerObject, candidateContainedElement))
                        {
                            containedElements.push(candidateContainedElement);
                        }
                });
            }
            return containedElements;
        }

    public getAllDockedElements(containerObject: ObjectWithSpatialProperties): UnitElement[]
     {
        const dockedElements: UnitElement[] = [];
        const currentPage = this.currentUnit.getCurrentPage();
        if (typeof currentPage !== 'undefined') {
            currentPage.getElementsMap().forEach((candidateDockedElement: UnitElement, candidateDockedElementID: string) => {
                if (candidateDockedElement.dockedToObjectWithID === containerObject.getID())
                {
                    dockedElements.push(candidateDockedElement);
                }
            });
        }

        return dockedElements;
    }

    public getContainerObjectWithID(containerObjectID: string): ObjectWithSpatialProperties | undefined
    {
        const currentPage = this.currentUnit.getCurrentPage();
        if (typeof currentPage !== 'undefined') {
            return currentPage.getTableCell(containerObjectID);
        }
        else {
            return undefined;
        }
    }

    public getContainerOf(dockedElement: UnitElement): ObjectWithSpatialProperties | undefined
    {
       return this.getContainerObjectWithID(dockedElement.dockedToObjectWithID);
    }

    public enforceElementDockingPosition(dockedElement: UnitElement, newDockingPosition: boolean = false) {
        // console.log('Enforcing docking rules for: ');
        // console.log(dockedElement);

        const containerObject = this.getContainerOf(dockedElement);

        if (typeof containerObject !== 'undefined') {
            // console.log('Container element identified as:');
            // console.log(containerObject);

            // console.log('Element docking position at the beginning:');
            // console.log(dockedElement.left + ' - ' + dockedElement.top);

            // ideally, it should maintain the position relative to where it was docked
            let newLeft;
            let newTop;

            if (newDockingPosition === false) {
                newLeft = containerObject.left + dockedElement.dockedToLeft;
                newTop = containerObject.top + dockedElement.dockedToTop;
            }
            else
            {
                newLeft = dockedElement.left;
                newTop = dockedElement.top;

                dockedElement.dockedToLeft = dockedElement.left - containerObject.left;
                dockedElement.dockedToTop = dockedElement.top - containerObject.top;
            }
            // but do some double checks to see if it makes sense
            // ensure that the element is not above or to the left of the element it is beinged docked to

            if (newLeft < containerObject.left) {
                newLeft = containerObject.left;
            }

            if (newTop < containerObject.top) {
                newTop = containerObject.top;
            }

            // then check that it is not the the right of the container element
            if (newLeft + dockedElement.width > containerObject.left + containerObject.width)
            {
                // if the docked element exceeds the horizontal size of the cell, then place it at the end of the cell
                newLeft = containerObject.left + containerObject.width - dockedElement.width - 5;

                // if the docked element placed at the end of the cell doesn't have enough place to fit,
                // then show it at the beginning of the shell
                if (newLeft < containerObject.left)
                {
                    newLeft = containerObject.left + 5;
                }
            }

            // and last, check if it is not below the container element
            if (newTop + dockedElement.height > containerObject.top + containerObject.height)
            {
                // if the docked element exceeds the vertical size of the cell, then place it at the end of the cell
                newTop = containerObject.top + containerObject.height - dockedElement.height - 5;

                // if the docked element placed at the end of the cell doesn't have enough place to fit,
                // then show it at the beginning of the shell
                if (newTop < containerObject.top) {
                    newTop = containerObject.top + 5;
                }
            }

            // after deciding on the new coordinates, update them

            dockedElement.left = newLeft;
            dockedElement.top = newTop;

            // and update where it is docked, in case it changed

            dockedElement.dockedToLeft = newLeft - containerObject.left;
            dockedElement.dockedToTop = newTop - containerObject.top;

            dockedElement.render();

            // console.log('Element docking position at the end:');
            // console.log(dockedElement.left + ' - ' + dockedElement.top);
        }
    }

    public enforceElementDockingSize(dockedElement: UnitElement)
    {
        {
            // console.log('Enforcing docking rules for: ');
            // console.log(dockedElement);

            const containerObjectID = dockedElement.dockedToObjectWithID;
            // console.log('Container element ID' + containerObjectID);
            if (containerObjectID !== '')
            {
                const containerObject = this.currentUnit.getCurrentPage().getTableCell(containerObjectID);

                if (typeof containerObject !== 'undefined') {
                    // console.log('Container element identified as:');
                    // console.log(containerObject);

                    // make sure that the docked element fits inside its container

                    let newWidth = dockedElement.width;
                    let newHeight = dockedElement.height;

                    // console.log('Container object:');
                    // console.log(containerObject);

                    // console.log('Initial size was ' + newWidth + " " + newHeight);

                    const leftInsideContainer = dockedElement.left - containerObject.left;
                    const topInsideContainer = dockedElement.top - containerObject.top;

                    // console.log('leftInsideContainer: ' + leftInsideContainer);
                    // console.log('topInsideContainer: ' + topInsideContainer);

                    // console.log('Horizontal: ' + (leftInsideContainer + dockedElement.width) + ' vs ' + containerObject.width + '(' + containerObject.getPropertyValue('width') +  ')');
                    // console.log('Vertical: ' + (topInsideContainer + dockedElement.height) + ' vs ' + containerObject.height);

                    if (leftInsideContainer + dockedElement.width > containerObject.width) {
                        newWidth = containerObject.width - leftInsideContainer;
                    }
                    if (topInsideContainer + dockedElement.height > containerObject.height) {
                        newHeight = containerObject.height - topInsideContainer;
                    }

                    if (newWidth < 5) {
                        newWidth = 5;
                    }
                    if (newHeight < 5) {
                        newHeight = 5;
                    }

                    dockedElement.width = newWidth;
                    dockedElement.height = newHeight;

                    // console.log('New size is' + newWidth + " " + newHeight);

                    dockedElement.render();
                }
            }
        }
    }

    public propagateObjectMoveToDockedElements(containerObject: ObjectWithSpatialProperties)
    {
           // first move the elements which are docked directly to it
           this.getAllDockedElements(containerObject).forEach((dockedElement: UnitElement) => {
                dockedElement.left = containerObject.left + dockedElement.dockedToLeft;
                dockedElement.top = containerObject.top + dockedElement.dockedToTop;
                dockedElement.render();
           });

           // if it is a table, then also the elements that are docked to its cells
           // console.log(containerObject);
           if (containerObject.properties.hasProperty('type'))
            {
                // console.log('Container object type: ' + containerObject.getPropertyValue("type") );
                if (containerObject.getPropertyValue('type') === 'table')
                {
                    // console.log('Container object is confirmed to be a table.');
                    const tableContainerElement = containerObject as TableElement;
                    tableContainerElement.mapToTableCells((tableCell: TableCell) => {
                        this.getAllDockedElements(tableCell).forEach((dockedElement: UnitElement) => {
                            dockedElement.left = tableCell.left + dockedElement.dockedToLeft;
                            dockedElement.top = tableCell.top + dockedElement.dockedToTop;
                            dockedElement.render();
                        });
                    });
                }
            }

    }

}
