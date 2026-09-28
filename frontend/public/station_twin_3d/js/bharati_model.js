/**
 * Bharati Antarctic Research Station - Photorealistic 3D Architectural Model
 * High-definition, cinema-grade procedural reconstruction exactly mirroring reference photographs:
 * media_1789383265777.jpg and media_1789383270434.jpg.
 *
 * Features:
 * 1. Elevated Prismatic Aerodynamic Main Station (Royal Blue, Chamfered Facets, Orange Airlock & Staircase, Stilts)
 * 2. Rooftop Communication System (3.2m Parabolic Dish, Antenna Lattice Mast, Meteorological Radome)
 * 3. Rooftop Heating / HVAC (Bank of 6 Modular Condensers with Top Axial Fans & Duct Manifolds)
 * 4. Ground AWS / Weather Station (Far-left Mast, 45° Solar PV Array, Anemometer, Radiation Shield)
 * 5. Fuel Storage Farm (Bunded Slab, 4 White Vertical Tanks, Red Pump Container, Pipe Bridge)
 * 6. Sea Water Pump House (Foreground-left Blue Building, Pitched Roof, External Heavy Pump Skid)
 * 7. Generator / Power & Battery Backup (Unified Pad: 3 Green DG Units with Exhaust Chimneys + 2 Green BESS Units)
 * 8. Store / Logistics (Dedicated Slab: 2 Light-Grey ISO Containers + 1 Bright Red ISO Container)
 * 9. Summer Camp (Modular Polar Habitat Village: Yellow & Blue ISO Containers, Service Pod, Indian Flag)
 * 10. Water Treatment Unit & Backup Heater (Right Pad: 4 Blue Pressure Vessels, Grey RO Shelter, Red Boiler + Tall Flue)
 *
 * SIH 2026 PS #26060 (MoES / NCPOR)
 */

window.BharatiModel = (function () {
  const textureCache = {};

  function createBharatiTextures() {
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

    // Subtle fabric ripple shading
    for (let x = 0; x < 512; x += 4) {
      const shade = Math.sin(x * 0.08) * 0.04;
      fCtx.fillStyle = shade > 0 ? `rgba(255,255,255,${shade})` : `rgba(0,0,0,${-shade})`;
      fCtx.fillRect(x, 0, 4, 320);
    }

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
    textureCache.bharatiFlag = new THREE.CanvasTexture(flagCanvas);
    textureCache.bharatiFlag.anisotropy = 8;

    // 2. High-Frequency Metallic Standing-Seam Corrugation
    function makeAdvancedCorrugated(baseHex, grooveHex, specularHex, freq = 32) {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, 256, 256);
      const step = 256 / freq;
      for (let i = 0; i < 256; i += step) {
        ctx.fillStyle = grooveHex;
        ctx.fillRect(i, 0, step * 0.38, 256);
        ctx.fillStyle = specularHex;
        ctx.fillRect(i + step * 0.38, 0, step * 0.22, 256);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 8;
      return tex;
    }

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

    // Calibrated against reference photographs:
    textureCache.royalBlue = makeAdvancedCorrugated('#0D62BF', '#08488E', '#207AD9', 36);
    textureCache.roofBlue = makeAdvancedCorrugated('#0B51A0', '#073B75', '#196AC5', 40);
    textureCache.safetyOrange = makeAdvancedCorrugated('#EA4D22', '#BC320E', '#F6663E', 24);
    textureCache.acousticOlive = makeAdvancedCorrugated('#244B26', '#173618', '#386B3B', 24);
    textureCache.containerGrey = makeAdvancedCorrugated('#D1D5DB', '#9CA3AF', '#E5E7EB', 20);
    textureCache.containerRed = makeAdvancedCorrugated('#DC2626', '#991B1B', '#EF4444', 20);
    textureCache.containerYellow = makeAdvancedCorrugated('#F59E0B', '#B45309', '#FBBF24', 20);
    textureCache.containerBlue = makeAdvancedCorrugated('#1D4ED8', '#1E40AF', '#3B82F6', 20);
    textureCache.pumpBlue = makeAdvancedCorrugated('#0E62BF', '#09478C', '#227CDD', 28);
    textureCache.corrugatedNormal = makeCorrugatedNormalMap(36);

    // 3. Hazmat Flammable Diamond Decal
    const hazCanvas = document.createElement('canvas');
    hazCanvas.width = 128;
    hazCanvas.height = 128;
    const hCtx = hazCanvas.getContext('2d');
    hCtx.translate(64, 64);
    hCtx.rotate(Math.PI / 4);
    hCtx.fillStyle = '#D32F2F';
    hCtx.fillRect(-45, -45, 90, 90);
    hCtx.strokeStyle = '#FFFFFF';
    hCtx.lineWidth = 4;
    hCtx.strokeRect(-42, -42, 84, 84);
    hCtx.fillStyle = '#FFFFFF';
    hCtx.font = 'bold 28px sans-serif';
    hCtx.textAlign = 'center';
    hCtx.textBaseline = 'middle';
    hCtx.fillText('3', 0, 20);
    textureCache.hazmatDiamond = new THREE.CanvasTexture(hazCanvas);
  }

  // Master Builder for Bharati Station
  function buildBharatiStation(scene) {
    createBharatiTextures();

    const stationRoot = new THREE.Group();
    stationRoot.name = "BharatiStationRoot";

    const interactiveModules = [];
    const windowMeshes = [];
    const hazardBeacons = [];

    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xFF2222,
      emissive: 0xFF1111,
      emissiveIntensity: 1.4,
      roughness: 0.15,
      metalness: 0.2
    });
    hazardBeacons.push(beaconMat);

    // Shared High-Definition Materials
    const royalBlueMat = new THREE.MeshStandardMaterial({
      map: textureCache.royalBlue,
      normalMap: textureCache.corrugatedNormal,
      normalScale: new THREE.Vector2(0.7, 0.7),
      color: 0x0D62BF,
      roughness: 0.24,
      metalness: 0.76
    });

    const roofBlueMat = new THREE.MeshStandardMaterial({
      map: textureCache.roofBlue,
      normalMap: textureCache.corrugatedNormal,
      normalScale: new THREE.Vector2(0.9, 0.9),
      color: 0x0B51A0,
      roughness: 0.22,
      metalness: 0.82
    });

    const orangeSkirtMat = new THREE.MeshStandardMaterial({
      map: textureCache.safetyOrange,
      normalMap: textureCache.corrugatedNormal,
      color: 0xEA4D22,
      roughness: 0.22,
      metalness: 0.65
    });

    const gunmetalSteelMat = new THREE.MeshStandardMaterial({
      color: 0x242A32,
      roughness: 0.25,
      metalness: 0.90
    });

    const stainlessMat = new THREE.MeshStandardMaterial({
      color: 0xDBE2E9,
      roughness: 0.15,
      metalness: 0.95
    });

    const whiteTankMat = new THREE.MeshStandardMaterial({
      color: 0xFCFCFE,
      roughness: 0.12,
      metalness: 0.88
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.08,
      metalness: 0.92
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x505860,
      roughness: 0.88,
      metalness: 0.15
    });

    const yellowPipeMat = new THREE.MeshStandardMaterial({
      color: 0xF5B041,
      roughness: 0.18,
      metalness: 0.88
    });

    const STILT_ELEVATION = 3.4;

    // Helper: ISO container with authentic corner castings
    function createISOContainer(w, h, d, mat) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      body.position.y = h / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const castMat = new THREE.MeshStandardMaterial({ color: 0x161D24, metalness: 0.9, roughness: 0.2 });
      [[-w / 2, 0], [w / 2, 0], [-w / 2, h], [w / 2, h]].forEach(([cx, cy]) => {
        const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), castMat);
        c1.position.set(cx, cy, -d / 2);
        g.add(c1);
        const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), castMat);
        c2.position.set(cx, cy, d / 2);
        g.add(c2);
      });
      return g;
    }

    // =========================================================================
    // 1. MAIN ELEVATED AERODYNAMIC COMPLEX (Center, Royal Blue)
    // =========================================================================
    const mainBuildingGroup = new THREE.Group();
    mainBuildingGroup.position.set(2.0, STILT_ELEVATION, -6.0);

    const length = 54.0;
    const width = 13.5;
    const height = 4.8;
    const halfL = length / 2;
    const halfW = width / 2;
    const chamfer = 4.2;

    // 1A. Chamfered Prismatic Hull
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-halfL + chamfer, -halfW);
    hullShape.lineTo(halfL - chamfer, -halfW);
    hullShape.lineTo(halfL, -halfW + chamfer);
    hullShape.lineTo(halfL, halfW - chamfer);
    hullShape.lineTo(halfL - chamfer, halfW);
    hullShape.lineTo(-halfL + chamfer, halfW);
    hullShape.lineTo(-halfL, halfW - chamfer);
    hullShape.lineTo(-halfL, -halfW + chamfer);
    hullShape.closePath();

    const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
      depth: height,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.25,
      bevelThickness: 0.20
    });
    hullGeo.rotateX(-Math.PI / 2);
    hullGeo.center();

    const mainHull = new THREE.Mesh(hullGeo, royalBlueMat);
    mainHull.position.y = height / 2;
    mainHull.castShadow = true;
    mainHull.receiveShadow = true;
    mainBuildingGroup.add(mainHull);

    // 1B. Roof Deck (Matching Blue Parapet)
    const roofCapGeo = new THREE.BoxGeometry(length - 1.2, 0.35, width - 1.2);
    const roofCap = new THREE.Mesh(roofCapGeo, roofBlueMat);
    roofCap.position.y = height + 0.175;
    roofCap.receiveShadow = true;
    mainBuildingGroup.add(roofCap);

    // 1C. Orange Central Entrance Airlock Module
    const airlockW = 4.0, airlockH = 3.6, airlockD = 2.2;
    const airlockGroup = new THREE.Group();
    airlockGroup.position.set(-1.5, airlockH / 2, halfW + airlockD / 2 - 0.2);

    const airlockMesh = new THREE.Mesh(new THREE.BoxGeometry(airlockW, airlockH, airlockD), orangeSkirtMat);
    airlockMesh.castShadow = true;
    airlockGroup.add(airlockMesh);

    // Entrance Door with window
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.08), gunmetalSteelMat);
    doorFrame.position.set(0, 0, airlockD / 2 + 0.04);
    airlockGroup.add(doorFrame);

    const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), glassMat);
    doorGlass.position.set(0, 0.4, airlockD / 2 + 0.09);
    airlockGroup.add(doorGlass);
    windowMeshes.push(doorGlass);

    mainBuildingGroup.add(airlockGroup);

    // 1D. Industrial Steel Access Staircase descending to ground
    const stairGroup = new THREE.Group();
    const stairSteps = 14;
    const startY = STILT_ELEVATION + 0.4;
    const endY = 0.0;
    const startZ = -6.0 + halfW + airlockD - 0.2;
    const endZ = startZ + 6.2;
    const stairX = 2.0 - 1.5;

    for (let s = 0; s <= stairSteps; s++) {
      const t = s / stairSteps;
      const sy = THREE.MathUtils.lerp(startY, endY, t);
      const sz = THREE.MathUtils.lerp(startZ, endZ, t);

      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.48), stainlessMat);
      stepMesh.position.set(stairX, sy, sz);
      stepMesh.castShadow = true;
      stairGroup.add(stepMesh);
    }

    // Staircase Handrails
    [-1.15, 1.15].forEach(hx => {
      const railCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(stairX + hx, startY + 1.1, startZ),
        new THREE.Vector3(stairX + hx, endY + 1.1, endZ)
      ]);
      const railMesh = new THREE.Mesh(new THREE.TubeGeometry(railCurve, 16, 0.035, 8, false), gunmetalSteelMat);
      stairGroup.add(railMesh);

      // Vertical balusters
      for (let s = 0; s <= stairSteps; s += 2) {
        const t = s / stairSteps;
        const sy = THREE.MathUtils.lerp(startY, endY, t);
        const sz = THREE.MathUtils.lerp(startZ, endZ, t);
        const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6), gunmetalSteelMat);
        baluster.position.set(stairX + hx, sy + 0.55, sz);
        stairGroup.add(baluster);
      }
    });
    stationRoot.add(stairGroup);

    // 1E. Orange Undercarriage Service Pods (Suspended beneath hull)
    [-19.0, 19.0].forEach(px => {
      const podMesh = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.6, 6.5), orangeSkirtMat);
      podMesh.position.set(px, -0.8, 0);
      podMesh.castShadow = true;
      mainBuildingGroup.add(podMesh);
    });

    // 1F. Double-Pane Windows with White Frames along Front Facade
    const windowSpacing = [-22.0, -18.0, -13.0, -8.0, 5.0, 10.0, 15.0, 20.0];
    windowSpacing.forEach(wx => {
      const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 0.12), new THREE.MeshStandardMaterial({ color: 0xF3F4F6, roughness: 0.2 }));
      frameMesh.position.set(wx, height * 0.55, halfW + 0.08);
      mainBuildingGroup.add(frameMesh);

      const paneMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.1), glassMat);
      paneMesh.position.set(wx, height * 0.55, halfW + 0.15);
      mainBuildingGroup.add(paneMesh);
      windowMeshes.push(paneMesh);
    });

    // 1G. Tubular Steel Stilts & Foundation Footers
    const stiltPositions = [-23.0, -17.0, -11.0, -5.0, 1.0, 7.0, 13.0, 19.0, 23.0];
    const footerGeo = new THREE.BoxGeometry(1.6, 0.45, 1.6);
    const legGeo = new THREE.CylinderGeometry(0.18, 0.22, STILT_ELEVATION + 0.4, 12);

    stiltPositions.forEach(sx => {
      [-halfW + 1.2, halfW - 1.2].forEach(sz => {
        const footer = new THREE.Mesh(footerGeo, concreteMat);
        footer.position.set(2.0 + sx, 0.225, -6.0 + sz);
        footer.castShadow = true;
        footer.receiveShadow = true;
        stationRoot.add(footer);

        const leg = new THREE.Mesh(legGeo, gunmetalSteelMat);
        leg.position.set(2.0 + sx, STILT_ELEVATION / 2 + 0.2, -6.0 + sz);
        leg.castShadow = true;
        stationRoot.add(leg);

        const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, STILT_ELEVATION * 1.3, 8), gunmetalSteelMat);
        brace.rotation.z = (sx > 0 ? 0.38 : -0.38);
        brace.position.set(2.0 + sx, STILT_ELEVATION / 2 + 0.2, -6.0 + sz);
        stationRoot.add(brace);
      });
    });

    // =========================================================================
    // 2. ROOFTOP FACILITIES (Comms & Heating / HVAC)
    // =========================================================================

    // 2A. COMMUNICATION SYSTEM (Marker 4 - Center-Left Roof)
    const commsGroup = new THREE.Group();
    commsGroup.position.set(0.0, height + 0.35, -0.5);

    // Large 3.2m Parabolic Tracking Satellite Dish
    const dishPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2.2, 16), gunmetalSteelMat);
    dishPedestal.position.y = 1.1;
    dishPedestal.castShadow = true;
    commsGroup.add(dishPedestal);

    const gimbalMount = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), gunmetalSteelMat);
    gimbalMount.position.y = 2.4;
    commsGroup.add(gimbalMount);

    const dishGeo = new THREE.SphereGeometry(1.8, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xF5F7FA, roughness: 0.18, metalness: 0.75, side: THREE.DoubleSide });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.rotation.x = -Math.PI / 2 + 0.55;
    dishMesh.rotation.y = 0.2;
    dishMesh.position.set(0, 3.2, 0);
    dishMesh.castShadow = true;
    commsGroup.add(dishMesh);

    // Feed horn tripod & boom
    const feedBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), gunmetalSteelMat);
    feedBoom.position.set(0, 3.6, 0.7);
    feedBoom.rotation.x = 0.55;
    commsGroup.add(feedBoom);

    const feedHorn = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 12), stainlessMat);
    feedHorn.position.set(0, 3.9, 1.2);
    feedHorn.rotation.x = -0.55;
    commsGroup.add(feedHorn);

    // Steel Antenna Lattice Mast
    const mastX = -4.5;
    const mastH = 8.5;
    for (let c = 0; c < 4; c++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, mastH, 8), gunmetalSteelMat);
      col.position.set(mastX + (c % 2 === 0 ? -0.5 : 0.5), mastH / 2, (c < 2 ? -0.5 : 0.5));
      commsGroup.add(col);
    }
    for (let l = 1; l < 7; l++) {
      const ring = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 1.1), gunmetalSteelMat);
      ring.position.set(mastX, l * 1.2, 0);
      commsGroup.add(ring);
    }
    const dipole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 6), stainlessMat);
    dipole.position.set(mastX, mastH + 1.2, 0);
    commsGroup.add(dipole);

    // White Meteorological Radar Dome on Blue Pedestal
    const radomeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.8, 16), royalBlueMat);
    radomeBase.position.set(4.2, 0.4, 0);
    commsGroup.add(radomeBase);

    const radomeDome = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 16), new THREE.MeshStandardMaterial({ color: 0xFAFAFC, roughness: 0.15, metalness: 0.4 }));
    radomeDome.position.set(4.2, 1.2, 0);
    radomeDome.castShadow = true;
    commsGroup.add(radomeDome);

    const commsHitBox = new THREE.Mesh(new THREE.BoxGeometry(11.0, 9.5, 5.0), new THREE.MeshBasicMaterial({ visible: false }));
    commsHitBox.position.set(0, 4.5, 0);
    commsGroup.add(commsHitBox);
    commsHitBox.userData = {
      moduleId: 'communication_system',
      name: 'Communication System',
      category: 'Command & Telecommunications',
      markerPos: new THREE.Vector3(2.0, STILT_ELEVATION + height + 6.5, -6.5)
    };
    interactiveModules.push(commsHitBox);
    mainBuildingGroup.add(commsGroup);

    // 2B. HEATING / HVAC (Marker 3 - Right Roof)
    const hvacGroup = new THREE.Group();
    hvacGroup.position.set(16.5, height + 0.35, -0.5);

    const hvacRail = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.25, 4.8), gunmetalSteelMat);
    hvacRail.position.y = 0.125;
    hvacGroup.add(hvacRail);

    const chillerMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.28, metalness: 0.65 });
    const fanCowlGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.32, 20);
    const bladeGeo = new THREE.BoxGeometry(0.95, 0.03, 0.12);

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const cx = (col - 1) * 3.2;
        const cz = (row - 0.5) * 2.0;

        const unit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 1.6), chillerMat);
        unit.position.set(cx, 0.9 + 0.25, cz);
        unit.castShadow = true;
        hvacGroup.add(unit);

        const cowl = new THREE.Mesh(fanCowlGeo, gunmetalSteelMat);
        cowl.position.set(cx, 1.8 + 0.25 + 0.16, cz);
        hvacGroup.add(cowl);

        const fan1 = new THREE.Mesh(bladeGeo, stainlessMat);
        fan1.position.set(cx, 1.8 + 0.25 + 0.16, cz);
        hvacGroup.add(fan1);
        const fan2 = new THREE.Mesh(bladeGeo, stainlessMat);
        fan2.position.set(cx, 1.8 + 0.25 + 0.16, cz);
        fan2.rotation.y = Math.PI / 2;
        hvacGroup.add(fan2);

        const guard = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.02, 6, 16), gunmetalSteelMat);
        guard.rotation.x = Math.PI / 2;
        guard.position.set(cx, 1.8 + 0.25 + 0.32, cz);
        hvacGroup.add(guard);
      }
    }

    const ductGeo = new THREE.CylinderGeometry(0.24, 0.24, 9.8, 12);
    const duct1 = new THREE.Mesh(ductGeo, stainlessMat);
    duct1.rotation.z = Math.PI / 2;
    duct1.position.set(0, 1.2, 1.4);
    hvacGroup.add(duct1);

    const hvacHitBox = new THREE.Mesh(new THREE.BoxGeometry(11.0, 3.5, 5.2), new THREE.MeshBasicMaterial({ visible: false }));
    hvacHitBox.position.set(0, 1.7, 0);
    hvacGroup.add(hvacHitBox);
    hvacHitBox.userData = {
      moduleId: 'heating_hvac',
      name: 'Heating / HVAC',
      category: 'Climate & Thermal Balance',
      markerPos: new THREE.Vector3(18.5, STILT_ELEVATION + height + 3.8, -6.5)
    };
    interactiveModules.push(hvacHitBox);
    mainBuildingGroup.add(hvacGroup);

    // 1H. Interior Station Hitboxes
    function addInteriorHitbox(id, name, cat, x, w, zOffset = 0) {
      const hit = new THREE.Mesh(new THREE.BoxGeometry(w, height, width), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(x, height / 2, 0);
      hit.userData = {
        moduleId: id,
        name: name,
        category: cat,
        markerPos: new THREE.Vector3(2.0 + x, STILT_ELEVATION + height * 0.75, -6.0 + zOffset)
      };
      mainBuildingGroup.add(hit);
      interactiveModules.push(hit);
    }
    addInteriorHitbox('laboratories', 'Upper Scientific Laboratories', 'Scientific Operations', -14.0, 14.0, 0);
    addInteriorHitbox('living_quarters', 'Residential Living Quarters', 'Life Support & Habitat', 6.0, 12.0, halfW + 1.0);
    addInteriorHitbox('dining_recreation', 'Dining Hall & Recreation Deck', 'Life Support & Habitat', 19.0, 12.0, halfW + 1.0);

    const entranceHit = new THREE.Mesh(new THREE.BoxGeometry(6.0, height, 4.5), new THREE.MeshBasicMaterial({ visible: false }));
    entranceHit.position.set(-1.5, height / 2, halfW + 1.0);
    entranceHit.userData = {
      moduleId: 'main_entrance',
      name: 'Main Entrance & Central Airlock',
      category: 'Station Hub & Entry',
      markerPos: new THREE.Vector3(0.5, STILT_ELEVATION + 3.5, -6.0 + halfW + 2.0)
    };
    mainBuildingGroup.add(entranceHit);
    interactiveModules.push(entranceHit);

    stationRoot.add(mainBuildingGroup);

    // =========================================================================
    // 3. AWS / WEATHER STATION (Marker 1 - Far-Left Ground Pad)
    // =========================================================================
    const awsGroup = new THREE.Group();
    awsGroup.position.set(-42.0, 0, -12.0);

    const awsPad = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.45, 6.0), concreteMat);
    awsPad.position.y = 0.225;
    awsPad.castShadow = true;
    awsPad.receiveShadow = true;
    awsGroup.add(awsPad);

    const awsMastH = 10.5;
    for (let c = 0; c < 4; c++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, awsMastH, 8), gunmetalSteelMat);
      col.position.set((c % 2 === 0 ? -0.6 : 0.6), awsMastH / 2 + 0.45, (c < 2 ? -0.6 : 0.6));
      col.castShadow = true;
      awsGroup.add(col);
    }
    for (let l = 1; l < 8; l++) {
      const tie = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 1.3), gunmetalSteelMat);
      tie.position.set(0, l * 1.3 + 0.45, 0);
      awsGroup.add(tie);
    }

    const pvPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.2, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x1A2B4C, roughness: 0.15, metalness: 0.85 })
    );
    pvPanel.rotation.x = -Math.PI / 4;
    pvPanel.position.set(0, 3.8 + 0.45, 0.85);
    pvPanel.castShadow = true;
    awsGroup.add(pvPanel);

    const crossArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 8), stainlessMat);
    crossArm.rotation.z = Math.PI / 2;
    crossArm.position.set(0, awsMastH + 0.45, 0);
    awsGroup.add(crossArm);

    const anemometerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), stainlessMat);
    anemometerBase.position.set(-1.1, awsMastH + 0.75, 0);
    awsGroup.add(anemometerBase);
    const anemometerHub = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), gunmetalSteelMat);
    anemometerHub.position.set(-1.1, awsMastH + 1.05, 0);
    awsGroup.add(anemometerHub);

    const vaneMesh = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 6), gunmetalSteelMat);
    vaneMesh.rotation.z = Math.PI / 2;
    vaneMesh.position.set(1.1, awsMastH + 0.95, 0);
    awsGroup.add(vaneMesh);

    const awsBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), beaconMat);
    awsBeacon.position.set(0, awsMastH + 0.65, 0);
    awsGroup.add(awsBeacon);

    const awsHitBox = new THREE.Mesh(new THREE.BoxGeometry(6.0, 11.5, 6.0), new THREE.MeshBasicMaterial({ visible: false }));
    awsHitBox.position.set(0, 5.75, 0);
    awsGroup.add(awsHitBox);
    awsHitBox.userData = {
      moduleId: 'aws_weather_station',
      name: 'AWS / Weather Station',
      category: 'Meteorology & Environmental Monitoring',
      markerPos: new THREE.Vector3(-42, 11.5, -12)
    };
    interactiveModules.push(awsHitBox);
    stationRoot.add(awsGroup);

    // =========================================================================
    // 4. FUEL STORAGE BUND (Left Mid-depth - 4 Vertical Tanks + Red Pump Cabin)
    // =========================================================================
    const fuelBundGroup = new THREE.Group();
    fuelBundGroup.position.set(-28.0, 0, -6.0);

    const fuelPadW = 14.0, fuelPadD = 12.0;
    const bundBase = new THREE.Mesh(new THREE.BoxGeometry(fuelPadW, 0.6, fuelPadD), concreteMat);
    bundBase.position.y = 0.3;
    bundBase.castShadow = true;
    bundBase.receiveShadow = true;
    fuelBundGroup.add(bundBase);

    const lipMat = new THREE.MeshStandardMaterial({ color: 0x3E454C, roughness: 0.8 });
    const lipN = new THREE.Mesh(new THREE.BoxGeometry(fuelPadW, 0.6, 0.35), lipMat);
    lipN.position.set(0, 0.9, -fuelPadD / 2);
    fuelBundGroup.add(lipN);
    const lipS = new THREE.Mesh(new THREE.BoxGeometry(fuelPadW, 0.6, 0.35), lipMat);
    lipS.position.set(0, 0.9, fuelPadD / 2);
    fuelBundGroup.add(lipS);

    const tankGeo = new THREE.CylinderGeometry(1.65, 1.65, 4.4, 24);
    const domeGeo = new THREE.SphereGeometry(1.65, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.35);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const tx = (c - 0.5) * 4.2 - 1.8;
        const tz = (r - 0.5) * 4.2;

        const tank = new THREE.Mesh(tankGeo, whiteTankMat);
        tank.position.set(tx, 2.8, tz);
        tank.castShadow = true;
        fuelBundGroup.add(tank);

        const dome = new THREE.Mesh(domeGeo, whiteTankMat);
        dome.position.set(tx, 5.0, tz);
        dome.castShadow = true;
        fuelBundGroup.add(dome);

        const haz = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), new THREE.MeshBasicMaterial({ map: textureCache.hazmatDiamond, transparent: true }));
        haz.position.set(tx, 3.2, tz + 1.68);
        fuelBundGroup.add(haz);
      }
    }

    const pumpCabin = createISOContainer(2.8, 2.4, 5.2, new THREE.MeshStandardMaterial({ map: textureCache.containerRed, color: 0xDC2626, roughness: 0.26, metalness: 0.72 }));
    pumpCabin.position.set(4.4, 0.6, 0);
    fuelBundGroup.add(pumpCabin);

    const fuelPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 8.5, 10), yellowPipeMat);
    fuelPipe.rotation.z = Math.PI / 2;
    fuelPipe.position.set(-1.8, 1.2, 4.5);
    fuelBundGroup.add(fuelPipe);

    const pipeBridgeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(5.8, 1.5, 0),
      new THREE.Vector3(12.0, 2.6, 0),
      new THREE.Vector3(18.0, 3.6, 0)
    ]);
    const pipeBridge = new THREE.Mesh(new THREE.TubeGeometry(pipeBridgeCurve, 16, 0.16, 8, false), stainlessMat);
    fuelBundGroup.add(pipeBridge);

    bundBase.userData = {
      moduleId: 'fuel_storage',
      name: 'Bunded Bulk Fuel Storage Farm',
      category: 'Energy & Fuel Reserves',
      markerPos: new THREE.Vector3(-28, 6.8, -6)
    };
    interactiveModules.push(bundBase);
    stationRoot.add(fuelBundGroup);

    // =========================================================================
    // 5. SEA WATER PUMP HOUSE (Foreground Left - Blue Building + External Pumps)
    // =========================================================================
    const pumpHouseGroup = new THREE.Group();
    pumpHouseGroup.position.set(-28.0, 0, 16.0);

    const pumpPad = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.5, 9.5), concreteMat);
    pumpPad.position.y = 0.25;
    pumpPad.castShadow = true;
    pumpPad.receiveShadow = true;
    pumpHouseGroup.add(pumpPad);

    const blueBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 3.4, 5.2),
      new THREE.MeshStandardMaterial({ map: textureCache.pumpBlue, color: 0x0D62BF, roughness: 0.24, metalness: 0.74 })
    );
    blueBuilding.position.set(-1.2, 1.95, 0);
    blueBuilding.castShadow = true;
    pumpHouseGroup.add(blueBuilding);

    const pumpRoofGeo = new THREE.ConeGeometry(4.8, 1.2, 4);
    pumpRoofGeo.rotateY(Math.PI / 4);
    const pumpRoof = new THREE.Mesh(pumpRoofGeo, roofBlueMat);
    pumpRoof.position.set(-1.2, 4.25, 0);
    pumpRoof.castShadow = true;
    pumpHouseGroup.add(pumpRoof);

    for (let p = 0; p < 3; p++) {
      const pz = (p - 1) * 1.6;
      const pumpMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12), gunmetalSteelMat);
      pumpMotor.rotation.z = Math.PI / 2;
      pumpMotor.position.set(3.4, 0.9, pz);
      pumpMotor.castShadow = true;
      pumpHouseGroup.add(pumpMotor);

      const pumpVolute = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.4, 12), stainlessMat);
      pumpVolute.rotation.x = Math.PI / 2;
      pumpVolute.position.set(2.6, 0.9, pz);
      pumpHouseGroup.add(pumpVolute);

      const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8), yellowPipeMat);
      flange.position.set(2.6, 1.6, pz);
      pumpHouseGroup.add(flange);
    }

    const headerPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.2, 12), stainlessMat);
    headerPipe.rotation.x = Math.PI / 2;
    headerPipe.position.set(2.6, 2.3, 0);
    pumpHouseGroup.add(headerPipe);

    blueBuilding.userData = {
      moduleId: 'sea_water_pump_house',
      name: 'Seawater Intake & RO Desalination',
      category: 'Water & Utilities',
      markerPos: new THREE.Vector3(-28, 5.5, 16)
    };
    interactiveModules.push(blueBuilding);
    stationRoot.add(pumpHouseGroup);

    // =========================================================================
    // 6. GENERATOR / POWER & BATTERY BACKUP (Foreground Center-Left Unified Pad)
    // 3 Dark Green Generator Units (Tall Chimneys) + 2 Dark Green BESS Units
    // =========================================================================
    const powerGroup = new THREE.Group();
    powerGroup.position.set(-4.0, 0, 16.0);

    const genPadW = 23.0, genPadD = 9.0;
    const powerSkid = new THREE.Mesh(new THREE.BoxGeometry(genPadW, 0.5, genPadD), concreteMat);
    powerSkid.position.y = 0.25;
    powerSkid.castShadow = true;
    powerSkid.receiveShadow = true;
    powerGroup.add(powerSkid);

    const darkGreenMat = new THREE.MeshStandardMaterial({
      map: textureCache.acousticOlive,
      color: 0x1E4620,
      roughness: 0.28,
      metalness: 0.65
    });

    const silencerMat = new THREE.MeshStandardMaterial({ color: 0x222830, metalness: 0.92, roughness: 0.18 });

    // 6A. 3 GENERATOR / POWER UNITS (Left Side of Pad)
    for (let g = 0; g < 3; g++) {
      const gx = -8.2 + g * 3.8;
      const genCont = createISOContainer(3.2, 2.6, 5.4, darkGreenMat);
      genCont.position.set(gx, 0.5, 0);
      powerGroup.add(genCont);

      const muffler = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.4, 12), silencerMat);
      muffler.rotation.z = Math.PI / 2;
      muffler.position.set(gx, 3.4 + 0.5, -1.0);
      powerGroup.add(muffler);

      const flue = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.6, 12), silencerMat);
      flue.position.set(gx + 0.5, 4.8 + 0.5, -1.0);
      flue.castShadow = true;
      powerGroup.add(flue);

      const rainCap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 12), silencerMat);
      rainCap.position.set(gx + 0.5, 6.2 + 0.5, -1.0);
      powerGroup.add(rainCap);
    }

    const genHitBox = new THREE.Mesh(new THREE.BoxGeometry(12.5, 6.5, 6.5), new THREE.MeshBasicMaterial({ visible: false }));
    genHitBox.position.set(-4.4, 3.25, 0);
    genHitBox.userData = {
      moduleId: 'generator_power',
      name: 'Primary Cogeneration Power House',
      category: 'Power & Energy',
      markerPos: new THREE.Vector3(-8.5, 6.8, 16)
    };
    powerGroup.add(genHitBox);
    interactiveModules.push(genHitBox);

    // 6B. (2) BATTERY BACKUP (Right Side of Pad - 2 Green BESS Units, No Chimneys)
    for (let b = 0; b < 2; b++) {
      const bx = 4.8 + b * 3.6;
      const bessCont = createISOContainer(3.0, 2.6, 5.4, darkGreenMat);
      bessCont.position.set(bx, 0.5, 0);
      powerGroup.add(bessCont);

      const barMat = new THREE.MeshStandardMaterial({ color: 0xF3F4F6, metalness: 0.8, roughness: 0.2 });
      [-0.4, 0.4].forEach(dz => {
        const latchBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 6), barMat);
        latchBar.position.set(bx, 1.8, 2.72 + dz);
        powerGroup.add(latchBar);
      });

      const statPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshBasicMaterial({ color: 0x00E676 }));
      statPanel.position.set(bx, 2.2, 2.73);
      powerGroup.add(statPanel);

      const hood = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 1.4), gunmetalSteelMat);
      hood.position.set(bx, 3.15 + 0.1, 0);
      powerGroup.add(hood);
    }

    const battHitBox = new THREE.Mesh(new THREE.BoxGeometry(8.5, 5.0, 6.5), new THREE.MeshBasicMaterial({ visible: false }));
    battHitBox.position.set(6.6, 2.5, 0);
    battHitBox.userData = {
      moduleId: 'battery_backup',
      name: 'Battery Backup',
      category: 'Energy Storage & Resilience',
      markerPos: new THREE.Vector3(2.5, 5.8, 16)
    };
    powerGroup.add(battHitBox);
    interactiveModules.push(battHitBox);

    stationRoot.add(powerGroup);

    // =========================================================================
    // 7. STORE / LOGISTICS (Foreground Center - 2 Grey + 1 Red Container)
    // =========================================================================
    const storeGroup = new THREE.Group();
    storeGroup.position.set(14.0, 0, 18.0);

    const storePad = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.5, 8.5), concreteMat);
    storePad.position.y = 0.25;
    storePad.castShadow = true;
    storePad.receiveShadow = true;
    storeGroup.add(storePad);

    const greyContMat = new THREE.MeshStandardMaterial({
      map: textureCache.containerGrey,
      color: 0xD1D5DB,
      roughness: 0.32,
      metalness: 0.65
    });
    const redContMat = new THREE.MeshStandardMaterial({
      map: textureCache.containerRed,
      color: 0xDC2626,
      roughness: 0.26,
      metalness: 0.72
    });

    const greyCont1 = createISOContainer(2.8, 2.4, 5.2, greyContMat);
    greyCont1.position.set(-3.2, 0.5, 0);
    storeGroup.add(greyCont1);

    const greyCont2 = createISOContainer(2.8, 2.4, 5.2, greyContMat);
    greyCont2.position.set(0.0, 0.5, 0);
    storeGroup.add(greyCont2);

    const redCont = createISOContainer(2.8, 2.4, 5.2, redContMat);
    redCont.position.set(3.2, 0.5, 0);
    storeGroup.add(redCont);

    const storeHitBox = new THREE.Mesh(new THREE.BoxGeometry(11.5, 4.0, 8.5), new THREE.MeshBasicMaterial({ visible: false }));
    storeHitBox.position.set(0, 2.0, 0);
    storeHitBox.userData = {
      moduleId: 'store',
      name: 'Store/Logistics',
      category: 'Logistics & Inventory',
      markerPos: new THREE.Vector3(14.0, 5.5, 18.0)
    };
    storeGroup.add(storeHitBox);
    interactiveModules.push(storeHitBox);

    stationRoot.add(storeGroup);

    // =========================================================================
    // 8. SUMMER CAMP (Foreground Right - Yellow & Blue Polar Expedition Modules)
    // =========================================================================
    const campGroup = new THREE.Group();
    campGroup.position.set(32.0, 0, 18.0);

    const yellowContMat = new THREE.MeshStandardMaterial({
      map: textureCache.containerYellow,
      color: 0xF59E0B,
      roughness: 0.28,
      metalness: 0.68
    });
    const blueContMat = new THREE.MeshStandardMaterial({
      map: textureCache.containerBlue,
      color: 0x1D4ED8,
      roughness: 0.25,
      metalness: 0.74
    });
    const serviceGreyMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.35,
      metalness: 0.55
    });

    const yBack = createISOContainer(5.8, 2.3, 2.4, yellowContMat);
    yBack.position.set(-2.2, 0, -2.8);
    campGroup.add(yBack);

    const yBack2 = createISOContainer(5.8, 2.3, 2.4, yellowContMat);
    yBack2.position.set(4.8, 0, -2.8);
    campGroup.add(yBack2);

    const greyUnit = createISOContainer(2.4, 1.9, 2.2, serviceGreyMat);
    greyUnit.position.set(-5.2, 0, 0.4);
    campGroup.add(greyUnit);

    const bMid1 = createISOContainer(5.8, 2.3, 2.4, blueContMat);
    bMid1.position.set(-0.8, 0, 0.4);
    campGroup.add(bMid1);

    const bMid2 = createISOContainer(5.8, 2.3, 2.4, blueContMat);
    bMid2.position.set(5.8, 0, 0.4);
    campGroup.add(bMid2);

    const yFront = createISOContainer(6.2, 2.3, 2.4, yellowContMat);
    yFront.position.set(3.2, 0, 3.4);
    campGroup.add(yFront);

    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 8.5, 8), stainlessMat);
    flagPole.position.set(-6.5, 4.25, -2.8);
    campGroup.add(flagPole);

    const campFlag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.0),
      new THREE.MeshBasicMaterial({ map: textureCache.bharatiFlag, side: THREE.DoubleSide })
    );
    campFlag.position.set(-5.7, 7.8, -2.8);
    campGroup.add(campFlag);

    const campHitBox = new THREE.Mesh(new THREE.BoxGeometry(16.0, 4.5, 10.0), new THREE.MeshBasicMaterial({ visible: false }));
    campHitBox.position.set(0, 2.25, 0);
    campHitBox.userData = {
      moduleId: 'summer_camp',
      name: 'Summer Polar Expedition Camp',
      category: 'Seasonal Field Operations',
      markerPos: new THREE.Vector3(32.0, 5.5, 18.0)
    };
    campGroup.add(campHitBox);
    interactiveModules.push(campHitBox);

    stationRoot.add(campGroup);

    // =========================================================================
    // 9. WATER TREATMENT UNIT & BACKUP HEATER (Right Mid-depth Pad)
    // 4 Cobalt Blue Pressure Vessels + Grey RO Shelter + Red Boiler & Tall Flue
    // =========================================================================
    const rightInfraGroup = new THREE.Group();
    rightInfraGroup.position.set(40.0, 0, -6.0);

    const rPadW = 19.5, rPadD = 9.0;
    const rPad = new THREE.Mesh(new THREE.BoxGeometry(rPadW, 0.5, rPadD), concreteMat);
    rPad.position.y = 0.25;
    rPad.castShadow = true;
    rPad.receiveShadow = true;
    rightInfraGroup.add(rPad);

    // 9A. (5) WATER TREATMENT UNIT (Left Side of Pad)
    const bCobaltMat = new THREE.MeshStandardMaterial({
      color: 0x1D4ED8,
      roughness: 0.22,
      metalness: 0.78
    });

    const bVesselR = 0.65, bVesselH = 2.4;
    for (let vr = 0; vr < 2; vr++) {
      for (let vc = 0; vc < 2; vc++) {
        const vx = -6.8 + vc * 1.6;
        const vz = -1.2 + vr * 2.2;

        const vBody = new THREE.Mesh(new THREE.CylinderGeometry(bVesselR, bVesselR, bVesselH, 20), bCobaltMat);
        vBody.position.set(vx, bVesselH / 2 + 0.5 + 0.35, vz);
        vBody.castShadow = true;
        rightInfraGroup.add(vBody);

        const vTop = new THREE.Mesh(new THREE.SphereGeometry(bVesselR, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), bCobaltMat);
        vTop.position.set(vx, bVesselH + 0.5 + 0.35, vz);
        rightInfraGroup.add(vTop);

        for (let lg = 0; lg < 4; lg++) {
          const theta = (lg * Math.PI) / 2;
          const vLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), stainlessMat);
          vLeg.position.set(vx + Math.cos(theta) * (bVesselR - 0.1), 0.5 + 0.175, vz + Math.sin(theta) * (bVesselR - 0.1));
          rightInfraGroup.add(vLeg);
        }
      }
    }

    const wHeader = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 8), stainlessMat);
    wHeader.rotation.x = Math.PI / 2;
    wHeader.position.set(-6.0, bVesselH + 0.5 + 0.7, 0);
    rightInfraGroup.add(wHeader);

    const roShelter = createISOContainer(3.8, 2.5, 5.2, new THREE.MeshStandardMaterial({
      color: 0xD1D5DB,
      roughness: 0.32,
      metalness: 0.55
    }));
    roShelter.position.set(-2.0, 0.5, 0);
    rightInfraGroup.add(roShelter);

    const roDoor = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.0, 0.08), gunmetalSteelMat);
    roDoor.position.set(-2.0, 1.5, 2.64);
    rightInfraGroup.add(roDoor);

    [-1.0, 1.0].forEach(vz => {
      const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.14, 0.3, 10), stainlessMat);
      vent.position.set(-2.0, 3.15, vz);
      rightInfraGroup.add(vent);
    });

    const waterHitBox = new THREE.Mesh(new THREE.BoxGeometry(9.5, 5.0, 6.5), new THREE.MeshBasicMaterial({ visible: false }));
    waterHitBox.position.set(-4.5, 2.5, 0);
    waterHitBox.userData = {
      moduleId: 'water_treatment_unit',
      name: 'Water Treatment Unit',
      category: 'Life Support & Utilities',
      markerPos: new THREE.Vector3(35.5, 6.2, -6.0)
    };
    rightInfraGroup.add(waterHitBox);
    interactiveModules.push(waterHitBox);

    // 9B. (6) BACKUP HEATER (Right Side of Pad - Red Container + Tall Chimney)
    const bHeaterCont = createISOContainer(5.6, 2.6, 4.2, new THREE.MeshStandardMaterial({
      map: textureCache.containerRed,
      color: 0xDC2626,
      roughness: 0.25,
      metalness: 0.72
    }));
    bHeaterCont.position.set(4.8, 0.5, 0);
    rightInfraGroup.add(bHeaterCont);

    const bFlueH = 6.2;
    const bFlueX = 6.4, bFlueZ = -0.5;
    const bFlue = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, bFlueH, 16), stainlessMat);
    bFlue.position.set(bFlueX, 3.1 + bFlueH / 2, bFlueZ);
    bFlue.castShadow = true;
    rightInfraGroup.add(bFlue);

    const bFlueCowl = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.32, 16), stainlessMat);
    bFlueCowl.position.set(bFlueX, 3.1 + bFlueH + 0.18, bFlueZ);
    rightInfraGroup.add(bFlueCowl);

    const bHeatPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 10), yellowPipeMat);
    bHeatPipe.rotation.z = Math.PI / 2;
    bHeatPipe.position.set(1.5, 1.2, -1.0);
    rightInfraGroup.add(bHeatPipe);

    const heatHitBox = new THREE.Mesh(new THREE.BoxGeometry(8.5, 7.5, 6.5), new THREE.MeshBasicMaterial({ visible: false }));
    heatHitBox.position.set(4.8, 3.75, 0);
    heatHitBox.userData = {
      moduleId: 'backup_heater',
      name: 'Backup Heater',
      category: 'Thermal Cogeneration & Standby',
      markerPos: new THREE.Vector3(45.0, 6.8, -6.0)
    };
    rightInfraGroup.add(heatHitBox);
    interactiveModules.push(heatHitBox);

    stationRoot.add(rightInfraGroup);

    scene.add(stationRoot);

    function setInteriorLights(enabled) {
      windowMeshes.forEach((mesh) => {
        mesh.material.emissive = enabled ? new THREE.Color(0xFFB040) : new THREE.Color(0x000000);
        mesh.material.emissiveIntensity = enabled ? 1.4 : 0.0;
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
    buildBharatiStation
  };
})();
