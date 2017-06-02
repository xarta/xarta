function Reflector(e,t,r,a){THREE.Mesh.call(this),Object.defineProperties(this,{width:{value:0,configurable:!1,enumerable:!0,writable:!0},height:{value:0,configurable:!1,enumerable:!0,writable:!0},offset:{value:new THREE.Vector3,configurable:!1,enumerable:!0,writable:!0},clipBias:{value:0,configurable:!1,enumerable:!0,writable:!0},resolution:{value:2048,configurable:!1,enumerable:!0,writable:!0},useStencilBuffer:{value:!1,configurable:!1,enumerable:!0,writable:!0},_renderer:{value:e,configurable:!1,enumerable:!1,writable:!1},_camera:{value:t,configurable:!1,enumerable:!1,writable:!1},_world:{value:r,configurable:!1,enumerable:!1,writable:!1},_reflectionPlane:{value:new THREE.Plane,configurable:!1,enumerable:!1,writable:!1},_reflectionMatrix:{value:new THREE.Matrix4,configurable:!1,enumerable:!1,writable:!1},_reflectorCamera:{value:new THREE.PerspectiveCamera,configurable:!1,enumerable:!1,writable:!1},_sceneReflector:{value:null,configurable:!1,enumerable:!1,writable:!0},_reflectionMap:{value:null,configurable:!1,enumerable:!1,writable:!0},_textureMatrix:{value:null,configurable:!1,enumerable:!1,writable:!0},_cameraHelper:{value:null,configurable:!1,enumerable:!1,writable:!0},_directionHelper:{value:null,configurable:!1,enumerable:!1,writable:!0}});for(var i in a)a.hasOwnProperty(i)&&(this[i]=a[i]);this._init()}function Refractor(e,t,r,a){THREE.Mesh.call(this),Object.defineProperties(this,{width:{value:0,configurable:!1,enumerable:!0,writable:!0},height:{value:0,configurable:!1,enumerable:!0,writable:!0},clipBias:{value:0,configurable:!1,enumerable:!0,writable:!0},resolution:{value:2048,configurable:!1,enumerable:!0,writable:!0},_renderer:{value:e,configurable:!1,enumerable:!1,writable:!1},_camera:{value:t,configurable:!1,enumerable:!1,writable:!1},_world:{value:r,configurable:!1,enumerable:!1,writable:!1},_refractionPlane:{value:new THREE.Plane,configurable:!1,enumerable:!1,writable:!1},_refractorCamera:{value:new THREE.PerspectiveCamera,configurable:!1,enumerable:!1,writable:!1},_refractionMap:{value:null,configurable:!1,enumerable:!1,writable:!0},_textureMatrix:{value:null,configurable:!1,enumerable:!1,writable:!0}});for(var i in a)a.hasOwnProperty(i)&&(this[i]=a[i]);this._init()}function Water(e,t,r,a){THREE.Mesh.call(this),Object.defineProperties(this,{width:{value:0,configurable:!1,enumerable:!0,writable:!0},height:{value:0,configurable:!1,enumerable:!0,writable:!0},resolution:{value:2048,configurable:!1,enumerable:!0,writable:!0},waterSpeed:{value:.03,configurable:!1,enumerable:!0,writable:!0},waterColor:{value:new THREE.Color,configurable:!1,enumerable:!0,writable:!0},waterReflectivity:{value:.02,configurable:!1,enumerable:!0,writable:!0},lightDirection:{value:new THREE.Vector3(0,1,0),configurable:!1,enumerable:!0,writable:!0},lightColor:{value:new THREE.Color,configurable:!1,enumerable:!0,writable:!0},shininess:{value:20,configurable:!1,enumerable:!0,writable:!0},segments:{value:1,configurable:!1,enumerable:!0,writable:!0},cycle:{value:.15,configurable:!1,enumerable:!0,writable:!0},_renderer:{value:e,configurable:!1,enumerable:!1,writable:!1},_camera:{value:t,configurable:!1,enumerable:!1,writable:!1},_world:{value:r,configurable:!1,enumerable:!1,writable:!1},_reflector:{value:null,configurable:!1,enumerable:!1,writable:!0},_refractor:{value:null,configurable:!1,enumerable:!1,writable:!0},_halfCycle:{value:0,configurable:!1,enumerable:!1,writable:!0}});for(var i in a)a.hasOwnProperty(i)&&(this[i]=a[i]);this._init()}var ReflectorShader={uniforms:{reflectionMap:{type:"t",value:null},textureMatrix:{type:"m4",value:null}},vertexShader:["uniform mat4 textureMatrix;","varying vec4 vUv;","void main() {","vUv = textureMatrix * vec4( position, 1.0 );","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D reflectionMap;","varying vec4 vUv;","void main() {","gl_FragColor = texture2DProj( reflectionMap, vUv );","}"].join("\n")};Reflector.prototype=Object.create(THREE.Mesh.prototype),Reflector.prototype.constructor=Reflector,Reflector.prototype.update=function(){this._beforeRender(),this._render(),this._afterRender()},Reflector.prototype.updateMatrix=function(){THREE.Mesh.prototype.updateMatrix.call(this),this.makeReflectionPlane(),this.makeReflectionMatrix()},Reflector.prototype.makeReflectionPlane=function(){var e,t,r,a;return function(){void 0===e&&(e=new THREE.Vector3,t=new THREE.Vector3,r=new THREE.Quaternion,a=new THREE.Vector3),this.updateMatrixWorld(!0),this.matrixWorld.decompose(t,r,a),e.set(0,0,1).applyQuaternion(r).normalize(),e.add(this.offset).normalize(),this._reflectionPlane.setFromNormalAndCoplanarPoint(e,t)}}(),Reflector.prototype.makeReflectionMatrix=function(){this._reflectionMatrix.elements[0]=-2*this._reflectionPlane.normal.x*this._reflectionPlane.normal.x+1,this._reflectionMatrix.elements[1]=-2*this._reflectionPlane.normal.y*this._reflectionPlane.normal.x,this._reflectionMatrix.elements[2]=-2*this._reflectionPlane.normal.z*this._reflectionPlane.normal.x,this._reflectionMatrix.elements[3]=0,this._reflectionMatrix.elements[4]=-2*this._reflectionPlane.normal.x*this._reflectionPlane.normal.y,this._reflectionMatrix.elements[5]=-2*this._reflectionPlane.normal.y*this._reflectionPlane.normal.y+1,this._reflectionMatrix.elements[6]=-2*this._reflectionPlane.normal.z*this._reflectionPlane.normal.y,this._reflectionMatrix.elements[7]=0,this._reflectionMatrix.elements[8]=-2*this._reflectionPlane.normal.x*this._reflectionPlane.normal.z,this._reflectionMatrix.elements[9]=-2*this._reflectionPlane.normal.y*this._reflectionPlane.normal.z,this._reflectionMatrix.elements[10]=-2*this._reflectionPlane.normal.z*this._reflectionPlane.normal.z+1,this._reflectionMatrix.elements[11]=0,this._reflectionMatrix.elements[12]=-2*this._reflectionPlane.normal.x*this._reflectionPlane.constant,this._reflectionMatrix.elements[13]=-2*this._reflectionPlane.normal.y*this._reflectionPlane.constant,this._reflectionMatrix.elements[14]=-2*this._reflectionPlane.normal.z*this._reflectionPlane.constant,this._reflectionMatrix.elements[15]=1},Reflector.prototype._init=function(){this.geometry=new THREE.PlaneBufferGeometry(this.width,this.height,1,1),this._reflectorCamera.matrixAutoUpdate=!1,this.matrixAutoUpdate=!1,!0===this.useStencilBuffer?(this.material=new THREE.MeshBasicMaterial({color:this._renderer.getClearColor(),depthWrite:!1}),this._sceneReflector=new THREE.Scene,this._sceneReflector.add(this)):(this.material=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.clone(ReflectorShader.uniforms),vertexShader:ReflectorShader.vertexShader,fragmentShader:ReflectorShader.fragmentShader}),this._createRenderTarget(),this._textureMatrix=new THREE.Matrix4,this.material.uniforms.reflectionMap.value=this._reflectionMap.texture,this.material.uniforms.textureMatrix.value=this._textureMatrix)},Reflector.prototype._render=function(){!0===this.useStencilBuffer?this._renderer.render(this._world.scene,this._reflectorCamera):this._renderer.render(this._world.scene,this._reflectorCamera,this._reflectionMap,!0)},Reflector.prototype._beforeRender=function(){this._updateCamera(),!0===this.useStencilBuffer?this._updateStencilBuffer():(this._updateTextureMatrix(),this._updateClipping(),this.material.visible=!1),this._updateCulling()},Reflector.prototype._afterRender=function(){var e=this._renderer.context,t=this._renderer.state;!0===this.useStencilBuffer?t.disable(e.STENCIL_TEST):this.material.visible=!0,this._updateCulling()},Reflector.prototype._updateStencilBuffer=function(){var e=this._renderer.context;this._renderer.state.enable(e.STENCIL_TEST),e.stencilFunc(e.ALWAYS,1,255),e.stencilOp(e.REPLACE,e.KEEP,e.REPLACE),this._renderer.render(this._sceneReflector,this._camera),e.stencilFunc(e.EQUAL,1,255),e.stencilOp(e.KEEP,e.KEEP,e.KEEP)},Reflector.prototype._updateCamera=function(){this._reflectorCamera.matrix.copy(this._reflectionMatrix).multiply(this._camera.matrixWorld),this._reflectorCamera.updateMatrixWorld(!0),this._reflectorCamera.projectionMatrix.copy(this._camera.projectionMatrix),!1===this.useStencilBuffer&&this._reflectorCamera.matrixWorldInverse.getInverse(this._reflectorCamera.matrixWorld)},Reflector.prototype._updateHelpers=function(){this._cameraHelper.position.setFromMatrixPosition(this._reflectorCamera.matrix),this._directionHelper.setDirection(this._reflectorCamera.getWorldDirection())},Reflector.prototype._addHelpers=function(){var e=new THREE.BoxGeometry(2,2,2),t=new THREE.MeshBasicMaterial({color:16777215});this._cameraHelper=new THREE.Mesh(e,t),this._directionHelper=new THREE.ArrowHelper(this._cameraHelper.getWorldDirection(),new THREE.Vector3,10),this._cameraHelper.add(this._directionHelper),this._world.addObject3D(this._cameraHelper)},Reflector.prototype._updateCulling=function(){var e,t;t=this,this._world.scene.traverseVisible(function(r){if(void 0!==r.material)if(r.material instanceof THREE.MultiMaterial)for(e=0;e<r.material.materials.length;e++)t._flipFaceCulling(r.material.materials[e]);else t._flipFaceCulling(r.material)})},Reflector.prototype._flipFaceCulling=function(e){e.side!==THREE.DoubleSide&&(e.side=e.side===THREE.FrontSide?THREE.BackSide:THREE.FrontSide)},Reflector.prototype._createRenderTarget=function(){var e=new THREE.Vector2,t={format:THREE.RGBFormat,stencilBuffer:!1};this.width>this.height?(e.x=this.resolution,e.y=Math.floor(this.resolution*(this.height/this.width))):(e.x=Math.floor(this.resolution*(this.width/this.height)),e.y=this.resolution),this._reflectionMap=new THREE.WebGLRenderTarget(e.x,e.y,t)},Reflector.prototype._updateTextureMatrix=function(){this._textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),this._textureMatrix.multiply(this._reflectorCamera.projectionMatrix),this._textureMatrix.multiply(this._reflectorCamera.matrixWorldInverse),this._textureMatrix.multiply(this.matrixWorld)},Reflector.prototype._updateClipping=function(){var e,t,r;return function(){var a=this._reflectorCamera.projectionMatrix;void 0===e&&(e=new THREE.Plane,t=new THREE.Vector4,r=new THREE.Vector4),e.copy(this._reflectionPlane),e.applyMatrix4(this._reflectorCamera.matrixWorldInverse),t.set(e.normal.x,e.normal.y,e.normal.z,e.constant),r.x=(Math.sign(t.x)+a.elements[8])/a.elements[0],r.y=(Math.sign(t.y)+a.elements[9])/a.elements[5],r.z=-1,r.w=(1+a.elements[10])/a.elements[14],t.multiplyScalar(2/t.dot(r)),a.elements[2]=t.x,a.elements[6]=t.y,a.elements[10]=t.z+1-this.clipBias,a.elements[14]=t.w}}();var RefractorShader={uniforms:{refractionMap:{type:"t",value:null},textureMatrix:{type:"m4",value:null}},vertexShader:["uniform mat4 textureMatrix;","varying vec4 vUv;","void main() {","vUv = textureMatrix * vec4( position, 1.0 );","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D refractionMap;","varying vec4 vUv;","void main() {","gl_FragColor = texture2DProj( refractionMap, vUv );","}"].join("\n")};Refractor.prototype=Object.create(THREE.Mesh.prototype),Refractor.prototype.constructor=Refractor,Refractor.prototype.update=function(){this._beforeRender(),this._render(),this._afterRender()},Refractor.prototype.updateMatrix=function(){THREE.Mesh.prototype.updateMatrix.call(this),this.makeRefractionPlane()},Refractor.prototype.makeRefractionPlane=function(){var e,t,r,a;return function(){void 0===e&&(e=new THREE.Vector3,t=new THREE.Vector3,r=new THREE.Quaternion,a=new THREE.Vector3),this.updateMatrixWorld(!0),this.matrixWorld.decompose(t,r,a),e.set(0,0,1).applyQuaternion(r).normalize(),e.negate(),this._refractionPlane.setFromNormalAndCoplanarPoint(e,t)}}(),Refractor.prototype._init=function(){this.geometry=new THREE.PlaneBufferGeometry(this.width,this.height,1,1),this.material=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.clone(RefractorShader.uniforms),vertexShader:RefractorShader.vertexShader,fragmentShader:RefractorShader.fragmentShader}),this._createRenderTarget(),this._textureMatrix=new THREE.Matrix4,this.material.uniforms.refractionMap.value=this._refractionMap.texture,this.material.uniforms.textureMatrix.value=this._textureMatrix,this._refractorCamera.matrixAutoUpdate=!1,this.matrixAutoUpdate=!1},Refractor.prototype._render=function(){this._renderer.render(this._world.scene,this._refractorCamera,this._refractionMap,!0)},Refractor.prototype._beforeRender=function(){this.material.visible=!1,this._updateCamera(),this._updateTextureMatrix(),this._updateClipping()},Refractor.prototype._afterRender=function(){this.material.visible=!0},Refractor.prototype._updateCamera=function(){this._refractorCamera.matrix.copy(this._camera.matrixWorld),this._refractorCamera.updateMatrixWorld(!0),this._refractorCamera.projectionMatrix.copy(this._camera.projectionMatrix),this._refractorCamera.matrixWorldInverse.getInverse(this._refractorCamera.matrixWorld)},Refractor.prototype._createRenderTarget=function(){var e=new THREE.Vector2,t={format:THREE.RGBFormat,stencilBuffer:!1};this.width>this.height?(e.x=this.resolution,e.y=Math.floor(this.resolution*(this.height/this.width))):(e.x=Math.floor(this.resolution*(this.width/this.height)),e.y=this.resolution),this._refractionMap=new THREE.WebGLRenderTarget(e.x,e.y,t)},Refractor.prototype._updateTextureMatrix=function(){this._textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),this._textureMatrix.multiply(this._refractorCamera.projectionMatrix),this._textureMatrix.multiply(this._refractorCamera.matrixWorldInverse),this._textureMatrix.multiply(this.matrixWorld)},Refractor.prototype._updateClipping=function(){var e,t,r;return function(){var a=this._refractorCamera.projectionMatrix;void 0===e&&(e=new THREE.Plane,t=new THREE.Vector4,r=new THREE.Vector4),e.copy(this._refractionPlane),e.applyMatrix4(this._refractorCamera.matrixWorldInverse),t.set(e.normal.x,e.normal.y,e.normal.z,e.constant),r.x=(Math.sign(t.x)+a.elements[8])/a.elements[0],r.y=(Math.sign(t.y)+a.elements[9])/a.elements[5],r.z=-1,r.w=(1+a.elements[10])/a.elements[14],t.multiplyScalar(2/t.dot(r)),a.elements[2]=t.x,a.elements[6]=t.y,a.elements[10]=t.z+1-this.clipBias,a.elements[14]=t.w}}(),WaterShader={uniforms:{reflectionMap:{type:"t",value:null},refractionMap:{type:"t",value:null},flowMap:{type:"t",value:null},noiseMap:{type:"t",value:null},normalMap0:{type:"t",value:null},normalMap1:{type:"t",value:null},textureMatrixReflection:{type:"m4",value:null},textureMatrixRefraction:{type:"m4",value:null},flowMapOffset0:{type:"f",value:0},flowMapOffset1:{type:"f",value:0},waterColor:{type:"c",value:null},waterReflectivity:{type:"f",value:.02},lightDirection:{type:"v3",value:null},lightColor:{type:"c",value:null},shininess:{type:"f",value:20},segments:{type:"f",value:1},halfCycle:{type:"f",value:0}},vertexShader:["uniform mat4 textureMatrixReflection;","uniform mat4 textureMatrixRefraction;","uniform float segments;","varying vec4 vUvReflect;","varying vec4 vUvRefract;","varying vec3 vToEye;","varying vec2 vUv;","varying float vTexScale;","void main() {","vec4 worldPosition = modelMatrix * vec4( position, 1.0 );","vUv = uv;","vTexScale = segments;","vUvReflect = textureMatrixReflection * vec4( position, 1.0 );","vUvRefract = textureMatrixRefraction * vec4( position, 1.0 );","vToEye = cameraPosition - worldPosition.xyz;","gl_Position = projectionMatrix * viewMatrix * worldPosition;","}"].join("\n"),fragmentShader:["uniform sampler2D reflectionMap;","uniform sampler2D refractionMap;","uniform sampler2D flowMap;","uniform sampler2D noiseMap;","uniform sampler2D normalMap0;","uniform sampler2D normalMap1;","uniform vec3 lightDirection;","uniform vec3 lightColor;","uniform vec3 waterColor;","uniform float flowMapOffset0;","uniform float flowMapOffset1;","uniform float waterReflectivity;","uniform float shininess;","uniform float halfCycle;","varying vec4 vUvReflect;","varying vec4 vUvRefract;","varying vec3 vToEye;","varying vec2 vUv;","varying float vTexScale;","void main() {","vec3 toEye = normalize( vToEye );","vec2 flow = texture2D( flowMap, vUv ).rg * 2.0 - 1.0;","flow.r *= -1.0;","float cycleOffset = texture2D( noiseMap, vUv ).r;","float phase0 = cycleOffset * 0.5 + flowMapOffset0;","float phase1 = cycleOffset * 0.5 + flowMapOffset1;","vec4 normalColor0 = texture2D( normalMap0, ( vUv * vTexScale ) + flow * phase0 );","vec4 normalColor1 = texture2D( normalMap1, ( vUv * vTexScale ) + flow * phase1 );","float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;","vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );","vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );","float theta = max( dot( toEye, normal ), 0.0 );","float reflectance = waterReflectivity + ( 1.0 - waterReflectivity ) * pow( ( 1.0 - theta ), 5.0 );","vec3 reflectedLight = normalize( reflect( -lightDirection, normal ) );","float specular = pow( max( dot( reflectedLight, toEye ), 0.0 ) , shininess );","vec4 specularColor =  vec4( lightColor * specular, 0.0 );","vec3 uvReflect = vUvReflect.xyz / vUvReflect.w;","vec3 uvRefract = vUvRefract.xyz / vUvRefract.w;","vec4 reflectColor = texture2D( reflectionMap, uvReflect.xy + uvReflect.z * normal.xz * 0.05 );","vec4 refractColor = texture2D( refractionMap, uvRefract.xy + uvRefract.z * normal.xz * 0.05 );","gl_FragColor = vec4( waterColor, 1.0 ) * mix( refractColor, reflectColor, reflectance ) + specularColor;","}"].join("\n")},Water.prototype=Object.create(THREE.Mesh.prototype),Water.prototype.constructor=Water,Water.prototype.update=function(e){this.material.visible=!1,this._reflector.update(),this._refractor.update(),this.material.visible=!0,this.material.uniforms.waterColor.value=this.waterColor,this.material.uniforms.waterReflectivity.value=this.waterReflectivity,this.material.uniforms.lightDirection.value=this.lightDirection,this.material.uniforms.lightColor.value=this.lightColor,this.material.uniforms.shininess.value=this.shininess,this.material.uniforms.flowMapOffset0.value+=this.waterSpeed*e,this.material.uniforms.flowMapOffset1.value+=this.waterSpeed*e,this.material.uniforms.flowMapOffset0.value>=this.cycle&&(this.material.uniforms.flowMapOffset0.value=0,this.material.uniforms.flowMapOffset1.value>=this.cycle)?this.material.uniforms.flowMapOffset1.value=this._halfCycle:this.material.uniforms.flowMapOffset1.value>=this.cycle&&(this.material.uniforms.flowMapOffset1.value=0)},Water.prototype.updateMatrix=function(){THREE.Mesh.prototype.updateMatrix.call(this),this._reflector.matrix.copy(this.matrix),this._refractor.matrix.copy(this.matrix),this._reflector.makeReflectionPlane(),this._reflector.makeReflectionMatrix(),this._refractor.makeRefractionPlane()},Water.prototype._init=function(){this.geometry=new THREE.PlaneBufferGeometry(this.width,this.height,this.segments,this.segments),this.material=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.clone(WaterShader.uniforms),vertexShader:WaterShader.vertexShader,fragmentShader:WaterShader.fragmentShader}),this._reflector=new Reflector(this._renderer,this._camera,this._world,{width:this.width,height:this.height,resolution:this.resolution}),this._refractor=new Refractor(this._renderer,this._camera,this._world,{width:this.width,height:this.height,resolution:this.resolution}),this._halfCycle=.5*this.cycle;var e=(new THREE.TextureLoader).setCrossOrigin(!0).load("https://res.cloudinary.com/xarta/image/upload/v1496407928/xarta/Eu0MQrk.png"),t=(new THREE.TextureLoader).setCrossOrigin(!0).load("https://res.cloudinary.com/xarta/image/upload/v1496407928/xarta/KmwuMPu.jpg"),r=(new THREE.TextureLoader).setCrossOrigin(!0).load("https://res.cloudinary.com/xarta/image/upload/v1496407928/xarta/8pUBeuw.jpg");r.wrapS=r.wrapT=THREE.RepeatWrapping;var a=(new THREE.TextureLoader).setCrossOrigin(!0).load("https://res.cloudinary.com/xarta/image/upload/v1496407928/xarta/fB9BaJJ.jpg");a.wrapS=a.wrapT=THREE.RepeatWrapping,this.material.uniforms.reflectionMap.value=this._reflector._reflectionMap.texture,this.material.uniforms.refractionMap.value=this._refractor._refractionMap.texture,this.material.uniforms.textureMatrixReflection.value=this._reflector._textureMatrix,this.material.uniforms.textureMatrixRefraction.value=this._refractor._textureMatrix,this.material.uniforms.flowMap.value=e,this.material.uniforms.noiseMap.value=t,this.material.uniforms.normalMap0.value=r,this.material.uniforms.normalMap1.value=a,this.material.uniforms.segments.value=this.segments,this.material.uniforms.flowMapOffset0.value=0,this.material.uniforms.flowMapOffset1.value=this._halfCycle,this.material.uniforms.halfCycle.value=this._halfCycle,this.matrixAutoUpdate=!1};