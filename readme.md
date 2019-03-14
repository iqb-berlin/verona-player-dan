# Intro

This repository contains v1.2.0 of the IQB Unit Authoring Tool and the IQB Unit Player.

# Tech

The IQB Unit Authoring Tool and the IQB Unit Player share most of their code with each other. They are both programmed in Typescript, with a bit of HTML and CSS added to package everything neatly. The entry point for the IQB Unit Authoring Tool bundle is "src/unitAuthoring/IQB_UnitAuthoring.ts". For the IQB Unit Player bundle, the entry point is "src/unitPlayer/IQB_UnitPlayer.ts". The .js bundles are generated using Webpack. Additional files needed for the build are located in "src/unitAuthoring" (for the Unit Authoring Tool), in "src/unitPlayer" (for the Unit Player) and in "src/typescriptCommonFiles" (source files used by both the Unit Authoring Tool and by the Unit Player).

# Build

Currently the build process is only set up to work on Windows.

To build the project, you will need the Typescript Compiler and the Webpack CLI (see package.json for the the versions currently used to make the build). If these are available on your system, you can use "custom_build.bat" to build the project. This will create a "build" folder with the current build and a "compilation" folder with the intermediary files that are needed in order to create the build.

Alternatively, you can also do the whole build process by using the Node Package Manager (first "npm install" and then "npm run-script build").

# Demo

A live demo of the Unit Authoring Tool is available at: https://dan-barbulescu-dev.github.io/unitAuthoringDemo/

# Release

You can also use one of our previous releases directly, which are located in the "releases" folder.

# License

MIT License

www.IQB.hu-berlin.de

Dan Bărbulescu, Martin Mechtel, Andrei Stroescu

2019
