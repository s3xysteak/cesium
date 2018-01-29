defineSuite([
    'Core/Cartesian3',
    'Core/Color',
    'Core/defined',
    'Core/HeadingPitchRange',
    'Core/HeadingPitchRoll',
    'Core/Math',
    'Core/Transforms',
    'Core/PerspectiveFrustum',
    'Scene/PointCloud3DTileContent',
    'Scene/PointCloudEyeDomeLighting',
    'Specs/Cesium3DTilesTester',
    'Specs/createScene'
], 'Scene/PointCloudEyeDomeLighting', function(
    Cartesian3,
    Color,
    defined,
    HeadingPitchRange,
    HeadingPitchRoll,
    CesiumMath,
    Transforms,
    PerspectiveFrustum,
    PointCloud3DTileContent,
    PointCloudEyeDomeLighting,
    Cesium3DTilesTester,
    createScene) {
    'use strict';

    var scene;
    var centerLongitude = -1.31968;
    var centerLatitude = 0.698874;

    var pointCloudNoColorUrl = './Data/Cesium3DTiles/PointCloud/PointCloudNoColor';

    function setCamera(longitude, latitude) {
        // Point the camera to the center of the tile
        var center = Cartesian3.fromRadians(longitude, latitude, 5.0);
        scene.camera.lookAt(center, new HeadingPitchRange(0.0, -1.57, 5.0));
    }

    beforeAll(function() {
        scene = createScene();
        scene.frameState.passes.render = true;
    });

    afterAll(function() {
        scene.destroyForSpecs();
    });

    beforeEach(function() {
        var camera = scene.camera;
        camera.frustum = new PerspectiveFrustum();
        camera.frustum.aspectRatio = scene.drawingBufferWidth / scene.drawingBufferHeight;
        camera.frustum.fov = CesiumMath.toRadians(60.0);

        setCamera(centerLongitude, centerLatitude);
    });

    afterEach(function() {
        scene.primitives.removeAll();
    });

    it('adds a clear command and a post-processing draw call', function() {
        return Cesium3DTilesTester.loadTileset(scene, pointCloudNoColorUrl).then(function(tileset) {
            if (!PointCloudEyeDomeLighting.processingSupported(scene.frameState.context)) {
                return;
            }

            tileset.pointShading.eyeDomeLighting = true;

            scene.renderForSpecs();
            var originalLength = scene.frameState.commandList.length;

            tileset.pointShading.attenuation = true;
            scene.renderForSpecs();
            var newLength = scene.frameState.commandList.length;
            expect(newLength).toEqual(originalLength + 2);
        });
    });

    it('does not change commands for pick calls', function() {
        return Cesium3DTilesTester.loadTileset(scene, pointCloudNoColorUrl).then(function(tileset) {
            tileset.pointShading.eyeDomeLighting = true;

            scene.pickForSpecs();
            var originalLength = scene.frameState.commandList.length;

            tileset.pointShading.attenuation = true;
            scene.pickForSpecs();
            var newLength = scene.frameState.commandList.length;
            expect(newLength).toEqual(originalLength);
        });
    });

}, 'WebGL');
