/*
IQB Unit Player Entry Point
*/

// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2019
// license: MIT

import { VO } from '../typescriptCommonFiles/interfaces/iqb.js';

import { Property } from '../typescriptCommonFiles/unit/Properties.js';
import { ObjectWithProperties } from '../typescriptCommonFiles/unit/ObjectWithProperties.js';
import { UnitElement } from '../typescriptCommonFiles/unit/UnitElement.js';
import { UnitPage } from '../typescriptCommonFiles/unit/UnitPage.js';
import { Unit } from '../typescriptCommonFiles/unit/Unit.js';
import { CheckboxElement } from '../typescriptCommonFiles/unit/elementTypes/CheckboxElement.js';
import { AudioElement } from '../typescriptCommonFiles/unit/elementTypes/AudioElement.js';
import { ViewpointElement } from '../typescriptCommonFiles/unit/elementTypes/ViewpointElement.js';
import { MultipleChoiceElement } from '../typescriptCommonFiles/unit/elementTypes/MultipleChoiceElement.js';
import { TextboxElement } from '../typescriptCommonFiles/unit/elementTypes/TextboxElement.js';
import { DropdownElement } from '../typescriptCommonFiles/unit/elementTypes/DropdownElement.js';

/*     IQB specific implementation of the item player       */

interface Variable
{
    // describes the type of elements that can be assigned a variable
    type: 'checkbox' | 'multipleChoice' | 'simpleInput';
}

interface VariablesObject
{
    // describes the object that holds all variables for an item
    [variableName: string]: Variable;
}

interface ResponsesObject
{
    // describes the object that holds all the responses for an item
    [variableName: string]: string;
}

class IQB_ItemPlayer {
    // the main class that implements the IQB ItemPlayer functionality
    private responseType = 'IQBPlayerV1';

    private currentUnit: Unit;

    public sessionId: string;

    private validPageIDs: string[] = [];

    private responsesGiven: 'yes' | 'no' | 'all';
    private environmentVariables: {[environmentVariableName: string]: string} = {};

    constructor (initData: VO.ToPlayer_DataTransfer)    {

        console.log('Constructing IQB_ItemPlayer class...');
        // console.log('Constructing Item Player with the following initData:');
        // console.log(initData);

        if ('sessionId' in initData)
        {
            this.sessionId = initData.sessionId;
            if ('unitDefinition' in initData)
            {
                this.responsesGiven = 'no';

                window.addEventListener('IQB.unit.audioElementEnded', (e) => {
                    // send the signal to the parent that the unit can be left at anytime
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.ChangedDataTransfer',
                        sessionId: this.sessionId,
                        presentationComplete: this.getPresentationCompleteStatus(),
                        restorePoint: this.getRestorePoint()
                    });
                });

                window.addEventListener('IQB.unit.audioElementTick', (e) => {
                    // update restore point data, to save the current location of the audios
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.ChangedDataTransfer',
                        sessionId: this.sessionId,
                        restorePoint: this.getRestorePoint()
                    });
                });

                window.addEventListener('IQB.unit.viewpointViewed', (e) => {
                    // send the signal to the parent that the unit can be left at anytime
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.ChangedDataTransfer',
                        sessionId: this.sessionId,
                        presentationComplete: this.getPresentationCompleteStatus(),
                        restorePoint: this.getRestorePoint()
                    });
                });

                window.addEventListener('IQB.unit.responseGiven', (e) => {
                    // send the signal to the parent that the unit can be left at anytime
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.ChangedDataTransfer',
                        sessionId: this.sessionId,
                        responsesGiven: this.getResponsesGivenStatus(),
                        restorePoint: this.getRestorePoint()
                    });
                });

                // prepare response input events for when a page will be drawn

                window.addEventListener('IQB.unit.newElementDrawn', (e) => {
                    const elementID = e.detail.elementID;
                    this.addResponseInputEvents(elementID);
                });

                window.addEventListener('IQB.unit.navigateToPage', (e) => {
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.PageNavigationRequestedNotification',
                        sessionId: this.sessionId,
                        newPage: e.detail.pageID
                    });
                });

                window.addEventListener('IQB.unit.endTestButtonClicked', (e) => {
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.NavigationRequestedNotification',
                        sessionId: this.sessionId,
                        navigationTarget: '#end'
                    });
                });

                // todo - customizable volume
                /*
                window.addEventListener('IQB.unit.newVolume', (e) => {
                    const newVolume = e.detail.newVolume;
                    this.sendMessageToParent({
                        'type': 'vo.FromPlayer.newVolumeNotification',
                        'sessionId': this.sessionId,
                        'newVolume': newVolume
                    });
                 });
                 */

                // render the item
                // show scrollbars only when needed solution based on idea from https://stackoverflow.com/a/14732488
                document.body.innerHTML = `<div id="pageContainer" style="width: 100%; height: 100%;">
                                                 <div id="unitCanvasContainer" style="width: 100%; height: 100%; background-color: white;">
                                                        <div id="alwaysOnPageContainer" style="">
                                                            <div id="alwaysOnPage" style="">
                                                            </div>
                                                        </div>
                                                        <div id="normalPageContainer" style="">
                                                            <div id="normalPage" style="">
                                                            </div>
                                                        <div>
                                                </div>
                                            </div>
                                          `;
                this.currentUnit = new Unit('normalPage', 'alwaysOnPage');
                this.currentUnit.importDataFromJSON(initData.unitDefinition);

                // load environment variables
                // todo - customizable volume
                /*
                if ('environment' in initData) {
                    if (typeof initData.environment !== 'undefined') {
                        this.environmentVariables = initData.environment;
                        if ('volume' in this.environmentVariables) {
                            // if a volume is given as an environment variable,
                            // set it as the default volume for all audio and video elements
                            this.currentUnit.mapToElements((element: UnitElement) => {
                                if ((element.getElementType() === 'audio') || (element.getElementType() === 'video')) {
                                    element.setPropertyValue('defaultVolume', this.environmentVariables['volume']);
                                }
                            });
                        }
                    }
                }
                */

                // add viewpoint log functionality
                /*
                this.currentUnit.mapToViewpoints((viewpoint: ViewpointElement) => {
                    viewpoint.addIntersectionObserverCallback((entries) => {
                        entries.forEach((entry) => {
                            // console.log(viewpoint.getPropertyValue('name') + ' has been triggered');
                            if (viewpoint.getPropertyValue('sendsLogs') === 'true') {
                                const logEntry: string = 'Viewpoint ' + viewpoint.elementID + ', isBeigViewed=' + entry.isIntersecting + ', time=' + parseInt(entry.time, 10);
                                this.sendMessageToParent({
                                    type: 'vo.FromPlayer.ChangedDataTransfer',
                                    sessionId: this.sessionId,
                                    logEntries: [logEntry]
                                });
                            }
                            // console.log(entry);
                        });
                    });
                });
                */

                // load the item restore point if given
                if (typeof initData.restorePoint === 'string') {
                     this.loadRestorePoint(initData.restorePoint);
                }

                const supportAlwaysOnPositions = ['top', 'left'];
                let alwaysOnPage: UnitPage | undefined;
                this.validPageIDs = [];
                this.currentUnit.getPagesMap().forEach((page: UnitPage) => {
                    const alwaysOnPropertyValue = page.getPropertyValue('alwaysOn');

                    if (supportAlwaysOnPositions.indexOf(alwaysOnPropertyValue) === -1) {
                        // if it isn't an always on page, consider it a valid page
                        this.validPageIDs.push(page.pageID);
                    }
                    else
                    {
                        // if it is an always on page, add it as the latest candidate for an always on page
                        alwaysOnPage = page;
                    }
                });

                let alwaysOnPageShown = false;

                const unitCanvasContainerDiv = document.getElementById('unitCanvasContainer') as HTMLDivElement;
                const alwaysOnPageDiv = document.getElementById('alwaysOnPage') as HTMLDivElement;
                const normalPageDiv = document.getElementById('normalPage') as HTMLDivElement;
                const alwaysOnPageContainerDiv = document.getElementById('alwaysOnPageContainer') as HTMLDivElement;
                const normalPageContainerDiv = document.getElementById('normalPageContainer') as HTMLDivElement;

                if (typeof alwaysOnPage !== 'undefined') {

                    const alwaysOnPagePosition = alwaysOnPage.getPropertyValue('alwaysOn');

                    if (alwaysOnPagePosition === 'top') {

                        alwaysOnPageShown = true;

                        unitCanvasContainerDiv.style.display = 'flex';
                        unitCanvasContainerDiv.style.flexDirection = 'column';

                        alwaysOnPageContainerDiv.style.display = 'inline-block';
                        alwaysOnPageContainerDiv.style.textAlign = 'center';
                        alwaysOnPageContainerDiv.style.overflow = 'auto';
                        alwaysOnPageContainerDiv.style.height = '50%';

                        alwaysOnPageDiv.style.overflow = 'auto';
                        alwaysOnPageDiv.style.display = 'inline-block';

                        normalPageContainerDiv.style.display = 'inline-block';
                        normalPageContainerDiv.style.textAlign = 'center';
                        normalPageContainerDiv.style.overflow = 'auto';
                        normalPageContainerDiv.style.height = '50%';
                        normalPageContainerDiv.style.borderTopColor = 'black';
                        normalPageContainerDiv.style.borderTopWidth = '1px';
                        normalPageContainerDiv.style.borderTopStyle = 'solid';

                        normalPageDiv.style.overflow = 'auto';
                        normalPageDiv.style.display = 'inline-block';
                    }

                    if (alwaysOnPagePosition === 'left') {

                        alwaysOnPageShown = true;

                        unitCanvasContainerDiv.style.display = 'flex';
                        unitCanvasContainerDiv.style.flexDirection = 'row';
                        unitCanvasContainerDiv.style.justifyContent = 'center';

                        alwaysOnPageContainerDiv.style.height = 'auto';
                        alwaysOnPageContainerDiv.style.display = 'inline-block';
                        alwaysOnPageContainerDiv.style.overflow = 'auto';
                        alwaysOnPageContainerDiv.style.flexGrow = '1';

                        alwaysOnPageDiv.style.display = 'inline-block';

                        normalPageContainerDiv.style.display = 'inline-block';
                        normalPageContainerDiv.style.overflow = 'auto';
                        normalPageContainerDiv.style.flexGrow = '1';

                        normalPageDiv.style.display = 'inline-block';

                    }
                }

                if (alwaysOnPageShown === false) {
                    unitCanvasContainerDiv.style.display = 'flex';
                    unitCanvasContainerDiv.style.justifyContent = 'center';

                    alwaysOnPageContainerDiv.style.display = 'none';
                    alwaysOnPageContainerDiv.style.height = '0px';

                    normalPageContainerDiv.style.display = 'inline-block';
                    normalPageContainerDiv.style.overflow = 'auto';
                    normalPageContainerDiv.style.flexGrow = '1';
                    normalPageContainerDiv.style.textAlign = 'center';

                    normalPageDiv.style.display = 'inline-block';


                    /*
                    alwaysOnPageContainerDiv.style.overflow = 'auto';
                    normalPageContainerDiv.style.overflow = 'auto';

                    alwaysOnPageDiv.style.overflow = 'auto';
                    normalPageDiv.style.overflow = 'auto';
                    */

                }

                const currentPage = this.currentUnit.getCurrentPage();
                let currentPageAsString = '';
                if (typeof currentPage !== 'undefined') {
                    currentPageAsString = currentPage.pageID;
                }

                if (this.validPageIDs.length > 0) {
                    if (currentPageAsString !== this.validPageIDs[0]) {
                        this.currentUnit.navigateToPage(this.validPageIDs[0]);
                        currentPageAsString = this.validPageIDs[0];
                    }
                }

                // currentPage notification is placed here, so as not to report the currentPage twice when rendering
                window.addEventListener('IQB.unit.newPageDrawn', (e) => {
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.ChangedDataTransfer',
                        sessionId: this.sessionId,
                        currentPage: e.detail.pageID,
                        presentationComplete: this.getPresentationCompleteStatus(),
                        restorePoint: this.getRestorePoint()
                    });
                });
                // end of currentPage notification

                console.log('IQB Item Player: sent the following validPages: ');
                console.log(this.validPageIDs);

                this.sendMessageToParent({
                    'type': 'vo.FromPlayer.StartedNotification',
                    'sessionId': this.sessionId,
                    'currentPage': currentPageAsString,
                    'validPages': this.validPageIDs,
                    'presentationComplete': this.getPresentationCompleteStatus(),
                    'responsesGiven': this.getResponsesGivenStatus()
                });

                // send the first restore point, to mark that the unit has been played
                this.sendMessageToParent({
                    type: 'vo.FromPlayer.ChangedDataTransfer',
                    sessionId: this.sessionId,
                    restorePoint: this.getRestorePoint()
                });
           }
           else
           {
            throw(new Error('IQB Item Player: no unitDefinition provided in the initialization data'));
           }
        }
        else
        {
            throw(new Error('IQB Item Player: no sessionId provided in the initialization data'));
        }
    }

    private getPresentationCompleteStatus(): 'yes' | 'no' {
        let presentationComplete: 'yes' | 'no' = 'yes';

        // check if there are unfinished audio elements that are part of the presentation
        this.currentUnit.mapToElements((element) => {
            if (element.getElementType() === 'audio') {
                const audioElement = element as AudioElement;
                if (audioElement.properties.hasProperty('partOfPresentation'))
                {
                    if (audioElement.getPropertyValue('partOfPresentation') === 'true')
                    {
                        // console.log('Presentation check. Detected ' + element.elementID + ' as part of the presentation.');
                        // console.log('Has the audio been played yet: ' + element.getPropertyValue('playedOnce'));

                        if (audioElement.playedOnce === false)
                        {
                            presentationComplete = 'no';
                            console.log('Detected unfinished audio ' + audioElement.elementID + '. Therefore the presentation is not complete.');
                        }
                    }
                }
            }
        });
        // end of checking if there are unfinished audio elements that are part of the presentation

        // check if there are unviewed viewpoint elements that are part of the presentation
        this.currentUnit.mapToElements((element) => {
            if (element.getElementType() === 'viewpoint') {
                const viewpoint = element as ViewpointElement;

                if (viewpoint.properties.hasProperty('partOfPresentation'))
                {
                    if (viewpoint.getPropertyValue('partOfPresentation') === 'true')
                    {
                        // console.log('Presentation check. Detected ' + element.elementID + ' as part of the presentation.');

                        if (viewpoint.viewed === false)
                        {
                            presentationComplete = 'no';
                            console.log('Detected unviewed viewpoint ' + element.elementID + '. Therefore the presentation is not complete.');
                        }
                    }
                }
            }
        });
        // end of checking if there are unviewed viewpoint elements that are part of the presentation

        // check if all pages have been viewed
        this.currentUnit.getPagesMap().forEach((page) => {
            if (page.viewed === false) {
                presentationComplete = 'no';
                console.log('Detected unviewed page ' + page.pageID + '. Therefore the presentation is not complete.');
            }
        });
        // end of checking if all pages have been viewed
        return presentationComplete;
    }

    private getResponsesGivenStatus(): 'yes' | 'no' | 'all' {
        // checkboxes must at least be seen
        // multiple choices, at least one in the groupName must be selected
        // dropdown elements, one of the options must be selected
        // textbox, something must be typed

        let allResponsesGiven: boolean = true;
        let aResponseGiven: boolean = false;

        let responsesGiven: 'yes' | 'no' | 'all' = 'no';

        this.currentUnit.mapToElements((element) => {
            if (element.getElementType() === 'checkbox') {
                const checkboxElement = element as CheckboxElement;
                if (checkboxElement.responseGiven) {
                    aResponseGiven = true;
                }
                if (checkboxElement.responseGiven === false) {
                    allResponsesGiven = false;
                }
            }

            if (element.getElementType() === 'multipleChoice') {
                const multipleChoiceElement = element as MultipleChoiceElement;
                if (multipleChoiceElement.responseGiven) {
                    aResponseGiven = true;
                }
                if (multipleChoiceElement.responseGiven === false) {
                    allResponsesGiven = false;
                }
            }

            if (element.getElementType() === 'textbox') {
                const textboxElement = element as TextboxElement;
                if (textboxElement.responseGiven) {
                    aResponseGiven = true;
                }
                if (textboxElement.responseGiven === false) {
                    allResponsesGiven = false;
                }
            }

            if (element.getElementType() === 'dropdown') {
                const dropdownElement = element as DropdownElement;
                if (dropdownElement.responseGiven) {
                    aResponseGiven = true;
                }
                if (dropdownElement.responseGiven === false) {
                    allResponsesGiven = false;
                }
            }

        });

        if (allResponsesGiven) {
            responsesGiven = 'all';
        }
        else
        {
            if (aResponseGiven) {
                responsesGiven = 'yes';
            }
            else {
                responsesGiven = 'no';
            }
        }

        return responsesGiven;
    }


    private sendMessageToParent(message: VO.UnitPlayerMessageData)
    {
        parent.window.postMessage(message, '*');
    }

    private addResponseInputEvents(elementID: string)
    {
        // this function initializes the event listeners, which are used to identify when new data is inputed by the test taker
        // when new data from the testee is available, send it to the test controller via the sendMessageToParent() function,
        // using the 'vo.FromPlayer.ChangedDataTransfer' postMessage type

        // console.log('IQB Item Player: adding response input events');
        const element = this.currentUnit.element(elementID);
        if (typeof element !== 'undefined') {
            // if the element that was drawn exists in the unit (this should always be the case)

            const elementType = element.getElementType();
            if (elementType === 'checkbox') {

                const checkboxHTMLElement = document.getElementById(elementID + '_checkbox') as HTMLInputElement;

                checkboxHTMLElement.addEventListener('change', (e) => {
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.ChangedDataTransfer',
                        sessionId: this.sessionId,
                        restorePoint: this.getRestorePoint(),
                        response: this.getResponses(),
                        responseType: this.responseType,
                    });
                });
            }

            if (elementType === 'multipleChoice') {
                const multipleChoiceHTMLElement = document.getElementById(elementID + '_multipleChoice') as HTMLInputElement;

                multipleChoiceHTMLElement.addEventListener('change', (e) => {
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.ChangedDataTransfer',
                        sessionId: this.sessionId,
                        restorePoint: this.getRestorePoint(),
                        response: this.getResponses(),
                        responseType: this.responseType,
                    });
                });
            }

            if (elementType === 'dropdown') {
                const dropdownHTMLElement = document.getElementById(elementID + '_select') as HTMLSelectElement;

                dropdownHTMLElement.addEventListener('change', (e) => {
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.ChangedDataTransfer',
                        sessionId: this.sessionId,
                        restorePoint: this.getRestorePoint(),
                        response: this.getResponses(),
                        responseType: this.responseType,
                    });
                });
            }

            if (elementType === 'textbox') {
                const textboxHTMLElement = document.getElementById(elementID + '_textbox') as HTMLInputElement;

                textboxHTMLElement.addEventListener('keyup',  (e) => {
                    this.sendMessageToParent({
                        type: 'vo.FromPlayer.ChangedDataTransfer',
                        sessionId: this.sessionId,
                        restorePoint: this.getRestorePoint(),
                        response: this.getResponses(),
                        responseType: this.responseType,
                    });
                });
            }
        }

    }

    getRestorePoint(): string {
        // this function computes the restore point at a certain moment for the item, in the form of a javascript object
        // it then stringifies the object into JSON and returns the JSON string
        const unitStatus: any = {};
        unitStatus.responsesGiven = {};
        unitStatus.pagesViewed = {};

        this.currentUnit.mapToElements((element: UnitElement) => {
                const elementID = element.getElementID();
                const elementType = element.getElementType();

                if (elementType === 'checkbox') {
                    const checkboxElement = element as CheckboxElement;

                    unitStatus[elementID] = checkboxElement.getPropertyValue('checked');
                    unitStatus.responsesGiven[elementID] = checkboxElement.responseGiven;
                }

                if (elementType === 'multipleChoice') {
                    const multipleChoiceElement = element as MultipleChoiceElement;

                    unitStatus[elementID] = multipleChoiceElement.getPropertyValue('checked');
                    unitStatus.responsesGiven[elementID] = multipleChoiceElement.responseGiven;
                }

                if (elementType === 'dropdown') {
                    const dropdownElement = element as DropdownElement;

                    unitStatus[elementID] = dropdownElement.getPropertyValue('selectedOption');
                    unitStatus.responsesGiven[elementID] = dropdownElement.responseGiven;
                }

                if (elementType === 'textbox') {
                    const textboxElement = element as TextboxElement;

                    unitStatus[elementID] = textboxElement.getPropertyValue('text');
                    unitStatus.responsesGiven[elementID] = textboxElement.responseGiven;
                }

                if (elementType === 'audio') {
                    // if the element is of the audio type, mark it as already played
                    unitStatus[elementID] = -1;
                }
        });

        this.currentUnit.mapToViewpoints((viewpoint: ViewpointElement) => {
            unitStatus[viewpoint.elementID] = viewpoint.viewed;
        });

        this.currentUnit.getPagesMap().forEach((page) => {
            unitStatus.pagesViewed[page.pageID] = page.viewed;
        });

        return JSON.stringify(unitStatus);
    }

    private loadRestorePoint(restorePoint: string): boolean
    {
        //  loads the restore point contents into the item
        //  receives as input a restorePoint JSON string
        console.log('Unit Player: loading restore point...');
        console.log(restorePoint);
        try
        {
            if (restorePoint !== null) {
                if (restorePoint.length > 0) {
                    const unitStatus: any = JSON.parse(restorePoint);

                    // update each HTML Input Element with the value available in its status
                    this.currentUnit.mapToElements((element: UnitElement) => {
                            const elementID = element.getElementID();
                            const elementType = element.getElementType();

                            if (elementID in unitStatus)
                            {
                                console.log('Loading restore point data into ' + elementID +
                                            ' (of type ' + elementType + '): ' + unitStatus[elementID]);

                                let responseGiven = false;
                                if ('responsesGiven' in unitStatus) {
                                    if (elementID in unitStatus.responsesGiven) {
                                        responseGiven = unitStatus.responsesGiven[elementID];
                                    }
                                }

                                if (elementType === 'checkbox') {
                                    const checkboxElement = element as CheckboxElement;

                                    checkboxElement.setPropertyValue('checked', unitStatus[elementID]);
                                    checkboxElement.responseGiven = responseGiven;
                                }

                                if (elementType === 'multipleChoice') {
                                    const multiplechoiceElement = element as MultipleChoiceElement;

                                    multiplechoiceElement.setPropertyValue('checked', unitStatus[elementID]);
                                    multiplechoiceElement.responseGiven = responseGiven;
                                }

                                if (elementType === 'dropdown') {
                                    const dropdownElement = element as DropdownElement;

                                    dropdownElement.setPropertyValue('selectedOption', unitStatus[elementID]);
                                    dropdownElement.responseGiven = responseGiven;
                                }

                                if (elementType === 'textbox') {
                                    const textboxElement = element as TextboxElement;

                                    textboxElement.setPropertyValue('text', unitStatus[elementID]);
                                    textboxElement.responseGiven = responseGiven;
                                }

                                if (elementType === 'audio') {
                                    const audioElement = element as AudioElement;
                                    if (unitStatus[elementID] === -1)
                                    {
                                        audioElement.setPropertyValue('alreadyPlayed', 'true');
                                        audioElement.playedOnce = true;
                                        console.log('Set alreadyPlayed property to true for element ' + elementID);
                                    }
                                }

                                if (elementType === 'viewpoint') {
                                    const viewpointElement = element as ViewpointElement;
                                    console.log('Loading restore point data into viewpoint ' + viewpointElement.elementID);
                                    if (unitStatus[elementID]) {
                                        viewpointElement.viewed = true;
                                    }
                                    else
                                    {
                                        viewpointElement.viewed = false;
                                    }
                                }

                                if (element.getIsDrawn()) {
                                    // console.log(elementID + ' detected as drawn during restore point load; re-rendering it...');
                                    // if the element is currently drawn on the screen, also re-render it with the updated properties
                                    element.render();
                                }
                            }

                        });

                        // load pages viewed info
                        if ('pagesViewed' in unitStatus) {
                            this.currentUnit.getPagesMap().forEach((page) => {
                                page.viewed = unitStatus.pagesViewed[page.pageID];
                            });
                        }
                        // finished loading pages viewed info

                        this.sendMessageToParent({
                            type: 'vo.FromPlayer.ChangedDataTransfer',
                            sessionId: this.sessionId,
                            presentationComplete: this.getPresentationCompleteStatus(),
                            responsesGiven: this.getResponsesGivenStatus()
                        });
                }
            }
            return true;
        }
        catch (e)
        {
            console.error(e);
            return false;
        }
    }

    getResponses(): string {
        // computes the responses based on the current state of an item
        const responses: ResponsesObject = {};

        this.currentUnit.mapToElements((element: UnitElement) => {
                const elementID = element.getElementID();
                const elementType = element.getElementType();

                if ((elementType === 'checkbox') || (elementType === 'multipleChoice') ||
                    (elementType === 'dropdown') || (elementType === 'textbox'))
                {
                    if (elementType === 'checkbox') {
                        responses[elementID] = element.getPropertyValue('checked');
                    }

                    if (elementType === 'multipleChoice') {
                        responses[elementID] = element.getPropertyValue('checked');
                    }

                    if (elementType === 'dropdown') {
                        responses[elementID] = element.getPropertyValue('selectedOption');
                    }

                    if (elementType === 'textbox') {
                        responses[elementID] = element.getPropertyValue('text');
                    }
                }
        });

        this.currentUnit.mapToViewpoints((viewpoint: ViewpointElement) => {
            if (viewpoint.getPropertyValue('sendsResponses') === 'true') {
                if (viewpoint.viewed) {
                    responses[viewpoint.elementID] = 'viewed';
                }
                else {
                    responses[viewpoint.elementID] = 'not viewed';
                }
            }
        });

        return JSON.stringify(responses);


        // old code
        // for (const variableName in this.variables) // go variable by variable, and look for their value
        // {
        //     if (variableName in this.variables) {
        //         const variableType = this.variables[variableName].type;
        //         if (variableType === 'simpleInput')
        //         {
        //             responses[variableName] = ''; // if no response is found variable is set as ""
        //             const matchingElements = document.getElementsByName(variableName);
        //             if (matchingElements.length > 0) {
        //                 responses[variableName] = (matchingElements[0] as HTMLInputElement).value;
        //             }
        //         }
        //         else if ((variableType === 'checkbox') ||  (variableType === 'multipleChoice'))
        //         {
        //             responses[variableName] = '-1'; // if no response is found variable is set as -1
        //             const matchingElements = document.getElementsByName(variableName);
        //             matchingElements.forEach((matchingElement) => {
        //                 if ((matchingElement as HTMLInputElement).checked) {
        //                     responses[variableName] = (matchingElement as HTMLInputElement).value;
        //                 }
        //             });
        //         }
        //     }
        // }
    }

    navigateToPage(pageID: string): void {
        this.currentUnit.navigateToPage(pageID);
    }

    end(): boolean {
        // makeshift unload item function that probably doesn't completely and most efficiently dispose of an item
        // made to serve as an example for an end function

       let cleaningLoopsDone = 0;
       while ((document.body.childElementCount > 0) && (cleaningLoopsDone < 10000)) {
            document.body.childNodes.forEach(function (childNode) {
                document.body.removeChild(childNode);
            });
            cleaningLoopsDone++;
       }

       document.body.innerHTML = '';

       return true;
     }

  }

  let itemPlayerInstance: IQB_ItemPlayer | undefined = undefined;

  const DataTransferHandler = (event: MessageEvent) => {
    const initData = <VO.ToPlayer_DataTransfer>event.data;

    itemPlayerInstance = new IQB_ItemPlayer(initData);
  };

  const pageNavigationRequestHandler = (event: MessageEvent) => {
    if (typeof itemPlayerInstance !== 'undefined') {
        if ('sessionId' in event.data) {
            if (itemPlayerInstance.sessionId === event.data.sessionId) {
                if ('newPage' in event.data) {
                    itemPlayerInstance.navigateToPage(event.data.newPage);
                }
                else
                {
                    console.error('IQB Item Player Error: newPage not specified in the PageNavigationRequest');
                }
            }
            else
            {
                console.error('IQB Item Player Error: invalid sessionId. Expected ' + itemPlayerInstance.sessionId +
                              ' but received ' + event.data.sessionId);
            }
        }
        else {
            console.error('IQB Item Player Error: no sessionId provided in the page navigation request message');
        }
    }
    else {
        console.error('IQB Item Player Error: no Item Player initialized, so cannot navigate to new page');
    }
  };


  const postMessageListener = (event: MessageEvent) =>
  {
    console.log('The IQB Unit Player has received a message.');
    // console.log(event);

    if ('data' in event) {
        // event.data is set
        if ('type' in event.data) {
            if (event.data.type === 'vo.ToPlayer.DataTransfer') {
                DataTransferHandler(event);
            }
            else if (event.data.type === 'vo.ToPlayer.PageNavigationRequest') {
                pageNavigationRequestHandler(event);
            }
            else  {
                console.error('IQB Unit Player Error: the message type was not recognized');
            }
        }
        else {
            console.error('IQB Unit Player Error: Message does not contain event.data.type');
        }
    }
    else {
        console.error('IQB Unit Player Error: event.data is not set');
    }
  };

  window.addEventListener('message', postMessageListener);

  const readyNotificationMessage: VO.FromPlayer_ReadyNotification = {
      'type': 'vo.FromPlayer.ReadyNotification',
      'version': 1
  };
  parent.window.postMessage(readyNotificationMessage, '*');
