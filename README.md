[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)


# Intro

The current default IQB Item for computer based accessment: The Dan-Player. 
Contains: 
* Player-Plugin
* Editor-Plugin (formally known as IQB Unit Authoring Tool)

Version 2.1.0

# Source code

The Editor-Plugin and the Player-Plugin share most of their code with each other. They are both programmed in TypeScript, with a bit of HTML and CSS added to package everything neatly. The entry point for the Editor-Plugin bundle is "src/unitAuthoring/IQB_UnitAuthoring.ts". For the IQB Unit Player bundle, the entry point is "src/unitPlayer/IQB_UnitPlayer.ts". Additional files needed for the build are located in "src/unitAuthoring" (for the Unit Editor-Plugin), in "src/unitPlayer" (for the Unit Player) and in "src/typescriptCommonFiles" (source files used by both the Unit Editor-Plugin and by the Unit Player).

# Build

Currently the build process is only set up to work on Windows (7 or higher) and uses NPM (Node Package Manager).

You can use "npm install" to install the build dependencies which are needed. After that, you can use "npm run-script build" to do a build. This will create a "build" folder with the current build and a "compilation" folder with the intermediary files that are needed in order to create the build.

The build process is described in "custom_build.bat", using the Windows batch file syntax.

# Releases

You can also use one of our previous releases directly, which are located in the "releases" folder.

# Demo

# Testing

*No Tests available yet*

# License

MIT License

www.IQB.hu-berlin.de

Dan Bărbulescu, Martin Mechtel, Andrei Stroescu

2019
