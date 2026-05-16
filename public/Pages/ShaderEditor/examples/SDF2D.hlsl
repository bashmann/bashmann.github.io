// 2D SDF Library — Inigo Quilez (iquilezles.org) — HLSL port
// Signed distance: negative = inside, positive = outside
// ──────────────────────────────────────────────────────────

// ── helpers ───────────────────────────────────────────────
float dot2(float2 v)           { return dot(v, v); }
float ndot(float2 a, float2 b) { return a.x*b.x - a.y*b.y; }

// ── primitives ────────────────────────────────────────────
float sdCircle(float2 p, float r){
    return length(p) - r;
}

float sdBox(float2 p, float2 b){
    float2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdRoundedBox(float2 p, float2 b, float4 r){
    r.xy = (p.x > 0.0) ? r.xy : r.zw;
    r.x  = (p.y > 0.0) ? r.x  : r.y;
    float2 q = abs(p) - b + r.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}

float sdSegment(float2 p, float2 a, float2 b){
    float2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba*h);
}

float sdCapsule(float2 p, float2 a, float2 b, float r){
    return sdSegment(p, a, b) - r;
}

float sdEquilateralTriangle(float2 p, float r){
    float k = 1.7320508; // sqrt(3)
    p.x = abs(p.x) - r;
    p.y = p.y + r / k;
    if(p.x + k*p.y > 0.0) p = float2(p.x - k*p.y, -k*p.x - p.y) * 0.5;
    p.x -= clamp(p.x, -2.0*r, 0.0);
    return -length(p) * sign(p.y);
}

float sdRhombus(float2 p, float2 b){
    p = abs(p);
    float h = clamp(ndot(b - 2.0*p, b) / dot(b, b), -1.0, 1.0);
    float d = length(p - 0.5*b*float2(1.0 - h, 1.0 + h));
    return d * sign(p.x*b.y + p.y*b.x - b.x*b.y);
}

float sdHexagon(float2 p, float r){
    float3 k = float3(-0.8660254, 0.5, 0.5773503);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    p -= float2(clamp(p.x, -k.z*r, k.z*r), r);
    return length(p) * sign(p.y);
}

float sdStar5(float2 p, float r, float rf){
    float2 k1 = float2( 0.8090170, -0.5877853);
    float2 k2 = float2(-0.8090170, -0.5877853);
    p.x = abs(p.x);
    p -= 2.0 * max(dot(k1, p), 0.0) * k1;
    p -= 2.0 * max(dot(k2, p), 0.0) * k2;
    p.x = abs(p.x);
    p.y -= r;
    float2 ba = rf * float2(-k1.y, k1.x) - float2(0.0, 1.0);
    float h = clamp(dot(p, ba) / dot2(ba), 0.0, r);
    return length(p - ba*h) * sign(p.y*ba.x - p.x*ba.y);
}

float sdPie(float2 p, float2 sc, float r){
    // sc = float2(sin, cos) of half-angle
    p.x = abs(p.x);
    float l = length(p) - r;
    float m = length(p - sc * clamp(dot(p, sc), 0.0, r));
    return max(l, m * sign(sc.y*p.x - sc.x*p.y));
}

float sdArc(float2 p, float2 sc, float ra, float rb){
    // sc = float2(sin, cos) of half-angle, ra = radius, rb = thickness
    p.x = abs(p.x);
    float k = (sc.y*p.x > sc.x*p.y) ? dot(p, sc) : length(p);
    return sqrt(dot(p, p) + ra*ra - 2.0*ra*k) - rb;
}

float sdTrapezoid(float2 p, float r1, float r2, float he){
    float2 k1 = float2(r2, he);
    float2 k2 = float2(r2 - r1, 2.0*he);
    p.x = abs(p.x);
    float2 ca = float2(p.x - min(p.x, (p.y < 0.0) ? r1 : r2), abs(p.y) - he);
    float2 cb = p - k1 + k2 * clamp(dot(k1 - p, k2) / dot2(k2), 0.0, 1.0);
    float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
    return s * sqrt(min(dot2(ca), dot2(cb)));
}

// ── boolean ops ───────────────────────────────────────────
float opUnion       (float a, float b){ return min(a, b); }
float opSubtraction (float a, float b){ return max(-a, b); }
float opIntersection(float a, float b){ return max(a, b); }

float opSmoothUnion(float a, float b, float k){
    float h = clamp(0.5 + 0.5*(b - a)/k, 0.0, 1.0);
    return lerp(b, a, h) - k*h*(1.0 - h);
}
float opSmoothSubtraction(float a, float b, float k){
    float h = clamp(0.5 - 0.5*(b + a)/k, 0.0, 1.0);
    return lerp(b, -a, h) + k*h*(1.0 - h);
}
float opSmoothIntersection(float a, float b, float k){
    float h = clamp(0.5 - 0.5*(b - a)/k, 0.0, 1.0);
    return lerp(b, a, h) + k*h*(1.0 - h);
}

// ── domain ops ────────────────────────────────────────────
float2 opRotate(float2 p, float a){
    float c = cos(a), s = sin(a);
    return float2(c*p.x - s*p.y, s*p.x + c*p.y);
}
// tile domain: s = cell size
float2 opRepeat(float2 p, float2 s){
    return p - s * floor(p/s + 0.5);
}

// ── shading util ──────────────────────────────────────────
// Render one SDF field with fill colour, field rings, AA edge
float3 sdfShade(float d, float3 fill, float3 bg, float aa){
    float3 col = bg + 0.04 * float3(0.5, 0.8, 1.0) * cos(18.0*d);
    col = lerp(col, fill, 1.0 - smoothstep(-aa, aa, d));
    col = lerp(col, float3(1.0, 1.0, 1.0), 1.0 - smoothstep(0.0, aa*1.5, abs(d)));
    return col;
}

// ── demo ──────────────────────────────────────────────────
float4 mainPS(float2 uv){
    float2 p = (uv - 0.5) * 2.0;
    p.x *= iResolution.x / iResolution.y;
    float aa = 2.0 / iResolution.y;
    float t  = iTime * 0.5;

    // three shapes orbiting the centre
    float2 c0 = float2(cos(t),         sin(t))         * 0.38;
    float2 c1 = float2(cos(t + 2.094), sin(t + 2.094)) * 0.38;
    float2 c2 = float2(cos(t + 4.189), sin(t + 4.189)) * 0.38;

    float d = sdHexagon        (opRotate(p - c0,  t),         0.21);
    d = opSmoothUnion(d, sdStar5(opRotate(p - c1, -t*0.7),    0.21, 0.45), 0.13);
    d = opSmoothUnion(d, sdEquilateralTriangle(opRotate(p - c2, t*1.3), 0.19), 0.13);

    // rotating arc border
    float2 arcSC = float2(sin(0.9), cos(0.9)); // ~52 deg half-angle
    d = opUnion(d, sdArc(opRotate(p, t*0.3), arcSC, 0.65, 0.018));

    // capsule sweep
    float2 cpa = float2(cos(t*1.7)*0.5,  sin(t*1.7)*0.18);
    float2 cpb = float2(cos(t*1.7+3.14)*0.5, sin(t*1.7+3.14)*0.18);
    d = opSmoothUnion(d, sdCapsule(p, cpa, cpb, 0.022), 0.07);

    float3 bg   = float3(0.04, 0.04, 0.09);
    float3 fill = lerp(float3(0.15, 0.65, 1.0), float3(1.0, 0.4, 0.1),
                       sin(d*5.0 + t)*0.5 + 0.5);

    return float4(sdfShade(d, fill, bg, aa), 1.0);
}
