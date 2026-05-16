<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ben Ashcroft - Blog</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
<?php $root = $_SERVER['DOCUMENT_ROOT']; include_once($root . '/background.html'); include_once($root . '/topbar.html'); ?>

<?php
$slug = isset($_GET['post']) ? basename($_GET['post']) : '';
$file = __DIR__ . '/' . $slug . '.md';

if (!$slug || !file_exists($file)):
?>
<section id="piece">
    <div class="blog-post">
        <p>Post not found. <a href="/public/Pages/Blog/blog.php">Back to blog</a></p>
    </div>
</section>
<?php else:
    $raw = file_get_contents($file);

    function md_to_html($md) {
        $lines   = explode("\n", $md);
        $html    = '';
        $para    = [];

        $flush = function() use (&$para, &$html) {
            if (!empty($para)) {
                $html .= '<p>' . implode(' ', $para) . '</p>' . "\n";
                $para  = [];
            }
        };

        $inline = function($s) {
            $s = htmlspecialchars($s, ENT_QUOTES);
            $s = preg_replace('/\*\*(.+?)\*\*/', '<strong>$1</strong>', $s);
            $s = preg_replace('/\*(.+?)\*/',     '<em>$1</em>',         $s);
            $s = preg_replace('/`(.+?)`/',        '<code>$1</code>',     $s);
            return $s;
        };

        foreach ($lines as $line) {
            if (preg_match('/^(#{1,4})\s+(.+)/', $line, $m)) {
                $flush();
                $level = strlen($m[1]);
                $html .= "<h{$level}>{$inline($m[2])}</h{$level}>\n";
            } elseif (trim($line) === '') {
                $flush();
            } else {
                $para[] = $inline(rtrim($line));
            }
        }
        $flush();
        return $html;
    }
?>
<section id="piece">
    <div class="blog-post">
        <a class="blog-back" href="/public/Pages/Blog/blog.php">Back</a>
        <?= md_to_html($raw) ?>
    </div>
</section>
<?php endif; ?>

<style>
    .blog-post {
        max-width: 48em;
        margin: 4em auto;
        padding: 0 var(--showcasePadding);
        display: flex;
        flex-direction: column;
        gap: 0.75em;
    }
    .blog-back {
        font-size: 0.9em;
        color: var(--offTextColor);
        text-decoration: none;
        margin-bottom: 1em;
        display: inline-block;
    }
    .blog-back:hover {
        color: var(--textColor);
    }
    .blog-post h1 { font-size: 1.8em; margin-bottom: 0.25em; }
    .blog-post h2 { font-size: 1.3em; margin-top: 1.5em; }
    .blog-post h3 { font-size: 1.1em; margin-top: 1.25em; }
    .blog-post p  { line-height: 1.7; color: var(--textColor); }
    .blog-post code {
        background: var(--offBackgroundColor, #1a1a1a);
        padding: 0.1em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
    }
</style>

<script src="/app.js"></script>
</body>
</html>
