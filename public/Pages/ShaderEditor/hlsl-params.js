(function(){
    var params = [];

    // ── drag-scrub for number inputs ──────────────────────────────────────────
    var scrub = {active:false, input:null, startX:0, startVal:0, moved:false, step:0.005};

    document.addEventListener('mousemove', function(e){
        if(!scrub.active) return;
        var dx = e.clientX - scrub.startX;
        if(Math.abs(dx) > 2) scrub.moved = true;
        if(!scrub.moved) return;
        var s  = e.shiftKey ? 0.1 : 1;
        if(scrub.isInt){
            scrub.input.value = Math.round(scrub.startVal + dx * 0.1 * s);
        } else {
            scrub.input.value = (scrub.startVal + dx * scrub.step * s).toFixed(3);
        }
        scrub.input.dispatchEvent(new Event('change'));
    });
    document.addEventListener('mouseup', function(){
        if(!scrub.active) return;
        scrub.active = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        if(!scrub.moved){ scrub.input.focus(); scrub.input.select(); }
        scrub.input = null;
    });

    function addScrub(input, isInt){
        input.addEventListener('mousedown', function(e){
            if(e.button !== 0) return;
            scrub.active   = true;
            scrub.input    = input;
            scrub.startX   = e.clientX;
            scrub.startVal = parseFloat(input.value) || 0;
            scrub.moved    = false;
            scrub.isInt    = !!isInt;
            e.preventDefault();
            document.body.style.cursor     = 'ew-resize';
            document.body.style.userSelect = 'none';
        });
    }

    window._paramsSetEditor = function(ed){
        ed.addAction({
            id: 'parameterize-var',
            label: 'Parameterize',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: function(ed){
                var pos  = ed.getPosition();
                var word = ed.getModel().getWordAtPosition(pos);
                if(!word) return;
                var name = word.word;
                if(params.some(function(p){ return p.name===name; })) return;
                var info  = findGlobalDecl(ed.getModel(), name);
                var type  = info ? info.type  : 'float';
                var value = info ? info.value : defaultVal(type);
                addParam(name, type, value);
                if(window._paramsRecompile) window._paramsRecompile();
            }
        });

        var _previewState = null;
        var _previewDecors = [];

        window._injectPreview = function(code){
            if(!_previewState) return code;
            var target = _previewState.lineContent.trim();
            var lines  = code.split('\n');
            for(var i = 0; i < lines.length; i++){
                if(lines[i].trim() === target){
                    var indent = (lines[i].match(/^(\s*)/) || ['',''])[1];
                    lines.splice(i + 1, 0, indent + _previewState.returnStmt);
                    break;
                }
            }
            return lines.join('\n');
        };

        window._previewStop = function(){
            if(!_previewState) return;
            _previewState = null;
            _previewDecors = ed.deltaDecorations(_previewDecors, []);
            window._injectPreview = function(c){ return c; };
            document.getElementById('monaco-mount').classList.remove('previewing');
            document.getElementById('preview-stop-btn').style.display = 'none';
            if(window._paramsRecompile) window._paramsRecompile();
        };

        ed.addAction({
            id: 'preview-variable',
            label: 'Preview Variable',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.6,
            run: function(ed){
                var pos  = ed.getPosition();
                var word = ed.getModel().getWordAtPosition(pos);
                if(!word) return;
                var name = word.word;
                var info = findGlobalDecl(ed.getModel(), name);
                var type = info ? info.type : null;
                if(!type){
                    var m = new RegExp('\\b(float[234]?|int)[ \\t]+' + escRe(name) + '[ \\t]*[=;,(\\[]').exec(ed.getModel().getValue());
                    type = m ? m[1] : 'float';
                }
                var expr;
                switch(type){
                    case 'float4': expr = name; break;
                    case 'float3': expr = 'float4(' + name + ', 1.0)'; break;
                    case 'float2': expr = 'float4(' + name + ', 0.0, 1.0)'; break;
                    default:       expr = 'float4(' + name + ', ' + name + ', ' + name + ', 1.0)'; break;
                }
                _previewState = {
                    lineContent: ed.getModel().getLineContent(pos.lineNumber),
                    returnStmt:  'return ' + expr + ';'
                };
                window._injectPreview = function(code){
                    if(!_previewState) return code;
                    var target = _previewState.lineContent.trim();
                    var lines  = code.split('\n');
                    for(var i = 0; i < lines.length; i++){
                        if(lines[i].trim() === target){
                            var ind = (lines[i].match(/^(\s*)/) || ['',''])[1];
                            lines.splice(i + 1, 0, ind + _previewState.returnStmt);
                            break;
                        }
                    }
                    return lines.join('\n');
                };
                _previewDecors = ed.deltaDecorations(_previewDecors, [{
                    range: new monaco.Range(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn),
                    options: { inlineClassName: 'preview-var-highlight' }
                }]);
                document.getElementById('monaco-mount').classList.add('previewing');
                document.getElementById('preview-stop-btn').style.display = '';
                if(window._paramsRecompile) window._paramsRecompile();
            }
        });
    };

    window._paramsGetList = function(){ return params; };

    window._paramsBindUniforms = function(gl, prog){
        var texUnit = 0;
        params.forEach(function(p){
            if(p._locProg !== prog){ p._loc = gl.getUniformLocation(prog, 'u_'+p.name); p._locProg = prog; }
            var loc = p._loc;
            if(loc === null) return;
            if(p.type === 'texture'){
                var unit = texUnit++;
                if(!p.img || !p.img.complete) return;
                if(!p.glTex){ p.glTex = gl.createTexture(); p.dirty = true; }
                if(p.dirty){
                    gl.bindTexture(gl.TEXTURE_2D, p.glTex);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, p.img);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    p.dirty = false;
                }
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, p.glTex);
                gl.uniform1i(loc, unit);
                return;
            }
            switch(p.type){
                case 'int':    gl.uniform1i(loc, Math.round(p.value[0])); break;
                case 'float':  gl.uniform1f(loc, p.value[0]); break;
                case 'float2': gl.uniform2f(loc, p.value[0], p.value[1]); break;
                case 'float3': gl.uniform3f(loc, p.value[0], p.value[1], p.value[2]); break;
                case 'float4': gl.uniform4f(loc, p.value[0], p.value[1], p.value[2], p.value[3]); break;
            }
        });
    };

    window._paramsRecompile = null;

    window._paramsClearAll = function(){
        params.forEach(function(p){
            if(p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
        });
        params = [];
        updateCount();
        document.getElementById('params-panel').style.display = 'none';
    };

    window._paramsRestore = function(list){
        window._paramsClearAll();
        if(!list || !list.length) return;
        list.forEach(function(p){
            addParam(p.name, p.type, p.value ? p.value.slice() : defaultVal(p.type));
        });
    };

    window._paramsAutoDetect = function(code){
        window._paramsClearAll();
        var re = /^[ \t]*(Texture2D(?:<[^>]+>)?|float[234]?|int)[ \t]+(\w+)[ \t]*(?:=([^;]+))?;[^\n]*\/\/[ \t]*@param\b/gm;
        var m;
        while((m = re.exec(code)) !== null){
            var rawType = m[1], name = m[2];
            var type = /^Texture2D/.test(rawType) ? 'texture' : rawType;
            var val = defaultVal(type);
            if(type !== 'texture' && m[3]){
                var init = m[3].replace(/\b(?:float|int|bool)[234]?\s*\(/g, '(');
                var nums = init.match(/[+-]?(?:\d+\.?\d*|\.\d+)/g) || [];
                var n = (type === 'float' || type === 'int') ? 1 : parseInt(type.slice(5));
                if(nums.length === 1 && n > 1){ for(var i=0;i<n;i++) val[i]=parseFloat(nums[0]); }
                else { for(var i=0;i<n&&i<nums.length;i++) val[i]=parseFloat(nums[i]); }
            }
            addParam(name, type, val);
        }
    };

    function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

    function findGlobalDecl(model, name){
        var text = model.getValue();
        var re = new RegExp(
            '(?:^|\\n)[ \\t]*(?:(?:static|const)[ \\t]+)?' +
            '(Texture2D(?:<[^>]+>)?|float[234]?|int)[ \\t]+' +
            escRe(name) + '[ \\t]*(?:=([^;]+))?;'
        );
        var m = re.exec(text);
        if(!m) return null;
        var type = /^Texture2D/.test(m[1]) ? 'texture' : m[1];
        var val  = defaultVal(type);
        if(type !== 'texture' && m[2]){
            var init = m[2].replace(/\b(?:float|int|bool)[234]?\s*\(/g, '(');
            var nums = init.match(/[+-]?(?:\d+\.?\d*|\.\d+)/g) || [];
            var n = (type === 'float' || type === 'int') ? 1 : parseInt(type.slice(5));
            if(nums.length === 1 && n > 1){
                for(var i = 0; i < n; i++) val[i] = parseFloat(nums[0]);
            } else {
                for(var i = 0; i < n && i < nums.length; i++) val[i] = parseFloat(nums[i]);
            }
        }
        return {type: type, value: val};
    }

    function defaultVal(type){
        switch(type){
            case 'int':     return [1];
            case 'float':   return [0.5];
            case 'float2':  return [0, 0];
            case 'float3':  return [0.5, 0.5, 0.5];
            case 'float4':  return [0.5, 0.5, 0.5, 1];
            case 'texture': return [];
        }
        return [0];
    }

    function addParam(name, type, value){
        var p = {name: name, type: type, value: value.slice()};
        params.push(p);
        p.el = buildWidget(p);
        document.getElementById('params-body').appendChild(p.el);
        showPanel();
        updateCount();
    }

    function removeParam(name){
        var idx = params.findIndex(function(p){ return p.name === name; });
        if(idx < 0) return;
        var p = params.splice(idx, 1)[0];
        if(p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
        updateCount();
        if(params.length === 0) document.getElementById('params-panel').style.display = 'none';
        if(window._paramsRecompile) window._paramsRecompile();
    }

    function showPanel(){
        var panel = document.getElementById('params-panel');
        panel.style.display = 'flex';
        panel.classList.remove('collapsed');
    }

    function updateCount(){
        var el = document.getElementById('params-count');
        if(el) el.textContent = params.length ? '(' + params.length + ')' : '';
    }

    function rebuildCtrl(p){
        var old = p.el.querySelector('.param-ctrl');
        p._nums = null;
        var ctrl = document.createElement('div');
        ctrl.className = 'param-ctrl';
        if(p.type === 'float'){
            buildFloatCtrl(ctrl, p);
        } else if(p.type === 'int'){
            buildIntCtrl(ctrl, p);
        } else if(p.type === 'float2'){
            ['x','y'].forEach(function(lbl, i){ buildNumCtrl(ctrl, p, i, lbl); });
        } else if(p.type === 'texture'){
            buildTextureCtrl(ctrl, p);
        } else {
            buildColorCtrl(ctrl, p);
        }
        p.el.replaceChild(ctrl, old);
    }

    function buildWidget(p){
        var row = document.createElement('div');
        row.className = 'param-row';

        var hd = document.createElement('div');
        hd.className = 'param-row-hd';

        var sel = document.createElement('select');
        sel.className = 'param-type-sel';
        ['int','float','float2','float3','float4','texture'].forEach(function(t){
            var opt = document.createElement('option');
            opt.value = opt.textContent = t;
            if(t === p.type) opt.selected = true;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', function(e){
            e.stopPropagation();
            p.type  = sel.value;
            p.value = defaultVal(p.type);
            rebuildCtrl(p);
            if(window._paramsRecompile) window._paramsRecompile();
        });

        var nm = document.createElement('span');
        nm.className = 'param-name';
        nm.textContent = p.name;

        var rm = document.createElement('button');
        rm.className = 'param-rm';
        rm.innerHTML = '&times;';
        rm.title = 'Remove';
        rm.addEventListener('click', function(){ removeParam(p.name); });

        hd.appendChild(sel); hd.appendChild(nm); hd.appendChild(rm);
        row.appendChild(hd);

        var ctrl = document.createElement('div');
        ctrl.className = 'param-ctrl';
        if(p.type === 'float'){
            buildFloatCtrl(ctrl, p);
        } else if(p.type === 'int'){
            buildIntCtrl(ctrl, p);
        } else if(p.type === 'float2'){
            ['x','y'].forEach(function(lbl, i){ buildNumCtrl(ctrl, p, i, lbl); });
        } else if(p.type === 'texture'){
            buildTextureCtrl(ctrl, p);
        } else {
            buildColorCtrl(ctrl, p);
        }

        row.appendChild(ctrl);
        return row;
    }

    function buildFloatCtrl(parent, p){
        var wrap = document.createElement('div');
        wrap.className = 'param-float-wrap';

        var slider = document.createElement('input');
        slider.type = 'range'; slider.min = 0; slider.max = 1; slider.step = 0.001;
        slider.value = p.value[0];
        slider.className = 'param-slider';

        var num = document.createElement('input');
        num.type = 'number'; num.step = 0.001;
        num.value = p.value[0].toFixed(3);
        num.className = 'param-num';

        slider.addEventListener('input', function(){
            p.value[0] = parseFloat(slider.value);
            num.value = p.value[0].toFixed(3);
        });
        num.addEventListener('change', function(){
            var v = parseFloat(num.value);
            if(isNaN(v)) return;
            p.value[0] = v;
            slider.value = Math.max(0, Math.min(1, v));
        });
        addScrub(num);

        wrap.appendChild(slider); wrap.appendChild(num);
        parent.appendChild(wrap);
    }

    function buildIntCtrl(parent, p){
        var wrap = document.createElement('div');
        wrap.className = 'param-float-wrap';

        var slider = document.createElement('input');
        slider.type = 'range'; slider.min = 0; slider.max = 100; slider.step = 1;
        slider.value = Math.round(p.value[0]);
        slider.className = 'param-slider';

        var num = document.createElement('input');
        num.type = 'number'; num.step = 1;
        num.value = Math.round(p.value[0]);
        num.className = 'param-num';

        slider.addEventListener('input', function(){
            p.value[0] = parseInt(slider.value);
            num.value = p.value[0];
        });
        num.addEventListener('change', function(){
            var v = parseInt(num.value);
            if(isNaN(v)) return;
            p.value[0] = v;
            slider.value = Math.max(0, Math.min(100, v));
        });
        addScrub(num, true);

        wrap.appendChild(slider); wrap.appendChild(num);
        parent.appendChild(wrap);
    }

    function buildNumCtrl(parent, p, idx, label){
        var wrap = document.createElement('div');
        wrap.className = 'param-num-wrap';
        var lbl = document.createElement('span');
        lbl.className = 'param-num-lbl';
        lbl.textContent = label;
        var num = document.createElement('input');
        num.type = 'number'; num.step = 0.001;
        num.value = p.value[idx].toFixed(3);
        num.className = 'param-num';
        num.addEventListener('change', function(){
            var v = parseFloat(num.value);
            if(!isNaN(v)) p.value[idx] = v;
        });
        addScrub(num);
        wrap.appendChild(lbl); wrap.appendChild(num);
        parent.appendChild(wrap);
    }

    function buildTextureCtrl(parent, p){
        var wrap = document.createElement('div');
        wrap.className = 'param-tex-wrap';

        var thumb = document.createElement('div');
        thumb.className = 'param-tex-thumb';
        thumb.title = 'Click to load image';

        if(p.img && p.img.complete && p.img.naturalWidth){
            var prev = document.createElement('img');
            prev.src = p.imgUrl;
            prev.className = 'param-tex-preview';
            thumb.appendChild(prev);
            p._texPreview = prev;
        } else {
            p._texPreview = null;
        }

        var fileIn = document.createElement('input');
        fileIn.type = 'file'; fileIn.accept = 'image/*';
        fileIn.style.display = 'none';

        var btn = document.createElement('button');
        btn.className = 'param-tex-load';
        btn.textContent = p.img ? 'Change' : 'Load Image';

        function loadFile(file){
            if(!file) return;
            var url = URL.createObjectURL(file);
            var image = new Image();
            image.onload = function(){
                if(p.imgUrl) URL.revokeObjectURL(p.imgUrl);
                p.imgUrl = url; p.img = image; p.dirty = true;
                btn.textContent = 'Change';
                if(!p._texPreview){
                    p._texPreview = document.createElement('img');
                    p._texPreview.className = 'param-tex-preview';
                    thumb.appendChild(p._texPreview);
                }
                p._texPreview.src = url;
                if(window._paramsRecompile) window._paramsRecompile();
            };
            image.src = url;
        }

        fileIn.addEventListener('change', function(){ loadFile(fileIn.files[0]); });
        btn.addEventListener('click', function(){ fileIn.click(); });
        thumb.addEventListener('click', function(){ fileIn.click(); });

        wrap.appendChild(thumb); wrap.appendChild(btn); wrap.appendChild(fileIn);
        parent.appendChild(wrap);
    }

    function buildColorCtrl(parent, p){
        var swatch = document.createElement('div');
        swatch.className = 'param-color-swatch';
        refreshSwatch(swatch, p);

        swatch.addEventListener('click', function(){
            var a = p.type === 'float4' ? p.value[3] : 1;
            window._cpOpenForParam(swatch, p.type === 'float4' ? 4 : 3,
                p.value[0], p.value[1], p.value[2], a,
                function(r, g, b, al){
                    p.value[0] = r; p.value[1] = g; p.value[2] = b;
                    if(p.type === 'float4') p.value[3] = al;
                    refreshSwatch(swatch, p);
                    if(p._nums) p._nums.forEach(function(inp, i){ inp.value = p.value[i].toFixed(3); });
                });
        });
        parent.appendChild(swatch);

        var numsWrap = document.createElement('div');
        numsWrap.className = 'param-color-nums';
        var lbls = p.type === 'float4' ? ['r','g','b','a'] : ['r','g','b'];
        p._nums = [];
        lbls.forEach(function(lbl, i){
            var inp = document.createElement('input');
            inp.type = 'number'; inp.step = 0.001; inp.min = 0; inp.max = 1;
            inp.value = p.value[i].toFixed(3);
            inp.className = 'param-num param-color-num';
            inp.title = lbl;
            inp.addEventListener('change', function(){
                var v = Math.max(0, Math.min(1, parseFloat(inp.value) || 0));
                p.value[i] = v; inp.value = v.toFixed(3);
                refreshSwatch(swatch, p);
            });
            addScrub(inp);
            numsWrap.appendChild(inp);
            p._nums.push(inp);
        });
        parent.appendChild(numsWrap);
    }

    function refreshSwatch(swatch, p){
        var r = Math.round(p.value[0]*255), g = Math.round(p.value[1]*255), b = Math.round(p.value[2]*255);
        var a = p.type === 'float4' ? p.value[3] : 1;
        swatch.style.background = 'rgba('+r+','+g+','+b+','+a+')';
    }

    document.getElementById('params-header').addEventListener('click', function(){
        document.getElementById('params-panel').classList.toggle('collapsed');
    });
})();
