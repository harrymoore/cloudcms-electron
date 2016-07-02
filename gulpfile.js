// get the dependencies
var gulp        = require('gulp'), 
    childProcess  = require('child_process'), 
    electron      = require('electron-prebuilt');

// create the gulp task
// gulp.task('run', function () { 
//     childProcess.spawn(electron, ['./app'], { stdio: 'inherit' }); 
// });

// create the gulp task DEBUG enabled
gulp.task('run', function () { 
    childProcess.spawn(electron, ['--debug=5858','./app'], { stdio: 'inherit' }); 
});