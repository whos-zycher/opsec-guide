document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const contentElement = document.getElementById('content');
    const userTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Remove no-js class
    document.documentElement.classList.remove('no-js');

    // Initialize theme
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.checked = theme === 'dark';
    };

    if (userTheme) {
        applyTheme(userTheme);
    } else {
        applyTheme(systemPrefersDark ? 'dark' : 'light');
    }

    // Toggle theme
    themeToggle.addEventListener('change', () => {
        applyTheme(themeToggle.checked ? 'dark' : 'light');
    });

    // Load markdown content
    const loadMarkdown = async () => {
        try {
            const response = await fetch('guide.md');
            if (!response.ok) throw new Error(`HTTP error, status: ${response.status}`);
            const markdown = await response.text();
            contentElement.innerHTML = marked.parse(markdown);
        } catch (error) {
            console.error('Error loading content:', error);
            contentElement.innerHTML = '<p>Error loading content. Please try again.</p>';
        }
    };
    loadMarkdown();

    // fix reffers
    const fixreffers = () => {
        document.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    };
    setTimeout(fixreffers, 100);
});
