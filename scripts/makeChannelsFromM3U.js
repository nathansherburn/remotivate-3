var fs = require('fs');
var array = fs.readFileSync('channels.m3u').toString().split("\n");
var channels = {}

var fileName = ''

for(i in array) {
    var fileContents = false
    if (array[i].substring(0,7) === '#EXTINF') {
        if (array[i].substring(10,13) === 'dvb') {
            fileName = array[i].substring(28,37)
            console.log('file name: ' + array[i].substring(28,37))
        } else {
            fileName = array[i].substring(10)            
            console.log('file name: ' + array[i].substring(10))
        }
    } else if (array[i][0] !== '#') {
        fileContents = array[i]                    
        console.log('file contents: ', array[i])        
    }
    
    if (fileContents) {
        fs.writeFile('/home/nathan/remotivate-3/scripts/'+fileName+'.vlc', fileContents, function(err) {
            if(err) { return console.log(err); }
            console.log("The file was saved!");
        }); 
    }
    
}

