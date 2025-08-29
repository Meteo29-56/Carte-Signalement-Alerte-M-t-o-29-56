// Initialisation de la carte centrée sur le Morbihan/Finistère
const map = L.map('map', {
  fullscreenControl: true,
  fullscreenControlOptions: {
    position: 'topleft'
  }
}).setView([48.0, -3.5], 8);

// Ajout de la couche OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Icônes personnalisées pour chaque type de signalement
const icons = {
  "Route coupée": (urgency) => L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149665.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `urgency-${urgency}`
  }),
  "Inondation": (urgency) => L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2975/2975721.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `urgency-${urgency}`
  }),
  "Vent violent": (urgency) => L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1146/1146858.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `urgency-${urgency}`
  }),
  "Neige/verglas": (urgency) => L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1146/1146865.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `urgency-${urgency}`
  }),
  "Orage": (urgency) => L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1146/1146861.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `urgency-${urgency}`
  }),
  "Coupure d'électricité": (urgency) => L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1033/1033630.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `urgency-${urgency}`
  }),
  "Grêle": (urgency) => L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `urgency-${urgency}`
  }),
  "Tornade/Tuba/Trombe marine": (urgency) => L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1146/1146863.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `urgency-${urgency}`
  }),
  "Chute d'arbre": (urgency) => L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149666.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `urgency-${urgency}`
  }),
  "Incendie": (urgency) => L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149667.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `urgency-${urgency}`
  })
};

// Stockage des signalements
let signalements = [];

// Fonction pour ajouter un signalement à la carte
function addSignalementToMap(signalement) {
  const marker = L.marker([signalement.lat, signalement.lng], {
    icon: icons[signalement.type](signalement.urgency)
  }).addTo(map);

  marker.bindPopup(`
    <div class="urgency-${signalement.urgency}">
      <b>${signalement.type}</b><br>
      <span>Urgence: ${signalement.urgency}</span><br>
      ${signalement.description}<br>
      <small>${new Date(signalement.date).toLocaleString()}</small>
      ${signalement.photo ? `<br><img src="${signalement.photo}" style="max-width: 100%; border-radius: 4px;">` : ''}
      <div style="margin-top: 10px; text-align: center;">
        <button onclick="shareOnFacebook('${encodeURIComponent(`${signalement.type} - ${signalement.description}`)}')" style="background: #3b5998; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin-right: 5px;">
          <i class="fab fa-facebook-f"></i>
        </button>
        <button onclick="shareOnTwitter('${encodeURIComponent(`${signalement.type} - ${signalement.description}`)}')" style="background: #1da1f2; color: white; border: none; padding: 5px 10px; border-radius: 3px;">
          <i class="fab fa-twitter"></i>
        </button>
      </div>
    </div>
  `);

  signalement.marker = marker;
  signalements.push(signalement);
  updateStats();
}

// Fonction pour filtrer les signalements
function filterSignalements() {
  const typeFilters = Array.from(document.querySelectorAll('input[name="filter"]:checked')).map(el => el.value);
  const urgencyFilters = Array.from(document.querySelectorAll('input[name="urgency"]:checked')).map(el => el.value);

  signalements.forEach(signalement => {
    const typeMatch = typeFilters.includes(signalement.type);
    const urgencyMatch = urgencyFilters.includes(signalement.urgency);
    if (typeMatch && urgencyMatch) {
      map.addLayer(signalement.marker);
    } else {
      map.removeLayer(signalement.marker);
    }
  });
}

// Mise à jour des statistiques
function updateStats() {
  const stats = {
    total: signalements.length,
    byType: {},
    byUrgency: { faible: 0, moyenne: 0, élevée: 0 }
  };

  signalements.forEach(signalement => {
    if (!stats.byType[signalement.type]) stats.byType[signalement.type] = 0;
    stats.byType[signalement.type]++;
    stats.byUrgency[signalement.urgency]++;
  });

  const statsContent = `
    <p><b>Total:</b> ${stats.total} signalement(s)</p>
    <h4>Par type:</h4>
    <ul>
      ${Object.entries(stats.byType).map(([type, count]) => `<li>${type}: ${count}</li>`).join('')}
    </ul>
    <h4>Par urgence:</h4>
    <ul>
      <li>Faible: ${stats.byUrgency.faible}</li>
      <li>Moyenne: ${stats.byUrgency.moyenne}</li>
      <li>Élevée: ${stats.byUrgency.élevée}</li>
    </ul>
  `;

  document.getElementById('stats-content').innerHTML = stats.total > 0 ? statsContent : '<p>Aucun signalement pour le moment.</p>';
}

// Partage sur les réseaux sociaux
function shareOnFacebook(text) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`, '_blank');
}

function shareOnTwitter(text) {
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
}

// Écouteurs d'événements
document.querySelectorAll('input[name="filter"], input[name="urgency"]').forEach(input => {
  input.addEventListener('change', filterSignalements);
});

document.getElementById('signalement-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const type = this.elements.type.value;
  const urgency = this.elements.urgency.value;
  const description = this.elements.description.value;
  const photo = this.elements.photo.files[0];

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const newSignalement = {
        type,
        urgency,
        description,
        lat,
        lng,
        date: new Date().toISOString(),
        photo: photo ? URL.createObjectURL(photo) : null
      };

      addSignalementToMap(newSignalement);
      this.reset();

      // Suppression automatique après 24h
      setTimeout(() => {
        map.removeLayer(newSignalement.marker);
        signalements = signalements.filter(s => s.date !== newSignalement.date);
        updateStats();
      }, 24 * 60 * 60 * 1000);
    }, error => {
      alert("Impossible de récupérer votre position: " + error.message);
    });
  } else {
    alert("La géolocalisation n'est pas supportée par votre navigateur.");
  }
});

// Modal pour le tutoriel
const tutorialModal = document.getElementById('tutorial-modal');
document.getElementById('show-tutorial').addEventListener('click', () => {
  tutorialModal.style.display = 'block';
});
document.querySelector('#tutorial-modal .close').addEventListener('click', () => {
  tutorialModal.style.display = 'none';
});

// Modal pour les statistiques
const statsModal = document.getElementById('stats-modal');
document.getElementById('show-stats').addEventListener('click', () => {
  statsModal.style.display = 'block';
});
document.querySelector('#stats-modal .close').addEventListener('click', () => {
  statsModal.style.display = 'none';
});

// Mode sombre
document.getElementById('toggle-dark-mode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});


// Expose les fonctions de partage au scope global
window.shareOnFacebook = shareOnFacebook;
window.shareOnTwitter = shareOnTwitter;

