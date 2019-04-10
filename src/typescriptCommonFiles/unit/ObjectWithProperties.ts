 // www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {Property, Properties} from './Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../models/Data.js';

export class ObjectWithProperties {
    public properties: Properties;

    constructor (private id: string, private type: string)
    {
        this.properties = new Properties(this, id, type);
    }

    public getPropertyValue(propertyName: string): any
    {
        return this.properties.getPropertyValue(propertyName);
    }

    public setPropertyValue(propertyName: string, propertyValue: any): void
    {
        this.properties.setPropertyValue(propertyName, propertyValue);
    }

    public getPropertyCaption(propertyName: string): string
    {
        return this.properties.getPropertyCaption(propertyName);
    }

    public getProperty(propertyName: string): Property
    {
        return this.properties.getProperty(propertyName);
    }

    public getPropertiesMap(): Map<string, Property>
    {
        return this.properties.getPropertiesMap();
    }

    public getID(): string
    {
        return this.id;
    }

    public getObjectType(): string
    {
        return this.type;
    }
}
