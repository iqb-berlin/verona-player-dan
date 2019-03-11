// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2019
// license: MIT

import {UnitElement} from '../../typescriptCommonFiles/unit/UnitElement.js';
import {UnitPage} from '../../typescriptCommonFiles/unit/UnitPage.js';
import {Unit} from '../../typescriptCommonFiles/unit/Unit.js';

export interface PopupMenuItem
{
    containerElementID: string;
    triggerOnMouseOverElementID: string;
    innerHTML: string;
    tooltip: string;
    position: 'afterbegin' | 'beforeend';
    type: 'mover' | 'dock' | 'undock';
}


export class PopupMenu
{
   private elementID: string;
   private elementDiv: HTMLDivElement;
   private popupMenuDiv: HTMLDivElement;
   private popupMenuDivID: string;
   private popupMenuItemsCounter = 0;
   private popupMenuItems: Map<string, PopupMenuItem> = new Map();
   private hideMenuItemTimeoutIDs: Array<number> = [];

   constructor(public attachedToElement: UnitElement)
   {
    this.elementID = attachedToElement.getElementID();
    this.elementDiv = (document.getElementById(this.elementID) as HTMLDivElement);

    this.elementDiv.insertAdjacentHTML('afterbegin', `<div id="${this.elementID + '_popupmenu'}"
                                                     class="popupMenu" style="display: none"></div>`);

    this.popupMenuDivID = this.elementID + '_popupmenu';
    this.popupMenuDiv = document.getElementById(this.popupMenuDivID) as HTMLDivElement;

    jQuery('#' + this.popupMenuDivID).on('mouseleave', () =>
    {
        this.queHidePopupMenu();
    });

    window.addEventListener('IQB.unitAuthoring.popupMenuShown', (e) => {
        // console.log('IQB.unitAuthoring.popupMenuShown event received');
        // console.log(e);

        if ('detail' in e)
        {
            if ('popupMenuDivID' in e.detail) {
                if (e.detail.popupMenuDivID !== this.popupMenuDivID) {
                    this.hidePopupMenu();
                }
            }
            else {
                console.error('IQB.unitAuthoring.popupMenuShown does not contain detail.popupMenuDivID property');
            }
        }
        else {
            console.error('IQB.unitAuthoring.popupMenuShown does not contain detail property');
        }
    });

    /*
    jQuery(document).on('mouseover', (e) =>
    {
        // if the user goes with the mouse somewhere else, then que hide popup
        if ('id' in e.target)
        {
            console.log(e.target.id);
            console.log(this.popupMenuItems.has(e.target.id));
            if ((this.popupMenuItems.has(e.target.id) === false) && (e.target.id != this.popupMenuDivID)) {
                this.queHidePopupMenu();
            }
        }
    });
    */

   }


   public addPopupMenuItem(popupMenuItem: PopupMenuItem): string
   {
       this.popupMenuItemsCounter++;
       const popupMenuItemID = this.elementID + '_popupmenu_item_' + this.popupMenuItemsCounter;

       // z-index bug solved with help of stack overflow answer: https://stackoverflow.com/a/8048473
       this.popupMenuDiv.insertAdjacentHTML(popupMenuItem.position, `<div id="${popupMenuItemID}"
                                                                     class="popupMenuItem mdc-button--raised"
                                                                     title="${popupMenuItem.tooltip}">${popupMenuItem.innerHTML}</div>`);

       this.popupMenuItems.set(popupMenuItemID, popupMenuItem);

       jQuery('#' + popupMenuItem.triggerOnMouseOverElementID).on('mouseover', () =>
       {
           this.showPopupMenu();
       });

       jQuery('#' + popupMenuItemID).on('mouseover', () =>
       {
           this.showPopupMenu();
       });

       jQuery('#' + popupMenuItem.triggerOnMouseOverElementID).on('mouseleave', () =>
       {
           this.queHidePopupMenu();
       });

       if ((popupMenuItem.type === 'dock') ||  (popupMenuItem.type === 'undock'))
       {
           const popupMenuItemDiv = document.getElementById(popupMenuItemID);
           const popupMenuItemContainerDiv = document.getElementById(popupMenuItem.containerElementID);

           if ((popupMenuItemDiv !== null) && (popupMenuItemContainerDiv !== null))
           {
                popupMenuItemDiv.addEventListener('mouseenter', (e) => {
                    popupMenuItemContainerDiv.classList.add('highlighted');
                });

                popupMenuItemDiv.addEventListener('mouseleave', (e) => {
                    popupMenuItemContainerDiv.classList.remove('highlighted');
                });

                jQuery('#' + this.popupMenuDivID).on('mouseleave', () =>
                {
                    popupMenuItemContainerDiv.classList.remove('highlighted');
                });
           }
       }

       // if the element is selected, show its popups when rendering them for the first time
       // if (this.selectedElementID === elementID) {
       //     showPopupMenuItem();
       // }

       // this.showPopupMenuItem(popupMenuItemID);
       // this.queHidePopupMenuItem(popupMenuItemID);

       return popupMenuItemID;
   }

   public showPopupMenu()
   {
        this.elementDiv.style.overflow = 'visible';
        jQuery('#' + this.popupMenuDivID).css('display', 'inline');

        // cancel any hide menu item timeouts
        this.hideMenuItemTimeoutIDs.forEach((timeoutID: number) => {
            clearTimeout(timeoutID);
        });

        this.hideMenuItemTimeoutIDs = [];

        if (this.attachedToElement.getElementType() !== 'table') {
            // if the popup menu is not attachedd to a table
            // signal that it has been shown so as to hide the other currently shown popup menus
            window.dispatchEvent(new CustomEvent('IQB.unitAuthoring.popupMenuShown', {
                detail: {'popupMenuDivID': this.popupMenuDivID}
            }));
        }

   }

   public hidePopupMenu()
   {
    jQuery('#' + this.popupMenuDivID).css('display', 'none');
   }

   public queHidePopupMenu()
   {

          const timeoutID = setTimeout(() => {
                                                this.hidePopupMenu();
                                              }, 2500);

           this.hideMenuItemTimeoutIDs.push(timeoutID);
   }

   public removePopupMenuItem(popupMenuItemID: string)
   {
       const popupMenuItemDiv = document.getElementById(popupMenuItemID);

       if ((this.popupMenuDiv !== null) && (popupMenuItemDiv !== null))
       {
        this.popupMenuDiv.removeChild(popupMenuItemDiv);
       }

       this.popupMenuItems.delete(popupMenuItemID);
   }

   public removeDockingPopupMenuItems(): void
   {
       this.popupMenuItems.forEach((popupMenuItem: PopupMenuItem, popupMenuItemID: string) => {
           if ((popupMenuItem.type === 'dock') || (popupMenuItem.type === 'undock'))  {
               this.removePopupMenuItem(popupMenuItemID);
           }
       });

        // todo ?
        // hide all popup menus that are not used
        // this.hideEmptyPopupMenus();
   }

   public getPopupMenuItemsMap(): Map<string, PopupMenuItem>
   {
       return this.popupMenuItems;
   }
}
