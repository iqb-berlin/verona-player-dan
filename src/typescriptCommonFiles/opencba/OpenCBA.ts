/* OpenCBA

This module describes common characteristics that all OpenCBA compatible item players share
*/

// www.IQB.hu-berlin.de
// Martin Mechtel, Dan Bărbulescu, Andrei Stroescu
// 2018
// license: MIT

export namespace OpenCBA {

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

    export interface FromItemPlayer_ReadyNotification {
        // Item Player -> Host
        // Announcing Load Complete
        type: 'OpenCBA.FromItemPlayer.ReadyNotification';
    }

    export interface ToItemPlayer_DataTransfer {
        // Host -> Item Player
        // Answering 'OpenCBA.FromItemPlayer.ReadyNotification', sending start data

        type: 'OpenCBA.ToItemPlayer.DataTransfer';
        sessionId: string;
        unitDefinition: string;
        environment?: {[environmentVariableName: string]: string};
        restorePoint?: string;
        unitNumber?: string;
        unitTitle?: string;
        resources?: {[resourceName: string]: string};
    }

    export interface FromItemPlayer_StartedNotification {
        // ItemPlayer -> Host
        // Announcing start of response time

        type: 'OpenCBA.FromItemPlayer.StartedNotification';
        sessionId: string;
        validPages?: string[];
        currentPage?: string;
        presentationComplete?: 'yes' | 'no';
        responsesGiven?: 'yes' | 'no' | 'all';
    }

    export interface FromItemPlayer_ChangedDataTransfer {
        // Item Player -> Host
        // Announcing data change to be stored or otherwise to be taken into account;
        // changes can be triggered by UI or by host's request;
        // the responseType ensures, that the right response

        type: 'OpenCBA.FromItemPlayer.ChangedDataTransfer';
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

    export interface ToItemPlayer_PageNavigationRequest {
        // Host -> Item Player
        // Request that the item player has to navigate to this page;
        // newPage is one of the strings given to the host via validPages;
        // completion is announced by the item player via Message_FromItemPlayer_ChangedDataTransfer

        type: 'OpenCBA.ToItemPlayer.PageNavigationRequest';
        sessionId: string;
        newPage: string;
    }

    export interface FromItemPlayer_PageNavigationRequestedNotification {
        // Item Player -> Host
        type: 'OpenCBA.FromItemPlayer.PageNavigationRequestedNotification';
        sessionId: string;
        newPage: string;
    }

    export interface FromItemPlayer_NavigationRequestedNotification {
        // Item Player -> Host
        // navigationTarget is an ID of a certain page or one of these: "#next", "#previous", "#first", "#last"

        type: 'OpenCBA.FromItemPlayer.NavigationRequestedNotification',
        sessionId: string;
        navigationTarget: string;
    }

    // messages

    export type UnitAuthoringMessageData = FromUnitAuthoring_ReadyNotification | ToUnitAuthoring_DataTransfer |
                                           FromUnitAuthoring_ChangedNotification | ToUnitAuthoring_ChangedDataCall |
                                           FromUnitAuthoring_ChangedDataTransfer;

    export type ItemPlayerMessageData = FromItemPlayer_ReadyNotification | ToItemPlayer_DataTransfer |
                                        FromItemPlayer_StartedNotification | FromItemPlayer_ChangedDataTransfer |
                                        ToItemPlayer_PageNavigationRequest | FromItemPlayer_PageNavigationRequestedNotification |
                                        FromItemPlayer_NavigationRequestedNotification;

} // end of the OpenCBA namespace section
