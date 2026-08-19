/* =============================================
   PETA DIGITAL DESA RABA - JavaScript
   ============================================= */

(function () {
  'use strict';

  // ===========================================
  // 1. CONFIGURATION
  // ===========================================

  var MAP_CENTER = [-8.570, 118.878];
  var MAP_ZOOM = 13;

  // Category definitions
  var CATEGORIES = {
    pemerintahan:  { label: 'Pemerintahan',      color: '#e74c3c', icon: '\uD83C\uDFDB\uFE0F' },
    pendidikan:    { label: 'Pendidikan',         color: '#3498db', icon: '\uD83C\uDFEB' },
    kesehatan:     { label: 'Kesehatan',          color: '#e74c3c', icon: '\uD83C\uDFE5' },
    keagamaan:     { label: 'Keagamaan',          color: '#8e44ad', icon: '\uD83C\uDD54' },
    olahraga:      { label: 'Olahraga',           color: '#27ae60', icon: '\u26BD' },
    fasilitas_umum:{ label: 'Fasilitas Umum',     color: '#f39c12', icon: '\uD83C\uDFC6' },
    fasilitas_sosial:{ label: 'Fasilitas Sosial', color: '#e67e22', icon: '\uD83C\uDFDB\uFE0F' },
    administrasi:  { label: 'Administrasi Wilayah', color: '#1abc9c', icon: '\uD83D\uDCCD' }
  };

  // ===========================================
  // 2. MAP INITIALIZATION
  // ===========================================

  var map = L.map('map', {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    zoomControl: true
  });

  // ===========================================
  // 3. BASEMAP DEFINITIONS
  // ===========================================

  var basemaps = {
    osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }),
    'google-maps': L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }),
    'esri-imagery': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 18
    }),
    'google-hybrid': L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }),
    'google-satellite': L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    })
  };

  basemaps.osm.addTo(map);

  // ===========================================
  // 4. UTILITY FUNCTIONS
  // ===========================================

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // Ray casting point-in-polygon
  function pointInPolygon(lat, lon, polygon) {
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var xi = polygon[i][0], yi = polygon[i][1];
      var xj = polygon[j][0], yj = polygon[j][1];
      var intersect = ((yi > lat) !== (yj > lat)) &&
        (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // ===========================================
  // 5. CREATE MARKER ICONS PER CATEGORY
  // ===========================================

  function createCategoryIcon(category) {
    var cat = CATEGORIES[category] || CATEGORIES.pemerintahan;
    return L.divIcon({
      className: 'facility-marker',
      html: '<div class="marker-pin" style="background:' + cat.color + ';">' +
            '<span class="marker-icon">' + cat.icon + '</span></div>',
      iconSize: [30, 38],
      iconAnchor: [15, 38],
      popupAnchor: [0, -34]
    });
  }

  // ===========================================
  // 6. GEOJSON LAYERS
  // ===========================================

  var geoLayers = {};
  var polygonData = null;
  var facilityLayer = null;
  var allFacilities = [];

  // Desa Raba polygon style
  var desaStyle = {
    color: '#2ecc71',
    weight: 4,
    opacity: 1,
    fillColor: '#2ecc71',
    fillOpacity: 0.06,
    dashArray: ''
  };

  // ===========================================
  // 7. LOAD POLYGON DESA RABA
  // ===========================================

  fetch('data/batas-desa.geojson')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      polygonData = data;

      // Extract polygon coordinates for spatial filtering
      var coords = data.features[0].geometry.coordinates[0];

      geoLayers['batas-desa'] = L.geoJSON(data, {
        style: desaStyle,
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.nama) {
            var props = feature.properties;
            var popupHtml = '<div class="popup-content">';
            popupHtml += '<div class="popup-nama">' + escapeHtml(props.nama) + '</div>';
            if (props.jenis) {
              popupHtml += '<div class="popup-kategori">' + escapeHtml(props.jenis) + '</div>';
            }
            if (props.sumber) {
              popupHtml += '<div class="popup-info"><strong>Sumber:</strong> ' + escapeHtml(props.sumber) + '</div>';
            }
            if (props.keterangan) {
              popupHtml += '<div class="popup-info"><strong>Keterangan:</strong> ' + escapeHtml(props.keterangan) + '</div>';
            }
            if (props.kecamatan && props.kabupaten && props.provinsi) {
              popupHtml += '<div class="popup-info"><strong>Wilayah:</strong> ' +
                escapeHtml(props.kecamatan) + ', ' + escapeHtml(props.kabupaten) + ', ' + escapeHtml(props.provinsi) + '</div>';
            }
            popupHtml += '</div>';
            layer.bindPopup(popupHtml);
          }
        }
      });

      // Only add to map if checkbox is checked (respect saved state)
      var desaCheckbox = document.querySelector('.layer-check[data-layer="batas-desa"]');
      if (!desaCheckbox || desaCheckbox.checked) {
        geoLayers['batas-desa'].addTo(map);
      }

      // Fit map to polygon bounds
      map.fitBounds(geoLayers['batas-desa'].getBounds(), { padding: [30, 30] });

      // Load facilities after polygon is ready
      loadFacilities(coords);
    })
    .catch(function (err) {
      console.warn('Gagal memuat batas desa:', err.message);
    });

  // ===========================================
  // 8. LOAD FACILITY DATA
  // ===========================================

  function loadFacilities(polygonCoords) {
    fetch('data/fasilitas.geojson')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var features = data.features || [];
        var filtered = [];
        var seen = {};

        features.forEach(function (feature) {
          if (!feature.geometry || feature.geometry.type !== 'Point') return;

          var coords = feature.geometry.coordinates;
          var lon = coords[0];
          var lat = coords[1];

          // Spatial filter: only include if inside Desa Raba polygon
          if (!pointInPolygon(lat, lon, polygonCoords)) {
            return;
          }

          // Deduplication: skip if similar name+category already added
          var key = (feature.properties.name || '').toLowerCase() + '|' + (feature.properties.category || '');
          if (seen[key]) return;
          seen[key] = true;

          feature.properties._lat = lat;
          feature.properties._lon = lon;
          filtered.push(feature);
        });

        allFacilities = filtered;
        renderFacilities(filtered);
      })
      .catch(function (err) {
        console.warn('Gagal memuat data fasilitas:', err.message);
      });
  }

  // ===========================================
  // 9. RENDER FACILITY MARKERS
  // ===========================================

  function renderFacilities(features) {
    if (facilityLayer) {
      map.removeLayer(facilityLayer);
    }

    var markers = [];
    var categoryGroups = {};

    features.forEach(function (feature) {
      var props = feature.properties;
      var cat = props.category || 'fasilitas_umum';
      var icon = createCategoryIcon(cat);
      var lat = props._lat;
      var lon = props._lon;

      var marker = L.marker([lat, lon], { icon: icon });

      // Popup content
      var popupHtml = '<div class="popup-content">';
      popupHtml += '<div class="popup-header">';
      popupHtml += '<span class="popup-icon">' + (CATEGORIES[cat] ? CATEGORIES[cat].icon : '') + '</span>';
      popupHtml += '<div class="popup-nama">' + escapeHtml(props.name || 'Tanpa Nama') + '</div>';
      popupHtml += '</div>';
      popupHtml += '<div class="popup-kategori" style="background:' + (CATEGORIES[cat] ? CATEGORIES[cat].color : '#999') + '22;color:' + (CATEGORIES[cat] ? CATEGORIES[cat].color : '#999') + ';">' +
        escapeHtml(CATEGORIES[cat] ? CATEGORIES[cat].label : cat) + '</div>';

      if (props.description) {
        popupHtml += '<div class="popup-desc">' + escapeHtml(props.description) + '</div>';
      }

      popupHtml += '<div class="popup-coord">';
      popupHtml += '<span class="coord-label">Koordinat</span><br>';
      popupHtml += '<span class="coord-value" data-lat="' + lat + '" data-lon="' + lon + '" title="Klik untuk menyalin">' +
        lat.toFixed(6) + ', ' + lon.toFixed(6) + '</span>';
      popupHtml += '</div>';

      popupHtml += '<div class="popup-source">';
      popupHtml += '<span class="source-label">Sumber:</span> ' + escapeHtml(props.source || 'Tidak diketahui');
      if (props.sourceId) {
        popupHtml += ' <span class="source-id">(' + escapeHtml(props.sourceId) + ')</span>';
      }
      popupHtml += '</div>';

      popupHtml += '<a class="popup-btn" href="https://www.google.com/maps?q=' + lat + ',' + lon + '" target="_blank" rel="noopener">';
      popupHtml += '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
      popupHtml += ' Buka Google Maps';
      popupHtml += '</a>';

      popupHtml += '</div>';

      marker.bindPopup(popupHtml, { maxWidth: 280 });

      // On click, show detail panel
      marker.on('click', function () {
        showFacilityDetail(props, lat, lon);
      });

      markers.push(marker);

      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(marker);
    });

    facilityLayer = L.layerGroup(markers);
    facilityLayer.addTo(map);

    // Store category groups for filtering
    facilityLayer._categoryGroups = categoryGroups;

    // Apply current checkbox state
    syncCategoryVisibility();
  }

  // ===========================================
  // 10. FACILITY DETAIL PANEL
  // ===========================================

  var facilityPanel = document.getElementById('facilityPanel');
  var facilityTitle = document.getElementById('facilityTitle');
  var facilityBody = document.getElementById('facilityBody');
  var facilityClose = document.getElementById('facilityClose');

  function showFacilityDetail(props, lat, lon) {
    var cat = props.category || 'fasilitas_umum';
    var catInfo = CATEGORIES[cat] || { label: cat, color: '#999', icon: '' };

    facilityTitle.textContent = catInfo.icon + ' ' + (props.name || 'Tanpa Nama');

    var html = '';

    html += '<div class="detail-row">';
    html += '<div class="detail-label">Kategori</div>';
    html += '<div class="detail-value" style="color:' + catInfo.color + ';">' + catInfo.label + '</div>';
    html += '</div>';

    html += '<div class="detail-row">';
    html += '<div class="detail-label">Status</div>';
    html += '<div class="detail-value"><span class="status-dot active"></span> Aktif</div>';
    html += '</div>';

    html += '<div class="detail-row">';
    html += '<div class="detail-label">Koordinat</div>';
    html += '<div class="detail-value coord-copy" data-lat="' + lat + '" data-lon="' + lon + '" title="Klik untuk menyalin koordinat">';
    html += '<span>Latitude  : ' + lat.toFixed(6) + '</span>';
    html += '<span>Longitude : ' + lon.toFixed(6) + '</span>';
    html += '</div>';
    html += '</div>';

    html += '<div class="detail-row">';
    html += '<div class="detail-label">Sumber</div>';
    html += '<div class="detail-value">' + escapeHtml(props.source || 'Tidak diketahui') + '</div>';
    html += '</div>';

    if (props.sourceId) {
      html += '<div class="detail-row">';
      html += '<div class="detail-label">ID Sumber</div>';
      html += '<div class="detail-value detail-source-id">' + escapeHtml(props.sourceId) + '</div>';
      html += '</div>';
    }

    if (props.description) {
      html += '<div class="detail-row">';
      html += '<div class="detail-label">Keterangan</div>';
      html += '<div class="detail-value">' + escapeHtml(props.description) + '</div>';
      html += '</div>';
    }

    html += '<div class="detail-actions">';
    html += '<a class="detail-btn" href="https://www.google.com/maps?q=' + lat + ',' + lon + '" target="_blank" rel="noopener">';
    html += '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    html += ' Buka di Google Maps</a>';
    html += '</div>';

    facilityBody.innerHTML = html;
    facilityPanel.classList.add('open');

    // Copy coordinate on click
    var coordEl = facilityBody.querySelector('.coord-copy');
    if (coordEl) {
      coordEl.addEventListener('click', function () {
        var latVal = this.getAttribute('data-lat');
        var lonVal = this.getAttribute('data-lon');
        var text = latVal + ', ' + lonVal;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            coordEl.classList.add('copied');
            setTimeout(function () { coordEl.classList.remove('copied'); }, 1500);
          });
        }
      });
    }
  }

  facilityClose.addEventListener('click', function () {
    facilityPanel.classList.remove('open');
  });

  // Close panel on map click
  map.on('click', function (e) {
    if (!e.originalEvent || !e.originalEvent.target) return;
    // Only close if clicking on map background, not on a marker
    var target = e.originalEvent.target;
    if (target.classList && !target.closest('.facility-marker')) {
      facilityPanel.classList.remove('open');
    }
  });

  // ===========================================
  // 11. CATEGORY FILTERING
  // ===========================================

  function syncCategoryVisibility() {
    if (!facilityLayer || !facilityLayer._categoryGroups) return;

    var groups = facilityLayer._categoryGroups;
    var checkboxes = document.querySelectorAll('.category-check');

    checkboxes.forEach(function (cb) {
      var cat = cb.getAttribute('data-category');
      var checked = cb.checked;

      if (groups[cat]) {
        groups[cat].forEach(function (marker) {
          if (checked) {
            if (!map.hasLayer(marker)) {
              facilityLayer.addLayer(marker);
            }
          } else {
            if (map.hasLayer(marker)) {
              facilityLayer.removeLayer(marker);
            }
          }
        });
      }
    });
  }

  document.querySelectorAll('.category-check').forEach(function (cb) {
    cb.addEventListener('change', function () {
      syncCategoryVisibility();
      saveLayerState();
    });
  });

  // Layer toggle for batas-desa checkbox
  var LAYER_STATE_KEY = 'peta_raba_layers';

  function saveLayerState() {
    var state = {};
    document.querySelectorAll('.layer-check').forEach(function (cb) {
      state[cb.getAttribute('data-layer')] = cb.checked;
    });
    document.querySelectorAll('.category-check').forEach(function (cb) {
      state[cb.getAttribute('data-category')] = cb.checked;
    });
    localStorage.setItem(LAYER_STATE_KEY, JSON.stringify(state));
  }

  function restoreLayerState() {
    try {
      var raw = localStorage.getItem(LAYER_STATE_KEY);
      if (!raw) return;
      var state = JSON.parse(raw);
      document.querySelectorAll('.layer-check').forEach(function (cb) {
        var key = cb.getAttribute('data-layer');
        if (key in state) cb.checked = state[key];
      });
      document.querySelectorAll('.category-check').forEach(function (cb) {
        var key = cb.getAttribute('data-category');
        if (key in state) cb.checked = state[key];
      });
    } catch (e) { /* ignore */ }
  }

  // Restore saved checkbox states early
  restoreLayerState();

  document.querySelectorAll('.layer-check').forEach(function (cb) {
    cb.addEventListener('change', function () {
      var layerName = this.getAttribute('data-layer');
      var checked = this.checked;

      if (layerName === 'batas-desa' && geoLayers['batas-desa']) {
        if (checked) {
          if (!map.hasLayer(geoLayers['batas-desa'])) {
            geoLayers['batas-desa'].addTo(map);
          }
        } else {
          if (map.hasLayer(geoLayers['batas-desa'])) {
            map.removeLayer(geoLayers['batas-desa']);
          }
        }
      }
      saveLayerState();
    });
  });

  // ===========================================
  // 12. BASEMAP SWITCHING (with localStorage)
  // ===========================================

  var BASEMAP_KEY = 'peta_raba_basemap';
  var currentBasemap = null;

  function setBasemap(value) {
    if (currentBasemap) map.removeLayer(currentBasemap);
    if (basemaps[value]) {
      basemaps[value].addTo(map);
      currentBasemap = basemaps[value];
      localStorage.setItem(BASEMAP_KEY, value);

      // Update radio UI
      document.querySelectorAll('input[name="basemap"]').forEach(function (r) {
        r.checked = (r.value === value);
      });
    }
  }

  // Restore saved basemap or default to osm
  var savedBasemap = localStorage.getItem(BASEMAP_KEY) || 'osm';
  if (!basemaps[savedBasemap]) savedBasemap = 'osm';
  setBasemap(savedBasemap);

  document.querySelectorAll('input[name="basemap"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      setBasemap(this.value);
    });
  });

  // ===========================================
  // 13. SIDEBAR TOGGLE (MOBILE)
  // ===========================================

  var sidebar = document.getElementById('sidebar');
  var sidebarToggle = document.getElementById('sidebarToggle');
  var menuToggle = document.getElementById('menuToggle');

  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  }

  function toggleSidebar() {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
  }

  overlay.addEventListener('click', closeSidebar);

  // ===========================================
  // 14. PANEL COLLAPSE TOGGLE
  // ===========================================

  document.querySelectorAll('.panel-header[data-toggle]').forEach(function (header) {
    header.addEventListener('click', function () {
      var targetId = this.getAttribute('data-toggle');
      var panelId = targetId + 'Panel';
      var panel = document.getElementById(panelId);
      if (panel) {
        this.classList.toggle('collapsed');
        panel.classList.toggle('collapsed');
      }
    });
  });

  // ===========================================
  // 15. INVALIDATE MAP SIZE ON RESIZE
  // ===========================================

  window.addEventListener('resize', function () {
    setTimeout(function () {
      map.invalidateSize();
    }, 200);
  });

})();
