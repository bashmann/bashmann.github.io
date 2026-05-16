<!DOCTYPE html>
<?php
$root = $_SERVER['DOCUMENT_ROOT'];
$exDir = $root . '/public/Pages/ShaderEditor/examples';
$examples = [];
foreach(glob($exDir . '/*.hlsl') ?: [] as $f)
    $examples[] = ['name' => pathinfo($f, PATHINFO_FILENAME), 'code' => file_get_contents($f)];
?>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ben Ashcroft - HLSL Editor</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/public/Pages/ShaderEditor/colorpicker.css">
    <link rel="stylesheet" href="/public/Pages/ShaderEditor/shadereditor.css">
</head>
<body>
<?php include_once($root . '/topbar.html'); ?>

<div id="shader-wrap">
    <div id="preview-pane">
        <canvas id="glcanvas"></canvas>
        <button id="square-btn" title="Toggle square / fill">
            <svg id="sq-to-fill" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
                <rect x="0.75" y="2.25" width="10.5" height="7.5" rx="0.5"/>
            </svg>
            <svg id="sq-to-sq" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" style="display:none">
                <rect x="2.25" y="2.25" width="7.5" height="7.5"/>
            </svg>
        </button>
        <button id="fullscreen-btn" title="Fullscreen">
            <svg id="fs-expand" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <polyline points="0,3 0,0 3,0"/><polyline points="9,0 12,0 12,3"/>
                <polyline points="12,9 12,12 9,12"/><polyline points="3,12 0,12 0,9"/>
            </svg>
            <svg id="fs-exit" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="display:none">
                <polyline points="4,0 4,4 0,4"/><polyline points="8,0 8,4 12,4"/>
                <polyline points="12,8 8,8 8,12"/><polyline points="0,8 4,8 4,12"/>
            </svg>
        </button>
        <div id="preview-stats">
            <span id="fps-readout">-- fps</span>
            <span id="ms-readout">-- ms</span>
            <span id="inst-readout">-- ops</span>
        </div>
    </div>
    <div id="divider"></div>
    <div id="editor-pane">
        <div id="editor-body">
            <div id="editor-col">
                <div id="monaco-mount">
                    <div id="editor-loading">Loading editor…</div>
                </div>
            </div>
            <div id="examples-panel">
                <div class="examples-header">Examples</div>
                <?php foreach($examples as $i => $ex): ?>
                <div class="example-item" data-idx="<?= $i ?>">
                    <?= htmlspecialchars($ex['name']) ?>
                </div>
                <?php endforeach; ?>
                <div class="examples-header saves-hd">
                    Saves
                    <button id="new-save-btn" title="Save current shader">&#43;</button>
                </div>
                <div id="saves-list">
                    <div id="saves-empty">No saves yet</div>
                </div>
            </div>
        </div>
        <div id="params-panel">
            <div id="params-header">
                <span>Parameters</span>
                <span id="params-count"></span>
                <svg id="params-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="2,3 5,7 8,3"/>
                </svg>
            </div>
            <div id="params-body"></div>
        </div>
        <div id="editor-footer">
            <span id="status">Ready</span>
            <button id="preview-stop-btn" style="display:none" onclick="if(window._previewStop) window._previewStop()">&#9632; Stop Preview</button>
            <button id="save-btn">Save</button>
            <button id="load-btn">Load</button>
            <input type="file" id="load-file" accept=".hlsl,.txt" style="display:none">
            <label><input type="checkbox" id="live-toggle" checked> Live compile</label>
            <button id="compile-btn">&#9654; Compile</button>
        </div>
    </div>
</div>

<?php include($root . '/public/Pages/ShaderEditor/colorpicker.php'); ?>

<script>var EXAMPLES = <?= json_encode($examples, JSON_HEX_TAG) ?>;</script>
<script src="/public/Pages/ShaderEditor/hlsl-transpiler.js"></script>
<script src="/public/Pages/ShaderEditor/webgl-preview.js"></script>
<script>
var _savesCache = null;
window._beginCompile   = function(){ _savesCache = getSaves(); };
window._endCompile     = function(){ _savesCache = null; };
window._resolveInclude = function(name){
    var key = name.toLowerCase();
    var saves = _savesCache || getSaves();
    for(var i = 0; i < saves.length; i++)
        if(saves[i].name.toLowerCase() === key) return saves[i].code;
    for(var i = 0; i < EXAMPLES.length; i++)
        if(EXAMPLES[i].name.toLowerCase() === key) return EXAMPLES[i].code;
    return null;
};
window._listIncludes = function(){
    var names = [];
    var saves = getSaves();
    for(var i = 0; i < saves.length; i++) names.push(saves[i].name);
    for(var i = 0; i < EXAMPLES.length; i++) names.push(EXAMPLES[i].name);
    return names;
};
</script>
<script>
// ── default shader ─────────────────────────────────────────────────────────────
var _defEx = EXAMPLES.find(function(e){ return e.name.toLowerCase() === 'logo'; }) || EXAMPLES[0];
var DEFAULT = _defEx.code;

function stripParamLines(code){
    return code.replace(/^[^\n]*\/\/[ \t]*@param\b[^\n]*\n?/gm, '');
}

compileShader(DEFAULT);

// ── examples panel ─────────────────────────────────────────────────────────────
var ed = null;
var lastLoadedCode = stripParamLines(DEFAULT);

document.querySelectorAll('.example-item').forEach(function(item){
    item.addEventListener('click', function(){
        var ex = EXAMPLES[parseInt(item.dataset.idx, 10)];
        var current = ed ? ed.getValue() : DEFAULT;
        if(current !== lastLoadedCode){
            if(!confirm('Load "' + ex.name + '"?\nUnsaved changes will be lost.')) return;
        }
        if(window._previewStop) window._previewStop();
        if(window._paramsAutoDetect) window._paramsAutoDetect(ex.code);
        if(ed) ed.setValue(stripParamLines(ex.code));
        lastLoadedCode = stripParamLines(ex.code);
        compileShader(ex.code);
        document.querySelectorAll('.example-item').forEach(function(el){ el.classList.remove('active'); });
        item.classList.add('active');
    });
});

// ── saves ──────────────────────────────────────────────────────────────────────
var SAVES_KEY = 'hlsl_saves';

function getSaves(){
    try{ return JSON.parse(localStorage.getItem(SAVES_KEY))||[]; }catch(e){ return []; }
}
function setSaves(s){
    try{ localStorage.setItem(SAVES_KEY,JSON.stringify(s)); }
    catch(e){
        var st = document.getElementById('status');
        if(st){ st.textContent = 'Save failed: storage quota exceeded'; st.className = 'error'; }
    }
}

function currentParams(){
    return window._paramsGetList ? window._paramsGetList().map(function(p){
        return {name:p.name, type:p.type, value:p.value.slice()};
    }) : [];
}

function makeParamDecl(p){
    if(p.type === 'texture') return 'Texture2D ' + p.name + '; // @param';
    if(p.type === 'int')     return 'int '   + p.name + ' = ' + Math.round(p.value[0]) + '; // @param';
    if(p.type === 'float')   return 'float ' + p.name + ' = ' + p.value[0].toFixed(3)  + '; // @param';
    var vals = p.value.map(function(v){ return v.toFixed(3); }).join(', ');
    return p.type + ' ' + p.name + ' = ' + p.type + '(' + vals + '); // @param';
}

function codeWithParams(code){
    var params = window._paramsGetList ? window._paramsGetList() : [];
    if(!params.length) return code;
    var toInject = [];
    params.forEach(function(p){
        var decl = makeParamDecl(p);
        var re = new RegExp(
            '^([ \\t]*)(?:(?:static|const)[ \\t]+)?' +
            '(?:Texture2D(?:<[^>]+>)?|float[234]?|int)[ \\t]+' +
            escRe(p.name) + '[^\\n]*\\/\\/[^\\n]*@param\\b', 'm'
        );
        if(re.test(code)){ code = code.replace(re, '$1' + decl); }
        else { toInject.push(decl); }
    });
    if(toInject.length){
        var m = code.match(/^((?:\/\/[^\n]*\n)*)/);
        var pos = m ? m[1].length : 0;
        code = code.slice(0, pos) + toInject.join('\n') + '\n' + code.slice(pos);
    }
    return code;
}

function stripPreviewLine(code){
    return code.replace(/^[^\n]*\/\/[ \t]*@preview\b[^\n]*\n?/gm, '');
}
function downloadHlsl(name, code){
    code = codeWithParams(stripPreviewLine(code));
    var blob = new Blob([code],{type:'text/plain'});
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url; a.download = name.replace(/[^\w\-]/g,'_')+'.hlsl';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
}

function loadSave(save){
    var cur = ed ? ed.getValue() : DEFAULT;
    if(cur !== lastLoadedCode && !confirm('Load "'+save.name+'"?\nUnsaved changes will be lost.')) return;
    if(save.params && save.params.length){
        if(window._paramsRestore) window._paramsRestore(save.params);
    } else {
        if(window._paramsAutoDetect) window._paramsAutoDetect(save.code);
    }
    if(ed) ed.setValue(stripParamLines(save.code));
    lastLoadedCode = stripParamLines(save.code);
    compileShader(save.code);
    document.querySelectorAll('.example-item').forEach(function(el){ el.classList.remove('active'); });
}

function renderSaves(){
    var list  = document.getElementById('saves-list');
    var empty = document.getElementById('saves-empty');
    var saves = getSaves();
    Array.from(list.querySelectorAll('.save-item')).forEach(function(el){ el.remove(); });
    if(saves.length === 0){ empty.style.display=''; return; }
    empty.style.display = 'none';
    saves.forEach(function(save){
        var item = document.createElement('div');
        item.className = 'save-item';

        var nm = document.createElement('span');
        nm.className = 'save-name'; nm.textContent = save.name; nm.title = save.name;
        nm.addEventListener('click', function(){ loadSave(save); });

        var ow = document.createElement('button');
        ow.className='save-ow'; ow.title='Overwrite with current shader'; ow.innerHTML='&#8593;';
        ow.addEventListener('click', function(){
            if(!confirm('Overwrite "'+save.name+'" with current shader?')) return;
            var s = getSaves();
            for(var i=0;i<s.length;i++){
                if(s[i].ts===save.ts){
                    s[i].code=ed?ed.getValue():DEFAULT;
                    s[i].params=currentParams();
                    break;
                }
            }
            setSaves(s);
            renderSaves();
        });

        var dl = document.createElement('button');
        dl.className='save-dl'; dl.title='Download'; dl.innerHTML='&#8595;';
        dl.addEventListener('click', function(){ downloadHlsl(save.name, save.code); });

        var rm = document.createElement('button');
        rm.className='save-rm'; rm.title='Delete'; rm.innerHTML='&times;';
        rm.addEventListener('click', function(){
            var s=getSaves();
            s.splice(s.findIndex(function(x){return x.ts===save.ts;}),1);
            setSaves(s); renderSaves();
        });

        item.appendChild(nm); item.appendChild(ow); item.appendChild(dl); item.appendChild(rm);
        list.appendChild(item);
    });
}

function doSave(){
    var code = stripPreviewLine(ed ? ed.getValue() : DEFAULT);
    var name = prompt('Save name:', 'Shader '+(getSaves().length+1));
    if(!name || !name.trim()) return;
    name = name.trim();
    var saves = getSaves();
    saves.unshift({name:name, code:code, params:currentParams(), ts:Date.now()});
    setSaves(saves);
    renderSaves();
    lastLoadedCode = code;
}

document.getElementById('save-btn').addEventListener('click', doSave);
document.getElementById('new-save-btn').addEventListener('click', doSave);

document.getElementById('load-btn').addEventListener('click', function(){
    document.getElementById('load-file').value = '';
    document.getElementById('load-file').click();
});
document.getElementById('load-file').addEventListener('change', function(){
    var file = this.files[0];
    if(!file) return;
    var cur = ed ? ed.getValue() : DEFAULT;
    if(cur !== lastLoadedCode && !confirm('Load "' + file.name + '"?\nUnsaved changes will be lost.')) return;
    var reader = new FileReader();
    reader.onload = function(e){
        var code = e.target.result;
        if(window._paramsAutoDetect) window._paramsAutoDetect(code);
        if(ed) ed.setValue(stripParamLines(code));
        lastLoadedCode = stripParamLines(code);
        compileShader(code);
        document.querySelectorAll('.example-item').forEach(function(el){ el.classList.remove('active'); });
        var name = file.name.replace(/\.hlsl$/i, '');
        var saves = getSaves();
        saves.unshift({name: name, code: code, params: currentParams(), ts: Date.now()});
        setSaves(saves);
        renderSaves();
    };
    reader.readAsText(file);
});

renderSaves();

// ── Monaco async ───────────────────────────────────────────────────────────────
var CDN = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs';
var tag = document.createElement('script');
tag.src = CDN + '/loader.min.js';
tag.onload = function(){
    require.config({paths:{vs:CDN}});
    require(['vs/editor/editor.main'], function(){
        document.getElementById('editor-loading').style.display = 'none';
        window._hlslRegisterIntelliSense();
        ed = monaco.editor.create(document.getElementById('monaco-mount'), {
            value: stripParamLines(DEFAULT), language:'hlsl', theme:'hlsl-dark',
            fontSize:14, minimap:{enabled:false},
            scrollBeyondLastLine:false, automaticLayout:true,
            padding:{top:12},
            quickSuggestions:{other:true,comments:false,strings:false},
            parameterHints:{enabled:true,cycle:true},
            suggestOnTriggerCharacters:true
        });
        window._cpSetEditor(ed);
        window._paramsSetEditor(ed);
        window._paramsAutoDetect(_defEx.code);
        document.querySelectorAll('.example-item').forEach(function(el){
            el.classList.toggle('active', EXAMPLES[parseInt(el.dataset.idx,10)] === _defEx);
        });
        function getCompileCode(){ var c = ed.getValue(); return window._injectPreview ? window._injectPreview(c) : c; }
        window._paramsRecompile = function(){ compileShader(getCompileCode()); };
        compileShader(getCompileCode());
        var deb = null;
        ed.onDidChangeModelContent(function(){
            if(!document.getElementById('live-toggle').checked) return;
            clearTimeout(deb);
            deb = setTimeout(function(){ compileShader(getCompileCode()); }, 600);
        });
        document.getElementById('compile-btn').onclick = function(){
            compileShader(getCompileCode());
        };
    });
};
tag.onerror = function(){ document.getElementById('editor-loading').textContent = 'Editor CDN unavailable'; };
document.head.appendChild(tag);
</script>

<script src="/public/Pages/ShaderEditor/hlsl-intellisense.js"></script>
<script src="/public/Pages/ShaderEditor/hlsl-params.js"></script>
<script src="/public/Pages/ShaderEditor/colorpicker.js"></script>
<script src="/app.js"></script>

</body>
</html>
