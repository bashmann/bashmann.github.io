<!DOCTYPE html>
<?php
$root = $_SERVER['DOCUMENT_ROOT'];
$title = "Technical Artist";

function parseMd($path) {
    $text = file_get_contents($path);
    $blocks = preg_split('/\n{2,}/', trim($text));
    $out = '';
    foreach ($blocks as $block) {
        $block = trim($block);
        if ($block === '') continue;
        if (preg_match('/^## (.+)$/', $block, $m)) {
            $out .= '<h2>' . htmlspecialchars($m[1]) . '</h2>';
        } elseif (preg_match('/^### (.+)$/', $block, $m)) {
            $out .= '<h3>' . htmlspecialchars($m[1]) . '</h3>';
        } else {
            $block = preg_replace('/\*\*(.+?)\*\*/', '<strong>$1</strong>', $block);
            $block = preg_replace('/`(.+?)`/', '<code>$1</code>', $block);
            $out .= '<p>' . nl2br(htmlspecialchars($block)) . '</p>';
        }
    }
    return $out;
}

include_once($root . "/public/Header/header.php")?>
<body>
    <div class="logo-intro">
        <img src="/public/Header/Images/websitelogo.gif" alt="">
    </div>

    <section id="showcase">
        <div>
            <?php echo parseMd($root . '/public/Home/home.md'); ?>
            <a class="butShow" href="/public/Pages/portfolio.php">Portfolio</a>
        </div>
    </section>
    <ul id="social">
        <li class="butSocial"><a href="https://www.linkedin.com/in/benashcroft3d/" target="_blank" rel="noopener noreferrer"><img class="butSocial" src="/public/Pages/Social/Images/logoLinkedIn.png" alt="LinkedIn"></a></li>
        <li class="butSocial"><a href="https://www.artstation.com/search?sort_by=relevance&query=ben%20ashcroft" target="_blank" rel="noopener noreferrer"><img class="butSocial" src="/public/Pages/Social/Images/logoArtstation.png" alt="ArtStation"></a></li>
        <!-- <li class="butSocial"><a href="#"><img class="butSocial" src="/public/Pages/Social/Images/logoTwitter.png" alt="Twitter"></a></li>
        <li class="butSocial"><a href="#"><img class="butSocial" src="/public/Pages/Social/Images/logoFacebook.png" alt="Facebook"></a></li> -->
    </ul>

    <style>
        img[src*="logoArtstation"] {
            filter: invert(1);
        }
        .logo-intro {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 150;
            pointer-events: none;
        }
        .logo-intro img {
            height: 25vh;
            width: auto;
            display: block;
        }
        .logo img {
            opacity: 0;
        }
        #showcase,
        #social {
            opacity: 0;
            transition: opacity 1s ease;
        }
    </style>

    <script src="/app.js"></script>
    <script>
        (function () {
            var introLogo  = document.querySelector('.logo-intro');
            var gifImg     = introLogo.querySelector('img');
            var topbarLogo = document.querySelector('.logo img');
            var showcase   = document.querySelector('#showcase');
            var social     = document.querySelector('#social');

            function runIntro() {
                var targetRect = topbarLogo.getBoundingClientRect();
                var introRect  = introLogo.getBoundingClientRect();
                var dx    = (targetRect.left + targetRect.width  / 2) - (introRect.left + introRect.width  / 2);
                var dy    = (targetRect.top  + targetRect.height / 2) - (introRect.top  + introRect.height / 2);
                var scale = targetRect.height / introRect.height;

                introLogo.style.transition = 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s 0.75s';
                introLogo.style.transform  = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(' + scale + ')';
                showcase.style.opacity = '1';
                social.style.opacity   = '1';

                setTimeout(function () {
                    topbarLogo.style.transition = 'opacity 0.3s';
                    topbarLogo.style.opacity = '1';
                    introLogo.style.opacity  = '0';
                    setTimeout(function () { introLogo.remove(); }, 300);
                }, 900);
            }

            if (gifImg.complete && gifImg.naturalWidth) {
                setTimeout(runIntro, 1000);
            } else {
                gifImg.addEventListener('load', function () { setTimeout(runIntro, 1000); });
            }
        })();
    </script>
</body>
</html>
