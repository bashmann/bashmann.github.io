(function () {
    var pages = [
        { label: 'Home',        path: '/public/Home/home.html' },
        { label: 'Projects',    path: '/public/Pages/projects.html' },
        { label: 'HLSL Editor', path: '/public/Pages/HLSLEditor.html' },
        { label: 'Portfolio',   path: '/public/Pages/portfolio.html' },
    ];

    var current = window.location.pathname;

    var items = pages.map(function (p) {
        var cls = current === p.path ? 'selected' : 'unselected';
        return '<li class="' + cls + '"><a href="' + p.path + '"><button class="butTxt-hid ' + cls + '">' + p.label + '</button></a></li>';
    }).join('');

    document.write(
        '<nav id="topbar">' +
        '<div class="logo"><a href="/public/Home/home.html"><img src="/public/Header/Images/websitelogo_last.png" alt="Ben Ashcroft"></a></div>' +
        '<div class="menu"><ul>' + items + '</ul></div>' +
        '</nav>'
    );
}());
