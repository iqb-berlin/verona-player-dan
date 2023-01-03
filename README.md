[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
![GitHub package.json version](https://img.shields.io/github/package-json/v/iqb-berlin/verona-player-dan?style=flat-square)

# Legacy - this player is maintained only to keep old units alive 

"Dan" was the main toolset for assessment items in 2018 - the so-called feasibility study at IQB. To create units we took the Dan-Editor, to play the units we loaded up the Dan-Player into the IQB-Testcenter.

Beginning in 2021, the Dan-System has been replaced by [Aspect](https://github.com/iqb-berlin/verona-modules-aspect). The new approach used Angular instead of plain JavaScript+jQuery, and we started to present units as responsive pages.

# Editor: No longer maintained

Even the Editor is already build as a Verona plugin, we do not maintain the editor anymore. The old units are kept and still played as showcase, but we do not edit these units anymore or create new units. The Verona Spec for the editor has changed, so you cannot load the Dan-Editor onto the IQB-Studio. Therefor, the [release package](https://github.com/iqb-berlin/verona-player-dan/releases) contains only of the player.

# Build

Install dependencies via NPM
```
npm install
```

After that, you can use `npm run-script build` to do a build. This will create a "build" folder with the current build and a "compilation" folder with the intermediary files that are needed in order to create the build.
The build process is described in "custom_build.bat", using the Windows batch file syntax.

For Linux there is a bash script, which you have to execute directly, `./build.sh`.

# License

MIT License

www.IQB.hu-berlin.de

Dan Bărbulescu, Martin Mechtel, Andrei Stroescu, Richard Henck, Achim Hoch

2023
