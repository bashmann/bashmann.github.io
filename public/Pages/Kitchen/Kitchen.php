<!DOCTYPE html>
<?php
$root = $_SERVER['DOCUMENT_ROOT'];
$title = "Kitchen";
include_once($root . "/public/Header/header.php")?>
<body>
    <section id="piece">
        <div class="kitchen-gallery">

            <div class="video-wrap">
                <iframe title="Kitchen Walkthrough" src="https://player.vimeo.com/video/499011922" frameborder="0" allowfullscreen></iframe>
            </div>

            <img src="/public/Pages/Kitchen/Images/kitchenCounterReg.png" alt="Counter">
            <img src="/public/Pages/Kitchen/Images/kitchenCounterCloseReg.png" alt="Counter close-up">

            <div class="img-compare">
                <img src="/public/Pages/Kitchen/Images/kitchenWideComic.png" alt="Wide - comic">
                <img src="/public/Pages/Kitchen/Images/kitchenWideReg.png" alt="Wide - regular">
                <input type="range" min="0" max="100" value="80">
                <div class="divider"></div>
            </div>

            <div class="img-compare">
                <img src="/public/Pages/Kitchen/Images/kitchenWallArtCom.png" alt="Wall art - comic">
                <img src="/public/Pages/Kitchen/Images/kitchenWallArtReg.png" alt="Wall art - regular">
                <input type="range" min="0" max="100" value="80">
                <div class="divider"></div>
            </div>

            <div class="img-compare solo">
                <img src="/public/Pages/Kitchen/Images/kitchenClockCom.png" alt="Clock - comic">
                <img src="/public/Pages/Kitchen/Images/kitchenClockReg.png" alt="Clock - regular">
                <input type="range" min="0" max="100" value="80">
                <div class="divider"></div>
            </div>

        </div>
    </section>

    <link rel="stylesheet" href="/public/Pages/img-compare.css">
    <style>
        .kitchen-gallery {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2vw;
            align-items: start;
            padding-left: 5vw;
            padding-right: 5vw;
        }
        .kitchen-gallery .video-wrap {
            grid-column: 1 / -1;
            display: flex;
            justify-content: center;
        }
        .kitchen-gallery .video-wrap iframe {
            height: 30vw;
            width: 53.3vw;
            display: block;
        }
        .kitchen-gallery > img,
        .kitchen-gallery .img-compare {
            height: 30vw;
            width: 100%;
        }
        .kitchen-gallery > img {
            object-fit: cover;
            display: block;
        }
        .kitchen-gallery .solo {
            grid-column: 1 / -1;
            justify-self: center;
            width: calc(50% - 1vw);
        }
    </style>

    <script src="/public/Pages/img-compare.js"></script>
    <script src="/app.js"></script>
</body>
</html>
