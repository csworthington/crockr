const shell = require('shelljs');

// Set top level directory as a variable


// Move to client folder
shell.echo('Moving to client folder...');
shell.pushd('./client');

// Run vue-cli build
shell.echo('Building Vue app with Vue-CLI...');
shell.exec('npm run build --dest=dist');

// Move back to parent directory
shell.popd();

// Copy contents of ./client/dist to ./server/views/vue
shell.cp('-R', './client/dist/', './server/views/vue/');

