// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';
import { ObjectWithProperties } from '../ObjectWithProperties.js';
import { ObjectWithSpatialProperties } from '../ObjectWithSpatialProperties.js';
import { colorsObject } from '../../models/Colors.js';

export type TableCellsPropertyValue = TableCell[][];

export type TableCellFunction = (tableCell: TableCell, rowNumber: number, columnNumber: number) => any;

export class TableCell extends ObjectWithSpatialProperties {
    constructor (id: string, public parentTable: TableElement, public rowNumber: number, public columnNumber: number, pageID: string)
    {
        super(id, 'TableCell', pageID);

        this.properties.addProperty('type', {
            value: 'tableCell',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        this.properties.addProperty('id', {
            value: id,
            userAdjustable: false,
            propertyType: 'text',
            hidden: true,
            caption: 'ID'
        });

        this.width = 100;
        this.height = 100;

        const leftProperty = this.properties.getProperty('left');
        leftProperty.userAdjustable = false;
        this.properties.setProperty('left', leftProperty);

        const topProperty = this.properties.getProperty('top');
        topProperty.userAdjustable = false;
        this.properties.setProperty('top', topProperty);

        this.properties.addProperty('rowNumber',  {
                                                                            value: rowNumber,
                                                                            userAdjustable: false,
                                                                            propertyType: 'number',
                                                                            hidden: true,
                                                                            caption: 'rowNumber'
        });

        this.properties.addProperty('columnNumber',  {
                                                                            value: columnNumber,
                                                                            userAdjustable: false,
                                                                            propertyType: 'number',
                                                                            hidden: true,
                                                                            caption: 'columnNumber'
        });

        // other custom table cell properties

        this.properties.addProperty('background-color', {
            value: 'white',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: colorsObject,
            hidden: false,
            caption: 'Hintergrundfarbe',
            tooltip: 'Was die Hintergrundfarbe der Tabelzelle ist'
        });

        this.properties.addPropertyRenderer('background-color', 'backgroundColorRenderer', (propertyValue: string) => {
            // console.log('Running table cell background color property renderer...');
            const element =  document.getElementById(this.getPropertyValue('id'));
            if (element !== null) {
                element.style.backgroundColor = propertyValue;
            }
        });

        // tableCells do not use the standard element spatial property renderers, so remove them

        this.properties.removePropertyRenderer('left', 'basicRenderer');
        this.properties.removePropertyRenderer('top', 'basicRenderer');
        this.properties.removePropertyRenderer('width', 'basicRenderer');
        this.properties.removePropertyRenderer('height', 'basicRenderer');
    }

    public resize(newWidth: number, newHeight: number)
    {
        const parentTableID = this.parentTable.getID();
        const parentTableCells: TableCellsPropertyValue = this.parentTable.getPropertyValue('tableCells');

        const rowNumber = this.getPropertyValue('rowNumber');
        const columnNumber = this.getPropertyValue('columnNumber');

        const tableRows = parentTableCells.length;
        const tableColumns = parentTableCells[0].length;

        // update the properties
        // console.log('Resizing table cell...');
        // console.log('rowNumber: ' + rowNumber);
        // console.log('columnNumber:' + columnNumber);
        // console.log(parentTableCells);

        for (let k = 0; k < tableColumns; k++)
        {
            // console.log('Trying to access parentTableCells of ' + rowNumber + ',' + k);
            // this for traverses a row

            // make sure all cells on the same row as the resized cell have the same height
            parentTableCells[rowNumber][k].setPropertyValue('height', newHeight);
        }

        for (let k = 0; k < tableRows; k++)
        {
            // console.log('Trying to access parentTableCells of ' + k + ',' + columnNumber);
            // this for traverses a column

            // make sure all cells on the same column as the resized cell have the same width
            parentTableCells[k][columnNumber].setPropertyValue('width', newWidth);
        }

        this.parentTable.setPropertyValue('tableCells', parentTableCells);
        // render the new properties

        // temporarily remove the height and with properties of the table element, so as not to limit the resizing of the table cells
        const parentTableElement = document.getElementById(parentTableID);
        if (parentTableElement !== null)
        {
            parentTableElement.style.removeProperty('width');
            parentTableElement.style.removeProperty('height');
        }
        else
        {
            console.error(`Parent table element (${parentTableID}) not found.`);
        }

        for (let k = 0; k < parentTableCells[rowNumber].length; k++)
        {
            jQuery('#' + parentTableCells[rowNumber][k].getPropertyValue('id')).height(newHeight);
        }


        for (let k = 0; k < parentTableCells.length; k++)
        {
            jQuery('#' + parentTableCells[k][columnNumber].getPropertyValue('id')).width(newWidth);
        }

        // add back the height and width of the table element and its cells
        this.parentTable.updateSizePropertiesBasedOn(this.parentTable.pageHTMLElementID, parentTableID);
        this.parentTable.updateSizePropertiesOfTableCells();

        // update position of each individual table cell
        this.parentTable.updatePositionPropertiesOfTableCells();

        // update the position of the elements docked to the table cells and table
        this.parentTable.mapToTableCells((tableCell: TableCell) => {
            /*
            // todo: docking
            this.getAllDockedElementIDs(tableCellElementID).forEach((dockedElementID:string) => {
                this.enforceElementDocking(dockedElementID);
            });
            */
        });

        // todo: docking
        // update the docking menus
        // this.updateAllPopupMenuItemsConcerningDocking();
    }
}
export class TableElement extends UnitElement {

    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, pageHTMLElementID);

        this.properties.addProperty('type', {
            value: 'table',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        this.properties.addProperty('cellCounter', {
            value: 0,
            userAdjustable: false,
            propertyType: 'number',
            hidden: true,
            caption: 'internal cell counter'
        });

        this.properties.addProperty('tableCells', {
            value: [],
            userAdjustable: false,
            propertyType: 'tableCells',
            hidden: true,
            caption: 'table cells',
        });

        this.setPropertyValue('z-index', 50);

        for (let i = 0; i <= 1; i++)
        {
            for (let j = 0; j <= 1; j++)
            {
                this.newTableCell(i, j);
            }
        }

        this.properties.addPropertyRenderer('tableCells', 'tableCellsRenderer', (propertyValue: TableCellsPropertyValue) => {
                // console.log('trying to render table cells:');
                // console.log(propertyValue);

                // temporarily remove the height and with properties of the element,
                // so as to dynamically size the table element according to its contents
                const tableElementID = this.getElementID() + '_table';
                const tableElement = document.getElementById(tableElementID);
                if (tableElement !== null) {

                    tableElement.style.removeProperty('width');
                    tableElement.style.removeProperty('height');

                    // first, render the table cells
                    const tableCells = propertyValue;
                    let tableContentHTML = '';
                    for (let i = 0; i < tableCells.length; i++)
                    {
                        tableContentHTML += '<tr>';
                        for (let j = 0; j < tableCells[i].length; j++)
                        {
                            const tableCellID = tableCells[i][j].getPropertyValue('id');
                            const tableCellWidth = tableCells[i][j].getPropertyValue('width');
                            const tableCellHeight = tableCells[i][j].getPropertyValue('height');
                            tableContentHTML += `<td id="${tableCellID}"
                                                     style="height: ${tableCellHeight}px; width: ${tableCellWidth}px; border: 1px solid black;">
                                                 </td>`;
                        }
                        tableContentHTML += '</tr>';
                    }

                    tableElement.innerHTML = tableContentHTML;

                    this.updateSizePropertiesOfTableCells();
                    this.mapToTableCells((tableCell: TableCell) => {
                        // tableCell.resize(tableCell.getPropertyValue("width"), tableCell.getPropertyValue("height"));
                    });

                    // update position of table cells
                    this.updatePositionPropertiesOfTableCells();

                    // update table size

                    this.updateSizePropertiesBasedOn(this.pageHTMLElementID, this.getElementID());

                    // render properties of table cells

                    this.mapToTableCells((tableCell: TableCell) => {
                        tableCell.properties.renderProperties();
                    });

                    // trigger new table cell drawn effects

                    this.mapToTableCells((tableCell: TableCell) => {
                        this.dispatchNewTableCellDrawnEvent(tableCell);
                    });

                }
        });

        // width and height are hidden for tables
        const widthProperty = this.properties.getProperty('width');
        widthProperty.hidden = true;
        this.properties.setProperty('width', widthProperty);

        const heightProperty = this.properties.getProperty('height');
        heightProperty.hidden = true;
        this.properties.setProperty('height', heightProperty);

        // remove inherited properties that this element type does not use
        this.properties.removeProperty('font-family');
        this.properties.removeProperty('font-size');
        this.properties.removeProperty('color');
        this.properties.removeProperty('background-color');
    }

    private newTableCell(rowNumber: number, columnNumber: number)
    {
        let tableCells = this.getPropertyValue('tableCells');
        // first we increment the cell count of the table
        this.setPropertyValue('cellCounter', this.getPropertyValue('cellCounter') + 1);

        // then we use the cell count in order to generate a unique elementID for the cell
        const cellElementID = this.elementID + '_cell_' + this.getPropertyValue('cellCounter');

        if (typeof tableCells === 'undefined') {
            tableCells = [];
        }

        while (tableCells.length <= rowNumber) {
            tableCells.push([]);
        }

        while (tableCells[rowNumber].length <= columnNumber) {
            const newColumn = tableCells[rowNumber].length;
            tableCells[rowNumber].push(new TableCell(cellElementID, this, rowNumber, newColumn, this.pageID));
        }

        tableCells[rowNumber][columnNumber] = new TableCell(cellElementID, this, rowNumber, columnNumber, this.pageID);
        this.setPropertyValue('tableCells', tableCells);
    }

    // todo: describe the function paramater in an interface
    public mapToTableCells(f: TableCellFunction): void
    {
        const tableCells: TableCellsPropertyValue = this.getPropertyValue('tableCells');
        for (let i = 0; i < tableCells.length; i++)
        {
            for (let j = 0; j < tableCells[i].length; j++)
            {
                f(tableCells[i][j], i, j);
            }
        }
    }

    public updatePositionPropertiesOfTableCells()
    {
        this.mapToTableCells((tableCell: TableCell) => {
            tableCell.updatePositionPropertiesBasedOn(this.pageHTMLElementID, tableCell.getID());
        });
    }

    public updateSizePropertiesOfTableCells()
    {
        this.mapToTableCells((tableCell: TableCell) => {
            tableCell.updateSizePropertiesBasedOn(this.pageHTMLElementID, tableCell.getID());
        });
    }

    public updateSizePropertiesOfTable()
    {
        const tableElement = document.getElementById(this.getID());
        if (tableElement !== null)
        {
            tableElement.style.removeProperty('width');
            tableElement.style.removeProperty('height');
            this.updateSizePropertiesBasedOn(this.pageHTMLElementID, this.getElementID());
        }
    }

    public alterTable(
                     alterationType: 'addRow' | 'addColumn' | 'deleteRow' | 'deleteColumn',
                     atRowNumber = 0,
                     atColumnNumber = 0)
    {
        const tableCells = this.getPropertyValue('tableCells');

        const columns = tableCells[0].length;
        const rows = tableCells.length;

        if (alterationType === 'addRow')
        {
            const newRowNumber = tableCells.length;
            for (let columnIndex = 0; columnIndex < columns; columnIndex++)
            {
                this.newTableCell(newRowNumber, columnIndex);
            }

            this.height += 100; // 100px is the default table cell height
        }
        else if (alterationType === 'addColumn')
        {
            const newColumnNumber = tableCells[0].length;

            for (let rowIndex = 0; rowIndex < rows; rowIndex++)
            {
                this.newTableCell(rowIndex, newColumnNumber);
            }

            this.width += 100; // 100px is the default table cell width
        }
        else if (alterationType === 'deleteRow')
        {
            if (rows > 1)
            {
                // dispatch table cell deleted events
                // todo: consider position of this in whole deletion process
                for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
                    this.dispatchTableCellDeletedEvent(tableCells[atRowNumber][columnIndex]);
                }

                // then delete the row from the table

                const deletedRowsOfElementIds = tableCells.splice(atRowNumber , 1);

                // update table properties
                this.setPropertyValue('tableCells', tableCells);

                // update cell properties
                this.mapToTableCells((tableCell: TableCell, rowNumber: number, columnNumber: number) => {
                    tableCell.setPropertyValue('rowNumber', rowNumber);
                    tableCell.setPropertyValue('columnNumber', columnNumber);
                });
            }
            else
            {
                alert('Die letzte Linie einer Tabelle kann nicht gelöscht werden.');
            }
        }
        else if (alterationType === 'deleteColumn')
        {
            if (columns > 1)
            {
                // dispatch table cell deleted events
                // todo: consider position of this in whole deletion process
                for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
                    this.dispatchTableCellDeletedEvent(tableCells[rowIndex][atColumnNumber]);
                }

                // delete the whole column
                for (let rowIndex = 0; rowIndex < rows; rowIndex++)
                {
                    tableCells[rowIndex].splice(atColumnNumber, 1); // remove cell from table
                }

                // update table properties
                this.setPropertyValue('tableCells', tableCells);

                // update cell properties
                this.mapToTableCells((tableCell: TableCell, rowNumber: number, columnNumber: number) => {
                    tableCell.setPropertyValue('rowNumber', rowNumber);
                    tableCell.setPropertyValue('columnNumber', columnNumber);
                });
            }
            else
            {
                alert('Die letzte Spalte einer Tabelle kann nicht gelöscht werden.');
            }
        }

        this.properties.renderProperties();
        this.updateSizePropertiesOfTableCells();
        this.updateSizePropertiesOfTable();

        this.updatePositionPropertiesOfTableCells();
        this.updatePositionPropertiesBasedOn(this.pageID, this.getElementID());

        this.render();
    }

    public dispatchNewTableCellDrawnEvent(tableCell: TableCell)
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.newTableCellDrawn', {
            detail: {'tableCell': tableCell}
        }));
    }

    public dispatchTableCellDeletedEvent(tableCell: TableCell)
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.tableCellDeleted', {
            detail: {'tableCell': tableCell}
        }));
    }

    public getData(): UnitElementData
    {
        // get normal unit data
        const basicUnitElementData = super.getData();

        // pack table cells nicely as data
        const tableCellsData: PropertiesValue[][] = [];
        const tableCells: ObjectWithProperties[][] = this.getPropertyValue('tableCells');
        for (let i = 0; i < tableCells.length; i++)
        {
            tableCellsData.push([]);
            for (let j = 0; j < tableCells[i].length; j++)
            {
              tableCellsData[i].push(tableCells[i][j].properties.getData());
            }
       }

        basicUnitElementData.tableCells = tableCellsData;

        return basicUnitElementData;
    }

    public loadData(unitElementData: UnitElementData)
    {
        // load normal unit data
        super.loadData(unitElementData);

        // load table cells
        if ('tableCells' in unitElementData) {
            if (typeof unitElementData.tableCells !== 'undefined') {
                const tableCellsProperty: ObjectWithProperties[][] = [];
                const tableCellsData: PropertiesValue[][] = unitElementData.tableCells;

                let cellCounter = 0;
                for (let i = 0; i < tableCellsData.length; i++)
                {
                    tableCellsProperty.push([]);
                    for (let j = 0; j < tableCellsData[i].length; j++)
                    {
                        cellCounter++;
                        if (tableCellsData[i][j].id.indexOf(this.elementID) === -1) {
                            // if the table id does not correspond to current element, name it properly
                            tableCellsData[i][j].id = this.elementID + '_cell_' + cellCounter;
                        }

                        const tableCell = new TableCell(tableCellsData[i][j].id,
                                                        this,
                                                        tableCellsData[i][j].rowNumber,
                                                        tableCellsData[i][j].columnNumber,
                                                        this.pageID);

                        tableCell.properties.loadData(tableCellsData[i][j]);

                        tableCellsProperty[i].push(tableCell);
                    }
                }
                this.setPropertyValue('tableCells', tableCellsProperty);
            }
        }
    }

    drawElement()
    {
        const elementHTML = `<div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
        <div id="${this.elementID}_zIndexContainer" class="unitElementZIndexContainer">
            <span id="${this.elementID}_style">
                <table id="${this.elementID}_table" style="border: 1px solid black;">
                </table>
            </span>
        </div>
        </div>`;

        const pageHTMLElement = this.getPageHTMLElement();
        if (pageHTMLElement !== null)
        {
         pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);

         this.properties.renderProperties(['width', 'height']);
         this.updateSizePropertiesOfTable();
         this.properties.renderProperty('width');
         this.properties.renderProperty('height');

         this.dispatchNewElementDrawnEvent();
        }
    }

}
