<!DOCTYPE html>
<?php
$root = $_SERVER['DOCUMENT_ROOT'];
$title = "Duesenburg";
include_once($root . "/public/Header/header.php")?>
<body>
    <section id="piece">
        <div class="duesenburg-gallery">

            <div class="video-wrap">
                <iframe title="Duesenburg" src="https://player.vimeo.com/video/217695000" frameborder="0" allowfullscreen></iframe>
            </div>

            <img class="banner" src="/public/Pages/Duesenburg/Images/TopBanner.jpg" alt="Duesenburg">

            <div class="img-compare">
                <img src="/public/Pages/Duesenburg/Images/FrontWireframe.jpg" alt="Front - wireframe">
                <img src="/public/Pages/Duesenburg/Images/FrontRender.jpg" alt="Front - render">
                <input type="range" min="0" max="100" value="75">
                <div class="divider"></div>
            </div>

            <div class="img-compare">
                <img src="/public/Pages/Duesenburg/Images/BackWireframe.jpg" alt="Back - wireframe">
                <img src="/public/Pages/Duesenburg/Images/BackRender.jpg" alt="Back - render">
                <input type="range" min="0" max="100" value="75">
                <div class="divider"></div>
            </div>

        </div>
    </section>

    <link rel="stylesheet" href="/public/Pages/img-compare.css">
    <style>
        .duesenburg-gallery {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2vw;
            align-items: start;
            padding-left: 5vw;
            padding-right: 5vw;
        }
        .duesenburg-gallery .video-wrap {
            grid-column: 1 / -1;
            display: flex;
            gap: 2vw;
            justify-content: center;
        }
        .duesenburg-gallery .video-wrap iframe {
            height: 30vw;
            width: 53.3vw;
            display: block;
        }
        .duesenburg-gallery .banner {
            grid-column: 1 / -1;
            width: 100%;
            height: 9vw;
            object-fit: cover;
            display: block;
        }
        .duesenburg-gallery .img-compare {
            height: 30vw;
            width: 100%;
        }
    </style>

    <script src="/public/Pages/img-compare.js"></script>
    <script src="/app.js"></script>
</body>
</html>
