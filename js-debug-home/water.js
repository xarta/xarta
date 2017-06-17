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
    var WaterShader = {

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
        var flowMap = new THREE.TextureLoader().setCrossOrigin('').load( "https://res.cloudinary.com/xarta/image/upload/v1496407928/xarta/Eu0MQrk.png" );
        var noiseMap = new THREE.TextureLoader().setCrossOrigin('').load( "https://res.cloudinary.com/xarta/image/upload/v1497350431/xarta/KmwuMPu.jpg" );
        
        // load normal maps
        var normalMap0 = new THREE.TextureLoader().setCrossOrigin('').load( "https://res.cloudinary.com/xarta/image/upload/v1497350431/xarta/8pUBeuw.jpg" );
        normalMap0.wrapS = normalMap0.wrapT = THREE.RepeatWrapping;
        
        var normalMap1 = new THREE.TextureLoader().setCrossOrigin('').load( "https://res.cloudinary.com/xarta/image/upload/v1497350431/xarta/fB9BaJJ.jpg" );
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



