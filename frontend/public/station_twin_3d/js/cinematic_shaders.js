/**
 * Advanced Cinematic Shaders for Maitri & Bharati Stations Digital Twin
 * 1. Filmic Color Grading, ACES S-Curve Contrast, Polar White Balance & Lens Vignette
 * 2. Anamorphic Chromatic Aberration
 * 3. Tilt-Shift Macro Diorama Focus Mode
 * 4. Physical Polar Ocean Water Wave Shader (Bharati Station Prydz Bay)
 * SIH 2026 PS #26060 (MoES / NCPOR)
 */

window.CinematicShaders = (function () {

  // 1. Filmic ACES Tone Mapping, Polar Contrast & Lens Vignette Shader
  const FilmicColorGradingShader = {
    uniforms: {
      tDiffuse: { value: null },
      uExposure: { value: 1.12 },
      uContrast: { value: 1.18 },
      uSaturation: { value: 1.08 },
      uVignetteDarkness: { value: 0.38 },
      uVignetteOffset: { value: 0.95 },
      uChromaticAberration: { value: 0.0018 },
      uPolarTint: { value: new THREE.Vector3(0.98, 1.02, 1.06) }, // crisp Antarctic cold grade
      uEnabled: { value: 1.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uExposure;
      uniform float uContrast;
      uniform float uSaturation;
      uniform float uVignetteDarkness;
      uniform float uVignetteOffset;
      uniform float uChromaticAberration;
      uniform vec3 uPolarTint;
      uniform float uEnabled;

      varying vec2 vUv;

      // ACES Filmic Tone Mapping approximation
      vec3 ACESFilm(vec3 x) {
        float a = 2.51;
        float b = 0.03;
        float c = 2.43;
        float d = 0.59;
        float e = 0.14;
        return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
      }

      void main() {
        if (uEnabled < 0.5) {
          gl_FragColor = texture2D(tDiffuse, vUv);
          return;
        }

        // Lens Radial Distortion Vector from center
        vec2 coord = vUv - 0.5;
        float dist = length(coord);

        // Chromatic Aberration on screen boundaries (Anamorphic lens feel)
        vec2 uvR = vUv + coord * uChromaticAberration * dist * 2.0;
        vec2 uvG = vUv;
        vec2 uvB = vUv - coord * uChromaticAberration * dist * 2.0;

        float r = texture2D(tDiffuse, clamp(uvR, 0.0, 1.0)).r;
        float g = texture2D(tDiffuse, clamp(uvG, 0.0, 1.0)).g;
        float b = texture2D(tDiffuse, clamp(uvB, 0.0, 1.0)).b;
        vec3 color = vec3(r, g, b);

        // Exposure calibration
        color *= uExposure;

        // Polar Cold White Balance Tint
        color *= uPolarTint;

        // ACES Filmic Tone Curve
        color = ACESFilm(color);

        // Filmic S-Curve Contrast
        color = (color - 0.5) * uContrast + 0.5;

        // Saturation adjustment
        float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(luminance), color, uSaturation);

        // Cinematic Lens Vignette
        float vignette = smoothstep(uVignetteOffset, uVignetteOffset - 0.45, dist);
        color = mix(color * (1.0 - uVignetteDarkness), color, vignette);

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
      }
    `
  };

  // 2. Tilt-Shift Macro Diorama Focus Shader
  const TiltShiftShader = {
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(1920, 1080) },
      uFocusY: { value: 0.52 },       // Focus line vertical position [0..1]
      uFocusWidth: { value: 0.22 },   // Depth of field focus band width
      uBlurMax: { value: 4.5 },       // Blur radius strength
      uEnabled: { value: 0.0 }        // Disabled by default, toggled in UI
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uFocusY;
      uniform float uFocusWidth;
      uniform float uBlurMax;
      uniform float uEnabled;

      varying vec2 vUv;

      void main() {
        if (uEnabled < 0.5) {
          gl_FragColor = texture2D(tDiffuse, vUv);
          return;
        }

        // Distance from horizontal focal plane
        float distFromFocus = abs(vUv.y - uFocusY);
        float blurFactor = smoothstep(uFocusWidth * 0.4, uFocusWidth * 1.4, distFromFocus) * uBlurMax;

        if (blurFactor < 0.1) {
          gl_FragColor = texture2D(tDiffuse, vUv);
          return;
        }

        vec2 texel = 1.0 / uResolution;
        vec4 color = vec4(0.0);
        float totalWeight = 0.0;

        // 9-tap Gaussian sampling along the vertical gradient
        for (float i = -4.0; i <= 4.0; i += 1.0) {
          float weight = exp(-0.5 * (i / 1.8) * (i / 1.8));
          vec2 offset = vec2(0.0, i * blurFactor * texel.y);
          color += texture2D(tDiffuse, clamp(vUv + offset, 0.0, 1.0)) * weight;
          totalWeight += weight;
        }

        gl_FragColor = color / totalWeight;
      }
    `
  };

  // 3. Physical Ocean Water Wave Shader (Larsemann Hills / Prydz Bay)
  const PhysicalOceanShader = {
    uniforms: {
      uTime: { value: 0.0 },
      uSunPosition: { value: new THREE.Vector3(68, 54, -46) },
      uSunColor: { value: new THREE.Color(0xfff9ee) },
      uWaterColorDeep: { value: new THREE.Color(0x061D36) },
      uWaterColorShallow: { value: new THREE.Color(0x13587A) },
      uSkyColor: { value: new THREE.Color(0x92B9DC) },
      uNormalMap1: { value: null },
      uNormalMap2: { value: null },
      uWaveScale: { value: 1.0 },
      uWaveSpeed: { value: 1.0 },
      uFresnelBias: { value: 0.08 },
      uFresnelPower: { value: 4.5 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uWaveScale;
      uniform float uWaveSpeed;

      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;
      varying float vWaveElevation;

      void main() {
        vUv = uv;
        vec3 pos = position;

        float t = uTime * uWaveSpeed;
        
        // Multi-frequency polar swells
        float wave1 = sin(pos.x * 0.08 + t * 1.15) * cos(pos.y * 0.07 + t * 0.85) * 0.35;
        float wave2 = sin(pos.x * 0.16 - pos.y * 0.14 + t * 1.5) * 0.18;
        float wave3 = cos(pos.x * 0.32 + pos.y * 0.28 + t * 2.1) * 0.08;
        
        float elevation = (wave1 + wave2 + wave3) * uWaveScale;
        pos.z += elevation; // Geometry is PlaneGeometry rotated -PI/2 so local z is up
        vWaveElevation = elevation;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        vViewPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uSunPosition;
      uniform vec3 uSunColor;
      uniform vec3 uWaterColorDeep;
      uniform vec3 uWaterColorShallow;
      uniform vec3 uSkyColor;
      uniform sampler2D uNormalMap1;
      uniform sampler2D uNormalMap2;
      uniform float uFresnelBias;
      uniform float uFresnelPower;

      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;
      varying float vWaveElevation;

      void main() {
        // Dual scrolling normal maps at different speeds and angles
        vec2 uv1 = vUv * 8.0 + vec2(uTime * 0.015, uTime * 0.012);
        vec2 uv2 = vUv * 14.0 - vec2(uTime * 0.022, -uTime * 0.018);

        vec3 normal1 = texture2D(uNormalMap1, uv1).rgb * 2.0 - 1.0;
        vec3 normal2 = texture2D(uNormalMap2, uv2).rgb * 2.0 - 1.0;
        vec3 normal = normalize(vec3(normal1.xy + normal2.xy, normal1.z * normal2.z * 1.8));

        // Transform normal to world space (plane is lying on XZ plane, normal pointing +Y)
        vec3 worldNormal = normalize(vec3(normal.x, normal.z, normal.y));

        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 sunDir = normalize(uSunPosition - vWorldPosition);

        // Fresnel dielectric reflection factor (Schlick approximation)
        float cosTheta = clamp(dot(viewDir, worldNormal), 0.0, 1.0);
        float fresnel = uFresnelBias + (1.0 - uFresnelBias) * pow(1.0 - cosTheta, uFresnelPower);

        // Deep water vs shallow / crest color
        float depthFactor = clamp((vWaveElevation + 0.35) * 1.4, 0.0, 1.0);
        vec3 waterColor = mix(uWaterColorDeep, uWaterColorShallow, depthFactor);

        // Blinn-Phong Sun Specular Glints
        vec3 halfDir = normalize(sunDir + viewDir);
        float specAngle = max(dot(worldNormal, halfDir), 0.0);
        float specular = pow(specAngle, 128.0) * 2.8;
        float specularGlitter = pow(specAngle, 512.0) * 4.5; // High-frequency sparkles

        // Sky reflection mix
        vec3 reflectionColor = mix(uSkyColor, vec3(0.96, 0.98, 1.0), fresnel * 0.6);
        vec3 finalColor = mix(waterColor, reflectionColor, fresnel);

        // Add sun specular highlights
        finalColor += (specular + specularGlitter) * uSunColor * 0.85;

        // Foam on wave crests and boundary wash
        float foam = smoothstep(0.32, 0.48, vWaveElevation) * 0.45;
        finalColor = mix(finalColor, vec3(0.94, 0.97, 1.0), foam);

        gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 0.94);
      }
    `
  };

  return {
    FilmicColorGradingShader,
    TiltShiftShader,
    PhysicalOceanShader
  };
})();
