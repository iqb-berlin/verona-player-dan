// www.IQB.hu-berlin.de
// Dan Bărbulescu, Martin Mechtel, Andrei Stroescu
// 2018
// license: MIT

import {UnitElement} from '../UnitElement.js';
import {Property, Properties} from '../Properties.js';
import {PropertiesValue, UnitElementData, UnitPageData, UnitData} from '../../models/Data.js';
import {colorsObject} from '../../models/Colors.js';

export class AudioElement extends UnitElement {

    /* ---------- Material Icons (encoded as base64) ------------------

    https://material.io/tools/icons/?style=baseline

    License according to material.io : https://www.apache.org/licenses/LICENSE-2.0.html

    */
    private playIcon24px: string = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAU0lEQVR4AWMAgVGwgUGANA3/Gd4z5JOkAQz3MygQrQEO64nVgIDnGRyI1YCA/YQC4T8GvM8QQJqGB6RpmECKky6Q5ukGUoL1ACkR94GhgLLENwoAu8xMerZ59JQAAAAASUVORK5CYII=`;
    private pauseIcon24px: string = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAIUlEQVR4AWMY2WAU/EfGhORHLRi1YNSCUQtGLRjeYBQAAMImb5Eus0ZYAAAAAElFTkSuQmCC`;
    public playedOnce: boolean;

    /* --------------------------------------------------------------- */

    constructor(public elementID: string, public pageHTMLElementID: string, src: string)
    {
        super(elementID, pageHTMLElementID);

        this.width = 300;

        // console.log('Creating audio element with src ' + src);

        this.properties.addProperty('type', {
            value: 'audio',
            userAdjustable: false,
            propertyType: 'text',
            hidden: false,
            caption: 'Type',
            tooltip: 'Was für ein Element dieses Element ist.'
        });

        this.properties.addProperty('src', {
            value: src,
            userAdjustable: false,
            propertyType: 'text',
            hidden: true,
            caption: 'Source'
        });

        /*
        this.properties.addPropertyRenderer('src', 'audioRenderer', (propertyValue: string) => {

            const audioElement = document.getElementById(this.elementID + '_audio') as HTMLAudioElement;

            if (this.getPropertyValue('alreadyPlayed') !== 'true') {
                audioElement.src = propertyValue;
            }

        });
        */

        this.properties.addProperty('autoplay', {
            value: 'false',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Autoplay',
            tooltip: 'Soll das Audio automatisch gespielt werden?'
        });


        // todo - customizable volume
        /*
        this.properties.addProperty('defaultVolume', {
            value: '0.2',
            userAdjustable: true,
            propertyType: 'text',
            hidden: false,
            caption: 'Standardlautstärke',
            tooltip: 'Die Standardlautstärke des Audios'
        });
        */


        this.properties.addPropertyRenderer('autoplay', 'AudioRenderer', (propertyValue: string) => {
            // autoplay is now handled by jQuery('#' + this.elementID + '_audio').on('load'), lower in this file
            /*


            const audioHTMLElement = (document.getElementById(this.elementID + '_audio') as HTMLAudioElement);
            if (propertyValue === 'true') {
                audioHTMLElement.setAttribute('autoplay', 'true');
            }
            else
            {
                if (audioHTMLElement.hasAttribute('autoplay')) {
                    audioHTMLElement.removeAttribute('autoplay');
                }
            }
            */

        });

        this.properties.addProperty('hasControl', {
            value: 'true',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Steuerung',
            tooltip: 'Ob jemand das Audio-Element steuern kann'
        });

        this.properties.addPropertyRenderer('hasControl', 'audioRenderer', (propertyValue: string) => {
            const hasControlDiv = elementID + '_hasControl';
            if (propertyValue === 'true')
            {
                (document.getElementById(hasControlDiv) as HTMLInputElement).style.display = 'inline';
            }
            else
            {
                (document.getElementById(hasControlDiv) as HTMLInputElement).style.display = 'none';
            }
        });

        this.properties.addProperty('playOnlyOnce', {
            value: 'true',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Nur einmal gespielt',
            tooltip: ''
        });

        this.properties.addPropertyRenderer('playOnlyOnce', 'audioRenderer', (propertyValue: string) => {
        });

        this.properties.addProperty('currentTime', {
            value: 0,
            userAdjustable: false,
            propertyType: 'number',
            hidden: true,
            caption: 'currentTime',
            tooltip: '',
            calculatedAtRuntime: true
        });

        this.properties.addPropertyRenderer('currentTime', 'audioRenderer', (propertyValue: string) => {
            // this.setCurrentTime(parseFloat(propertyValue));
            // this.showAudioLocation();
        });

        this.properties.addProperty('alreadyPlayed', {
            value: 'false',
            userAdjustable: false,
            propertyType: 'boolean',
            hidden: true,
            caption: 'alreadyPlayed',
            tooltip: '',
            calculatedAtRuntime: true
        });

        this.properties.addPropertyRenderer('alreadyPlayed', 'audioRenderer', (propertyValue: string) => {
            // console.log('Rendering alreadyPlayed property for ' + this.getElementID());
            // console.log('Property value: ' + propertyValue);

            if (propertyValue === 'true') {
                const audioElement = document.getElementById(this.elementID + '_audio') as HTMLAudioElement;
                const audioElementVisualLocation = document.getElementById(this.elementID + '_audio_visualLocation') as HTMLAudioElement;
                const audioElementTextLocation = document.getElementById(this.elementID + '_audio_textLocation') as HTMLAudioElement;

                window.dispatchEvent(new CustomEvent('IQB.unit.debugMessage', {
                    detail: {'msgType': 'info', 'msg': 'Alreadyplayed property detected as true for ' + this.elementID + '. Thus, removing audio.'}
                }));
                audioElement.src = '';

                const audioControls = document.getElementById(this.elementID + '_audio_controls') as HTMLSpanElement;
                audioControls.style.display = 'none';

                audioElementVisualLocation.style.width = '100%';

                audioElementTextLocation.innerHTML = '<br />Audio wurde gespielt.';
            }
        });

        this.playedOnce = false;


        this.properties.addProperty('progressBarColor', {
            value: 'green',
            userAdjustable: true,
            propertyType: 'dropdown',
            propertyData: colorsObject,
            hidden: false,
            caption: 'Fortschrittsbalken',
            tooltip: 'Was die Farbe des Fortschrittsbalkens ist'
        });

        this.properties.addPropertyRenderer('progressBarColor', 'audioRenderer', (propertyValue: string) => {
            const visualLocationDiv =  document.getElementById(this.elementID + '_audio_visualLocation');
            if (visualLocationDiv !== null) {
                visualLocationDiv.style.backgroundColor = propertyValue;
            }
        });

        this.properties.addProperty('withoutPause', {
            value: 'true',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Pausenlos',
            tooltip: 'Ob man das Audio pausieren kann.'
        });

        this.properties.addPropertyRenderer('withoutPause', 'audioRenderer', (propertyValue: string) => {
            const audioPausableSpan =  document.getElementById(this.elementID + '_audio_pausable');
            if (audioPausableSpan !== null) {
                if (propertyValue === 'true') {
                    audioPausableSpan.style.display = 'none';
                }
                else
                {
                    audioPausableSpan.style.display = 'inline';
                }
            }
        });

        this.properties.addProperty('partOfPresentation', {
            value: 'true',
            userAdjustable: true,
            propertyType: 'boolean',
            hidden: false,
            caption: 'Teil der Presentation',
            tooltip: 'Ob das Audio Teil der Presentation ist. Unter manchen Bedingungen könnte man gezwungen werden, die ganze Presentation anzusehen, bevor man von dem Unit wegblättern kann.'
        });

        // remove inherited properties that this element type does not use
        this.properties.removeProperty('style');
        this.properties.removeProperty('font-family');
        this.properties.removeProperty('font-size');
        this.properties.removeProperty('background-color');
        this.properties.removeProperty('color');
    }

    drawElement()
    {
        // idea on how to make the audio element not reachable by tab based on stackoverflow
        // https://stackoverflow.com/a/5192919
        // Original answer by: https://stackoverflow.com/users/399908/martin-hennings
        // Edited by: https://stackoverflow.com/users/399908/martin-hennings , https://stackoverflow.com/users/1317805/james-donnelly
        // License: cc by-sa 3.0

        let srcToDraw = '';
        if (this.getPropertyValue('alreadyPlayed') !== 'true') {
            srcToDraw = this.properties.getPropertyValue('src');
        }

        const elementHTML = `
                    <div class="itemElement" id="${this.elementID}" style="${this.elementCommonStyle}; overflow: visible;">
                            <div id="${this.elementID}_zIndexContainer" class="unitElementZIndexContainer">
                                <audio src="${srcToDraw}"
                                    id="${this.elementID}_audio"
                                    style="width: 100%; display: none;"
                                    tabindex="-1"
                                    controls controlsList="nodownload">
                                </audio>
                                <div id="${this.elementID}_customAudio">
                                    <span id="${this.elementID}_audio_controls">
                                        <span id="${this.elementID}_hasControl">
                                            <img id="${this.elementID}_audio_btnPlay" src="${this.playIcon24px}" style="display: none; cursor: pointer; position: relative; top: 6px;">
                                            <span id="${this.elementID}_audio_pausable" class="audioPausableSpan">
                                                <img id="${this.elementID}_audio_btnPause" src="${this.pauseIcon24px}" style="display: none; cursor: pointer; position: relative; top: 6px;">
                                            </span>
                                        </span>
                                    </span>
                                    <div id="${this.elementID}_audio_visualLocationContainer" style="width: 60%; display: inline-block; height: 16px; position: relative; top: 2px; border: 1px solid black;">
                                        <div id="${this.elementID}_audio_visualLocation" style="width: 0%; height: 100%; background-color: green; display: inline-block;"></div>
                                    </div>
                                    <span id="${this.elementID}_audio_textLocation" style="width: 20%; position: relative; top: -1px;"></span>
                                </div>
                            </div>
                    </div>`;

       const pageHTMLElement = this.getPageHTMLElement();
       if (pageHTMLElement !== null)
       {
        pageHTMLElement.insertAdjacentHTML('beforeend', elementHTML);

        if ((this.width === -1) && (this.height === -1))
        {
            this.properties.renderProperties(['width', 'height']);

            jQuery('#' + this.elementID + '_audio').on('load', () => {
                // https://api.jquery.com/load-event/
                // adjust height and width after loading audio
                this.updateSizePropertiesBasedOn(this.pageHTMLElementID, this.elementID);
                this.properties.renderProperty('height');
                this.properties.renderProperty('width');
            });
        }
        else
        {
            this.properties.renderProperties();
        }

        // add audio events
        const audioElement = document.getElementById(this.elementID + '_audio') as HTMLAudioElement;
        const audioElementVisualLocation = document.getElementById(this.elementID + '_audio_visualLocation') as HTMLAudioElement;
        const audioElementTextLocation = document.getElementById(this.elementID + '_audio_textLocation') as HTMLAudioElement;

        const audioControls = document.getElementById(this.elementID + '_audio_controls') as HTMLSpanElement;
        const playButton = document.getElementById(this.elementID + '_audio_btnPlay') as HTMLImageElement;
        const pauseButton = document.getElementById(this.elementID + '_audio_btnPause') as HTMLImageElement;

        audioElement.onplay = () => {
            window.dispatchEvent(new CustomEvent('IQB.unit.audioElementStarted', {
                detail: {'elementID': this.getElementID()}
            }));
        };

        audioElement.addEventListener('timeupdate', () => {
            this.setPropertyValue('currentTime', audioElement.currentTime);

            this.showAudioLocation();
        });

        audioElement.onpause = () => {
            window.dispatchEvent(new CustomEvent('IQB.unit.audioElementStopped', {
                detail: {'elementID': this.getElementID()}
            }));
        };

        audioElement.onended = () => {
            playButton.style.display = 'inline';
            pauseButton.style.display = 'none';

            this.playedOnce = true;

            if (this.getPropertyValue('playOnlyOnce') === 'true') {
                // if it can be played only once, mark it as already played, and wipe its contents
                this.setPropertyValue('alreadyPlayed', 'true');

                // then render it again
                this.render();
            }

            window.dispatchEvent(new CustomEvent('IQB.unit.audioElementStopped', {
                detail: {'elementID': this.getElementID()}
            }));

            window.dispatchEvent(new CustomEvent('IQB.unit.audioElementEnded', {
                detail: {'elementID': this.getElementID()}
            }));
        };
        // finished adding audio events

        // add play and pause functionality

        playButton.addEventListener('click', () => {
            this.play();
        });

        pauseButton.addEventListener('click', () => {
            this.pause();
        });

        // react to other audios being played and stop, by hiding / showing audio controls

        window.addEventListener('IQB.unit.audioElementStarted', (e) => {
            if ((e as CustomEvent).detail.elementID !== this.elementID) {
                audioControls.style.visibility = 'hidden';
            }
        });

        window.addEventListener('IQB.unit.audioElementStopped', (e) => {
            if ((e as CustomEvent).detail.elementID !== this.elementID) {
                if (this.getPropertyValue('alreadyPlayed') !== 'true') {
                    audioControls.style.visibility = 'visible';
                }
            }
        });

        // end of reacting to other audios being played / stopped

        // after load functionality
        if (audioElement.readyState < 4)
        {
            // if not yet completely loaded, do after loaded behaviour when it's ready
            audioElement.oncanplaythrough = () => {
                this.doAfterLoadedBehaviour();
            };
        }
        else
        {
            // if audio is completely loaded, do afterloaded behaviour now
            this.doAfterLoadedBehaviour();
        }
        // end of after loaded functionality

        this.dispatchNewElementDrawnEvent();
       }
    }

    private doAfterLoadedBehaviour(): void {
        const audioElementVisualLocation = document.getElementById(this.elementID + '_audio_visualLocation') as HTMLAudioElement;
        const playButton = document.getElementById(this.elementID + '_audio_btnPlay') as HTMLImageElement;
        const pauseButton = document.getElementById(this.elementID + '_audio_btnPause') as HTMLImageElement;

        playButton.style.display = 'inline';
        pauseButton.style.display = 'none';

        audioElementVisualLocation.style.width = '0%';

        this.showAudioLocation();

        this.doAutoplayBehaviour();
    }

    private doAutoplayBehaviour(): void {
        const audioElement = document.getElementById(this.elementID + '_audio') as HTMLAudioElement;
        if (this.getPropertyValue('autoplay') === 'true')
        {
            if (this.getPropertyValue('alreadyPlayed') !== 'true') {
                if (audioElement.paused) {
                    this.play();

                    window.dispatchEvent(new CustomEvent('IQB.unit.audioElementAutoplayed', {
                        detail: {'elementID': this.getElementID()}
                    }));
                }
            }
        }
    }

    play(): void {
        const audioElement = document.getElementById(this.elementID + '_audio') as HTMLAudioElement;
        const playButton = document.getElementById(this.elementID + '_audio_btnPlay') as HTMLImageElement;
        const pauseButton = document.getElementById(this.elementID + '_audio_btnPause') as HTMLImageElement;

        playButton.style.display = 'none';
        pauseButton.style.display = 'inline';
        audioElement.play();
    }

    pause(): void {
        const audioElement = document.getElementById(this.elementID + '_audio') as HTMLAudioElement;
        const playButton = document.getElementById(this.elementID + '_audio_btnPlay') as HTMLImageElement;
        const pauseButton = document.getElementById(this.elementID + '_audio_btnPause') as HTMLImageElement;

        pauseButton.style.display = 'none';
        playButton.style.display = 'inline';
        audioElement.pause();
    }

    getCurrentTime(): number {
        const audioElement = document.getElementById(this.elementID + '_audio') as HTMLAudioElement;
        return audioElement.currentTime;
    }

    setCurrentTime(newCurrentTime: number): void {
        const audioElement = document.getElementById(this.elementID + '_audio') as HTMLAudioElement;
        audioElement.currentTime = newCurrentTime;
        // console.log('Set current time of ' + this.getElementID() + ' as ' + newCurrentTime);
    }

    showAudioLocation()
    {
        const audioElement = document.getElementById(this.elementID + '_audio') as HTMLAudioElement;
        const audioElementVisualLocation = document.getElementById(this.elementID + '_audio_visualLocation') as HTMLAudioElement;
        const audioElementTextLocation = document.getElementById(this.elementID + '_audio_textLocation') as HTMLAudioElement;

        if (audioElement !== null) {
            if (audioElement.duration > 0) {
                // console.log('Retrieved current time of ' + this.getElementID() + ' as ' + audioElement.currentTime);
                audioElementVisualLocation.style.width = Math.floor(audioElement.currentTime / audioElement.duration * 100) + '%';

                const currentLocationMinutesAsInt: number = Math.floor(audioElement.currentTime / 60);
                const currentLocationMinutesAsString: string = currentLocationMinutesAsInt.toString();
                // if (currentLocationMinutesAsInt < 10) { currentLocationMinutesAsString = '0' + currentLocationMinutesAsString; }

                const currentLocationSecondsAsInt = Math.floor(audioElement.currentTime % 60);
                let currentLocationSecondsAsString: string = currentLocationSecondsAsInt.toString();
                if (currentLocationSecondsAsInt < 10) { currentLocationSecondsAsString = '0' + currentLocationSecondsAsString; }

                const totalDurationMinutesAsInt: number = Math.floor(audioElement.duration / 60);
                const totalDurationMinutesAsString: string = totalDurationMinutesAsInt.toString();
                // if (totalDurationMinutesAsInt < 10) { totalDurationMinutesAsString = '0' + totalDurationMinutesAsString; }

                const totalDurationSecondsAsInt = Math.floor(audioElement.duration % 60);
                let totalDurationSecondsAsString: string = totalDurationSecondsAsInt.toString();
                if (totalDurationSecondsAsInt < 10) { totalDurationSecondsAsString = '0' + totalDurationSecondsAsString; }

                const textLocation =  currentLocationMinutesAsString + ':' + currentLocationSecondsAsString + ' / ' +
                                        totalDurationMinutesAsString + ':' + totalDurationSecondsAsString;

                audioElementTextLocation.innerHTML =  textLocation;
            }
        }
    }
}
