# Intro

This repository contains the IQB Unit Authoring Tool and the IQB Unit Player.

# Tech

The IQB Unit Authoring Tool and the IQB Unit Player share most of their code with each other. They are both programmed in Typescript, with a bit of HTML and CSS added to package everything neatly. The entry point for the IQB Unit Authoring Tool bundle is "src/typescriptCommonFiles/IQB_UnitAuthoring.ts" and for the IQB Unit Player bundle is "src/typescriptCommonFiles/IQB_UnitPlayer.ts". The .js bundles are generated using Webpack. Additional files needed for the build are located in "src/unitAuthoring" (for the Unit Authoring Tool) and in "src/unitPlayer" (for the Unit Player).

# Build

To build the project, if you are using Windows, use "custom_build.bat" or "npm run-script build". This will create a "build" folder with the current build and a "compilation" folder with intermediary files needed in order to create the build.

# Release

You can also use one of our previous releases directly, which are located in the "releases" folder.

# License

MIT License

www.IQB.hu-berlin.de

Dan Bărbulescu, Martin Mechtel, Andrei Stroescu

2018

