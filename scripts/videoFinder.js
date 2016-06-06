fs = require('fs')

let videos = []

function findVideos(path) {
  let files = []

  try { files = fs.readdirSync(path) }
  catch (err) { return }
 
  files.forEach(function(file){
    let video = /^.*\.(avi|AVI|wmv|WMV|flv|FLV|mpg|MPG|mp4|MP4)$/
    if (video.test(file))
      videos.push(path+'/'+file)
    else 
      findVideos(path + '/' + file)
  })
}

findVideos(process.env.HOME + '/Downloads')
console.log(videos)
