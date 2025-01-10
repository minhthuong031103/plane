function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}

let maxVelocity = 0.04;
let jawVelocity = 0;
let pitchVelocity = 0;
let planeSpeed = 0.006;
let turbo = 0;
export function updatePlaneAxis(x, y, z, planePosition, camera, handData) {
  jawVelocity *= 0.95;
  pitchVelocity *= 0.95;

  const tiltSensitivity = 0.002;
  const degreesSensitivity = 0.0001;
  const deadZoneThreshold = 0.1;

  if (handData) {
    const { tilt, degrees } = handData;

    if (Math.abs(tilt) > deadZoneThreshold) {
      pitchVelocity += tilt * tiltSensitivity;
    }

    if (Math.abs(degrees) > deadZoneThreshold) {
      jawVelocity += degrees * degreesSensitivity;
    }
  }

  jawVelocity = Math.max(Math.min(jawVelocity, maxVelocity), -maxVelocity);
  pitchVelocity = Math.max(Math.min(pitchVelocity, maxVelocity), -maxVelocity);

  x.applyAxisAngle(z, jawVelocity * 0.5);
  y.applyAxisAngle(z, jawVelocity * 0.5);

  y.applyAxisAngle(x, pitchVelocity * 0.5);
  z.applyAxisAngle(x, pitchVelocity * 0.5);

  x.normalize();
  y.normalize();
  z.normalize();

  if (handData && handData.turboActive) {
    turbo += 0.025;
  } else {
    turbo *= 0.95;
  }

  turbo = Math.min(Math.max(turbo, 0), 1);

  const turboSpeed = easeOutQuad(turbo) * 0.02;

  camera.fov = 45 + turboSpeed * 900;
  camera.updateProjectionMatrix();

  planePosition.add(z.clone().multiplyScalar(-planeSpeed - turboSpeed));
}
