import { Alignment, Fit, Layout, Rive, StateMachineInputType } from '@rive-app/canvas';
import './styles.css';

const RIVE_STATE_MACHINE = 'State Machine 1';
const assetPath = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const TYPE_SPEED = 46;
const SHORT_PAUSE = 620;
const READ_PAUSE = 1120;

const expressionValues = {
  smile: 1,
  happy: 2,
  sad: 3,
  scared: 4,
  surprised: 5,
};

const picks = [
  {
    id: 'project-hail-mary',
    title: 'Project Hail Mary',
    poster: assetPath('/assets/posters/project-hail-mary.jpg'),
    line: 'Space. Problems. Feelings. Very efficient.',
    description:
      'A stranded astronaut wakes up with one job: save Earth, then figure out who is knocking.',
    watchLabel: 'Rent on Prime Video',
    watchUrl: 'https://www.primevideo.com/detail/0J0SQMKFG51K9S3UTU9SDEMT7D/',
    expression: 'surprised',
  },
  {
    id: 'knight-seven-kingdoms',
    title: 'A Knight of the Seven Kingdoms',
    poster: assetPath('/assets/posters/knight-seven-kingdoms.jpg'),
    line: 'Kind knight. Big heart. No homework.',
    description:
      'A warmer Westeros story about Dunk and Egg, built for a slower night with a good quest.',
    watchLabel: 'Watch on Max',
    watchUrl: 'https://www.max.com/search?q=A%20Knight%20of%20the%20Seven%20Kingdoms',
    expression: 'smile',
  },
  {
    id: 'beef-season-2',
    title: 'BEEF: Season 2',
    poster: assetPath('/assets/posters/beef-season-2.jpg'),
    line: "Everyone makes it worse. That's the show.",
    description:
      'Two couples, a country club, and a chain reaction of favors, pressure, and bad decisions.',
    watchLabel: 'Watch on Netflix',
    watchUrl: 'https://www.netflix.com/title/81447461',
    expression: 'scared',
  },
  {
    id: 'game-night',
    title: 'Game Night',
    poster: assetPath('/assets/posters/game-night.jpg'),
    line: 'Funny, fast, no emotional paperwork.',
    description:
      'A fake mystery turns real, and the jokes keep landing while the night gets dumber.',
    watchLabel: 'Watch on Hulu',
    watchUrl: 'https://www.hulu.com/movie/game-night-54935c48-6171-46a2-ae89-773fbe711ba6',
    expression: 'happy',
  },
  {
    id: 'your-friends-neighbors',
    title: 'Your Friends & Neighbors',
    poster: assetPath('/assets/posters/your-friends-neighbors.jpg'),
    line: 'Rich people. Bad choices. Excellent snooping.',
    description:
      'Jon Hamm steals from rich neighbors and finds out the secrets are worse than the money.',
    watchLabel: 'Watch on Apple TV+',
    watchUrl:
      'https://tv.apple.com/us/show/your-friends--neighbors/umc.cmc.74o37kzay0yuuub8iumddjsg',
    expression: 'surprised',
  },
];

const choices = [
  {
    id: 'big',
    label: 'Big',
    prompt: 'Big how?',
    expression: 'surprised',
    options: [
      { id: 'spaceship', label: 'Spaceship', pickId: 'project-hail-mary' },
      { id: 'sword', label: 'Sword', pickId: 'knight-seven-kingdoms' },
    ],
  },
  {
    id: 'cozy',
    label: 'Cozy',
    prompt: 'Cozy how?',
    expression: 'smile',
    options: [
      { id: 'gentle', label: 'Gentle', pickId: 'knight-seven-kingdoms' },
      { id: 'nosy', label: 'Nosy', pickId: 'your-friends-neighbors' },
    ],
  },
  {
    id: 'unhinged',
    label: 'Unhinged',
    prompt: 'Which kind?',
    expression: 'scared',
    options: [
      { id: 'meltdown', label: 'Meltdown', pickId: 'beef-season-2' },
      { id: 'secrets', label: 'Secrets', pickId: 'your-friends-neighbors' },
    ],
  },
  {
    id: 'funny',
    label: 'Funny',
    prompt: 'Funny how?',
    expression: 'happy',
    options: [
      { id: 'clean-win', label: 'Clean win', pickId: 'game-night' },
      { id: 'stress-funny', label: 'Stress funny', pickId: 'beef-season-2' },
    ],
  },
];

let riveInstance;
let riveInputs = new Map();
let activeChoices = [];
let typingRun = 0;
let isLocked = false;

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="experience" aria-label="Cosmo movie picker">
    <section class="scene" id="scene">
      <div class="speech-bubble" id="speech-bubble" aria-live="polite" aria-atomic="true">
        <span class="speech-text" id="speech-text"></span>
      </div>

      <div class="robot-zone" aria-label="Cosmo, Andrew's robot sidekick">
        <div class="cosmo-viewport">
          <canvas id="cosmo-canvas" width="1422" height="1248"></canvas>
          <img
            class="cosmo-fallback"
            src="${assetPath('/assets/rive/robot-expressions-thumb.png')}"
            alt=""
            width="1422"
            height="1248"
          />
        </div>

        <div class="choice-dock" id="choice-dock" hidden></div>
      </div>

      <article class="recommendation" id="recommendation" hidden>
        <div class="poster-frame">
          <img id="pick-poster" alt="" width="780" height="1170" />
        </div>
        <div class="pick-copy">
          <h1 id="pick-title"></h1>
          <p class="pick-line" id="pick-line"></p>
          <p class="pick-description" id="pick-description"></p>
        </div>
        <div class="pick-actions">
          <a class="watch-link" id="watch-link" target="_blank" rel="noreferrer"></a>
          <button class="again-button" id="again-button" type="button">pick again</button>
        </div>
      </article>

      <button class="list-toggle" id="list-toggle" type="button" hidden>
        JUST SHOW ME THE LIST
      </button>
    </section>

    <section class="list-panel" id="list-panel" aria-labelledby="list-title" hidden>
      <div class="list-header">
        <h2 id="list-title">The list</h2>
        <button class="list-close" id="list-close" type="button">back to Cosmo</button>
      </div>
      <div class="list-items">
        ${picks.map(renderListItem).join('')}
      </div>
    </section>

    <footer class="credits">
      <span>
        Cosmo animation:
        <a href="https://rive.app/community/files/18720-35184-robot-expressions/" target="_blank" rel="noreferrer">Robot - expressions</a>
        by deborah.n.oliveira, CC BY 4.0.
      </span>
      <span>Poster images via TMDB.</span>
    </footer>
  </main>
`;

function renderListItem(pick) {
  return `
    <article class="list-item">
      <img class="list-poster" src="${pick.poster}" alt="${pick.title} poster" width="780" height="1170" loading="lazy" />
      <div class="list-copy">
        <h3>${pick.title}</h3>
        <p class="list-line">${pick.line}</p>
        <p class="list-description">${pick.description}</p>
        <a class="list-watch" href="${pick.watchUrl}" target="_blank" rel="noreferrer">${pick.watchLabel}</a>
      </div>
    </article>
  `;
}

const scene = document.querySelector('#scene');
const speechBubble = document.querySelector('#speech-bubble');
const speechText = document.querySelector('#speech-text');
const choiceDock = document.querySelector('#choice-dock');
const recommendation = document.querySelector('#recommendation');
const againButton = document.querySelector('#again-button');
const listToggle = document.querySelector('#list-toggle');
const listPanel = document.querySelector('#list-panel');
const listClose = document.querySelector('#list-close');

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, prefersReducedMotion.matches ? 0 : ms);
  });
}

function findPick(pickId) {
  return picks.find((pick) => pick.id === pickId) ?? picks[0];
}

function typeBubble(text, { speed = TYPE_SPEED } = {}) {
  const runId = ++typingRun;
  const interval = prefersReducedMotion.matches ? 0 : speed;

  speechBubble.classList.add('is-visible');
  speechText.classList.add('is-typing');
  speechText.textContent = '';

  return new Promise((resolve) => {
    if (interval === 0) {
      speechText.textContent = text;
      speechText.classList.remove('is-typing');
      resolve();
      return;
    }

    let index = 0;
    const tick = () => {
      if (runId !== typingRun) {
        resolve();
        return;
      }

      speechText.textContent = text.slice(0, index);
      index += 1;

      if (index <= text.length) {
        window.setTimeout(tick, interval);
        return;
      }

      speechText.classList.remove('is-typing');
      resolve();
    };

    tick();
  });
}

function renderChoices(nextChoices) {
  activeChoices = nextChoices;
  choiceDock.innerHTML = nextChoices
    .map(
      (choice) => `
        <button class="choice-chip" type="button" data-choice="${choice.id}">
          ${choice.label}
        </button>
      `,
    )
    .join('');

  choiceDock.hidden = false;
  window.requestAnimationFrame(() => {
    choiceDock.classList.add('is-visible');
    showListToggle();
  });
}

function hideChoices() {
  choiceDock.classList.remove('is-visible');
  hideListToggle();
  activeChoices = [];
  window.setTimeout(() => {
    if (!activeChoices.length) {
      choiceDock.hidden = true;
      choiceDock.innerHTML = '';
    }
  }, prefersReducedMotion.matches ? 0 : 180);
}

function hideRecommendation() {
  recommendation.classList.remove('is-visible');
  recommendation.hidden = true;
  scene.classList.remove('has-recommendation');
}

function showListToggle() {
  listToggle.hidden = false;
  window.requestAnimationFrame(() => {
    listToggle.classList.add('is-visible');
  });
}

function hideListToggle() {
  listToggle.classList.remove('is-visible');
  window.setTimeout(() => {
    if (!activeChoices.length) {
      listToggle.hidden = true;
    }
  }, prefersReducedMotion.matches ? 0 : 180);
}

async function startIntro({ quick = false } = {}) {
  isLocked = true;
  hideChoices();
  hideRecommendation();
  setExpression('smile');

  if (!quick) {
    await delay(560);
    await typeBubble('Hey Alexa.');
    await delay(SHORT_PAUSE);
    await typeBubble("I'm Cosmo, Andrew's robo-sidekick.");
    await delay(READ_PAUSE);
    await typeBubble('He sent five picks. I can narrow it down.');
    await delay(READ_PAUSE);
  }

  await typeBubble('Pick a vibe.');
  await delay(SHORT_PAUSE);
  renderChoices(choices);
  isLocked = false;
}

async function choosePrimary(choice) {
  isLocked = true;
  hideRecommendation();
  hideChoices();
  setExpression(choice.expression);
  await delay(280);
  await typeBubble(choice.prompt, { speed: 42 });
  await delay(SHORT_PAUSE);
  renderChoices(choice.options);
  isLocked = false;
}

async function revealPick(pickId) {
  isLocked = true;
  hideChoices();

  const pick = findPick(pickId);
  setExpression(pick.expression);
  await delay(280);
  await typeBubble('Found it.');
  await delay(SHORT_PAUSE);

  document.querySelector('#pick-poster').src = pick.poster;
  document.querySelector('#pick-poster').alt = `${pick.title} poster`;
  document.querySelector('#pick-title').textContent = pick.title;
  document.querySelector('#pick-line').textContent = pick.line;
  document.querySelector('#pick-description').textContent = pick.description;
  document.querySelector('#watch-link').textContent = pick.watchLabel;
  document.querySelector('#watch-link').href = pick.watchUrl;

  scene.classList.add('has-recommendation');
  recommendation.hidden = false;
  window.requestAnimationFrame(() => {
    recommendation.classList.add('is-visible');
    window.setTimeout(settleRecommendation, prefersReducedMotion.matches ? 0 : 260);
  });
  isLocked = false;
}

function showList() {
  if (isLocked) {
    return;
  }

  listPanel.hidden = false;
  setExpression('happy');
  listPanel.scrollIntoView({
    behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
    block: 'start',
  });
}

function hideList() {
  listPanel.hidden = true;
  scene.scrollIntoView({
    behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
    block: 'start',
  });
}

function settleRecommendation() {
  const recommendationRect = recommendation.getBoundingClientRect();
  const bottomGutter = 14;

  if (recommendationRect.bottom <= window.innerHeight - bottomGutter) {
    return;
  }

  recommendation.scrollIntoView({
    behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
    block: 'nearest',
  });
}

function normalizeInputName(name) {
  return String(name).trim().toLowerCase();
}

function indexRiveInputs() {
  const inputs = riveInstance?.stateMachineInputs(RIVE_STATE_MACHINE) ?? [];
  riveInputs = new Map(inputs.map((input) => [normalizeInputName(input.name), input]));
}

function setExpression(expression) {
  const expressions = riveInputs.get('expressions');
  if (expressions?.type === StateMachineInputType.Number) {
    expressions.value = expressionValues[expression] ?? expressionValues.smile;
  }
}

function setRiveBoolean(name, value) {
  const input = riveInputs.get(normalizeInputName(name));
  if (input?.type === StateMachineInputType.Boolean) {
    input.value = value;
  }
}

function setSeasonal(value) {
  const seasonal = riveInputs.get('seasonal');
  if (seasonal?.type === StateMachineInputType.Number) {
    seasonal.value = value;
  }
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
        setSeasonal(0);
        setExpression('smile');
      },
      onLoadError: () => {
        canvas.hidden = true;
        fallback.hidden = false;
      },
    });

    window.addEventListener('resize', () => riveInstance?.resizeDrawingSurfaceToCanvas());
    canvas.addEventListener('pointerenter', () => setRiveBoolean('IsTracking', true));
    canvas.addEventListener('pointerleave', () => setRiveBoolean('IsTracking', false));
  } catch (error) {
    console.warn('Cosmo failed to initialize', error);
    canvas.hidden = true;
    fallback.hidden = false;
  }
}

choiceDock.addEventListener('click', (event) => {
  const button = event.target.closest('[data-choice]');
  if (!button || isLocked) return;

  const choice = activeChoices.find((item) => item.id === button.dataset.choice);
  if (!choice) return;

  if ('pickId' in choice) {
    revealPick(choice.pickId);
    return;
  }

  choosePrimary(choice);
});

againButton.addEventListener('click', () => {
  if (!isLocked) {
    startIntro({ quick: true });
  }
});

listToggle.addEventListener('click', showList);
listClose.addEventListener('click', hideList);

initRive();
window.requestAnimationFrame(() => {
  document.body.classList.add('is-ready');
  startIntro();
});
