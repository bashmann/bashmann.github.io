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

<section id="piece">
    <div class="blog-list">
        <?php
        $posts = glob(__DIR__ . '/*.md') ?: [];
        rsort($posts);
        foreach ($posts as $file):
            $filename = pathinfo($file, PATHINFO_FILENAME);
            $content  = file_get_contents($file);
            preg_match('/^#\s+(.+)/m', $content, $m);
            $title = isset($m[1]) ? $m[1] : str_replace(['-', '_'], ' ', $filename);
            $slug  = urlencode($filename);
        ?>
        <div class="blog-entry">
            <a href="/public/Pages/Blog/post.php?post=<?= $slug ?>">
                <h2><?= htmlspecialchars($title) ?></h2>
            </a>
        </div>
        <?php endforeach; ?>
        <?php if (empty($posts)): ?>
        <p class="blog-empty">No posts yet.</p>
        <?php endif; ?>
    </div>
</section>

<style>
    .blog-list {
        max-width: 48em;
        margin: 4em auto;
        padding: 0 var(--showcasePadding);
        display: flex;
        flex-direction: column;
        gap: 1em;
    }
    .blog-entry a {
        text-decoration: none;
    }
    .blog-entry h2 {
        font-size: 1.1em;
        color: var(--textColor);
        transition: color 0.2s;
    }
    .blog-entry:hover h2 {
        color: var(--offTextColor);
    }
    .blog-empty {
        color: var(--offTextColor);
    }
</style>

<script src="/app.js"></script>
</body>
</html>
