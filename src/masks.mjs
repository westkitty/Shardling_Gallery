/**
 * Starsilk / Shardlings: palette and sprite-like LED art.
 * Display space is 256×256, top-left origin. No Three.js import, external
 * textures or timing side effects. Hold a numbered drawing, then jump to
 * a new drawing. The solid black screen is part of the character model.
 */
export const MASK_SIZE = 256;
export const MASK_FRAMES_PER_EXPRESSION = 6;

const collections = {
  connection: ['happy', 'bashful', 'giddy', 'delighted'],
  concentration: ['focused', 'puzzled', 'stern'],
  distress: ['concerned', 'alarmed', 'weary', 'tearful', 'uneasy'],
};
export const EXPRESSION_COLLECTIONS = Object.freeze(Object.fromEntries(
  Object.entries(collections).map(([id, ids]) => [id, Object.freeze(ids)])
));

const palette = {
  happy:     ['Happy',     '#8FE7FF', [470,155,260,180,390,130]],
  concerned: ['Concerned', '#FFB944', [430,155,250,150,390,150]],
  focused:   ['Focused',   '#28F4AE', [480,150,330,130,420,160]],
  puzzled:   ['Puzzled',   '#A38AFB', [490,190,275,145,375,155]],
  alarmed:   ['Alarmed',   '#FF4B49', [240,125,195,130,255,145]],
  bashful:   ['Bashful',   '#FF91B8', [485,165,280,165,360,145]],
  weary:     ['Weary',     '#8DEAFF', [520,190,325,170,465,205]],
  giddy:     ['Giddy',     '#D6F632', [255,150,185,135,280,170]],
  stern:     ['Stern',     '#FFB449', [550,160,370,165,460,165]],
  tearful:   ['Tearful',   '#9DB5FF', [430,175,265,195,415,210]],
  uneasy:    ['Uneasy',    '#55F28F', [390,170,245,155,360,165]],
  delighted: ['Delighted', '#FE65B6', [355,130,240,155,330,145]],
};

export const EXPRESSION_IDS = Object.freeze(Object.keys(palette));
export const EXPRESSIONS = Object.freeze({
  blank: Object.freeze({id:'blank',label:'Blank',color:null,collection:null,frameCount:1,frameDurationsMs:Object.freeze([0])}),
  ...Object.fromEntries(EXPRESSION_IDS.map((id) => {
    const [label, color, durations] = palette[id];
    return [id, Object.freeze({
      id, label, color,
      collection: Object.keys(collections).find((key) => collections[key].includes(id)),
      frameCount: MASK_FRAMES_PER_EXPRESSION,
      frameDurationsMs: Object.freeze(durations),
    })];
  })),
});

/**
 * Independent, hand-keyed frames. Per-emotion columns encode geometry, not
 * whole-face transform or brightness. Frame zero matches the concept sheet.
 * Positive glyph depth points down the display.
 */
const keyframes = {
  // eye widths, left/right arch rise, smile half-span, smile depth, lip lift
  happy: [
    [22,22,20,20,49,34,0], [24,23,10,13,54,43,-3],
    [25,21,24,15,47,27,-1], [22,23,2,23,53,40,-5],
    [22,26,15,27,43,28,3], [25,25,25,25,55,40,-2],
  ],
  // dot radii, eye right y offset, lip span, bend, terminal hook, lip y offset
  concerned: [
    [11,11,0,37,20,10,2], [12,9,3,29,16,12,5],
    [8,12,-5,39,23,6,0], [7,7,0,27,20,8,9],
    [13,10,-1,40,27,13,3], [10,13,7,34,12,8,8],
  ],
  // bar half-spans, left/right slant, mouth half-span, y-offset, tilt
  focused: [
    [25,25,17,17,24,0,0], [26,26,11,11,19,-3,0],
    [23,29,20,14,23,1,-3], [29,23,14,21,20,4,3],
    [24,24,26,26,18,7,0], [26,26,13,13,25,-4,0],
  ],
  // square half-side, square degree rotation, circle radius, circle y-offset, mouth span and slope
  puzzled: [
    [17,-4,18,0,18,-14], [17,-15,20,-4,21,-19],
    [14,13,21,4,17,-10], [19,-3,15,8,22,6],
    [17,20,22,-7,13,-10], [18,-18,16,2,23,-18],
  ],
  // left cross radius, right cross radius, right y-offset, mouth rx/ry, mouth y-offset
  alarmed: [
    [19,19,0,20,27,0], [22,22,-4,24,30,-4],
    [17,22,4,16,27,2], [23,17,0,24,21,1],
    [17,17,-3,18,29,-3], [22,20,5,22,26,1],
  ],
  // left/right lid cup, blush tilt, blush shift, smile span and depth
  bashful: [
    [15,15,8,0,22,16], [9,11,10,3,17,14],
    [21,16,5,-3,27,19], [19,9,12,2,22,12],
    [11,18,4,-4,19,19], [16,20,10,1,25,18],
  ],
  // lid half-spans, slope each lid, frown half-span, frown depth and center drop
  weary: [
    [23,23,4,4,22,14,0], [24,24,2,2,25,10,-2],
    [20,23,5,3,17,12,3], [24,19,1,6,20,9,4],
    [25,25,5,5,23,9,5], [21,21,7,7,24,16,2],
  ],
  // chevrons x-span and y-spread, grin x-span and y-depth, stitch tilt and length
  giddy: [
    [21,17,53,38,0,10], [24,12,55,43,3,12],
    [18,21,47,36,-2,8], [23,15,55,49,3,9],
    [20,19,49,40,-3,10], [25,12,54,35,0,12],
  ],
  // eye spans, slant depths, mouth span, mouth y shift, lip trajectory
  stern: [
    [25,25,15,15,24,0,0], [27,27,22,22,21,1,0],
    [23,26,18,13,25,-2,3], [26,23,14,18,23,3,-3],
    [23,23,20,20,18,3,0], [26,26,11,12,27,-1,0],
  ],
  // lid depth L/R, tear x,y, tear width, tear height
  tearful: [
    [15,16,173,156,8,24], [19,15,169,160,7,27],
    [12,13,171,166,9,25], [17,11,175,172,7,22],
    [20,18,172,165,11,28], [13,18,174,158,8,22],
  ],
  // eye radii L/R, right eye y offset, wave half-span, amplitude, asymmetric drift
  uneasy: [
    [24,15,21,32,8,0], [20,18,16,36,10,3],
    [26,14,23,27,8,-3], [23,17,13,31,13,2],
    [21,15,26,34,7,5], [25,16,19,30,10,-2],
  ],
  // eye width, left/right arch rise, diamond half span and half height, top vertex x offset
  delighted: [
    [23,23,23,25,31,0], [26,26,26,27,34,-2],
    [22,16,25,23,30,3], [24,26,11,28,31,-4],
    [24,18,25,22,33,3], [25,25,25,28,30,0],
  ],
};

const line = (c,p) => {
  c.beginPath();
  c.moveTo(...p[0]);
  for (let i=1;i<p.length;i++) c.lineTo(...p[i]);
  c.stroke();
};
const q = (c,x1,y1,cx,cy,x2,y2) => {
  c.beginPath(); c.moveTo(x1,y1); c.quadraticCurveTo(cx,cy,x2,y2); c.stroke();
};
const ellipse = (c,x,y,rx,ry=rx,filled=false) => {
  c.beginPath();
  c.ellipse(x,y,rx,ry,0,0,2*Math.PI);
  if (filled) c.fill(); else c.stroke();
};
const lid = (c,x,y,w,d) => q(c,x-w,y,x,y+d,x+w,y);
const smile = (c,x,y,w,d) => q(c,x-w,y,x,y+d,x+w,y);
const bar = (c,x,y,w,d) => line(c,[[x-w,y-d/2],[x+w,y+d/2]]);
const cross = (c,x,y,r) => {
  line(c,[[x-r,y-r],[x+r,y+r]]);
  line(c,[[x+r,y-r],[x-r,y+r]]);
};

function screenRim(c) {
  c.beginPath(); c.moveTo(128,21);
  c.bezierCurveTo(181,20,213,30,221,53);
  c.bezierCurveTo(234,82,225,142,206,177);
  c.bezierCurveTo(188,209,150,235,128,236);
  c.bezierCurveTo(106,235,68,209,50,177);
  c.bezierCurveTo(31,142,22,82,35,53);
  c.bezierCurveTo(43,30,75,20,128,21);
  c.closePath(); c.stroke();
}

const glyphs = {
  happy(c,[lw,rw,ld,rd,w,d,y]) {
    lid(c,80,114,lw,-ld*2); lid(c,176,114,rw,-rd*2);
    smile(c,128,159+y,w,d);
  },
  concerned(c,[l,r,ry,w,bend,hook,y]) {
    ellipse(c,80,112,l,l,true); ellipse(c,176,112+ry,r,r,true);
    c.beginPath(); c.moveTo(128-w,174+y);
    c.quadraticCurveTo(130,173+y-bend,146,167+y-bend/2);
    c.quadraticCurveTo(156,162+y-bend/2,128+w,161+y+hook/2);
    c.stroke();
  },
  focused(c,[l,r,ld,rd,w,y,tilt]) {
    bar(c,79,117,l,ld); bar(c,177,117,r,-rd); bar(c,128,180+y,w,tilt);
  },
  puzzled(c,[w,deg,r,ry,m,d]) {
    c.save(); c.translate(80,109); c.rotate(deg*Math.PI/180);
    c.strokeRect(-w,-w,2*w,2*w); c.restore();
    ellipse(c,176,111+ry,r); bar(c,130,174,m,d);
  },
  alarmed(c,[l,r,ry,rx,yh,y]) {
    cross(c,79,110,l); cross(c,177,110+ry,r);
    ellipse(c,128,174+y,rx,yh);
  },
  bashful(c,[l,r,tilt,shift,w,d]) {
    lid(c,80,107,24,l*1.65); lid(c,176,107,24,r*1.65);
    c.save(); c.lineWidth*=0.56;
    for (const x of [61,76,91,165,180,195]) line(c,[[x-5,152+shift],[x+tilt,137+shift]]);
    c.restore(); smile(c,128,173,w,d);
  },
  weary(c,[l,r,ld,rd,w,d,y]) {
    c.save(); c.lineWidth*=1.38; c.lineCap='butt';
    bar(c,80,122,l,-ld); bar(c,176,122,r,rd); c.restore();
    smile(c,128,181+y,w,-d);
  },
  giddy(c,[ex,ey,w,d,tilt,tick]) {
    line(c,[[81-ex,108-ey],[81+ex,108],[81-ex,108+ey]]);
    line(c,[[175+ex,108-ey],[175-ex,108],[175+ex,108+ey]]);
    const y=151;
    q(c,128-w,y,128,y+d,128+w,y);
    q(c,128-w,y+4,128,y+d+44,128+w,y+4);
    c.save(); c.lineWidth*=0.56;
    for (let i=-4;i<=4;i++) {
      const t=i/4.6, shape=1-t*t;
      const x=128+t*w;
      line(c,[[x-tilt-t*4,y+d*0.5*shape-tick*0.6],[x+tilt+t*4,y+(d*.5+25)*shape+tick*.65]]);
    }
    c.restore();
  },
  stern(c,[l,r,ld,rd,w,y,d]) {
    bar(c,79,117,l,ld); bar(c,177,117,r,-rd);
    q(c,128-w,179+y,128,179+y+d,128+w,179+y);
  },
  tearful(c,[l,r,x,y,w,h]) {
    lid(c,80,111,23,l*1.65); lid(c,176,111,23,r*1.65);
    c.save(); c.lineWidth*=0.72;
    c.beginPath(); c.moveTo(x,y);
    c.bezierCurveTo(x-w*.35,y+h*.27,x-w,y+h*.59,x-w,y+h*.75);
    c.bezierCurveTo(x-w,y+h*1.2,x+w,y+h*1.2,x+w,y+h*.75);
    c.bezierCurveTo(x+w,y+h*.57,x+w*.33,y+h*.28,x,y);
    c.closePath(); c.stroke(); c.restore();
  },
  uneasy(c,[l,r,ry,w,a,drift]) {
    ellipse(c,77,106,l); ellipse(c,175,106+ry,r);
    const x=128; const y=173+drift;
    c.beginPath(); c.moveTo(x-w,y);
    c.bezierCurveTo(x-w*.75,y-a*1.8,x-w*.46,y+a*2.2,x-w*.21,y);
    c.bezierCurveTo(x+w*.05,y-a*1.8,x+w*.25,y+a*2.2,x+w*.46,y);
    c.bezierCurveTo(x+w*.64,y-a*1.4,x+w*.79,y+a*.7,x+w,y-2);
    c.stroke();
  },
  delighted(c,[w,l,r,dx,dy,top]) {
    lid(c,80,114,w,-l*2); lid(c,176,114,w,-r*2);
    line(c,[[128+top,171-dy],[128+dx,171],[128,171+dy],[128-dx,171],[128+top,171-dy]]);
  },
};

/**
 * Draw one held LED frame, never an interpolated blend. An unknown id behaves
 * like blank. Supply outline=false to use a physical rim supplied by a host.
 */
export function drawMask(canvas, id='blank', frame=0, {color, glow=true, outline=true}={}) {
  const ctx=canvas?.getContext?.('2d');
  if (!ctx) throw new TypeError('drawMask requires a canvas with a 2D context');
  const expr=Object.hasOwn(EXPRESSIONS,id) ? EXPRESSIONS[id] : EXPRESSIONS.blank;
  const n=Number.isFinite(frame) ? Math.trunc(frame) : 0;
  const i=((n%expr.frameCount)+expr.frameCount)%expr.frameCount;
  const w=canvas.width, h=canvas.height;
  ctx.save();
  try {
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,w,h);
    if (expr.id==='blank') return {id:'blank',frame:0,color:null};
    ctx.scale(w/MASK_SIZE,h/MASK_SIZE);
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.strokeStyle=ctx.fillStyle=color ?? expr.color;
    const pixelScale=Math.min(w,h)/MASK_SIZE;
    ctx.shadowColor=glow ? ctx.strokeStyle : 'transparent';
    ctx.shadowOffsetX=ctx.shadowOffsetY=0;
    if (outline) {
      ctx.lineWidth=5.8; ctx.shadowBlur=glow ? (8*pixelScale) : 0;
      screenRim(ctx);
    }
    ctx.lineWidth=7.5; ctx.shadowBlur=glow ? (10*pixelScale) : 0;
    glyphs[expr.id](ctx,keyframes[expr.id][i]);
    return {id:expr.id,frame:i,color:ctx.strokeStyle};
  } finally {
    ctx.restore();
  }
}
