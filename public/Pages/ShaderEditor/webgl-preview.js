(function(){
    var canvas   = document.getElementById('glcanvas');
    var preview  = document.getElementById('preview-pane');
    var statusEl = document.getElementById('status');
    var fpsEl    = document.getElementById('fps-readout');
    var msEl     = document.getElementById('ms-readout');
    var statsEl  = document.getElementById('preview-stats');

    function setStatus(ok, msg){ statusEl.textContent=msg; statusEl.className=ok?'ok':'error'; }

    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    var activeProg = null, activeLoc = null, vs, buf;

    if(!gl){
        setStatus(false, 'WebGL not available');
    } else {
        var t0 = Date.now(), mx = 0, my = 0;
        vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
        gl.compileShader(vs);
        buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
        canvas.addEventListener('mousemove', function(e){
            var r=canvas.getBoundingClientRect();
            mx=(e.clientX-r.left)*canvas.width/r.width;
            my=canvas.height-(e.clientY-r.top)*canvas.height/r.height;
        });

        var smoothMs = 16.67, lastT = performance.now(), frameIdx = 0;
        (function loop(){
            setTimeout(loop, 0);
            var now = performance.now(), dt = now - lastT; lastT = now;
            smoothMs = smoothMs * 0.9 + dt * 0.1;
            if(++frameIdx % 10 === 0){
                fpsEl.textContent = Math.round(1000 / smoothMs) + ' fps';
                msEl.textContent  = smoothMs.toFixed(1) + ' ms';
            }
            if(!activeProg) return;
            gl.useProgram(activeProg);
            gl.bindBuffer(gl.ARRAY_BUFFER,buf);
            gl.enableVertexAttribArray(activeLoc.p);
            gl.vertexAttribPointer(activeLoc.p,2,gl.FLOAT,false,0,0);
            gl.uniform1f(activeLoc.iTime,       (Date.now()-t0)/1000);
            gl.uniform2f(activeLoc.iResolution, canvas.width,canvas.height);
            gl.uniform2f(activeLoc.iMouse,      mx,my);
            if(window._paramsBindUniforms) window._paramsBindUniforms(gl,activeProg);
            gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        })();
    }

    // ── canvas sizing ────────────────────────────────────────────────────────────
    var CANVAS_PAD = 20, squareMode = true;

    function checkStatsOverlap(){
        var cr=canvas.getBoundingClientRect(), sr=statsEl.getBoundingClientRect();
        statsEl.classList.toggle('canvas-over',
            cr.left<sr.right&&cr.right>sr.left&&cr.top<sr.bottom&&cr.bottom>sr.top);
    }

    function fitCanvas(){
        var w, h;
        if(squareMode){
            var s=Math.min(preview.clientWidth-CANVAS_PAD*2, preview.clientHeight-CANVAS_PAD*2);
            if(s<1) return;
            w=h=s;
        } else {
            w=preview.clientWidth; h=preview.clientHeight;
            if(w<1||h<1) return;
        }
        canvas.width=w; canvas.height=h;
        canvas.style.width=w+'px'; canvas.style.height=h+'px';
        if(gl) gl.viewport(0,0,w,h);
        checkStatsOverlap();
    }
    window.addEventListener('load', fitCanvas);
    window.addEventListener('resize', fitCanvas);

    // ── preview controls ─────────────────────────────────────────────────────────
    document.getElementById('square-btn').addEventListener('click', function(){
        squareMode = !squareMode;
        document.getElementById('sq-to-fill').style.display = squareMode ? 'block' : 'none';
        document.getElementById('sq-to-sq').style.display   = squareMode ? 'none'  : 'block';
        fitCanvas();
    });

    statsEl.addEventListener('click', function(){ this.classList.toggle('dimmed'); });

    document.getElementById('fullscreen-btn').addEventListener('click', function(){
        if(!document.fullscreenElement) preview.requestFullscreen();
        else document.exitFullscreen();
    });
    document.addEventListener('fullscreenchange', function(){
        var full = !!document.fullscreenElement;
        document.getElementById('fs-expand').style.display = full ? 'none'  : 'block';
        document.getElementById('fs-exit').style.display   = full ? 'block' : 'none';
        fitCanvas();
    });

    // ── divider drag ─────────────────────────────────────────────────────────────
    var wrap     = document.getElementById('shader-wrap');
    var divider  = document.getElementById('divider');
    var dragging = false;
    divider.addEventListener('mousedown', function(e){ dragging=true; e.preventDefault(); });
    document.addEventListener('mousemove', function(e){
        if(!dragging) return;
        var r = wrap.getBoundingClientRect();
        wrap.style.setProperty('--split', Math.max(15,Math.min(85,(e.clientX-r.left)/r.width*100))+'%');
        fitCanvas();
    });
    document.addEventListener('mouseup', function(){ dragging=false; });

    // ── compile ──────────────────────────────────────────────────────────────────
    window.compileShader = function(code){
        if(!gl) return;
        if(window._beginCompile) window._beginCompile();
        var params = window._paramsGetList ? window._paramsGetList() : [];
        try {
            var result = transpile(code, params);
            var glsl = result.glsl;
            var extraN = params.length + result.includeLines;
            var fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fs, glsl); gl.compileShader(fs);
            if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)){
                var e=gl.getShaderInfoLog(fs); gl.deleteShader(fs); throw e;
            }
            var p = gl.createProgram();
            gl.attachShader(p,vs); gl.attachShader(p,fs); gl.linkProgram(p);
            gl.detachShader(p,fs); gl.deleteShader(fs);
            if(!gl.getProgramParameter(p, gl.LINK_STATUS)) throw gl.getProgramInfoLog(p);
            if(activeProg) gl.deleteProgram(activeProg);
            activeProg = p;
            activeLoc = {
                p:           gl.getAttribLocation(p,'p'),
                iTime:       gl.getUniformLocation(p,'iTime'),
                iResolution: gl.getUniformLocation(p,'iResolution'),
                iMouse:      gl.getUniformLocation(p,'iMouse')
            };
            setStatus(true, 'OK');
            document.getElementById('inst-readout').textContent = '~'+countOps(glsl)+' ops';
        } catch(e){
            setStatus(false, fixLines(String(e), extraN).split('\n')[0]);
            document.getElementById('inst-readout').textContent = '-- ops';
        } finally {
            if(window._endCompile) window._endCompile();
        }
    };
})();
