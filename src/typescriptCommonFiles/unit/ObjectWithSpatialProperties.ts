// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {ObjectWithProperties} from './ObjectWithProperties.js';

export class ObjectWithSpatialProperties extends ObjectWithProperties {
    constructor(id: string, type: string, public pageID: string)
    {
        super(id, type);

        this.properties.addProperty('left', {
            value: 30,
            userAdjustable: true,
            propertyType: 'number',
            hidden: false,
            caption: 'x-Koordinate',
            tooltip: 'Die horizontale Koordinate des Elements'
        });

        this.properties.addPropertyRenderer('left', 'basicRenderer', (propertyValue: any) => {
            const element =  document.getElementById(this.getID());
            const jQueryElementWidth = this.getPageJQueryElement().width();
            const jQueryElementOffset = this.getPageJQueryElement().offset();
            if (element && jQueryElementOffset && jQueryElementWidth) {
                let newLeft =  jQueryElementOffset.left + parseInt(propertyValue, 10);
                const maxLeft =  jQueryElementOffset.left +  jQueryElementWidth -  this.getPropertyValue('width');

                if (newLeft > maxLeft) {
                    newLeft = maxLeft;
                }

                if (newLeft <  jQueryElementOffset.left) {
                    newLeft =  jQueryElementOffset.left;
                }

                const newLeftPropertyValue = newLeft -  jQueryElementOffset.left;
                this.properties.setPropertyValue('left', newLeftPropertyValue);
                element.style.left =  this.properties.getPropertyValue('left')  + 'px';
            }
        });

        this.properties.addProperty('top', {
            value: 30,
            userAdjustable: true,
            propertyType: 'number',
            hidden: false,
            caption: 'y-Koordinate',
            tooltip: 'Die vertikale Koordinate des Elements'
        });

        this.properties.addPropertyRenderer('top', 'basicRenderer', (propertyValue: any) => {
            const element =  document.getElementById(this.getID());
            const jQueryElementHeight = this.getPageJQueryElement().height();
            const jQueryElementOffset = this.getPageJQueryElement().offset();
            if (element && jQueryElementHeight && jQueryElementOffset)
            {
                let newTop = jQueryElementOffset.top + parseInt(propertyValue, 10);
                const maxTop = jQueryElementOffset.top + jQueryElementHeight - this.properties.getPropertyValue('height');
                if (newTop > maxTop) {
                    newTop = maxTop;
                }
                if (newTop < jQueryElementOffset.top) {
                    newTop = jQueryElementOffset.top;
                }

                const newTopPropertyValue = newTop - jQueryElementOffset.top;
                this.properties.setPropertyValue('top', newTopPropertyValue);
                element.style.top =  this.properties.getPropertyValue('top') + 'px';
            }
        });

        this.properties.addProperty('width', {
            value: 250,
            userAdjustable: true,
            propertyType: 'number',
            hidden: false,
            caption: 'Breite',
            tooltip: 'Die horizontale Größe des Elements'
        });

        this.properties.addPropertyRenderer('width', 'basicRenderer', (propertyValue: any) => {
            const element =  document.getElementById(this.getID());
            const $element = jQuery('#' + this.getID());
            const jQueryElementWidth = this.getPageJQueryElement().width();
            if (element && jQueryElementWidth)
            {
                let newWidth = parseInt(propertyValue, 10);

                if (newWidth < 0) {
                    newWidth = 0;
                }

                if (newWidth > jQueryElementWidth) {
                    newWidth = $element.parent().width() || 0;
                }

                this.properties.setPropertyValue('width', newWidth);
                element.style.width = newWidth + 'px';
            }
            else
            {
                /*
                setTimeout(() => {
                    this.render();
                }, 1000)
                */
            }
        });

        this.properties.addProperty('height', {
            value: 50,
            userAdjustable: true,
            propertyType: 'number',
            hidden: false,
            caption: 'Höhe',
            tooltip: 'Die vertikale Größe des Elements'
        });

        this.properties.addPropertyRenderer('height', 'basicRenderer', (propertyValue: any) => {
            const element =  document.getElementById(this.getID());
            const jQueryElementHeight = this.getPageJQueryElement().height();
            if (element && jQueryElementHeight)
            {
                let newHeight = parseInt(propertyValue, 10);
                if (newHeight < 0) {
                    newHeight = 0;
                }
                if (newHeight > jQueryElementHeight) {
                    newHeight = this.getPageJQueryElement().height() || 0;
                }

                this.properties.setPropertyValue('height', newHeight);
                element.style.height = newHeight + 'px';
            }
        });

        this.properties.addProperty('dockedToObjectWithID', {
            value: '',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Behälter',
            tooltip: 'Der Name des Behälters (Container) von diesem Element, falls das Element irgendwo angedockt ist'
        });

        this.properties.addProperty('dockedToLeft', {
            value: '',
            userAdjustable: false,
            propertyType: 'number',
            hidden: true,
            caption: 'Docked at X-Koordinate'
        });

        this.properties.addProperty('dockedToTop', {
            value: '',
            userAdjustable: false,
            propertyType: 'number',
            hidden: true,
            caption: 'Docked at Y-Koordinate'
        });
    }

    public updateSizePropertiesBasedOn(pageID: string, HTMLElementID: string) {

        const $element = jQuery('#' + HTMLElementID);
        const $page = jQuery('#' + pageID);

        const oldWidth = this.properties.getPropertyValue('width');
        const oldHeight = this.properties.getPropertyValue('height');

        const pageHeight = $page.height() || 0;
        const pageWidth = $page.width() || 0;
        const pageOffset = $page.offset();
        const elementHeight = $element.height() || 0;
        const elementWidth = $element.width() || 0;
        const elementOffset = $element.offset();
        if (pageOffset && elementOffset) {
            const maxHeight = pageHeight - (elementOffset.top - pageOffset.top) - 20;
            const maxWidth = pageWidth - ((elementOffset.left - pageOffset.left)) - 20;

            if (elementWidth > maxWidth) {
                $element.css('width', maxWidth + 'px');
            }
            if (elementHeight > maxHeight) {
                $element.css('height', maxHeight + 'px');
            }
            if (elementWidth < 10) {
                $element.css('min-width', '10px');
            }
            if (elementHeight < 10) {
                $element.css('min-height', '10px');
            }

            this.properties.setPropertyValue('width', $element.width());
            this.properties.setPropertyValue('height', $element.height());

            const newWidth = this.properties.getPropertyValue('width');
            const newHeight = this.properties.getPropertyValue('height');

            // console.log('Updated size properties of ' + elementID + ':');
            // console.log('Width changed from ' + oldWidth + ' to ' + newWidth);
            // console.log('Height changed from ' + oldHeight + ' to ' + newHeight);
        }
    }

    public updatePositionPropertiesBasedOn(pageID: string, HTMLElementID: string)
    {
        // normally elements are direct childred of the canvas
         const $element = jQuery('#' + HTMLElementID);
         const $page = jQuery('#' + pageID);

        const elementOffset = $element.offset();
        const pageOffset = $page.offset();
        if (elementOffset && pageOffset) {
            const newLeft = (elementOffset.left - pageOffset.left);
            const newTop = (elementOffset.top - pageOffset.top);

            // console.log('updatePositionProperties; newLeft: ' + newLeft);
            // console.log('updatePositionProperties; newTop: ' + newTop);

            this.setPropertyValue('left',  newLeft);
            this.setPropertyValue('top', newTop);
            // this.showPropertiesOf(elementID);
        }
    }

    public getPageHTMLElement()
    {
        return document.getElementById(this.pageID);
    }

    public getPageJQueryElement()
    {
        return jQuery('#' + this.pageID);
    }

    // setters and getters for left, top, height and width

    public get left(): number
    {
        return this.getPropertyValue('left');
    }

    public set left(newPropertyValue: number)
    {
        this.setPropertyValue('left', newPropertyValue);
    }

    public get top(): number
    {
        return this.getPropertyValue('top');
    }

    public set top(newPropertyValue: number)
    {
        this.setPropertyValue('top', newPropertyValue);
    }

    public get height(): number
    {
        return this.getPropertyValue('height');
    }

    public set height(newPropertyValue: number)
    {
        this.setPropertyValue('height', newPropertyValue);
    }

    public get width(): number
    {
        return this.getPropertyValue('width');
    }

    public set width(newPropertyValue: number)
    {
        this.setPropertyValue('width', newPropertyValue);
    }

    // end of setters and getters for left, top, height and width

    public get dockedToObjectWithID(): string
    {
        return this.getPropertyValue('dockedToObjectWithID');
    }

    public set dockedToObjectWithID(newPropertyValue: string)
    {
        this.setPropertyValue('dockedToObjectWithID', newPropertyValue);
    }

    public get dockedToLeft(): number
    {
        return this.getPropertyValue('dockedToLeft');
    }

    public set dockedToLeft(newPropertyValue: number)
    {
        this.setPropertyValue('dockedToLeft', newPropertyValue);
    }

    public get dockedToTop(): number
    {
        return this.getPropertyValue('dockedToTop');
    }

    public set dockedToTop(newPropertyValue: number)
    {
        this.setPropertyValue('dockedToTop', newPropertyValue);
    }
}
