    var socket = io.connect(window.location.host)

    $( ".app-list" ).load( "apps.html" );
    
    // Find the right method, call on correct element
    function launchIntoFullscreen(element) {
      if(element.requestFullscreen) {
        element.requestFullscreen()
      } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
      } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen()
      }
    }

    $(document).on('click', function() {
      console.log('click')
      // launchIntoFullscreen(document.documentElement)
    })
    
    $(function() {
      FastClick.attach(document.body);
    })
        
    var xPrev = 0
    var yPrev = 0

    var touchRelease = true

    var scrollPrev = 0

    var filterFirstMove = true
    
    // $('.pc-controls').hide()
    $('.shutdown').hide()
    $('.volume').hide()
    
    var emit = function (message, data) {
      console.log(message, data)
      if(data && data.url) {
        openControls()
      } else if (data.file) {
        closeControls()
      }
      socket.emit(message, data)
    }
    
    var searching = false
    $('#text-input').focusout(function () {
      searching = false
      $('#text-input').val('')
    })
    function search () {
      searching = true
      $('#text-input').focus()
    }
    
    var openKeyboard = false
    socket.on('open keyboard', function () {
      $('#text-input').focus()
    })

    var volTimer = null

    var volumeSlider = document.getElementById('volume-slider')

    noUiSlider.create(volumeSlider, {
      start: [ 30 ],
      step: 2,
      range: {
        'min': [  0 ],
        'max': [ 100 ]
      }
    })
    
    volumeSlider.noUiSlider.on('update', function(){
      console.log('volume')
      var volumeLevel = parseInt(volumeSlider.noUiSlider.get())
      if (volumeLevel > 70) {
        //alert('Are you sure?')
      }
      emit('volume', volumeLevel)
    })

    socket.on('volume changed', function (volume) {
      $('.volume').html(volume)
      if (volTimer) {
        clearTimeout(volTimer)
      } else {
        $('.volume').fadeIn()
      }
      volTimer = setTimeout(function() {
        $('.volume').fadeOut()
        volTimer = null
      }, 1000)
    })
    
    function toggleShutdown () {
      $('.shutdown').fadeToggle()
    }
    
    var controls = 'closed'

    $('#controls').click(function () {
      toggleControls()
    })
    
    function openControls () {
      $( ".app-list" ).animate({
        height: $('.main').height() - 480
      }, 200)
      
      $( ".pc-controls" ).animate({
        bottom: 480
      }, 200)
      
      $( ".bottom-buttons" ).css({
        'box-shadow': 'none'
      })

      controls = 'open'
    }
    
    function closeControls () {
      $( ".app-list" ).animate({
        height: $('.main').height()
      }, 200)
      console.log(0 - $('.main').height())
      $( ".pc-controls" ).animate({
        bottom: 0 - $('.main').height()
      }, 200)
      $( ".bottom-buttons" ).css({
        'box-shadow': '0px 0px 10px #000'
      })
      controls = 'closed'        
    }

    function toggleControls () {
      controls === 'open' ? closeControls() : openControls()
    }
    
    $(document).on('touchmove', function (e) {
      // iphone elastic scroll seems impossible to stop without this
      /// can't scroll app list with it though
      //e.originalEvent.preventDefault()
      // cordova?
    })
        
    $(document).on('touchstart', '.touch-pad', function(e) {

      touchRelease = false

      setTimeout(function(){
        if (touchRelease
          && e.originalEvent.touches[0].clientX === xPrev
          && e.originalEvent.touches[0].clientY === yPrev) {
          socket.emit('mouseClick')
        }        
      }, 100)
      
      xPrev = e.originalEvent.touches[0].clientX
      yPrev = e.originalEvent.touches[0].clientY
    })

    $(document).on('touchmove', '.touch-pad', function (e) {
      console.log( 'ontouchmove' )
      e.originalEvent.preventDefault()
      
      var dx = e.originalEvent.touches[0].clientX - xPrev
      var dy = e.originalEvent.touches[0].clientY - yPrev

      xPrev = e.originalEvent.touches[0].clientX
      yPrev = e.originalEvent.touches[0].clientY

      if (!filterFirstMove) {
        socket.emit("touchMove", { dx: dx, dy: dy })
      } else {
        filterFirstMove = false
      }
     
    })
    
    $(document).on('touchend', '.touch-pad', function (e) {
      console.log( 'touchend' )
      touchRelease = true
      filterFirstMove = true
    })

    
    $("#text-input").keyup(function (e) {
      var key = String.fromCharCode(e.keyCode)
      if (searching === true) {
        if(e.keyCode === 13) {
          socket.emit('open', {url: 'https://www.google.com.au/#q='+$("#text-input").val()})
          $("#text-input").val('').blur()
          searching = false
        }
      } else {
        if(e.keyCode === 13) {
          $("#text-input").val('').blur()
          key = 'enter'
        } else if (e.keyCode === 8) {
          key = 'backspace'
        }
        console.log(key)
        socket.emit("type", key)
      }
    })
    
    socket.on('video list', function (list) {
      console.log('vid', list)
      list.forEach(function(video){
        $('.app-list').append(`
        <div class="app" onclick="emit('open', {file: '${video}'})">
          <img src="img/movie.png" width="100%">
        </div>
        `)        
      })
    })
