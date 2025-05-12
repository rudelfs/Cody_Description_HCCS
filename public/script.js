document.addEventListener('DOMContentLoaded', () => {
  // 1) Country dropdown
  const countries = [
   "Netherlands","France","Germany","Belgium","Luxembourg","Italy",
   "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
   "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
   "Bangladesh","Barbados","Belarus","Belize","Benin","Bhutan","Bolivia",
   "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso"
   ,"Burundi","Côte d'Ivoire","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic"
   ,"Chad","Chile","China","Colombia","Comoros","Congo (Brazzaville)","Costa Rica","Croatia",
   "Cuba","Cyprus","Czechia","Democratic Republic of the Congo","Denmark","Djibouti",
   "Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea",
   "Eritrea","Estonia","Eswatini","Ethiopia","Federated States of Micronesia","Fiji",
   "Finland","Gabon","Gambia","Georgia","Ghana","Greece","Grenada","Guatemala","Guinea",
   "Guinea-Bissau","Guyana","Haiti","Holy See","Honduras","Hungary","Iceland","India",
   "Indonesia","Iran","Iraq","Ireland","Israel","Jamaica","Japan","Jordan","Kazakhstan",
   "Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia",
   "Libya","Liechtenstein","Lithuania","Madagascar","Malawi","Malaysia","Maldives","Mali",
   "Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia",
   "Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","New Zealand",
   "Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan",
   "Palau","Palestine State","Panama","Papua New Guinea","Paraguay","Peru","Philippines",
   "Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia",
   "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia",
   "Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia",
   "Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka",
   "Sudan","Suriname","Sweden","Switzerland","Syria","Tajikistan","Tanzania","Thailand","Timor-Leste",
   "Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
   "Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay",
   "Uzbekistan","Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
  ];
  const select = document.getElementById('country');
  countries.forEach(c => {
    const o = document.createElement('option');
    o.value = c;
    o.textContent = c;
    select.appendChild(o);
  });

  // 2) Language placeholders
  const examples = {
    Nederlands: [
      "Ontsnap naar ons prachtige boscamping…",
      "Ontspan aan de kust op onze knusse strandcamping…",
      "Geniet van een rustige achtertuinoase onder een sterrenhemel…",
      "Parkeer je camper op onze bergrandplek met uitzicht op de Alpen…",
      "Sla je tent op op onze ruime campingplaats…"
    ],
    Français: [
      "Évadez-vous dans notre magnifique camping forestier…",
      "Détendez-vous sur notre campsite en bord de mer…",
      "Profitez d’un havre de paix sous un ciel étoilé…",
      "Garez votre van au pied des montagnes…",
      "Installez votre tente dans notre camping niché…"
    ],
    English: [
      "Take refuge in our beautiful campspace…",
      "Unwind by the sparkling shore in our cozy beachfront campsite…",
      "Enjoy a tranquil backyard retreat under starlit skies…",
      "Park your camper at our mountain-edge site…",
      "Set up camp at our spacious site amid rolling hills…"
    ],
    Deutsch: [
      "Finde Zuflucht in unserem wunderschönen Waldcamp…",
      "Entspanne an unserem Küstencamp…",
      "Genieße eine ruhige Hinterhof-Oase…",
      "Stelle deinen Camper am Fuße der Berge ab…",
      "Errichte dein Zelt auf unserem großzügigen Platz…"
    ],
    Español: [
      "Refúgiate en nuestro hermoso camping…",
      "Relájate en nuestra playa acogedora…",
      "Disfruta de un tranquilo refugio bajo un cielo estrellado…",
      "Aparca tu autocaravana con vistas panorámicas…",
      "Instala tu tienda entre suaves colinas…"
    ],
    Italiano: [
      "Rifugiatevi nel nostro campeggio…",
      "Rilassatevi sulla nostra spiaggia…",
      "Godetevi un'oasi tranquilla sotto un cielo stellato…",
      "Parcheggiate il vostro camper ai piedi delle montagne…",
      "Mettete la vostra tenda tra dolci colline…"
    ],
    Dansk: [
      "Find tilflugt på vores skovcamping…",
      "Slap af på vores strandcamping…",
      "Nyd en baggårdsflugt under stjernehimmel…",
      "Parkér din autocamper med panoramaudsigt…",
      "Slå dit telt op mellem bløde bakker…"
    ]
  };
  document.querySelectorAll('.languages button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.languages button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const list = examples[btn.textContent] || examples.English;
      document.getElementById('description').placeholder =
        list[Math.floor(Math.random() * list.length)];
    });
  });

  // 3) Toggle assistant
  const helpToggle  = document.getElementById('help-toggle');
  const helpContent = document.getElementById('help-content');
  helpToggle.addEventListener('click', () => {
    const open = helpContent.style.display === 'block';
    helpContent.style.display = open ? 'none' : 'block';
    helpToggle.textContent  = open ? 'Open Description Assistant' : 'Hide Description Assistant';
  });

  // 4) Generate description
  const generateBtn     = document.getElementById('generate-btn');
  const originalBtnText = generateBtn.textContent;
  const touristCheckbox = document.getElementById('tourist-info-checkbox');

  generateBtn.addEventListener('click', async () => {
    const country        = document.getElementById('country').value;
    const city           = document.getElementById('city').value;
    const langBtn        = document.querySelector('.languages button.active');
    const language       = langBtn ? langBtn.textContent : 'English';
    const draft          = document.getElementById('help-input').value.trim();
    const addTouristInfo = touristCheckbox.checked;

    if (!draft) {
      alert('Please enter some keywords or a draft.');
      return;
    }

    generateBtn.disabled  = true;
    generateBtn.innerHTML = `<span class="spinner"></span>Generating…`;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, city, language, draft, addTouristInfo })
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || res.statusText);
      }
      const { content } = await res.json();
      document.getElementById('description').value = content;
    } catch (err) {
      console.error(err);
      alert('Error generating description. Check console.');
    } finally {
      generateBtn.disabled    = false;
      generateBtn.textContent = originalBtnText;
    }
  });
});
