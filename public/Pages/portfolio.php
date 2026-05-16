<!DOCTYPE html>
<?php 
$root = $_SERVER['DOCUMENT_ROOT'];
$title = "Portfolio";
include_once($root . "/public/Header/header.php")?>
<body>
    <div id="portfolio">
        <ul>
            <li>
                <a href="/public/Pages/Duesenburg/Duesenburg.php">
                    <button class="hiddenBut">
                        <img src="/public/Pages/Duesenburg/Images/DuesenburgThumbnail.png" alt="Duesenburg car render">
                        <h4>Duesenburg</h4>
                    </button>
                </a>
            </li>
            <li>
                <a href="/public/Pages/Kitchen/Kitchen.php">
                    <button class="hiddenBut">
                        <img src="/public/Pages/Kitchen/Images/kitchenWideReg.png" alt="realistic real-time render of a kitchen">
                        <h4>Kitchen</h4>
                    </button>
                </a>
            </li>
            <li>
                <a href="/public/Pages/MEL/MEL.php">
                    <button class="hiddenBut">
                        <img src="/public/Pages/MEL/Images/MayaLogo.png" alt="MEL scripting">
                        <h4>MEL</h4>
                    </button>
                </a>
            </li>
            <li>
                <a href="/portfolio/AutoPacker.php">
                    <button class="hiddenBut">
                        <img src="/public/Pages/AutoPacker/Images/AutoPackerLogo.png" alt="Texture AutoPacker">
                        <h4>Texture AutoPacker</h4>
                    </button>
                </a>
            </li>
        </ul>
    </div>
    <script src="/app.js"></script>
</body>
</html>
