var fs = require('fs');
var channels = fs.readFileSync('channels.m3u').toString().split("\n");


for(var i = 1; i < channels.length - 1; i += 3) {
    
    var filename = ''
    var fileContents = '#EXTM3U\n'+channels[i]+'\n'+channels[i+1]+'\n'+channels[i+2]+'\n'

    if (channels[i].substring(10,13) === 'dvb') {
        filename = channels[i+1].substring(19)
    } else if (channels[i].substring(10,13) === '600') {
        filename = channels[i+1].substring(19)
    } else {
        filename = channels[i].substring(10)        
    }
       
    fs.writeFile('/home/nathan/remotivate-3/scripts/'+filename+'.m3u', fileContents, function(err) {
        if(err) { return console.log(err); }
        console.log("The file was saved!");
    }); 
    
}

