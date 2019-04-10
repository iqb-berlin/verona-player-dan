// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';

export class ButtonElement extends UnitElement {

    arrowForwardSrc = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAa0lEQVR4Ae3RAQaAQBhE4cACEHvQRQBpAehwQdjb1I/AEEIa7XsMAB8z0N+bY9UFU2LHtckHY4BKsaagr1EZFKgXULsbagQFqhfUdodyA1Wny1Z3DBgw2Q3TwIB5UHLAaMUDIygHjLYIhugEZkaqyaxtmsIAAAAASUVORK5CYII=`; 
    arrowBackSrc = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAQAAABLCVATAAAAZklEQVR4AWMYqSCZQY8axqQy/Gf4yGBBBWPA8BuDGYXGQOFeBg7yjcmhtTGjxpTAjTlMLWO4hosxDdQxppsyYxCgBt0geoTQqFE56FmEHpl21KhU2hjFRq0K0nTAq2wESAE2IkYBAPwljFlzjrZTAAAAAElFTkSuQmCC`;

    constructor(public elementID: string, public pageHTMLElementID: string)
    {
        super(elementID, pageHTMLElementID);

        this.setPropertyValue('width', 400);
        this.setPropertyValue('height', 50);

        this.properties.addProperty('type', {
            value: 'button',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        this.properties.addProperty('text', {
            value: 'neuer Button',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Text',
            tooltip: 'Der Text, der angezeigt wird'
        });

        this.properties.addPropertyRenderer('text', 'buttonRenderer', (propertyValue: string) => {
            const textToShow: string = propertyValue;
            // const HTMLTextToShow: string = textToShow.replace(new RegExp(' ', 'g'), '&nbsp;');
            const HTMLTextToShow: string = textToShow;
            const buttonTextHTMLElement = (document.getElementById(this.elementID + '_button_textSpan') as HTMLElement);
            buttonTextHTMLElement.innerHTML = HTMLTextToShow; // bug: modifying the entire innerhtml removes resize stuff (todo)
        });

        this.properties.addProperty('underlined', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Unterstrichen',
            tooltip: 'Soll der Text unterstrichen sein?'
        });

        this.properties.addPropertyRenderer('underlined', 'buttonRenderer', (propertyValue: string) => {
            const buttonHTMLElement = (document.getElementById(this.elementID + '_button') as HTMLElement);
            if (propertyValue === 'true') {
                buttonHTMLElement.style.textDecoration = 'underline';
            }
            else {
                buttonHTMLElement.style.textDecoration = 'none';
            }
        });

        this.properties.addProperty('bolded', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Fettgedruckt',
            tooltip: 'Soll der Text fettgedruckt sein?'
        });

        this.properties.addPropertyRenderer('bolded', 'buttonRenderer', (propertyValue: string) => {
            const buttonHTMLElement = (document.getElementById(this.elementID + '_button') as HTMLElement);
            if (propertyValue === 'true') {
                buttonHTMLElement.style.fontWeight = 'bold';
            }
            else {
                buttonHTMLElement.style.fontWeight = 'normal';
            }
        });


        this.properties.addProperty('italics', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Kursivgedruckt',
            tooltip: 'Soll der Text kursivgedruckt sein?'
        });

        this.properties.addPropertyRenderer('italics', 'buttonRenderer', (propertyValue: string) => {
            const buttonHTMLElement = (document.getElementById(this.elementID + '_button') as HTMLElement);
            if (propertyValue === 'true') {
                buttonHTMLElement.style.fontStyle = 'italic';
            }
            else {
                buttonHTMLElement.style.fontStyle = 'normal';
            }
        });

        // prepare lineHeightObject, which contains all line heights between 10% and 300%

        const lineHeightObject: {[lineHeightCaption: string]: string} = {};

        for (let i = 1; i <= 50; i++) {
            const lineHeight = i * 10 + '%';
            lineHeightObject[lineHeight] = lineHeight;
        }

        this.properties.addProperty('line-height', {
            value: '120%',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: lineHeightObject,
            hidden: false,
            caption: 'Zeilenhöhe',
            tooltip: 'Wie groß der Abstand zwischen den Zeilen ist'
        });

        this.properties.addPropertyRenderer('line-height', 'buttonRenderer', (propertyValue: string) => {
            const buttonHTMLElement = (document.getElementById(this.elementID + '_button') as HTMLElement);
            buttonHTMLElement.style.lineHeight = propertyValue;
        });

        // prepare lineHeightObject, which contains all line heights between 10% and 300%

        const textIndentObject: {[textIndentCaption: string]: string} = {};
        for (let i = -100; i <= 100; i++) {
            const textIndent = i + 'px';
            textIndentObject[textIndent] = textIndent;
        }

        this.properties.addProperty('text-indent', {
            value: '0px',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: textIndentObject,
            hidden: false,
            caption: 'Erste Zeile',
            tooltip: 'Wie groß der Einzug der ersten Zeile ist'
        });

        this.properties.addPropertyRenderer('text-indent', 'buttonRenderer', (propertyValue: string) => {
            const buttonHTMLElement = (document.getElementById(this.elementID + '_button') as HTMLElement);
            buttonHTMLElement.style.textIndent = propertyValue;
        });

        this.properties.addProperty('text-align', {
            value: 'center',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: {'linksbündig': `left`,
                           'zentriert': 'center',
                           'rechtsbündig': `right`,
                           'Blocksatz': 'justify'
                          },
            hidden: false,
            caption: 'Textausrichtung',
            tooltip: `Was die Ausrichtung des Texts in dem Element ist. Wenn man 'Blocksatz' wählt, werden mehrere aufeinanderfolgende Leerzeichen auf nur ein Lehrzeichen reduziert.`
        });

        this.properties.addPropertyRenderer('text-align', 'buttonRenderer', (propertyValue: string) => {
            const element =  document.getElementById(this.elementID + '_button');
            if (element !== null) {
                 element.style.textAlign = propertyValue;

                 // justify does not work with white-space set as pre-wrap, so set it as pre-line when the text is justified
                 if (propertyValue === 'justify') {
                    element.style.whiteSpace = 'pre-line';
                 }
                 else
                 {
                    element.style.whiteSpace = 'pre-wrap';
                 }
            }
        });

        this.properties.addProperty('onClick', {
            value: 'end',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: {
                'End': 'end',
                'Previous unit': 'previous',
                'Next unit': 'next'
            },
            hidden: false,
            caption: 'Verhalten',
            tooltip: 'Was soll der Button machen, wenn geklickt'
        });

        this.properties.addPropertyRenderer('onClick', 'buttonRenderer', (propertyValue: string) => {

        });

        this.properties.addProperty('look', {
            value: 'end',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: {
                'text': 'text',
                'Previous icon': 'imgPrevious',
                'Next icon': 'imgNext'
            },
            hidden: false,
            caption: 'Aussehen',
            tooltip: 'Wie soll der Button aussehen?'
        });

        this.properties.addPropertyRenderer('look', 'buttonRenderer', (propertyValue: string) => {
            const textSpan = document.getElementById(this.elementID + '_button_textSpan') as HTMLSpanElement;
            const imageSpan = document.getElementById(this.elementID + '_button_imageSpan') as HTMLSpanElement;
            if (propertyValue === 'text') {
                textSpan.style.display = 'inline';
                imageSpan.style.display = 'none';
                imageSpan.innerHTML = '';
            }
            if (propertyValue === 'imgPrevious') {
                textSpan.style.display = 'none';
                imageSpan.style.display = 'inline';
                imageSpan.innerHTML = `<img src="${this.arrowBackSrc}" style="position: relative; left: 7px;">`;
            }
            if (propertyValue === 'imgNext') {
                textSpan.style.display = 'none';
                imageSpan.style.display = 'inline';
                imageSpan.innerHTML = `<img src="${this.arrowForwardSrc}" style="position: relative; left: 2px;">`;
            }
        });


        // other property renderers for properties inherited from UnitElement

        this.properties.addPropertyRenderer('font-size', 'fontSizeRenderer', (propertyValue: string) => {
            const element =  document.getElementById(this.elementID + '_button');
            if (element !== null) {
                 element.style.fontSize = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('font-family', 'fontFamilyRenderer', (propertyValue: string) => {
            const element =  document.getElementById(this.elementID + '_button');
            if (element !== null) {
                element.style.fontFamily = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('color', 'colorRenderer', (propertyValue: string) => {
            const element =  document.getElementById(this.elementID + '_button');
            if (element !== null) {
                element.style.color = propertyValue;
            }
        });

        this.properties.addPropertyRenderer('background-color', 'backgroundColorRenderer', (propertyValue: string) => {
            const element =  document.getElementById(this.elementID + '_button');
            if (element !== null) {
                element.style.backgroundColor = propertyValue;
            }
        });

        this.properties.removeProperty('style');
        this.properties.removeProperty('visible');

        // set default button color to a very light gray
        this.properties.setPropertyValue('background-color', '#EEEEEE');
    }

    drawElement()
    {
        const elementHTML = `
                            <div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}">
                                <div id="${this.elementID}_zIndexContainer" class="unitElementZIndexContainer" style="height: 100%; width: 100%;">
                                    <div id="${this.elementID}_divContainer" style="width: 100%; height: 100%; text-align: left; overflow: visible;">
                                        <button id="${this.elementID}_button" style="height: 100%; width: 100%"><span id="${this.elementID}_button_textSpan"></span><span id="${this.elementID}_button_imageSpan"></span></button>
                                    </div>
                                </div>
                            </div>`;

        const pageHTMLElement = this.getPageHTMLElement();
        if (pageHTMLElement !== null)
        {
            pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);
            this.properties.renderProperties();

            const buttonElement = document.getElementById(this.elementID + '_button') as HTMLButtonElement;
            buttonElement.addEventListener('click', () => {
                const onClickBehaviour = this.getPropertyValue('onClick');
                if ((onClickBehaviour === 'previous') || (onClickBehaviour === 'next') || (onClickBehaviour === 'end')) {
                    window.dispatchEvent(new CustomEvent('IQB.unit.UnitNavigationRequest', {
                        detail: {'elementID': this.getElementID(),
                                 'navigationTarget': '#' + onClickBehaviour
                    }
                    }));
                }
            });
            this.dispatchNewElementDrawnEvent();
        }
    }

}
