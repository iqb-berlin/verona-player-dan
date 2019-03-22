rem preparing folders
mkdir "compilation"
mkdir "compilation\typescript_compiled_files"
mkdir "compilation\typescript_compiled_files\typescriptCommonFiles"
mkdir "compilation\typescript_compiled_files\unitAuthoring"
mkdir "compilation\typescript_compiled_files\unitPlayer"
mkdir "compilation\babeljs_compiled_files"
mkdir "compilation\final_bundles_files"
mkdir "build"
mkdir "build\unitAuthoring"
mkdir "build\unitAuthoring\js"
mkdir "build\unitAuthoring\css"
mkdir "build\unitAuthoring\includes"
mkdir "build\unitAuthoring\features"
mkdir "build\unitAuthoring\polyfills"
mkdir "build\unitPlayer"
mkdir "build\unitTestControllerExample"
rem call command based on idea from https://stackoverflow.com/a/4036937
rem stackoverflow post by: https://stackoverflow.com/users/390278/jeff-mercado
rem stackoverflow license: cc by-sa 3.0
call tsc
rem transpiling code using babeljs
call "./node_modules/.bin/babel" "compilation\typescript_compiled_files" --out-dir "compilation\babeljs_compiled_files"
rem bundling up the code
call webpack "compilation\babeljs_compiled_files\unitAuthoring\IQB_unitAuthoring.js" -o "compilation\final_bundles_files\IQB_unitAuthoring_Bundled.js" --mode development
call webpack "compilation\babeljs_compiled_files\unitPlayer\IQB_unitPlayer.js" -o "compilation\final_bundles_files\IQB_unitPlayer_Bundled.js" --mode development
rem finishing up unitAuthoring
copy "compilation\final_bundles_files\IQB_unitAuthoring_Bundled.js" "build\unitAuthoring\js"
xcopy "src\unitAuthoring\html" "build\unitAuthoring" /E /Y
xcopy "src\unitAuthoring\css" "build\unitAuthoring\css" /E /Y
xcopy "src\unitAuthoring\includes" "build\unitAuthoring\includes" /E /Y
xcopy "src\polyfills" "build\unitAuthoring\polyfills" /E /Y
rem finishing up unitPlayer
copy "src\polyfills\custom-event-polyfill.js" + "src\polyfills\nodeList-forEach.js" +  "intersection-observer.js" "compilation\polyfills.js"
copy "src\unitPlayer\misc\firstPart.html" + "src\unitPlayer\misc\scriptStart.txt" + "compilation\polyfills.js" + "src\unitPlayer\misc\scriptEnd.txt" + "src\unitPlayer\misc\scriptStart.txt" + "src\unitPlayer\includes\jquery.js" + "src\unitPlayer\misc\scriptEnd.txt" + "src\unitPlayer\misc\scriptStart.txt" + "compilation\final_bundles_files\IQB_unitPlayer_Bundled.js" + "src\unitPlayer\misc\scriptEnd.txt" + "src\unitPlayer\misc\styleStart.txt" + "src\unitPlayer\includes\pretty-checkbox.css" + "src\unitPlayer\misc\styleEnd.txt" + "src\unitPlayer\misc\secondPart.html" "build\unitPlayer\unitPlayer.html"
rem finishing up unitTestControllerExample
xcopy "src\unitTestControllerExample" "build\unitTestControllerExample" /E /Y
copy "build\unitPlayer\unitPlayer.html" "build\unitTestControllerExample\includes\unitPlayer.html"
rem renaming the unitPlayer to the current release
move /Y "build\unitPlayer\unitPlayer.html" "build\unitPlayer\IQBVisualUnitPlayerV1.4.3.html"