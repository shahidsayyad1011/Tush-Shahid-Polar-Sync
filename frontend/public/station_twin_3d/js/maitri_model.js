/**
 * Maitri Antarctic Research Station - Photorealistic 3D Architectural Model
 * High-definition procedural diorama reconstruction matching reference photograph media_1788816422704.jpg.
 * PBR corrugated metal cladding, structural stilt bracing, utilidors, and realistic polar facilities.
 * SIH 2026 PS #26060 (MoES / NCPOR)
 */

window.MaitriModel = (function () {
  const textureCache = {};

  // High-Resolution Procedural PBR Texture Generator
  function createProceduralTextures() {
    // 1. High-Detail Indian National Flag (Tiranga with 24-spoke Ashoka Chakra)
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 512;
    flagCanvas.height = 320;
    const fCtx = flagCanvas.getContext('2d');

    fCtx.fillStyle = '#FF9933'; // Kesari (Saffron)
    fCtx.fillRect(0, 0, 512, 106.6);
    fCtx.fillStyle = '#FFFFFF'; // White
    fCtx.fillRect(0, 106.6, 512, 106.6);
    fCtx.fillStyle = '#138808'; // India Green
    fCtx.fillRect(0, 213.3, 512, 106.6);

    // Realistic fabric weave & subtle ripple highlights
    for (let x = 0; x < 512; x += 3) {
      const shade = Math.sin(x * 0.08) * 0.04;
      fCtx.fillStyle = shade > 0 ? `rgba(255,255,255,${shade})` : `rgba(0,0,0,${-shade})`;
      fCtx.fillRect(x, 0, 3, 320);
    }

    // Ashoka Chakra (Navy Blue) with 24 Spokes
    const cx = 256, cy = 160, r = 44;
    fCtx.strokeStyle = '#000080';
    fCtx.lineWidth = 4.5;
    fCtx.beginPath();
    fCtx.arc(cx, cy, r, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.fillStyle = '#000080';
    fCtx.beginPath();
    fCtx.arc(cx, cy, 7.5, 0, Math.PI * 2);
    fCtx.fill();

    fCtx.lineWidth = 2.4;
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI) / 12;
      fCtx.beginPath();
      fCtx.moveTo(cx, cy);
      fCtx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      fCtx.stroke();
    }

    textureCache.indianFlag = new THREE.CanvasTexture(flagCanvas);
    textureCache.indianFlag.anisotropy = 8;

    // 2. High-Definition Corrugated Cladding Texture Generator
    function makeCorrugated(baseHex, ribHex, highlightHex, freq = 32, weathering = true) {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, 256, 256);

      const step = 256 / freq;
      for (let i = 0; i < 256; i += step) {
        ctx.fillStyle = ribHex;
        ctx.fillRect(i, 0, step * 0.42, 256);
        ctx.fillStyle = highlightHex;
        ctx.fillRect(i + step * 0.42, 0, step * 0.18, 256);
        ctx.fillStyle = baseHex;
        ctx.fillRect(i + step * 0.6, 0, step * 0.4, 256);
      }

      if (weathering) {
        const imgData = ctx.getImageData(0, 0, 256, 256);
        const d = imgData.data;
        for (let k = 0; k < d.length; k += 4) {
          const n = (Math.random() - 0.5) * 14;
          d[k] = Math.min(255, Math.max(0, d[k] + n));
          d[k + 1] = Math.min(255, Math.max(0, d[k + 1] + n));
          d[k + 2] = Math.min(255, Math.max(0, d[k + 2] + n));
        }
        ctx.putImageData(imgData, 0, 0);
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 8;
      return tex;
    }

    // High-Frequency Normal Map Generator for Standing-Seam Corrugated Panels
    function makeCorrugatedNormalMap(freq = 32) {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d');
      const imgData = ctx.createImageData(256, 256);
      const d = imgData.data;
      const step = 256 / freq;
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const idx = (y * 256 + x) * 4;
          const posInStep = (x % step) / step;
          const slope = Math.sin(posInStep * Math.PI * 2);
          const nx = slope * 0.7;
          const ny = (Math.random() - 0.5) * 0.06;
          const nz = Math.sqrt(Math.max(0.1, 1.0 - nx * nx - ny * ny));
          d[idx] = Math.round((nx * 0.5 + 0.5) * 255);
          d[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
          d[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
          d[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 8;
      return tex;
    }

    // Exact color matching to reference photo:
    textureCache.corrugatedSageGreen = makeCorrugated('#758D76', '#566F58', '#8EA990', 28);
    textureCache.corrugatedPolarOrange = makeCorrugated('#DD471C', '#A83110', '#F25B2F', 24);
    textureCache.corrugatedRoofDark = makeCorrugated('#2D323A', '#191C20', '#414852', 36);
    textureCache.corrugatedRoofSilver = makeCorrugated('#9BA4AD', '#7C858E', '#B3BCC5', 36);
    textureCache.corrugatedContainerBlue = makeCorrugated('#1E588F', '#143C62', '#2A72B8', 18);
    textureCache.corrugatedNormal = makeCorrugatedNormalMap(28);
    textureCache.corrugatedNormalFine = makeCorrugatedNormalMap(44);

    // 3. Polar Window Strip with Mullions, Rubber Gaskets, and Warm Luminescence
    const winCanvas = document.createElement('canvas');
    winCanvas.width = 512;
    winCanvas.height = 128;
    const wCtx = winCanvas.getContext('2d');
    wCtx.fillStyle = '#E8ECEF';
    wCtx.fillRect(0, 0, 512, 128);

    const winEmissiveCanvas = document.createElement('canvas');
    winEmissiveCanvas.width = 512;
    winEmissiveCanvas.height = 128;
    const weCtx = winEmissiveCanvas.getContext('2d');
    weCtx.fillStyle = '#000000';
    weCtx.fillRect(0, 0, 512, 128);

    for (let w = 0; w < 4; w++) {
      const bx = 20 + w * 124;
      wCtx.fillStyle = '#1A2026'; // rubber seal
      wCtx.fillRect(bx - 3, 16, 92, 92);
      wCtx.fillStyle = '#373E47'; // dark metal frame
      wCtx.fillRect(bx, 19, 86, 86);

      // Cool exterior polar sky tint blending to warm interior light
      const grad = wCtx.createLinearGradient(bx, 22, bx + 80, 102);
      grad.addColorStop(0, '#5A7A97');
      grad.addColorStop(0.65, '#38556F');
      grad.addColorStop(1, '#6F694F');
      wCtx.fillStyle = grad;
      wCtx.fillRect(bx + 3, 22, 80, 80);

      // Warm interior luminescence for bloom emission
      const eGrad = weCtx.createRadialGradient(bx + 40, 62, 6, bx + 40, 62, 44);
      eGrad.addColorStop(0, '#FFE082');
      eGrad.addColorStop(0.6, '#FFB300');
      eGrad.addColorStop(1, '#FF6F00');
      weCtx.fillStyle = eGrad;
      weCtx.fillRect(bx + 3, 22, 80, 80);

      // Glare reflection
      wCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      wCtx.beginPath();
      wCtx.moveTo(bx + 3, 22);
      wCtx.lineTo(bx + 40, 22);
      wCtx.lineTo(bx + 3, 59);
      wCtx.fill();
    }
    textureCache.windowStrip = new THREE.CanvasTexture(winCanvas);
    textureCache.windowStrip.wrapS = THREE.RepeatWrapping;
    textureCache.windowStrip.anisotropy = 8;

    textureCache.windowEmissive = new THREE.CanvasTexture(winEmissiveCanvas);
    textureCache.windowEmissive.wrapS = THREE.RepeatWrapping;
    textureCache.windowEmissive.anisotropy = 8;

    // 4. Natural Wood Planks for Steps & Landings
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 256;
    woodCanvas.height = 256;
    const wdCtx = woodCanvas.getContext('2d');
    wdCtx.fillStyle = '#876949';
    wdCtx.fillRect(0, 0, 256, 256);
    for (let p = 0; p < 256; p += 32) {
      wdCtx.fillStyle = '#563F2A';
      wdCtx.fillRect(0, p, 256, 3);
      wdCtx.fillStyle = 'rgba(255,255,255,0.06)';
      wdCtx.fillRect(0, p + 3, 256, 12);
      wdCtx.fillStyle = '#362A1F';
      wdCtx.fillRect(18, p + 14, 4, 4);
      wdCtx.fillRect(130, p + 14, 4, 4);
      wdCtx.fillRect(238, p + 14, 4, 4);
    }
    textureCache.woodPlanks = new THREE.CanvasTexture(woodCanvas);
    textureCache.woodPlanks.wrapS = THREE.RepeatWrapping;
    textureCache.woodPlanks.wrapT = THREE.RepeatWrapping;
    textureCache.woodPlanks.anisotropy = 8;

    // 5. Metal Gangway Deck Grating
    const grateCanvas = document.createElement('canvas');
    grateCanvas.width = 64;
    grateCanvas.height = 64;
    const gCtx = grateCanvas.getContext('2d');
    gCtx.fillStyle = '#484F56';
    gCtx.fillRect(0, 0, 64, 64);
    gCtx.fillStyle = '#202428';
    for (let y = 0; y < 64; y += 8) {
      for (let x = 0; x < 64; x += 8) {
        gCtx.fillRect(x, y, 4, 4);
      }
    }
    textureCache.metalGrate = new THREE.CanvasTexture(grateCanvas);
    textureCache.metalGrate.wrapS = THREE.RepeatWrapping;
    textureCache.metalGrate.wrapT = THREE.RepeatWrapping;
    textureCache.metalGrate.repeat.set(12, 3);
  }

  // Helper: Extruded pitched roof with overhang eaves, ridge flashing & safety walkways
  function createPitchedRoof(width, depth, height, roofMaterial, addRoofRails = false) {
    const group = new THREE.Group();

    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(0, height);
    shape.lineTo(width / 2, 0);
    shape.closePath();

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.22,
      bevelThickness: 0.16
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    const roofMesh = new THREE.Mesh(geometry, roofMaterial);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    group.add(roofMesh);

    // Ridge cap flashing along the apex
    const ridgeGeo = new THREE.BoxGeometry(0.35, 0.12, depth + 0.45);
    const ridgeMat = new THREE.MeshStandardMaterial({
      color: 0x1D2126,
      metalness: 0.75,
      roughness: 0.35
    });
    const ridgeMesh = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridgeMesh.position.y = height / 2 + 0.1;
    group.add(ridgeMesh);

    // Optional roof safety walkway & guardrails (visible in reference photo)
    if (addRoofRails) {
      const railMat = new THREE.MeshStandardMaterial({ color: 0xA4ACB6, metalness: 0.92, roughness: 0.2 });
      const roofRailGeo = new THREE.BoxGeometry(0.04, 0.5, depth * 0.9);
      const rail1 = new THREE.Mesh(roofRailGeo, railMat);
      rail1.position.set(-width * 0.3, height * 0.45, 0);
      group.add(rail1);
      const rail2 = new THREE.Mesh(roofRailGeo, railMat);
      rail2.position.set(width * 0.3, height * 0.45, 0);
      group.add(rail2);
    }

    return group;
  }

  // Helper: Steel stilts & diagonal cross-bracing matching polar permafrost design
  function createStilts(xSpan, zSpan, elevation, colorHex = 0x992222, spacing = 3.8) {
    const group = new THREE.Group();
    const stiltMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.28,
      metalness: 0.85
    });

    const padMat = new THREE.MeshStandardMaterial({
      color: 0x363A3E,
      roughness: 0.85,
      metalness: 0.25
    });

    const braceMat = new THREE.MeshStandardMaterial({
      color: 0x2A2E33,
      metalness: 0.82,
      roughness: 0.35
    });

    const xHalf = xSpan / 2;
    const zHalf = zSpan / 2;
    const xCount = Math.max(2, Math.round(xSpan / spacing));
    const zCount = Math.max(2, Math.round(zSpan / spacing));
    const xStep = xSpan / (xCount - 1);
    const zStep = zSpan / (zCount - 1);

    const stiltGeo = new THREE.CylinderGeometry(0.12, 0.14, elevation, 10);
    const padGeo = new THREE.BoxGeometry(0.65, 0.24, 0.65);

    for (let i = 0; i < xCount; i++) {
      const px = -xHalf + i * xStep;
      for (let j = 0; j < zCount; j++) {
        const pz = -zHalf + j * zStep;

        // Pile column
        const pile = new THREE.Mesh(stiltGeo, stiltMat);
        pile.position.set(px, elevation / 2, pz);
        pile.castShadow = true;
        group.add(pile);

        // Concrete rock anchor footpad
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.set(px, 0.12, pz);
        pad.castShadow = true;
        group.add(pad);

        // Diagonal X-bracing between adjacent piles
        if (i < xCount - 1 && (j === 0 || j === zCount - 1)) {
          const nextPx = px + xStep;
          const braceLen = Math.sqrt(xStep * xStep + elevation * elevation);
          const braceAngle = Math.atan2(elevation, xStep);

          const braceGeo = new THREE.CylinderGeometry(0.035, 0.035, braceLen, 6);
          braceGeo.rotateZ(-braceAngle);

          const b1 = new THREE.Mesh(braceGeo, braceMat);
          b1.position.set(px + xStep / 2, elevation / 2, pz);
          group.add(b1);

          const b2Geo = new THREE.CylinderGeometry(0.035, 0.035, braceLen, 6);
          b2Geo.rotateZ(braceAngle);
          const b2 = new THREE.Mesh(b2Geo, braceMat);
          b2.position.set(px + xStep / 2, elevation / 2, pz);
          group.add(b2);
        }
      }
    }

    // Longitudinal perimeter I-beams
    const beamGeo = new THREE.BoxGeometry(xSpan, 0.16, 0.12);
    const beam1 = new THREE.Mesh(beamGeo, stiltMat);
    beam1.position.set(0, elevation - 0.1, -zHalf);
    group.add(beam1);

    const beam2 = new THREE.Mesh(beamGeo, stiltMat);
    beam2.position.set(0, elevation - 0.1, zHalf);
    group.add(beam2);

    return group;
  }

  // Helper: Elevated gangway with steel mesh floor, dual railings, kickplates, and utilidor pipes
  function createGangway(length, width = 1.6, elevation = 2.4) {
    const group = new THREE.Group();

    // Steel diamond mesh deck
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x68727C,
      roughness: 0.24,
      metalness: 0.86,
      map: textureCache.metalGrate
    });
    const deckGeo = new THREE.BoxGeometry(length, 0.14, width);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = elevation;
    deck.castShadow = true;
    deck.receiveShadow = true;
    group.add(deck);

    // Twin Safety Handrails & Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xBCC6D0, metalness: 0.94, roughness: 0.15 });
    const postGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.05, 8);
    const topRailGeo = new THREE.BoxGeometry(length, 0.05, 0.05);
    const midRailGeo = new THREE.BoxGeometry(length, 0.04, 0.04);
    const toeGeo = new THREE.BoxGeometry(length, 0.14, 0.03); // toe board

    [-width / 2 + 0.05, width / 2 - 0.05].forEach((zPos) => {
      const topRail = new THREE.Mesh(topRailGeo, railMat);
      topRail.position.set(0, elevation + 1.0, zPos);
      group.add(topRail);

      const midRail = new THREE.Mesh(midRailGeo, railMat);
      midRail.position.set(0, elevation + 0.55, zPos);
      group.add(midRail);

      const toe = new THREE.Mesh(toeGeo, new THREE.MeshStandardMaterial({ color: 0x484E56, metalness: 0.75, roughness: 0.3 }));
      toe.position.set(0, elevation + 0.12, zPos);
      group.add(toe);

      const postsCount = Math.max(3, Math.floor(length / 2.2));
      for (let p = 0; p < postsCount; p++) {
        const px = -length / 2 + (p * length) / (postsCount - 1);
        const post = new THREE.Mesh(postGeo, railMat);
        post.position.set(px, elevation + 0.52, zPos);
        group.add(post);
      }
    });

    // Stilt pillars supporting gangway
    const stiltMat = new THREE.MeshStandardMaterial({ color: 0x6A727C, roughness: 0.28, metalness: 0.82 });
    const stiltGeo = new THREE.CylinderGeometry(0.08, 0.08, elevation, 8);
    const stiltCount = Math.max(2, Math.floor(length / 4.2));
    for (let s = 0; s < stiltCount; s++) {
      const sx = -length / 2 + (s * length) / (stiltCount - 1);
      [-width / 2 + 0.2, width / 2 - 0.2].forEach((sz) => {
        const stilt = new THREE.Mesh(stiltGeo, stiltMat);
        stilt.position.set(sx, elevation / 2, sz);
        stilt.castShadow = true;
        group.add(stilt);
      });
    }

    // Insulated utilidor pipes (district heating supply, return, and fuel line) running beneath gangway
    const pipeGeo = new THREE.CylinderGeometry(0.075, 0.075, length, 8);
    pipeGeo.rotateZ(Math.PI / 2);
    // Red heating supply pipe
    const heatPipe = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({ color: 0xC0392B, metalness: 0.82, roughness: 0.2 }));
    heatPipe.position.set(0, elevation - 0.22, -0.35);
    group.add(heatPipe);
    // Black heating return pipe
    const returnPipe = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({ color: 0x22262B, metalness: 0.7, roughness: 0.4 }));
    returnPipe.position.set(0, elevation - 0.22, 0.35);
    group.add(returnPipe);

    return group;
  }

  // Master Station Builder
  function buildMaitriStation(scene) {
    createProceduralTextures();

    const stationRoot = new THREE.Group();
    stationRoot.name = "MaitriStationRoot";

    const interactiveModules = [];
    const windowMeshes = [];
    const hazardBeacons = [];
    const STILT_HEIGHT = 2.4;

    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xFF2222,
      emissive: 0xFF1111,
      emissiveIntensity: 1.4,
      roughness: 0.15,
      metalness: 0.2
    });
    hazardBeacons.push(beaconMat);

    // Common High-Definition Metallic Materials
    const polarWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xEFF2F6,
      roughness: 0.26,
      metalness: 0.60
    });

    const safetyRedMat = new THREE.MeshStandardMaterial({
      color: 0xC62828,
      roughness: 0.20,
      metalness: 0.70
    });

    const darkRoofMat = new THREE.MeshStandardMaterial({
      map: textureCache.corrugatedRoofDark,
      normalMap: textureCache.corrugatedNormalFine,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughness: 0.22,
      metalness: 0.84
    });

    const wsSageMat = new THREE.MeshStandardMaterial({
      map: textureCache.corrugatedSageGreen,
      normalMap: textureCache.corrugatedNormal,
      normalScale: new THREE.Vector2(0.9, 0.9),
      color: 0x7E967F,
      roughness: 0.26,
      metalness: 0.66
    });

    const wsRoofMat = new THREE.MeshStandardMaterial({
      map: textureCache.corrugatedRoofSilver,
      normalMap: textureCache.corrugatedNormalFine,
      normalScale: new THREE.Vector2(1.3, 1.3),
      roughness: 0.16,
      metalness: 0.94
    });

    const woodMat = new THREE.MeshStandardMaterial({
      map: textureCache.woodPlanks,
      roughness: 0.85,
      metalness: 0.05
    });

    // =========================================================================
    // 1. REAR MAIN COMPLEX (Living Quarters, Labs, Main Entrance, Dining/Rec)
    // =========================================================================
    const mainComplexGroup = new THREE.Group();
    mainComplexGroup.position.set(0, 0, -8);

    // -------------------------------------------------------------------------
    // 1A. CENTRAL MAIN ENTRANCE PORTAL & INDIAN FLAG
    // -------------------------------------------------------------------------
    const entranceGroup = new THREE.Group();
    entranceGroup.position.set(0, STILT_HEIGHT, 0);

    const entranceWidth = 6.2;
    const entranceDepth = 5.4;
    const entranceHeight = 3.8;

    const entranceBox = new THREE.Mesh(
      new THREE.BoxGeometry(entranceWidth, entranceHeight, entranceDepth),
      polarWhiteMat
    );
    entranceBox.position.y = entranceHeight / 2;
    entranceBox.castShadow = true;
    entranceBox.receiveShadow = true;
    entranceGroup.add(entranceBox);

    // High-Resolution Indian Flag on front facade above door
    const flagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 1.35),
      new THREE.MeshBasicMaterial({ map: textureCache.indianFlag })
    );
    flagMesh.position.set(0, entranceHeight - 0.95, entranceDepth / 2 + 0.03);
    entranceGroup.add(flagMesh);

    // Heavy polar air-lock door
    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.2, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4, metalness: 0.5 })
    );
    doorMesh.position.set(0, 1.1, entranceDepth / 2 + 0.08);
    entranceGroup.add(doorMesh);

    // Safety Canopy over door
    const canopyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.18, 1.0),
      safetyRedMat
    );
    canopyMesh.position.set(0, 2.35, entranceDepth / 2 + 0.5);
    entranceGroup.add(canopyMesh);

    // Gabled dark roof
    const entranceRoof = createPitchedRoof(entranceWidth + 0.5, entranceDepth + 0.4, 1.35, darkRoofMat);
    entranceRoof.position.set(0, entranceHeight + 0.68, 0);
    entranceGroup.add(entranceRoof);

    // Deep Red Stilts with Cross-Bracing
    entranceGroup.add(createStilts(entranceWidth, entranceDepth, STILT_HEIGHT, 0xA82828, 3.2));

    entranceBox.userData = {
      moduleId: 'main_entrance',
      name: 'Main Entrance & Central Hub',
      category: 'Command & Access',
      markerPos: new THREE.Vector3(0, STILT_HEIGHT + entranceHeight + 2.5, -8)
    };
    interactiveModules.push(entranceBox);
    mainComplexGroup.add(entranceGroup);

    // -------------------------------------------------------------------------
    // 1B. LABORATORIES (Left Wing)
    // -------------------------------------------------------------------------
    const labGroup = new THREE.Group();
    const labWidth = 20.0;
    const labDepth = 4.8;
    const labHeight = 3.3;
    labGroup.position.set(-labWidth / 2 - entranceWidth / 2 + 0.1, STILT_HEIGHT, 0);

    const labBox = new THREE.Mesh(
      new THREE.BoxGeometry(labWidth, labHeight, labDepth),
      polarWhiteMat
    );
    labBox.position.y = labHeight / 2;
    labBox.castShadow = true;
    labBox.receiveShadow = true;
    labGroup.add(labBox);

    // Continuous safety red band along top fascia
    const labRedBand = new THREE.Mesh(
      new THREE.BoxGeometry(labWidth + 0.06, 0.48, labDepth + 0.06),
      safetyRedMat
    );
    labRedBand.position.y = labHeight - 0.24;
    labGroup.add(labRedBand);

    // Front polar windows
    const labWinFront = new THREE.Mesh(
      new THREE.PlaneGeometry(labWidth * 0.9, 0.8),
      new THREE.MeshStandardMaterial({ map: textureCache.windowStrip, roughness: 0.2, metalness: 0.7 })
    );
    textureCache.windowStrip.repeat.set(5, 1);
    labWinFront.position.set(0, labHeight / 2, labDepth / 2 + 0.02);
    labGroup.add(labWinFront);
    windowMeshes.push(labWinFront);

    // Pitched Roof with walkways
    const labRoof = createPitchedRoof(labWidth + 0.6, labDepth + 0.4, 1.35, darkRoofMat, true);
    labRoof.position.set(0, labHeight + 0.68, 0);
    labGroup.add(labRoof);

    // Red Steel Stilts with X-Bracing
    labGroup.add(createStilts(labWidth, labDepth, STILT_HEIGHT, 0xA82828, 3.8));

    labBox.userData = {
      moduleId: 'laboratories',
      name: 'Scientific Laboratories',
      category: 'Research & Science',
      markerPos: new THREE.Vector3(-14, STILT_HEIGHT + labHeight + 2.5, -8)
    };
    interactiveModules.push(labBox);
    mainComplexGroup.add(labGroup);

    // -------------------------------------------------------------------------
    // 1C. LIVING QUARTERS (Center-Right Wing)
    // -------------------------------------------------------------------------
    const livingGroup = new THREE.Group();
    const livingWidth = 18.0;
    const livingDepth = 4.8;
    const livingHeight = 3.3;
    livingGroup.position.set(livingWidth / 2 + entranceWidth / 2 - 0.1, STILT_HEIGHT, 0);

    const livingBox = new THREE.Mesh(
      new THREE.BoxGeometry(livingWidth, livingHeight, livingDepth),
      polarWhiteMat
    );
    livingBox.position.y = livingHeight / 2;
    livingBox.castShadow = true;
    livingBox.receiveShadow = true;
    livingGroup.add(livingBox);

    // Red fascia trim
    const livingRedBand = new THREE.Mesh(
      new THREE.BoxGeometry(livingWidth + 0.06, 0.48, livingDepth + 0.06),
      safetyRedMat
    );
    livingRedBand.position.y = livingHeight - 0.24;
    livingGroup.add(livingRedBand);

    // Windows
    const livingWinFront = new THREE.Mesh(
      new THREE.PlaneGeometry(livingWidth * 0.88, 0.8),
      new THREE.MeshStandardMaterial({ map: textureCache.windowStrip, roughness: 0.2, metalness: 0.7 })
    );
    livingWinFront.position.set(0, livingHeight / 2, livingDepth / 2 + 0.02);
    livingGroup.add(livingWinFront);
    windowMeshes.push(livingWinFront);

    // Pitched Roof
    const livingRoof = createPitchedRoof(livingWidth + 0.6, livingDepth + 0.4, 1.35, darkRoofMat, true);
    livingRoof.position.set(0, livingHeight + 0.68, 0);
    livingGroup.add(livingRoof);

    livingGroup.add(createStilts(livingWidth, livingDepth, STILT_HEIGHT, 0xA82828, 3.8));

    livingBox.userData = {
      moduleId: 'living_quarters',
      name: 'Living Quarters',
      category: 'Life Support & Habitat',
      markerPos: new THREE.Vector3(12, STILT_HEIGHT + livingHeight + 2.5, -8)
    };
    interactiveModules.push(livingBox);
    mainComplexGroup.add(livingGroup);

    // -------------------------------------------------------------------------
    // 1D. DINING / RECREATION WING (Two-Story Complex with Vivid Orange Facade)
    // -------------------------------------------------------------------------
    const diningGroup = new THREE.Group();
    const diningWidth = 12.5;
    const diningDepth = 6.6;
    const diningHeight = 5.8; // Distinct two-story structure
    diningGroup.position.set(livingWidth + entranceWidth / 2 + diningWidth / 2 - 0.1, STILT_HEIGHT, 0.4);

    // Lower Level: White with red horizontal stripe
    const diningLower = new THREE.Mesh(
      new THREE.BoxGeometry(diningWidth, diningHeight * 0.45, diningDepth),
      polarWhiteMat
    );
    diningLower.position.y = (diningHeight * 0.45) / 2;
    diningLower.castShadow = true;
    diningGroup.add(diningLower);

    const dinLowerStripe = new THREE.Mesh(
      new THREE.BoxGeometry(diningWidth + 0.05, 0.35, diningDepth + 0.05),
      safetyRedMat
    );
    dinLowerStripe.position.y = diningHeight * 0.22;
    diningGroup.add(dinLowerStripe);

    // Upper Level: International Polar Safety Orange Cladding (Matching photo)
    const orangeCladdingMat = new THREE.MeshStandardMaterial({
      map: textureCache.corrugatedPolarOrange,
      color: 0xE04B1A,
      roughness: 0.22,
      metalness: 0.65
    });
    const diningUpper = new THREE.Mesh(
      new THREE.BoxGeometry(diningWidth, diningHeight * 0.55, diningDepth),
      orangeCladdingMat
    );
    diningUpper.position.y = (diningHeight * 0.45) + (diningHeight * 0.55) / 2;
    diningUpper.castShadow = true;
    diningGroup.add(diningUpper);

    // Upper window row
    const dinWinUpper = new THREE.Mesh(
      new THREE.PlaneGeometry(diningWidth * 0.88, 0.75),
      new THREE.MeshStandardMaterial({ map: textureCache.windowStrip, roughness: 0.2, metalness: 0.7 })
    );
    dinWinUpper.position.set(0, diningHeight * 0.74, diningDepth / 2 + 0.02);
    diningGroup.add(dinWinUpper);
    windowMeshes.push(dinWinUpper);

    // Lower window row
    const dinWinLower = new THREE.Mesh(
      new THREE.PlaneGeometry(diningWidth * 0.88, 0.75),
      new THREE.MeshStandardMaterial({ map: textureCache.windowStrip, roughness: 0.2, metalness: 0.7 })
    );
    dinWinLower.position.set(0, diningHeight * 0.24, diningDepth / 2 + 0.02);
    diningGroup.add(dinWinLower);
    windowMeshes.push(dinWinLower);

    // Dining Roof with rooftop kitchen exhaust cowls
    const diningRoof = createPitchedRoof(diningWidth + 0.6, diningDepth + 0.4, 1.5, darkRoofMat, true);
    diningRoof.position.set(0, diningHeight + 0.75, 0);
    diningGroup.add(diningRoof);

    const ventMat = new THREE.MeshStandardMaterial({ color: 0x48505A, metalness: 0.92, roughness: 0.18 });
    [-2.2, 0, 2.2].forEach((vx) => {
      const ventStack = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.9, 8), ventMat);
      ventStack.position.set(vx, diningHeight + 1.6, 0);
      diningGroup.add(ventStack);
      const ventCap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.22, 8), ventMat);
      ventCap.position.set(vx, diningHeight + 2.1, 0);
      diningGroup.add(ventCap);
    });

    // External Galvanized Steel Fire Escape Staircase on right end
    const stairGroup = new THREE.Group();
    stairGroup.position.set(diningWidth / 2 + 0.8, 0, 0);
    const stairSteelMat = new THREE.MeshStandardMaterial({ color: 0x9099A4, metalness: 0.92, roughness: 0.18 });
    for (let step = 0; step < 14; step++) {
      const stepY = (step * (diningHeight + STILT_HEIGHT)) / 14;
      const stepZ = (step * 0.42) - 2.8;
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.07, 0.36), stairSteelMat);
      stepMesh.position.set(0, stepY - STILT_HEIGHT, stepZ);
      stairGroup.add(stepMesh);
    }
    diningGroup.add(stairGroup);

    diningGroup.add(createStilts(diningWidth, diningDepth, STILT_HEIGHT, 0xA82828, 3.2));

    diningUpper.userData = {
      moduleId: 'dining_recreation',
      name: 'Dining & Recreation Complex',
      category: 'Community & Mess',
      markerPos: new THREE.Vector3(26, STILT_HEIGHT + diningHeight + 2.5, -8)
    };
    interactiveModules.push(diningUpper);
    mainComplexGroup.add(diningGroup);

    // -------------------------------------------------------------------------
    // 1E. REAR METEOROLOGY & COMMS MAST (Behind Laboratories)
    // -------------------------------------------------------------------------
    const mastGroup = new THREE.Group();
    mastGroup.position.set(-16, STILT_HEIGHT + labHeight, -4.8);

    // Equipment Shack
    const shackMat = new THREE.MeshStandardMaterial({ color: 0x3E5A74, roughness: 0.5, metalness: 0.3 });
    const shack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 2.8), shackMat);
    shack.position.y = 1.2;
    shack.castShadow = true;
    mastGroup.add(shack);

    // Observation Radome Dome
    const radomeGeo = new THREE.SphereGeometry(1.15, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.72);
    const radomeMat = new THREE.MeshStandardMaterial({
      color: 0xF7FAFC,
      roughness: 0.25,
      metalness: 0.1
    });
    const radome = new THREE.Mesh(radomeGeo, radomeMat);
    radome.position.set(-0.9, 2.9, 0);
    radome.castShadow = true;
    mastGroup.add(radome);

    // 4-Legged Steel Lattice Communication Tower
    const mastHeight = 15.0;
    const mastSteelMat = new THREE.MeshStandardMaterial({
      color: 0xC6D0DC,
      metalness: 0.95,
      roughness: 0.14
    });

    const mastLegGeo = new THREE.CylinderGeometry(0.045, 0.08, mastHeight, 6);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(mastLegGeo, mastSteelMat);
      leg.position.set(lx * 0.65, mastHeight / 2 + 1.8, lz * 0.65);
      mastGroup.add(leg);
    });

    // Rungs & Cross-Lattices
    for (let r = 1.8; r < mastHeight; r += 1.3) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 1.0), mastSteelMat);
      rung.position.set(0, r + 1.8, 0);
      mastGroup.add(rung);
    }

    // Microwave antenna drum
    const drumGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16);
    drumGeo.rotateZ(Math.PI / 2);
    const drum = new THREE.Mesh(drumGeo, new THREE.MeshStandardMaterial({ color: 0xEAECEF, metalness: 0.7, roughness: 0.22 }));
    drum.position.set(0.8, mastHeight * 0.75 + 1.8, 0);
    mastGroup.add(drum);

    // Top mast lightning rod and Red Aviation Beacon
    const topRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.5, 6), mastSteelMat);
    topRod.position.set(0, mastHeight + 3.0, 0);
    mastGroup.add(topRod);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 12),
      beaconMat
    );
    beacon.position.set(0, mastHeight + 4.2, 0);
    mastGroup.add(beacon);

    mainComplexGroup.add(mastGroup);
    stationRoot.add(mainComplexGroup);

    // =========================================================================
    // 2. FRONT WORKSHOP WING (Sage Green Corrugated Polar Cladding)
    // =========================================================================
    const workshopGroup = new THREE.Group();
    const wsWidth = 32.0;
    const wsDepth = 5.0;
    const wsHeight = 3.3;
    workshopGroup.position.set(-2.0, STILT_HEIGHT, 10.0);

    const wsBox = new THREE.Mesh(
      new THREE.BoxGeometry(wsWidth, wsHeight, wsDepth),
      wsSageMat
    );
    wsBox.position.y = wsHeight / 2;
    wsBox.castShadow = true;
    wsBox.receiveShadow = true;
    workshopGroup.add(wsBox);

    // Corrugated silver metal roof with hatches
    const wsRoof = createPitchedRoof(wsWidth + 0.6, wsDepth + 0.4, 1.25, wsRoofMat, true);
    wsRoof.position.set(0, wsHeight + 0.62, 0);
    workshopGroup.add(wsRoof);

    // Workshop front windows
    const wsWinFront = new THREE.Mesh(
      new THREE.PlaneGeometry(wsWidth * 0.88, 0.75),
      new THREE.MeshStandardMaterial({ map: textureCache.windowStrip, roughness: 0.2, metalness: 0.7 })
    );
    textureCache.windowStrip.repeat.set(7, 1);
    wsWinFront.position.set(0, wsHeight / 2 + 0.15, wsDepth / 2 + 0.02);
    workshopGroup.add(wsWinFront);
    windowMeshes.push(wsWinFront);

    // Central Workshop Entrance Door & Timber Landing with steps
    const wsDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 2.1, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4 })
    );
    wsDoor.position.set(0, 1.05, wsDepth / 2 + 0.04);
    workshopGroup.add(wsDoor);

    const wsDeck = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 2.0), woodMat);
    wsDeck.position.set(0, 0, wsDepth / 2 + 1.0);
    wsDeck.castShadow = true;
    workshopGroup.add(wsDeck);

    for (let st = 1; st <= 6; st++) {
      const stMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.42), woodMat);
      stMesh.position.set(0, -st * 0.38, wsDepth / 2 + 1.0 + st * 0.36);
      stMesh.castShadow = true;
      workshopGroup.add(stMesh);
    }

    // Industrial Grey Stilts with X-Bracing
    workshopGroup.add(createStilts(wsWidth, wsDepth, STILT_HEIGHT, 0x555C63, 4.0));

    wsBox.userData = {
      moduleId: 'workshop',
      name: 'Maintenance Workshop',
      category: 'Engineering & Logistics',
      markerPos: new THREE.Vector3(-2, STILT_HEIGHT + wsHeight + 2.5, 10)
    };
    interactiveModules.push(wsBox);
    stationRoot.add(workshopGroup);

    // =========================================================================
    // 3. ELEVATED GANGWAY BRIDGES (Connecting Network)
    // =========================================================================
    const walkwaysGroup = new THREE.Group();

    // Central Bridge: Main Entrance to Workshop
    const centralBridge = createGangway(13.2, 1.8, STILT_HEIGHT);
    centralBridge.rotation.y = Math.PI / 2;
    centralBridge.position.set(0, 0, 1.0);
    walkwaysGroup.add(centralBridge);

    // Left Gangway: Workshop left end to Fuel/Gen
    const leftWalkway = createGangway(10.5, 1.4, STILT_HEIGHT);
    leftWalkway.position.set(-22, 0, 7.5);
    leftWalkway.rotation.y = 0.3;
    walkwaysGroup.add(leftWalkway);

    // Right Gangway: Workshop right end to Store 1
    const rightWalkway = createGangway(8.2, 1.4, STILT_HEIGHT);
    rightWalkway.position.set(17, 0, 11);
    rightWalkway.rotation.y = -0.2;
    walkwaysGroup.add(rightWalkway);

    // Gangway to Store 2 (Foreground Store)
    const store2Walkway = createGangway(11.5, 1.4, STILT_HEIGHT);
    store2Walkway.position.set(13, 0, 19);
    store2Walkway.rotation.y = Math.PI / 2 - 0.2;
    walkwaysGroup.add(store2Walkway);

    // Gangway connecting Main Complex to Stores
    const storeConnectWalkway = createGangway(15.2, 1.4, STILT_HEIGHT);
    storeConnectWalkway.position.set(22, 0, 3);
    storeConnectWalkway.rotation.y = Math.PI / 2 + 0.1;
    walkwaysGroup.add(storeConnectWalkway);

    stationRoot.add(walkwaysGroup);

    // =========================================================================
    // 4. POWER & FUEL SECTOR (Left Flank)
    // =========================================================================
    const powerSectorGroup = new THREE.Group();

    // -------------------------------------------------------------------------
    // 4A. GENERATOR ROOM (Power House)
    // -------------------------------------------------------------------------
    const genGroup = new THREE.Group();
    const genWidth = 14.5;
    const genDepth = 5.6;
    const genHeight = 3.5;
    genGroup.position.set(-32.0, STILT_HEIGHT, 13.0);
    genGroup.rotation.y = 0.45;

    const genBox = new THREE.Mesh(
      new THREE.BoxGeometry(genWidth, genHeight, genDepth),
      wsSageMat
    );
    genBox.position.y = genHeight / 2;
    genBox.castShadow = true;
    genGroup.add(genBox);

    const genRoof = createPitchedRoof(genWidth + 0.6, genDepth + 0.4, 1.35, wsRoofMat);
    genRoof.position.set(0, genHeight + 0.68, 0);
    genGroup.add(genRoof);

    // Exhaust muffler stacks protruding through roof
    const exhaustSteel = new THREE.MeshStandardMaterial({ color: 0x3A3E45, metalness: 0.85, roughness: 0.25 });
    [-2.2, 2.2].forEach((ex) => {
      const exPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.0, 10), exhaustSteel);
      exPipe.position.set(ex, genHeight + 1.9, -0.6);
      genGroup.add(exPipe);

      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.22, 10), exhaustSteel);
      cap.position.set(ex, genHeight + 2.9, -0.6);
      genGroup.add(cap);
    });

    // Catwalk porch along inner flank
    const genPorch = new THREE.Mesh(new THREE.BoxGeometry(genWidth * 0.8, 0.16, 1.6), woodMat);
    genPorch.position.set(0, 0, genDepth / 2 + 0.8);
    genGroup.add(genPorch);

    genGroup.add(createStilts(genWidth, genDepth, STILT_HEIGHT, 0x555C63, 3.6));

    genBox.userData = {
      moduleId: 'generator_room',
      name: 'Generator & Power House',
      category: 'Power & Energy',
      markerPos: new THREE.Vector3(-32, STILT_HEIGHT + genHeight + 2.5, 13)
    };
    interactiveModules.push(genBox);
    powerSectorGroup.add(genGroup);

    // -------------------------------------------------------------------------
    // 4B. BULK FUEL STORAGE FARM (6 White Cylinders + 1 Red Vertical Tank)
    // -------------------------------------------------------------------------
    const fuelGroup = new THREE.Group();
    fuelGroup.position.set(-25.0, 0, 1.5);

    const skid = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 0.45, 7.2),
      new THREE.MeshStandardMaterial({ color: 0x555C63, roughness: 0.85, metalness: 0.2 })
    );
    skid.position.y = 0.225;
    fuelGroup.add(skid);

    // 6 White Horizontal Cylinders with Dished Hemispherical Heads
    const horizTankGeo = new THREE.CylinderGeometry(0.88, 0.88, 3.8, 24);
    horizTankGeo.rotateZ(Math.PI / 2);
    const whiteTankMat = new THREE.MeshStandardMaterial({
      color: 0xFAFAFC,
      roughness: 0.12,
      metalness: 0.92
    });

    const redSaddleMat = new THREE.MeshStandardMaterial({ color: 0x8B2518, roughness: 0.35, metalness: 0.8 });

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const tankMesh = new THREE.Mesh(horizTankGeo, whiteTankMat);
        const tx = (col - 1) * 2.3 - 0.6;
        const tz = (row - 0.5) * 2.5 - 0.5;
        tankMesh.position.set(tx, 1.55, tz);
        tankMesh.castShadow = true;
        fuelGroup.add(tankMesh);

        // Hemispherical dish dome caps on ends
        const capGeo = new THREE.SphereGeometry(0.88, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const cap1 = new THREE.Mesh(capGeo, whiteTankMat);
        cap1.rotation.z = -Math.PI / 2;
        cap1.position.set(tx - 1.9, 1.55, tz);
        fuelGroup.add(cap1);

        const cap2 = new THREE.Mesh(capGeo, whiteTankMat);
        cap2.rotation.z = Math.PI / 2;
        cap2.position.set(tx + 1.9, 1.55, tz);
        fuelGroup.add(cap2);

        // Saddle supports
        [-1.1, 1.1].forEach((cx) => {
          const cradle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.85, 1.9), redSaddleMat);
          cradle.position.set(tx + cx, 0.85, tz);
          fuelGroup.add(cradle);
        });
      }
    }

    // 1 Prominent Upright Red Cylinder Tank (Daily Service Fuel Tank)
    const vertRedTankGeo = new THREE.CylinderGeometry(1.15, 1.15, 3.4, 24);
    const redGlossMat = new THREE.MeshStandardMaterial({
      color: 0xC62828,
      roughness: 0.14,
      metalness: 0.90
    });
    const vertRedTank = new THREE.Mesh(vertRedTankGeo, redGlossMat);
    vertRedTank.position.set(2.7, 2.1, -1.0);
    vertRedTank.castShadow = true;
    fuelGroup.add(vertRedTank);

    // Sight gauge on red tank
    const sightGauge = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.6, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xEAEAEA, roughness: 0.15, metalness: 0.8 })
    );
    sightGauge.position.set(2.7 + 1.15, 2.1, -1.0);
    fuelGroup.add(sightGauge);

    // Fuel pump operator booth
    const pumpBooth = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.3, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x5C6874, roughness: 0.35, metalness: 0.65 })
    );
    pumpBooth.position.set(-5.0, 1.35, 0);
    pumpBooth.castShadow = true;
    fuelGroup.add(pumpBooth);

    // Yellow Fuel Pipe Manifold
    const yellowPipeMat = new THREE.MeshStandardMaterial({ color: 0xF5B041, metalness: 0.92, roughness: 0.15 });
    const manifold = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 7.8, 12), yellowPipeMat);
    manifold.rotation.z = Math.PI / 2;
    manifold.position.set(-1.0, 0.65, 2.3);
    fuelGroup.add(manifold);

    vertRedTank.userData = {
      moduleId: 'fuel_storage',
      name: 'Bulk Fuel Storage Farm',
      category: 'Energy & Consumables',
      markerPos: new THREE.Vector3(-25, 5.5, 1.5)
    };
    interactiveModules.push(vertRedTank);
    powerSectorGroup.add(fuelGroup);
    stationRoot.add(powerSectorGroup);

    // =========================================================================
    // 5. STORES & COMMUNICATIONS SECTOR (Right Flank)
    // =========================================================================
    const logisticsSector = new THREE.Group();

    // Store 1 (Upper Technical Store)
    const store1Group = new THREE.Group();
    const s1Width = 10.5;
    const s1Depth = 5.4;
    const s1Height = 3.2;
    store1Group.position.set(24.0, STILT_HEIGHT, 14.0);

    const s1Box = new THREE.Mesh(new THREE.BoxGeometry(s1Width, s1Height, s1Depth), wsSageMat);
    s1Box.position.y = s1Height / 2;
    s1Box.castShadow = true;
    store1Group.add(s1Box);

    const s1Roof = createPitchedRoof(s1Width + 0.5, s1Depth + 0.4, 1.15, wsRoofMat);
    s1Roof.position.set(0, s1Height + 0.58, 0);
    store1Group.add(s1Roof);

    store1Group.add(createStilts(s1Width, s1Depth, STILT_HEIGHT, 0x555C63, 3.2));

    s1Box.userData = {
      moduleId: 'store',
      name: 'Store/Logistics',
      category: 'Logistics & Inventory',
      markerPos: new THREE.Vector3(24, STILT_HEIGHT + s1Height + 2.5, 14)
    };
    interactiveModules.push(s1Box);
    logisticsSector.add(store1Group);

    // Store 2 (Foreground Provision Store)
    const store2Group = new THREE.Group();
    const s2Width = 9.5;
    const s2Depth = 5.8;
    const s2Height = 3.2;
    store2Group.position.set(10.0, STILT_HEIGHT, 24.0);

    const s2Box = new THREE.Mesh(new THREE.BoxGeometry(s2Width, s2Height, s2Depth), wsSageMat);
    s2Box.position.y = s2Height / 2;
    s2Box.castShadow = true;
    store2Group.add(s2Box);

    const s2Roof = createPitchedRoof(s2Width + 0.5, s2Depth + 0.4, 1.15, wsRoofMat);
    s2Roof.position.set(0, s2Height + 0.58, 0);
    store2Group.add(s2Roof);

    store2Group.add(createStilts(s2Width, s2Depth, STILT_HEIGHT, 0x555C63, 3.0));

    s2Box.userData = {
      moduleId: 'store',
      name: 'Store/Logistics',
      category: 'Logistics & Inventory',
      markerPos: new THREE.Vector3(10, STILT_HEIGHT + s2Height + 2.5, 24)
    };
    interactiveModules.push(s2Box);
    logisticsSector.add(store2Group);

    // Communication Room: Blue ISO Shipping Containers
    const commsGroup = new THREE.Group();
    commsGroup.position.set(31.0, 0, 17.0);

    const containerMat = new THREE.MeshStandardMaterial({
      map: textureCache.corrugatedContainerBlue,
      color: 0x1E5B94,
      roughness: 0.24,
      metalness: 0.75
    });

    [-1.25, 1.25].forEach((cz) => {
      const container = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.3, 2.3), containerMat);
      container.position.set(0, 1.15, cz);
      container.castShadow = true;
      commsGroup.add(container);

      // Corner castings
      const castMat = new THREE.MeshStandardMaterial({ color: 0x14395A, metalness: 0.85, roughness: 0.2 });
      [[-2.5, 0], [2.5, 0], [-2.5, 2.3], [2.5, 2.3]].forEach(([cx, cy]) => {
        const casting = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), castMat);
        casting.position.set(cx, cy, cz + 1.15);
        commsGroup.add(casting);
      });
    });

    // Satellite Ground Station: Parabolic VSAT Dish Antenna
    const vsatGroup = new THREE.Group();
    vsatGroup.position.set(6.8, 0, 0.5);

    const steelGalv = new THREE.MeshStandardMaterial({ color: 0xC8D0D8, metalness: 0.96, roughness: 0.12 });
    const mountBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 2.2, 10), steelGalv);
    mountBase.position.y = 1.1;
    vsatGroup.add(mountBase);

    // Tripod legs
    for (let l = 0; l < 3; l++) {
      const theta = (l * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 2.0, 8), steelGalv);
      leg.position.set(Math.cos(theta) * 0.75, 0.9, Math.sin(theta) * 0.75);
      leg.rotation.z = 0.45;
      leg.rotation.y = theta;
      vsatGroup.add(leg);
    }

    // Parabolic Dish
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.39),
      new THREE.MeshStandardMaterial({ color: 0xF8F9FB, roughness: 0.16, metalness: 0.68, side: THREE.DoubleSide })
    );
    dish.rotation.x = -Math.PI / 2 + 0.6;
    dish.rotation.y = 0.3;
    dish.position.set(0, 2.8, 0);
    dish.castShadow = true;
    vsatGroup.add(dish);

    // Feed horn boom struts
    const feedBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 8), steelGalv);
    feedBoom.position.set(0, 3.3, -0.45);
    feedBoom.rotation.x = 0.6;
    vsatGroup.add(feedBoom);

    const feedHorn = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.28, 10), steelGalv);
    feedHorn.position.set(0, 3.8, -0.9);
    feedHorn.rotation.x = 2.2;
    vsatGroup.add(feedHorn);

    commsGroup.add(vsatGroup);

    const commsHitBox = new THREE.Mesh(
      new THREE.BoxGeometry(10, 4, 6),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    commsHitBox.position.set(2, 2, 0);
    commsGroup.add(commsHitBox);

    commsHitBox.userData = {
      moduleId: 'communication_room',
      name: 'Communications Room & VSAT',
      category: 'Telecommunications',
      markerPos: new THREE.Vector3(34, 4.5, 17)
    };
    interactiveModules.push(commsHitBox);

    logisticsSector.add(commsGroup);
    stationRoot.add(logisticsSector);

    // =========================================================================
    // 6. NEW CRITICAL INFRASTRUCTURE SECTOR (Maitri Expansions)
    // AWS / Weather Station, Battery Backup, Water Treatment, Backup Heater, Heating/HVAC
    // Preserves all existing facilities without displacement
    // =========================================================================
    const infrastructureSector = new THREE.Group();
    infrastructureSector.name = "MaitriCriticalInfrastructure";

    // Common materials for infrastructure
    const infraGalvSteel = new THREE.MeshStandardMaterial({ color: 0xB8C2CC, metalness: 0.94, roughness: 0.16 });
    const infraDarkSteel = new THREE.MeshStandardMaterial({ color: 0x2E353D, metalness: 0.88, roughness: 0.25 });
    const infraYellowPipe = new THREE.MeshStandardMaterial({ color: 0xF5B041, metalness: 0.85, roughness: 0.22 });
    const infraCobaltBlue = new THREE.MeshStandardMaterial({ color: 0x1862AC, roughness: 0.22, metalness: 0.78 });
    const infraStainless = new THREE.MeshStandardMaterial({ color: 0xDEE5EC, metalness: 0.96, roughness: 0.12 });
    const infraPolarGrey = new THREE.MeshStandardMaterial({ color: 0xD0D7DE, roughness: 0.38, metalness: 0.45 });
    const infraBessWhite = new THREE.MeshStandardMaterial({ color: 0xE2E7EC, roughness: 0.26, metalness: 0.65 });
    const infraSlateChiller = new THREE.MeshStandardMaterial({ color: 0x616F7D, roughness: 0.30, metalness: 0.70 });
    const infraConcretePad = new THREE.MeshStandardMaterial({ color: 0x474E56, roughness: 0.90, metalness: 0.15 });

    function buildPerimeterRailing(w, d, h = 1.05) {
      const rg = new THREE.Group();
      const topRailGeoX = new THREE.BoxGeometry(w, 0.04, 0.04);
      const midRailGeoX = new THREE.BoxGeometry(w, 0.03, 0.03);
      const topRailGeoZ = new THREE.BoxGeometry(0.04, 0.04, d);
      const midRailGeoZ = new THREE.BoxGeometry(0.03, 0.03, d);
      const postGeo = new THREE.CylinderGeometry(0.032, 0.032, h, 8);
      const toeGeoX = new THREE.BoxGeometry(w, 0.12, 0.02);
      const toeGeoZ = new THREE.BoxGeometry(0.02, 0.12, d);

      [-d / 2, d / 2].forEach(z => {
        const top = new THREE.Mesh(topRailGeoX, infraGalvSteel);
        top.position.set(0, h, z);
        rg.add(top);
        const mid = new THREE.Mesh(midRailGeoX, infraGalvSteel);
        mid.position.set(0, h * 0.55, z);
        rg.add(mid);
        const toe = new THREE.Mesh(toeGeoX, infraDarkSteel);
        toe.position.set(0, 0.06, z);
        rg.add(toe);
      });
      [-w / 2, w / 2].forEach(x => {
        const top = new THREE.Mesh(topRailGeoZ, infraGalvSteel);
        top.position.set(x, h, 0);
        rg.add(top);
        const mid = new THREE.Mesh(midRailGeoZ, infraGalvSteel);
        mid.position.set(x, h * 0.55, 0);
        rg.add(mid);
        const toe = new THREE.Mesh(toeGeoZ, infraDarkSteel);
        toe.position.set(x, 0.06, 0);
        rg.add(toe);
      });

      const nx = Math.max(2, Math.floor(w / 2.0));
      const nz = Math.max(2, Math.floor(d / 2.0));
      for (let i = 0; i <= nx; i++) {
        const px = -w / 2 + (i * w) / nx;
        [-d / 2, d / 2].forEach(pz => {
          const post = new THREE.Mesh(postGeo, infraGalvSteel);
          post.position.set(px, h / 2, pz);
          rg.add(post);
        });
      }
      for (let j = 1; j < nz; j++) {
        const pz = -d / 2 + (j * d) / nz;
        [-w / 2, w / 2].forEach(px => {
          const post = new THREE.Mesh(postGeo, infraGalvSteel);
          post.position.set(px, h / 2, pz);
          rg.add(post);
        });
      }
      return rg;
    }

    // -------------------------------------------------------------------------
    // 6A. AWS / WEATHER STATION (Top-Left elevated on rocky platform)
    // -------------------------------------------------------------------------
    const awsGroup = new THREE.Group();
    awsGroup.position.set(-44.0, 0, 1.5);

    // Platform deck with timber planking & perimeter railing
    const awsDeck = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.38, 6.4), woodMat);
    awsDeck.position.y = 0.45;
    awsDeck.castShadow = true;
    awsDeck.receiveShadow = true;
    awsGroup.add(awsDeck);

    // Elevated corner piles & footpads
    [[-3.4, -2.8], [3.4, -2.8], [-3.4, 2.8], [3.4, 2.8], [0, 0]].forEach(([px, pz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.45, 8), infraDarkSteel);
      leg.position.set(px, 0.225, pz);
      awsGroup.add(leg);
    });

    const awsRailing = buildPerimeterRailing(7.6, 6.4, 1.05);
    awsRailing.position.y = 0.64;
    awsGroup.add(awsRailing);

    // Access ladder on front right
    for (let r = 0; r < 3; r++) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.35), woodMat);
      rung.position.set(2.4, r * 0.15 + 0.1, 3.4 + r * 0.3);
      awsGroup.add(rung);
    }

    // 4-Legged Galvanized Steel Lattice Meteorological Mast
    const awsMastHeight = 9.8;
    const mastBaseW = 1.4;
    const mastTopW = 0.6;
    const legGeo = new THREE.CylinderGeometry(0.038, 0.05, awsMastHeight, 8);
    const mastCenter = new THREE.Vector3(-1.4, 0.64, -0.6);

    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const leg = new THREE.Mesh(legGeo, infraGalvSteel);
      const bX = mastCenter.x + (sx * mastBaseW) / 2;
      const tX = mastCenter.x + (sx * mastTopW) / 2;
      const bZ = mastCenter.z + (sz * mastBaseW) / 2;
      const tZ = mastCenter.z + (sz * mastTopW) / 2;
      leg.position.set((bX + tX) / 2, awsMastHeight / 2 + 0.64, (bZ + tZ) / 2);
      leg.rotation.z = Math.atan2(bX - tX, awsMastHeight);
      leg.rotation.x = Math.atan2(tZ - bZ, awsMastHeight);
      awsGroup.add(leg);
    });

    // Horizontal & diagonal rungs along mast
    for (let h = 1.2; h < awsMastHeight; h += 1.1) {
      const wAtH = mastBaseW + (mastTopW - mastBaseW) * (h / awsMastHeight);
      const frameGeo = new THREE.BoxGeometry(wAtH, 0.03, wAtH);
      const frame = new THREE.Mesh(frameGeo, infraGalvSteel);
      frame.position.set(mastCenter.x, h + 0.64, mastCenter.z);
      awsGroup.add(frame);
    }

    // Top mast assembly: Central needle, lightning rod & pulsating red aviation beacon
    const lightningRod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 2.2, 8), infraGalvSteel);
    lightningRod.position.set(mastCenter.x, awsMastHeight + 1.6, mastCenter.z);
    awsGroup.add(lightningRod);

    const awsBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), beaconMat);
    awsBeacon.position.set(mastCenter.x, awsMastHeight + 2.7, mastCenter.z);
    awsGroup.add(awsBeacon);

    // Weather Sensors: Anemometer & Wind Vane Cross-Arm
    const crossArm = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 2.2, 8), infraGalvSteel);
    crossArm.rotation.z = Math.PI / 2;
    crossArm.position.set(mastCenter.x, awsMastHeight - 0.5, mastCenter.z);
    awsGroup.add(crossArm);

    // 3-Cup Spinning Anemometer on left arm
    const cupHub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8), infraDarkSteel);
    cupHub.position.set(mastCenter.x - 1.0, awsMastHeight - 0.35, mastCenter.z);
    awsGroup.add(cupHub);
    for (let c = 0; c < 3; c++) {
      const angle = (c * Math.PI * 2) / 3;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 6), infraDarkSteel);
      spoke.rotation.z = Math.PI / 2;
      spoke.rotation.y = angle;
      spoke.position.set(mastCenter.x - 1.0 + Math.cos(angle) * 0.14, awsMastHeight - 0.3, mastCenter.z + Math.sin(angle) * 0.14);
      awsGroup.add(spoke);

      const cup = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8, 0, Math.PI), infraStainless);
      cup.rotation.x = Math.PI / 2;
      cup.rotation.z = angle + Math.PI / 2;
      cup.position.set(mastCenter.x - 1.0 + Math.cos(angle) * 0.28, awsMastHeight - 0.3, mastCenter.z + Math.sin(angle) * 0.28);
      awsGroup.add(cup);
    }

    // Wind Direction Vane on right arm
    const vaneShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), infraDarkSteel);
    vaneShaft.position.set(mastCenter.x + 1.0, awsMastHeight - 0.35, mastCenter.z);
    awsGroup.add(vaneShaft);
    const vanePointer = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.04), infraStainless);
    vanePointer.position.set(mastCenter.x + 1.0, awsMastHeight - 0.2, mastCenter.z);
    awsGroup.add(vanePointer);
    const vaneFin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.02), infraStainless);
    vaneFin.position.set(mastCenter.x + 1.25, awsMastHeight - 0.14, mastCenter.z);
    awsGroup.add(vaneFin);

    // Multi-tier Aspirated Radiation Shield / Stevenson Screen
    for (let s = 0; s < 5; s++) {
      const shieldPlate = new THREE.Mesh(new THREE.ConeGeometry(0.24 - s * 0.015, 0.06, 12, 1, true), polarWhiteMat);
      shieldPlate.position.set(mastCenter.x + 0.5, awsMastHeight - 2.0 - s * 0.12, mastCenter.z + 0.4);
      awsGroup.add(shieldPlate);
    }

    // Photovoltaic Solar Power Array mounted to platform
    const pvGroup = new THREE.Group();
    pvGroup.position.set(1.4, 1.3, 0.5);
    pvGroup.rotation.y = 0.32;
    pvGroup.rotation.x = -0.72; // ~45 deg polar tilt angle

    // Panel frame & solar cells
    const pvFrame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.45, 0.08), infraStainless);
    pvGroup.add(pvFrame);

    const pvCellMat = new THREE.MeshStandardMaterial({
      color: 0x0A2850,
      roughness: 0.12,
      metalness: 0.92
    });
    const pvCells = new THREE.Mesh(new THREE.PlaneGeometry(2.18, 1.33), pvCellMat);
    pvCells.position.z = 0.045;
    pvGroup.add(pvCells);

    // Solar panel structural mount struts
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x828D98, metalness: 0.9, roughness: 0.2 });
    [-0.9, 0.9].forEach(sx => {
      const strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), strutMat);
      strut1.position.set(sx, -0.6, -0.3);
      strut1.rotation.x = 0.5;
      pvGroup.add(strut1);
    });
    awsGroup.add(pvGroup);

    // Weatherproof NEMA-4X Data Logger Cabinet on post
    const loggerBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.15, 0.48), infraStainless);
    loggerBox.position.set(-0.8, 1.7, 1.2);
    loggerBox.castShadow = true;
    awsGroup.add(loggerBox);
    const loggerPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), infraGalvSteel);
    loggerPost.position.set(-0.8, 1.1, 1.2);
    awsGroup.add(loggerPost);

    // AWS Hitbox for Click/Hover Inspection
    const awsHitBox = new THREE.Mesh(new THREE.BoxGeometry(8.0, 11.5, 7.0), new THREE.MeshBasicMaterial({ visible: false }));
    awsHitBox.position.set(0, 5.5, 0);
    awsGroup.add(awsHitBox);
    awsHitBox.userData = {
      moduleId: 'aws_weather_station',
      name: 'AWS / Weather Station',
      category: 'Meteorology & Science',
      markerPos: new THREE.Vector3(-44, 11.5, 1.5)
    };
    interactiveModules.push(awsHitBox);
    infrastructureSector.add(awsGroup);

    // -------------------------------------------------------------------------
    // 6B. BATTERY BACKUP (BESS - Lower Left Foreground)
    // -------------------------------------------------------------------------
    const batteryGroup = new THREE.Group();
    batteryGroup.position.set(-38.0, 0, 27.0);

    const battPadW = 14.0, battPadD = 7.2;
    const battPad = new THREE.Mesh(new THREE.BoxGeometry(battPadW, 0.45, battPadD), infraConcretePad);
    battPad.position.y = 0.225;
    battPad.castShadow = true;
    battPad.receiveShadow = true;
    batteryGroup.add(battPad);

    const battRailing = buildPerimeterRailing(battPadW, battPadD, 1.05);
    battRailing.position.y = 0.45;
    batteryGroup.add(battRailing);

    // Row of 4 outdoor BESS weatherized cabinets
    const numCabinets = 4;
    const cabWidth = 2.4, cabHeight = 2.6, cabDepth = 1.7;
    const cabSpacing = 2.85;

    for (let b = 0; b < numCabinets; b++) {
      const bx = (b - (numCabinets - 1) / 2) * cabSpacing - 0.7;
      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(cabWidth, cabHeight, cabDepth), infraBessWhite);
      cabinet.position.set(bx, cabHeight / 2 + 0.45, 0);
      cabinet.castShadow = true;
      cabinet.receiveShadow = true;
      batteryGroup.add(cabinet);

      // Overhang rain & snow drip hood
      const hood = new THREE.Mesh(new THREE.BoxGeometry(cabWidth + 0.16, 0.1, cabDepth + 0.18), infraStainless);
      hood.position.set(bx, cabHeight + 0.48, 0);
      batteryGroup.add(hood);

      // Dual front doors with vertical louvers & handles
      [-cabWidth * 0.24, cabWidth * 0.24].forEach(dx => {
        const doorLine = new THREE.Mesh(new THREE.BoxGeometry(cabWidth * 0.44, cabHeight * 0.88, 0.03), infraStainless);
        doorLine.position.set(bx + dx, cabHeight / 2 + 0.45, cabDepth / 2 + 0.02);
        batteryGroup.add(doorLine);

        // Ventilation louver slats on door
        for (let l = 0; l < 5; l++) {
          const louver = new THREE.Mesh(new THREE.BoxGeometry(cabWidth * 0.36, 0.04, 0.02), infraDarkSteel);
          louver.position.set(bx + dx, cabHeight * 0.65 + l * 0.1 + 0.45, cabDepth / 2 + 0.04);
          batteryGroup.add(louver);
        }

        // Flush handle
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.03), infraDarkSteel);
        handle.position.set(bx + dx + (dx > 0 ? -0.38 : 0.38), cabHeight * 0.48 + 0.45, cabDepth / 2 + 0.04);
        batteryGroup.add(handle);
      });

      // Digital status screen (glows nominal cyan)
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.22),
        new THREE.MeshBasicMaterial({ color: 0x00E676 })
      );
      screen.position.set(bx - 0.4, cabHeight * 0.78 + 0.45, cabDepth / 2 + 0.045);
      batteryGroup.add(screen);

      // Yellow/Black High-Voltage warning plaque
      const warnPlaque = new THREE.Mesh(
        new THREE.PlaneGeometry(0.28, 0.28),
        new THREE.MeshBasicMaterial({ color: 0xF1C40F })
      );
      warnPlaque.rotation.z = Math.PI / 4;
      warnPlaque.position.set(bx + 0.4, cabHeight * 0.78 + 0.45, cabDepth / 2 + 0.045);
      batteryGroup.add(warnPlaque);
    }

    // Power Conversion System (PCS) Inverter / Transformer enclosure
    const invWidth = 1.9, invHeight = 2.8, invDepth = 1.6;
    const invX = 5.4;
    const inverter = new THREE.Mesh(new THREE.BoxGeometry(invWidth, invHeight, invDepth), infraDarkSteel);
    inverter.position.set(invX, invHeight / 2 + 0.45, 0);
    inverter.castShadow = true;
    batteryGroup.add(inverter);

    // Inverter cooling fan grille on roof
    const invFan = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 16), infraStainless);
    invFan.position.set(invX, invHeight + 0.51, 0);
    batteryGroup.add(invFan);

    // Cable conduit trunking tray running along the back
    const cableTray = new THREE.Mesh(new THREE.BoxGeometry(battPadW * 0.85, 0.15, 0.45), infraStainless);
    cableTray.position.set(0, 0.55, -cabDepth / 2 - 0.6);
    batteryGroup.add(cableTray);

    const bHitBox = new THREE.Mesh(new THREE.BoxGeometry(battPadW, 4.2, battPadD), new THREE.MeshBasicMaterial({ visible: false }));
    bHitBox.position.set(0, 2.1, 0);
    batteryGroup.add(bHitBox);
    bHitBox.userData = {
      moduleId: 'battery_backup',
      name: 'Battery Backup',
      category: 'Energy Storage & Resilience',
      markerPos: new THREE.Vector3(-38, 5.2, 27)
    };
    interactiveModules.push(bHitBox);
    infrastructureSector.add(batteryGroup);

    // -------------------------------------------------------------------------
    // 6C. WATER TREATMENT UNIT (Cobalt Filtration Vessels & RO Skid)
    // -------------------------------------------------------------------------
    const waterGroup = new THREE.Group();
    waterGroup.position.set(-21.0, 0, 24.0);

    const waterPadW = 10.8, waterPadD = 7.4;
    const waterSkid = new THREE.Mesh(new THREE.BoxGeometry(waterPadW, 0.4, waterPadD), infraDarkSteel);
    waterSkid.position.y = 0.2;
    waterSkid.castShadow = true;
    waterSkid.receiveShadow = true;
    waterGroup.add(waterSkid);

    // Diamond grating deck on skid
    const grateDeck = new THREE.Mesh(new THREE.BoxGeometry(waterPadW - 0.3, 0.05, waterPadD - 0.3), new THREE.MeshStandardMaterial({
      map: textureCache.metalGrate,
      roughness: 0.3,
      metalness: 0.85
    }));
    grateDeck.position.y = 0.42;
    waterGroup.add(grateDeck);

    const waterRailing = buildPerimeterRailing(waterPadW, waterPadD, 1.05);
    waterRailing.position.y = 0.44;
    waterGroup.add(waterRailing);

    // 2 Vertical Pressurized Media Filter Vessels in Polar Cobalt Blue
    const vesselRadius = 0.78, vesselHeight = 2.4;
    [-1.3, 1.3].forEach((vz) => {
      const vx = -2.8;
      const vesselBody = new THREE.Mesh(new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselHeight, 24), infraCobaltBlue);
      vesselBody.position.set(vx, vesselHeight / 2 + 0.9, vz);
      vesselBody.castShadow = true;
      waterGroup.add(vesselBody);

      // Dished hemispherical top and bottom heads
      const topDome = new THREE.Mesh(new THREE.SphereGeometry(vesselRadius, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), infraCobaltBlue);
      topDome.position.set(vx, vesselHeight + 0.9, vz);
      waterGroup.add(topDome);

      const botDome = new THREE.Mesh(new THREE.SphereGeometry(vesselRadius, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), infraCobaltBlue);
      botDome.rotation.x = Math.PI;
      botDome.position.set(vx, 0.9, vz);
      waterGroup.add(botDome);

      // 4 Heavy structural support legs
      for (let lg = 0; lg < 4; lg++) {
        const theta = (lg * Math.PI) / 2;
        const vLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), infraStainless);
        vLeg.position.set(vx + Math.cos(theta) * (vesselRadius - 0.15), 0.65, vz + Math.sin(theta) * (vesselRadius - 0.15));
        waterGroup.add(vLeg);
      }

      // Top inspection manhole flange with bolts
      const manhole = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 16), infraStainless);
      manhole.position.set(vx, vesselHeight + 0.9 + vesselRadius * 0.85, vz);
      waterGroup.add(manhole);

      // Pressure gauge dial
      const pGauge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12), infraStainless);
      pGauge.rotation.z = Math.PI / 2;
      pGauge.position.set(vx + vesselRadius + 0.04, vesselHeight * 0.65 + 0.9, vz);
      waterGroup.add(pGauge);

      // Connecting stainless pipe header between vessels
      const headerPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 12), infraStainless);
      headerPipe.rotation.x = Math.PI / 2;
      headerPipe.position.set(vx, vesselHeight * 0.75 + 0.9, 0);
      waterGroup.add(headerPipe);
    });

    // 1 Large Potable Water Storage Buffer Tank in Polished Stainless Steel
    const tankRadius = 1.15, tankHeight = 3.2;
    const tankX = 0.6, tankZ = 0.1;
    const storageTank = new THREE.Mesh(new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 28), infraStainless);
    storageTank.position.set(tankX, tankHeight / 2 + 0.65, tankZ);
    storageTank.castShadow = true;
    waterGroup.add(storageTank);

    // Conical tank roof
    const tankRoof = new THREE.Mesh(new THREE.ConeGeometry(tankRadius + 0.08, 0.55, 28), infraStainless);
    tankRoof.position.set(tankX, tankHeight + 0.65 + 0.275, tankZ);
    waterGroup.add(tankRoof);

    // Exterior access ladder with safety rungs
    const ladderX = tankX + tankRadius + 0.12;
    const ladderRungs = 12;
    for (let r = 0; r < ladderRungs; r++) {
      const lr = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.45), infraStainless);
      lr.position.set(ladderX, 0.65 + (r * tankHeight) / ladderRungs, tankZ);
      waterGroup.add(lr);
    }

    // High-Pressure RO Desalination Membrane Rack (Stacked horizontal cylinders)
    const roGroup = new THREE.Group();
    roGroup.position.set(3.6, 0.44, 0);
    for (let row = 0; row < 3; row++) {
      const roCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.2, 16), infraStainless);
      roCylinder.rotation.z = Math.PI / 2;
      roCylinder.position.set(0, 0.5 + row * 0.48, 0);
      roGroup.add(roCylinder);
    }
    // High-pressure pump with blue motor
    const roPump = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.8), infraCobaltBlue);
    roPump.position.set(0, 0.3, 1.8);
    roGroup.add(roPump);

    // Yellow control valves with handwheels
    for (let v = 0; v < 3; v++) {
      const vWheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), infraYellowPipe);
      vWheel.rotation.x = Math.PI / 2;
      vWheel.position.set(0, 0.5 + v * 0.48, -1.7);
      roGroup.add(vWheel);
    }
    waterGroup.add(roGroup);

    const wHitBox = new THREE.Mesh(new THREE.BoxGeometry(waterPadW, 5.2, waterPadD), new THREE.MeshBasicMaterial({ visible: false }));
    wHitBox.position.set(0, 2.6, 0);
    waterGroup.add(wHitBox);
    wHitBox.userData = {
      moduleId: 'water_treatment_unit',
      name: 'Water Treatment Unit',
      category: 'Life Support & Utilities',
      markerPos: new THREE.Vector3(-21, 5.8, 24)
    };
    interactiveModules.push(wHitBox);
    infrastructureSector.add(waterGroup);

    // -------------------------------------------------------------------------
    // 6D. BACKUP HEATER (Iconic Red-Roofed Prefab Shelter & Chimney Flue)
    // -------------------------------------------------------------------------
    const heaterGroup = new THREE.Group();
    const bhElevation = STILT_HEIGHT * 0.65;
    heaterGroup.position.set(-11.0, bhElevation, 24.0);

    const bhWidth = 7.4, bhHeight = 3.3, bhDepth = 5.2;
    const bhBox = new THREE.Mesh(new THREE.BoxGeometry(bhWidth, bhHeight, bhDepth), infraPolarGrey);
    bhBox.position.y = bhHeight / 2;
    bhBox.castShadow = true;
    bhBox.receiveShadow = true;
    heaterGroup.add(bhBox);

    // Iconic Bright Red Pitched Corrugated Metal Roof
    const bhRoof = createPitchedRoof(bhWidth + 0.6, bhDepth + 0.4, 1.35, safetyRedMat);
    bhRoof.position.set(0, bhHeight + 0.68, 0);
    heaterGroup.add(bhRoof);

    // Front windows with frames
    [-1.6, 1.6].forEach(wx => {
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 0.9),
        new THREE.MeshStandardMaterial({ map: textureCache.windowStrip, roughness: 0.2, metalness: 0.6 })
      );
      win.position.set(wx, bhHeight * 0.58, bhDepth / 2 + 0.02);
      heaterGroup.add(win);
      windowMeshes.push(win);
    });

    // Weatherproof door with viewing porthole
    const bhDoor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.1, 0.1), infraDarkSteel);
    bhDoor.position.set(0, 1.05, bhDepth / 2 + 0.03);
    heaterGroup.add(bhDoor);

    // Elevated stilts with footpads
    heaterGroup.add(createStilts(bhWidth, bhDepth, bhElevation, 0x555C63, 3.2));

    // Wooden landing and steps
    const bhLanding = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 1.6), woodMat);
    bhLanding.position.set(0, 0, bhDepth / 2 + 0.8);
    heaterGroup.add(bhLanding);
    for (let st = 1; st <= 4; st++) {
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.38), woodMat);
      stepMesh.position.set(0, -st * 0.35, bhDepth / 2 + 0.8 + st * 0.35);
      heaterGroup.add(stepMesh);
    }

    // Prominent Vertical Stainless Steel / Dark Flue Chimney Stack with Stay Wires
    const flueRadius = 0.22, flueHeight = 5.2;
    const flueX = 1.8, flueZ = -0.2;
    const flueStack = new THREE.Mesh(new THREE.CylinderGeometry(flueRadius, flueRadius, flueHeight, 16), infraDarkSteel);
    flueStack.position.set(flueX, bhHeight + flueHeight / 2 + 0.6, flueZ);
    flueStack.castShadow = true;
    heaterGroup.add(flueStack);

    // Top rain cowl cap
    const flueCowl = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.28, 16), infraStainless);
    flueCowl.position.set(flueX, bhHeight + flueHeight + 0.74, flueZ);
    heaterGroup.add(flueCowl);

    // 4 Diagonal Guy Wire Stay Cables anchoring chimney against polar winds
    [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].forEach(([gx, gz]) => {
      const cableCurve = new THREE.LineCurve3(
        new THREE.Vector3(flueX, bhHeight + flueHeight * 0.85 + 0.6, flueZ),
        new THREE.Vector3(flueX + gx * 1.6, bhHeight + 0.8, flueZ + gz * 1.6)
      );
      const cableGeo = new THREE.TubeGeometry(cableCurve, 4, 0.015, 6, false);
      const cableMesh = new THREE.Mesh(cableGeo, infraStainless);
      heaterGroup.add(cableMesh);
    });

    // Insulated yellow district heating supply and return pipes exiting to station network
    const heatOutPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), infraYellowPipe);
    heatOutPipe.rotation.x = Math.PI / 2;
    heatOutPipe.position.set(-bhWidth / 2 - 0.2, 1.2, 0);
    heaterGroup.add(heatOutPipe);

    const bhHitBox = new THREE.Mesh(new THREE.BoxGeometry(bhWidth + 1.2, 6.8, bhDepth + 1.2), new THREE.MeshBasicMaterial({ visible: false }));
    bhHitBox.position.set(0, 3.4, 0);
    heaterGroup.add(bhHitBox);
    bhHitBox.userData = {
      moduleId: 'backup_heater',
      name: 'Backup Heater',
      category: 'Thermal Life Support',
      markerPos: new THREE.Vector3(-11, 6.2, 24)
    };
    interactiveModules.push(bhHitBox);
    infrastructureSector.add(heaterGroup);

    // -------------------------------------------------------------------------
    // 6E. HEATING / HVAC (Skid with 4 Circular Axial Cooling Fans & Pipes)
    // -------------------------------------------------------------------------
    const hvacGroup = new THREE.Group();
    hvacGroup.position.set(-2.0, 0, 32.0);

    const hvacPadW = 12.0, hvacPadD = 6.8;
    const hvacSkid = new THREE.Mesh(new THREE.BoxGeometry(hvacPadW, 0.45, hvacPadD), infraDarkSteel);
    hvacSkid.position.y = 0.225;
    hvacSkid.castShadow = true;
    hvacSkid.receiveShadow = true;
    hvacGroup.add(hvacSkid);

    const hvacRailing = buildPerimeterRailing(hvacPadW, hvacPadD, 1.05);
    hvacRailing.position.y = 0.45;
    hvacGroup.add(hvacRailing);

    // Main Central Chiller Unit Housing
    const chWidth = 9.4, chHeight = 2.4, chDepth = 4.2;
    const chillerBody = new THREE.Mesh(new THREE.BoxGeometry(chWidth, chHeight, chDepth), infraSlateChiller);
    chillerBody.position.set(0, chHeight / 2 + 0.45, 0);
    chillerBody.castShadow = true;
    hvacGroup.add(chillerBody);

    // 4 Circular Top Axial Exhaust Cooling Fan Cowls with Wire Guards
    const fanRadius = 0.76, fanCowlH = 0.38;
    [[-2.4, -0.95], [-2.4, 0.95], [2.4, -0.95], [2.4, 0.95]].forEach(([fx, fz]) => {
      // Cylindrical fan shroud cowl
      const cowl = new THREE.Mesh(new THREE.CylinderGeometry(fanRadius, fanRadius + 0.06, fanCowlH, 24, 1, true), infraStainless);
      cowl.position.set(fx, chHeight + fanCowlH / 2 + 0.45, fz);
      hvacGroup.add(cowl);

      // Central fan rotor hub
      const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 12), infraDarkSteel);
      fanHub.position.set(fx, chHeight + fanCowlH * 0.6 + 0.45, fz);
      hvacGroup.add(fanHub);

      // 4 Aerodynamic fan blades
      for (let b = 0; b < 4; b++) {
        const bAngle = (b * Math.PI) / 2;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(fanRadius * 0.78, 0.02, 0.18), infraDarkSteel);
        blade.position.set(fx + Math.cos(bAngle) * fanRadius * 0.42, chHeight + fanCowlH * 0.6 + 0.45, fz + Math.sin(bAngle) * fanRadius * 0.42);
        blade.rotation.y = bAngle;
        blade.rotation.x = 0.25;
        hvacGroup.add(blade);
      }

      // Protective radial wire guard grille
      const guardRing = new THREE.Mesh(new THREE.TorusGeometry(fanRadius * 0.92, 0.02, 6, 24), infraStainless);
      guardRing.rotation.x = Math.PI / 2;
      guardRing.position.set(fx, chHeight + fanCowlH + 0.46, fz);
      hvacGroup.add(guardRing);
    });

    // Finned condenser coil louvers along both long sides
    [-chDepth / 2 - 0.02, chDepth / 2 + 0.02].forEach(lz => {
      for (let lv = 0; lv < 8; lv++) {
        const louverSlat = new THREE.Mesh(new THREE.BoxGeometry(chWidth * 0.88, 0.06, 0.04), infraDarkSteel);
        louverSlat.position.set(0, 0.45 + 0.4 + lv * 0.22, lz);
        hvacGroup.add(louverSlat);
      }
    });

    // Yellow insulated heating supply/return pipes with expansion tank
    const hvacYellowPipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.8, 12), infraYellowPipe);
    hvacYellowPipe1.rotation.z = Math.PI / 2;
    hvacYellowPipe1.position.set(-chWidth / 2 - 1.2, 0.9, 0.6);
    hvacGroup.add(hvacYellowPipe1);

    const hvacYellowPipe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.8, 12), infraYellowPipe);
    hvacYellowPipe2.rotation.z = Math.PI / 2;
    hvacYellowPipe2.position.set(-chWidth / 2 - 1.2, 1.3, -0.6);
    hvacGroup.add(hvacYellowPipe2);

    // Expansion tank (vertical red cylinder)
    const expTank = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.4, 16), safetyRedMat);
    expTank.position.set(-chWidth / 2 - 0.8, 1.4, 0);
    hvacGroup.add(expTank);

    // Electrical / VFD control enclosure with status LED
    const hvacControlBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.4), infraStainless);
    hvacControlBox.position.set(chWidth / 2 - 0.7, 1.5, chDepth / 2 + 0.22);
    hvacGroup.add(hvacControlBox);
    const hvacLed = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00E676 }));
    hvacLed.position.set(chWidth / 2 - 0.7, 1.9, chDepth / 2 + 0.44);
    hvacGroup.add(hvacLed);

    const hHitBox = new THREE.Mesh(new THREE.BoxGeometry(hvacPadW, 4.8, hvacPadD), new THREE.MeshBasicMaterial({ visible: false }));
    hHitBox.position.set(0, 2.4, 0);
    hvacGroup.add(hHitBox);
    hHitBox.userData = {
      moduleId: 'heating_hvac',
      name: 'Heating / HVAC',
      category: 'Climate & Thermal Management',
      markerPos: new THREE.Vector3(-2, 5.5, 32)
    };
    interactiveModules.push(hHitBox);
    infrastructureSector.add(hvacGroup);

    stationRoot.add(infrastructureSector);

    scene.add(stationRoot);

    function setInteriorLights(enabled) {
      windowMeshes.forEach((mesh) => {
        mesh.material.emissive = enabled ? new THREE.Color(0xFFB040) : new THREE.Color(0x000000);
        mesh.material.emissiveMap = enabled ? textureCache.windowEmissive : null;
        mesh.material.emissiveIntensity = enabled ? 1.35 : 0.0;
        mesh.material.needsUpdate = true;
      });
    }

    function updateBeacons(time) {
      const pulse = Math.pow((Math.sin(time * 4.5) + 1.0) * 0.5, 4.0) * 2.8 + 0.3;
      hazardBeacons.forEach((mat) => {
        mat.emissiveIntensity = pulse;
      });
    }

    return {
      stationRoot,
      interactiveModules,
      setInteriorLights,
      updateBeacons
    };
  }

  return {
    buildMaitriStation
  };
})();
