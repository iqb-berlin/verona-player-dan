/* interface

This module describes a common interface  that all IQB Unit Authoring Tools and Players share

*/

// www.IQB.hu-berlin.de
// Martin Mechtel, Dan Bărbulescu, Andrei Stroescu
// 2019
// license: MIT

export namespace VO {

    // Unit Authoring

    export interface FromUnitAuthoring_ReadyNotification {
        // Unit Authoring Module -> Host
        // Announcing Load Complete

        type: 'OpenCBA.FromUnitAuthoring.ReadyNotification';
    }

    export interface ToUnitAuthoring_DataTransfer {
        // Host -> Unit Authoring Module
        // Answering 'OpenCBA.FromUnitAuthoring.ReadyNotification'

        type: 'OpenCBA.ToUnitAuthoring.DataTransfer';
        sessionId: string;
        unitDefinition: string;
    }

    export interface FromUnitAuthoring_ChangedNotification {
        // Unit Authoring Module -> Host
        // Sent to announce that unit definition has changed

        type: 'OpenCBA.FromUnitAuthoring.ChangedNotification';
        sessionId: string;
    }

    export interface ToUnitAuthoring_ChangedDataCall {
        // Host -> Unit Authoring Module
        // the host calls to get the (changed) unit definition

        type: 'OpenCBA.ToUnitAuthoring.ChangedDataCall';
        sessionId: string;
    }

    export interface FromUnitAuthoring_ChangedDataTransfer {
        // Unit authoring Module -> Host
        // Direct answer to Message_ToUnitAuthoring_ChangedDataCall;
        // the unitDefinitionType ensures that the right item player will be chosen to run this unit

        type: 'OpenCBA.FromUnitAuthoring.ChangedDataTransfer';
        sessionId: string;
        unitDefinition: string;
        unitDefinitionType: string;
    }



    // Item Player

    export interface FromPlayer_ReadyNotification {
        // Player -> Host
        // Announcing Load Complete
        type: 'vo.FromPlayer.ReadyNotification';
        version: number;
    }

    export interface ToPlayer_DataTransfer {
        // Host -> Player
        // Answering 'vo.FromPlayer.ReadyNotification', sending start data

        type: 'vo.ToPlayer.DataTransfer';
        sessionId: string;
        unitDefinition: string;
        restorePoint?: string;
        unitNumber?: string;
        unitTitle?: string;
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
        responseType?: string;
        responseComplete?: boolean;
        logEntries?: string[];
        presentationComplete?: 'yes' | 'no';
        responsesGiven?: 'yes' | 'no' | 'all';
    }

    export interface ToPlayer_PageNavigationRequest {
        // Host ->  Player
        // Request that the player has to navigate to this page;
        // newPage is one of the strings given to the host via validPages;
        // completion is announced by the player via vo.FromPlayer.ChangedDataTransfer

        type: 'vo.ToPlayer.PageNavigationRequest';
        sessionId: string;
        newPage: string;
    }

    export interface FromPlayer_PageNavigationRequestedNotification {
        // Player -> Host
        type: 'vo.FromPlayer.PageNavigationRequestedNotification';
        sessionId: string;
        newPage: string;
    }

    export interface FromPlayer_NavigationRequestedNotification {
        // Player -> Host
        // navigationTarget is an sequence-ID of a certain unit or one of these:
        //    (unit) "#next", "#previous", "#first", "#last", (booklet) "#end"

        type: 'vo.FromPlayer.NavigationRequestedNotification';
        sessionId: string;
        navigationTarget: string;
    }

    // messages

    export type UnitAuthoringMessageData = FromUnitAuthoring_ReadyNotification | ToUnitAuthoring_DataTransfer |
                                           FromUnitAuthoring_ChangedNotification | ToUnitAuthoring_ChangedDataCall |
                                           FromUnitAuthoring_ChangedDataTransfer;

    export type UnitPlayerMessageData = FromPlayer_ReadyNotification | ToPlayer_DataTransfer |
                                        FromPlayer_StartedNotification | FromPlayer_ChangedDataTransfer |
                                        ToPlayer_PageNavigationRequest | FromPlayer_PageNavigationRequestedNotification |
                                        FromPlayer_NavigationRequestedNotification;

} // end of the OpenCBA namespace section
