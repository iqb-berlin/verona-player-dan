# preparing folders
mkdir -p build/unitAuthoring/js
mkdir build/unitAuthoring/css
mkdir build/unitAuthoring/includes
mkdir build/unitAuthoring/polyfills
mkdir build/unitPlayer

tsc

# transpiling code using babeljs
./node_modules/.bin/babel "compilation/typescript_compiled_files" --out-dir "compilation/babeljs_compiled_files"

# bundling up the code
node_modules/.bin/webpack ./compilation/babeljs_compiled_files/unitAuthoring/IQB_UnitAuthoring.js -o "compilation/final_bundles_files/IQB_unitAuthoring_Bundled.js" --mode development
node_modules/.bin/webpack ./compilation/babeljs_compiled_files/unitPlayer/IQB_UnitPlayer.js -o "compilation/final_bundles_files/IQB_unitPlayer_Bundled.js" --mode development

# finishing up unitAuthoring
cp compilation/final_bundles_files/IQB_unitAuthoring_Bundled.js build/unitAuthoring/js/
cp -r src/unitAuthoring/html/* build/unitAuthoring
cp -r src/unitAuthoring/css/* build/unitAuthoring/css/
cp -r src/unitAuthoring/includes/* build/unitAuthoring/includes
cp -r src/polyfills/* build/unitAuthoring/polyfills/

# finishing up unitPlayer
cat src/polyfills/*.js > compilation/polyfills.js

cat src/unitPlayer/misc/firstPart.html > build/unitPlayer/unitPlayer.html
cat src/unitPlayer/misc/scriptStart.txt compilation/polyfills.js src/unitPlayer/misc/scriptEnd.txt >> build/unitPlayer/unitPlayer.html
cat src/unitPlayer/misc/scriptStart.txt src/unitPlayer/includes/jquery.js src/unitPlayer/misc/scriptEnd.txt >> build/unitPlayer/unitPlayer.html
cat src/unitPlayer/misc/scriptStart.txt compilation/final_bundles_files/IQB_unitPlayer_Bundled.js src/unitPlayer/misc/scriptEnd.txt >> build/unitPlayer/unitPlayer.html
cat src/unitPlayer/misc/styleStart.txt src/unitPlayer/includes/pretty-checkbox.css src/unitPlayer/misc/styleEnd.txt >> build/unitPlayer/unitPlayer.html
cat src/unitPlayer/misc/secondPart.html >> build/unitPlayer/unitPlayer.html

# renaming the unitPlayer to the current release
mv build/unitPlayer/unitPlayer.html build/unitPlayer/IQBVisualUnitPlayerV2.99.2.html
