window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.splash').classList.add('hidden');

    const topbar = document.querySelector('#topbar');
    window.addEventListener('scroll', () => {
        topbar.classList.toggle('scrolled', window.scrollY > 0);
    });
});
