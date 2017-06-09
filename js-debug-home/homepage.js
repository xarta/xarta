    /**
     * EDIT (XARTA): INITIAL FILEs / INSPIRATION FROM: https://jsfiddle.net/k313cwtx/4/
     *
     * @file This prototype can be used to create a reflector. The implementation
     * can use two variants to create reflection:
     * 
     * 1. Stencil Buffer: First, the logic renders the shape of the reflector to the
     * stencil and color buffer. Then all reflected objects are drawn with activated
     * stencil test and the rest of the stage is rendered normally. The invocation
     * of the reflector's update method must always happen AFTER the invocation of
     * the stage render method.
     * 
     * see: Real-Time Rendering, Third Edition, Akenine-M�ller/Haines/Hoffman
     * Chapter 9.3.1 Planar Reflections
     * 
     * 2. Projective Texture Mapping: This variant renders the reflection into a
     * texture. This map is then applied to the reflector via projective texture
     * mapping. The invocation of the reflector's update method must always happen
     * BEFORE the invocation of the stage render method.
     * 
     * see: http://www.futurenation.net/glbase/reflect.htm
     * 
     * When using this prototype, you must ensure that the autoClear property of
     * renderer is set to false and the stage clears the buffer manually.
     * 
     * @author Human Interactive
     */

    /*"use strict";

    var THREE = require( "three" );*/

    var ReflectorShader = {

        uniforms : {

            // this texture contains the reflection
            "reflectionMap" : {
                type : "t",
                value : null
            },
            
            // this matrix is used for projective texture mapping
            "textureMatrix" : {
                type : "m4",
                value : null
            }

        },

        vertexShader : [

            "uniform mat4 textureMatrix;",
        
            "varying vec4 vUv;",
        
            "void main() {",
        
                // uv coordinates for texture projection
                "vUv = textureMatrix * vec4( position, 1.0 );",
        
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        
            "}"

        ].join( "\n" ),

        fragmentShader : [

            "uniform sampler2D reflectionMap;",
            
            "varying vec4 vUv;",
            
            "void main() {",

                "gl_FragColor = texture2DProj( reflectionMap, vUv );",
            
            "}"

        ].join( "\n" )
    };
    /**
     * Creates a reflector.
     * 
     * @constructor
     * @augments THREE.Mesh
     * 
     * @param {Renderer} renderer - The renderer object.
     * @param {Camera} camera - The camera object.
     * @param {World} world - The world object.
     * @param {object} options - The options of the reflector.
     */
    function Reflector( renderer, camera, world, options ) {

        THREE.Mesh.call( this );

        Object.defineProperties( this, {

            // the width of the reflector
            width : {
                value : 0,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // the height of the reflector
            height : {
                value : 0,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // this value can be used to add a little offset to the normal of the
            // reflection plane. it avoids render errors/ artifacts when working
            // with the stencil buffer
            offset : {
                value : new THREE.Vector3(),
                configurable : false,
                enumerable : true,
                writable : true
            },
            // this value can be used to tweak the clipping if projective texture
            // mapping is used
            clipBias : {
                value : 0,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // approximate resolution value of the render target
            resolution : {
                value : 2048,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // controls the type of reflector algorithm
            useStencilBuffer : {
                value : false,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // a reference to the renderer object
            _renderer : {
                value : renderer,
                configurable : false,
                enumerable : false,
                writable : false
            },
            // a reference to the camera object
            _camera : {
                value : camera,
                configurable : false,
                enumerable : false,
                writable : false
            },
            // a reference to the world object
            _world : {
                value : world,
                configurable : false,
                enumerable : false,
                writable : false
            },
            // the reflection plane of the reflector. this plane will be used to build
            // the reflection matrix
            _reflectionPlane : {
                value : new THREE.Plane(),
                configurable : false,
                enumerable : false,
                writable : false
            },
            // this will be used to transform the virtual camera to the correct
            // viewpoint of the reflector
            _reflectionMatrix : {
                value : new THREE.Matrix4(),
                configurable : false,
                enumerable : false,
                writable : false
            },
            // the virtual camera. it represents the actual view of the reflector
            _reflectorCamera : {
                value : new THREE.PerspectiveCamera(),
                configurable : false,
                enumerable : false,
                writable : false
            },
            // this special scene holds only the reflector for rendering to the
            // stencil buffer. three.js render method can't render single objects,
            // but just scenes
            _sceneReflector : {
                value : null,
                configurable : false,
                enumerable : false,
                writable : true
            },
            // this texture contains the reflection of the reflector
            _reflectionMap : {
                value : null,
                configurable : false,
                enumerable : false,
                writable : true
            },
            // this matrix is used to generate uv coordinates in the shader to map
            // the texture to the reflector's surface
            _textureMatrix : {
                value : null,
                configurable : false,
                enumerable : false,
                writable : true
            },
            // this helper object visualizes the position of the virtual camera
            _cameraHelper : {
                value : null,
                configurable : false,
                enumerable : false,
                writable : true
            },
            // this helper shows the view direction of the reflector's camera
            _directionHelper : {
                value : null,
                configurable : false,
                enumerable : false,
                writable : true
            }
        } );
        
        // transfer the options values to the object
        for ( var property in options )
        {
            if ( options.hasOwnProperty( property ) )
            {
                this[ property ] = options[ property ];
            }
        }

        this._init();
    }

    Reflector.prototype = Object.create( THREE.Mesh.prototype );
    Reflector.prototype.constructor = Reflector;

    /**
     * Update method of the reflector.
     */
    Reflector.prototype.update = function() {
        
        this._beforeRender();

        this._render();
        
        this._afterRender();
    };

    /**
     * This overrides the standard three.js method. If this method is called, we
     * also want to update the reflection entities.
     */
    Reflector.prototype.updateMatrix = function() {

        THREE.Mesh.prototype.updateMatrix.call( this );

        this.makeReflectionPlane();

        this.makeReflectionMatrix();
    };

    /**
     * Creates the reflection plane of the reflector.
     */
    Reflector.prototype.makeReflectionPlane = ( function() {

        var normal, position, quaternion, scale;

        return function() {

            if ( normal === undefined )
            {
                normal = new THREE.Vector3();
                position = new THREE.Vector3();
                quaternion = new THREE.Quaternion();
                scale = new THREE.Vector3();
            }
            
            // ensure matrixWorld is up to date
            this.updateMatrixWorld( true );
            
            // then extract position and orientation 
            this.matrixWorld.decompose( position, quaternion, scale );
            
            // get the normal of the reflector/plane
            normal.set( 0, 0, 1 ).applyQuaternion( quaternion ).normalize();
            
            // optional: tweak the normal to avoid render artifacts ( stencil buffer )
            normal.add( this.offset ).normalize();

            // calculate reflection plane
            this._reflectionPlane.setFromNormalAndCoplanarPoint( normal, position );
        };

    }() );

    /**
     * Creates the reflection matrix of the reflector.
     * 
     * see: 3D Math Primer for Graphics and Game Development (Second Edition),
     * Chapter 5.4 Reflection, 3D matrix to reflect about an arbitrary plane
     */
    Reflector.prototype.makeReflectionMatrix = function() {

        // construct reflection matrix from reflection plane

        this._reflectionMatrix.elements[ 0 ] = -2 * this._reflectionPlane.normal.x * this._reflectionPlane.normal.x + 1;
        this._reflectionMatrix.elements[ 1 ] = -2 * this._reflectionPlane.normal.y * this._reflectionPlane.normal.x;
        this._reflectionMatrix.elements[ 2 ] = -2 * this._reflectionPlane.normal.z * this._reflectionPlane.normal.x;
        this._reflectionMatrix.elements[ 3 ] = 0;

        this._reflectionMatrix.elements[ 4 ] = -2 * this._reflectionPlane.normal.x * this._reflectionPlane.normal.y;
        this._reflectionMatrix.elements[ 5 ] = -2 * this._reflectionPlane.normal.y * this._reflectionPlane.normal.y + 1;
        this._reflectionMatrix.elements[ 6 ] = -2 * this._reflectionPlane.normal.z * this._reflectionPlane.normal.y;
        this._reflectionMatrix.elements[ 7 ] = 0;

        this._reflectionMatrix.elements[ 8 ] = -2 * this._reflectionPlane.normal.x * this._reflectionPlane.normal.z;
        this._reflectionMatrix.elements[ 9 ] = -2 * this._reflectionPlane.normal.y * this._reflectionPlane.normal.z;
        this._reflectionMatrix.elements[ 10 ] = -2 * this._reflectionPlane.normal.z * this._reflectionPlane.normal.z + 1;
        this._reflectionMatrix.elements[ 11 ] = 0;

        this._reflectionMatrix.elements[ 12 ] = -2 * this._reflectionPlane.normal.x * this._reflectionPlane.constant;
        this._reflectionMatrix.elements[ 13 ] = -2 * this._reflectionPlane.normal.y * this._reflectionPlane.constant;
        this._reflectionMatrix.elements[ 14 ] = -2 * this._reflectionPlane.normal.z * this._reflectionPlane.constant;
        this._reflectionMatrix.elements[ 15 ] = 1;
    };

    /**
     * Initializes the reflector.
     */
    Reflector.prototype._init = function() {
        
        // geometry of the reflector
        this.geometry = new THREE.PlaneBufferGeometry( this.width, this.height, 1, 1 );
        
        // no auto-update for virtual camera
        this._reflectorCamera.matrixAutoUpdate = false;
        
        // no auto-update for reflector itself 
        this.matrixAutoUpdate = false;

        // check the usage of the stencil buffer. if set to true, we don't render the reflection to
        // a texture but directly to the world
        if ( this.useStencilBuffer === true )
        {
            // when we don't use a render target, we must ensure that the reflector
            // itself is not written to the depth buffer. otherwise we won't see
            // objects "inside" the reflector
            this.material = new THREE.MeshBasicMaterial( {
                color : this._renderer.getClearColor(),
                depthWrite : false
            } );

            // we need to store the reflector in a separate scene for rendering to
            // the stencil buffer
            this._sceneReflector = new THREE.Scene();
            this._sceneReflector.add( this );
        }
        else
        {
            // custom shader material
            this.material = new THREE.ShaderMaterial( {
                uniforms : THREE.UniformsUtils.clone( ReflectorShader.uniforms ),
                vertexShader : ReflectorShader.vertexShader,
                fragmentShader : ReflectorShader.fragmentShader
            } );

            // create a render target for the reflection texture
            this._createRenderTarget();

            // create texture matrix
            this._textureMatrix = new THREE.Matrix4();

            // assign uniform data
            this.material.uniforms.reflectionMap.value = this._reflectionMap.texture;
            this.material.uniforms.textureMatrix.value = this._textureMatrix;
        }

    };

    /**
     * Render method of the reflector.
     */
    Reflector.prototype._render = function() {

        if ( this.useStencilBuffer === true )
        {
            // draw all reflected objects to the framebuffer
            this._renderer.render( this._world.scene, this._reflectorCamera );
        }
        else
        {
            // draw all reflected objects into the render target
            this._renderer.render( this._world.scene, this._reflectorCamera, this._reflectionMap, true );	
        }

    };

    /**
     * This method is called before rendering.
     */
    Reflector.prototype._beforeRender = function() {

        this._updateCamera();

        if ( this.useStencilBuffer === true )
        {
            this._updateStencilBuffer();
        }
        else
        {
            this._updateTextureMatrix();

            this._updateClipping();
            
            // the reflector should not render itself
            this.material.visible = false;
        }

        // update culling of faces
        this._updateCulling();

    };

    /**
     * This method is called after rendering.
     */
    Reflector.prototype._afterRender = function() {

        var gl = this._renderer.context;
        var glState = this._renderer.state;

        if ( this.useStencilBuffer === true )
        {
            // disable stencil test
            glState.disable( gl.STENCIL_TEST );
        }
        else
        {
            this.material.visible = true;
        }

        this._updateCulling();
    };

    /**
     * This will update the stencil buffer. It ensures that the viewer sees
     * reflected objects only inside the reflector. So it's just a special form of
     * clipping.
     */
    Reflector.prototype._updateStencilBuffer = function() {

        var gl = this._renderer.context;
        var glState = this._renderer.state;

        // enable stencil test
        glState.enable( gl.STENCIL_TEST );
        gl.stencilFunc( gl.ALWAYS, 1, 0xff );
        gl.stencilOp( gl.REPLACE, gl.KEEP, gl.REPLACE );

        // draw reflector to stencil buffer
        this._renderer.render( this._sceneReflector, this._camera );

        // change stencil function and operation for testing
        gl.stencilFunc( gl.EQUAL, 1, 0xff );
        gl.stencilOp( gl.KEEP, gl.KEEP, gl.KEEP );
    };

    /**
     * This will update the virtual camera to the correct view position and
     * orientation.
     */
    Reflector.prototype._updateCamera = function() {

        // we use our reflection matrix to flip the position and orientation of our
        // virtual camera
        this._reflectorCamera.matrix.copy( this._reflectionMatrix ).multiply( this._camera.matrixWorld );

        // update matrices
        this._reflectorCamera.updateMatrixWorld( true );
        this._reflectorCamera.projectionMatrix.copy( this._camera.projectionMatrix );

        // this is only necessary if we render to a texture
        if ( this.useStencilBuffer === false )
        {
            this._reflectorCamera.matrixWorldInverse.getInverse( this._reflectorCamera.matrixWorld );
        }
    };

    /**
     * Updates helper objects.
     */
    Reflector.prototype._updateHelpers = function() {

        this._cameraHelper.position.setFromMatrixPosition( this._reflectorCamera.matrix );
        this._directionHelper.setDirection( this._reflectorCamera.getWorldDirection() );
    };

    /**
     * Adds 3D helper objects for debugging.
     */
    Reflector.prototype._addHelpers = function() {

        var helperGeometry = new THREE.BoxGeometry( 2, 2, 2 );
        var helperMaterial = new THREE.MeshBasicMaterial( {
            color : 0xffffff
        } );

        // create a simple mesh to visualize the position of the reflector camera
        this._cameraHelper = new THREE.Mesh( helperGeometry, helperMaterial );

        // create a arrow to visualize the orientation of the reflector camera
        this._directionHelper = new THREE.ArrowHelper( this._cameraHelper.getWorldDirection(), new THREE.Vector3(), 10 );

        // add helpers to world
        this._cameraHelper.add( this._directionHelper );
        this._world.addObject3D( this._cameraHelper );
    };

    /**
     * This method controls the culling mode of objects. Because reflection reverses
     * the winding order, it is necessary to switch the culling mode for each
     * object.
     */
    Reflector.prototype._updateCulling = function() {

        var index, self;
        
        self = this;

        this._world.scene.traverseVisible( function( object ) {

            if ( object.material !== undefined )
            {
                // multi materials have an array of materials
                if ( object.material instanceof THREE.MultiMaterial )
                {
                    for ( index = 0; index < object.material.materials.length; index++ )
                    {
                        self._flipFaceCulling( object.material.materials[ index ] );
                    }
                }
                else
                {
                    self._flipFaceCulling( object.material );
                }

            }
            
        } );
    };

    /**
     * This method changes between front and back face culling.
     * 
     * @param {THREE.Material} material - The material object.
     */
    Reflector.prototype._flipFaceCulling = function( material ) {

        if ( material.side !== THREE.DoubleSide )
        {
            material.side = ( material.side === THREE.FrontSide ) ? THREE.BackSide : THREE.FrontSide;
        }
    };

    /**
     * Creates the render target that is used to rendering the reflection into a
     * texture.
     */
    Reflector.prototype._createRenderTarget = function() {

        var resolution = new THREE.Vector2();
        var parameter = {
            format : THREE.RGBFormat,
            stencilBuffer : false
        };

        // we check the ratio of the dimensions and calculate an appropriate
        // resolution
        if ( this.width > this.height )
        {
            resolution.x = this.resolution;
            resolution.y = Math.floor( this.resolution * ( this.height / this.width ) );

        }
        else
        {
            resolution.x = Math.floor( this.resolution * ( this.width / this.height ) );
            resolution.y = this.resolution;
        }

        // create the render target
        this._reflectionMap = new THREE.WebGLRenderTarget( resolution.x, resolution.y, parameter );
    };

    /**
     * This will update the texture matrix that is used for projective texture
     * mapping in the shader.
     * 
     * see: http://developer.download.nvidia.com/assets/gamedev/docs/projective_texture_mapping.pdf
     */
    Reflector.prototype._updateTextureMatrix = function() {

        // this matrix does range mapping to [ 0, 1 ]
        this._textureMatrix.set( 0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0 );

        // we use "Object Linear Texgen", so we need to multiply the texture matrix T
        // (matrix above) with the projection and view matrix of the virtual camera
        // and the model matrix of the 3D object (the reflector)
        this._textureMatrix.multiply( this._reflectorCamera.projectionMatrix );
        this._textureMatrix.multiply( this._reflectorCamera.matrixWorldInverse );
        this._textureMatrix.multiply( this.matrixWorld );
    };

    /**
     * This method creates an oblique view frustum for clipping.
     * 
     * see: Lengyel, Eric. �Oblique View Frustum Depth Projection and Clipping�.
     * Journal of Game Development, Vol. 1, No. 2 (2005), Charles River Media, pp.
     * 5�16.
     */
    Reflector.prototype._updateClipping = ( function() {

        var clipPlane, clipVector, q;

        return function() {

            // shortcut
            var projectionMatrix = this._reflectorCamera.projectionMatrix;

            if ( clipPlane === undefined )
            {
                clipPlane = new THREE.Plane();
                clipVector = new THREE.Vector4();
                q = new THREE.Vector4();
            }

            // copy the reflection plane and apply the inverse world matrix of the
            // reflector camera
            clipPlane.copy( this._reflectionPlane );
            clipPlane.applyMatrix4( this._reflectorCamera.matrixWorldInverse );

            // we transfer the information of our plane to a four component vector
            clipVector.set( clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.constant );

            // calculate the clip-space corner point opposite the clipping plane and
            // transform it into camera space by multiplying it by the inverse of
            // the projection matrix
            q.x = ( Math.sign( clipVector.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
            q.y = ( Math.sign( clipVector.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
            q.z = - 1.0;
            q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

            // calculate the scaled plane vector
            clipVector.multiplyScalar( 2.0 / clipVector.dot( q ) );

            // replacing the third row of the projection matrix
            projectionMatrix.elements[ 2 ] = clipVector.x;
            projectionMatrix.elements[ 6 ] = clipVector.y;
            projectionMatrix.elements[ 10 ] = clipVector.z + 1.0 - this.clipBias;
            projectionMatrix.elements[ 14 ] = clipVector.w;
        };

    }() );

    /*module.exports = Reflector;
    module.exports = Reflector;*/
    /**
     * @file This prototype can be used to create a refractor. The logic renders
     * everything behind a clipping plane into a texture. The associated shader
     * program can implement different effects like distortions. Compared with the
     * reflector this prototype provides just one type of rendering.
     * 
     * 1. Projective Texture Mapping: This variant renders the refraction into a
     * texture map. This map is then applied to the refractor via projective texture
     * mapping. The invocation of the refractor's update method must always happen
     * BEFORE the invocation of the stage render method.
     * 
     * @author Human Interactive
     */

    /*"use strict";

    var THREE = require( "three" );

    var RefractorShader = require( "../shader/RefractorShader" );*/
    var RefractorShader = {

        uniforms : {

            // this texture contains the refraction
            "refractionMap" : {
                type : "t",
                value : null
            },
            
            // this matrix is used for projective texture mapping
            "textureMatrix" : {
                type : "m4",
                value : null
            }

        },

        vertexShader : [

            "uniform mat4 textureMatrix;",
        
            "varying vec4 vUv;",
        
            "void main() {",
        
                // uv coordinates for texture projection
                "vUv = textureMatrix * vec4( position, 1.0 );",
        
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        
            "}"

        ].join( "\n" ),

        fragmentShader : [

            "uniform sampler2D refractionMap;",
            
            "varying vec4 vUv;",
            
            "void main() {",

                "gl_FragColor = texture2DProj( refractionMap, vUv );",
            
            "}"

        ].join( "\n" )
    };
    /**
     * Creates a refractor.
     * 
     * @constructor
     * @augments THREE.Mesh
     * 
     * @param {Renderer} renderer - The renderer object.
     * @param {Camera} camera - The camera object.
     * @param {World} world - The world object.
     * @param {object} options - The options of the refractor.
     */
    function Refractor( renderer, camera, world, options ) {

        THREE.Mesh.call( this );

        Object.defineProperties( this, {

            // the width of the refractor
            width : {
                value : 0,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // the height of the refractor
            height : {
                value : 0,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // this value can be used to tweak the clipping
            clipBias : {
                value : 0,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // approximate resolution value of the render target
            resolution : {
                value : 2048,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // a reference to the renderer object
            _renderer : {
                value : renderer,
                configurable : false,
                enumerable : false,
                writable : false
            },
            // a reference to the camera object
            _camera : {
                value : camera,
                configurable : false,
                enumerable : false,
                writable : false
            },
            // a reference to the world object
            _world : {
                value : world,
                configurable : false,
                enumerable : false,
                writable : false
            },
            // this will be used as a clipping plane
            _refractionPlane : {
                value : new THREE.Plane(),
                configurable : false,
                enumerable : false,
                writable : false
            },
            // the virtual camera. it represents the actual view of the refractor
            _refractorCamera : {
                value : new THREE.PerspectiveCamera(),
                configurable : false,
                enumerable : false,
                writable : false
            },
            // this texture contains the refraction
            _refractionMap : {
                value : null,
                configurable : false,
                enumerable : false,
                writable : true
            },
            // this matrix is used to generate uv coordinates in the shader to map
            // the texture to the refractor's surface
            _textureMatrix : {
                value : null,
                configurable : false,
                enumerable : false,
                writable : true
            }
        } );
        
        // transfer the options values to the object
        for ( var property in options )
        {
            if ( options.hasOwnProperty( property ) )
            {
                this[ property ] = options[ property ];
            }
        }

        this._init();
    }

    Refractor.prototype = Object.create( THREE.Mesh.prototype );
    Refractor.prototype.constructor = Refractor;

    /**
     * Update method of the refractor.
     */
    Refractor.prototype.update = function() {
        
        this._beforeRender();

        this._render();
        
        this._afterRender();
    };

    /**
     * This overrides the standard three.js method. If this method is called, we
     * also want to update the refraction plane.
     */
    Refractor.prototype.updateMatrix = function() {

        THREE.Mesh.prototype.updateMatrix.call( this );

        this.makeRefractionPlane();
    };

    /**
     * Creates the clipping plane of the refractor.
     */
    Refractor.prototype.makeRefractionPlane = ( function() {

        var normal, position, quaternion, scale;

        return function() {

            if ( normal === undefined )
            {
                normal = new THREE.Vector3();
                position = new THREE.Vector3();
                quaternion = new THREE.Quaternion();
                scale = new THREE.Vector3();
            }
            
            // ensure matrixWorld is up to date
            this.updateMatrixWorld( true );
            
            // then extract position and orientation 
            this.matrixWorld.decompose( position, quaternion, scale );
            
            // get the normal of the refractor plane
            normal.set( 0, 0, 1 ).applyQuaternion( quaternion ).normalize();
            
            // flip the normal, because we want to cull everything above the plane
            normal.negate();
            
            // calculate refractor plane
            this._refractionPlane.setFromNormalAndCoplanarPoint( normal, position );
        };

    }() );

    /**
     * Initializes the refractor.
     */
    Refractor.prototype._init = function() {
        
        // geometry of the refractor
        this.geometry = new THREE.PlaneBufferGeometry( this.width, this.height, 1, 1 );

        // custom shader material
        this.material = new THREE.ShaderMaterial( {
            uniforms : THREE.UniformsUtils.clone( RefractorShader.uniforms ),
            vertexShader : RefractorShader.vertexShader,
            fragmentShader : RefractorShader.fragmentShader
        } );
            
        // create a render target for the refraction texture
        this._createRenderTarget();
        
        // create texture matrix
        this._textureMatrix = new THREE.Matrix4();
        
        // assign uniform data
        this.material.uniforms.refractionMap.value = this._refractionMap.texture;
        this.material.uniforms.textureMatrix.value = this._textureMatrix;
        
        // no auto-update for virtual camera
        this._refractorCamera.matrixAutoUpdate = false;
        
        // no auto-update for refractor itself 
        this.matrixAutoUpdate = false;
    };

    /**
     * Render method of the refractor.
     */
    Refractor.prototype._render = function() {
        
        this._renderer.render( this._world.scene, this._refractorCamera, this._refractionMap, true );
    };

    /**
     * This method is called before rendering.
     */
    Refractor.prototype._beforeRender = function() {
        
        // the refractor should not render itself
        this.material.visible = false;

        this._updateCamera();
        
        this._updateTextureMatrix();
        
        this._updateClipping();
    };

    /**
     * This method is called after rendering.
     */
    Refractor.prototype._afterRender = function() {

        this.material.visible = true;
    };


    /**
     * This will update the virtual camera to the correct view position and
     * orientation.
     */
    Refractor.prototype._updateCamera = function() {

        // we just copy the values of our camera to the virtual camera of the refractor
        this._refractorCamera.matrix.copy( this._camera.matrixWorld );
        this._refractorCamera.updateMatrixWorld( true );
        this._refractorCamera.projectionMatrix.copy( this._camera.projectionMatrix );
        this._refractorCamera.matrixWorldInverse.getInverse( this._refractorCamera.matrixWorld );
    };

    /**
     * Creates the render target that is used to rendering the refraction into a
     * texture.
     */
    Refractor.prototype._createRenderTarget = function() {

        var resolution = new THREE.Vector2();
        var parameter = {
            format : THREE.RGBFormat,
            stencilBuffer : false
        };

        // we check the ratio of the dimensions and calculate an appropriate
        // resolution
        if ( this.width > this.height )
        {
            resolution.x = this.resolution;
            resolution.y = Math.floor( this.resolution * ( this.height / this.width ) );

        }
        else
        {
            resolution.x = Math.floor( this.resolution * ( this.width / this.height ) );
            resolution.y = this.resolution;
        }

        // create the render target
        this._refractionMap = new THREE.WebGLRenderTarget( resolution.x, resolution.y, parameter );
    };

    /**
     * This will update the texture matrix that is used for projective texture
     * mapping in the shader.
     * 
     * see: http://developer.download.nvidia.com/assets/gamedev/docs/projective_texture_mapping.pdf
     */
    Refractor.prototype._updateTextureMatrix = function() {

        // this matrix does range mapping to [ 0, 1 ]
        this._textureMatrix.set( 0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0 );

        // we use "Object Linear Texgen", so we need to multiply the texture matrix T
        // (matrix above) with the projection and view matrix of the virtual camera
        // and the model matrix of the 3D object (the refractor)
        this._textureMatrix.multiply( this._refractorCamera.projectionMatrix );
        this._textureMatrix.multiply( this._refractorCamera.matrixWorldInverse );
        this._textureMatrix.multiply( this.matrixWorld );
    };

    /**
     * This method creates an oblique view frustum for clipping.
     * 
     * see: Lengyel, Eric. �Oblique View Frustum Depth Projection and Clipping�.
     * Journal of Game Development, Vol. 1, No. 2 (2005), Charles River Media, pp.
     * 5�16.
     */
    Refractor.prototype._updateClipping = ( function() {

        var clipPlane, clipVector, q;

        return function() {

            // shortcut
            var projectionMatrix = this._refractorCamera.projectionMatrix;

            if ( clipPlane === undefined )
            {
                clipPlane = new THREE.Plane();
                clipVector = new THREE.Vector4();
                q = new THREE.Vector4();
            }

            // copy the reflection plane and apply the inverse world matrix of the
            // refractor camera
            clipPlane.copy( this._refractionPlane );
            clipPlane.applyMatrix4( this._refractorCamera.matrixWorldInverse );

            // we transfer the information of our plane to a four component vector
            clipVector.set( clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.constant );

            // calculate the clip-space corner point opposite the clipping plane and
            // transform it into camera space by multiplying it by the inverse of
            // the projection matrix
            q.x = ( Math.sign( clipVector.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
            q.y = ( Math.sign( clipVector.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
            q.z = - 1.0;
            q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

            // calculate the scaled plane vector
            clipVector.multiplyScalar( 2.0 / clipVector.dot( q ) );

            // replacing the third row of the projection matrix
            projectionMatrix.elements[ 2 ] = clipVector.x;
            projectionMatrix.elements[ 6 ] = clipVector.y;
            projectionMatrix.elements[ 10 ] = clipVector.z + 1.0 - this.clipBias;
            projectionMatrix.elements[ 14 ] = clipVector.w;
        };

    }() );
    /*
    module.exports = Refractor;*/
    /**
     * @file This shader is used as a material for a water mesh.
     *
     * @author Human Interactive
     */

    // "use strict";

    // var THREE = require( "three" );

    // module.exports
    WaterShader = {

        uniforms : {

            // this texture contains the reflection of the water
            "reflectionMap" : {
                type : "t",
                value : null
            },

            // this texture contains the refraction of the water
            "refractionMap" : {
                type : "t",
                value : null
            },

            // this texture contains the flow of the water
            "flowMap" : {
                type : "t",
                value : null
            },

            // this texture is used to create a more realistic water flow
            "noiseMap" : {
                type : "t",
                value : null
            },

            // this texture will be used to retrieve normals
            "normalMap0" : {
                type : "t",
                value : null
            },

            // this texture will be used to retrieve normals
            "normalMap1" : {
                type : "t",
                value : null
            },

            // this matrix is used for projective texture mapping
            "textureMatrixReflection" : {
                type : "m4",
                value : null
            },

            // this matrix is used for projective texture mapping
            "textureMatrixRefraction" : {
                type : "m4",
                value : null
            },

            // first offset of the flowmap
            "flowMapOffset0" : {
                type : "f",
                value : 0
            },

            // second offset of the flowmap
            "flowMapOffset1" : {
                type : "f",
                value : 0
            },

            // color of the water
            "waterColor" : {
                type : "c",
                value : null
            },

            // the reflectivity of the water
            "waterReflectivity" : {
                type : "f",
                value : 0.02
            },

            // the direction of the light
            "lightDirection" : {
                type : "v3",
                value : null
            },

            // the color of the light
            "lightColor" : {
                type : "c",
                value : null
            },

            // the shininess of the water
            "shininess" : {
                type : "f",
                value : 20.0
            },

            // the segments of the water
            "segments" : {
                type : "f",
                value : 1.0
            },

            // half cycle of a flow map phase
            "halfCycle" : {
                type : "f",
                value : 0.0
            }

        },

        vertexShader : [

            "uniform mat4 textureMatrixReflection;",
            "uniform mat4 textureMatrixRefraction;",

            "uniform float segments;",

            "varying vec4 vUvReflect;",
            "varying vec4 vUvRefract;",
            "varying vec3 vToEye;",
            "varying vec2 vUv;",
            "varying float vTexScale;",

            "void main() {",

                "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

                // default uv coordinates
                "vUv = uv;",

                // used for scaling of normal maps
                "vTexScale = segments;",

                // uv coordinates for texture projection
                "vUvReflect = textureMatrixReflection * vec4( position, 1.0 );",
                "vUvRefract = textureMatrixRefraction * vec4( position, 1.0 );",

                // calculate toEye vector
                "vToEye = cameraPosition - worldPosition.xyz;",

                "gl_Position = projectionMatrix * viewMatrix * worldPosition;",

            "}"

        ].join( "\n" ),

        fragmentShader : [

            "uniform sampler2D reflectionMap;",
            "uniform sampler2D refractionMap;",
            "uniform sampler2D flowMap;",
            "uniform sampler2D noiseMap;",
            "uniform sampler2D normalMap0;",
            "uniform sampler2D normalMap1;",

            "uniform vec3 lightDirection;",
            "uniform vec3 lightColor;",
            "uniform vec3 waterColor;",

            "uniform float flowMapOffset0;",
            "uniform float flowMapOffset1;",
            "uniform float waterReflectivity;",
            "uniform float shininess;",
            "uniform float halfCycle;",

            "varying vec4 vUvReflect;",
            "varying vec4 vUvRefract;",
            "varying vec3 vToEye;",
            "varying vec2 vUv;",
            "varying float vTexScale;",

            "void main() {",

                "vec3 toEye = normalize( vToEye );",

                // sample flow map
                "vec2 flow = texture2D( flowMap, vUv ).rg * 2.0 - 1.0;",
                "flow.r *= -1.0;",

                // sample noise map
                "float cycleOffset = texture2D( noiseMap, vUv ).r;",

                // calculate current phases
                "float phase0 = cycleOffset * 0.5 + flowMapOffset0;",
                "float phase1 = cycleOffset * 0.5 + flowMapOffset1;",

                // sample normal maps
                "vec4 normalColor0 = texture2D( normalMap0, ( vUv * vTexScale ) + flow * phase0 );",
                "vec4 normalColor1 = texture2D( normalMap1, ( vUv * vTexScale ) + flow * phase1 );",

                // linear interpolate to get the final normal color
                "float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;",
                "vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );",

                // determine the normal vector
                "vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );",

                // fresnel effect
                "float theta = max( dot( toEye, normal ), 0.0 );",
                "float reflectance = waterReflectivity + ( 1.0 - waterReflectivity ) * pow( ( 1.0 - theta ), 5.0 );",

                // light calculation
                "vec3 reflectedLight = normalize( reflect( -lightDirection, normal ) );",
                "float specular = pow( max( dot( reflectedLight, toEye ), 0.0 ) , shininess );",
                "vec4 specularColor =  vec4( lightColor * specular, 0.0 );",

                // sample textures
                "vec3 uvReflect = vUvReflect.xyz / vUvReflect.w;",
                "vec3 uvRefract = vUvRefract.xyz / vUvRefract.w;",

                "vec4 reflectColor = texture2D( reflectionMap, uvReflect.xy + uvReflect.z * normal.xz * 0.05 );",
                "vec4 refractColor = texture2D( refractionMap, uvRefract.xy + uvRefract.z * normal.xz * 0.05 );",

                // multiply water color with the mix of both textures. then add lighting
                "gl_FragColor = vec4( waterColor, 1.0 ) * mix( refractColor, reflectColor, reflectance ) + specularColor;",

            "}"

        ].join( "\n" )
    };
    /**
     * @file This file creates a realistic and expensive water effect. The material
     * is real-time reflective & refractive, it calculates a distortion and flow of
     * the water surface and implements a basic fresnel and lighting equation.
     * 
     * @author Human Interactive
     */
    /*
    "use strict";

    var THREE = require( "three" );
    var Reflector = require( "./Reflector" );
    var Refractor = require( "./Refractor" );

    var WaterShader = require( "../shader/WaterShader" );*/

    /**
     * Creates a water.
     * 
     * @constructor
     * @augments THREE.Mesh
     * 
     * @param {Renderer} renderer - The renderer object.
     * @param {Camera} camera - The camera object.
     * @param {World} world - The world object.
     * @param {object} options - The options of the reflector.
     */
    function Water( renderer, camera, world, options ) {
        
        THREE.Mesh.call( this );
        
        Object.defineProperties( this, {

            // the width of the water mesh
            width : {
                value : 0,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // the height of the water mesh
            height : {
                value : 0,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // approximate resolution value of the render target
            resolution : {
                value : 2048,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // speed of the water motions
            waterSpeed : {
                value : 0.03,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // the color of the water
            waterColor : {
                value : new THREE.Color(),
                configurable : false,
                enumerable : true,
                writable : true
            },
            // the reflectivity of the water
            waterReflectivity : {
                value : 0.02,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // the direction of the light
            lightDirection : {
                value : new THREE.Vector3( 0, 1, 0),
                configurable : false,
                enumerable : true,
                writable : true
            },
            // the color of the light
            lightColor : {
                value : new THREE.Color(),
                configurable : false,
                enumerable : true,
                writable : true
            },
            // the shininess of the water
            shininess : {
                value : 20,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // the amount of segments of the water geometry
            segments : {
                value : 1,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // a cycle of a flow map phase
            cycle : {
                value : 0.15,
                configurable : false,
                enumerable : true,
                writable : true
            },
            // a reference to the renderer object
            _renderer : {
                value : renderer,
                configurable : false,
                enumerable : false,
                writable : false
            },
            // a reference to the camera object
            _camera : {
                value : camera,
                configurable : false,
                enumerable : false,
                writable : false
            },
            // a reference to the world object
            _world : {
                value : world,
                configurable : false,
                enumerable : false,
                writable : false
            },
            // a reference to a reflector
            _reflector : {
                value : null,
                configurable : false,
                enumerable : false,
                writable : true
            },
            // a reference to a refractor
            _refractor : {
                value : null,
                configurable : false,
                enumerable : false,
                writable : true
            },
            // half cycle of a flow map phase
            _halfCycle : {
                value : 0,
                configurable : false,
                enumerable : false,
                writable : true
            }
        } );
        
        // transfer the options values to the object
        for ( var property in options )
        {
            if ( options.hasOwnProperty( property ) )
            {
                this[ property ] = options[ property ];
            }
        }

        this._init();
    }

    Water.prototype = Object.create( THREE.Mesh.prototype );
    Water.prototype.constructor = Water;

    /**
     * Update method of the water.
     * 
     * @param {number} delta - The delta time value.
     */
    Water.prototype.update = function( delta ) {

        // the water should not render itself
        this.material.visible = false;

        // update reflection and refraction
        this._reflector.update();
        this._refractor.update();

        // make material visible again
        this.material.visible = true;

        // update water properties
        this.material.uniforms.waterColor.value = this.waterColor;
        this.material.uniforms.waterReflectivity.value = this.waterReflectivity;

        // update light properties
        this.material.uniforms.lightDirection.value = this.lightDirection;
        this.material.uniforms.lightColor.value = this.lightColor;
        this.material.uniforms.shininess.value = this.shininess;

        // update water flow properties
        this.material.uniforms.flowMapOffset0.value += this.waterSpeed * delta;
        this.material.uniforms.flowMapOffset1.value += this.waterSpeed * delta;

        // reset properties if necessary
        if ( this.material.uniforms.flowMapOffset0.value >= this.cycle )
        {
            this.material.uniforms.flowMapOffset0.value = 0;

            // if the delta value is high, "flowMapOffset1" must not set to zero
            // but to its initial value to avoid a "reset" effect
            if ( this.material.uniforms.flowMapOffset1.value >= this.cycle )
            {
                this.material.uniforms.flowMapOffset1.value = this._halfCycle;

                return;
            }
        }

        if ( this.material.uniforms.flowMapOffset1.value >= this.cycle )
        {
            this.material.uniforms.flowMapOffset1.value = 0;
        }
    };

    /**
     * This overrides the standard three.js method. It ensures that other components
     * of the water have the same position and orientation.
     */
    Water.prototype.updateMatrix = function() {

        THREE.Mesh.prototype.updateMatrix.call( this );
        
        // just copy the matrix
        this._reflector.matrix.copy( this.matrix );
        this._refractor.matrix.copy( this.matrix );
        
        // update entities for reflection and refraction
        this._reflector.makeReflectionPlane();	
        this._reflector.makeReflectionMatrix();
        
        this._refractor.makeRefractionPlane();
    };

    /**
     * Initializes the water.
     */
    Water.prototype._init = function() {
        
        // geometry of the reflector
        this.geometry = new THREE.PlaneBufferGeometry( this.width, this.height, this.segments, this.segments );
        
        // custom shader material
        this.material = new THREE.ShaderMaterial( {
            uniforms : THREE.UniformsUtils.clone( WaterShader.uniforms ),
            vertexShader : WaterShader.vertexShader,
            fragmentShader : WaterShader.fragmentShader
        } );

        // create reflector
        this._reflector = new Reflector( this._renderer, this._camera, this._world, {
            width: this.width,
            height: this.height,
            resolution: this.resolution
        });
        
        // create refractor
        this._refractor = new Refractor( this._renderer, this._camera, this._world, {
            width: this.width,
            height: this.height,
            resolution: this.resolution
        });
        
        // calculate half cycle
        this._halfCycle = this.cycle * 0.5;
        
        // load flow and noise map
        var flowMap = new THREE.TextureLoader().setCrossOrigin(true).load( "https://res.cloudinary.com/xarta/image/upload/v1496407928/xarta/Eu0MQrk.png" );
        var noiseMap = new THREE.TextureLoader().setCrossOrigin(true).load( "https://res.cloudinary.com/xarta/image/upload/v1496407928/xarta/KmwuMPu.jpg" );
        
        // load normal maps
        var normalMap0 = new THREE.TextureLoader().setCrossOrigin(true).load( "https://res.cloudinary.com/xarta/image/upload/v1496407928/xarta/8pUBeuw.jpg" );
        normalMap0.wrapS = normalMap0.wrapT = THREE.RepeatWrapping;
        
        var normalMap1 = new THREE.TextureLoader().setCrossOrigin(true).load( "https://res.cloudinary.com/xarta/image/upload/v1496407928/xarta/fB9BaJJ.jpg" );
        normalMap1.wrapS = normalMap1.wrapT = THREE.RepeatWrapping;
            
        // set reflection and refraction map
        this.material.uniforms.reflectionMap.value = this._reflector._reflectionMap.texture;
        this.material.uniforms.refractionMap.value = this._refractor._refractionMap.texture;

        // set texture matrices for projective texture mapping
        this.material.uniforms.textureMatrixReflection.value = this._reflector._textureMatrix;
        this.material.uniforms.textureMatrixRefraction.value = this._refractor._textureMatrix;
        
        // set flow, noise and normal map to uniforms
        this.material.uniforms.flowMap.value = flowMap;
        this.material.uniforms.noiseMap.value = noiseMap;
        this.material.uniforms.normalMap0.value = normalMap0;
        this.material.uniforms.normalMap1.value = normalMap1;

        // set the amount of segments of the water. this value determines, how often
        // normal maps are repeated
        this.material.uniforms.segments.value = this.segments;
        
        // set default values for water flow
        this.material.uniforms.flowMapOffset0.value = 0;
        this.material.uniforms.flowMapOffset1.value = this._halfCycle;
        this.material.uniforms.halfCycle.value = this._halfCycle;
        
        // no auto-update for water
        this.matrixAutoUpdate = false;
    };

    // module.exports = Water;




/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finger swipe

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {

		return spherical.phi;

	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;

	};

	this.saveState = function () {

		scope.target0.copy( scope.target );
		scope.position0.copy( scope.object.position );
		scope.zoom0 = scope.object.zoom;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {

		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function update() {

			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			// restrict theta to be between desired limits
			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

			// restrict phi to be between desired limits
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

			spherical.makeSafe();


			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

			}

			scale = 1;
			panOffset.set( 0, 0, 0 );

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};

	}();

	this.dispose = function () {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {

		sphericalDelta.theta -= angle;

	}

	function rotateUp( angle ) {

		sphericalDelta.phi -= angle;

	}

	var panLeft = function () {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function () {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 1 ); // get Y column of objectMatrix
			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {

		var offset = new THREE.Vector3();

		return function pan( deltaX, deltaY ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object instanceof THREE.PerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we actually don't use screenWidth, since perspective camera is fixed to screen height
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

			} else if ( scope.object instanceof THREE.OrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();

	function dollyIn( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	function dollyOut( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownDolly( event ) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		//console.log( 'handleMouseDownPan' );

		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveRotate( event ) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleMouseMoveDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseUp( event ) {

		// console.log( 'handleMouseUp' );

	}

	function handleMouseWheel( event ) {

		// console.log( 'handleMouseWheel' );

		if ( event.deltaY < 0 ) {

			dollyOut( getZoomScale() );

		} else if ( event.deltaY > 0 ) {

			dollyIn( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function handleTouchStartRotate( event ) {

		//console.log( 'handleTouchStartRotate' );

		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchStartDolly( event ) {

		//console.log( 'handleTouchStartDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyStart.set( 0, distance );

	}

	function handleTouchStartPan( event ) {

		//console.log( 'handleTouchStartPan' );

		panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchMoveRotate( event ) {

		//console.log( 'handleTouchMoveRotate' );

		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleTouchMoveDolly( event ) {

		//console.log( 'handleTouchMoveDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyIn( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleTouchMovePan( event ) {

		//console.log( 'handleTouchMovePan' );

		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleTouchEnd( event ) {

		//console.log( 'handleTouchEnd' );

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( event.button ) {

			case scope.mouseButtons.ORBIT:

				if ( scope.enableRotate === false ) return;

				handleMouseDownRotate( event );

				state = STATE.ROTATE;

				break;

			case scope.mouseButtons.ZOOM:

				if ( scope.enableZoom === false ) return;

				handleMouseDownDolly( event );

				state = STATE.DOLLY;

				break;

			case scope.mouseButtons.PAN:

				if ( scope.enablePan === false ) return;

				handleMouseDownPan( event );

				state = STATE.PAN;

				break;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( state ) {

			case STATE.ROTATE:

				if ( scope.enableRotate === false ) return;

				handleMouseMoveRotate( event );

				break;

			case STATE.DOLLY:

				if ( scope.enableZoom === false ) return;

				handleMouseMoveDolly( event );

				break;

			case STATE.PAN:

				if ( scope.enablePan === false ) return;

				handleMouseMovePan( event );

				break;

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

		event.preventDefault();
		event.stopPropagation();

		handleMouseWheel( event );

		scope.dispatchEvent( startEvent ); // not sure why these are here...
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;

				handleTouchStartRotate( event );

				state = STATE.TOUCH_ROTATE;

				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;

				handleTouchStartDolly( event );

				state = STATE.TOUCH_DOLLY;

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;

				handleTouchStartPan( event );

				state = STATE.TOUCH_PAN;

				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			scope.dispatchEvent( startEvent );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...

				handleTouchMoveRotate( event );

				break;

			case 2: // two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

				handleTouchMoveDolly( event );

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;
				if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

				handleTouchMovePan( event );

				break;

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		event.preventDefault();

	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties( THREE.OrbitControls.prototype, {

	center: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.enableDamping = ! value;

		}

	},

	dynamicDampingFactor: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.dampingFactor = value;

		}

	}

} );
var camera, controls, scene, renderer, clock;   // water stuff
                                                // xarta using as a foundation
// testing
// animation sequences (calling them phases)
var phaseCubeApproach = true;   // X A R T A cubes - approaching us
var phaseMoonPushBack = true;   // simplfies directions vs camera
                                // i.e. start in position we want to end-up with
                                // but put the moon back before visible, like
                                // loading a spring-return
var phaseMoonApproach = false;  // trigger for moon to approach
var phaseSink = false;          // trigger for cubes X A R T A to sink under water

// global for now for easy inter-function access
var moonz = -500;               // where we want the moon (has to be far away with depth)
                                // even though it's a 2D picture ... else camera views
                                // will distort it too much, and also want it to look big
                                // compared to pyramids that fly close to it ...
                                // but not so far away that lighting becomes harder
var moonMesh;                   // the mesh to add to the scene
var starsMesh;                  // the mesh to add to the scene

var num_cylinders = 0;
var range_cylinders = 499;  // keep within 3D bounds {x, y, z} -> 499 etc.
var cylinders;              // Array()
var calmCylinders = false;  // want cylinders to scurry off screen - stop distracting
                            // when video player or photo slider displayed etc.

        // TEST
        setTimeout(function() {
            window.calmCylinders = true;
        }, 15000);


                            // ***********************************************************
const YES = 2;              // NB: Choice NOT TO SUPPORT IExplr EARLIER THAN 11 (ES2015)
const NO = 0;               // ... the target audience for my personal website is 
const PENDING = 1;          // ... likely to have a more recent browser (technology ppl)
                            // ***********************************************************

var saveCycles = NO;        // monostable delay after calmCyclinders set to true
                            // - use to toggle whether cylinder matrix updates with changes
                            // reset with calmCylinders = false


var fps = 1;                // calculate from frames/accDelta etc.
var frames = 0;             // count frames in accumalative-delta-time
var accDelta = 0;           // accumulative delta time (avoid divide by zero)

                            // use fps to determine computation power of rendering device
                            // (nb not doing webGL detect specifically or explicit canvas fallbacks)
                            // Use idea of progressive (computation) enchancement ... so don't show
                            // computationally expensive water on low-compute devices
                            // or, limit cylindars on low-compute devices, proportional to fps

                            // nb: first 2 or 3 seconds not stable fps, when cubes are initialised
                            //     so, not perfect.

                            // Xarta testing on Samsung Galaxy S3, Samsung Note 4, Haswell I7 (incl. own GPU)
                            // and, Sandy Bridge I5 with same age medium-grade graphics card
                            // and, year 2009 Core 2 Duo laptop with separate graphics card (gets warm)

var navDrawer = document.getElementsByClassName("drawer")[0];
navDrawer.style.opacity = 0.4;
setTimeout(function() {
    window.navDrawer.style.opacity = 1;
}, 10000);

init(); // camera, water, moon, cylinders etc. etc. - add to scene


var initscale = 8;                          // cube scaling
var cubes = new Array();                    // 5 cubes ... X A R T A
if (window.innerHeight > window.innerWidth) // portrait e.g. phones
{
    cubes[0] = getNewXartaCube( -8,5,-800, "XARTA", 0); // staggar z so fits camera "perspective" view
    cubes[1] = getNewXartaCube(  0,5,-820, "ARTAX", 1);
    cubes[2] = getNewXartaCube( 10,5,-840, "RTAXA", 2);
    cubes[3] = getNewXartaCube( 20,5,-860, "TAXAR", 3);
    cubes[4] = getNewXartaCube( 30,5,-880, "AXART", 4);
}
else
{
    cubes[0] = getNewXartaCube( -10,5,-800, "XARTA", 0); // just in a row - camera zoom will always mean fitting (mostly)
    cubes[1] = getNewXartaCube(   0,5,-800, "ARTAX", 1);
    cubes[2] = getNewXartaCube(  10,5,-800, "RTAXA", 2);
    cubes[3] = getNewXartaCube(  20,5,-800, "TAXAR", 3);
    cubes[4] = getNewXartaCube(  30,5,-800, "AXART", 4);
}


animate();  // kickstart the animation loop



function getNewXartaCube(xPos, yPos, zPos, word, colourStartIndex) 
{
	console.log('getNewXartaCube('+xPos+', '+yPos+', '+zPos+', '+word+', '+colourStartIndex+')');

    var colours = new Array();
    colours[0] = ["orange",     "#ff0000"];     // red background
    colours[1] = ["red",        "#0212f4"];     // blue background
    colours[2] = ["green",      "#f7ec0e"];     // yellow background
    colours[3] = ["yellow",     "#106316"];     // green background
    colours[4] = ["purple",     "#f77c02"];     // orange background

/*
    console.log(colours[(colourStartIndex + 0) % 5][1])
    console.log(colours[(colourStartIndex + 0) % 5][0]);
    console.log(colours[(colourStartIndex + 1) % 5][1])
    console.log(colours[(colourStartIndex + 1) % 5][0]);
    console.log(colours[(colourStartIndex + 2) % 5][1])
    console.log(colours[(colourStartIndex + 2) % 5][0]);
    console.log(colours[(colourStartIndex + 3) % 5][1])
    console.log(colours[(colourStartIndex + 3) % 5][0]);
    console.log(colours[(colourStartIndex + 4) % 5][1])
    console.log(colours[(colourStartIndex + 4) % 5][0]);
*/

    var RIGHT = document.createElement("canvas");
    var RIGHTcontext = RIGHT.getContext("2d");
    RIGHT.width = RIGHT.height = 256;
    RIGHTcontext.shadowColor = "#000";
    RIGHTcontext.shadowBlur = 7;
    RIGHTcontext.fillStyle = colours[(colourStartIndex + 0) % 5][1];
    RIGHTcontext.fillRect(0, 0, 256, 256);
    RIGHTcontext.fillStyle = colours[(colourStartIndex + 0) % 5][0];
    RIGHTcontext.font = "150pt arial bold";
    RIGHTcontext.fillText(word.substr(4,1), 64, 200);

    var LEFT = document.createElement("canvas");
    var LEFTcontext = LEFT.getContext("2d");
    LEFT.width = LEFT.height = 256;
    LEFTcontext.shadowColor = "#000";
    LEFTcontext.shadowBlur = 7;
    LEFTcontext.fillStyle = colours[(colourStartIndex + 1) % 5][1];
    LEFTcontext.fillRect(0, 0, 256, 256);
    LEFTcontext.fillStyle = colours[(colourStartIndex + 1) % 5][0];
    LEFTcontext.font = "150pt arial bold";
    LEFTcontext.fillText(word.substr(1,1), 64, 200);

    var TOP = document.createElement("canvas");
    var TOPcontext = TOP.getContext("2d");
    TOP.width = TOP.height = 256;
    TOPcontext.shadowColor = "#000";
    TOPcontext.shadowBlur = 7;
    TOPcontext.fillStyle =  colours[(colourStartIndex + 2) % 5][1];
    TOPcontext.fillRect(0, 0, 256, 256);
    TOPcontext.fillStyle = colours[(colourStartIndex + 2) % 5][0];
    TOPcontext.font = "150pt arial bold";
    TOPcontext.fillText(word.substr(2,1), 64, 200);

    var BOTTOM = document.createElement("canvas");
    var BOTTOMcontext = BOTTOM.getContext("2d");
    BOTTOM.width = BOTTOM.height = 256;
    BOTTOMcontext.shadowColor = "#000";
    BOTTOMcontext.shadowBlur = 7;
    BOTTOMcontext.fillStyle = colours[(colourStartIndex + 3) % 5][1];
    BOTTOMcontext.fillRect(0, 0, 256, 256);
    BOTTOMcontext.fillStyle = colours[(colourStartIndex + 3) % 5][0];
    BOTTOMcontext.font = "150pt arial bold";
    BOTTOMcontext.fillText(word.substr(3,1), 64, 200);

    var FRONT = document.createElement("canvas");
    var FRONTcontext = FRONT.getContext("2d");
    FRONT.width = FRONT.height = 256;
    FRONTcontext.shadowColor = "#000";
    FRONTcontext.shadowBlur = 7;
    //FRONTcontext.fillStyle = colours[(colourStartIndex + 4) % 5][1];
    FRONTcontext.fillStyle = "black";
    FRONTcontext.fillRect(0, 0, 256, 256);
    FRONTcontext.fillStyle = colours[(colourStartIndex + 4) % 5][0];
    FRONTcontext.font = "150pt arial bold";
    FRONTcontext.fillText(word.substr(0,1), 64, 200);

    var RIGHTmesh =     new THREE.MeshBasicMaterial({ map: new THREE.Texture(RIGHT), 
                                                    transparent: true, opacity: 0.5 });
    RIGHTmesh.map.needsUpdate = true;

    var LEFTmesh =      new THREE.MeshBasicMaterial({ map: new THREE.Texture(LEFT), 
                                                    transparent: true, opacity: 0.5 });
    LEFTmesh.map.needsUpdate = true;

    var TOPmesh =       new THREE.MeshBasicMaterial({ map: new THREE.Texture(TOP), 
                                                    transparent: true, opacity: 0.5 });
    TOPmesh.map.needsUpdate = true;

    var BOTTOMmesh =    new THREE.MeshBasicMaterial({ map: new THREE.Texture(BOTTOM), 
                                                    transparent: true, opacity: 0.5 });
    BOTTOMmesh.map.needsUpdate = true;

    var FRONTmesh =     new THREE.MeshBasicMaterial({ map: new THREE.Texture(FRONT), 
                                                    transparent: true, opacity: 0.5 });
    FRONTmesh.map.needsUpdate = true;


    // cross origin so I can use cloudinary, and 256 pixels width & height
	var textureLoader = new THREE.TextureLoader().setCrossOrigin(true);
	var texture = textureLoader.load( "https://res.cloudinary.com/xarta/image/upload/v1496448263/xarta/2014-me-at-work256.png" ); // BACK

    // so we're making a cube e.g. 5 faces are letters X A R T A, and the backface is a pic of me lol ...
    // and by using transparency, light from the rest of the dynamic scene will illuminate "me" sometimes through the transparent cube
	var materials = [
		RIGHTmesh,
		LEFTmesh,
		TOPmesh,
		BOTTOMmesh,
		FRONTmesh,
		new THREE.MeshBasicMaterial( {  map: texture, 
                                        side:THREE.DoubleSide, 
                                        shading: THREE.FlatShading, 
                                        transparent: true, opacity: 0.5, color: 0xf902d4 } ) // BACK
	];
	
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );


    var obj = new THREE.Mesh( geometry, materials );

    obj.name = word.substr(0,1);                    // letter on face of cube that is facing us
	obj.scale.set(initscale,initscale,initscale);   // initiscale is a global
    obj.position.z = zPos;
    obj.position.x = xPos;
    obj.position.y = yPos;
    
    obj.lightDirection = new THREE.Vector3(0.7, 20, 0); // bright, off centre

    obj.xartaRot = 1; // used for initial object-axis rotation direction

	scene.add( obj );

    return(obj);
}





// this function should now be called
// extended animate or something (more than a tumble - it evolved)
function tumble(transformRate)
{


    cubes.forEach(function(cube, index, ar){


        if ( (5 < cubes[index].rotation.x) && (cubes[index].rotation.x < 6) )
        {
            cubes[index].xartaRot = -1; // reverse rotation
        }
        if (cubes[index].rotation.x < 0)
        {
            cubes[index].xartaRot = 0; // stop, showing X A R T A (not precise on slow machine)
        }

        // rotation.x starts at 0 and is positive accumulative
        cubes[index].rotation.x += (cubes[index].xartaRot * transformRate);
        cubes[index].rotation.y += (cubes[index].xartaRot * transformRate);

        console.log(cubes[index].xartaRot);
        console.log(cubes[index].rotation.x);
    }, this);


    var approachRate = 200 * transformRate;
    var fit =  ( (window.innerWidth / window.innerHeight) * 2 ) - approachRate ;

    if (phaseCubeApproach === true)
    {
        
        // stop the approach of everything, possibly staggard,
        // once X (as in X A R T A) has reached our chosen z-axis
        if (cubes[0].position.z < fit )
        {
            for (i=0; i < cubes.length; i++)
            {
                cubes[i].position.z += approachRate;
            }
        }
        else
        {
            phaseCubeApproach = false;
            setTimeout(function() {
                window.phaseSink = true;
            }, 8000);
        }
    }

    // sink all the cubes under water, out the way (job done - now just adds colour)
    if (phaseSink === true)
    {
        var yBottom = -15;
        for (i=0; i < cubes.length; i++)
        {
            phaseSink = false;
            // also straighten-out ... not fussed about off-screen sunken cubes in portrait
            // - if device switches to landscape, will then display
            if (cubes[i].position.z < fit )
            {
                cubes[i].position.z += (approachRate/50) * (i + 1);
            }

            // sink all until yBottom
            if( cubes[i].position.y > yBottom )
            {
                phaseSink = true;
                if(cubes[i].rotation.x > -0.5)
                {
                    // rotate 45 degrees to tilt front faces toward us, as we are looking down
                    cubes[i].rotation.x -= transformRate;
                }
                cubes[i].position.y -= approachRate/50;
            }
            
        }
    }

    if (phaseMoonPushBack === true)
    {
        moonz = -1000;              // in the dark, out of view
        phaseMoonPushBack = false;  // do once
        phaseMoonApproach = true;   // now slow approach
    }

    if (phaseMoonApproach === true)
    {
        if (moonz < -500)
        {
            moonz += (50*transformRate);
            moonMesh.position.z = moonz;
        }
        else
        {   
            phaseMoonApproach = false;
            scene.add(starsMesh);   // "ping" stars on, after moon in place
                                    // timing should synchronise with cubes
        }
    }

    // TODO: Cylinder???  PYRAMID !!!  MUST HAVE BEEN MAD !!!!
    // RANDOM CYLINDER MOVEMENT
    for (var i = 0; i < num_cylinders; i++) {


        cylinders[i].position.x += cylinders[i].xartaDirx;
        cylinders[i].position.y += cylinders[i].xartaDiry;
        cylinders[i].position.z += cylinders[i].xartaDirz;


        



        // materialise cylinders at start or later, if not paused
        var cylinderOpacity = cylinders[i].material.opacity;
        if ( (cylinderOpacity < 1.0) && (calmCylinders === false) )
        {
            cylinderOpacity += transformRate/300;
            if (cylinderOpacity > 1.0)
            {
                cylinderOpacity = 1.0;
            }
        }
        else if ( (cylinderOpacity > 0) && (calmCylinders === true) )
        {
            cylinderOpacity -= transformRate/500;
            if (cylinderOpacity < 0)
            {
                cylinderOpacity = 0;
            }
        }

        cylinders[i].material.opacity = cylinderOpacity;
    
        if(calmCylinders === false)
        {
            moveRate = (Math.random() + 1) * (125*transformRate);
            saveCycles = NO; // reset monostable delay for suppressing matrix update
        }
        else
        {
            moveRate = 0; // pause cylinders when out the way
            if ( saveCycles === NO)
            {
                saveCycles = PENDING;
                setTimeout(function() {
                    window.saveCycles = YES;
                }, 14000);
            }
        }
        

        // KEEP WITHIN X, Y, Z BOUNDARIES
        if (cylinders[i].position.x > range_cylinders)
        {
            cylinders[i].xartaDirx = (Math.random() * -1) * moveRate;
        }

        if (cylinders[i].position.y > range_cylinders)
        {
            cylinders[i].xartaDiry = (Math.random() * -1) * moveRate;
        }

        if (cylinders[i].position.z > 100)
        {
            cylinders[i].xartaDirz = (Math.random() * -1) * moveRate;
        }


        if (cylinders[i].position.x < (-1 * range_cylinders))
        {
            cylinders[i].xartaDirx = (Math.random() * 1) * moveRate;
        }

        if (cylinders[i].position.y <  (-1 * range_cylinders))
        {
            cylinders[i].xartaDiry = (Math.random() * 1) * moveRate;
        }

        if (cylinders[i].position.z <  (-1 * 498))
        {
            cylinders[i].xartaDirz = (Math.random() * 1) * moveRate;
        }

        // nb: relying on optimisation to negate other unneccessary computation
        if ( (saveCycles === NO) || (saveCycles === PENDING) )
        {
            cylinders[i].updateMatrix();
        }
        


    }
}

function init() {

    var loader = new THREE.TextureLoader().setCrossOrigin(true);    // Use same cross-origin loader for all assets

    // GET LOADING GOING NOW, STRAIGHT-AWAY

    // Load the background texture  STARS (from NASA galleries)
    var stars = loader.load( 'https://res.cloudinary.com/xarta/image/upload/v1496587567/xarta/spiral-galaxy.jpg' );               
    
    
    // Load the background texture MOON (found with Google ... oops - forgot attribution)
    //                                  ... was a jpg, but wanted a circular cropped transparent png
    //                                  ... it's not perfect even with the feathering ... but is ok

    // responosive sizes/quality ... big moon is high quality transparent png (over 300KB)

    var theMoon;
    if (window.innerWidth > 768)
    {
        theMoon = loader.load( 'https://res.cloudinary.com/xarta/image/upload/v1496588500/xarta/moon.png' );
    }
    else if (window.innerWidth > 512)
    {
        theMoon = loader.load( 'https://res.cloudinary.com/xarta/image/upload/v1496576988/xarta/moon-lower-quality-512.png' );
    }
    else
    {
        theMoon = loader.load( 'https://res.cloudinary.com/xarta/image/upload/v1496586463/xarta/moon-lower-quality-256.png');
    }




    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    renderer = new THREE.WebGLRenderer();   // Not using WebGL Detect yet ... TODO: look into whether I really should (statistically & target audience)
    renderer.setClearColor(0x000000, 1); 
    renderer.setClearColor(scene.fog.color);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoclear = true;              // TODO: NOT SURE ABOUT THIS, AND MANUAL CLEARING OF "STAGE BUFFER" - See water.js

    var container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(6, 10, 50);


    setTimeout(function() {
        //controls = new THREE.OrbitControls(camera, renderer.domElement);  TODO: toggle on/off with menu <a> link
    }, 12000);
    


    
    // world
    var world = { scene: scene };



    // STARS
    starsMesh = new THREE.Mesh( 
        new THREE.PlaneGeometry(45, 45,1, 1),
        new THREE.MeshBasicMaterial({
            map: stars
        }));

    starsMesh.position.x = -350;  
    starsMesh.position.z = -600;            // behind moon - further back is too dark/blurry, but obscures things behind it
    starsMesh.scale.set(50, 50,10);
    //starsMesh.material.depthTest = true;    // no need
    //starsMesh.material.depthWrite = true;



    // MOON
    moonMesh = new THREE.Mesh( 
        new THREE.PlaneGeometry(45, 45,1, 1),
        new THREE.MeshBasicMaterial({
            map: theMoon, transparent: true, opacity: 1.0, color: 0xff0000
        })
    );

    // keep size in portrait mode, but shift partly offscreen to left
    // nb will appear bigger with bigger height to width ratio, because
    // of perspective camera settings and how "near" we are to it
    moonMesh.position.x = -1 * 0.25 * window.innerWidth;
    moonMesh.position.y = 20;
    moonMesh.position.z = moonz;
    moonMesh.scale.set(13, 14,14); 
    moonMesh.material.depthTest = true;   // because transparent png
    moonMesh.material.depthWrite = true;

    setTimeout(function() {
        if(window.fps > 5)
        {
            scene.add(moonMesh);    
            moonMesh.material.color.setHex( 0xffffff );
        }
    }, 2000); // first second might be unreliable on 2014 Samsung Note 4 device


    // water computationally HEAVY
    setTimeout(function() {

        if(window.fps > 7)
        {
            // WATER
            water = new Water(renderer, camera, world, {
                width: 210,
                height: 200,
                segments: 5,
                lightDirection: new THREE.Vector3(0.7, 0.7, 0)
            });

            water.position.set(-70, 1, 0);
            water.rotation.set(Math.PI * -0.5, 0, 0);
            water.updateMatrix();


            scene.add(moonMesh);
            
            moonMesh.material.color.setHex( 0xffffff );
            scene.add(water);  
        }
    }, 3000);






    // CYLINDERS        TODO: Some patterned ones e.g. Bee colour stripes, with Doppler-shift buzz audio from camera position
    var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    var material = new THREE.MeshPhongMaterial({ color: 0xafab5b, shading: THREE.FlatShading, transparent: true,  opacity: 0 });

    setTimeout(function() {
        if (window.fps < 60)
        {
            num_cylinders = window.fps;
        }
        else
        {
            num_cylinders = 60; // plenty!!!
        }
        
        console.log("Number of cylinders: "+ num_cylinders);
        cylinders = new Array(num_cylinders);
        for (var i = 0; i < num_cylinders; i++) {

            cylinders[i] = new THREE.Mesh(geometry, material);
            cylinders[i].position.x = (Math.random() - 0.5) * range_cylinders;
            cylinders[i].position.y = (Math.random() - 0.5) * range_cylinders;
            cylinders[i].position.z = (Math.random() - 0.5) * range_cylinders;

            cylinders[i].xartaDirx = (Math.random() - 0.5) * 5;
            cylinders[i].xartaDiry = (Math.random() - 0.5) * 5;
            cylinders[i].xartaDirz = (Math.random() - 0.5) * 5;

            cylinders[i].updateMatrix();
            cylinders[i].matrixAutoUpdate = false;
            scene.add(cylinders[i]);

        }      
    },6000);




    // lights (still experimenting)

    light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(250, -300, 500);
    scene.add(light);

    var spotLight = new THREE.SpotLight(0xffffff, 1, 200, 20, 10);
    spotLight.position.set( 0, 150, 0 );
    
    var spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, 0);
    spotLight.target = spotTarget;
    
    scene.add(spotLight);
    // scene.add(new THREE.PointLightHelper(spotLight, 1));

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}



function calcFps(delta)
{
    frames += 1;
    accDelta += delta;

    if(accDelta > 1)
    {
        fps = frames;
        accDelta = 0;
        frames = 1;
    }

}


function animate() {

    requestAnimationFrame(animate);

    var delta = clock.getDelta();
    calcFps(delta);

    if ( !(typeof water === 'undefined' || water === null) ){
        water.update(delta);
    }
    

    //console.log(delta);
    tumble(delta);
    
    //console.log(fps);


    render();

}



function render() {

    renderer.render(scene, camera);
        

}
