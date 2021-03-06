console.log("defer.js loaded");

var xartalog;
// SEE YOUTUBE SECTION, AND VIDEO SECTION, FOR MORE GLOBALS

function hasClass(el, className)
    {
        if (el.classList)
        {
            //console.log("hasClass(): el.classList");
            return el.classList.contains(className);
        }
        else
        {
            //console.log("hasClass(): new RegExp");
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
        }
    }

(function(){
// DEBUG - SHOW
    if (window.xartaDebug === true)
    {
        for (var i=0; i<document.getElementsByClassName("debug").length; i++)
        {
            document.getElementsByClassName("debug")[i].style.display = "block";
        }

        window.xartalog = function (msg) 
        {
            var p = document.getElementById('log');
            p.innerHTML = msg + "<br>" + p.innerHTML;
        }

        xartalog("<h2>Using staging server: in debug mode:</h2><br>");
    }
    else
    {
        window.xartalog = function (msg)
        {
            console.log(msg);
        }
    }
})();



// https://github.com/luciferous/beepjs -------------------------------------------------------

// only first note will play (as direct consequence of click/guester) on Android Chrome
function play(keys) 
{
    var key = keys.shift();
    if(typeof key == 'undefined') return; // song ended
    new Beep(22050).play(key[0], key[1], [Beep.utils.amplify(8000)], function() { play(keys); });
}

// ---------------------------------------------------------------------------------------------


navDrawer.addEventListener('mouseover', function(e){
    for (let navLi of document.querySelectorAll(".sticky"))
    {
        navLi.classList.remove("has-kbrd-hover");
    } 
    window.navDrawer.style.opacity = 1.0;
    rendererGL.domElement.style.zIndex = YOUTUBEINFRONT;
    window.calmCylinders = true;        // used in scene.js minified to homepage.js
    if ( !(typeof window.moonMesh === 'undefined' || window.moonMesh === null) ) 
    {
        window.moonMesh.material.color.setHex( 0xff0000 );
    }
    clearTimeout(dimDrawer);
    dimDrawer = setTimeout(function() {
        rendererGL.domElement.style.zIndex = YouTubeDefault;
        window.navDrawer.style.opacity = 0.3;
        window.calmCylinders = false;   // used in scene.js minified to homepage.js
        if ( !(typeof window.moonMesh === 'undefined' || window.moonMesh === null) ) 
        {
            window.moonMesh.material.color.setHex( 0xffffff );
        }
        if (window.controls !== null)
        {
             setTimeout(getOrbitControlsFocus(), 20);
        }
    }, 3000);
}, false);

navDrawer.addEventListener('touchstart', function(e){
    for (let navLi of document.querySelectorAll(".sticky"))
    {
        navLi.classList.remove("has-kbrd-hover");
    } 
    usingTouchDevice = TOUCHLIKELY;
    YouTubeDefault = YOUTUBEINFRONT;
    window.calmCylinders = true;        // used in scene.js minified to homepage.js
    window.navDrawer.style.opacity = 1.0;
    rendererGL.domElement.style.zIndex = YOUTUBEINFRONT;
    clearTimeout(dimDrawer);
    dimDrawer = setTimeout(function() 
    {
        window.navDrawer.style.opacity = 0.2;
        window.calmCylinders = false;   // used in scene.js minified to homepage.js
        rendererGL.domElement.style.zIndex = YouTubeDefault;

        if (window.controls !== null)
        {
            setTimeout(getOrbitControlsFocus(), 20);
        }
    }, 3000);
}, false);



navDrawer.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }

    window.calmCylinders = true;        // used in scene.js minified to homepage.js
    window.navDrawer.style.opacity = 1.0;
    rendererGL.domElement.style.zIndex = YOUTUBEINFRONT;
    clearTimeout(dimDrawer);
    dimDrawer = setTimeout(function() 
    {
        window.navDrawer.style.opacity = 0.2;
        window.calmCylinders = false;   // used in scene.js minified to homepage.js
        rendererGL.domElement.style.zIndex = YouTubeDefault;

        if (window.controls !== null)
        {
            setTimeout(getOrbitControlsFocus(), 20);
        }
    }, 3000);

  switch (event.key) {
    case "ArrowDown":
      // Do something for "down arrow" key press.
      break;
    case "ArrowUp":
      // Do something for "up arrow" key press.
      break;
    case "ArrowLeft":
      // Do something for "left arrow" key press.
      break;
    case "ArrowRight":
      // Do something for "right arrow" key press.
      break;
    case "Tab":
      console.log("Navigation: TAB pressed");
      break;
    case "Enter":
      // Do something for "enter" or "return" key press.
      console.log("Navigation: ENTER pressed");
      break;
    case "Escape":
      // Do something for "esc" key press.
      break;
    default:
      return; // Quit when this doesn't handle the key event.
  }
  // Cancel the default action to avoid it being handled twice
  //event.preventDefault();
}, true);

(function(){
    for (let navLi of document.querySelectorAll("#li01, #li02, #li03")) 
    {
        navLi.addEventListener("keydown", function (event) 
        {
            if (event.defaultPrevented) 
            {
                return; // Do nothing if the event was already processed
            }
            
            let focusedhref = document.querySelectorAll('.sticky :focus');
            let focusedLi = focusedhref[0].parentNode;
            let focusedLiID = focusedLi.id;
            let focusedLiNum = focusedLiID.substr(3,1);

            console.log("focusedLiID = " + focusedLiID);
            console.log("focusedLiNum = " + focusedLiNum);
            
            switch (event.key) {
                case "ArrowDown":
                    let newLiNumDown = (focusedLiNum) %3 + 1;
                    document.querySelector("#li0" + newLiNumDown + " a").focus();
                break;
                case "ArrowUp":
                    let newLiNumUp = (focusedLiNum + 4) %3 + 1;
                    document.querySelector("#li0" + newLiNumUp + " a").focus();
                break;
                case "ArrowLeft":
                    document.querySelector("#li0" + focusedLiNum + " li > a").focus();
                    // TODO - navigate children of li01, li02, li03 etc.
                    /**
                     * This will be tricky ... focusedLiNum might be undefined? Check.
                     * Look at siblings?  Count/length children? Just need to index
                     * children that are visible, so can iterate over.
                     * 
                     * nb: don't want ArrowLeft to work if flyout menu isn't out!
                     * Will break page.
                     */
                break;
                case "ArrowRight":
                    // TODO - navigate children of li01, li02, li03 etc.
                break;
                case "Tab":
                    event.preventDefault();
                break;
                case "Enter":
                    for (let navLi of document.querySelectorAll(".sticky:not(#" + focusedLiID + ")"))
                    {
                        navLi.classList.remove("has-kbrd-hover");
                    } 

                    focusedLi.classList.toggle("has-kbrd-hover");
                    event.preventDefault();
                break;
                case "Escape":

                break;
                default:
                return; // Quit when this doesn't handle the key event.
            }
            // Cancel the default action to avoid it being handled twice
            //event.preventDefault();        
        }, true);
    }
})();



function getOrbitControlsFocus()
{
    document.getElementById('controlsFocus').focus();

    var path = window.location.pathname;
    var page = path.split("/").pop();

    if (!(page === "index-d.html"))
    {
        document.getElementById("cameraPos").style.display="block";
        setTimeout(function() 
        {
            // consider how this effects keyboard access - then again Orbitcontrols!
            // but, also, look at tabindex = -1. Need to provide way to menu from
            // keyboard, when in OrbitControls ... TODO: look-up exit key combo

            // ISSUE: might make keyboard flash-up momentarily on Android device
            //        MUST be better way of getting the focus back ... I must be
            //        doing this in a silly way.
            document.getElementById('controlsFocus').focus();
            setTimeout(function() {
                document.getElementById("cameraPos").style.display="none";
            }, 50);
        }, 20);  
    }
    console.log("focusing on element to get OrbitControls back");
}

navDrawer.addEventListener('click', function(e){

    // true by default, changed by touchstart events only
    if(window.NavHoverState === true)
    {
        new Beep(22050).play(2000, 0.05, [Beep.utils.amplify(1000)]);
    }
    else
    {
        if ( !(typeof window.moonMesh === 'undefined' || window.moonMesh === null) ) 
        {
            window.moonMesh.material.color.setHex( 0xffffff );
        }
        new Beep(22050).play(500, 0.05, [Beep.utils.amplify(1000)]);
    }

    
}, false);


orbClick.onmouseover = function()
{
    new Beep(22050).play(2000, 0.05, [Beep.utils.amplify(1000)]);
};
orbClick.onclick = loadOrbitControls;

function loadOrbitControls() {
    console.log("enter loadOrbitControls");
    if (typeof window.controls === 'undefined' || window.controls === null ) 
        {
            console.log("controls are undefinied or null - so will download script and create");
            var script = document.createElement("script");
            script.src = 'js/OrbitControls-min.js';

            play([[392, 0.2], [440, 0.3], [349, 0.2], [175, 0.3], [262, 1]]);

            document.getElementsByTagName('head')[0].appendChild(script);
            
            script.onload = function()
            {
                
                console.log("OrbitControls-min.js loaded");
                window.controls = new THREE.OrbitControls(camera, rendererGL.domElement);
            };

            var path = window.location.pathname;
            var page = path.split("/").pop();
            //console.log( page );
            if (page === "index-d.html")
            {
                document.getElementById("cameraPos").style.display="block";  
            }
            
            // don't want to press the button again
            document.getElementById("orbitControls").style.display="none";
        }
        else
        {
            console.log("Apparently controls already exist");
            
            //window.controls.dispose();
            if(YouTubeDefault == YOUTUBEINFRONT)
            {
                console.log("window.controls.enabled=false");
                window.controls.enabled=false;
            }
            else
            {
                console.log("window.controls.enabled=true");
                window.controls.enabled=true;
            }

        }
    return false;
}




YouTubeLink.addEventListener('touchstart', function(e){
    document.getElementById("li03").classList.toggle("has-hover");
}, false);

YouTubeLink.onclick = function(){
    // toggle z-index of CSS3D renderer (with YouTube)
    // to make controls accssible
    if(YouTubeClickedYet == YOUTUBECLICKED)
    {
        controls.saveState();
        if(usingTouchDevice == TOUCHNOTLIKELY)
        {
            if(YouTubeDefault == YOUTUBEBEHIND)
            {
                YouTubeDefault = YOUTUBEINFRONT;
            }
            else
            {
                YouTubeDefault = YOUTUBEBEHIND;
            }
        }
        else
        {
            screenFullSize("s1"); // ASSUMPTION - SMALL SCREEN IS TOUCH DEVICE - JUST ONE EMBED
        }

    }
    YouTubeClickedYet = YOUTUBECLICKED;
    loadOrbitControls();    // also toggles enabled if already loaded, depending on z-index
    YouTubeVidWall();       // will only add the videos once
    return false;
};

(function(){
    // experimenting with touch, for cancelling sticky flyout menu on repeated-tap
    // THIS IS DEPENDENT ON HACKY-WAY OF USING KNOWN INFORMATION ON OPACITY STATE

    for (var i=0; i<document.getElementsByClassName("sticky").length; i++)
    {
        var topListButtonID = document.getElementsByClassName("sticky")[i].id;
        
        xartalog("Adding event listener for (" + topListButtonID + ").children[0]");
        //xartalog("children length: " + document.getElementsByClassName("sticky")[i].children.length);

        //for (var k=0; k<document.getElementById(topListButtonID).children.length; k++)
        //{
            //xartalog(k + ": " + document.getElementById(topListButtonID).children[k].innerHTML);
        //}
        

        (function(topListButtonID) {
            
            // children[0] should be the <a> href link ... using that for touch detect
                var topListButtonLINK = document.getElementById(topListButtonID).children[0];
                topListButtonLINK.addEventListener('touchstart', function(e)
                {
                    //var touchlist = e.touches;
                    
                    // check out pseudo focus: ... see if can use instead
                    var alreadySelected = (window.getComputedStyle(document.getElementById(topListButtonID)).opacity > 0.9);
                    window.navDrawer.style.opacity = 1.0;

                    xartalog("<h2>touchstart:</h2><br>Already selected (" + topListButtonID + "): " + alreadySelected);

                    if (alreadySelected)
                    {
                        document.getElementById(topListButtonID).classList.toggle("has-hover");
                        xartalog("toggle has-hover");
                    }
                    else
                    {
                        document.getElementById(topListButtonID).classList.add("has-hover");
                        xartalog("add has-hover");
                    }

                    if (hasClass( document.getElementById(topListButtonID), "has-hover"))
                    {
                        window.NavHoverState = true;
                        log("window.NavHoverState = true");
                    }
                    else
                    {
                        window.NavHoverState = false;
                        //console.log("window.NavHOverState = false");
                    }
                }, false);
        })(topListButtonID);
    }
})();




// *********************************************************************************************
/**
 * YOUTUBE
 */

var ytWidth     = 480;              // YouTube
var ytHeight    = 360;
var vidWall     = null;
var Element;
var YtUnderConstruction;
var screens;

Element = function ( id, x, y, z, ry, screenID ) 
{
    var div = document.createElement( 'div' );
    div.setAttribute("id", "vidElementDiv_" +screenID);
    div.style.width = ytWidth.toString() + 'px';
    div.style.height = ytHeight.toString() + 'px';
    div.style.backgroundColor = '#000';    
    div.style.zIndex = '13';  
    
    var divPause = document.createElement( 'div' );
    divPause.setAttribute("id","pause_"+screenID);
    divPause.style.width = ytWidth.toString() + 'px';
    divPause.style.height = (ytHeight-50).toString() + 'px';
    divPause.style.backgroundColor = '#fff';  
    divPause.style.opacity = 0;     // set higher to debug  
    divPause.style.zIndex = '-1';   // relative to iframe
    divPause.style.position = 'relative';
    divPause.style.top = (-ytHeight).toString() + 'px';
    divPause.onclick = function() {
        pauseXartaVideo(screenID);
    }

    var iframe = document.createElement( 'iframe' );
    iframe.setAttribute("id", screenID);
    iframe.setAttribute('allowFullScreen', true);
    iframe.setAttribute('webkitallowfullscreen', true);
    iframe.setAttribute('mozallowfullscreen', true);
    iframe.style.width = ytWidth.toString() + 'px';
    iframe.style.height = ytHeight.toString() + 'px';
    iframe.style.border = '0px';
    iframe.style.zIndex = 0; // just to be clear (bom bom)
    iframe.src = [ 'https://www.youtube.com/embed/', id, '?enablejsapi=1&rel=0&origin=https://xarta.co.uk' ].join( '' );
    div.appendChild( iframe );  
    div.appendChild( divPause );        
    var object = new THREE.CSS3DObject( div );
    
    object.position.set( x, y, z );
    object.rotation.y = ry;         
    return object;
};

YtUnderConstruction = function ( x, y, z, ry, elID ) 
{
    var div = document.createElement( 'div' );
    div.setAttribute("id", elID);
    div.setAttribute("class", "aboveYT");

    div.style.height = (ytHeight *0.8).toString() + 'px';
    div.style.backgroundColor = '#fff';    
    div.style.zIndex = '13';  

    //var button = document.createElement('button');
    
       div.style.fontSize = '1.3rem';
        div.innerHTML=
            "<style>.aboveYT{padding: 5px;} " +
            "." + elID + "{list-style-type: square; list-style-position: inside;" +
            "text-indent: -40px; padding-left: 40px; margin-left: 0;}</style>" +
            "<h1>Under Construction:</h1><ul class='ytuc'>" + 
            "<li>Videos still to be added. Placeholder video: my [partial] Pennine Way walk, 2012.</li>" +
            "<li>I'm planning on making a custom video loading GUI</li>";
    
    // set in index-debug.html
    if(window.YouTubeDefault == YOUTUBEBEHIND)
    {
        div.style.width = (ytWidth *2).toString() + 'px';
        div.innerHTML+=
            "</ul><p>Press the Dave => YouTube menu item again to toggle controls access</p>";
        /*
        var btnText = document.createTextNode('YouTube in front');
        button.onclick = function()
        {
            alert('I was clicked');
        }
        */
    }
    else
    {
        div.style.width = ytWidth.toString() + 'px';
        div.innerHTML+=
            "</ul><p>Press the Dave => YouTube menu item again to make screen1 go fullscreen</p>";
       
        /* var btnText = document.createTextNode('FULL SCREEN');
        button.onclick = function()
        {
            screenFullSize("s1");
        }
        */
    }
    //button.appendChild( btnText );
    //div.appendChild( button );  

    var object = new THREE.CSS3DObject( div );
    
    object.position.set( x, y, z );
    object.rotation.y = ry;         
    return object;
};

function screenFullSize(screenID)
{
    fullScreen(document.getElementById(screenID));
    //screen.orientation.lock('landscape');
}


screens = {s1: null, s2: null, s3: null, s4: null};

function onYouTubeIframeAPIReady() 
{

    screens["s1"] = new YT.Player('s1', 
    {
    events:
        {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    }); 
    
    if( (window.usingTouchDevice !== TOUCHLIKELY) )
    {
        screens["s2"] = new YT.Player('s2', 
        {
        events:
            {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        screens["s3"] = new YT.Player('s3', 
        {
        events:
            {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        screens["s4"] = new YT.Player('s4', 
        {
        events:
            {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    
}

//helper function
function fullScreen(element) {
  if(element.requestFullScreen) {
    element.requestFullScreen();
  } else if(element.webkitRequestFullScreen ) {
    element.webkitRequestFullScreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  }
}

function onPlayerReady(event) {
    //event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {

        // see index-debug.html
        if(window.YouTubeDefault === YOUTUBEINFRONT)
        {
            document.getElementById("ytuc").style.display = "none";
        }
        //alert("pause_" + event.target.getIframe().id);
        //document.getElementById("pause_" + event.target.getIframe().id).style.opacity = 1;
        document.getElementById("pause_" + event.target.getIframe().id).style.zIndex = 1;
    }
}

function stopVideo() {
    //player.stopVideo();
}

function pauseXartaVideo(screenID) {
    screens[screenID].pauseVideo();
    document.getElementById("pause_" + screenID).style.zIndex = -1;
}

function YouTubeVidWall()
{
    if (vidWall === null)
    {
        // DO ONCE
        // TODO: ADD GUI CONTROLS TO CONTROL YOUTUBE VIA IFRAME API
        // HOPEFULLY WILL BE ABLE TO DYNAMICALLY CHANGE CONTENT TOO

        // LOAD YOUTUBE IFRAME PLAYER API -----------------------------
        // 2. This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        // It will look for global function: onYouTubeIframeAPIReady()
        //  ------------------------------------------------------------

        vidWall = new THREE.Group();
        var x = 500;
        var y = -ytHeight;

        var ry = -1 * (Math.PI / 2) ; // rotate about so 90deg on the right

        if( (window.usingTouchDevice == TOUCHLIKELY) )
        {
            var z = -100;
            vidWall.add( new Element( 'DjLwd9Ih8V8', x, y, z, ry, 's1' ) );
            vidWall.add( new YtUnderConstruction(x, y+ytHeight, z, ry, 'ytuc'));
            sceneCSS3D.add( vidWall );
        }
        else
        {
            var z = -200;
            vidWall.add( new Element( 'M7lc1UVf-VE', x, y, z, ry, 's1' ) );
            vidWall.add( new Element( 'DjLwd9Ih8V8', x, y, z+ytWidth, ry, 's2' ) );
            vidWall.add( new Element( 'DjLwd9Ih8V8', x, y+ytHeight, z, ry, 's3' ) );
            vidWall.add( new Element( 'DjLwd9Ih8V8', x, y+ytHeight, z+ytWidth, ry, 's4' ) ); 
            vidWall.add( new YtUnderConstruction(x, y+(2*ytHeight), z+(0.5*ytWidth), ry, 'ytuc'));
            sceneCSS3D.add( vidWall );
        }
        
        if(window.YouTubeDefault == YOUTUBEINFRONT)
        {
            //camera.position.set( -358, 74, 41 );
            // camera.position.set(-170, -217, -72); // hmmm
            camera.position.set(-273,58.43, 57);
        }
        else
        {
            camera.position.set( -498, 20, 45 );
        }
        
        /*
        sceneCSS3D.add(new Element( 'M7lc1UVf-VE', x, y, z, ry, 's1' ) );
        sceneCSS3D.add(new Element( 'DjLwd9Ih8V8', x, y, z+ytWidth, ry, 's2' ) );
        sceneCSS3D.add(new Element( 'DjLwd9Ih8V8', x, y+ytHeight, z, ry, 's3' ) );
        sceneCSS3D.add(new Element( 'DjLwd9Ih8V8', x, y+ytHeight, z+ytWidth, ry, 's4' ) );
        */
    }
 
    // TODO: LOOK AT DOLLY OPTIONS E.G.
    // https://github.com/amelierosser/threejs-camera-dolly/blob/master/index.html

}


// *********************************************************************************************
/**
 * HTML5 VIDEO ELEMENT
 * 
 * IF USING MY SERVER - ADD BIT-RATE THROTTLING
 * HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\InetStp ... set to 9 temporarily
 * IIS: install media services 4.1
 * if ogv, add throttling setting (data ... maybe 200kbs should be plenty)
 * (mp4 ... testing at 100% encoding bitrate)
 * mp4 seems to work on most platforms ... use for now until I can make a selection
 */



html5VidLink.addEventListener('touchstart', function(e){
    document.getElementById("li03").classList.toggle("has-hover");
}, false);

html5VidLink.onclick = function(){
    if ( !(typeof window.html5VidPlayer === 'undefined' || window.html5VidPlayer === null) ) 
    {
        introVideo();
        if (html5VidPlayer.paused) {
            html5VidPlayer.play();
        } else {
            html5VidPlayer.pause();
        }
    }
    else
    {
        new Beep(22050).play(500, 0.05, [Beep.utils.amplify(8000)]);
    }
    return false;
};

var html5VidPlayer = null;      // referred to in scene.js
var videoImageContext = null;   // referred to in scene.js
var videoTexture = null;        // referred to in scene.js

setTimeout(function() {
    // trying this way as issues with mobile click to play (so being "greedy")

    /**
     * the video gets into the videoImageContext in the WebGL render function
     * ... see scene.js (when video present)
     */

    // create the video element html5VidPlayer
    if ( (typeof window.html5VidPlayer === 'undefined' || window.html5VidPlayer === null) ) 
    {
        html5VidPlayer = document.createElement( 'video' );
    }

    // TODO: ALLOW FOR DIFFERENT VIDEO TYPES - LOOK AT AUTOMATED TRANS-THINGIES

	html5VidPlayer.id = 'video';
	// html5VidPlayer.type = ' video/ogg; codecs="theora, vorbis" ';
    html5VidPlayer.crossOrigin = "anonymous";


    /** ********************************************************************
     *  VIDEO SOURCE HERE
     */
    html5VidPlayer.src = "https://xarta.co.uk/videos/underconstruction.mp4";
    // **********************************************************************


	html5VidPlayer.load(); // must call after setting/changing source
    html5VidPlayer.loop = true;
    
    // TODO: GUI / controls using the CSS3Renderer BECAUSE else I'll have to mess about
    // with raycasting etc. within the WebGL scene.  Can't use video element onclick
    // as part of mesh for WebGL object.

}, 4000);


function introVideo()
{
	var videoImage = document.createElement( 'canvas' );
	videoImage.width = 426;
	videoImage.height = 240;

    if ( (typeof window.videoImageContext === 'undefined' || window.videoImageContext === null) ) 
    {
        videoImageContext = videoImage.getContext( '2d' );
    }

	// background color if no video present
	videoImageContext.fillStyle = '#ffffff';
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

    if ( (typeof window.videoTexture === 'undefined' || window.videoTexture === null) ) 
    {
        videoTexture = new THREE.Texture( videoImage );
    }
	
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	
	var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
	// the geometry on which the movie will be displayed;
	// 		movie image will be scaled to fit these dimensions.
	var movieGeometry = new THREE.PlaneGeometry( 426, 240, 4, 4 );
	var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
	movieScreen.position.set(0,50,-300);
	sceneGL.add(movieScreen);
	
	camera.position.set(0,150,300);
	camera.lookAt(movieScreen.position);

}

