document.querySelectorAll('.img-compare').forEach(function(el) {
    var after = el.querySelectorAll('img')[1];
    var input = el.querySelector('input[type=range]');
    var divider = el.querySelector('.divider');
    function update() {
        var pct = input.value;
        after.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
        divider.style.left = pct + '%';
    }
    input.addEventListener('input', update);
    update();
});
