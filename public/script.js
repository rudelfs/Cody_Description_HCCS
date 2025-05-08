
document.addEventListener('DOMContentLoaded', () => {
  //Placeholder examples by language (randomized, just fun)
  const examples = {
    Nederlands: [
      "Ontsnap naar ons prachtige boscamping, omgeven door hoge dennen…",
      "Ontspan aan de kust op onze knusse strandcamping, waar de golven je in slaap wiegen…",
      "Geniet van een rustige achtertuinoase onder een sterrenhemel met hangmatten en kampvuur…",
      "Parkeer je camper op onze bergrandplek met panoramisch uitzicht op de Alpen…",
      "Sla je tent op op onze ruime campingplaats in glooiende heuvels, perfect voor families…"
    ],
    Français: [
      "Évadez-vous dans notre magnifique camping forestier, entouré de pins majestueux…",
      "Détendez-vous sur notre campsite en bord de mer, bercé par le murmure des vagues…",
      "Profitez d’un havre de paix dans notre arrière-cour sous un ciel étoilé avec hamacs et feu de camp…",
      "Garez votre van au pied des montagnes pour une vue panoramique sur les Alpes…",
      "Installez votre tente dans notre vaste camping niché dans des collines douces, idéal pour les familles…"
    ],
    English: [
      "Take refuge in our beautiful campspace, nestled in a serene forest surrounded by towering pines…",
      "Unwind by the sparkling shore in our cozy beachfront campsite, where waves lull you to sleep…",
      "Enjoy a tranquil backyard retreat under starlit skies, complete with hammocks and a campfire…",
      "Park your camper at our mountain-edge site with panoramic alpine views and sunrise vistas…",
      "Set up camp at our spacious site amid rolling hills, perfect for family gatherings and storytime…"
    ],
    Deutsch: [
      "Finde Zuflucht in unserem wunderschönen Waldcamp, umgeben von hohen Tannen…",
      "Entspanne an unserem Küstencamp direkt am Strand, wo die Wellen dich in den Schlaf wiegen…",
      "Genieße eine ruhige Hinterhof-Oase unter sternenklarem Himmel mit Hängematten und Lagerfeuer…",
      "Stelle deinen Camper auf unserem Parkplatz am Fuße der Berge ab und erlebe atemberaubende Alpenblicke…",
      "Errichte dein Zelt auf unserem großzügigen Campingplatz in sanften Hügeln, ideal für Familien…"
    ],
    Español: [
      "Refúgiate en nuestro hermoso camping en el bosque, rodeado de altos pinos…",
      "Relájate en nuestra acogedora playa, donde las olas te arrullarán hasta dormir…",
      "Disfruta de un tranquilo refugio en el patio trasero bajo un cielo estrellado con hamacas y fogata…",
      "Aparca tu autocaravana en nuestro espacio junto a las montañas con vistas panorámicas…",
      "Instala tu tienda en nuestro amplio camping entre colinas suaves, perfecto para familias…"
    ],
    Italiano: [
      "Rifugiatevi nel nostro incantevole campeggio in mezzo alla foresta, circondato da alti pini…",
      "Rilassatevi sulla nostra spiaggia, dove il suono delle onde vi cullerà nel sonno…",
      "Godetevi un'oasi tranquilla nel cortile sotto un cielo stellato con amache e falò…",
      "Parcheggiate il vostro camper ai piedi delle montagne con vista panoramica sulle Alpi…",
      "Mettete la vostra tenda nel nostro ampio campeggio tra dolci colline, perfetto per famiglie…"
    ],
    Dansk: [
      "Find tilflugt på vores smukke skovcamping, omgivet af høje fyrretræer…",
      "Slap af på vores strandcamping, hvor bølgerne vugger dig i søvn…",
      "Nyd en rolig baggårdsflugt under en stjerneklar himmel med hængekøjer og lejrbål…",
      "Parkér din autocamper ved bjergranden med panoramaudsigt over Alperne…",
      "Slå dit telt op på vores rummelige plads mellem bløde bakker, ideel til familier…"
    ]
  };

  // language buttons: click to select + update placeholder
  document.querySelectorAll('.languages button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.languages button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // update placeholder based on selected language
      const lang = btn.textContent;
      const list = examples[lang] || examples['English'];
      const sample = list[Math.floor(Math.random() * list.length)];
      document.getElementById('description').placeholder = sample;
    });
  });

  // help fold-out toggle
  const helpToggle  = document.getElementById('help-toggle');
  const helpContent = document.getElementById('help-content');
  helpToggle.addEventListener('click', () => {
    const open = helpContent.style.display === 'block';
    helpContent.style.display = open ? 'none' : 'block';
    helpToggle.textContent  = open ? 'Need help?' : 'Hide help';
  });

  // generate button + loading spinner
  const generateBtn     = document.getElementById('generate-btn');
  const originalBtnText = generateBtn.textContent;

  generateBtn.addEventListener('click', async () => {
    const country  = document.getElementById('country').value;
    const city     = document.getElementById('city').value;
    const langBtn  = document.querySelector('.languages button.active');
    const language = langBtn ? langBtn.textContent : 'English';
    const draft    = document.getElementById('help-input').value.trim();

    if (!draft) {
      return alert('Please enter some keywords or a draft.');
    }

    // show spinner + disable
    generateBtn.disabled  = true;
    generateBtn.innerHTML = `<span class="spinner"></span>Generating…`;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, city, language, draft })
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
      // restore button
      generateBtn.disabled    = false;
      generateBtn.textContent = originalBtnText;
    }
  });
});
