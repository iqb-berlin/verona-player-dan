// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {PropertiesValue} from '../models/Data.js';
import {ObjectWithProperties} from './ObjectWithProperties.js';
import {ObjectWithSpatialProperties} from './ObjectWithSpatialProperties.js';
import {TableCell, TableElement} from './elementTypes/TableElement.js';

export interface Property {
    value: any;
    userAdjustable: boolean;
    propertyType: string;
    propertyData?: any;
    hidden: boolean;
    caption: string;
    tooltip?: string;
    calculatedAtRuntime?: boolean;
}

export interface DropdownProperty extends Property
{
    propertyData: {
        [dropdownOptionName: string]: string;
    };
}

export interface PropertyRendererFunction {
    (propertyValue: any): void;
}

export interface PropertyRenderer {
    rendererName: string;
    render: PropertyRendererFunction;
}

export interface PropertyRenderersLibrary {
    [propertyName: string]: PropertyRenderer[];
}

export class Properties
{
    public properties: Map<string, Property> = new Map();
    public propertyRenderers: PropertyRenderersLibrary = {};

    constructor (public propertyOwner: any, public propertyOwnerID: string, public propertyOwnerType: string)
    {

    }

    public loadData(propertiesValue: PropertiesValue)
    {
        for (const propertyName in propertiesValue)
        {
            if (propertyName in propertiesValue) {
                const propertyValue = propertiesValue[propertyName];
                if (this.hasProperty(propertyName))
                {
                    const property = this.getProperty(propertyName);
                    // if the property found in the data still exists in the current class model
                    if (propertyName !== 'tableCells') {
                        let calculatedAtRuntime: boolean = false;
                        // todo: remove need for calculated at runtime property
                        if (typeof property.calculatedAtRuntime !== 'undefined') {
                            calculatedAtRuntime = property.calculatedAtRuntime;
                        }

                        if (calculatedAtRuntime === false) {
                             // only load the data into the property if it's not supposed to be calculated at runtime
                            this.setPropertyValue(propertyName, propertyValue);
                        }
                    }
                }
                else
                {
                    let warningText = `IQB Unit, Warning: Tried to load property '${propertyName}' with the value '${propertyValue}'`;
                    warningText += ` into ${this.propertyOwnerID}'s properties`;
                    warningText += `, but ${this.propertyOwnerID} doesn't have this kind of property anymore.`;
                    console.log(warningText);
                }
            }
        } // end of the for loop
    }

    public getData(): PropertiesValue
    {
        const propertiesValue: PropertiesValue = {};
        this.properties.forEach((property: Property, propertyName: string) =>
        {
           if (property.propertyType !== 'tableCells')
           {
             propertiesValue[propertyName] =  property.value;
           }
        });
        return propertiesValue;
    }

    /* functions that handle managing property data */
    public dispatchPropertyUpdatedEvent(propertyName: string)
    {
        window.dispatchEvent(new CustomEvent('IQB.unit.propertyUpdated', {
            detail: {   'propertyOwner': this.propertyOwner,
                        'propertyOwnerID': this.propertyOwnerID,
                        'propertyOwnerType': this.propertyOwnerType,
                        'propertyName': propertyName,
                        'propertyValue': this.getPropertyValue(propertyName)
                    }
        }));
    }

    public addProperty(propertyName: string, property: Property): void
    {
        this.properties.set(propertyName, property);

        if (propertyName in this.propertyRenderers === false) {
            this.propertyRenderers[propertyName] = [];
        }

        this.dispatchPropertyUpdatedEvent(propertyName);
    }

    public removeProperty(propertyName: string): void
    {
        // delete the property
        this.properties.delete(propertyName);

        // and its property renderers
        if (propertyName in this.propertyRenderers) {
            delete this.propertyRenderers[propertyName];
        }
    }

    public getProperty(propertyName: string): Property
    {
        // todo - handle property not found case
        return this.properties.get(propertyName) as Property;
    }

    public setProperty(propertyName: string, property: Property): void
    {
        this.properties.set(propertyName, property);
        this.dispatchPropertyUpdatedEvent(propertyName);
    }

    public getPropertyValue(propertyName: string): any
    {
        if (this.getProperty(propertyName).propertyType === 'number')
        {
            return parseInt(this.getProperty(propertyName).value, 10);
        }
        else if (this.getProperty(propertyName).propertyType === 'text')
        {
            return String(this.getProperty(propertyName).value);
        }
        else
        {
            return this.getProperty(propertyName).value;
        }
    }

    public setPropertyValue(propertyName: string, newPropertyValue: any): void
    {
        const property = this.getProperty(propertyName);

        const oldValue = property.value;
        let newValue = newPropertyValue;
        if (property.propertyType === 'number') {
            newValue = parseInt(newPropertyValue, 10);
        }

        if (oldValue !== newValue)
        {
            /*
            console.log('Property updated from');
            console.log(oldValue);
            console.log(' to ');
            console.log(newValue);
            */

            property.value = newValue;
            this.setProperty(propertyName, property);
            this.dispatchPropertyUpdatedEvent(propertyName);
        }
    }

    public getPropertyCaption(propertyName: string): string
    {
        return this.getProperty(propertyName).caption;
    }

    public getPropertyNames(): string[]
    {
        const propertyNames: string[] = [];

        this.properties.forEach((property: Property, propertyName: string) => {
            propertyNames.push(propertyName);
        });

        return propertyNames;
    }

    public getPropertiesMap(): Map<string, Property>
    {
        return this.properties;
    }

    /* end of functions that handle managing property data */

    /* functions that handle rendering properties */

    public addPropertyRenderer(propertyName: string, rendererName: string, renderer: PropertyRendererFunction)
    {
        // todo: propertyRenderers should be ordered
        if (propertyName in this.propertyRenderers === false) {
            this.propertyRenderers[propertyName] = [];
        }

        this.propertyRenderers[propertyName].push({
            'rendererName': rendererName,
            'render': renderer});
    }

    public removePropertyRenderer(propertyName: string, rendererName: string)
    {
        this.propertyRenderers[propertyName].forEach((propertyRenderer: PropertyRenderer, index: number) => {
            if (propertyRenderer.rendererName === rendererName)
            {
                // todo - check how this foreach behaves when an element is removed
                this.propertyRenderers[propertyName].splice(index, 1);
            }
        });
    }

    public renderProperty(propertyName: string)
    {
        // console.log('Rendering property ' + propertyName + ' for ' + this.propertyOwnerID);
        this.propertyRenderers[propertyName].forEach((propertyRenderer: PropertyRenderer) => {
            const propertyValue = this.getPropertyValue(propertyName);
            propertyRenderer.render(propertyValue);
        });
    }

    public renderProperties(exceptProperties: Array<string> = [])
    {
        // console.log('Rendering properties for ' + this.propertyOwnerID);
        // console.log(this.properties);
        this.properties.forEach((property, propertyName: string) => {
            if (exceptProperties.indexOf(propertyName) < 0)
            {
                // if the property is not excepted, render it
                this.renderProperty(propertyName);
            }
        });
    }

    public hasProperty(propertyName: string)
    {
        return this.properties.has(propertyName);
    }

    /* end of functions that handle rendering properties */
}
