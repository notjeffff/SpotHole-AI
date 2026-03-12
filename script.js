// ─── MAP SETUP ───────────────────────────────────────────────

let map = L.map('map').setView([13.0827, 80.2707], 13);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);
potholeDatabase.forEach(p => {
  L.circleMarker([p.lat, p.lng], {
    radius: 8,
    color: "red",
    fillColor: "#ff4444",
    fillOpacity: 0.9
  }).addTo(map);
});
let originMarker      = null;
let destinationMarker = null;
let routeLine         = null;
let potholeDatabase = JSON.parse(localStorage.getItem("potholes")) || [];
let autoDetectInterval = null;
let model;

// ─── LOAD AI MODEL ───────────────────────────────────────────
window.onload = async function () {
  try {
    model = await tmImage.load("model/model.json", "model/metadata.json");
    document.getElementById("modelStatus").innerText = "✅ AI Model Loaded";
  } catch (e) {
    document.getElementById("modelStatus").innerText = "❌ Model failed to load. Check model/ folder.";
    console.error(e);
  }
};

// ─── AUTOCOMPLETE ────────────────────────────────────────────
function setupAutocomplete(inputId, suggestionId) {
  const input       = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionId);

  input.addEventListener("input", async () => {
    if (input.value.length < 3) { suggestions.innerHTML = ""; return; }

    const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input.value)}`);
    const data = await res.json();
    suggestions.innerHTML = "";

    data.slice(0, 5).forEach(place => {
      const div = document.createElement("div");
      div.innerText = place.display_name;
      div.onclick = () => {
        input.value = place.display_name;
        input.dataset.lat = place.lat;
        input.dataset.lon = place.lon;
        suggestions.innerHTML = "";
      };
      suggestions.appendChild(div);
    });
  });
}

setupAutocomplete("originInput", "originSuggestions");
setupAutocomplete("destinationInput", "destinationSuggestions");

// ─── LOCATION ────────────────────────────────────────────────
async function useMyLocation() {
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    if (originMarker) map.removeLayer(originMarker);
    originMarker = L.marker([lat, lon]).addTo(map);
    map.setView([lat, lon], 15);

    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await res.json();
    document.getElementById("originInput").value = data.display_name;
  }, () => alert("Location permission denied."));
}

function geocode(place, callback) {
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) callback(parseFloat(data[0].lat), parseFloat(data[0].lon));
      else alert("Location not found. Try a more specific name.");
    });
}

function setOrigin() {
  const input = document.getElementById("originInput");
  // Use cached coords from autocomplete if available
  if (input.dataset.lat) {
    placeOrigin(parseFloat(input.dataset.lat), parseFloat(input.dataset.lon));
  } else {
    geocode(input.value, placeOrigin);
  }
}

function placeOrigin(lat, lon) {
  if (originMarker) map.removeLayer(originMarker);
  originMarker = L.marker([lat, lon]).addTo(map);
  map.setView([lat, lon], 14);
}

function setDestination() {
  const input = document.getElementById("destinationInput");
  if (input.dataset.lat) {
    placeDestination(parseFloat(input.dataset.lat), parseFloat(input.dataset.lon));
  } else {
    geocode(input.value, placeDestination);
  }
}

function placeDestination(lat, lon) {
  if (destinationMarker) map.removeLayer(destinationMarker);
  destinationMarker = L.marker([lat, lon]).addTo(map);
}

// ─── ROUTE ───────────────────────────────────────────────────
function drawRoute() {
  if (!originMarker || !destinationMarker) {
    alert("Set both origin and destination first.");
    return;
  }

  const o = originMarker.getLatLng();
  const d = destinationMarker.getLatLng();

  document.getElementById("routeInfo").innerText = "Fetching route...";

  fetch(`https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${d.lng},${d.lat}?overview=full&geometries=geojson`)
    .then(res => res.json())
    .then(data => {
      if (!data.routes || data.routes.length === 0) {
        document.getElementById("routeInfo").innerText = "No route found.";
        return;
      }

      if (routeLine) map.removeLayer(routeLine);

      const route    = data.routes[0].geometry;
      const distKm   = (data.routes[0].distance / 1000).toFixed(2);
      const durMin   = Math.round(data.routes[0].duration / 60);

      routeLine = L.geoJSON(route, {
        style: { color: "lime", weight: 5 }
      }).addTo(map);

      document.getElementById("routeInfo").innerText =
        `📍 Distance: ${distKm} km  |  ⏱ Est. Time: ${durMin} min`;

      calculateRisk(route);
    })
    .catch(() => document.getElementById("routeInfo").innerText = "Failed to fetch route.");
}

// ─── CAMERA ──────────────────────────────────────────────────
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      document.getElementById("camera").srcObject = stream;
      document.getElementById("aiResult").innerText = "📷 Camera active.";
    })
    .catch(() => alert("Camera access denied."));
}

// ─── AI DETECTION ────────────────────────────────────────────
async function detectRoadAbnormality() {
  if (!model) { alert("Model not loaded yet."); return; }

  const cam = document.getElementById("camera");
  if (!cam.srcObject) { alert("Start the camera first."); return; }

  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const prediction  = await model.predict(cam);
    const potholeProb = prediction[0].probability;   // "Pothole" is label[0]
    const confidence  = (potholeProb * 100).toFixed(1);

    if (potholeProb > 0.7) {
      const loc = { lat, lng: lon };
      potholeDatabase.push(loc);
      localStorage.setItem("potholes", JSON.stringify(potholeDatabase));

      L.circleMarker([lat, lon], {
        radius: 8,
        color: "red",
        fillColor: "#ff4444",
        fillOpacity: 0.9
      })
      .bindPopup(`⚠️ Pothole Detected<br>Confidence: ${confidence}%<br>📍 ${lat.toFixed(5)}, ${lon.toFixed(5)}`)
      .addTo(map);

      document.getElementById("aiResult").innerText = `⚠️ Pothole! Confidence: ${confidence}%`;
      document.getElementById("potholeCount").innerText = potholeDatabase.length;
    } else {
      const normalConf = ((1 - potholeProb) * 100).toFixed(1);
      document.getElementById("aiResult").innerText = `✅ Road Normal. Confidence: ${normalConf}%`;
    }

    if (routeLine) calculateRisk(routeLine.toGeoJSON().features[0].geometry);

  }, () => {
    // Fallback: if GPS not available, use origin marker
    if (originMarker) {
      const loc = originMarker.getLatLng();
      _runDetectionAtLocation(loc.lat, loc.lng);
    } else {
      alert("GPS unavailable. Set origin marker as fallback.");
    }
  });
}

// ─── AUTO DETECT ─────────────────────────────────────────────
function toggleAutoDetect() {
  const btn = document.getElementById("autoBtn");
  if (autoDetectInterval) {
    clearInterval(autoDetectInterval);
    autoDetectInterval = null;
    btn.innerText = "▶ Start Auto Detect";
    btn.style.background = "rgba(0,255,255,0.25)";
  } else {
    autoDetectInterval = setInterval(detectRoadAbnormality, 3000);
    btn.innerText = "⏹ Stop Auto Detect";
    btn.style.background = "rgba(255,80,80,0.5)";
  }
}

// ─── RISK CALCULATION ────────────────────────────────────────
function calculateRisk(route) {
  let hits  = 0;
  let total = route.coordinates.length;

  potholeDatabase.forEach(p => {
    route.coordinates.forEach(coord => {
      const dist = Math.sqrt(
        Math.pow(coord[1] - p.lat, 2) +
        Math.pow(coord[0] - p.lng, 2)
      );
      if (dist < 0.001) hits++;
    });
  });

  let risk     = total === 0 ? 0 : (hits / total) * 100;
  let accident = document.getElementById("travelTime").value === "night"
    ? Math.min(risk * 1.5, 100)
    : risk;

  const riskEl = document.getElementById("riskScore");
  const accEl  = document.getElementById("accidentScore");

  riskEl.innerText     = risk.toFixed(2) + "%";
  accEl.innerText      = accident.toFixed(2) + "%";

  // Color code the risk
  if (risk > 60) {
    riskEl.style.color = "#ff4444";
    accEl.style.color  = "#ff4444";
  } else if (risk > 30) {
    riskEl.style.color = "orange";
    accEl.style.color  = "orange";
  } else {
    riskEl.style.color = "lightgreen";
    accEl.style.color  = "lightgreen";
  }
}

// ─── RESET ───────────────────────────────────────────────────
function resetApp() {
  location.reload();
}
function clearPotholes() {

  potholeDatabase = [];

  localStorage.removeItem("potholes");

  alert("Stored pothole data cleared. Reloading map...");

  location.reload();
}