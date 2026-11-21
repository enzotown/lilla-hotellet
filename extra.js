// ============================================================
//  EXTRA SCENES — Parkering, Tvättstuga, Trädgård
//  Laddas efter huvudskriptet och hakar in sig i SCENES/META.
//  Allt ritas med samma former, färger och figurer som resten.
// ============================================================

// ---------- shared drawing bits ----------
function drawCar(x, y, col, sc) {
  push();
  translate(x, y);
  scale(sc);
  noStroke();
  fillA('#2b2f36', 60);
  ellipse(0, 34, 124, 20);
  fill('#333941');
  ellipse(-34, 26, 26, 26);
  ellipse(34, 26, 26, 26);
  fill('#8b949f');
  ellipse(-34, 26, 12, 12);
  ellipse(34, 26, 12, 12);
  fill(col);
  rect(-60, -6, 120, 32, 13);
  fillA('#000000', 26);
  rect(-60, 16, 120, 10, 5);
  fill(col);
  rect(-34, -36, 68, 32, 14);
  fill('#cfe6f0');
  rect(-27, -30, 24, 20, 6);
  rect(3, -30, 24, 20, 6);
  fillA('#ffffff', 120);
  rect(-25, -28, 12, 7, 3);
  fill(col);
  rect(-41, -20, 9, 7, 3);
  rect(32, -20, 9, 7, 3);
  fill('#ffe9a6');
  ellipse(54, 4, 12, 9);
  fill('#e0665a');
  ellipse(-54, 4, 10, 8);
  fillA('#ffffff', 70);
  rect(-48, -2, 96, 4, 2);
  pop();
}

function drawShirt(x, y, s, col) {
  push();
  translate(x, y);
  scale(s / 40);
  noStroke();
  fillA('#000000', 20);
  ellipse(0, 14, 34, 8);
  fill(col);
  rect(-13, -12, 26, 26, 6);
  ellipse(-17, -6, 12, 14);
  ellipse(17, -6, 12, 14);
  fillA('#ffffff', 90);
  rect(-8, -8, 10, 8, 3);
  pop();
}

// ============================================================
//  PARKERING
// ============================================================
const PARK = {
  bays: [{ x: 636, y: 392 }, { x: 812, y: 392 }, { x: 636, y: 566 }, { x: 812, y: 566 }],
  cars: [],
  dragCar: null,
  spawnAt: 0,
  lane: [{ x: 150, y: 420 }, { x: 150, y: 520 }],
  laneFreeAt: [0, 0],
  leaving: 0,

  reset() {
    this.cars = [];
    this.dragCar = null;
    this.spawnAt = millis();
    this.addCar(true);
    this.addCar(true);
  },

  freeLane() {
    for (let i = 0; i < this.lane.length; i++) {
      const busy = this.cars.some(c => c.lane === i && c.state !== 'leave');
      const cooling = millis() - (this.laneFreeAt[i] || 0) < 700;
      if (!busy && !cooling) return i;
    }
    return -1;
  },

  addCar(instant) {
    const li = this.freeLane();
    if (li < 0) return;
    this.cars.push({
      x: instant ? this.lane[li].x : -150,
      y: this.lane[li].y,
      state: instant ? 'lane' : 'arrive',
      lane: li, bay: -1,
      col: random(['#ef8064', '#7fa8c9', '#8fd8c6', '#f7c948', '#b79ce0']),
      seed: random(10),
    });
  },

  freeBay() {
    for (let i = 0; i < this.bays.length; i++) {
      if (!this.cars.some(c => c.bay === i)) return i;
    }
    return -1;
  },

  draw(t) {
    noStroke();
    // sky + hedge
    background('#dceee6');
    fill('#bfe0cf');
    rect(0, 0, W, 240);
    fill('#9fcfb2');
    for (let x = 10; x < W; x += 46) ellipse(x, 236, 62, 44);
    // sign
    fill('#5f9d80');
    rect(40, 96, 118, 76, 14);
    fill('#ffffff');
    rect(52, 108, 94, 52, 10);
    fill('#2f7c62');
    textAlign(CENTER, CENTER);
    textSize(40);
    text('P', 99, 134);
    fill('#ffffff');
    textSize(10);
    text('HOTELLPARKERING', 99, 190);

    // asphalt
    fill('#6d7479');
    rect(0, 240, W, H - 240);
    fillA('#ffffff', 26);
    for (let x = 0; x < W; x += 120) rect(x, 240, 3, 6);
    // entry arrow
    fillA('#f7c948', 170);
    triangle(210, 480, 250, 462, 250, 498);
    rect(150, 474, 62, 8, 4);

    // parking bays
    for (let i = 0; i < this.bays.length; i++) {
      const b = this.bays[i];
      const occupied = this.cars.some(c => c.bay === i);
      noFill();
      strokeA('#f2f2f2', occupied ? 90 : 200);
      strokeWeight(6);
      rect(b.x - 96, b.y - 66, 192, 132, 14);
      noStroke();
      if (!occupied) {
        fillA('#ffffff', 26);
        rect(b.x - 96, b.y - 66, 192, 132, 14);
        fillA('#ffffff', 110);
        textAlign(CENTER, CENTER);
        textSize(13);
        text('LEDIG', b.x, b.y + 44);
      }
    }
    // floor numbers
    fillA('#ffffff', 120);
    textAlign(CENTER, CENTER);
    textSize(10);
    for (let i = 0; i < this.bays.length; i++) text('PLATS ' + (i + 1), this.bays[i].x, this.bays[i].y - 48);

    // cars
    for (const c of this.cars) drawCar(c.x, c.y, c.col, 1);

    // label
    fillA('#ffffff', 150);
    textAlign(CENTER, TOP);
    textSize(12);
    text('ENTRÉ', this.lane[0].x, 596);
    ;

    // valet guest waiting at entrance
    drawGuest(96, 590, 92, '#f2d3a0', 'idle', 1, false);
  },

  update(t) {
    if (millis() - this.spawnAt > 5000 && this.cars.filter(c => c.state !== 'parked').length < 2) {
      this.spawnAt = millis();
      this.addCar();
    }
    for (const c of this.cars) {
      if (c.state === 'arrive') {
        c.x += 4.2;
        if (c.x >= this.lane[c.lane].x) { c.x = this.lane[c.lane].x; c.state = 'lane'; }
      } else if (c.state === 'leave') {
        c.x += 5.5;
      }
    }
    this.cars = this.cars.filter(c => !(c.state === 'leave' && c.x > W + 140));
  },

  carAt(p) {
    let best = null, bd = 1e9;
    for (const c of this.cars) {
      if (c.state === 'leave') continue;
      const d = dist(p.x, p.y, c.x, c.y);
      if (d < 86 && d < bd) { bd = d; best = c; }
    }
    return best;
  },

  down(p) {
    const c = this.carAt(p);
    if (!c) return;
    if (c.state === 'parked') {
      c.state = 'leave';
      c.bay = -1;
      this.laneFreeAt[c.lane] = millis();
      sfx.lift();
      toast('Bilen hämtas', 1100);
      return;
    }
    this.dragCar = c;
    c.dx = c.x - p.x;
    c.dy = c.y - p.y;
    sfx.pickup();
  },

  move(p) {
    const c = this.dragCar;
    if (!c) return;
    c.x = p.x + c.dx;
    c.y = p.y + c.dy;
  },

  up(p) {
    const c = this.dragCar;
    if (!c) return;
    this.dragCar = null;
    let best = -1, bd = 120;
    for (let i = 0; i < this.bays.length; i++) {
      if (this.cars.some(o => o.bay === i)) continue;
      const d = dist(c.x, c.y, this.bays[i].x, this.bays[i].y);
      if (d < bd) { bd = d; best = i; }
    }
    if (best >= 0) {
      c.bay = best;
      c.state = 'parked';
      c.lane = -1;
      c.x = this.bays[best].x;
      c.y = this.bays[best].y;
      gainStar();
      sfx.thunk();
      sfx.good();
      setMood('happy', 1300);
      g3.starAt(c.x, c.y - 60);
      addHearts(c.x, c.y - 50, 2);
      toast('Perfekt parkerad!', 1400);
      if (this.cars.filter(q => q.state === 'lane').length === 0) this.spawnAt = millis() - 4200;
    } else {
      const ln = this.lane[c.lane >= 0 ? c.lane : 0] || this.lane[0];
      c.x = ln.x;
      c.y = ln.y;
      toast('Välj en ruta', 1200);
    }
  },

  mascot() { return { x: 486, y: 612, s: 0.86, hat: false }; },
};

// ============================================================
//  TVÄTTSTUGA
// ============================================================
const LAU = {
  washer: { x: 300, y: 372, r: 118 },
  dryer: { x: 640, y: 372, r: 118 },
  basket: { x: 208, y: 596 },
  shelf: [{ x: 800, y: 220 }, { x: 880, y: 220 }, { x: 960, y: 220 }],
  dirty: [],
  clean: [],
  dragItem: null,
  load: 0,
  state: 'idle',      // idle | wash | dry | ready
  timer: 0,
  folded: 0,
  bubbles: [],

  reset() {
    this.dirty = [];
    this.clean = [];
    this.dragItem = null;
    this.load = 0;
    this.state = 'idle';
    this.timer = 0;
    this.folded = 0;
    this.bubbles = [];
    const cols = ['#ef8064', '#7fa8c9', '#8fd8c6', '#f7c948', '#b79ce0'];
    const spots = [[150, 560], [236, 548], [196, 632], [126, 612], [268, 600]];
    shuffle(spots, true);
    for (let i = 0; i < 3; i++) {
      this.dirty.push({ x: spots[i][0], y: spots[i][1], col: cols[i % cols.length], seed: random(10), state: 'dirty' });
    }
  },

  draw(t) {
    noStroke();
    // tiled wall
    background('#e9f4f1');
    fill('#d7eae4');
    for (let y = 0; y < 300; y += 40) {
      for (let x = (y / 40) % 2 * 40; x < W; x += 80) rect(x, y, 78, 38, 4);
    }
    // floor
    fill('#dfd3c4');
    rect(0, 470, W, H - 470);
    fillA('#000000', 8);
    rect(0, 470, W, 10);

    // shelf
    fill('#e7d3ba');
    rect(742, 172, 236, 16, 6);
    fill('#d3b995');
    rect(742, 188, 236, 8, 4);
    fill('#b9a184');
    rect(760, 190, 10, 46, 4);
    rect(950, 190, 10, 46, 4);
    fill(PAL.dim);
    textAlign(CENTER, TOP);
    textSize(11);
    text('VIKT TVÄTT', 860, 200);

    // machines
    this.drawMachine(this.washer, t, 'washer');
    this.drawMachine(this.dryer, t, 'dryer');

    // basket
    push();
    translate(this.basket.x, this.basket.y);
    fill('#d8b57f');
    rect(-64, -10, 128, 66, 14);
    fill('#c2a16c');
    rect(-64, -10, 128, 12, 6);
    fillA('#000000', 18);
    ellipse(0, 56, 118, 14);
    pop();
    fill(PAL.dim);
    textAlign(CENTER, TOP);
    textSize(11);
    text('SMUTS', this.basket.x, 656);

    // clothes
    for (const d of this.dirty) if (d.state === 'dirty') drawShirt(d.x, d.y, 46, d.col);
    for (const c of this.clean) drawShirt(c.x, c.y, 46, c.col);

    // folded towels on shelf
    for (let i = 0; i < this.folded; i++) {
      const s = this.shelf[i];
      fill('#9fd3c4');
      rect(s.x - 30, s.y - 6, 60, 26, 6);
      fillA('#ffffff', 90);
      rect(s.x - 24, s.y - 1, 48, 7, 3);
    }

    // machine display labels
    fill(PAL.dim);
    textAlign(CENTER, TOP);
    textSize(11);
    text('TVÄTT', this.washer.x, 470);
    text('TORKA', this.dryer.x, 470);

    // state hints
    if (this.state === 'idle' && this.load < 3) {
      fill(PAL.dim);
      textAlign(CENTER, BOTTOM);
      textSize(12);
      text('3 plagg', this.washer.x, 520);
    }
    if (this.state === 'ready') {
      fill('#2f7c62');
      textAlign(CENTER, BOTTOM);
      textSize(13);
      text('Tryck!', this.washer.x, 520);
    }

    // bubbles
    for (const b of this.bubbles) {
      fillA('#ffffff', 160 * b.life);
      ellipse(b.x, b.y, b.r, b.r);
    }

    // mascot note
    fillA('#ffffff', 170);
    textAlign(CENTER, TOP);
    textSize(11.5);
    ;
  },

  drawMachine(m, t, kind) {
    noStroke();
    fillA('#000000', 18);
    rect(m.x - 92, m.y - 104, 184, 226, 18);
    fill('#f7fbfa');
    rect(m.x - 96, m.y - 108, 184, 226, 18);
    fillA('#dbe9e6', 200);
    rect(m.x - 96, m.y - 108, 184, 26, 12);
    // control strip
    fill('#e3eeeb');
    rect(m.x - 96, m.y - 82, 184, 30, 6);
    fill('#8fd8c6');
    ellipse(m.x + 58, m.y - 68, 16, 16);
    fill('#c9d8d3');
    ellipse(m.x + 30, m.y - 68, 14, 14);
    // door
    const busy = (kind === 'washer' && this.state !== 'idle' && this.state !== 'ready' && this.load > 0);
    fill('#d4e2df');
    ellipse(m.x, m.y + 18, 156, 156);
    fill('#b9cfca');
    ellipse(m.x, m.y + 18, 140, 140);
    fill(kind === 'washer' && this.state === 'ready' ? '#dff3ff' : '#eaf6f3');
    ellipse(m.x, m.y + 18, 118, 118);
    // drum contents
    push();
    translate(m.x, m.y + 18);
    if (busy) rotate(t * 3.2);
    for (let i = 0; i < Math.min(3, this.load); i++) {
      const a = i * TAU / 3;
      fill(['#ef8064', '#7fa8c9', '#8fd8c6'][i]);
      ellipse(cos(a) * 30, sin(a) * 26, 30, 22);
    }
    pop();
    noFill();
    strokeA('#ffffff', 150);
    strokeWeight(5);
    arc(m.x, m.y + 18, 118, 118, PI * 1.1, PI * 1.55);
    noStroke();
    // handle
    fill('#9fb3ae');
    rect(m.x + 42, m.y + 12, 10, 34, 5);
    fill('#4a3f39');
    textAlign(CENTER, CENTER);
    textSize(10);
    text(kind === 'washer' ? (this.state === 'wash' ? 'TVÄTTAR' : this.state === 'ready' ? 'KLAR' : '3 kg') :
      (this.state === 'dry' ? 'TORKAR' : '6 kg'), m.x - 40, m.y - 68);
  },

  update(t) {
    if (this.state === 'wash') {
      this.timer += deltaTime;
      if (random() < 0.25) {
        this.bubbles.push({ x: this.washer.x + random(-50, 50), y: this.washer.y - 40, r: random(6, 14), life: 1 });
      }
      if (this.timer > 4200) {
        this.state = 'ready';
        sfx.pling();
      }
    }
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y -= 0.6;
      b.life -= 0.012;
      if (b.life <= 0) this.bubbles.splice(i, 1);
    }
  },

  itemAt(p) {
    for (const d of this.dirty) {
      if (d.state !== 'dirty') continue;
      if (dist(p.x, p.y, d.x, d.y) < 42) return d;
    }
    for (const c of this.clean) {
      if (dist(p.x, p.y, c.x, c.y) < 42) return c;
    }
    return null;
  },

  down(p) {
    // pull out the washed clothes
    if (this.state === 'ready' && dist(p.x, p.y, this.washer.x, this.washer.y) < 120) {
      this.state = 'idle';
      this.load = 0;
      const spots = [[340, 560], [400, 588], [300, 600]];
      for (let i = 0; i < 3; i++) {
        this.clean.push({ x: spots[i][0], y: spots[i][1], col: ['#ef8064', '#7fa8c9', '#8fd8c6'][i], seed: random(10), state: 'clean' });
      }
      sfx.thunk();
      toast('Ren tvätt!', 1300);
      return;
    }
    if (dist(p.x, p.y, this.dryer.x, this.dryer.y) < 120) {
      toast('Inte idag!', 1200);
      return;
    }
    const it = this.itemAt(p);
    if (it) {
      this.dragItem = it;
      it.dx = it.x - p.x;
      it.dy = it.y - p.y;
      sfx.pickup();
    }
  },

  move(p) {
    const it = this.dragItem;
    if (!it) return;
    it.x = p.x + it.dx;
    it.y = p.y + it.dy;
  },

  up(p) {
    const it = this.dragItem;
    if (!it) return;
    this.dragItem = null;

    // into the washer
    if (it.state === 'dirty' && dist(it.x, it.y, this.washer.x, this.washer.y) < 130) {
      it.state = 'in';
      this.load++;
      sfx.thunk();
      if (this.load >= 3) {
        this.state = 'wash';
        this.timer = 0;
        sfx.lift();
        toast('Tvättar...', 1200);
      }
      return;
    }
    // onto the shelf
    if (it.state === 'clean') {
      let best = -1, bd = 90;
      for (let i = 0; i < this.shelf.length; i++) {
        if (i < this.folded) continue;
        const d = dist(it.x, it.y, this.shelf[i].x, this.shelf[i].y);
        if (d < bd) { bd = d; best = i; }
      }
      if (best >= 0) {
        this.clean = this.clean.filter(c => c !== it);
        this.folded++;
        sfx.good();
        g3.starAt(this.shelf[best].x, this.shelf[best].y - 20);
        if (this.folded >= 3) {
          gainStar();
          setMood('happy', 1500);
          toast('Allt klart!', 1400);
          setTimeout(() => { LAU.folded = 0; LAU.reset(); }, 900);
        }
        return;
      }
      // dropped on the floor -> back to the clean pile
      it.x = 340; it.y = 580;
      return;
    }
    // dirty dropped away from the washer: back to basket
    if (it.state === 'dirty') {
      it.x = 110 + random(-20, 20);
      it.y = 600 + random(-10, 10);
    }
  },

  mascot() { return { x: 500, y: 604, s: 0.8, hat: false }; },
};

// ============================================================
//  TRÄDGÅRD
// ============================================================
const GARDEN = {
  plants: [],
  can: { x: 120, y: 560, held: false },
  dragCan: false,
  butterflies: [],

  reset() {
    this.plants = [];
    this.doneFlag = false;
    const xs = [300, 430, 560, 690, 820];
    for (const x of xs) {
      this.plants.push({ x, y: 500, water: 0, seed: random(10), bloom: false });
    }
    this.can.x = 120;
    this.can.y = 560;
    this.dragCan = false;
    this.butterflies = [];
  },

  draw(t) {
    noStroke();
    // sky & sun
    background('#dff0f7');
    fill('#c9e6f2');
    rect(0, 0, W, 320);
    fillA('#ffe9a6', 220);
    ellipse(880, 92, 120, 120);
    // hedge
    fill('#a8d5b5');
    for (let x = 0; x < W; x += 54) ellipse(x, 316, 82, 70);
    // grass
    fill('#b7e0bd');
    rect(0, 320, W, H - 320);
    fillA('#8fc99b', 120);
    for (let x = 0; x < W; x += 26) rect(x, 320 + ((x / 26) % 3) * 8, 4, H);

    // stone path
    fill('#e7ded0');
    for (let i = 0; i < 6; i++) {
      ellipse(120 + i * 30, 660 - i * 6, 60, 24);
    }

    // planters
    for (const pl of this.plants) this.drawPlant(pl, t);

    // watering can
    if (!this.can.held) this.drawCanShape(this.can.x, this.can.y);

    fill(PAL.dim);
    textAlign(CENTER, TOP);
    textSize(11);
    text('VATTENKANNA', 120, 600);
    text('Vattna!', W / 2, 648);

    if (this.plants.every(function(pl) { return pl.bloom; })) {
      fillA('#000000', 18);
      rect(W / 2 - 112, 300, 224, 56, 26);
      fill('#8fd8c6');
      rect(W / 2 - 118, 292, 236, 60, 28);
      fill('#ffffff');
      textAlign(CENTER, CENTER);
      textSize(15);
      text('VATTNA IGEN', W / 2, 322);
    }

    // butterflies when done
    for (const b of this.butterflies) {
      push();
      translate(b.x, b.y);
      rotate(sin(t * 4 + b.seed) * 0.4);
      fill('#f2a0b4');
      ellipse(-6, 0, 12, 8);
      ellipse(6, 0, 12, 8);
      pop();
    }
  },

  drawPlant(pl, t) {
    push();
    translate(pl.x, pl.y);
    // pot / bed
    fill('#c97c56');
    rect(-42, 24, 84, 54, 10);
    fill('#e0a07a');
    rect(-42, 24, 84, 12, 6);
    fillA('#000000', 16);
    ellipse(0, 80, 90, 14);
    // stem
    stroke('#5b9b62');
    strokeWeight(6);
    line(0, 24, 0, -14);
    noStroke();
    // leaves
    fill('#6fbb76');
    ellipse(-16, 2, 34, 20);
    ellipse(16, 6, 34, 20);
    // bloom
    const w = pl.water;
    if (w > 0.12) {
      const s = 10 + w * 26;
      fill('#f2a0b4');
      for (let i = 0; i < 5; i++) {
        push();
        rotate(i * TAU / 5 + pl.seed);
        ellipse(0, -s * 0.55, s * 0.7, s);
        pop();
      }
      fill('#f7c948');
      ellipse(0, -20, 12 + w * 8, 12 + w * 8);
    } else {
      // drooping bud
      fill('#cbb8a4');
      ellipse(0, -18, 14, 20);
    }
    pop();

    // water meter
    const by = pl.y + 86;
    fillA('#ffffff', 150);
    rect(pl.x - 30, by, 60, 8, 4);
    fill('#7fa8c9');
    rect(pl.x - 30, by, 60 * min(1, pl.water), 8, 4);
  },

  drawCanShape(x, y) {
    push();
    translate(x, y);
    fillA('#000000', 18);
    ellipse(0, 44, 92, 16);
    fill('#7fa8c9');
    rect(-38, -14, 62, 54, 12);
    fill('#9dc0d9');
    rect(-38, -14, 62, 14, 8);
    // spout
    push();
    translate(28, 2);
    rotate(-0.5);
    fill('#7fa8c9');
    rect(0, -8, 52, 16, 8);
    pop();
    // handle
    noFill();
    stroke('#7fa8c9');
    strokeWeight(9);
    arc(-36, -8, 46, 40, PI, TAU);
    noStroke();
    pop();
  },

  update(t) {
    for (const pl of this.plants) {
      if (pl.water > 0 && !pl.bloom && pl.water >= 1) {
        pl.bloom = true;
        burst(pl.x, pl.y - 20, ['#f2a0b4', '#f7c948', '#ffffff'], 10, 0.8);
        sfx.sparkle();
      }
      if (pl.bloom && pl.water >= 1 && this.butterflies.length < 4 && random() < 0.01) {
        this.butterflies.push({ x: random(200, 900), y: random(320, 520), seed: random(10) });
      }
    }
    for (const b of this.butterflies) {
      b.x += sin(t * 2 + b.seed) * 0.8;
      b.y += cos(t * 1.7 + b.seed) * 0.5;
    }
    if (this.plants.every(pl => pl.bloom) && !this.doneFlag) {
      this.doneFlag = true;
      gainStar();
      setMood('happy', 1800);
      toast('Alla blommar!', 1600);
      addHearts(W / 2, 300, 4);
    }
  },

  down(p) {
    if (this.plants.every(pl => pl.bloom)) {
      if (inRect(p, { x: W / 2 - 118, y: 292, w: 236, h: 60 })) {
        this.doneFlag = false;
        this.reset();
      }
      return;
    }
    if (dist(p.x, p.y, this.can.x, this.can.y) < 60) {
      this.dragCan = true;
      this.can.held = true;
      sfx.pickup();
    }
  },

  move(p) {
    if (!this.dragCan) return;
    this.can.x = p.x;
    this.can.y = p.y;
    // water nearby plants
    for (const pl of this.plants) {
      if (dist(p.x, p.y, pl.x, pl.y - 10) < 66) {
        pl.water = min(1, pl.water + 0.02);
        if (random() < 0.25) {
          G.parts.push({ x: pl.x + random(-16, 16), y: pl.y - 26, vx: random(-0.6, 0.6), vy: random(0.8, 1.8), r: random(2, 4), life: 1, col: '#9dc0d9' });
        }
      }
    }
  },

  up(p) {
    if (this.dragCan) {
      this.dragCan = false;
      this.can.held = false;
      this.can.x = 120;
      this.can.y = 560;
    }
  },

  mascot() { return { x: 890, y: 604, s: 0.8, hat: false }; },
};


// ============================================================
//  POOLEN — tre leksaker i vattnet
// ============================================================
function drawPoolRing(x, y, col) {
  push(); translate(x, y);
  noFill(); stroke(col); strokeWeight(12);
  ellipse(0, 0, 46, 46);
  noStroke(); fillA('#ffffff', 90);
  ellipse(-10, -12, 10, 6);
  pop();
}
function drawPoolBall(x, y, col) {
  push(); translate(x, y);
  noStroke(); fill(col); ellipse(0, 0, 46, 46);
  fillA('#ffffff', 200); arc(0, 0, 40, 40, -0.4, 0.9); noFill();
  strokeA('#ffffff', 150); strokeWeight(3); arc(0, 0, 40, 40, 1.6, 2.9); noStroke();
  pop();
}
function drawPoolDuck(x, y) {
  push(); translate(x, y);
  noStroke(); fill('#f7d05a');
  ellipse(0, 4, 46, 32); ellipse(14, -12, 24, 24);
  fill('#ef8064'); triangle(24, -12, 40, -8, 24, -4);
  fill('#4a3f39'); ellipse(18, -15, 5, 5);
  pop();
}
function drawPoolToy(kind, x, y, col) {
  if (kind === 'ring') drawPoolRing(x, y, col || '#f19ab0');
  else if (kind === 'ball') drawPoolBall(x, y, col || '#7fa8c9');
  else drawPoolDuck(x, y);
}

const POOL = {
  toys: [], dragToy: null, splash: [], jumpAt: -9999, doneFlag: false, t0: 0,

  reset() {
    this.toys = [
      { x: 848, y: 330, kind: 'ring', col: '#f19ab0', inPool: false, seed: 1.2, hx: 0, hy: 0 },
      { x: 902, y: 432, kind: 'ball', col: '#7fa8c9', inPool: false, seed: 2.4, hx: 0, hy: 0 },
      { x: 848, y: 534, kind: 'duck', col: '#f7d05a', inPool: false, seed: 3.7, hx: 0, hy: 0 },
    ];
    this.dragToy = null;
    this.splash = [];
    this.jumpAt = -9999;
    this.doneFlag = false;
  },

  rect() { return { x: 296, y: 238, w: 476, h: 300 }; },

  draw(t) {
    const R = this.rect();
    noStroke();
    background('#e7f2ee');
    // deck tiles
    fill('#f4f8f6');
    rect(0, 0, W, H);
    strokeA('#dbe8e3', 160); strokeWeight(1);
    for (let x = 0; x < W; x += 64) line(x, 0, x, H);
    for (let y = 0; y < H; y += 64) line(0, y, W, y);
    noStroke();
    // sky strip
    fill('#dceee6'); rect(0, 0, W, 150);
    fill('#9fcfb2');
    for (let x = 10; x < W; x += 46) ellipse(x, 150, 62, 40);
    // pool
    fillA('#000000', 18); rect(R.x + 8, R.y + 12, R.w, R.h, 40);
    fill('#cde6df'); rect(R.x - 14, R.y - 14, R.w + 28, R.h + 28, 48);
    fill('#8ed4e0'); rect(R.x, R.y, R.w, R.h, 36);
    // water motion
    for (let i = 0; i < 7; i++) {
      const yy = R.y + 30 + i * 38;
      fillA('#ffffff', 34);
      for (let x = R.x + 20; x < R.x + R.w - 20; x += 26) {
        ellipse(x + sin(t * 1.4 + i + x * 0.02) * 8, yy + cos(t * 1.1 + i) * 4, 26, 5);
      }
    }
    // ladder
    strokeA('#f2f2f2', 230); strokeWeight(7);
    line(R.x + R.w - 26, R.y - 10, R.x + R.w - 26, R.y + 120);
    line(R.x + R.w - 68, R.y - 10, R.x + R.w - 68, R.y + 120);
    for (let i = 0; i < 3; i++) line(R.x + R.w - 68, R.y + 12 + i * 36, R.x + R.w - 26, R.y + 12 + i * 36);
    noStroke();

    // umbrella + loungers on the left
    push(); translate(150, 246);
    fill('#e0a07a'); rect(-3, -6, 6, 84, 3);
    // parasol canopy: half disc with stripes + scalloped edge
    for (let i = 0; i < 6; i++) {
      fill(i % 2 === 0 ? '#f2a0b4' : '#fff6ec');
      arc(0, 0, 150, 150, PI + i * PI / 6, PI + (i + 1) * PI / 6, PIE);
    }
    fillA('#000000', 14);
    for (let i = 0; i < 6; i++) {
      const a = PI + (i + 0.5) * PI / 6;
      ellipse(cos(a) * 72, sin(a) * 72 + 4, 22, 12);
    }
    fill('#ffffff'); ellipse(0, -76, 10, 10);
    pop();
    for (let i = 0; i < 2; i++) {
      push(); translate(120 + i * 96, 400);
      fillA('#ffffff', 240); rect(-40, -10, 80, 22, 8);
      fillA('#8fd8c6', 220); rect(-40, 4, 80, 16, 6);
      pop();
    }

    // guest sitting on the edge
    const bob = sin(t * 1.6) * 3;
    drawGuest(210, 560 + bob, 100, '#f2d3a0', 'idle', 1, false);

    // toys
    for (const ty of this.toys) {
      if (ty === this.dragToy) continue;
      let x = ty.x, y = ty.y;
      if (ty.inPool) {
        x = ty.hx + sin(t * 1.2 + ty.seed) * 10;
        y = ty.hy + cos(t * 1.7 + ty.seed) * 7;
      }
      drawPoolToy(ty.kind, x, y, ty.col);
    }
    // ripples from splash
    for (const sp of this.splash) {
      noFill(); strokeA('#ffffff', 200 * sp.life); strokeWeight(3);
      ellipse(sp.x, sp.y, 20 + (1 - sp.life) * 90, 10 + (1 - sp.life) * 40);
      noStroke();
    }

    // count of toys in pool
    fillA('#ffffff', 200);
    rect(W / 2 - 62, 176, 124, 40, 20);
    fill('#2f6b62');
    textAlign(CENTER, CENTER);
    textSize(13);
    const n = this.toys.filter(q => q.inPool).length;
    text(n + ' av 3', W / 2, 196);
  },

  update(t) {
    for (let i = this.splash.length - 1; i >= 0; i--) {
      this.splash[i].life -= 0.02;
      if (this.splash[i].life <= 0) this.splash.splice(i, 1);
    }
    if (this.toys.every(q => q.inPool) && !this.doneFlag) {
      this.doneFlag = true;
      this.jumpAt = millis();
      setMood('happy', 2400);
      toast('Alla leker!', 1600);
      addHearts(W / 2, 300, 4);
      burst(W / 2, 330, ['#f2a0b4', '#8fd8c6', '#f7c948', '#ffffff'], 24, 1.3);
    }
    if (this.doneFlag && millis() - this.jumpAt > 9000) this.reset();
  },

  toyAt(p) {
    for (const ty of this.toys) {
      if (ty.inPool) continue;
      if (dist(p.x, p.y, ty.x, ty.y) < 56) return ty;
    }
    return null;
  },

  down(p) {
    const ty = this.toyAt(p);
    if (!ty) return;
    this.dragToy = ty;
    ty.dx = ty.x - p.x;
    ty.dy = ty.y - p.y;
    sfx.pickup();
  },

  move(p) {
    const ty = this.dragToy;
    if (!ty) return;
    ty.x = p.x + ty.dx;
    ty.y = p.y + ty.dy;
  },

  up(p) {
    const ty = this.dragToy;
    if (!ty) return;
    this.dragToy = null;
    const R = this.rect();
    if (inRect(ty, { x: R.x + 20, y: R.y + 20, w: R.w - 40, h: R.h - 40 })) {
      ty.inPool = true;
      ty.x = constrain(ty.x, R.x + 40, R.x + R.w - 40);
      ty.y = constrain(ty.y, R.y + 50, R.y + R.h - 40);
      ty.hx = ty.x; ty.hy = ty.y;
      this.splash.push({ x: ty.x, y: ty.y, life: 1 });
      sfx.thunk(); sfx.pling();
      gainStar();
      g3.starAt(ty.x, ty.y - 52);
      toast('Plums!', 1100);
    } else {
      // snap back to the deck
      const idx = this.toys.indexOf(ty);
      ty.x = 848 + (idx === 1 ? 54 : 0);
      ty.y = 330 + idx * 102;
      toast('I vattnet!', 1200);
    }
  },

  mascot() { return { x: 78, y: 606, s: 0.78, hat: false }; },
};

// ============================================================
//  FRUKOSTEN — ställ rätt mat på rätt färg
// ============================================================
const BREAK = {
  plates: [], foods: [], dragFood: null, doneFlag: false,

  reset() {
    const cols = [
      { c: '#f7c948', kind: 'pannkaka' },
      { c: '#ef8064', kind: 'sylt' },
      { c: '#8fd8c6', kind: 'gurka' },
    ];
    this.plates = cols.map(function (q, i) {
      return { x: 366 + i * 152, y: 322, col: q.c, kind: q.kind, filled: false };
    });
    const order = shuffle([0, 1, 2]);
    this.foods = order.map(function (idx, i) {
      return {
        x: 366 + i * 152, y: 604, col: cols[idx].c, kind: cols[idx].kind,
        hx: 366 + i * 152, hy: 604, filled: false, seed: random(10),
      };
    });
    this.dragFood = null;
    this.doneFlag = false;
  },

  draw(t) {
    noStroke();
    background('#fdf1e3');
    // wall + wainscot
    fill('#f7e3cd'); rect(0, 0, W, 420);
    fill('#e8cfb4'); rect(0, 380, W, 40);
    fill('#f3dfc7'); rect(0, 420, W, H - 420);
    // big window
    fill('#cfe6f0'); rect(700, 120, 220, 180, 12);
    fillA('#ffffff', 150); rect(716, 136, 188, 70, 8);
    fill('#e0a07a'); rect(806, 120, 8, 180);
    fill('#e0a07a'); rect(700, 204, 220, 8);
    // table
    fill('#c2a16c'); rect(240, 300, 560, 40, 8);
    fill('#a88a5a'); rect(250, 340, 24, 130, 8);
    rect(766, 340, 24, 130, 8);

    // plates
    for (const pl of this.plates) {
      fillA('#000000', 16); ellipse(pl.x, pl.y + 6, 120, 34);
      fill('#ffffff'); ellipse(pl.x, pl.y, 118, 34);
      fillA(pl.col, 210); ellipse(pl.x, pl.y - 2, 86, 24);
      if (pl.filled) drawFoodItem(pl.kind, pl.col, pl.x, pl.y - 16, 1);
    }

    // counter with foods
    fill('#d8b57f'); rect(240, 626, 560, 26, 10);
    for (const f of this.foods) {
      if (f.filled) continue;
      if (f === this.dragFood) continue;
      const bob = sin(t * 2 + f.seed) * 3;
      drawFoodItem(f.kind, f.col, f.x, f.y + bob, 1);
    }

    // guest at the table
    drawGuest(150, 470, 108, '#f2d3a0', this.plates.every(q => q.filled) ? 'happy' : 'idle', 1, false);

    // count
    fillA('#ffffff', 210);
    rect(W / 2 - 62, 176, 124, 40, 20);
    fill('#5b4a2a');
    textAlign(CENTER, CENTER);
    textSize(13);
    text(this.plates.filter(q => q.filled).length + ' av 3', W / 2, 196);
  },

  update(t) {
    if (this.plates.every(q => q.filled) && !this.doneFlag) {
      this.doneFlag = true;
      setMood('happy', 2600);
      toast('Frukost klar!', 1700);
      addHearts(W / 2, 290, 5);
      burst(W / 2, 300, ['#f7c948', '#ef8064', '#8fd8c6', '#ffffff'], 24, 1.3);
      sfx.good();
      setTimeout(function () { sfx.pling(); }, 300);
      setTimeout(function () { BREAK.reset(); }, 5200);
    }
  },

  foodAt(p) {
    for (const f of this.foods) {
      if (f.filled) continue;
      if (dist(p.x, p.y, f.x, f.y) < 54) return f;
    }
    return null;
  },

  down(p) {
    const f = this.foodAt(p);
    if (!f) return;
    this.dragFood = f;
    f.dx = f.x - p.x;
    f.dy = f.y - p.y;
    sfx.pickup();
  },

  move(p) {
    const f = this.dragFood;
    if (!f) return;
    f.x = p.x + f.dx;
    f.y = p.y + f.dy;
  },

  up(p) {
    const f = this.dragFood;
    if (!f) return;
    this.dragFood = null;
    let best = null, bd = 96;
    for (const pl of this.plates) {
      if (pl.filled) continue;
      const d = dist(f.x, f.y, pl.x, pl.y);
      if (d < bd) { bd = d; best = pl; }
    }
    if (best && best.col === f.col) {
      best.filled = true;
      f.filled = true;
      sfx.thunk(); sfx.pling();
      gainStar();
      g3.starAt(best.x, best.y - 62);
      toast('Rätt!', 1000);
      addHearts(best.x, best.y - 50, 1);
    } else if (best) {
      toast('Fel färg', 1100);
      sfx.bad();
      f.x = f.hx; f.y = f.hy;
    } else {
      f.x = f.hx; f.y = f.hy;
    }
  },

  mascot() { return { x: 916, y: 604, s: 0.8, hat: true }; },
};

function drawFoodItem(kind, col, x, y, s) {
  push(); translate(x, y); scale(s || 1);
  noStroke();
  if (kind === 'pannkaka') {
    fill('#e8b06a'); ellipse(0, 0, 62, 24);
    fill(col); ellipse(0, -6, 40, 14);
    fill('#ffffff'); ellipse(-10, -8, 8, 5);
  } else if (kind === 'sylt') {
    fill('#f7f2ea'); rect(-22, -6, 44, 30, 6);
    fill(col); rect(-18, -2, 36, 22, 4);
    fill('#ffffff'); rect(-16, -14, 32, 12, 4);
    fill('#c9a6a7'); ellipse(0, -14, 18, 6);
  } else {
    fill(col); ellipse(0, 0, 54, 26);
    fillA('#2f7c62', 120); ellipse(0, 0, 38, 16);
    fill('#6fbb76'); ellipse(-20, -12, 14, 8);
  }
  pop();
}

// ============================================================
//  RUMSSERVICE — bricka till rätt dörr
// ============================================================
const ROOMSVC = {
  doors: [], tray: null, dragTray: false, left: 3, openAt: -9999, openIdx: -1, doneFlag: false,

  reset() {
    this.doors = [
      { x: 286, num: 2, open: 0 },
      { x: 626, num: 5, open: 0 },
    ];
    this.left = 3;
    this.doneFlag = false;
    this.openIdx = -1;
    this.newOrder();
  },

  newOrder() {
    const opts = [2, 5, 7, 9];
    const d = random(this.doors);
    this.tray = { num: d.num, x: 512, y: 566, hx: 512, hy: 566 };
  },

  draw(t) {
    noStroke();
    background('#f3e4d1');
    // wall + carpet
    fill('#f7ecdd'); rect(0, 0, W, H);
    fill('#e6d2bb'); rect(0, 470, W, H - 470);
    fill('#c9a6a7'); rect(0, 520, W, H - 520);
    for (let i = 0; i < 8; i++) {
      fillA('#ffffff', 26);
      rect(0, 540 + i * 22, W, 8);
    }
    // ceiling lamp glow
    fillA('#fff2c8', 90); ellipse(512, 40, 420, 120);

    // doors
    for (const d of this.doors) {
      // frame
      fill('#d8b57f'); rect(d.x - 92, 196, 184, 300, 8);
      fill('#b98f5f'); rect(d.x - 84, 204, 168, 288, 6);
      // opening / door
      fill('#6b4f36'); rect(d.x - 78, 212, 156, 274, 4);
      if (d.open) {
        fill('#3b2b1d'); rect(d.x - 78, 212, 156, 274, 4);
        fillA('#ffe9a6', 120); rect(d.x - 62, 300, 124, 150, 6);
      }
      // number plate
      fill('#fffaf3'); ellipse(d.x, 270, 74, 74);
      fill('#4a3f39'); textAlign(CENTER, CENTER); textSize(34);
      text(d.num, d.x, 270);
      // handle
      fill('#f7c948'); ellipse(d.x + 58, 380, 16, 16);
    }

    // cart
    push(); translate(512, 640);
    fillA('#000000', 16); ellipse(0, 46, 150, 18);
    fill('#9fb3ae'); rect(-70, -22, 140, 14, 6);
    fill('#c9d8d3'); rect(-64, 40, 128, 10, 4);
    fill('#7f8f8a'); rect(-58, 24, 8, 20, 3); rect(50, 24, 8, 20, 3);
    fill('#5f6f6a'); ellipse(-54, 50, 16, 16); ellipse(54, 50, 16, 16);
    pop();

    // tray
    if (this.tray) {
      const tr = this.tray;
      const bob = tr === this.dragTray ? 0 : sin(t * 1.8) * 2;
      push(); translate(tr.x, tr.y + bob);
      fill('#d8b57f'); rect(-46, -8, 92, 14, 5);
      fill('#fffaf3'); ellipse(0, -10, 64, 20);
      fill('#ffffff'); ellipse(0, -14, 44, 14);
      fill('#e8b06a'); ellipse(0, -18, 26, 10);
      fill('#8fd8c6'); ellipse(-10, -22, 8, 5);
      // number badge
      fill('#4a3f39'); ellipse(0, 10, 34, 34);
      fill('#ffffff'); textAlign(CENTER, CENTER); textSize(17);
      text(tr.num, 0, 11);
      pop();
    }

    // corridor rug decorations
    fillA('#ffffff', 40);
    for (let x = 60; x < W; x += 190) ellipse(x, 660, 60, 18);

    // count left
    fillA('#ffffff', 210);
    rect(W / 2 - 70, 150, 140, 40, 20);
    fill('#5b4a2a'); textAlign(CENTER, CENTER); textSize(13);
    text(this.left + ' kvar', W / 2, 170);
  },

  update(t) {
    if (this.left <= 0 && !this.doneFlag) {
      this.doneFlag = true;
      setMood('happy', 2400);
      toast('Alla rum!', 1600);
      burst(W / 2, 280, ['#f7c948', '#8fd8c6', '#ffffff'], 22, 1.2);
      setTimeout(function () { ROOMSVC.reset(); }, 5200);
    }
  },

  down(p) {
    if (!this.tray) return;
    if (dist(p.x, p.y, this.tray.x, this.tray.y) < 66) {
      this.dragTray = true;
      this.tray.dx = this.tray.x - p.x;
      this.tray.dy = this.tray.y - p.y;
      sfx.pickup();
    }
  },

  move(p) {
    if (!this.dragTray || !this.tray) return;
    this.tray.x = constrain(p.x + this.tray.dx, 120, W - 120);
    this.tray.y = constrain(p.y + this.tray.dy, 240, 620);
  },

  up(p) {
    if (!this.dragTray || !this.tray) return;
    this.dragTray = false;
    const tr = this.tray;
    let hit = null;
    for (const d of this.doors) {
      if (inRect(tr, { x: d.x - 110, y: 190, w: 220, h: 320 })) hit = d;
    }
    if (hit && hit.num === tr.num) {
      hit.open = 1;
      this.openIdx = this.doors.indexOf(hit);
      this.left--;
      sfx.thunk(); sfx.pling();
      gainStar();
      g3.starAt(hit.x, 340);
      toast('Serverat!', 1200);
      addHearts(hit.x, 330, 2);
      const self = this;
      setTimeout(function () { hit.open = 0; }, 1600);
      if (this.left > 0) setTimeout(function () { self.newOrder(); }, 700);
      else this.tray = { num: 0, x: 512, y: 566 };
    } else if (hit) {
      toast('Fel dörr', 1200);
      sfx.bad();
      tr.x = tr.hx; tr.y = tr.hy;
    } else {
      tr.x = tr.hx; tr.y = tr.hy;
    }
  },

  mascot() { return { x: 78, y: 606, s: 0.78, hat: true }; },
};

// ---------- register ----------
Object.assign(SCENES, {
  parking: PARK, laundry: LAU, garden: GARDEN,
  pool: POOL, breakfast: BREAK, roomsvc: ROOMSVC,
});
SCENE_META.push(
  {
    id: 'parking', label: 'GARAGET', icon: 'car', desc: 'parkera', role: 'Parkeringsvakt', say: 'Parkera bilen i en ledig ruta.',
    steps: ['Till rutan', 'Tryck på bilen', 'Klart!'],
  },
  {
    id: 'laundry', label: 'TVÄTTSTUGAN', icon: 'wash', desc: 'tvätta', role: 'Tvättare', say: 'Tvätta plaggen och vik dem.',
    steps: ['I maskinen', 'Vänta på KLAR', 'Vik plaggen'],
  },
  {
    id: 'garden', label: 'TRÄDGÅRDEN', icon: 'flower', desc: 'vattna', role: 'Trädgårdsmästare', say: 'Vattna blommorna så att de blommar.',
    steps: ['Ta kannan', 'Vattna', 'Alla fem'],
  },
  {
    id: 'pool', label: 'POOLEN', icon: 'pool', desc: 'leka i vattnet', role: 'Badmästare', say: 'Lägg leksakerna i poolen.',
    steps: ['Ta leksaken', 'I vattnet', 'Alla tre'],
  },
  {
    id: 'breakfast', label: 'FRUKOSTEN', icon: 'food', desc: 'duka fram', role: 'Frukostvärd', say: 'Lägg maten på tallriken med samma färg.',
    steps: ['Ta maten', 'Samma färg', 'Tre tallrikar'],
  },
  {
    id: 'roomsvc', label: 'RUMSSERVICE', icon: 'door', desc: 'bära brickor', role: 'Roomservice', say: 'Bär brickan till dörren med samma siffra.',
    steps: ['Ta brickan', 'Samma siffra', 'Till dörren'],
  }
);

// demonstration + hint for the three new jobs
DEMOS.pool = function () {
  const ty = POOL.toys.filter(function (q) { return !q.inPool; })[0];
  if (!ty) return null;
  const R = POOL.rect();
  return {
    from: { x: ty.x, y: ty.y },
    to: { x: R.x + R.w / 2, y: R.y + R.h / 2 },
    icon: function () { drawPoolToy(ty.kind, 0, 0, ty.col); },
    r: 46,
  };
};
DEMOS.breakfast = function () {
  const f = BREAK.foods.filter(function (q) { return !q.filled; })[0];
  if (!f) return null;
  const pl = BREAK.plates.filter(function (q) { return !q.filled && q.col === f.col; })[0];
  if (!pl) return null;
  return {
    from: { x: f.x, y: f.y },
    to: { x: pl.x, y: pl.y },
    icon: function () { drawFoodItem(f.kind, f.col, 0, 0, 0.9); },
    r: 44,
  };
};
DEMOS.roomsvc = function () {
  if (!ROOMSVC.tray || ROOMSVC.left <= 0) return null;
  const d = ROOMSVC.doors.filter(function (q) { return q.num === ROOMSVC.tray.num; })[0];
  if (!d) return null;
  return {
    from: { x: ROOMSVC.tray.x, y: ROOMSVC.tray.y },
    to: { x: d.x, y: 330 },
    icon: function () {
      fill('#d8b57f'); rect(-22, -4, 44, 8, 3);
      fill('#fffaf3'); ellipse(0, -6, 30, 10);
      fill('#ffffff'); ellipse(0, -9, 20, 7);
    },
    r: 44,
  };
};

HINTS.pool = function () {
  const ty = POOL.toys.filter(function (q) { return !q.inPool; })[0];
  return ty ? { x: ty.x, y: ty.y, r: 56 } : null;
};
HINTS.breakfast = function () {
  const f = BREAK.foods.filter(function (q) { return !q.filled; })[0];
  return f ? { x: f.x, y: f.y, r: 52 } : null;
};
HINTS.roomsvc = function () {
  if (!ROOMSVC.tray) return null;
  const d = ROOMSVC.doors.filter(function (q) { return q.num === ROOMSVC.tray.num; })[0];
  return d ? { x: d.x, y: 340, r: 62 } : null;
};
// scenes initialise lazily on first view