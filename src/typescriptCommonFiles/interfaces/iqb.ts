/* interface

This module describes a common interface  that all IQB Unit Authoring Tools and Players share

*/

// www.IQB.hu-berlin.de
// Martin Mechtel, Dan Bărbulescu, Andrei Stroescu
// 2019
// license: MIT

export namespace VO {

    // Unit Authoring

    export interface FromAuthoringModule_ReadyNotification {
        // Unit Authoring Module -> Host
        // Announcing Load Complete

        type: 'vo.FromAuthoringModule.ReadyNotification';
    }

    export interface ToAuthoringModule_DataTransfer {
        // Host -> Unit Authoring Module
        // Answering 'vo.FromUnitAuthoring.ReadyNotification'

        type: 'vo.ToAuthoringModule.DataTransfer';
        sessionId: string;
        unitDefinition: string;
    }

    export interface FromAuthoringModule_ChangedNotification {
        // Unit Authoring Module -> Host
        // Sent to announce that unit definition has changed

        type: 'vo.FromAuthoringModule.ChangedNotification';
        sessionId: string;
    }

    export interface ToAuthoringModule_DataRequest {
        // Host -> Unit Authoring Module
        // the host calls to get the (changed) unit definition

        type: 'vo.ToAuthoringModule.DataRequest';
        sessionId: string;
    }

    export interface FromAuthoringModule_DataTransfer {
        // Unit authoring Module -> Host
        // Direct answer to ToAuthoringModule_DataRequest;

        type: 'vo.FromAuthoringModule.DataTransfer';
        sessionId: string;
        unitDefinition: string;
        player: string;
    }

    // Unit Player

    export interface FromPlayer_ReadyNotification {
        // Player -> Host
        // Announcing Load Complete
        type: 'vo.FromPlayer.ReadyNotification';
        version: number;
    }

    export interface KeyValuePairString {
        [K: string]: string;
    }

    export interface UnitState {
        dataParts?: KeyValuePairString;
        presentationProgress?: string;
        responseProgress?: string;
        unitStateDataType?: string;
    }

    export interface PlayerConfig {
        unitNumber: number;
        unitTitle: string;
        unitId: string;
        stateReportPolicy: string;
        logPolicy: string;
        pagingMode: string
    }

    export interface StartCommandData {
        type: string;
        sessionId: string;
        unitDefinition: string;
        unitDefinitionType: string;
        unitState?: UnitState;
        playerConfig?: PlayerConfig;
    }

    export interface FromPlayer_StartedNotification {
        // Player -> Host
        // Announcing start of response time

        type: 'vo.FromPlayer.StartedNotification';
        sessionId: string;
        validPages?: string[];
        currentPage?: string;
        presentationComplete?: 'yes' | 'no';
        responsesGiven?: 'yes' | 'no' | 'all';
    }

    export interface FromPlayer_ChangedDataTransfer {
        //  Player -> Host
        // Announcing data change to be stored or otherwise to be taken into account;
        // changes can be triggered by UI or by host's request;
        // the responseType ensures, that the right response

        type: 'vo.FromPlayer.ChangedDataTransfer';
        sessionId: string;
        validPages?: string[];
        currentPage?: string;
        restorePoint?: string;
        response?: string;
        responseConverter?: string;
        responseComplete?: boolean;
        presentationComplete?: 'yes' | 'no';
        responsesGiven?: 'yes' | 'no' | 'all';
    }

    export interface ToPlayer_NavigateToPage {
        // Host ->  Player
        // Request that the player has to navigate to this page;
        // newPage is one of the strings given to the host via validPages;
        // completion is announced by the player via vo.FromPlayer.ChangedDataTransfer

        type: 'vo.ToPlayer.NavigateToPage';
        sessionId: string;
        newPage: string;
    }

    export interface FromPlayer_PageNavigationRequest {
        // Player -> Host
        type: 'vo.FromPlayer.PageNavigationRequest';
        sessionId: string;
        newPage: string;
    }

    export interface FromPlayer_UnitNavigationRequest {
        // Player -> Host
        // navigationTarget is an sequence-ID of a certain unit or one of these:
        //    (unit) "#next", "#previous", "#first", "#last", (booklet) "#end"

        type: 'vo.FromPlayer.UnitNavigationRequest';
        sessionId: string;
        navigationTarget: string;
    }

    // messages

    export type UnitAuthoringMessageData = FromAuthoringModule_ReadyNotification | ToAuthoringModule_DataTransfer |
                                           FromAuthoringModule_ChangedNotification | ToAuthoringModule_DataRequest |
                                           FromAuthoringModule_DataTransfer;

    export type UnitPlayerMessageData = FromPlayer_ReadyNotification | StartCommandData |
                                        FromPlayer_StartedNotification | FromPlayer_ChangedDataTransfer |
                                        ToPlayer_NavigateToPage | FromPlayer_PageNavigationRequest |
                                        FromPlayer_UnitNavigationRequest;

} // end of the vo namespace section
