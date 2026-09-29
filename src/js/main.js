document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-drawer-btn');
    const closeBtn = document.getElementById('close-drawer-btn');
    const quickPlayBtn = document.getElementById('quick-play-btn');
    const drawer = document.getElementById('side-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    function openDrawer() {
        if (!drawer || !backdrop) return;
        drawer.classList.add('open');
        backdrop.classList.add('active');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (!drawer || !backdrop) return;
        drawer.classList.remove('open');
        backdrop.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    if (quickPlayBtn) {
        quickPlayBtn.addEventListener('click', () => {
            window.location.href = 'sudoku.html';
        });
    }

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });
});
