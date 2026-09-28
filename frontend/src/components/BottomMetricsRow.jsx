import React from 'react';

// Helper to convert degree to compass heading
function degToCompass(num) {
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[(val % 16)];
}

export default function BottomMetricsRow({
  data,
  onOpenEnergyDetails,
  onOpenWeatherDetails,
  onOpenEquipmentDetails,
  onOpenLogisticsDetails,
}) {
  const d = data || {};

  // 1. Energy values
  const powerGen = d.power_generation != null ? d.power_generation.toFixed(1) : '74.2';
  const powerCon = d.power_consumption != null ? d.power_consumption.toFixed(1) : '72.1';
  const battSoc = d.battery_soc != null ? d.battery_soc.toFixed(1) : '89.2';
  const fuelLvl = d.fuel_level != null ? d.fuel_level.toFixed(1) : '73.9';
  const genStatus = d.generator_status || 'RUNNING';

  // 2. Environment values
  const outdoorTemp = d.temperature != null ? d.temperature.toFixed(1) : '-10.5';
  const windSpeedKmh = d.wind_speed != null ? d.wind_speed.toFixed(1) : '62.4';
  const windDirDeg = d.wind_direction != null ? Math.round(d.wind_direction) : 298;
  const windHeading = degToCompass(windDirDeg);
  const humidityVal = d.humidity != null ? d.humidity.toFixed(1) : '51.0';

  // 3. Equipment & Infrastructure values
  const equipTemp = d.equipment_temperature != null ? d.equipment_temperature.toFixed(1) : '33.2';
  const vibration = d.vibration != null ? d.vibration.toFixed(2) : '2.04';
  const heatingVal = d.heating != null ? d.heating.toFixed(1) : '32.8';
  const isPumpOnline = d.pump_status !== 0;

  // 4. Logistics values
  const foodDays = d.food_days_remaining != null ? d.food_days_remaining : 92;
  const foodStock = d.food_stock_kg != null ? d.food_stock_kg.toLocaleString() : '1,840';
  const medDays = d.medicine_days_remaining != null ? d.medicine_days_remaining : 122;
  const fuelDays = d.generator_fuel_reserve_days_remaining != null ? d.generator_fuel_reserve_days_remaining : 384;
  const rawRisk = d.resupply_risk || 'NOMINAL';
  const resupplyRisk = rawRisk === 'NORMAL' ? 'NOMINAL' : rawRisk;

  return (
    <div className="ps-bottom-grid ps-bottom-grid-4">
      {/* ── CARD 1: Energy & Power Grid ── */}
      <div className="ps-white-card ps-bottom-card">
        <div className="ps-card-header">
          <div className="ps-card-title-wrap" title="Energy & Power Grid">
            <span className="ps-domain-icon green">⚡</span>
            <h3 className="ps-card-title">Energy & Power Grid</h3>
          </div>
          <div className="ps-header-right-group">
            <span className={`ps-badge-pill ${genStatus === 'RUNNING' ? 'green' : 'red'}`}>
              {genStatus}
            </span>
            <button
              type="button"
              className="ps-card-action-link"
              onClick={onOpenEnergyDetails}
              title="View Energy Details"
            >
              Details →
            </button>
          </div>
        </div>

        <div className="ps-bottom-metrics-2x2">
          {/* Tile 1: Generation */}
          <div className="ps-metric-2x2-tile" title={`Power Generation: ${powerGen} kW (DG-1 Active)`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Generation</span>
              <span className="ps-tile-tag green">DG-1</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num green">{powerGen}</span>
              <span className="ps-tile-unit">kW</span>
            </div>
            <span className="ps-tile-sub-caption">100kVA Main Feed</span>
          </div>

          {/* Tile 2: Consumption */}
          <div className="ps-metric-2x2-tile" title={`Power Consumption: ${powerCon} kW (Base Load)`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Consumption</span>
              <span className="ps-tile-tag blue">Base</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num blue">{powerCon}</span>
              <span className="ps-tile-unit">kW</span>
            </div>
            <span className="ps-tile-sub-caption">Life Support & Labs</span>
          </div>

          {/* Tile 3: Battery SOC */}
          <div className="ps-metric-2x2-tile" title={`Battery SOC: ${battSoc}%`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Battery SOC</span>
              <span className="ps-tile-tag green">Nominal</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num cyan">{battSoc}</span>
              <span className="ps-tile-unit">%</span>
            </div>
            <span className="ps-tile-sub-caption">Inverter Bus 415V</span>
          </div>

          {/* Tile 4: Day Tank */}
          <div className="ps-metric-2x2-tile" title={`Day Tank Fuel: ${fuelLvl}%`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Day Tank</span>
              <span className="ps-tile-tag amber">Feed</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num amber">{fuelLvl}</span>
              <span className="ps-tile-unit">%</span>
            </div>
            <span className="ps-tile-sub-caption">Generator Supply</span>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Environment & Climate ── */}
      <div className="ps-white-card ps-bottom-card">
        <div className="ps-card-header">
          <div className="ps-card-title-wrap" title="Environment & Climate">
            <span className="ps-domain-icon blue">🌡️</span>
            <h3 className="ps-card-title">Environment & Climate</h3>
          </div>
          <div className="ps-header-right-group">
            <span className="ps-badge-pill blue">Live AWS</span>
            <button
              type="button"
              className="ps-card-action-link"
              onClick={onOpenWeatherDetails}
              title="View Environment Details"
            >
              Details →
            </button>
          </div>
        </div>

        <div className="ps-bottom-metrics-2x2">
          {/* Tile 1: Ambient Temp */}
          <div className="ps-metric-2x2-tile" title={`Ambient Temperature: ${outdoorTemp} °C`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Ambient Temp</span>
              <span className="ps-tile-tag blue">AWS</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num blue">{outdoorTemp}</span>
              <span className="ps-tile-unit">°C</span>
            </div>
            <span className="ps-tile-sub-caption">External Mast</span>
          </div>

          {/* Tile 2: Wind Speed */}
          <div className="ps-metric-2x2-tile" title={`Wind Speed: ${windSpeedKmh} km/h`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Wind Speed</span>
              <span className="ps-tile-tag cyan">Bft 8</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num cyan">{windSpeedKmh}</span>
              <span className="ps-tile-unit">km/h</span>
            </div>
            <span className="ps-tile-sub-caption">Gale Warning</span>
          </div>

          {/* Tile 3: Wind Direction */}
          <div className="ps-metric-2x2-tile" title={`Wind Direction: ${windDirDeg}° (${windHeading})`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Wind Dir</span>
              <span className="ps-tile-tag green">{windHeading}</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num">{windDirDeg}°</span>
              <span className="ps-tile-unit">{windHeading}</span>
            </div>
            <span className="ps-tile-sub-caption">Magnetic Bearing</span>
          </div>

          {/* Tile 4: Humidity */}
          <div className="ps-metric-2x2-tile" title={`Relative Humidity: ${humidityVal}%`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Rel Humidity</span>
              <span className="ps-tile-tag green">Normal</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num">{humidityVal}</span>
              <span className="ps-tile-unit">%</span>
            </div>
            <span className="ps-tile-sub-caption">Cryo RH Ratio</span>
          </div>
        </div>
      </div>

      {/* ── CARD 3: Infrastructure & Subsystems ── */}
      <div className="ps-white-card ps-bottom-card">
        <div className="ps-card-header">
          <div className="ps-card-title-wrap" title="Infrastructure & Subsystems">
            <span className="ps-domain-icon green">🛠️</span>
            <h3 className="ps-card-title">Infrastructure & Systems</h3>
          </div>
          <div className="ps-header-right-group">
            <span className={`ps-badge-pill ${isPumpOnline ? 'green' : 'red'}`}>
              {isPumpOnline ? '23/28 OK' : 'Alert'}
            </span>
            <button
              type="button"
              className="ps-card-action-link"
              onClick={onOpenEquipmentDetails}
              title="View Subsystems Details"
            >
              Details →
            </button>
          </div>
        </div>

        <div className="ps-bottom-metrics-2x2">
          {/* Tile 1: Equip Temp */}
          <div className="ps-metric-2x2-tile" title={`Equipment Core Temp: ${equipTemp} °C`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Equip Temp</span>
              <span className="ps-tile-tag green">Nominal</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num green">{equipTemp}</span>
              <span className="ps-tile-unit">°C</span>
            </div>
            <span className="ps-tile-sub-caption">HVAC Plant Room</span>
          </div>

          {/* Tile 2: Vibration */}
          <div className="ps-metric-2x2-tile" title={`Vibration Index: ${vibration} mm/s`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Vibration</span>
              <span className="ps-tile-tag green">Class I</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num">{vibration}</span>
              <span className="ps-tile-unit">mm/s</span>
            </div>
            <span className="ps-tile-sub-caption">Bearing State</span>
          </div>

          {/* Tile 3: Heating Loop */}
          <div className="ps-metric-2x2-tile" title={`Heating Output: ${heatingVal} kW`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Heating Loop</span>
              <span className="ps-tile-tag amber">Glycol</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num amber">{heatingVal}</span>
              <span className="ps-tile-unit">kW</span>
            </div>
            <span className="ps-tile-sub-caption">Thermal Radiators</span>
          </div>

          {/* Tile 4: Cooling Pump */}
          <div className="ps-metric-2x2-tile" title={`Cooling Pump: ${isPumpOnline ? 'ACTIVE (Loop P-1)' : 'OFFLINE'}`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Cooling Pump</span>
              <span className={`ps-tile-tag ${isPumpOnline ? 'green' : 'red'}`}>
                {isPumpOnline ? 'Loop P-1' : 'OFFLINE'}
              </span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className={`ps-tile-big-num text-val ${isPumpOnline ? 'green' : 'red'}`}>
                {isPumpOnline ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>
            <span className="ps-tile-sub-caption">Heat Exchanger</span>
          </div>
        </div>
      </div>

      {/* ── CARD 4: Logistics & Life Support ── */}
      <div className="ps-white-card ps-bottom-card ps-logistics-card">
        <div className="ps-card-header">
          <div className="ps-card-title-wrap" title="Logistics & Life Support">
            <span className="ps-domain-icon cyan">📦</span>
            <h3 className="ps-card-title">Logistics & Life Support</h3>
          </div>
          <div className="ps-header-right-group">
            <span className={`ps-badge-pill ${resupplyRisk === 'CRITICAL' ? 'red' : 'green'}`}>
              {resupplyRisk === 'CRITICAL' ? 'Alert' : 'Nominal'}
            </span>
            <button
              type="button"
              className="ps-card-action-link"
              onClick={onOpenLogisticsDetails}
              title="View Logistics Details"
            >
              Details →
            </button>
          </div>
        </div>

        <div className="ps-bottom-metrics-2x2">
          {/* Tile 1: Food Reserve */}
          <div className="ps-metric-2x2-tile" title={`Food stock: ${foodStock} kg (${foodDays} days autonomy)`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Food Stock</span>
              <span className="ps-tile-tag green">{foodStock} kg</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num cyan">{foodDays}</span>
              <span className="ps-tile-unit">Days</span>
            </div>
            <span className="ps-tile-sub-caption">Winterover Rations</span>
          </div>

          {/* Tile 2: Medical Units */}
          <div className="ps-metric-2x2-tile" title={`Medical supplies: ${medDays} days autonomy`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Medical Units</span>
              <span className="ps-tile-tag green">Class-A</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num green">{medDays}</span>
              <span className="ps-tile-unit">Days</span>
            </div>
            <span className="ps-tile-sub-caption">Trauma & Surgery</span>
          </div>

          {/* Tile 3: Bulk Fuel */}
          <div className="ps-metric-2x2-tile" title={`Bulk generator fuel: ${fuelDays} days reserve`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Bulk Fuel</span>
              <span className="ps-tile-tag amber">Tank Farm</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className="ps-tile-big-num amber">{fuelDays}</span>
              <span className="ps-tile-unit">Days</span>
            </div>
            <span className="ps-tile-sub-caption">Aviation Kerosene</span>
          </div>

          {/* Tile 4: Resupply Risk */}
          <div className="ps-metric-2x2-tile" title={`Resupply Status: ${resupplyRisk}, next voyage Nov 2026`}>
            <div className="ps-tile-header-line">
              <span className="ps-tile-lbl-full">Resupply</span>
              <span className="ps-tile-tag blue">Nov '26</span>
            </div>
            <div className="ps-tile-num-wrap">
              <span className={`ps-tile-big-num text-val ${resupplyRisk === 'CRITICAL' ? 'red' : 'green'}`}>
                {resupplyRisk === 'CRITICAL' ? 'ALERT' : 'NOMINAL'}
              </span>
            </div>
            <span className="ps-tile-sub-caption">Voyage Resupply</span>
          </div>
        </div>
      </div>
    </div>
  );
}
