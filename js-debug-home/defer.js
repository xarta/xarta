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



    // DEBUG - SHOW
    if (window.xartaDebug === true)
    {
        for (var i=0; i<document.getElementsByClassName("debug").length; i++)
        {
            document.getElementsByClassName("debug")[i].style.display = "block";
        }

        function log(msg) 
        {
            var p = document.getElementById('log');
            p.innerHTML = msg + "<br>" + p.innerHTML;
        }
    }
    else
    {
        function log(msg)
        {
            // do nothing
        }
    }




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
                setTimeout(function() 
                {
                    document.getElementById('controlsFocus').focus();

                    var path = window.location.pathname;
                    var page = path.split("/").pop();

                    if (!(page === "index-d.html"))
                    {
                        document.getElementById("cameraPos").style.display="block";
                        setTimeout(function() 
                        {
                            document.getElementById('controlsFocus').focus();
                            setTimeout(function() {
                                document.getElementById("cameraPos").style.display="none";
                            }, 50);
                        }, 20);  
                    }
                    console.log("focusing on element to get OrbitControls back");
                }, 20);
            }
        }, 3000);
    }, false);

    navDrawer.addEventListener('touchstart', function(e){
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
                setTimeout(function() 
                {
                    document.getElementById('controlsFocus').focus();

                    var path = window.location.pathname;
                    var page = path.split("/").pop();

                    if (!(page === "index-d.html"))
                    {
                        document.getElementById("cameraPos").style.display="block";
                        setTimeout(function() 
                        {
                            document.getElementById('controlsFocus').focus();
                            setTimeout(function() {
                                document.getElementById("cameraPos").style.display="none";
                            }, 50);
                        }, 20);  
                    }
                    console.log("focusing on element to get OrbitControls back");
                }, 20);
            }
        }, 3000);
    }, false);

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

    // experimenting with touch, for cancelling sticky flyout menu on repeated-tap
    // THIS IS DEPENDENT ON HACKY-WAY OF USING KNOWN INFORMATION ON OPACITY STATE

    for (var i=0; i<document.getElementsByClassName("sticky").length; i++)
    {
        topListButton = document.getElementsByClassName("sticky")[i].id;
        /*
        log("Adding event listener for " + topListButton);
        log("children length: " + document.getElementsByClassName("sticky")[i].children.length);

        for (var k=0; k<document.getElementById(topListButton).children.length; k++)
        {
            log(k + ": " + document.getElementById(topListButton).children[k].innerHTML);
        }
        */

        (function(topListButton) {
            
            // children[0] should be the <a> href link ... using that for touch detect
               var topListButton = document.getElementById(topListButton).children[0].addEventListener('touchstart', function(e){
                var touchlist = e.touches;
                //log(topListButton);
                var alreadySelected = (window.getComputedStyle(document.getElementById(topListButton)).opacity > 0.9);

                window.navDrawer.style.opacity = 1.0;

                //log(topListButton + ": " + alreadySelected);

                if (alreadySelected)
                {
                    document.getElementById(topListButton).classList.toggle("has-hover");
                }
                else
                {
                    document.getElementById(topListButton).classList.add("has-hover");
                }

                if (hasClass( document.getElementById(topListButton), "has-hover"))
                {
                    window.NavHoverState = true;
                    //console.log("window.NavHOverState = true");
                }
                else
                {
                    window.NavHoverState = false;
                    //console.log("window.NavHOverState = false");
                }
                
            }, false);
        })(topListButton);
    }