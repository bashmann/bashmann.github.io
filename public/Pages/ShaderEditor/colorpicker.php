<div id="cpInlineSwatch"></div>
<div id="cpPopup">
    <div id="cpWheelRow">
        <canvas id="cpWheel" width="180" height="180"></canvas>
    </div>
    <div id="cpSWrap">
        <canvas id="cpSCanvas" width="204" height="16"></canvas>
        <div id="cpSThumb"></div>
    </div>
    <div id="cpVHWrap">
        <canvas id="cpVHCanvas" width="204" height="16"></canvas>
        <div id="cpVHThumb"></div>
    </div>
    <div id="cpAWrap">
        <canvas id="cpACanvas" width="204" height="16"></canvas>
        <div id="cpAThumb"></div>
    </div>
    <div id="cpBottom">
        <div id="cpSwatchPrev"><div id="cpSwatchInner"></div></div>
        <div id="cpReadout">
            <span class="lbl">R</span><span id="cpR">0.000</span>
            <span class="lbl">G</span><span id="cpG">0.000</span>
            <span class="lbl">B</span><span id="cpB">0.000</span>
            <span class="lbl" id="cpALbl">A</span><span id="cpA">1.000</span>
        </div>
    </div>
    <div id="cpFooter">
        <button id="cpEyedropper" title="Pick colour from screen">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.5 1.5L11.5 3.5L5 10L3 12L1 10L3 8L9.5 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>
                <path d="M7.5 3.5L9.5 5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
        </button>
        <button id="cpCancel">Cancel</button>
        <button id="cpConfirm">Set</button>
    </div>
</div>
