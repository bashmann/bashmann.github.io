(function(){

// ── function signatures (used for intellisense + tokenizer) ───────────────────
var FN = {
    abs:         {sig:'abs(x)',              args:['x'],                 doc:'Absolute value.'},
    sin:         {sig:'sin(x)',              args:['x'],                 doc:'Sine of x (radians).'},
    cos:         {sig:'cos(x)',              args:['x'],                 doc:'Cosine of x (radians).'},
    tan:         {sig:'tan(x)',              args:['x'],                 doc:'Tangent of x (radians).'},
    asin:        {sig:'asin(x)',             args:['x'],                 doc:'Arcsine of x → [-π/2, π/2].'},
    acos:        {sig:'acos(x)',             args:['x'],                 doc:'Arccosine of x → [0, π].'},
    atan:        {sig:'atan(x)',             args:['x'],                 doc:'Arctangent of x → [-π/2, π/2].'},
    ceil:        {sig:'ceil(x)',             args:['x'],                 doc:'Smallest integer ≥ x.'},
    floor:       {sig:'floor(x)',            args:['x'],                 doc:'Largest integer ≤ x.'},
    round:       {sig:'round(x)',            args:['x'],                 doc:'Nearest integer.'},
    trunc:       {sig:'trunc(x)',            args:['x'],                 doc:'Integer part (truncate toward zero).'},
    frac:        {sig:'frac(x)',             args:['x'],                 doc:'Fractional part of x.'},
    sqrt:        {sig:'sqrt(x)',             args:['x'],                 doc:'Square root.'},
    rsqrt:       {sig:'rsqrt(x)',            args:['x'],                 doc:'Reciprocal square root (1/sqrt(x)).'},
    rcp:         {sig:'rcp(x)',              args:['x'],                 doc:'Reciprocal (1/x).'},
    exp:         {sig:'exp(x)',              args:['x'],                 doc:'e raised to the power x.'},
    exp2:        {sig:'exp2(x)',             args:['x'],                 doc:'2 raised to the power x.'},
    log:         {sig:'log(x)',              args:['x'],                 doc:'Natural logarithm.'},
    log2:        {sig:'log2(x)',             args:['x'],                 doc:'Base-2 logarithm.'},
    log10:       {sig:'log10(x)',            args:['x'],                 doc:'Base-10 logarithm.'},
    sign:        {sig:'sign(x)',             args:['x'],                 doc:'Returns -1, 0, or 1.'},
    saturate:    {sig:'saturate(x)',         args:['x'],                 doc:'Clamps x to [0, 1].'},
    normalize:   {sig:'normalize(x)',        args:['x'],                 doc:'Unit-length vector in the direction of x.'},
    length:      {sig:'length(x)',           args:['x'],                 doc:'Euclidean length of vector x.'},
    degrees:     {sig:'degrees(x)',          args:['x'],                 doc:'Radians to degrees.'},
    radians:     {sig:'radians(x)',          args:['x'],                 doc:'Degrees to radians.'},
    ddx:         {sig:'ddx(x)',              args:['x'],                 doc:'Partial derivative with respect to screen-space x.'},
    ddy:         {sig:'ddy(x)',              args:['x'],                 doc:'Partial derivative with respect to screen-space y.'},
    any:         {sig:'any(x)',              args:['x'],                 doc:'True if any component of x is non-zero.'},
    all:         {sig:'all(x)',              args:['x'],                 doc:'True if all components of x are non-zero.'},
    transpose:   {sig:'transpose(m)',        args:['m'],                 doc:'Transpose of matrix m.'},
    determinant: {sig:'determinant(m)',      args:['m'],                 doc:'Determinant of matrix m.'},
    clip:        {sig:'clip(x)',             args:['x'],                 doc:'Discards pixel if x < 0.'},
    fwidth:      {sig:'fwidth(x)',           args:['x'],                 doc:'abs(ddx(x)) + abs(ddy(x)).'},
    noise:       {sig:'noise(x)',            args:['x'],                 doc:'Perlin noise in [0,1].'},
    sincos:      {sig:'sincos(x, s, c)',     args:['x','s','c'],         doc:'Computes sin and cos simultaneously.'},
    atan2:       {sig:'atan2(y, x)',         args:['y','x'],             doc:'Arctangent of y/x using signs for quadrant.'},
    pow:         {sig:'pow(x, y)',           args:['x','y'],             doc:'x raised to power y.'},
    min:         {sig:'min(x, y)',           args:['x','y'],             doc:'Component-wise minimum.'},
    max:         {sig:'max(x, y)',           args:['x','y'],             doc:'Component-wise maximum.'},
    fmod:        {sig:'fmod(x, y)',          args:['x','y'],             doc:'Floating-point remainder of x/y.'},
    step:        {sig:'step(edge, x)',       args:['edge','x'],          doc:'0 if x < edge, else 1.'},
    dot:         {sig:'dot(x, y)',           args:['x','y'],             doc:'Dot product.'},
    cross:       {sig:'cross(x, y)',         args:['x','y'],             doc:'Cross product (float3 only).'},
    distance:    {sig:'distance(x, y)',      args:['x','y'],             doc:'Euclidean distance between points x and y.'},
    reflect:     {sig:'reflect(i, n)',       args:['i','n'],             doc:'Reflect incident vector i about normal n.'},
    mul:         {sig:'mul(x, y)',           args:['x','y'],             doc:'Matrix or vector multiply.'},
    ldexp:       {sig:'ldexp(x, exp)',       args:['x','exp'],           doc:'x × 2^exp.'},
    clamp:       {sig:'clamp(x, min, max)', args:['x','min','max'],     doc:'Clamps x to [min, max].'},
    lerp:        {sig:'lerp(x, y, s)',      args:['x','y','s'],         doc:'Linear interpolation: x + s*(y−x).'},
    smoothstep:  {sig:'smoothstep(min, max, x)', args:['min','max','x'],doc:'Smooth Hermite interpolation.'},
    mad:         {sig:'mad(m, a, b)',        args:['m','a','b'],         doc:'Multiply-add: m×a + b.'},
    refract:     {sig:'refract(i, n, eta)', args:['i','n','eta'],       doc:'Refraction vector.'},
    tex2D:       {sig:'tex2D(samp, uv)',     args:['samp','uv'],         doc:'Sample a 2D texture.'},
    tex2Dlod:    {sig:'tex2Dlod(samp, uvw)',args:['samp','uvw'],        doc:'Sample a 2D texture at explicit LOD.'},
    float2:      {sig:'float2(x, y)',        args:['x','y'],             doc:'2-component float vector.'},
    float3:      {sig:'float3(x, y, z)',     args:['x','y','z'],         doc:'3-component float vector.'},
    float4:      {sig:'float4(x, y, z, w)', args:['x','y','z','w'],     doc:'4-component float vector.'},
    int2:        {sig:'int2(x, y)',          args:['x','y'],             doc:'2-component int vector.'},
    int3:        {sig:'int3(x, y, z)',       args:['x','y','z'],         doc:'3-component int vector.'},
    int4:        {sig:'int4(x, y, z, w)',    args:['x','y','z','w'],     doc:'4-component int vector.'},
};

var VARS = [
    {label:'iTime',       detail:'float',  doc:'Elapsed time in seconds.'},
    {label:'iResolution', detail:'float2', doc:'Viewport resolution in pixels.'},
    {label:'iMouse',      detail:'float2', doc:'Mouse position in pixels.'},
];

// separate intrinsics (not constructors) for the tokenizer
var INTRINSIC_NAMES = Object.keys(FN).filter(function(k){
    return !/^(float|int|uint|bool|half)[234]?$/.test(k);
});
var VAR_NAMES = VARS.map(function(v){ return v.label; });

window._hlslRegisterIntelliSense = function(){

    // ── language registration ─────────────────────────────────────────────────
    monaco.languages.register({ id: 'hlsl' });

    monaco.languages.setLanguageConfiguration('hlsl', {
        comments:   { lineComment: '//', blockComment: ['/*', '*/'] },
        brackets:   [['{','}'],['[',']'],['(',')']],
        autoClosingPairs: [
            {open:'{', close:'}', notIn:['string','comment']},
            {open:'[', close:']', notIn:['string','comment']},
            {open:'(', close:')', notIn:['string','comment']},
            {open:'"', close:'"', notIn:['string']},
        ],
        surroundingPairs: [{open:'{',close:'}'},{open:'[',close:']'},{open:'(',close:')'},{open:'"',close:'"'}],
        indentationRules: {
            increaseIndentPattern: /^.*\{[^}]*$/,
            decreaseIndentPattern: /^\s*\}/,
        },
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/,
    });

    monaco.languages.setMonarchTokensProvider('hlsl', {
        defaultToken:  '',
        tokenPostfix:  '.hlsl',

        // ── token tables ─────────────────────────────────────
        keywords: [
            'if','else','for','while','do','return','break','continue',
            'struct','typedef','static','const','extern',
            'in','out','inout','uniform','discard',
            'cbuffer','tbuffer','register','packoffset','groupshared','shared',
            'linear','centroid','nointerpolation','noperspective','sample',
            'true','false',
        ],

        typeKeywords: [
            'void',
            'float','float1','float2','float3','float4',
            'float1x1','float1x2','float1x3','float1x4',
            'float2x1','float2x2','float2x3','float2x4',
            'float3x1','float3x2','float3x3','float3x4',
            'float4x1','float4x2','float4x3','float4x4',
            'int','int1','int2','int3','int4',
            'uint','uint1','uint2','uint3','uint4',
            'bool','bool1','bool2','bool3','bool4',
            'half','half1','half2','half3','half4',
            'double','dword','matrix','vector',
            'Texture2D','Texture2DArray','Texture2DMS','Texture3D',
            'TextureCube','TextureCubeArray',
            'RWTexture2D','RWTexture2DArray','RWTexture3D',
            'SamplerState','SamplerComparisonState',
            'Buffer','RWBuffer','StructuredBuffer','RWStructuredBuffer',
            'ByteAddressBuffer','RWByteAddressBuffer',
        ],

        builtins: INTRINSIC_NAMES,
        builtinVars: VAR_NAMES,

        operators: [
            '=','+=','-=','*=','/=','%=','&=','|=','^=','<<=','>>=',
            '==','!=','<','<=','>','>=',
            '&&','||','!',
            '+','-','*','/','%',
            '&','|','^','~','<<','>>',
            '++','--','?',':',
        ],
        symbols: /[=><!~?:&|+\-*\/\^%]+/,

        // ── tokenizer ─────────────────────────────────────────
        tokenizer: {
            root: [
                // preprocessor (must come before identifier rule)
                [/#\s*\w*/, 'keyword.directive'],

                // identifiers & keywords
                [/[a-zA-Z_]\w*/, { cases: {
                    '@typeKeywords': 'type',
                    '@keywords':     'keyword',
                    '@builtins':     'predefined',
                    '@builtinVars':  'variable.predefined',
                    '@default':      'identifier',
                }}],

                // whitespace / comments
                { include: '@whitespace' },

                // brackets
                [/[{}()\[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],

                // operators
                [/@symbols/, { cases: { '@operators': 'operator', '@default': '' }}],

                // numbers — float before int
                [/\d*\.\d+([eE][+\-]?\d+)?[fFhH]?/, 'number.float'],
                [/\d+\.[eE]?[fFhH]?/,                'number.float'],
                [/0[xX][0-9a-fA-F]+[uU]?/,           'number.hex'],
                [/\d+[uUlLfFhH]?/,                   'number'],

                // strings (e.g. #include "file")
                [/"([^"\\]|\\.)*"/, 'string'],
                [/<([^>]*)>/,       'string'],

                // delimiter
                [/[;,.]/, 'delimiter'],
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\*/,       'comment', '@comment'],
                [/\/\/.*$/,    'comment'],
            ],

            comment: [
                [/[^\/*]+/, 'comment'],
                [/\/\*/,    'comment', '@push'],
                [/\*\//,    'comment', '@pop'],
                [/[\/*]/,   'comment'],
            ],
        },
    });

    // ── theme ─────────────────────────────────────────────────────────────────
    monaco.editor.defineTheme('hlsl-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'keyword',            foreground: '569CD6' },
            { token: 'keyword.directive',  foreground: 'C586C0' },
            { token: 'type',               foreground: '4EC9B0' },
            { token: 'predefined',         foreground: 'DCDCAA' },
            { token: 'variable.predefined',foreground: '9CDCFE' },
            { token: 'number',             foreground: 'B5CEA8' },
            { token: 'number.float',       foreground: 'B5CEA8' },
            { token: 'number.hex',         foreground: 'B5CEA8' },
            { token: 'string',             foreground: 'CE9178' },
            { token: 'comment',            foreground: '6A9955', fontStyle: 'italic' },
            { token: 'operator',           foreground: 'D4D4D4' },
            { token: 'delimiter',          foreground: 'D4D4D4' },
        ],
        colors: {},
    });

    var lang = 'hlsl';

    // ── completion provider ───────────────────────────────────────────────────
    monaco.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: function(model, position){
            var word  = model.getWordUntilPosition(position);
            var range = {
                startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
                startColumn: word.startColumn,        endColumn:   word.endColumn
            };
            var s = [];

            Object.keys(FN).forEach(function(name){
                var fn = FN[name];
                var snippet = name + '(' +
                    fn.args.map(function(a,i){ return '${' + (i+1) + ':' + a + '}'; }).join(', ')
                    + ')$0';
                s.push({
                    label: name,
                    kind:  monaco.languages.CompletionItemKind.Function,
                    detail: fn.sig,
                    documentation: fn.doc,
                    insertText: snippet,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range
                });
            });

            VARS.forEach(function(v){
                s.push({
                    label: v.label,
                    kind:  monaco.languages.CompletionItemKind.Variable,
                    detail: v.detail,
                    documentation: v.doc,
                    insertText: v.label,
                    range: range
                });
            });

            // type keywords
            ['float','float2','float3','float4','int','int2','int3','int4',
             'bool','bool2','bool3','bool4','half','void','const','static',
             'in','out','inout','return','if','else','for','while','break',
             'continue','discard'].forEach(function(t){
                s.push({
                    label: t,
                    kind:  monaco.languages.CompletionItemKind.Keyword,
                    insertText: t,
                    range: range
                });
            });

            return {suggestions: s};
        }
    });

    // ── #include completion provider ──────────────────────────────────────────
    monaco.languages.registerCompletionItemProvider(lang, {
        triggerCharacters: ['"', '<'],
        provideCompletionItems: function(model, position){
            var lineText = model.getValueInRange({
                startLineNumber: position.lineNumber, startColumn: 1,
                endLineNumber:   position.lineNumber, endColumn:   position.column
            });
            var m = /^[ \t]*#include\s+["<]([^"<>]*)$/.exec(lineText);
            if(!m || !window._listIncludes) return {suggestions: []};
            var typed = m[1];
            var range = {
                startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
                startColumn: position.column - typed.length, endColumn: position.column
            };
            return {
                suggestions: window._listIncludes().map(function(name){
                    return {
                        label: name,
                        kind:  monaco.languages.CompletionItemKind.File,
                        detail: 'HLSL include',
                        insertText: name,
                        range: range
                    };
                })
            };
        }
    });

    // ── signature help provider ───────────────────────────────────────────────
    monaco.languages.registerSignatureHelpProvider(lang, {
        signatureHelpTriggerCharacters:   ['('],
        signatureHelpRetriggerCharacters: [','],
        provideSignatureHelp: function(model, position){
            var line = model.getValueInRange({
                startLineNumber: position.lineNumber, startColumn: 1,
                endLineNumber:   position.lineNumber, endColumn:   position.column
            });

            var depth = 0, parenCol = -1;
            for(var i = line.length - 1; i >= 0; i--){
                if     (line[i] === ')') depth++;
                else if(line[i] === '('){
                    if(depth === 0){ parenCol = i; break; }
                    depth--;
                }
            }
            if(parenCol < 0) return null;

            var nameMatch = line.slice(0, parenCol).match(/(\w+)\s*$/);
            if(!nameMatch || !FN[nameMatch[1]]) return null;
            var fn = FN[nameMatch[1]];

            var after = line.slice(parenCol + 1), activeParam = 0, d = 0;
            for(var i = 0; i < after.length; i++){
                if     (after[i] === '(') d++;
                else if(after[i] === ')') d--;
                else if(after[i] === ',' && d === 0) activeParam++;
            }

            return {
                value: {
                    signatures: [{
                        label: fn.sig,
                        documentation: {value: fn.doc},
                        parameters: fn.args.map(function(a){ return {label: a}; })
                    }],
                    activeSignature: 0,
                    activeParameter: Math.min(activeParam, fn.args.length - 1)
                },
                dispose: function(){}
            };
        }
    });
};

})();
