(function(){
    var cp={h:0,s:0,v:1,a:1}, cpType=3, cpRange=null, ED=null;
    var swatchEl=document.getElementById('cpInlineSwatch');
    var popupEl =document.getElementById('cpPopup');
    var wCvs=document.getElementById('cpWheel'),    wCtx=wCvs.getContext('2d');
    var sCvs=document.getElementById('cpSCanvas'),  sCtx=sCvs.getContext('2d');
    var vhCvs=document.getElementById('cpVHCanvas'),vhCtx=vhCvs.getContext('2d');
    var aCvs=document.getElementById('cpACanvas'),  aCtx=aCvs.getContext('2d');
    var sThumb=document.getElementById('cpSThumb'), vhThumb=document.getElementById('cpVHThumb'), aThumb=document.getElementById('cpAThumb');
    var curInfo=null, swatchOn=false, hideT=null, paramCallback=null;

    // colour math
    function hsv2rgb(h,s,v){
        var r,g,b,i=Math.floor(h/60)%6,f=h/60-Math.floor(h/60),
            p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);
        switch(i){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;
                  case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;
                  case 4:r=t;g=p;b=v;break;default:r=v;g=p;b=q;}
        return [r,g,b];
    }
    function rgb2hsv(r,g,b){
        var max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,h=0,s=max?d/max:0,v=max;
        if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}
        return [h,s,v];
    }
    function fmt(n){return(Math.round(n*1000)/1000).toFixed(3);}
    function cs(rgb){return Math.round(rgb[0]*255)+','+Math.round(rgb[1]*255)+','+Math.round(rgb[2]*255);}

    // drawing
    function drawWheel(){
        var W=wCvs.width,cx=W/2,cy=W/2,r=W/2-1,img=wCtx.createImageData(W,W);
        for(var y=0;y<W;y++)for(var x=0;x<W;x++){
            var dx=x-cx,dy=y-cy,d=Math.sqrt(dx*dx+dy*dy),i4=(y*W+x)*4;
            if(d<=r+2){var rgb=hsv2rgb(((Math.atan2(dy,dx)*180/Math.PI)+360)%360,Math.min(d/r,1),cp.v);
                var alpha=Math.max(0,Math.min(1,(r+2-d)/2))*255;
                img.data[i4]=rgb[0]*255;img.data[i4+1]=rgb[1]*255;img.data[i4+2]=rgb[2]*255;img.data[i4+3]=alpha;}
        }
        wCtx.putImageData(img,0,0);
        var ang=cp.h*Math.PI/180,px=cx+Math.cos(ang)*cp.s*(W/2-1),py=cy+Math.sin(ang)*cp.s*(W/2-1);
        wCtx.beginPath();wCtx.arc(px,py,7,0,Math.PI*2);wCtx.strokeStyle='rgba(0,0,0,.5)';wCtx.lineWidth=3;wCtx.stroke();
        wCtx.beginPath();wCtx.arc(px,py,7,0,Math.PI*2);wCtx.strokeStyle='#fff';wCtx.lineWidth=1.5;wCtx.stroke();
    }
    function drawSSlider(){
        var W=sCvs.width,H=sCvs.height;sCvs.width=W;
        var grey=hsv2rgb(cp.h,0,cp.v),full=hsv2rgb(cp.h,1,cp.v);
        var g=sCtx.createLinearGradient(0,0,W,0);
        g.addColorStop(0,'rgb('+cs(grey)+')');g.addColorStop(1,'rgb('+cs(full)+')');
        sCtx.fillStyle=g;sCtx.fillRect(0,0,W,H);
        sThumb.style.left=(cp.s*100)+'%';
    }
    function drawVHSlider(){
        var W=vhCvs.width,H=vhCvs.height;vhCvs.width=W;
        var full=hsv2rgb(cp.h,cp.s,1);
        var g=vhCtx.createLinearGradient(0,0,W,0);
        g.addColorStop(0,'#000');g.addColorStop(1,'rgb('+cs(full)+')');
        vhCtx.fillStyle=g;vhCtx.fillRect(0,0,W,H);
        vhThumb.style.left=(cp.v*100)+'%';
    }
    function drawAStrip(){
        var W=aCvs.width,H=aCvs.height,rgb=hsv2rgb(cp.h,cp.s,cp.v),c='rgba('+cs(rgb)+',';
        aCvs.width=W;
        var g=aCtx.createLinearGradient(0,0,W,0);
        g.addColorStop(0,c+'0)');g.addColorStop(1,c+'1)');
        aCtx.fillStyle=g;aCtx.fillRect(0,0,W,H);
        aThumb.style.left=(cp.a*100)+'%';
    }
    function refresh(){
        drawWheel();drawSSlider();drawVHSlider();
        if(cpType===4)drawAStrip();
        var rgb=hsv2rgb(cp.h,cp.s,cp.v);
        document.getElementById('cpSwatchInner').style.background='rgba('+cs(rgb)+','+cp.a+')';
        document.getElementById('cpR').textContent=fmt(rgb[0]);
        document.getElementById('cpG').textContent=fmt(rgb[1]);
        document.getElementById('cpB').textContent=fmt(rgb[2]);
        document.getElementById('cpA').textContent=fmt(cp.a);
    }

    // drag helper
    function drag(el,fn){
        var on=false;
        el.addEventListener('mousedown',function(e){on=true;fn(e);e.preventDefault();e.stopPropagation();});
        document.addEventListener('mousemove',function(e){if(on)fn(e);});
        document.addEventListener('mouseup',function(){on=false;});
    }
    drag(wCvs,function(e){
        var r=wCvs.getBoundingClientRect(),sc=wCvs.width/r.width;
        var dx=(e.clientX-r.left)*sc-wCvs.width/2,dy=(e.clientY-r.top)*sc-wCvs.width/2;
        cp.h=((Math.atan2(dy,dx)*180/Math.PI)+360)%360;
        cp.s=Math.min(1,Math.sqrt(dx*dx+dy*dy)/(wCvs.width/2-1));
        refresh();
    });
    drag(sCvs,function(e){
        var r=sCvs.getBoundingClientRect();
        cp.s=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));refresh();
    });
    drag(vhCvs,function(e){
        var r=vhCvs.getBoundingClientRect();
        cp.v=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));refresh();
    });
    drag(aCvs,function(e){
        var r=aCvs.getBoundingClientRect();
        cp.a=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));refresh();
    });

    // eyedropper
    function hexToRgb(hex){
        return [parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255];
    }
    var eyeBtn=document.getElementById('cpEyedropper');
    if(!window.EyeDropper){ eyeBtn.style.display='none'; }
    else {
        eyeBtn.addEventListener('click',function(){
            eyeBtn.classList.add('active');
            new EyeDropper().open().then(function(r){
                var rgb=hexToRgb(r.sRGBHex),hsv=rgb2hsv(rgb[0],rgb[1],rgb[2]);
                cp.h=hsv[0];cp.s=hsv[1];cp.v=hsv[2];
                refresh();
            }).catch(function(){}).then(function(){ eyeBtn.classList.remove('active'); });
        });
    }

    // popup open/close
    function closePopup(){popupEl.classList.remove('open');paramCallback=null;}
    document.getElementById('cpCancel').addEventListener('click',closePopup);
    document.getElementById('cpConfirm').addEventListener('click',function(){
        var rgb=hsv2rgb(cp.h,cp.s,cp.v);
        if(paramCallback){var cb=paramCallback;closePopup();cb(rgb[0],rgb[1],rgb[2],cp.a);return;}
        if(!ED||!cpRange)return;
        var r=fmt(rgb[0]),g=fmt(rgb[1]),b=fmt(rgb[2]),a=fmt(cp.a);
        var text=cpType===4?'float4('+r+','+g+','+b+','+a+')':'float3('+r+','+g+','+b+')';
        ED.executeEdits('cp',[{range:cpRange,text:text}]);
        ED.focus();closePopup();
    });
    document.addEventListener('mousedown',function(e){
        if(popupEl.classList.contains('open')&&!popupEl.contains(e.target)&&e.target!==swatchEl)closePopup();
    });

    function openPopup(info){
        cpType=info.type;
        cpRange=new monaco.Range(info.lineNumber,info.startCol,info.lineNumber,info.endCol);
        var hsv=rgb2hsv(info.r,info.g,info.b);cp.h=hsv[0];cp.s=hsv[1];cp.v=hsv[2];cp.a=info.a;
        document.getElementById('cpAWrap').style.display=cpType===4?'':'none';
        document.getElementById('cpALbl').style.display=cpType===4?'':'none';
        document.getElementById('cpA').style.display=cpType===4?'':'none';
        var sr=swatchEl.getBoundingClientRect(),pw=240;
        var x=sr.right+8;if(x+pw>window.innerWidth-8)x=sr.left-pw-8;
        popupEl.style.left=x+'px';popupEl.style.top=sr.top+'px';
        popupEl.classList.add('open');
        var pr=popupEl.getBoundingClientRect();
        var y=Math.max(8,Math.min(window.innerHeight-pr.height-8,sr.top-20));
        popupEl.style.top=y+'px';
        refresh();
    }

    // inline swatch hover/click
    swatchEl.addEventListener('mouseenter',function(){swatchOn=true;clearTimeout(hideT);});
    swatchEl.addEventListener('mouseleave',function(){swatchOn=false;schedHide();});
    swatchEl.addEventListener('click',function(){if(curInfo)openPopup(curInfo);});
    function schedHide(){clearTimeout(hideT);hideT=setTimeout(function(){if(!swatchOn)swatchEl.style.display='none';},350);}

    // Monaco integration
    function findColorAt(pos){
        var line=ED.getModel().getLineContent(pos.lineNumber);
        var re=/\bfloat([34])\s*\(\s*(?:([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?)?\s*\)/g,m;
        while((m=re.exec(line))!==null){
            var sc=m.index+1,ec=sc+m[0].length;
            if(pos.column>=sc&&pos.column<=ec)
                return{type:parseInt(m[1]),
                       r:m[2]!==undefined?parseFloat(m[2]):0,
                       g:m[3]!==undefined?parseFloat(m[3]):0,
                       b:m[4]!==undefined?parseFloat(m[4]):0,
                       a:m[5]!==undefined?parseFloat(m[5]):1,lineNumber:pos.lineNumber,startCol:sc,endCol:ec};
        }
        return null;
    }

    window._cpOpenForParam=function(anchorEl,type,r,g,b,a,callback){
        paramCallback=callback;cpType=type;cpRange=null;
        var hsv=rgb2hsv(r,g,b);cp.h=hsv[0];cp.s=hsv[1];cp.v=hsv[2];cp.a=a;
        document.getElementById('cpAWrap').style.display=type===4?'':'none';
        document.getElementById('cpALbl').style.display=type===4?'':'none';
        document.getElementById('cpA').style.display=type===4?'':'none';
        var ar=anchorEl.getBoundingClientRect(),pw=240;
        var x=ar.right+8;if(x+pw>window.innerWidth-8)x=ar.left-pw-8;
        popupEl.style.left=x+'px';popupEl.style.top=ar.top+'px';
        popupEl.classList.add('open');
        var pr=popupEl.getBoundingClientRect();
        var y=Math.max(8,Math.min(window.innerHeight-pr.height-8,ar.top-20));
        popupEl.style.top=y+'px';
        refresh();
    };

    window._cpSetEditor=function(ed){
        ED=ed;
        ed.onMouseMove(function(e){
            if(popupEl.classList.contains('open'))return;
            if(!e.target||!e.target.position){schedHide();return;}
            var info=findColorAt(e.target.position);
            if(!info){schedHide();return;}
            clearTimeout(hideT);curInfo=info;
            var vp=ed.getScrolledVisiblePosition({lineNumber:info.lineNumber,column:info.startCol});
            if(!vp)return;
            var er=ed.getDomNode().getBoundingClientRect();
            swatchEl.style.background='rgba('+Math.round(info.r*255)+','+Math.round(info.g*255)+','+Math.round(info.b*255)+','+info.a+')';
            swatchEl.style.left=(er.left+vp.left-18)+'px';
            swatchEl.style.top=(er.top+vp.top+(vp.height-14)/2)+'px';
            swatchEl.style.display='block';
        });
        ed.getDomNode().addEventListener('mouseleave',schedHide);
    };
})();
