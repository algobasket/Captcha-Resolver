
I'm using Python 3.8.0 and Node.js v18.10.0

1. You need to configure Google Cloud Vision API
2. Make google service account as owner as permission then download the json file
3. Copy paste the content inside json file to service.json
4. For Linux systems (install_dependencies.sh):

#!/bin/bash

echo "Installing Python 3.8.0 dependencies..."
pip install -r requirements.txt

echo "Installing Node.js v18.10.0 dependencies..."
npm install

5. For Windows (install_dependencies.bat):

@echo off

echo Installing Python 3.8.0 dependencies...
pip install -r requirements.txt

echo Installing Node.js v18.10.0 dependencies...
npm install

6. Click play.bat OR >node script.mjs
