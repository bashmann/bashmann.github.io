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
        '<div class="logo"><a href="/home/"><img src="/public/Header/Images/websitelogo_last.png" alt="Ben Ashcroft"></a></div>' +
        '<div class="menu"><ul>' + items + '</ul></div>' +
        '</nav>'
    );
}());
