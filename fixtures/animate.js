// Animate 3d along the route
function animate(route, camera, id) {
  const animationDuration = 10000; // time in seconds
  const cameraAltitude = 20;
  // get the overall distance of each route so we can interpolate along them
  const routeDistance = turf.lineDistance(turf.lineString(route));
  // const cameraRouteDistance = turf.lineDistance(
  //   turf.lineString(cameraRoute)
  // );

  let start;

  function frame(time) {
    if (!start) start = time;
    // phase determines how far through the animation we are
    const phase = (time - start) / animationDuration;

    // phase is normalized between 0 and 1
    // when the animation is finished, reset start to loop the animation
    if (phase > 1) {
      // wait 1.5 seconds before looping
      window.cancelAnimationFrame(animate.id);
      // setTimeout(() => {
      //   start = 0.0;
      // }, 1500);
    }

    // use the phase to get a point that is the appropriate distance along the route
    // this approach syncs the camera and route positions ensuring they move
    // at roughly equal rates even if they don't contain the same number of points
    const alongRoute = turf.along(turf.lineString(route), routeDistance * phase)
      .geometry.coordinates;

    const alongCamera = turf.along(
      turf.lineString(route),
      routeDistance * phase
    ).geometry.coordinates;

    const camera = map.getFreeCameraOptions();

    // set the position and altitude of the camera
    camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
      {
        lng: alongCamera[0] + 0.001,
        lat: alongCamera[1] + 0.001,
      },
      cameraAltitude
    );
    // camera.setPitchBearing(0, 0);

    // tell the camera to look at a point along the route
    camera.lookAtPoint({
      lng: alongRoute[0],
      lat: alongRoute[1],
    });

    map.setFreeCameraOptions(camera);

    animate.id = window.requestAnimationFrame(frame);
  }

  animate.id = window.requestAnimationFrame(frame);
}

document.querySelector('#flyby-start').addEventListener('click', () => {
	// Insert the layer beneath any symbol layer.
	const layers = map.getStyle().layers;
	const labelLayerId = layers.find(
		(layer) => layer.type === 'symbol' && layer.layout['text-field']
	).id;

	// The 'building' layer in the Mapbox Streets
	// vector tileset contains building height data
	// from OpenStreetMap.
	map.addLayer(
		{
			id: 'add-3d-buildings',
			source: 'composite',
			'source-layer': 'building',
			filter: ['==', 'extrude', 'true'],
			type: 'fill-extrusion',
			minzoom: 15,
			paint: {
				'fill-extrusion-color': '#aaa',

				// Use an 'interpolate' expression to
				// add a smooth transition effect to
				// the buildings as the user zooms in.
				'fill-extrusion-height': [
					'interpolate',
					['linear'],
					['zoom'],
					15,
					0,
					15.05,
					['get', 'height'],
				],
				'fill-extrusion-base': [
					'interpolate',
					['linear'],
					['zoom'],
					15,
					0,
					15.05,
					['get', 'min_height'],
				],
				'fill-extrusion-opacity': 0.6,
			},
		},
		labelLayerId
	);

	// Add sky gradient
	map.addLayer({
		id: 'sky',
		type: 'sky',
		paint: {
			// set up the sky layer to use a color gradient
			'sky-type': 'gradient',
			// the sky will be lightest in the center and get darker moving radially outward
			// this simulates the look of the sun just below the horizon
			'sky-gradient': [
				'interpolate',
				['linear'],
				['sky-radial-progress'],
				0.8,
				'rgba(135, 206, 235, 1.0)',
				1,
				'rgba(0,0,0,0.1)',
			],
			'sky-gradient-center': [0, 0],
			'sky-gradient-radius': 90,
			'sky-opacity': [
				'interpolate',
				['exponential', 0.1],
				['zoom'],
				5,
				0,
				22,
				1,
			],
		},
	});

	console.log('starting flyby');
	animate(data.features[0].geometry.coordinates, null, null);

	document.querySelector('#flyby-stop').addEventListener('click', () => {
		console.log('stopping flyby');
		window.cancelAnimationFrame(animate.id);
	});