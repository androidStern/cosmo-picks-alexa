import { Alignment, Fit, Layout, Rive, StateMachineInputType } from '@rive-app/canvas';
import './styles.css';

const RIVE_STATE_MACHINE = 'State Machine 1';
const assetPath = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
const expressionValues = {
  'Smiling button': 1,
  'Happy button': 2,
  'Sad button': 3,
  'Scared button': 4,
  'Surprised button': 5,
};

const picks = [
  {
    id: 'project-hail-mary',
    title: 'Project Hail Mary',
    type: 'movie',
    year: '2026',
    mood: 'space',
    moodLabel: 'Wide awake & curious',
    poster: assetPath('/assets/posters/project-hail-mary.jpg'),
    description:
      'A lone astronaut wakes up light-years from home with one impossible job: save Earth, preferably with help from the universe’s least expected friend.',
    cosmo:
      'Tiny human. Huge sky. Secretly sweet. Start here if you want your brain lit up and your heart warmed.',
    service: 'Prime Video',
    availability: 'Rent or buy',
    watchUrl:
      'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=Project%20Hail%20Mary',
    backupUrl: 'https://tv.apple.com/search?term=Project%20Hail%20Mary',
    expression: 'Surprised button',
  },
  {
    id: 'knight-seven-kingdoms',
    title: 'A Knight of the Seven Kingdoms',
    type: 'series',
    year: '2026',
    mood: 'quest',
    moodLabel: 'Soft and storybook',
    poster: assetPath('/assets/posters/knight-seven-kingdoms.jpg'),
    description:
      'A smaller, warmer Westeros story about Dunk and Egg: earnest knights, weird politics, and the kind of fantasy that feels like a fireside tale.',
    cosmo:
      'A kind knight, a sharp little squire, and a corner of Westeros that feels like a storybook with boots on.',
    service: 'HBO Max',
    availability: 'Stream',
    watchUrl: 'https://www.max.com/search?q=A%20Knight%20of%20the%20Seven%20Kingdoms',
    backupUrl:
      'https://www.justwatch.com/us/tv-show/a-knight-of-the-seven-kingdoms-the-hedge-knight',
    expression: 'Smiling button',
  },
  {
    id: 'beef-season-2',
    title: 'BEEF: Season 2',
    type: 'series',
    year: '2026',
    mood: 'chaos',
    moodLabel: 'Beautiful chaos',
    poster: assetPath('/assets/posters/beef-season-2.jpg'),
    description:
      'A new pressure cooker of resentment, status games, and terrible choices from people who should absolutely know better.',
    cosmo:
      'For when you want beautiful people making terrible choices, and somehow every choice gets worse.',
    service: 'Netflix',
    availability: 'Stream',
    watchUrl: 'https://www.netflix.com/search?q=Beef',
    backupUrl: 'https://www.netflix.com/tudum/articles/beef-season-2-renewal',
    expression: 'Scared button',
  },
  {
    id: 'game-night',
    title: 'Game Night',
    type: 'movie',
    year: '2018',
    mood: 'laugh',
    moodLabel: 'In the mood to laugh',
    poster: assetPath('/assets/posters/game-night.jpg'),
    description:
      'A murder-mystery party goes violently sideways. Tight, fast, and much funnier than it has any right to be.',
    cosmo:
      'Low commitment, high reward. Fast jokes, weird turns, and exactly the right amount of chaos.',
    service: 'Hulu',
    availability: 'Stream',
    watchUrl: 'https://www.hulu.com/movie/game-night-54935c48-6171-46a2-ae89-773fbe711ba6',
    backupUrl: 'https://www.amazon.com/gp/video/search?phrase=Game%20Night',
    expression: 'Happy button',
  },
  {
    id: 'your-friends-neighbors',
    title: 'Your Friends & Neighbors',
    type: 'series',
    year: '2025',
    mood: 'secrets',
    moodLabel: 'A little dangerous',
    poster: assetPath('/assets/posters/your-friends-neighbors.jpg'),
    description:
      'Jon Hamm plays a fallen finance guy stealing from rich neighbors and discovering every secret is worse than the last.',
    cosmo:
      'Glossy houses, bad secrets, Jon Hamm in trouble. Polite on the outside, dangerous underneath.',
    service: 'Apple TV+',
    availability: 'Stream',
    watchUrl:
      'https://tv.apple.com/us/show/your-friends--neighbors/umc.cmc.74o37kzay0yuuub8iumddjsg',
    backupUrl: 'https://www.apple.com/tv-pr/originals/your-friends-and-neighbors/',
    expression: 'Surprised button',
  },
];

const moods = [
  {
    id: 'space',
    label: 'Wide awake & curious',
    detail: 'You want your brain to light up.',
    pickId: 'project-hail-mary',
  },
  {
    id: 'quest',
    label: 'Soft and storybook',
    detail: 'A gentle quest with a big heart.',
    pickId: 'knight-seven-kingdoms',
  },
  {
    id: 'chaos',
    label: 'Beautiful chaos',
    detail: 'Bad choices, great cast.',
    pickId: 'beef-season-2',
  },
  {
    id: 'laugh',
    label: 'In the mood to laugh',
    detail: 'Fast, clever, low homework.',
    pickId: 'game-night',
  },
  {
    id: 'secrets',
    label: 'A little dangerous',
    detail: 'Pretty houses, ugly secrets.',
    pickId: 'your-friends-neighbors',
  },
];

let activePickId = picks[0].id;
let riveInstance;
let riveInputs = new Map();

const app = document.querySelector('#app');

app.innerHTML = `
  <section class="hero" aria-labelledby="page-title">
    <div class="hero-copy">
      <p class="eyebrow">A little something from Andrew</p>
      <h1 id="page-title">Hi Alexa. I saved these for you.</h1>
      <p class="intro">
        Andrew gave me five things he thinks you might love. Tell me what kind of night you are having, and I will point you toward one.
      </p>
    </div>

    <div class="cosmo-stage" aria-label="Animated robot butler named Cosmo">
      <div class="cosmo-viewport">
        <canvas id="cosmo-canvas" width="960" height="760"></canvas>
        <img
          class="cosmo-fallback"
          src="${assetPath('/assets/rive/robot-expressions-thumb.png')}"
          alt=""
          width="1422"
          height="1248"
        />
      </div>
      <div class="speech" id="cosmo-speech">
        Beep. Hi. I am Cosmo. Pick a mood, and I will find the one that feels right tonight.
      </div>
    </div>
  </section>

  <section class="mood-section" aria-labelledby="mood-title">
    <div class="section-heading">
      <p class="eyebrow">First, the important question</p>
      <h2 id="mood-title">Where is your heart tonight?</h2>
    </div>
    <div class="mood-grid" role="list">
      ${moods
        .map(
          (mood) => `
            <button class="mood-button" type="button" data-mood="${mood.id}" aria-pressed="${mood.pickId === activePickId}">
              <span>${mood.label}</span>
              <small>${mood.detail}</small>
            </button>
          `,
        )
        .join('')}
    </div>
  </section>

  <section class="spotlight" aria-live="polite" aria-labelledby="spotlight-title">
    <div class="spotlight-copy">
      <p class="eyebrow">For tonight</p>
      <h2 id="spotlight-title"></h2>
      <p id="spotlight-text"></p>
      <a class="watch-primary" id="spotlight-link" target="_blank" rel="noreferrer"></a>
    </div>
    <img id="spotlight-poster" alt="" width="780" height="1170" />
  </section>

  <section class="pick-list" aria-labelledby="all-picks-title">
    <div class="section-heading">
      <p class="eyebrow">The full little shelf</p>
      <h2 id="all-picks-title">All five picks</h2>
    </div>
    <div class="cards">
      ${picks.map(renderPickCard).join('')}
    </div>
  </section>

  <footer class="credits">
    <p>Made just for you, Alexa, by Andrew. Cosmo handled delivery.</p>
    <p>
      Cosmo animation adapted from
      <a href="https://rive.app/community/files/18720-35184-robot-expressions/" target="_blank" rel="noreferrer">Robot - expressions</a>
      by deborah.n.oliveira, CC BY 4.0. Poster images via TMDB.
    </p>
  </footer>
`;

function renderPickCard(pick) {
  return `
    <article class="pick-card" id="${pick.id}" data-pick="${pick.id}" data-mood="${pick.mood}">
      <img class="poster" src="${pick.poster}" alt="${pick.title} poster" width="780" height="1170" loading="lazy" />
      <div class="pick-body">
        <div class="pick-meta">
          <span>${pick.moodLabel}</span>
          <span>${pick.year}</span>
        </div>
        <h3>${pick.title}</h3>
        <p>${pick.description}</p>
        <p class="cosmo-note">${pick.cosmo}</p>
        <div class="actions">
          <a class="service-link" href="${pick.watchUrl}" target="_blank" rel="noreferrer">
            ${pick.availability} on ${pick.service}
          </a>
          <a class="secondary-link" href="${pick.backupUrl}" target="_blank" rel="noreferrer">
            More ways to watch
          </a>
        </div>
      </div>
    </article>
  `;
}

function initRive() {
  const canvas = document.querySelector('#cosmo-canvas');
  const fallback = document.querySelector('.cosmo-fallback');

  try {
    riveInstance = new Rive({
      src: assetPath('/assets/rive/robot-expressions.riv'),
      canvas,
      artboard: 'Artboard',
      stateMachines: RIVE_STATE_MACHINE,
      autoplay: true,
      isTouchScrollEnabled: true,
      layout: new Layout({
        fit: Fit.Contain,
        alignment: Alignment.Center,
      }),
      onLoad: () => {
        fallback.hidden = true;
        riveInstance.resizeDrawingSurfaceToCanvas();
        indexRiveInputs();
        fireExpression('Smiling button');
      },
      onLoadError: () => {
        canvas.hidden = true;
        fallback.hidden = false;
      },
    });

    window.addEventListener('resize', () => riveInstance?.resizeDrawingSurfaceToCanvas());
  } catch (error) {
    console.warn('Cosmo failed to initialize', error);
    canvas.hidden = true;
    fallback.hidden = false;
  }
}

function indexRiveInputs() {
  const inputs = riveInstance?.stateMachineInputs(RIVE_STATE_MACHINE) ?? [];
  riveInputs = new Map(inputs.map((input) => [normalizeInputName(input.name), input]));
  console.table(
    inputs.map((input) => ({
      name: input.name,
      type: input.type,
      initialValue: input.value,
    })),
  );
}

function normalizeInputName(name) {
  return String(name).trim().toLowerCase();
}

function fireExpression(name) {
  const input = riveInputs.get(normalizeInputName(name));

  if (input?.type === StateMachineInputType.Trigger && typeof input.fire === 'function') {
    input.fire();
    return;
  }

  if (input?.type === StateMachineInputType.Boolean) {
    input.value = true;
    window.setTimeout(() => {
      input.value = false;
    }, 350);
    return;
  }

  if (input?.type === StateMachineInputType.Number) {
    input.value = Number(input.value || 0) + 1;
    return;
  }

  const expressions = riveInputs.get('expressions');
  if (expressions?.type === StateMachineInputType.Number) {
    expressions.value = expressionValues[name] ?? 1;
  }
}

function setActivePick(pickId, { scroll = false, announce = true } = {}) {
  const pick = picks.find((item) => item.id === pickId) ?? picks[0];
  activePickId = pick.id;

  document.querySelector('#spotlight-title').textContent = pick.title;
  document.querySelector('#spotlight-text').textContent = pick.cosmo;
  document.querySelector('#spotlight-link').textContent = `${pick.availability} on ${pick.service}`;
  document.querySelector('#spotlight-link').href = pick.watchUrl;

  const spotlightPoster = document.querySelector('#spotlight-poster');
  spotlightPoster.src = pick.poster;
  spotlightPoster.alt = `${pick.title} poster`;

  if (announce) {
    document.querySelector('#cosmo-speech').textContent =
      `I found it. Tonight feels like ${pick.title}.`;
  }

  document.querySelectorAll('.mood-button').forEach((button) => {
    const mood = moods.find((item) => item.id === button.dataset.mood);
    button.setAttribute('aria-pressed', String(mood?.pickId === pick.id));
  });

  document.querySelectorAll('.pick-card').forEach((card) => {
    card.classList.toggle('is-active', card.dataset.pick === pick.id);
    card.classList.toggle('is-muted', card.dataset.pick !== pick.id);
  });

  fireExpression(pick.expression);

  if (scroll) {
    document.querySelector('.spotlight').scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }
}

document.querySelectorAll('.mood-button').forEach((button) => {
  button.addEventListener('click', () => {
    const mood = moods.find((item) => item.id === button.dataset.mood);
    if (!mood) return;

    document.body.classList.add('is-thinking');
    document.querySelector('#cosmo-speech').textContent = 'Hmm. Let me look through Andrew’s shelf.';
    fireExpression('Surprised button');

    window.setTimeout(() => {
      document.body.classList.remove('is-thinking');
      setActivePick(mood.pickId, { scroll: true });
    }, 520);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 },
);

document.querySelectorAll('.pick-card, .spotlight').forEach((element) => observer.observe(element));

setActivePick(activePickId, { announce: false });
initRive();
