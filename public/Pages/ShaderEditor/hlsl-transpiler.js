var PRE   = 'precision mediump float;\nuniform float iTime;\nuniform vec2 iResolution;\nuniform vec2 iMouse;\n\n';
var PRE_N = (PRE.match(/\n/g)||[]).length;
var TAIL  = '\nvoid main(){\n  vec2 uv=gl_FragCoord.xy/iResolution.xy;\n  uv.y=1.-uv.y;\n  gl_FragColor=mainPS(uv);\n}\n';

function stripEntryPoint(code){
    var m = /\bfloat4\s+mainPS\b[^{]*\{/.exec(code);
    if(!m) return code;
    var depth = 1, i = m.index + m[0].length;
    while(i < code.length && depth > 0){
        if(code[i] === '{') depth++;
        else if(code[i] === '}') depth--;
        i++;
    }
    return (code.slice(0, m.index) + code.slice(i)).trim();
}

function resolveIncludes(s, visited){
    if(!window._resolveInclude) return s;
    if(!visited) visited = {};
    return s.replace(/#include\s+[<"]([^>"]+)[>"]/g, function(_, name){
        var key = name.replace(/\.hlsl$/i, '');
        if(visited[key]) return '// ' + key + ' already included';
        visited[key] = true;
        var src = window._resolveInclude(key);
        if(!src) return '// #include "' + key + '" — not found';
        src = resolveIncludes(stripEntryPoint(src), visited);
        return '// ── ' + key + ' ──\n' + src + '\n// ── end ' + key + ' ──';
    });
}

// Extract balanced argument list starting just inside the opening '('.
// Returns array of top-level comma-separated arguments.
function splitArgs(inner){
    var args=[], depth=0, cur='';
    for(var i=0;i<inner.length;i++){
        var c=inner[i];
        if(c==='('||c==='[')depth++;
        else if(c===')'||c===']')depth--;
        if(c===','&&depth===0){args.push(cur.trim());cur='';}
        else cur+=c;
    }
    if(cur.trim()!=='')args.push(cur.trim());
    return args;
}

// Replace every call to `name(...)` using replacer(innerArgs).
// Handles arbitrarily nested parentheses.
function expandFn(s, name, replacer){
    var re=new RegExp('\\b'+name+'\\s*\\(','g'), m;
    var out='', pos=0;
    while((m=re.exec(s))!==null){
        out+=s.slice(pos,m.index);
        var depth=1, i=m.index+m[0].length;
        while(i<s.length&&depth>0){if(s[i]==='(')depth++;else if(s[i]===')')depth--;i++;}
        var inner=s.slice(m.index+m[0].length,i-1);
        out+=replacer(inner);
        pos=i;
        re.lastIndex=pos;
    }
    return out+s.slice(pos);
}

function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

function transpile(s, params){
    var linesBefore = (s.match(/\n/g)||[]).length;
    s = resolveIncludes(s);
    var includeLines = (s.match(/\n/g)||[]).length - linesBefore;
    var extraUniforms = '';
    if(params && params.length){
        params.forEach(function(p){
            var en = escRe(p.name);
            if(p.type === 'texture'){
                s = s.replace(new RegExp('^[ \\t]*Texture2D(?:<[^>]+>)?[ \\t]+'+en+'[ \\t]*;[ \\t]*\\n?','m'), '');
                s = s.replace(new RegExp('\\b'+en+'\\.(?:Sample|SampleLevel|tex2D)\\s*\\(\\s*\\w+\\s*,\\s*','g'), 'texture2D(u_'+p.name+',');
                s = s.replace(new RegExp('\\b'+en+'\\b','g'), 'u_'+p.name);
                extraUniforms += 'uniform sampler2D u_'+p.name+';\n';
            } else {
                var declRe = new RegExp('^[ \\t]*(?:(?:static|const)[ \\t]+)?'+p.type+'[ \\t]+'+en+'[ \\t]*(?:=[^;]*)?;[ \\t]*\\n?','m');
                s = s.replace(declRe, '');
                s = s.replace(new RegExp('\\b'+en+'\\b','g'), 'u_'+p.name);
                extraUniforms += 'uniform '+p.type.replace(/float([234])/,'vec$1')+' u_'+p.name+';\n';
            }
        });
    }
    s = s.replace(/^[ \t]*SamplerState\b[^\n]*;\n?/gm, '');
    s = s.replace(/^[ \t]*Texture2D(?:<[^>]+>)?[ \t]+(\w+)[ \t]*;[ \t]*\n?/gm, 'uniform sampler2D $1;\n');
    s = s.replace(/\b(\w+)\.(?:Sample|SampleLevel|tex2D)\s*\(\s*\w+\s*,\s*/g, 'texture2D($1,');
    s = s.replace(/\btex2D\s*\(/g, 'texture2D(');
    s=s.replace(/\bfloat4x4\b/g,'mat4').replace(/\bfloat3x3\b/g,'mat3').replace(/\bfloat2x2\b/g,'mat2');
    s=s.replace(/\bfloat4\b/g,'vec4').replace(/\bfloat3\b/g,'vec3').replace(/\bfloat2\b/g,'vec2');
    s=s.replace(/\bint4\b/g,'ivec4').replace(/\bint3\b/g,'ivec3').replace(/\bint2\b/g,'ivec2');
    s=s.replace(/\bbool4\b/g,'bvec4').replace(/\bbool3\b/g,'bvec3').replace(/\bbool2\b/g,'bvec2');
    s=s.replace(/\bhalf\b/g,'float');
    s=s.replace(/\blerp\s*\(/g,'mix(').replace(/\bfrac\s*\(/g,'fract(').replace(/\bfmod\s*\(/g,'mod(');
    s=s.replace(/\bddx\s*\(/g,'dFdx(').replace(/\bddy\s*\(/g,'dFdy(');
    s=s.replace(/\batan2\s*\(/g,'atan(');
    s=expandFn(s,'rcp',      function(a){return'(1./'+a+')';});
    s=expandFn(s,'rsqrt',    function(a){return'(1./sqrt('+a+'))';});
    s=expandFn(s,'saturate', function(a){return'clamp('+a+',0.,1.)';});
    s=expandFn(s,'mad',      function(a){
        var args=splitArgs(a); return args.length===3?'(('+args[0]+')*('+args[1]+')+('+args[2]+'))':'mad('+a+')';
    });
    s=s.replace(/\s*:\s*(?:SV_\w+|TEXCOORD\d*|POSITION\d*|COLOR\d*|NORMAL\d*|TANGENT\d*|BINORMAL\d*)/gi,'');
    return {glsl: PRE+extraUniforms+s+TAIL, includeLines: includeLines};
}
// Returns approximate op count as a string, following the call graph from mainPS.
// Only reachable functions are counted; each call site is counted individually.
// Loops without break always run N times. Loops with break may run 1–N times.
function countOps(glsl){
    var src = glsl.slice(PRE.length, glsl.length - TAIL.length);
    src = src.replace(/\/\/[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'');

    // Extract every function body in the source (includes + user code).
    var fns = {};
    var SKIP = {if:1,else:1,for:1,while:1,do:1,switch:1,return:1,struct:1};
    var fnRe = /^[ \t]*(\w+)\s+(\w+)\s*\([^{;]*\)\s*\{/gm, fm;
    while((fm = fnRe.exec(src)) !== null){
        if(SKIP[fm[1]] || SKIP[fm[2]]) continue;
        var fn = fm[2], fs = fm.index + fm[0].length, fd = 1, fi = fs;
        while(fi < src.length && fd > 0){ if(src[fi]==='{') fd++; else if(src[fi]==='}') fd--; fi++; }
        fns[fn] = src.slice(fs, fi - 1);
    }

    if(!fns['mainPS']) return '?';

    var userNames = Object.keys(fns).filter(function(k){ return k !== 'mainPS'; });

    function tally(s){
        var arith = 0, toks = s.split(/([+\-*\/])/);
        for(var i = 1; i < toks.length; i += 2){
            var op = toks[i], pre = toks[i-1].trimEnd();
            if((op==='+'||op==='-') && toks[i+1] && toks[i+1][0]===op) continue;
            if(/[(\[,=<>!&|+\-*\/^~?:]$/.test(pre) || pre==='') continue;
            arith++;
        }
        return arith + (s.match(/\b(?:sin|cos|tan|asin|acos|atan|pow|exp|log2?|sqrt|inversesqrt|abs|sign|floor|ceil|round|fract|mod|min|max|clamp|mix|step|smoothstep|length|distance|dot|cross|normalize|reflect|refract|dFdx|dFdy|texture2D|textureCube)\s*\(/g)||[]).length;
    }

    // Count ops in a flat (non-loop) string, inlining user function calls at each site.
    function tallyFlat(s, visiting){
        if(!userNames.length) return {lo: tally(s), hi: tally(s)};
        var callRe = new RegExp('\\b(' + userNames.map(function(n){ return n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }).join('|') + ')\\s*\\(', 'g');
        var lo = 0, hi = 0, out = '', last = 0, cm;
        while((cm = callRe.exec(s)) !== null){
            out += s.slice(last, cm.index);
            var depth = 1, ci = cm.index + cm[0].length;
            while(ci < s.length && depth > 0){ if(s[ci]==='(') depth++; else if(s[ci]===')') depth--; ci++; }
            callRe.lastIndex = ci; last = ci;
            // Count arithmetic inside the argument expressions.
            var ir = tallyFlat(s.slice(cm.index + cm[0].length, ci - 1), visiting);
            lo += ir.lo; hi += ir.hi;
            // Inline the called function's body (guarded against recursion).
            var fn = cm[1];
            if(fns[fn] && !visiting[fn]){
                visiting[fn] = true;
                var r = process(fns[fn], visiting);
                delete visiting[fn];
                lo += r.lo; hi += r.hi;
            }
            out += '0.0'; // placeholder preserves surrounding operator context
        }
        out += s.slice(last);
        lo += tally(out); hi += tally(out);
        return {lo: lo, hi: hi};
    }

    function process(s, visiting){
        var re = /\bfor\s*\([^;]*;\s*\w+\s*<=?\s*(\d+)\s*;[^)]*\)/g, m;
        var segs = [];
        while((m = re.exec(s)) !== null){
            var N = parseInt(m[1], 10), p = m.index + m[0].length;
            while(p < s.length && s[p] !== '{') p++;
            if(p >= s.length) continue;
            var d = 1, j = p + 1;
            while(j < s.length && d > 0){ if(s[j]==='{') d++; else if(s[j]==='}') d--; j++; }
            var body = s.slice(p + 1, j - 1);
            segs.push({start: m.index, bStart: p+1, bEnd: j-1, end: j, N: N, hasBreak: /\bbreak\b/.test(body)});
        }
        var lo = 0, hi = 0, pos = 0;
        for(var i = 0; i < segs.length; i++){
            var ft = tallyFlat(s.slice(pos, segs[i].start), visiting);
            lo += ft.lo; hi += ft.hi;
            var b = process(s.slice(segs[i].bStart, segs[i].bEnd), visiting);
            lo += segs[i].hasBreak ? b.lo : b.lo * segs[i].N;
            hi += b.hi * segs[i].N;
            pos = segs[i].end;
        }
        var ft = tallyFlat(s.slice(pos), visiting);
        lo += ft.lo; hi += ft.hi;
        return {lo: lo, hi: hi};
    }

    var r = process(fns['mainPS'], {mainPS: true});
    return r.lo === r.hi ? String(r.lo) : r.lo + '–' + r.hi;
}

function fixLines(msg, extraN){
    var offset=PRE_N+(extraN||0);
    return msg
        .replace(/\d+:(\d+):/g,function(_,n){
            var l=parseInt(n,10)-offset; return 'line '+(l>0?l:n)+':';
        })
        .replace(/\bvec4\b/g,'float4').replace(/\bvec3\b/g,'float3').replace(/\bvec2\b/g,'float2')
        .replace(/\bivec4\b/g,'int4').replace(/\bivec3\b/g,'int3').replace(/\bivec2\b/g,'int2')
        .replace(/\bbvec4\b/g,'bool4').replace(/\bbvec3\b/g,'bool3').replace(/\bbvec2\b/g,'bool2')
        .replace(/\bmat4\b/g,'float4x4').replace(/\bmat3\b/g,'float3x3').replace(/\bmat2\b/g,'float2x2')
        .replace(/\bmix\b/g,'lerp').replace(/\bfract\b/g,'frac').replace(/\bmod\(/g,'fmod(')
        .replace(/\bdFdx\b/g,'ddx').replace(/\bdFdy\b/g,'ddy');
}
