(function () {
    var pages = [
        { label: 'Home',        path: '/' },
        { label: 'Projects',    path: '/projects/' },
        { label: 'HLSL Editor', path: '/hlsl/' },
        { label: 'Portfolio',   path: '/portfolio/' },
    ];

    var current = window.location.pathname;

    var items = pages.map(function (p) {
        var cls = (current === p.path || (p.path !== '/' && current.startsWith(p.path))) ? 'selected' : 'unselected';
        return '<li class="' + cls + '"><a href="' + p.path + '"><button class="butTxt-hid ' + cls + '">' + p.label + '</button></a></li>';
    }).join('');

    document.write(
        '<nav id="topbar">' +
        '<div class="logo"><a href="/"><img class="logo-img" src="/public/Header/Images/websitelogo_last.png" alt="Ben Ashcroft"></a><a class="logo-text" href="/">Ben Ashcroft</a></div>' +
        '<button id="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>' +
        '<div class="menu"><ul>' + items + '</ul></div>' +
        '</nav>'
    );

    var toggle = document.getElementById('nav-toggle');
    var topbar = document.getElementById('topbar');

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99;display:none;';
    document.body.appendChild(overlay);

    function closeNav() {
        topbar.classList.remove('nav-open');
        overlay.style.display = 'none';
    }
    toggle.addEventListener('click', function () {
        var open = topbar.classList.toggle('nav-open');
        overlay.style.display = open ? 'block' : 'none';
    });
    overlay.addEventListener('click', closeNav);
    document.querySelectorAll('#topbar .menu a').forEach(function (a) {
        a.addEventListener('click', closeNav);
    });
}());
