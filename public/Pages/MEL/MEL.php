<!DOCTYPE html>
<?php
$root = $_SERVER['DOCUMENT_ROOT'];
$title = "MEL Scripting";
include_once($root . "/public/Header/header.php");

function parseMelMd($path) {
    $raw = str_replace("\r\n", "\n", file_get_contents($path));
    $lines = explode("\n", $raw);
    $title = '';
    $descLines = [];
    $codeLines = [];
    $inCode = false;
    foreach ($lines as $line) {
        if ($title === '') {
            if (trim($line) !== '') $title = trim($line);
            continue;
        }
        if (!$inCode && preg_match('/^\s*\/\//', $line)) $inCode = true;
        if ($inCode) $codeLines[] = $line;
        else         $descLines[] = $line;
    }
    $blocks = [];
    $cur = [];
    foreach ($descLines as $line) {
        if (trim($line) === '') {
            if ($cur) { $blocks[] = implode(' ', $cur); $cur = []; }
        } else {
            $cur[] = trim($line);
        }
    }
    if ($cur) $blocks[] = implode(' ', $cur);
    return ['title' => $title, 'desc' => array_values(array_filter($blocks)), 'code' => rtrim(implode("\n", $codeLines))];
}

function melHl($code) {
    $kw = ['proc','string','int','float','vector','matrix','for','if','else','while','do','return','global','local','in','true','false'];
    $out = '';
    $i = 0;
    $len = strlen($code);
    while ($i < $len) {
        $c = $code[$i];
        // line comment
        if ($c === '/' && $i + 1 < $len && $code[$i+1] === '/') {
            $end = strpos($code, "\n", $i); if ($end === false) $end = $len;
            $out .= '<span class="mc">'.htmlspecialchars(substr($code,$i,$end-$i)).'</span>';
            $i = $end; continue;
        }
        // string
        if ($c === '"') {
            $j = $i + 1;
            while ($j < $len && $code[$j] !== '"') { if ($code[$j] === '\\') $j++; $j++; }
            $j++;
            $out .= '<span class="ms">'.htmlspecialchars(substr($code,$i,$j-$i)).'</span>';
            $i = $j; continue;
        }
        // backtick command
        if ($c === '`') {
            $end = strpos($code,'`',$i+1); if ($end === false) $end = $len-1;
            $end++;
            $out .= '<span class="mb">'.htmlspecialchars(substr($code,$i,$end-$i)).'</span>';
            $i = $end; continue;
        }
        // variable
        if ($c === '$') {
            $j = $i + 1;
            while ($j < $len && (ctype_alnum($code[$j]) || $code[$j] === '_')) $j++;
            $out .= '<span class="mv">'.htmlspecialchars(substr($code,$i,$j-$i)).'</span>';
            $i = $j; continue;
        }
        // number
        if (ctype_digit($c)) {
            $j = $i;
            while ($j < $len && (ctype_digit($code[$j]) || $code[$j] === '.')) $j++;
            $out .= '<span class="mn">'.htmlspecialchars(substr($code,$i,$j-$i)).'</span>';
            $i = $j; continue;
        }
        // word / keyword
        if (ctype_alpha($c) || $c === '_') {
            $j = $i;
            while ($j < $len && (ctype_alnum($code[$j]) || $code[$j] === '_')) $j++;
            $word = substr($code,$i,$j-$i);
            $out .= in_array($word,$kw) ? '<span class="mk">'.htmlspecialchars($word).'</span>' : htmlspecialchars($word);
            $i = $j; continue;
        }
        $out .= htmlspecialchars($c);
        $i++;
    }
    return $out;
}

$melDir = $root . '/public/Pages/MEL/';
$scripts = [
    parseMelMd($melDir . 'CopyToAllPoints.md'),
    parseMelMd($melDir . 'UnfreezeTransforms.md'),
    parseMelMd($melDir . 'HighestPolyObject.md'),
    parseMelMd($melDir . 'UnrealExport.md'),
];
?>
<body>
    <section id="piece">
        <div class="mel-page">

            <div class="mel-nav">
                <?php foreach ($scripts as $i => $s): ?>
                    <button class="mel-tab<?= $i === 0 ? ' active' : '' ?>" onclick="melShow(<?= $i ?>)">
                        <?= htmlspecialchars($s['title']) ?>
                    </button>
                <?php endforeach; ?>
            </div>

            <div class="mel-sections">
                <?php foreach ($scripts as $i => $s): ?>
                    <div class="mel-section<?= $i === 0 ? ' active' : '' ?>">
                        <div class="mel-body">
                            <div class="mel-desc">
                                <?php foreach ($s['desc'] as $block): ?>
                                    <p><?= htmlspecialchars($block) ?></p>
                                <?php endforeach; ?>
                            </div>
                            <div class="mel-code-wrap">
                                <button class="mel-copy" onclick="melCopy(this)">Copy</button>
                                <pre class="mel-code"><?= melHl($s['code']) ?></pre>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

        </div>
    </section>

    <style>
        #piece {
            height: calc(100vh - var(--topBarHeight));
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .mel-page {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            width: 100%;
        }

        .mel-nav {
            flex-shrink: 0;
            display: flex;
            gap: 0;
            border-bottom: 1px solid #333;
            margin-bottom: 2vw;
        }
        .mel-tab {
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            margin-bottom: -1px;
            padding: 0.6em 1.4em;
            font-size: 0.85em;
            font-weight: 500;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #888;
            cursor: pointer;
            transition: color 0.15s, border-color 0.15s;
        }
        .mel-tab:hover  { color: #ccc; }
        .mel-tab.active { color: #fff; border-bottom-color: #fff; }

        .mel-sections { flex: 1; min-height: 0; }
        .mel-section { display: none; }
        .mel-section.active { display: flex; height: 100%; }

        .mel-body {
            display: flex;
            gap: 3vw;
            width: 100%;
            min-height: 0;
        }
        .mel-desc {
            flex: 1;
            overflow-y: auto;
        }
        .mel-desc p {
            font-size: 0.9em;
            line-height: 1.8;
            color: #ccc;
            font-weight: 300;
            margin-bottom: 0.8em;
        }

        .mel-code-wrap {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            position: relative;
        }
        .mel-copy {
            position: absolute;
            top: 0.5em;
            right: 1.6em;
            background: #2d2d2d;
            border: 1px solid #444;
            border-radius: 3px;
            color: #aaa;
            font-size: 0.75em;
            padding: 0.2em 0.7em;
            cursor: pointer;
            transition: color 0.15s, background 0.15s;
            z-index: 1;
        }
        .mel-copy:hover { background: #3a3a3a; color: #fff; }
        .mel-code {
            background: #1e1e1e;
            border: 1px solid #2d2d2d;
            border-radius: 4px;
            padding: 1.2em 1.4em;
            padding-top: 2.6em;
            font-family: Consolas, 'Courier New', monospace;
            font-size: 0.82em;
            line-height: 1.6;
            overflow: auto;
            white-space: pre;
            flex: 1;
            min-height: 0;
            scrollbar-color: #444 #1e1e1e;
            scrollbar-width: thin;
        }
        .mel-code::-webkit-scrollbar { width: 8px; height: 8px; }
        .mel-code::-webkit-scrollbar-track { background: #1e1e1e; }
        .mel-code::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
        .mel-code::-webkit-scrollbar-thumb:hover { background: #555; }
        .mc { color: #6a9955; }   /* comment */
        .ms { color: #ce9178; }   /* string  */
        .mb { color: #dcdcaa; }   /* backtick command */
        .mv { color: #9cdcfe; }   /* variable */
        .mn { color: #b5cea8; }   /* number  */
        .mk { color: #569cd6; }   /* keyword */
    </style>

    <script>
        var tabs     = document.querySelectorAll('.mel-tab');
        var sections = document.querySelectorAll('.mel-section');
        function melShow(i) {
            tabs.forEach(function(t,j)     { t.classList.toggle('active', i===j); });
            sections.forEach(function(s,j) { s.classList.toggle('active', i===j); });
        }
        function melCopy(btn) {
            var code = btn.nextElementSibling.textContent;
            navigator.clipboard.writeText(code).then(function() {
                btn.textContent = 'Copied!';
                setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
            });
        }
    </script>
    <script src="/app.js"></script>
</body>
</html>
