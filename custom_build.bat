mkdir "compilation"
mkdir "compilation\typescript_compiled_files"
mkdir "compilation\typescript_compiled_files_bundled"
mkdir "build"
mkdir "build\unitAuthoring"
mkdir "build\unitAuthoring\js"
mkdir "build\unitAuthoring\css"
mkdir "build\unitAuthoring\includes"
mkdir "build\unitAuthoring\testControllerExample"
mkdir "build\unitPlayer"
rem call command based on idea from https://stackoverflow.com/a/4036937
call tsc
call webpack "compilation\typescript_compiled_files\IQB_unitAuthoring.js" -o "compilation\typescript_compiled_files_bundled\IQB_unitAuthoring_Bundled.js" --mode development
call webpack "compilation\typescript_compiled_files\IQB_unitPlayer.js" -o "compilation\typescript_compiled_files_bundled\IQB_unitPlayer_Bundled.js" --mode development
copy "compilation\typescript_compiled_files_bundled\IQB_unitAuthoring_Bundled.js" "build\unitAuthoring\js"
xcopy "src\unitAuthoring\html" "build\unitAuthoring" /E /Y
xcopy "src\unitAuthoring\css" "build\unitAuthoring\css" /E /Y
xcopy "src\unitAuthoring\includes" "build\unitAuthoring\includes" /E /Y
copy "src\unitPlayer\misc\firstPart.html" + "src\unitPlayer\misc\scriptStart.txt" + "src\unitPlayer\includes\jquery.js" + "src\unitPlayer\misc\scriptEnd.txt" + "src\unitPlayer\misc\scriptStart.txt" + "compilation\typescript_compiled_files_bundled\IQB_unitPlayer_Bundled.js" + "src\unitPlayer\misc\scriptEnd.txt" + "src\unitPlayer\misc\secondPart.html" "build\unitPlayer\unitPlayer.html"
copy "src\unitPlayer\testController\testControllerExample.html" "build\unitAuthoring\testControllerExample\testControllerExample.html"
copy "build\unitPlayer\unitPlayer.html" "build\unitAuthoring\testControllerExample\unitPlayer.html"
move /Y "build\unitPlayer\unitPlayer.html" "build\unitPlayer\IQBUnitPlayerV7.html"