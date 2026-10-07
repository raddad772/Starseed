// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uSunDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 0
    },
    {
      "name": "uSunE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    },
    {
      "name": "uPlanetCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    },
    {
      "name": "uPlanetR",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 44
    },
    {
      "name": "uRingColor",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 48
    },
    {
      "name": "uOpacity",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 60
    },
    {
      "name": "uRingNormal",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 64
    },
    {
      "name": "uRingShape",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 80
    }
  ],
  "textures": [],
  "bytes": 96,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uSunDir: vec3<f32>,
    uSunE: vec3<f32>,
    uPlanetCenter: vec3<f32>,
    uPlanetR: f32,
    uRingColor: vec3<f32>,
    uOpacity: f32,
    uRingNormal: vec3<f32>,
    uRingShape: vec4<f32>,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(1) @binding(0) 
var<uniform> global: Params;
var<private> fragmentColor: vec4<f32>;
var<private> vLocal_1: vec3<f32>;
var<private> vWorld_1: vec3<f32>;

fn ringHash(x: f32) -> f32 {
    var x_1: f32;

    x_1 = x;
    let _e22 = x_1;
    let _e25 = global.uRingShape;
    return fract((sin(((_e22 * 127.1f) + _e25.w)) * 43758.547f));
}

fn ringNoise1_(x_2: f32) -> f32 {
    var x_3: f32;
    var i: f32;
    var f: f32;

    x_3 = x_2;
    let _e22 = x_3;
    i = floor(_e22);
    let _e25 = x_3;
    f = fract(_e25);
    let _e28 = i;
    let _e29 = ringHash(_e28);
    let _e30 = i;
    let _e33 = ringHash((_e30 + 1f));
    let _e36 = f;
    return mix(_e29, _e33, smoothstep(0f, 1f, _e36));
}

fn ringDensity(r: f32) -> f32 {
    var r_1: f32;
    var t: f32;
    var d: f32;
    var i_1: i32 = 0i;
    var g: f32;
    var wdt: f32;

    r_1 = r;
    let _e22 = r_1;
    let _e23 = global.uRingShape;
    let _e26 = global.uRingShape;
    let _e28 = global.uRingShape;
    t = ((_e22 - _e23.x) / (_e26.y - _e28.x));
    let _e33 = t;
    let _e36 = t;
    if ((_e33 < 0f) || (_e36 > 1f)) {
        return 0f;
    }
    let _e43 = t;
    let _e46 = ringNoise1_((_e43 * 13f));
    let _e50 = t;
    let _e53 = ringNoise1_((_e50 * 61f));
    let _e57 = t;
    let _e60 = ringNoise1_((_e57 * 233f));
    d = (((0.55f + (0.25f * _e46)) + (0.15f * _e53)) + (0.1f * _e60));
    let _e64 = d;
    let _e67 = t;
    let _e71 = t;
    d = (_e64 * (smoothstep(0f, 0.06f, _e67) * smoothstep(1f, 0.9f, _e71)));
    let _e75 = d;
    let _e80 = t;
    d = (_e75 * mix(0.35f, 1f, smoothstep(0.1f, 0.3f, _e80)));
    loop {
        let _e86 = i_1;
        if !((_e86 < 4i)) {
            break;
        }
        {
            let _e93 = i_1;
            let _e95 = global.uRingShape;
            if (f32(_e93) >= _e95.z) {
                break;
            }
            let _e100 = i_1;
            let _e106 = ringHash(((f32(_e100) * 7.3f) + 1f));
            g = (0.35f + (0.55f * _e106));
            let _e112 = i_1;
            let _e118 = ringHash(((f32(_e112) * 3.1f) + 2f));
            wdt = (0.004f + (0.02f * _e118));
            let _e122 = d;
            let _e123 = wdt;
            let _e126 = wdt;
            let _e127 = t;
            let _e128 = g;
            d = (_e122 * smoothstep((_e123 * 0.5f), _e126, abs((_e127 - _e128))));
        }
        continuing {
            let _e90 = i_1;
            i_1 = (_e90 + 1i);
        }
    }
    let _e133 = d;
    return clamp(_e133, 0f, 1f);
}

fn main_1() {
    var r_2: f32;
    var d_1: f32;
    var dirR: vec3<f32>;
    var tc: f32;
    var pp: vec3<f32>;
    var h2_: f32;
    var rr: f32;
    var tEnter: f32;
    var toP: vec3<f32>;
    var tca: f32;
    var shadow: f32 = 1f;
    var d2_: f32;
    var V: vec3<f32>;
    var muS: f32;
    var litSide: bool;
    var tau: f32;
    var alpha: f32;
    var fwd: f32;
    var local: f32;
    var lit: f32;
    var c: vec3<f32>;

    let _e20 = vLocal_1;
    r_2 = length(_e20.xz);
    let _e24 = r_2;
    let _e25 = ringDensity(_e24);
    d_1 = _e25;
    let _e27 = d_1;
    if (_e27 < 0.003f) {
        discard;
    }
    {
        let _e30 = vWorld_1;
        dirR = normalize(_e30);
        let _e33 = global.uPlanetCenter;
        let _e34 = dirR;
        tc = dot(_e33, _e34);
        let _e37 = global.uPlanetCenter;
        let _e38 = tc;
        let _e39 = dirR;
        pp = (_e37 - (_e38 * _e39));
        let _e43 = pp;
        let _e44 = pp;
        h2_ = dot(_e43, _e44);
        let _e47 = global.uPlanetR;
        rr = (_e47 * 0.995f);
        let _e51 = h2_;
        let _e52 = rr;
        let _e53 = rr;
        if (_e51 < (_e52 * _e53)) {
            {
                let _e56 = tc;
                let _e57 = rr;
                let _e58 = rr;
                let _e60 = h2_;
                tEnter = (_e56 - sqrt(((_e57 * _e58) - _e60)));
                let _e65 = tEnter;
                let _e68 = tEnter;
                let _e69 = vWorld_1;
                if ((_e65 > 0f) && (_e68 < length(_e69))) {
                    discard;
                }
            }
        }
    }
    let _e73 = global.uPlanetCenter;
    let _e74 = vWorld_1;
    toP = (_e73 - _e74);
    let _e77 = toP;
    let _e78 = global.uSunDir;
    tca = dot(_e77, _e78);
    let _e83 = tca;
    if (_e83 > 0f) {
        {
            let _e86 = toP;
            let _e87 = toP;
            let _e89 = tca;
            let _e90 = tca;
            d2_ = (dot(_e86, _e87) - (_e89 * _e90));
            let _e94 = global.uPlanetR;
            let _e95 = global.uPlanetR;
            let _e99 = global.uPlanetR;
            let _e100 = global.uPlanetR;
            let _e104 = d2_;
            shadow = smoothstep(((_e94 * _e95) * 0.97f), ((_e99 * _e100) * 1.03f), _e104);
        }
    }
    let _e106 = vWorld_1;
    V = normalize(-(_e106));
    let _e110 = global.uSunDir;
    let _e111 = global.uRingNormal;
    muS = abs(dot(_e110, _e111));
    let _e115 = global.uSunDir;
    let _e116 = global.uRingNormal;
    let _e118 = V;
    let _e119 = global.uRingNormal;
    litSide = ((dot(_e115, _e116) * dot(_e118, _e119)) > 0f);
    let _e125 = d_1;
    let _e126 = global.uOpacity;
    tau = ((_e125 * _e126) * 3f);
    let _e132 = tau;
    let _e134 = V;
    let _e135 = global.uRingNormal;
    alpha = (1f - exp((-(_e132) / max(abs(dot(_e134, _e135)), 0.05f))));
    let _e144 = V;
    let _e146 = global.uSunDir;
    fwd = pow(max(dot(-(_e144), _e146), 0f), 8f);
    let _e153 = litSide;
    if _e153 {
        let _e155 = muS;
        local = (0.25f + _e155);
    } else {
        let _e158 = tau;
        let _e163 = fwd;
        let _e167 = muS;
        local = (((0.5f * exp(-(_e158))) + (0.8f * _e163)) * (0.2f + _e167));
    }
    let _e171 = local;
    lit = _e171;
    let _e173 = global.uRingColor;
    let _e176 = d_1;
    let _e183 = global.uSunE;
    let _e185 = lit;
    let _e187 = shadow;
    c = (((((_e173 * (0.75f + (0.5f * _e176))) / vec3(3.1415927f)) * _e183) * _e185) * _e187);
    let _e190 = c;
    let _e191 = alpha;
    let _e192 = (_e190 * _e191);
    let _e193 = alpha;
    fragmentColor = vec4<f32>(_e192.x, _e192.y, _e192.z, _e193);
    return;
}

@fragment 
fn main(@location(0) vLocal: vec3<f32>, @location(1) vWorld: vec3<f32>) -> FragmentOutput {
    vLocal_1 = vLocal;
    vWorld_1 = vWorld;
    main_1();
    let _e29 = fragmentColor;
    return FragmentOutput(_e29);
}
`;
