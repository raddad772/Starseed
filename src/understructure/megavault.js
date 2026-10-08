// Real kilometre-scale geometry beyond the observation glass. It is a visual
// extent for this prototype; walking remains in the connected service sector.
export function buildMegavault(plan,{box,cylinder,label}) {
  const v=plan.megavault,cx=(v.near+v.far)/2,cz=(v.zMin+v.zMax)/2,w=v.far-v.near,d=v.zMax-v.zMin,h=v.ceiling-v.bottom;
  box(cx,v.bottom-4,cz,w,8,d,'abyss');box(cx,v.ceiling+2,cz,w,4,d,'distant');
  box(v.far+4,(v.bottom+v.ceiling)/2,cz,8,h,d,'abyss');
  for(const z of [v.zMin-4,v.zMax+4])box(cx,(v.bottom+v.ceiling)/2,z,w,h,8,'abyss');
  // Vast piers disappear down through stacked transit decks. Human-scale lights
  // and service bays provide a size reference within the immense structural grid.
  for(let x=v.near+180;x<v.far;x+=240)for(let z=v.zMin+140;z<v.zMax;z+=240) {
    box(x,(v.bottom+v.ceiling)/2,z,18,h,24,'distant');
    for(const y of [-72,-184,-328,-488,-648]) {
      box(x,y,z,42,14,48,'distant');
      for(const side of [-1,1])box(x+side*9.2,y+7,z, .25,2,8,'amber');
    }
  }
  for(const y of [-72,-184,-328,-488,-648]) {
    for(const z of [cz-120,cz+120]) {
      box(cx,y,z,w,6,24,'distant');
      for(let x=v.near+30;x<v.far;x+=18)for(const s of [-1,1])box(x,y+3.25,z+s*10,1.2,.12,.6,'amber');
      for(let x=v.near+120;x<v.far-120;x+=240) {
        cylinder([x,y-5,z-10],[x+120,y-52,z-10],2.5,'distant');
        cylinder([x+120,y-52,z-10],[x+240,y-5,z-10],2.5,'distant');
      }
    }
    for(const z of [v.zMin+18,v.zMax-18])box(cx,y,z,w,6,36,'distant');
    box(v.far-18,y,cz,36,6,d,'distant');
    // Rows of four-metre maintenance bays, dwarfed by the piers around them.
    for(let z=v.zMin+28;z<v.zMax-28;z+=24) {
      box(v.far-36.1,y+4,z,.15,4,6,'metal');
      box(v.far-36.3,y+6.3,z,.1,.25,6,'cyan');
    }
  }
  // Foreground transit gantry, then another 1.4 km of structure behind it.
  for(const x of [v.near+100,v.near+130]) {
    box(x,plan.deck-12,cz,6,5,d-160,'metal');
    for(let z=v.zMin+90;z<v.zMax-80;z+=20)box(x,plan.deck-9.4,z,1,.12,1,'amber');
  }
  for(let z=v.zMin+90;z<v.zMax-80;z+=60)cylinder([v.near+100,plan.deck-15,z],[v.near+130,plan.deck-15,z+30],.8,'rust');
  for(const x of [v.near+180,v.near+420,v.near+900]) {
    cylinder([x,v.bottom,cz+360],[x,v.ceiling,cz+360],22,'distant',16);
    for(const y of [-100,-300,-500,-700])box(x-22.1,y,cz+360,.2,5,12,'cyan');
  }
  label('07  /  LOWER DISTRIBUTION',v.near+182,plan.deck+35,cz+119,{size:7,face:-Math.PI/2,color:'#678c8a'});
}
