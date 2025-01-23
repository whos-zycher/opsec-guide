document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('#themeToggle');
    const contentElement = document.querySelector('#content');
    const userTheme = localStorage.getItem('theme');
    const systemThemePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Initialize theme
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.checked = theme === 'dark';
    };

    if (userTheme) {
        applyTheme(userTheme);
    } else {
        applyTheme(systemThemePreference ? 'dark' : 'light');
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
    const fixReffers = () => {
        document.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    };
    setTimeout(fixReffers, 100);
});
