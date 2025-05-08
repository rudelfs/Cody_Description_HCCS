For this to work you have to setup the Cody AI.

You do this via (Windows PS commands)

$env:CODY_API_KEY  = 'your key'
$env:CODY_BOT_NAME = 'Creative Bot'

RUN SERVER:

node server.js


if not working: (init package.json)
npm init -y
npm install express
