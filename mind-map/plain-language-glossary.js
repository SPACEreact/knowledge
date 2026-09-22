import './plain-language-glossary.css';

// A small, authored reading aid. Keep the definitions concrete and the examples
// distinct from the definition so a term is useful in an actual scene.
const entries = [
  ['visual literacy', 'The ability to notice how an image creates meaning or feeling.', 'A small figure in a huge empty frame can make loneliness visible.'],
  ['perception', 'How the brain makes sense of what the senses take in.', 'Two identical grey squares can look different on dark and light backgrounds.'],
  ['internalization', 'Learning something so well that you can use it without checking a rule.', 'After practice, you notice a weak composition immediately.'],
  ['salience', 'How much something stands out and catches attention.', 'A single moving dot has high salience among still dots.'],
  ['proximity', 'Closeness between things; nearby items often look like a group.', 'Three dots close together feel like one cluster.'],
  ['closure', 'The mind’s tendency to fill in missing parts of a shape.', 'An incomplete circle still looks like a circle.'],
  ['occlusion', 'When one object hides part of another, showing which is in front.', 'A tree covering part of a house tells us the tree is closer.'],
  ['convergence', 'Lines that appear to meet as they move into the distance.', 'Parallel rails seem to join near the horizon.'],
  ['processing fluency', 'How easily the mind understands something it sees.', 'A clear road sign is grasped faster than a cluttered one.'],
  ['visual hierarchy', 'The order in which your eye notices things in an image.', 'A bright face against a dark room becomes the first thing you see.'],
  ['gestalt', 'The way our mind groups separate shapes into a whole.', 'A few gaps in a circle are still read as one circle.'],
  ['composition', 'How people, objects, shapes and empty areas are arranged in a frame.', 'Putting a character at the edge leaves room for what they fear.'],
  ['framing', 'Choosing what the camera includes and what it leaves outside the image.', 'Keep the pursuer outside the frame so we only see the hero react.'],
  ['negative space', 'An intentionally empty part of an image that gives other things room or emphasis.', 'A lone boat feels smaller when most of the frame is open sea.'],
  ['visual weight', 'How strongly part of an image pulls your attention.', 'A tiny red coat can balance a much larger grey building.'],
  ['focal point', 'The place you want viewers to look first.', 'Light one doorway while the rest of the hallway stays dark.'],
  ['rule of thirds', 'A framing guide that divides an image into three rows and three columns.', 'Place a person near a vertical third to leave space in their gaze direction.'],
  ['leading lines', 'Lines in a scene that guide the eye toward something.', 'Railway tracks can lead your eye to a figure in the distance.'],
  ['symmetry', 'A balanced arrangement where one side closely mirrors the other.', 'A person centred in a perfectly even corridor can feel trapped.'],
  ['asymmetry', 'An uneven arrangement that can create energy or tension.', 'A small person facing a huge wall makes the imbalance felt.'],
  ['silhouette', 'The outer shape of a subject when inner details are hard to see.', 'A raised arm should read clearly even with the actor in shadow.'],
  ['foreground', 'The part of a scene closest to the camera.', 'Leaves near the lens can frame a person farther away.'],
  ['middle ground', 'The space between the closest and farthest parts of a scene.', 'The actors stand between foreground branches and distant hills.'],
  ['background', 'The part of a scene farthest from the camera.', 'A city behind a character can reveal where they are.'],
  ['depth cue', 'A visual clue that helps us sense distance.', 'A distant mountain looks smaller and less distinct than a nearby tree.'],
  ['depth cues', 'Visual clues that help us sense distance.', 'Smaller, softer distant hills make a flat image feel deep.'],
  ['atmospheric perspective', 'Faraway things appear paler, softer or less contrasted because of air between us and them.', 'Distant hills fade toward blue behind a sharp foreground tree.'],
  ['perspective', 'The way depth and size appear from a particular viewpoint.', 'A road seems to narrow as it stretches away.'],
  ['scale', 'The size of something compared with another thing.', 'A person beside a tower tells us how enormous the tower is.'],
  ['contrast', 'A clear difference between two things, such as light and dark or quiet and loud.', 'A white shirt stands out against a black doorway.'],
  ['value', 'How light or dark a colour is, regardless of its hue.', 'A dark blue and dark red can have nearly the same value.'],
  ['hue', 'The basic colour family, such as red, green or blue.', 'Change a light from blue to orange while keeping its brightness similar.'],
  ['saturation', 'How intense or muted a colour looks.', 'A vivid red umbrella stands out in a muted street.'],
  ['colour temperature', 'Whether light or colour feels warm or cool.', 'Warm lamplight against a cool blue window separates home from outside.'],
  ['color temperature', 'Whether light or colour feels warm or cool.', 'Warm lamplight against a cool blue window separates home from outside.'],
  ['complementary colours', 'Colours across from each other on a colour wheel that create strong contrast.', 'Orange skin tones can stand out against a blue evening.'],
  ['complementary colors', 'Colours across from each other on a colour wheel that create strong contrast.', 'Orange skin tones can stand out against a blue evening.'],
  ['analogous colours', 'Colours near one another on a colour wheel that often feel related.', 'Blue, teal and green can make a quiet ocean palette.'],
  ['analogous colors', 'Colours near one another on a colour wheel that often feel related.', 'Blue, teal and green can make a quiet ocean palette.'],
  ['monochromatic', 'Using variations of one colour family.', 'A room uses pale blue, navy and blue-grey.'],
  ['triadic', 'A colour scheme built from three hues spaced around the colour wheel.', 'Red, yellow and blue form a triadic set.'],
  ['tetradic', 'A colour scheme built from two pairs of opposite hues.', 'Blue and orange with red and green form a tetradic set.'],
  ['swatch', 'A small sample of a colour or material.', 'A designer compares two red swatches beside the set fabric.'],
  ['palette', 'The set of colours chosen for an image or project.', 'A scene might use charcoal, amber and one small cyan accent.'],
  ['chiaroscuro', 'Strong light and dark used to shape a subject and add drama.', 'Half a face catches candlelight while the other half disappears.'],
  ['key light', 'The main light that shapes a subject.', 'A window acts as the key light on an actor’s face.'],
  ['fill light', 'Light that softens shadows made by the main light.', 'A pale wall bounces light into the shadow side of a face.'],
  ['backlight', 'Light coming from behind a subject, often outlining them.', 'The setting sun draws a bright edge around a person’s hair.'],
  ['back light', 'Light coming from behind a subject, often outlining them.', 'A lamp behind the actor separates them from the dark wall.'],
  ['hard light', 'Light that makes clear, sharp-edged shadows.', 'Direct midday sun throws a crisp shadow across a face.'],
  ['soft light', 'Light that makes gentle shadows with blurry edges.', 'A large cloudy sky wraps light softly around a face.'],
  ['practical light', 'A visible light source that belongs inside the scene.', 'A desk lamp lights the actor and appears in the shot.'],
  ['diffusion', 'A spreading out that makes light or detail less sharp.', 'Clouds soften sunlight; distant textures can also blur in haze.'],
  ['specular', 'A bright reflection on a shiny surface.', 'A small white highlight flashes across a glass bottle.'],
  ['motivated lighting', 'Lighting that seems to come from a believable source in the scene.', 'A blue glow on the actor makes sense because a TV is nearby.'],
  ['volumetric light', 'Light made visible by haze, dust, smoke or mist in the air.', 'Sunbeams appear as shafts through a dusty room.'],
  ['exposure', 'How bright or dark the camera records the image.', 'Lower exposure keeps detail in a bright sky.'],
  ['dynamic range', 'The amount of detail a camera can hold in bright and dark areas at once.', 'A wide range can show both the sky and a shaded face.'],
  ['iso', 'A camera setting that controls how strongly it responds to light.', 'Raising ISO brightens a dim shot but can add noise.'],
  ['shutter speed', 'How long each camera exposure lasts.', 'A fast shutter keeps a runner sharper.'],
  ['shutter angle', 'A film-camera way of describing exposure time relative to each frame.', 'A smaller angle gives fast movement a crisper, choppier look.'],
  ['aperture', 'The lens opening that controls incoming light and affects background blur.', 'A wide aperture can keep eyes sharp while the street blurs.'],
  ['depth of field', 'How much of the scene appears acceptably sharp from near to far.', 'A shallow depth of field isolates a face from the crowd.'],
  ['focal length', 'A lens property that changes how wide or tight the view is.', 'A 24 mm lens sees more of a room than a 100 mm lens.'],
  ['wide angle', 'A lens view that includes more of the scene and can exaggerate nearby space.', 'A wide lens makes a cramped room feel deeper.'],
  ['telephoto', 'A long lens view that sees a narrow slice and makes distance look compressed.', 'Distant buildings seem stacked close behind a person.'],
  ['lens compression', 'The appearance that distant things sit closer together when framed with a long lens.', 'Hills seem crowded behind a portrait shot on a telephoto lens.'],
  ['chromatic aberration', 'Coloured fringes that can appear along high-contrast edges in a lens.', 'A bright window edge shows a thin purple rim.'],
  ['bokeh', 'The look of the blurred parts of an image, often the background lights.', 'Streetlights become soft circles behind a close-up.'],
  ['parallax', 'The apparent shift between near and far objects when the camera moves.', 'A nearby tree sweeps past faster than the mountains behind it.'],
  ['rack focus', 'Changing focus from one subject to another during a shot.', 'Focus leaves a letter in the foreground and lands on the reader’s face.'],
  ['dolly', 'A camera move made by physically moving the camera through space.', 'The camera rolls closer as a character realises the truth.'],
  ['pan', 'Turning a camera left or right from one position.', 'The camera pans from the speaker to the person listening.'],
  ['tilt', 'Turning a camera up or down from one position.', 'A tilt up reveals the full height of a building.'],
  ['blocking', 'Where performers stand and how they move in a scene.', 'One sibling steps between the other and the exit.'],
  ['mise-en-scène', 'Everything arranged in front of the camera: setting, costume, light, props and performers.', 'A spotless kitchen and one cracked cup tell us about its owner.'],
  ['continuity', 'Keeping details consistent so connected shots feel like one event.', 'The cup stays in the same hand across the cut.'],
  ['axis of action', 'An imagined line through a scene that helps keep screen directions consistent.', 'Two people stay on familiar sides of the frame during their conversation.'],
  ['180-degree rule', 'Keeping the camera on one side of an imagined line so screen direction stays clear.', 'An actor looking right keeps facing the other actor across the cuts.'],
  ['coverage', 'The different camera views filmed so a scene can be assembled in editing.', 'A wide shot and two close-ups give choices for the conversation.'],
  ['establishing shot', 'A view that shows where a scene takes place before closer shots.', 'A wide view of the station comes before the platform conversation.'],
  ['insert shot', 'A close view of a detail that matters to the scene.', 'A close-up shows the date written on a letter.'],
  ['cutaway', 'A shot of something away from the main action.', 'Cut to the clock while two people wait in silence.'],
  ['shot-reverse-shot', 'Alternating views of two people, usually during a conversation.', 'We see one speaker, then the listener facing back.'],
  ['eyeline', 'The direction a person looks, which tells us what they are watching.', 'Looking off screen right prepares us to see something to their right.'],
  ['match cut', 'A cut that connects two shots through a similar shape, motion or idea.', 'A spinning wheel cuts to a spinning planet.'],
  ['jump cut', 'A cut that skips time while keeping a similar viewpoint.', 'A seated person suddenly appears standing in the same frame.'],
  ['montage', 'A sequence of short shots that compresses time or builds an idea.', 'Three quick images show a garden changing through the seasons.'],
  ['elliptical editing', 'Cutting out part of an action or period of time and letting the viewer fill the gap.', 'We see someone board a train, then arrive in another city.'],
  ['parallel editing', 'Alternating between events in different places to connect them.', 'A child searches the house while a parent drives home.'],
  ['cross-cutting', 'Editing between two events happening in different places.', 'Cut between a rescue team and someone waiting inside a flooded house.'],
  ['j-cut', 'When sound from the next shot begins before its picture appears.', 'We hear a train before cutting from the bedroom to the station.'],
  ['l-cut', 'When sound from one shot continues after its picture changes.', 'A voice continues over the next image after we leave the speaker.'],
  ['pacing', 'How quickly or slowly a scene unfolds.', 'Long pauses can make a simple question feel dangerous.'],
  ['rhythm', 'The felt pattern of changes and pauses over time.', 'Quick cuts followed by one long still shot can make the silence land.'],
  ['tempo', 'The speed of repeated movement, cuts or sound.', 'Faster cuts increase the tempo of a chase.'],
  ['beat', 'A small moment when action, thought or emotion changes.', 'A smile drops after the character hears a name.'],
  ['transition', 'The change from one shot, scene or state to another.', 'A hard cut takes us straight from daytime to night.'],
  ['diegetic sound', 'Sound that comes from the story world and could be heard by its characters.', 'A radio playing in the room is diegetic.'],
  ['non-diegetic sound', 'Sound added for the audience that characters do not hear.', 'A film score swelling over a silent room is non-diegetic.'],
  ['ambience', 'The background sound that makes a place feel present.', 'Insects and distant traffic give a night street its ambience.'],
  ['room tone', 'The quiet background sound of a space, recorded to help sound edits blend.', 'A few seconds of the empty kitchen fill a gap between dialogue takes.'],
  ['adr', 'Dialogue recorded again after filming to replace or improve the original sound.', 'An actor repeats a line in a studio because traffic drowned it out.'],
  ['foley', 'Recorded sounds made to match physical actions on screen.', 'Footsteps are recreated on gravel after filming.'],
  ['reverb', 'The lingering sound of reflections in a space.', 'A shout rings longer inside a large hall than in a small bedroom.'],
  ['frequency', 'How quickly a sound vibrates, heard as pitch or part of its tone.', 'A low rumble has more low frequencies than a whistle.'],
  ['counterpoint', 'Two contrasting elements working together rather than matching.', 'Cheerful music over a sad image makes the scene feel uneasy.'],
  ['leitmotif', 'A recurring musical idea linked to a person, place or thought.', 'The same few notes return whenever the lost home is remembered.'],
  ['soundscape', 'The overall mix of sounds that creates a place or mood.', 'Wind, a loose sign and distant dogs make an empty town feel uneasy.'],
  ['sound bridge', 'Sound that continues across a cut to connect two scenes.', 'A bell rings over the last shot and continues into the next location.'],
  ['subtext', 'What someone means or feels beneath the words they say.', '“I’m fine” can mean “please notice I’m hurt.”'],
  ['motif', 'An image, sound or idea that returns and gains meaning.', 'A cracked mirror appears whenever a character lies to themself.'],
  ['symbolism', 'Using something visible or audible to suggest a larger idea.', 'An unopened letter can stand for a truth someone avoids.'],
  ['archetypal', 'Following a familiar character or story pattern seen across many works.', 'A guide who helps the hero cross into an unknown world is archetypal.'],
  ['metaphor', 'Describing or showing one thing through another to reveal a similarity.', 'A flooded room can make grief feel physically overwhelming.'],
  ['archetype', 'A familiar kind of character or pattern found in many stories.', 'A mentor helps a newcomer learn what they cannot yet see.'],
  ['character arc', 'How a character changes across a story.', 'A person who hides their art finally shows it to others.'],
  ['inciting incident', 'The event that sets a story’s main problem in motion.', 'A letter arrives and forces the hero to leave home.'],
  ['payoff', 'A later moment that gives new meaning to something set up earlier.', 'The tiny key from the first scene finally opens the locked room.'],
  ['causality', 'A chain in which one event leads to another.', 'The character lies, loses trust and then must earn it back.'],
  ['stakes', 'What a character could gain or lose from an action.', 'Telling the truth may cost her the friendship.'],
  ['conflict', 'Opposing wants or forces that make a choice difficult.', 'One person wants to leave; another needs them to stay.'],
  ['tension', 'The feeling that something important is unresolved or may happen soon.', 'A character waits for the phone to ring after sending a risky message.'],
  ['catharsis', 'An emotional release after tension has built up.', 'A long-held apology finally lets both characters cry.'],
  ['juxtaposition', 'Placing unlike things together so their difference creates meaning.', 'Cut from a lavish feast to an empty plate.'],
  ['tone', 'The overall emotional attitude of a scene or work.', 'The same empty street can feel peaceful or threatening through light and sound.'],
  ['stylization', 'Deliberately shaping reality into a chosen visual style.', 'A forest uses exaggerated shapes and colours rather than natural detail.'],
  ['semiotics', 'The study of how signs and images carry meaning.', 'A crown can signal authority even when no ruler is shown.'],
  ['iconography', 'A set of images or symbols associated with a subject or tradition.', 'A halo is part of the iconography of many sacred paintings.'],
  ['abstraction', 'Reducing or changing details to focus on shape, feeling or idea.', 'A city becomes blocks of colour instead of individual buildings.'],
  ['texture', 'The visible or felt quality of a surface or image.', 'Rough grain makes a clean digital image feel worn.'],
  ['materiality', 'The sense of what something is made of and how it behaves.', 'Wet clay reflects and deforms differently from dry stone.'],
  ['film grain', 'Small, irregular texture associated with photographic film.', 'Fine grain adds texture to a flat night sky.'],
  ['keyframe', 'A marked point that sets an important state in an animation.', 'One keyframe places a hand down; another places it above the head.'],
  ['interpolation', 'The in-between values a computer creates between keyframes.', 'The software fills in the positions as a shape moves left to right.'],
  ['timing', 'How long an action takes and where its changes happen.', 'A slow reach followed by a sudden grab creates surprise.'],
  ['spacing', 'The distance between successive positions in an animation.', 'Wide gaps between frames make a ball appear to move faster.'],
  ['squash and stretch', 'Changing a shape during motion to suggest force and flexibility.', 'A ball flattens when it hits the floor and lengthens as it springs up.'],
  ['easing', 'Making movement speed up or slow down instead of moving at one fixed speed.', 'A title starts slowly, moves fast, then settles gently.'],
  ['anticipation', 'A small action that prepares us for a larger one.', 'A dancer bends their knees just before jumping.'],
  ['follow-through', 'Movement that continues after the main body has stopped.', 'A coat keeps swinging for a moment after its wearer stops.'],
  ['motion blur', 'Streaking caused by movement during the camera’s exposure.', 'A fast hand smears slightly as it crosses the frame.'],
  ['visual grammar', 'The patterns a visual work uses to communicate.', 'Repeated close-ups can become the film’s way of showing anxiety.'],
  ['prompt', 'An instruction describing what an AI system should create.', '“A small boat at dusk, seen from above” is an image prompt.'],
  ['negative prompt', 'An instruction naming things you want an AI system to avoid.', '“No text or logos” is a negative prompt.'],
  ['seed', 'A number that helps reproduce a particular generated result.', 'Using the same seed can help compare two lighting prompts.'],
  ['reference image', 'An example image used to guide the look or content of a new one.', 'A costume photo guides the fabric and colours in a generated shot.'],
  ['consistency', 'Keeping important visual details recognisable across images or shots.', 'The same scar stays on the same cheek in every shot.'],
  ['iteration', 'Making a version, judging it and revising it again.', 'Change only the camera angle, then compare the next image.'],
];

const glossary = new Map(entries.map(([term, meaning, example]) => [term.toLowerCase(), { meaning, example }]));
const terms = [...glossary.keys()].sort((a, b) => b.length - a.length).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const matcher = new RegExp(`(^|[^\\p{L}\\p{N}])(${terms.join('|')})(?=$|[^\\p{L}\\p{N}])`, 'giu');
const root = document.querySelector('.ua-main');

if (root) {
  const folio = root.querySelector('.ua-page-meta');
  const hint = document.createElement('span');
  hint.className = 'ua-glossary-hint';
  hint.textContent = 'Dotted terms: hover or tap for a simple meaning';
  folio?.append(hint);
  const tip = document.createElement('div');
  tip.className = 'ua-glossary-tip';
  tip.id = 'ua-glossary-tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  tip.innerHTML = '<strong></strong><p></p><small></small>';
  document.body.append(tip);
  let active = null;
  let pinned = false;

  function close() {
    if (active) active.setAttribute('aria-expanded', 'false');
    active = null;
    pinned = false;
    tip.hidden = true;
  }

  function position(button) {
    const box = button.getBoundingClientRect();
    const width = Math.min(340, innerWidth - 24);
    const height = tip.getBoundingClientRect().height;
    tip.style.width = `${width}px`;
    tip.style.left = `${Math.max(12, Math.min(box.left, innerWidth - width - 12))}px`;
    tip.style.top = `${box.bottom + height + 10 > innerHeight ? Math.max(12, box.top - height - 10) : box.bottom + 10}px`;
  }

  function open(button, stick = false) {
    if (active && active !== button) active.setAttribute('aria-expanded', 'false');
    active = button;
    pinned = stick;
    const item = glossary.get(button.dataset.glossary);
    tip.querySelector('strong').textContent = button.textContent;
    tip.querySelector('p').textContent = item.meaning;
    tip.querySelector('small').textContent = `Example: ${item.example}`;
    tip.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    position(button);
  }

  function annotate(block) {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.nodeValue.trim() || node.parentElement.closest('a, button, code, pre, kbd, samp, [contenteditable], [aria-hidden="true"], .ua-glossary-tip')) continue;
      if (node.parentElement.closest('p, li, h1, h2, h3, h4, figcaption, td, th, dt, dd, blockquote') !== block) continue;
      nodes.push(node);
    }
    let count = 0;
    for (const node of nodes) {
      if (count >= 3) break;
      const text = node.nodeValue;
      matcher.lastIndex = 0;
      const matches = [...text.matchAll(matcher)].slice(0, 3 - count);
      if (!matches.length) continue;
      const fragment = document.createDocumentFragment();
      let offset = 0;
      for (const match of matches) {
        const start = match.index + match[1].length;
        const word = match[2];
        fragment.append(document.createTextNode(text.slice(offset, start)));
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ua-glossary-term';
        button.dataset.glossary = word.toLowerCase();
        button.textContent = word;
        button.setAttribute('aria-label', `Explain ${word}`);
        button.setAttribute('aria-controls', tip.id);
        button.setAttribute('aria-expanded', 'false');
        fragment.append(button);
        offset = start + word.length;
        count++;
      }
      fragment.append(document.createTextNode(text.slice(offset)));
      node.replaceWith(fragment);
    }
  }

  const blocks = root.querySelectorAll('p, li, h1, h2, h3, h4, figcaption, td, th, dt, dd, blockquote');
  const observer = new IntersectionObserver((items) => {
    for (const item of items) {
      if (!item.isIntersecting) continue;
      observer.unobserve(item.target);
      annotate(item.target);
    }
  }, { rootMargin: '600px 0px' });
  for (const block of blocks) observer.observe(block);
  window.addEventListener('languageChanged', (event) => {
    close();
    hint.textContent = event.detail?.lang === 'hi'
      ? 'बिंदु वाली रेखा वाले शब्द: अर्थ के लिए टैप करें'
      : 'Dotted terms: hover or tap for a simple meaning';
    for (const block of blocks) {
      block.querySelectorAll('.ua-glossary-term').forEach((button) => button.replaceWith(document.createTextNode(button.textContent)));
      block.normalize();
      observer.observe(block);
    }
  });

  root.addEventListener('pointerover', (event) => {
    if (!matchMedia('(hover: hover)').matches || pinned) return;
    const button = event.target.closest?.('.ua-glossary-term');
    if (button) open(button);
  });
  root.addEventListener('pointerout', (event) => {
    if (pinned || !active || event.target !== active) return;
    close();
  });
  root.addEventListener('focusin', (event) => {
    const button = event.target.closest?.('.ua-glossary-term');
    if (button) open(button);
  });
  root.addEventListener('focusout', (event) => {
    if (!pinned && event.target === active) close();
  });
  root.addEventListener('click', (event) => {
    const button = event.target.closest?.('.ua-glossary-term');
    if (!button) return;
    if (active === button && pinned) close();
    else open(button, true);
  });
  document.addEventListener('pointerdown', (event) => {
    if (active && !active.contains(event.target)) close();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  window.addEventListener('scroll', () => { if (active) position(active); }, { passive: true });
  window.addEventListener('resize', () => { if (active) position(active); });
}
