<!DOCTYPE html>
<?php
$root = $_SERVER['DOCUMENT_ROOT'];
$title = "Texture AutoPacker";
include_once($root . "/public/Header/header.php");

function inlineMd($text) {
    $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    $text = preg_replace('/\*\*(.+?)\*\*/', '<strong>$1</strong>', $text);
    $text = preg_replace('/`(.+?)`/', '<code>$1</code>', $text);
    return $text;
}

function parseMd($path) {
    $raw = file_get_contents($path);
    $raw = str_replace("\r\n", "\n", $raw);
    $raw = preg_replace('/^[ \t]+$/m', '', $raw);
    $blocks = preg_split('/\n{2,}/', trim($raw));
    $html = '';
    foreach ($blocks as $block) {
        $block = trim($block);
        if ($block === '') continue;
        if (preg_match('/^##\s+(.+)$/', $block, $m)) {
            $html .= '<h4>' . htmlspecialchars($m[1], ENT_QUOTES, 'UTF-8') . '</h4>';
            continue;
        }
        $lines = explode("\n", $block);
        if (preg_match('/^- /', $lines[0])) {
            $html .= '<ul>';
            foreach ($lines as $line)
                if (preg_match('/^- (.+)$/', $line, $m))
                    $html .= '<li>' . inlineMd($m[1]) . '</li>';
            $html .= '</ul>';
            continue;
        }
        $html .= '<p>' . inlineMd(implode(' ', $lines)) . '</p>';
    }
    return $html;
}
?>
<body>
    <section id="piece">
        <div class="ap-page">

            <div class="ap-body">
                <div class="ap-text">
                    <?php echo parseMd($root . '/public/Pages/AutoPacker/Autopacker.md'); ?>
                </div>
                <div class="ap-images">
                    <img src="/public/Pages/AutoPacker/Images/AutoPackerEmpty.png" alt="AutoPacker — empty state">
                    <img src="/public/Pages/AutoPacker/Images/AutoPackerExample.png" alt="AutoPacker — example output">
                </div>
            </div>

        </div>
    </section>

    <style>
        .ap-page {
            width: 100%;
        }
        .ap-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3vw;
            align-items: start;
        }
        .ap-text h4 {
            font-size: 1.1em;
            font-weight: 600;
            letter-spacing: 0.08em;
            margin-top: 1.8em;
            margin-bottom: 0.5em;
        }
        .ap-text h4:first-child { margin-top: 0; }
        .ap-text p {
            font-size: 0.9em;
            line-height: 1.8;
            color: #ccc;
            margin-bottom: 0.8em;
            font-weight: 300;
        }
        .ap-text ul {
            list-style: disc;
            padding-left: 1.4em;
            margin-bottom: 0.8em;
        }
        .ap-text ul li {
            font-size: 0.9em;
            line-height: 1.8;
            color: #ccc;
            font-weight: 300;
            margin-bottom: 0.3em;
        }
        .ap-text strong { color: #fff; font-weight: 600; }
        .ap-text code {
            font-family: monospace;
            background: #222;
            padding: 0.1em 0.35em;
            border-radius: 3px;
            font-size: 0.9em;
        }
        .ap-images {
            display: flex;
            flex-direction: column;
            gap: 2vw;
        }
        .ap-images img {
            width: 100%;
            display: block;
        }
    </style>

    <script src="/app.js"></script>
</body>
</html>
