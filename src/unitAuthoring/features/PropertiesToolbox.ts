// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2019
// license: MIT

import {UnitElement} from '../../typescriptCommonFiles/unit/UnitElement.js';
import {UnitPage} from '../../typescriptCommonFiles/unit/UnitPage.js';
import {Unit} from '../../typescriptCommonFiles/unit/Unit.js';

import {Property, Properties, DropdownProperty} from '../../typescriptCommonFiles/unit/Properties.js';

import {TableCell, TableElement} from '../../typescriptCommonFiles/unit/elementTypes/TableElement.js';

import {ObjectWithProperties} from '../../typescriptCommonFiles/unit/ObjectWithProperties.js';

export class PropertiesToolbox
{
    private currentlySelectedProperty: string = '';

    constructor (public elementPropertiesDivID = 'elementProperties', public elementPropertiesTitleDivID = 'elementPropertiesTitle')
    {

    }

    public applyNewProperties(objectWithProperties: ObjectWithProperties) {

        document.querySelectorAll('.propertyInput').forEach((propertyElement: Element, index, array) => {
            const propertyName = propertyElement.getAttribute('name');
            if (propertyName !== null)
            {
                const propertyValue = (propertyElement as HTMLInputElement).value;
                objectWithProperties.setPropertyValue(propertyName, propertyValue);
            }
        });

        if (objectWithProperties.getObjectType() === 'TableCell')
        {
            const tableCell = <TableCell>objectWithProperties;
            tableCell.resize(tableCell.getPropertyValue('width'), tableCell.getPropertyValue('height'));
            tableCell.parentTable.render();
        }

        if (objectWithProperties.getObjectType() === 'UnitElement')
        {
            const element = <UnitElement>objectWithProperties;
            element.render();
        }

        if (objectWithProperties.getObjectType() === 'UnitPage')
        {
            const page = <UnitPage>objectWithProperties;
            page.render();
        }

        if (objectWithProperties.getObjectType() === 'Unit')
        {
            const unit = <Unit>objectWithProperties;
            unit.render();
        }
    }

    public showPropertiesOf(objectWithProperties: ObjectWithProperties) {

        // console.log(`Listing properties of`);
        // console.log(objectWithProperties);

        const id: string = objectWithProperties.getID();

        let propertiesHTML = '';

        // console.log(properties);

        propertiesHTML += `<table>`;
        propertiesHTML += `<tr><td style="min-width: 80px"></td><td style=""></td></tr>`;

        // if a property has no caption, automatically create one for it
        // todo: NewProperty function to centralize the creation of new properties
        const propertiesDisplayed: Map<string, Property> = objectWithProperties.getPropertiesMap();

        // console.log('Properties to be displayed:');
        // console.log(propertiesDisplayed);

        propertiesDisplayed.forEach((property: Property, propertyName: string) => {
            if ('caption' in property === false)
            {
                // if no caption is found, then property caption = property name
                property.caption = propertyName;
                propertiesDisplayed.set(propertyName, property);
            }
        });
        // end of property caption failsafe

        // use an array to sort the properties beforehand
        const propertiesDisplayedArray: Array<string> = [];
        propertiesDisplayed.forEach((property: Property, propertyName: string) => {
                propertiesDisplayedArray.push(propertyName);
        });

        propertiesDisplayedArray.sort((a: string, b: string) => {
            // always let "type" be the smallest alphabetically, so that it gets shown first
            if (a === 'type') {
                return -1;
            }
            if (b === 'type') {
                return 1;
            }

            // sort alphabetically according to property captions
            if (propertiesDisplayed.get(a).caption >= propertiesDisplayed.get(b).caption) {
                return 1;
            }
            else {
                return -1;
            }
        });

        // console.log('Properties to be displayed (array): ')
        // console.log(propertiesDisplayedArray);

        // show the sorted properties
        propertiesDisplayedArray.forEach((propertyName: string) => {
            const property = propertiesDisplayed.get(propertyName);
            if (typeof property !== 'undefined')
            {
                let propertyTooltip = '';
                if ('tooltip' in property) {
                    if (typeof property.tooltip !== 'undefined') {
                        propertyTooltip = property.tooltip;
                    }
                }

                if (property.hidden === false)
                {
                    propertiesHTML += '<tr>';
                    propertiesHTML += `<td title="${propertyTooltip}">${property.caption}:</td>`;
                    propertiesHTML += `<td>`;
                    if (property.userAdjustable)
                    {
                        if (property.propertyType === 'text')
                        {
                            const escapedPropertyValue = String(property.value).replace(new RegExp(`"`, 'g'), `&quot;`);
                            // to do - escape more stuff

                            propertiesHTML += `<textarea
                                                      id="${propertyName}_propertyInput"
                                                      class="propertyInput"
                                                      name="${propertyName}"
                                                      style="width: 98%; min-height: 70px;" title="${propertyTooltip}">${escapedPropertyValue}</textarea>`;
                        }
                        else if (property.propertyType === 'number')
                        {
                            const escapedPropertyValue = String(property.value).replace(new RegExp(`"`, 'g'), `&quot;`);
                            // to do - escape more stuff

                            propertiesHTML += `<input type="number"
                                                      id="${propertyName}_propertyInput"
                                                      class="propertyInput"
                                                      name="${propertyName}"
                                                      value="${escapedPropertyValue}"
                                                      title="${propertyTooltip}"
                                                      style="width: 98%;">`;
                        }
                        else if (property.propertyType === 'boolean')
                        {
                            let trueIsSelected = '';
                            let falseIsSelected = '';
                            if (property.value === 'true') {
                                trueIsSelected = 'selected';
                            }
                            else {
                                falseIsSelected = 'selected';
                            }

                            propertiesHTML += `<select class="propertyInput"
                                                       id="${propertyName}_propertyInput"
                                                       name="${propertyName}"
                                                       title="${propertyTooltip}"
                                                       style="width: 200px">
                                                            <option value="true" ${trueIsSelected}>true</option>
                                                            <option value="false" ${falseIsSelected}>false</option>
                                                </select>`;
                        }
                        else if (property.propertyType === 'dropdown')
                        {
                            propertiesHTML += `<select class="propertyInput"
                                                       id="${propertyName}_propertyInput"
                                                       name="${propertyName}"
                                                       title="${propertyTooltip}"
                                                       style="width: 200px">`;

                            const dropdownProperty = property as DropdownProperty;
                            if ('propertyData' in dropdownProperty)
                            {
                                for (const dropdownOptionName in dropdownProperty.propertyData) {
                                    if (dropdownOptionName in dropdownProperty.propertyData) {
                                        const dropdownOptionValue = dropdownProperty.propertyData[dropdownOptionName];

                                        let selectedAttribute = '';
                                        if (dropdownProperty.value === dropdownOptionValue) {
                                            selectedAttribute = 'selected';
                                        }

                                        propertiesHTML += `<option value="${dropdownOptionValue}"
                                                            ${selectedAttribute}>${dropdownOptionName}</option>`;
                                    }
                                }
                            }

                            propertiesHTML += '</select>';
                        }
                    }
                    else {
                        propertiesHTML += `<span title="${propertyTooltip}">${String(property.value)}</span>`;
                    }
                    propertiesHTML += `</td>`;
                    propertiesHTML += '</tr>';

                    if (propertyName === 'text') {
                        propertiesHTML += '<tr>';
                        propertiesHTML += '<td title="Zum Benutzen via Kopieren und Einfügen">Sonderzeichen</td>';
                        propertiesHTML += '<td class="selectableText" title="Zum Benutzen via Kopieren und Einfügen">© € $ £ ® ™ ½ ¼ ² ³</td>';
                        propertiesHTML += '</tr>';
                    }
                }
            }
        }); // end of property loop


        propertiesHTML += '</table>';
        propertiesHTML += `<p style="text-align:center"><button id="btnApplyProperties")">Neue Eigenschaften einsetzen</button></p>`;

        if (objectWithProperties.getObjectType() === 'UnitElement')
        {
            const element = <UnitElement>objectWithProperties;
            const elementType = element.getElementType();
            const elementID = element.getElementID();

            (document.getElementById(this.elementPropertiesTitleDivID) as HTMLElement).innerHTML = `Eigenschaften von ${id}`;
            (document.getElementById(this.elementPropertiesDivID) as HTMLDivElement).innerHTML = propertiesHTML;
            (document.getElementById(this.elementPropertiesDivID) as HTMLDivElement).style.display = 'inline-block';

            (document.getElementById('btnApplyProperties') as HTMLElement).onclick = () => {
                this.applyNewProperties(element);
            };

            /*
            if (this.currentlySelectedProperty !== '') {
                const propertyInputElement = document.getElementById(this.currentlySelectedProperty + '_propertyInput');
                if (propertyInputElement !== null) {
                    propertyInputElement.focus();
                }
            }

            document.querySelectorAll('.propertyInput').forEach( (propertyInputElement: Element) => {

                propertyInputElement.addEventListener('change', (e) => {
                    console.log(e);
                    this.applyNewProperties(element);

                    const propertyInputElementName = propertyInputElement.getAttribute('name');
                    if ( propertyInputElementName !== null) {
                        this.currentlySelectedProperty = propertyInputElementName;
                    }
                });

                propertyInputElement.addEventListener('keyup', (e) => {
                    console.log(e);
                    this.applyNewProperties(element);

                    const propertyInputElementName = propertyInputElement.getAttribute('name');
                    if ( propertyInputElementName !== null) {
                        this.currentlySelectedProperty = propertyInputElementName;
                    }
                });
            });
            */
        }

        if (objectWithProperties.getObjectType() === 'TableCell')
        {
            const tableCell = <TableCell>objectWithProperties;

            propertiesHTML += `<hr />`;
            propertiesHTML += `<p style="text-align:center">Tabellestruktur ändern</p>`;
            propertiesHTML += `<p style="text-align:center"><button id="btnAddRow")">Zeile hinzufügen</button></p>`;
            propertiesHTML += `<p style="text-align:center"><button id="btnDeleteRow")">Zeile löschen</button></p>`;
            propertiesHTML += `<p style="text-align:center"><button id="btnAddColumn")">Spalte hinzufügen</button></p>`;
            propertiesHTML += `<p style="text-align:center"><button id="btnDeleteColumn")">Spalte löschen</button></p>`;
            propertiesHTML += `<hr />`;
            propertiesHTML += `<p style="text-align:center">Zellen ausgleichen</p>`;
            propertiesHTML += `<p style="text-align:center"><button id="btnEvenOutRow")">Alle anderen Zellen der Zeile die selbe Breite geben</button></p>`;
            propertiesHTML += `<p style="text-align:center"><button id="btnEvenOutColumn")">Alle anderen Zellen der Spalte die selbe Höhe geben</button></p>`;
            propertiesHTML += `<hr />`;

            (document.getElementById(this.elementPropertiesTitleDivID) as HTMLElement).innerHTML = `Eigenschaften von ${id}`;
            (document.getElementById(this.elementPropertiesDivID) as HTMLDivElement).innerHTML = propertiesHTML;
            (document.getElementById(this.elementPropertiesDivID) as HTMLDivElement).style.display = 'inline-block';

            (document.getElementById('btnApplyProperties') as HTMLElement).onclick = () => {
                this.applyNewProperties(tableCell);
            };

            const tableElementID = tableCell.parentTable.getID();
            const atTableRow = tableCell.getPropertyValue('rowNumber');
            const atTableColumn = tableCell.getPropertyValue('columnNumber');

            (document.getElementById('btnAddRow') as HTMLElement).onclick = () => {
                tableCell.parentTable.alterTable('addRow', atTableRow, atTableColumn);
            };

            (document.getElementById('btnAddColumn') as HTMLElement).onclick = () => {
                tableCell.parentTable.alterTable('addColumn', atTableRow, atTableColumn);
            };

            (document.getElementById('btnDeleteRow') as HTMLElement).onclick = () => {
                tableCell.parentTable.alterTable('deleteRow' , atTableRow, atTableColumn);
            };

            (document.getElementById('btnDeleteColumn') as HTMLElement).onclick = () => {
                tableCell.parentTable.alterTable('deleteColumn', atTableRow, atTableColumn);
            };

            (document.getElementById('btnEvenOutRow') as HTMLElement).onclick = () => {
                const newWidth = tableCell.width;
                tableCell.parentTable.mapToTableCells((tableCellToConsider: TableCell, rowNumber: number, columnNumber: number) => {
                    if (rowNumber === tableCell.rowNumber) {
                        tableCellToConsider.resize(newWidth, tableCellToConsider.height);
                    }
                });
                tableCell.parentTable.render();
            };

            (document.getElementById('btnEvenOutColumn') as HTMLElement).onclick = () => {
                const newHeight = tableCell.height;
                tableCell.parentTable.mapToTableCells((tableCellToConsider: TableCell, rowNumber: number, columnNumber: number) => {
                    if (columnNumber === tableCell.columnNumber) {
                        tableCellToConsider.resize(tableCellToConsider.width, newHeight);
                    }
                });
                tableCell.parentTable.render();
            };
        }

        if (objectWithProperties.getObjectType() === 'UnitPage')
        {
            const page = <UnitPage>objectWithProperties;

            (document.getElementById(this.elementPropertiesTitleDivID) as HTMLElement).innerHTML = `Eigenschaften von ${id}`;
            (document.getElementById(this.elementPropertiesDivID) as HTMLDivElement).innerHTML = propertiesHTML;
            (document.getElementById(this.elementPropertiesDivID) as HTMLDivElement).style.display = 'inline-block';

            (document.getElementById('btnApplyProperties') as HTMLElement).onclick = () => {
                this.applyNewProperties(page);
            };
        }

        if (objectWithProperties.getObjectType() === 'nothingSelected')
        {
            (document.getElementById(this.elementPropertiesTitleDivID) as HTMLElement).innerHTML = `Nichts gewählt.`;
            (document.getElementById(this.elementPropertiesDivID) as HTMLDivElement).innerHTML = '';
            (document.getElementById(this.elementPropertiesDivID) as HTMLDivElement).style.display = 'none';

        }

        // end of showProperties()
    }
}
