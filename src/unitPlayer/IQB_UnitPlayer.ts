import { VO } from '../typescriptCommonFiles/interfaces/iqb';
import { UnitElement } from '../typescriptCommonFiles/unit/UnitElement';
import { UnitPage } from '../typescriptCommonFiles/unit/UnitPage';
import { Unit } from '../typescriptCommonFiles/unit/Unit';
import { CheckboxElement } from '../typescriptCommonFiles/unit/elementTypes/CheckboxElement';
import { AudioElement } from '../typescriptCommonFiles/unit/elementTypes/AudioElement';
import { ViewpointElement } from '../typescriptCommonFiles/unit/elementTypes/ViewpointElement';
import { MultipleChoiceElement } from '../typescriptCommonFiles/unit/elementTypes/MultipleChoiceElement';
import { TextboxElement } from '../typescriptCommonFiles/unit/elementTypes/TextboxElement';
import { MultilineTextboxElement } from '../typescriptCommonFiles/unit/elementTypes/MultilineTextboxElement';
import { DropdownElement } from '../typescriptCommonFiles/unit/elementTypes/DropdownElement';
import KeyValuePairString = VO.KeyValuePairString;
import UnitState = VO.UnitState;

const unitDataType = 'IQBVisualUnitPlayerV2.1.0';

class IQB_UnitPlayer {
    private readonly currentUnit: Unit | null = null;
    private readonly validPageIDs: string[] = [];
    private suppressDebugInfo = true;
    public sessionId = '';
    public unitLoaded: boolean;
    get validPagesDict(): KeyValuePairString {
        let myReturn: KeyValuePairString = {};
        this.validPageIDs.forEach((pageId: string) => {
            myReturn[pageId] = pageId
        });
        return myReturn
    }

    constructor (initData: VO.StartCommandData)    {
        this.unitLoaded = false;
        if ('sessionId' in initData) {
            this.sessionId = initData.sessionId;
            if ('unitDefinition' in initData) {
                // prepare response input events for when a page will be drawn

                // render the unit
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

                // load the unit restore point if given
                if (initData.unitState) {
                    if (initData.unitState.dataParts) {
                        this.restoreUnitState(initData.unitState.dataParts);
                    }
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

                if (!alwaysOnPageShown) {
                    unitCanvasContainerDiv.style.display = 'flex';
                    unitCanvasContainerDiv.style.justifyContent = 'center';

                    alwaysOnPageContainerDiv.style.display = 'none';
                    alwaysOnPageContainerDiv.style.height = '0px';

                    normalPageContainerDiv.style.display = 'inline-block';
                    normalPageContainerDiv.style.overflow = 'auto';
                    normalPageContainerDiv.style.flexGrow = '1';
                    normalPageContainerDiv.style.textAlign = 'center';

                    normalPageDiv.style.display = 'inline-block';
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

                this.unitLoaded = true;

                // once the unit has loaded, start listening for changes

                // listen for events that signal changes in the presentation status
                if (initData.playerConfig) {
                    if (initData.playerConfig.stateReportPolicy !== 'none') {
                        window.addEventListener('IQB.unit.viewpointViewed', () => {
                            // send the signal to the parent that the unit can be left at anytime
                            parent.window.postMessage({
                                type: 'vopStateChangedNotification',
                                sessionId: this.sessionId,
                                timeStamp: Date.now().toString(),
                                unitState: <UnitState>{
                                    presentationProgress: this.getPresentationProgress(),
                                    responseProgress: this.getResponseProgress()
                                }
                            }, '*');
                        });

                        window.addEventListener('IQB.unit.audioElementEnded', () => {
                            // send the signal to the parent that the unit can be left at anytime
                            parent.window.postMessage({
                                type: 'vopStateChangedNotification',
                                sessionId: this.sessionId,
                                timeStamp: Date.now().toString(),
                                unitState: <UnitState>{
                                    presentationProgress: this.getPresentationProgress(),
                                    responseProgress: this.getResponseProgress(),
                                    dataParts: this.getUnitStateData(),
                                    unitStateDataType: unitDataType
                                }
                            }, '*');
                        });

                        // end of listening for events that signal a change in the presentation status

                        // listen for events that signal a change in the response status

                        window.addEventListener('IQB.unit.responseGiven', () => {
                            // send the signal to the parent that the unit can be left at anytime
                            parent.window.postMessage({
                                type: 'vopStateChangedNotification',
                                sessionId: this.sessionId,
                                timeStamp: Date.now().toString(),
                                unitState: <UnitState>{
                                    presentationProgress: this.getPresentationProgress(),
                                    responseProgress: this.getResponseProgress(),
                                    dataParts: this.getUnitStateData(),
                                    unitStateDataType: unitDataType
                                }
                            }, '*');
                        });
                    }
                    if (initData.playerConfig.logPolicy === 'debug') {
                        this.suppressDebugInfo = false;
                        window.addEventListener('IQB.unit.debugMessage', (e) => {
                            this.sendDebugMessage((e as CustomEvent).detail.msgType, (e as CustomEvent).detail.msg)
                        });
                    }
                }

                // end of listening for events that signal a change in the response status

                // prepare to handle navigation requests that come from inside the unit player
                window.addEventListener('IQB.unit.navigateToPage', () => {
                    /* this.sendMessageToParent({
                        type: 'vo.FromPlayer.PageNavigationRequest',
                        sessionId: this.sessionId,
                        newPage: (e as CustomEvent).detail.pageID
                    });
                     */
                    // TODO PageNavigationRequest; by now, the unit cannot send page nagigation requests
                    this.sendDebugMessage('warn', 'IQB Unit Player Warning: Page Navigation Request not implemented')
                });

                window.addEventListener('IQB.unit.UnitNavigationRequest', (e) => {
                    parent.window.postMessage({
                        type: 'vopUnitNavigationRequestedNotification',
                        sessionId: this.sessionId,
                        targetRelative: (e as CustomEvent).detail.navigationTarget
                    }, '*');
                });
                // end of preparing to handle navigation requests that come from inside the unit player

                this.sendDebugMessage('info', 'IQB Unit Player: sent the following validPages: ');
                this.sendDebugMessage('info', this.validPageIDs);

                parent.window.postMessage({
                    type: 'vopStateChangedNotification',
                    sessionId: this.sessionId,
                    timeStamp: Date.now().toString(),
                    unitState: <UnitState>{
                        responseProgress: this.getResponseProgress(),
                        presentationProgress: this.getPresentationProgress()
                    },
                    playerState: {
                        state: 'running',
                        currentPage: currentPageAsString,
                        validPages: this.validPagesDict
                    }
                }, '*');
           } else {
             this.sendDebugMessage('warn', 'IQB Unit Player: no unitDefinition provided in the initialization data');
           }
        } else {
            this.sendDebugMessage('error', 'IQB Unit Player: no sessionId provided in the initialization data');
        }
    }

    navigateToPage(pageID: string): void {
        if (this.unitLoaded && this.currentUnit) {
            this.currentUnit.navigateToPage(pageID);
            parent.window.postMessage({
                type: 'vopStateChangedNotification',
                sessionId: this.sessionId,
                timeStamp: Date.now().toString(),
                playerState: {
                    state: 'running',
                    currentPage: pageID,
                    validPages: this.validPagesDict
                }
            }, '*');
        }
        else {
            this.sendDebugMessage('error', 'IQB Unit Player: cannot navigate to page ' + pageID + '. The current unit has not yet finished loading.');
        }
    }

    private getPresentationProgress(): 'none' | 'some' | 'complete' {
        let thereArePresentedElements = false;
        let thereAreUnPresentedElements = false;
        if (this.currentUnit) {
            this.currentUnit.mapToElements((element) => {
                if (!thereAreUnPresentedElements || !thereArePresentedElements) {
                    if (element.getElementType() === 'audio') {
                        const audioElement = element as AudioElement;
                        if (audioElement.properties.hasProperty('partOfPresentation')) {
                            if (audioElement.getPropertyValue('partOfPresentation') === 'true') {
                                if (audioElement.playedOnce) {
                                    thereArePresentedElements = true;
                                } else {
                                    thereAreUnPresentedElements = true;
                                }
                            }
                        }
                    } else if (element.getElementType() === 'viewpoint') {
                        const viewpoint = element as ViewpointElement;
                        if (viewpoint.properties.hasProperty('partOfPresentation')) {
                            if (viewpoint.getPropertyValue('partOfPresentation') === 'true') {
                                // console.log('Presentation check. Detected ' + element.elementID + ' as part of the presentation.');
                                if (viewpoint.viewed) {
                                    thereArePresentedElements = true;
                                } else {
                                    thereAreUnPresentedElements = true;
                                }
                            }
                        }
                    }
                }
            });
            if (!thereAreUnPresentedElements || !thereArePresentedElements) {
                this.currentUnit.getPagesMap().forEach((page) => {
                    if (page.viewed) {
                        thereArePresentedElements = true;
                    } else {
                        thereAreUnPresentedElements = true;
                    }
                });
            }
        }
        if (thereArePresentedElements) {
            return thereAreUnPresentedElements ? 'some' : 'complete';
        } else {
            return 'none';
        }
    }

    private getResponseProgress(): 'none' | 'some' | 'complete' {
        // checkboxes must at least be seen
        // multiple choices, at least one in the groupName must be selected
        // dropdown elements, one of the options must be selected
        // textbox, something must be typed
        let thereAreRespondedElements = false;
        let thereAreUnRespondedElements = false;

        if (this.currentUnit) {
            this.currentUnit.mapToElements((element) => {
                if (!thereAreRespondedElements || !thereAreUnRespondedElements) {
                    switch (element.getElementType()) {
                        case 'checkbox':
                            if (element.getPropertyValue('disabled') === 'false') {
                                const checkboxElement = element as CheckboxElement;
                                if (checkboxElement.responseGiven) {
                                    thereAreRespondedElements = true;
                                } else {
                                    thereAreUnRespondedElements = true;
                                }
                            }
                            break;
                        case 'multipleChoice':
                            if (element.getPropertyValue('disabled') === 'false') {
                                const multipleChoiceElement = element as MultipleChoiceElement;
                                if (multipleChoiceElement.responseGiven) {
                                    thereAreRespondedElements = true;
                                } else {
                                    thereAreUnRespondedElements = true;
                                }
                            }
                            break;
                        case 'textbox':
                            if (element.getPropertyValue('disabled') === 'false') {
                                const textboxElement = element as TextboxElement;
                                if (textboxElement.responseGiven) {
                                    thereAreRespondedElements = true;
                                } else {
                                    thereAreUnRespondedElements = true;
                                }
                            }
                            break;
                        case 'multilineTextbox':
                            if (element.getPropertyValue('disabled') === 'false') {
                                const textboxElement = element as MultilineTextboxElement;
                                if (textboxElement.responseGiven) {
                                    thereAreRespondedElements = true;
                                } else {
                                    thereAreUnRespondedElements = true;
                                }
                            }
                            break;
                        case 'dropdown':
                            if (element.getPropertyValue('disabled') === 'false') {
                                const dropdownElement = element as DropdownElement;
                                if (dropdownElement.responseGiven) {
                                    thereAreRespondedElements = true;
                                } else {
                                    thereAreUnRespondedElements = true;
                                }
                            }
                            break;
                    }
                }
            });
        }
        if (thereAreRespondedElements) {
            return thereAreUnRespondedElements ? 'some' : 'complete';
        } else {
            return 'none';
        }
    }

    private getUnitStateData(): KeyValuePairString {
        // this function computes the restore point at a certain moment for the unit, in the form of a javascript object
        // it then stringifies the object into JSON and returns the JSON string
        const unitStatus: any = {};
        unitStatus.responsesGiven = {};
        unitStatus.pagesViewed = {};

        if (this.currentUnit) {
            this.currentUnit.mapToElements((element: UnitElement) => {
                const elementID = element.getElementID();
                switch (element.getElementType()) {
                    case 'checkbox':
                        const checkboxElement = element as CheckboxElement;
                        unitStatus[elementID] = checkboxElement.getPropertyValue('checked');
                        unitStatus.responsesGiven[elementID] = checkboxElement.responseGiven;
                        break;
                    case 'multipleChoice':
                        const multipleChoiceElement = element as MultipleChoiceElement;
                        unitStatus[elementID] = multipleChoiceElement.getPropertyValue('checked');
                        unitStatus.responsesGiven[elementID] = multipleChoiceElement.responseGiven;
                        break;
                    case 'dropdown':
                        const dropdownElement = element as DropdownElement;
                        unitStatus[elementID] = dropdownElement.getPropertyValue('selectedOption');
                        unitStatus.responsesGiven[elementID] = dropdownElement.responseGiven;
                        break;
                    case 'textbox':
                        const textboxElement = element as TextboxElement;
                        unitStatus[elementID] = textboxElement.getPropertyValue('text');
                        unitStatus.responsesGiven[elementID] = textboxElement.responseGiven;
                        break;
                    case 'multilineTextbox':
                        const multiTextboxElement = element as MultilineTextboxElement;
                        unitStatus[elementID] = multiTextboxElement.getPropertyValue('text');
                        unitStatus.responsesGiven[elementID] = multiTextboxElement.responseGiven;
                        break;
                    case 'audio':
                        // if the element is of the audio type, mark it as already played
                        unitStatus[elementID] = -1;
                        break;
                }
            });
            this.currentUnit.mapToViewpoints((viewpoint: ViewpointElement) => {
                unitStatus[viewpoint.elementID] = viewpoint.viewed;
            });
            this.currentUnit.getPagesMap().forEach((page) => {
                unitStatus.pagesViewed[page.pageID] = page.viewed;
            });
        }
        let allResponses: KeyValuePairString = {};
        allResponses['all'] = JSON.stringify(unitStatus);
        return allResponses;
    }

    private restoreUnitState(allResponses: KeyValuePairString): boolean  {
        //  loads the restore point contents into the unit
        //  receives as input a restorePoint JSON string
        if (allResponses && allResponses.hasOwnProperty('all') && this.currentUnit) {
            const restorePoint = allResponses['all'];
            try {
                if (restorePoint !== null) {
                    if (restorePoint.length > 0) {
                        const unitStatus: any = JSON.parse(restorePoint);

                        // update each HTML Input Element with the value available in its status
                        this.currentUnit.mapToElements((element: UnitElement) => {
                            const elementID = element.getElementID();
                            if (elementID in unitStatus) {
                                let responseGiven = false;
                                if ('responsesGiven' in unitStatus) {
                                    if (elementID in unitStatus.responsesGiven) {
                                        responseGiven = unitStatus.responsesGiven[elementID];
                                    }
                                }
                                switch (element.getElementType()) {
                                    case 'checkbox':
                                        const checkboxElement = element as CheckboxElement;
                                        checkboxElement.setPropertyValue('checked', unitStatus[elementID]);
                                        checkboxElement.responseGiven = responseGiven;
                                        break;
                                    case 'multipleChoice':
                                        const multiplechoiceElement = element as MultipleChoiceElement;
                                        multiplechoiceElement.setPropertyValue('checked', unitStatus[elementID]);
                                        multiplechoiceElement.responseGiven = responseGiven;
                                        break;
                                    case 'dropdown':
                                        const dropdownElement = element as DropdownElement;
                                        dropdownElement.setPropertyValue('selectedOption', unitStatus[elementID]);
                                        dropdownElement.responseGiven = responseGiven;
                                        break;
                                    case 'textbox':
                                        const textboxElement = element as TextboxElement;
                                        textboxElement.setPropertyValue('text', unitStatus[elementID]);
                                        textboxElement.responseGiven = responseGiven;
                                        break;
                                    case 'multilineTextbox':
                                        const multiTextboxElement = element as MultilineTextboxElement;
                                        multiTextboxElement.setPropertyValue('text', unitStatus[elementID]);
                                        multiTextboxElement.responseGiven = responseGiven;
                                        break;
                                    case 'audio':
                                        const audioElement = element as AudioElement;
                                        if (unitStatus[elementID] === -1) {
                                            if (audioElement.getPropertyValue('playOnlyOnce') === 'true') {
                                                audioElement.setPropertyValue('alreadyPlayed', 'true');
                                                audioElement.playedOnce = true;
                                                // console.log('Set alreadyPlayed property to true for element ' + elementID);
                                            }
                                        }
                                        break;
                                    case 'viewpoint':
                                        const viewpointElement = element as ViewpointElement;
                                        viewpointElement.viewed = !!unitStatus[elementID];
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
                    }
                }
            } catch (e) {
                console.error(e);
                return false;
            }
        }
        return true;
    }

    sendDebugMessage(msgType: 'info' | 'warn' | 'error', msg: any) {
        // TODO do not console... here; instead send log msg to host
        switch (msgType) {
            case 'info':
                if (!this.suppressDebugInfo) {
                    console.log(msg)
                }
                break;
            case 'warn':
                console.warn(msg);
                break;
            case 'error':
                console.error(msg);
                break;
        }
    }
} // end of class IQB_UnitPlayer

// the code below handles the processing of postMessages received from the Test Controller

let unitPlayerInstance: IQB_UnitPlayer | undefined = undefined;

window.addEventListener('message', (event: MessageEvent) => {
  if ('data' in event) {
      if ('type' in event.data) {
          if (event.data.type === 'vopStartCommand') {
              unitPlayerInstance = new IQB_UnitPlayer(event.data);
          } else if ((event.data.type === 'vopPageNavigationCommand') && unitPlayerInstance) {
              if (unitPlayerInstance.sessionId === event.data.sessionId) {
                  if ('target' in event.data) {
                      unitPlayerInstance.navigateToPage(event.data.target);
                  } else {
                      console.error('IQB Unit Player Error: target page"' + event.data.target + '" invalid in vopPageNavigationCommand');
                  }
              } else {
                  console.error('IQB Unit Player Error: invalid sessionId. Expected ' + unitPlayerInstance.sessionId +
                      ' but received ' + event.data.sessionId);
              }
          } else {
              console.error('IQB Unit Player Error: message type "' + event.data.type + '" not supported');
          }
      } else {
          console.error('IQB Unit Player Error: Message does not contain event.data.type');
      }
  } else {
      console.error('IQB Unit Player Error: event.data is not set');
  }
});

const notifyFocusVisibilityChange = (hasFocus: boolean) => {
    parent.window.postMessage({
        'type': 'vopWindowFocusChangedNotification',
        'timeStamp': Date.now().toString(),
        'hasFocus': hasFocus
    }, '*');
};
window.addEventListener('blur', () => {
    notifyFocusVisibilityChange(document.hasFocus());
});
window.addEventListener('focus', () => {
    notifyFocusVisibilityChange( document.hasFocus());
});


parent.window.postMessage({
  'type': 'vopReadyNotification',
  'apiVersion': '2.1.0'
}, '*');

