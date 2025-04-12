document.addEventListener("DOMContentLoaded", () => {
	// Theme manage
	class ThemeManager {
		constructor(toggleSelector) {
			this.toggleElement = document.querySelector(toggleSelector);
			this.userTheme = localStorage.getItem("theme");
			this.systemDark = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches;
			this.init();
		}

		init() {
			// Apply saved or system theme and attach toggle listener
			this.applyTheme(
				this.userTheme || (this.systemDark ? "dark" : "light")
			);
			this.toggleElement?.addEventListener("change", () => {
				this.applyTheme(this.toggleElement.checked ? "dark" : "light");
			});
		}

		applyTheme(theme) {
			// Update theme attribute and persist choice
			document.documentElement.setAttribute("data-theme", theme);
			localStorage.setItem("theme", theme);
			if (this.toggleElement)
				this.toggleElement.checked = theme === "dark";
		}
	}

	// Load external fonts
	class FontLoader {
		static load() {
			const fonts = [
				{
					href: "https://cdn.jsdelivr.net/npm/inter-ui@4.1.0/inter.min.css",
					rel: "stylesheet",
				},
				{
					href: "https://cdn.jsdelivr.net/npm/@fontsource/merriweather-sans@5.2.5/index.min.css",
					rel: "stylesheet",
				},
				{
					href: "https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.2.5/index.min.css",
					rel: "stylesheet",
				},
			];
			fonts.forEach((font) => {
				const link = document.createElement("link");
				link.rel = font.rel;
				link.href = font.href;
				document.head.appendChild(link);
			});
		}
	}

	// Save and restore scroll position
	class ScrollManager {
		static save() {
			localStorage.setItem("scrollPosition", window.scrollY);
		}
		static restore() {
			const pos = localStorage.getItem("scrollPosition");
			if (pos) window.scrollTo(0, parseInt(pos, 10));
		}
	}

	// Load markdown content and cache it
	class MarkdownLoader {
		constructor(contentSelector) {
			this.contentEl = document.querySelector(contentSelector);
			this.cacheKey = "guideCache";
			this.cacheTTL = 24 * 60 * 60 * 1000;
			this.configureMarked();
			this.load();
		}

		configureMarked() {
			// Enable GitHub-flavored markdown with breaks
			marked.use({ gfm: true, breaks: true });
		}

		fixLinks() {
			// Set external links to open in new tabs
			document.querySelectorAll("p a").forEach((link) => {
				link.setAttribute("target", "_blank");
				link.setAttribute("rel", "noopener noreferrer");
			});
		}

		async fetchAndUpdateCache() {
			try {
				const response = await fetch("guide.md");
				if (!response.ok)
					throw new Error(`HTTP error: ${response.status}`);
				const markdown = await response.text();
				localStorage.setItem(
					this.cacheKey,
					JSON.stringify({ content: markdown, timestamp: Date.now() })
				);
				this.contentEl.innerHTML = marked.parse(markdown);
				this.fixLinks();
				ScrollManager.restore();
			} catch (err) {
				console.error("Fetch error:", err);
				const cache = localStorage.getItem(this.cacheKey);
				if (cache) {
					const { content } = JSON.parse(cache);
					this.contentEl.innerHTML = marked.parse(content);
					this.fixLinks();
					ScrollManager.restore();
				}
			}
		}

		async load() {
			try {
				const cache = localStorage.getItem(this.cacheKey);
				if (cache) {
					const parsed = JSON.parse(cache);
					if (Date.now() - parsed.timestamp < this.cacheTTL) {
						this.contentEl.innerHTML = marked.parse(parsed.content);
						this.fixLinks();
						this.fetchAndUpdateCache();
						return;
					}
				}
				await this.fetchAndUpdateCache();
			} catch (err) {
				console.error("Markdown load error:", err);
				this.contentEl.innerHTML =
					"<p>Error loading content. Please try again.</p>";
			}
		}
	}

	// Load changelog markdown
	class ChangelogLoader {
		static async load() {
			const container = document.getElementById("changelogContainer");
			if (!container) return;
			try {
				const res = await fetch("changelog.md");
				if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
				const markdown = await res.text();
				container.innerHTML = marked.parse(markdown);
			} catch (err) {
				console.error("Changelog error:", err);
				container.innerHTML =
					"<p>Error loading changelog. Please try again.</p>";
			}
		}
	}

	// Manage accessibility settings
	class AccessibilityManager {
		static load() {
			// Line height
			const lineHeight = localStorage.getItem("lineHeight");
			if (lineHeight) {
				document.getElementById("lineHeightSelector").value =
					lineHeight;
				const lh =
					lineHeight === "tight"
						? 1.3
						: lineHeight === "relaxed"
						? 1.8
						: lineHeight === "loose"
						? 2.0
						: 1.7;
				document.body.style.lineHeight = lh;
			}
			// Content width
			const contentWidth = localStorage.getItem("contentWidth");
			if (contentWidth) {
				document.getElementById("contentWidth").value = contentWidth;
				const maxWidth =
					contentWidth === "narrow"
						? "40rem"
						: contentWidth === "wide"
						? "65rem"
						: contentWidth === "full"
						? "100%"
						: "50rem";
				const prose = document.querySelector(".prose");
				if (prose) prose.style.maxWidth = maxWidth;
			}
			// Contrast mode
			const contrast = localStorage.getItem("highContrast");
			if (contrast) {
				const high = contrast === "true";
				document.getElementById("highContrastMode").checked = high;
				document.documentElement.setAttribute(
					"data-contrast",
					high ? "high" : "normal"
				);
			}
			// Reduced motion
			const motion = localStorage.getItem("reducedMotion");
			if (motion) {
				const reduced = motion === "true";
				document.getElementById("reducedMotion").checked = reduced;
				document.documentElement.setAttribute(
					"data-motion",
					reduced ? "reduced" : "normal"
				);
			}
		}
	}

	// Modal for info and shortcuts
	class ModalManager {
		constructor() {
			this.init();
		}

		init() {
			this.createInfoModal();
			this.setupShortcuts();
		}

		createInfoModal() {
			// Create info button
			const infoBtn = document.createElement("button");
			infoBtn.className = "info-btn";
			infoBtn.setAttribute("aria-label", "Information and shortcuts");
			infoBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		  <circle cx="12" cy="12" r="10"></circle>
		  <line x1="12" y1="16" x2="12" y2="12"></line>
		  <line x1="12" y1="8" x2="12.01" y2="8"></line>
		</svg>`;

			// Create modal container
			const modal = document.createElement("div");
			modal.className = "info-modal";
			modal.id = "infoModal";
			modal.setAttribute("role", "dialog");
			modal.setAttribute("aria-labelledby", "modalTitle");
			modal.style.display = "none";

			// Create modal content
			const modalContent = document.createElement("div");
			modalContent.className = "info-modal-content";

			const closeBtn = document.createElement("button");
			closeBtn.className = "close-btn";
			closeBtn.innerHTML = "&times;";
			closeBtn.setAttribute("aria-label", "Close");

			const modalHeader = document.createElement("div");
			modalHeader.className = "info-modal-header";
			const modalTitle = document.createElement("h2");
			modalTitle.id = "modalTitle";
			modalTitle.textContent = "Information & Shortcuts";
			modalHeader.appendChild(modalTitle);

			const tabContainer = document.createElement("div");
			tabContainer.className = "tab-container";
			const tabs = [
				{ id: "shortcuts", label: "Shortcuts", active: true },
				{ id: "accessibility", label: "Accessibility" },
				{ id: "changelog", label: "Changelog" },
			];
			tabs.forEach((tab) => {
				const btn = document.createElement("button");
				btn.className = "tab-btn" + (tab.active ? " active" : "");
				btn.textContent = tab.label;
				btn.setAttribute("data-tab", tab.id);
				tabContainer.appendChild(btn);
			});

			const tabContent = document.createElement("div");
			tabContent.className = "tab-content";
			const tabsContent = {
				shortcuts: `
			<h3>Keyboard Shortcuts</h3>
			<table class="shortcuts-table">
			  <tr><td><kbd>?</kbd></td><td>Show help</td></tr>
			  <tr><td><kbd>T</kbd></td><td>Toggle theme</td></tr>
			  <tr><td><kbd>Esc</kbd></td><td>Close dialog</td></tr>
			</table>
		  `,
				accessibility: `
			<h3>Accessibility Features</h3>
			<p>Options for font size, family, themes, and reading progress.</p>
			<div class="accessibility-settings">
			  <div class="setting-group">
				<label for="lineHeightSelector">Line Height:</label>
				<select id="lineHeightSelector">
				  <option value="tight">Tight (1.3)</option>
				  <option value="normal" selected>Normal (1.7)</option>
				  <option value="relaxed">Relaxed (1.8)</option>
				  <option value="loose">Loose (2.0)</option>
				</select>
			  </div>
			  <div class="setting-group">
				<label for="contentWidth">Content Width:</label>
				<select id="contentWidth">
				  <option value="narrow">Narrow</option>
				  <option value="medium" selected>Medium</option>
				  <option value="wide">Wide</option>
				  <option value="full">Full Width</option>
				</select>
			  </div>
			  <div class="setting-group">
				<label for="highContrastMode">High Contrast:</label>
				<input type="checkbox" id="highContrastMode">
			  </div>
			  <div class="setting-group">
				<label for="reducedMotion">Reduced Motion:</label>
				<input type="checkbox" id="reducedMotion">
			  </div>
			</div>
		  `,
				changelog: `<div id="changelogContainer"><p>Loading changelog...</p></div>`,
			};

			Object.entries(tabsContent).forEach(([id, html]) => {
				const pane = document.createElement("div");
				pane.className =
					"tab-pane" + (id === "shortcuts" ? " active" : "");
				pane.id = id;
				pane.innerHTML = html;
				tabContent.appendChild(pane);
			});

			modalContent.append(
				closeBtn,
				modalHeader,
				tabContainer,
				tabContent
			);
			modal.appendChild(modalContent);

			// Open modal and disable scrolling
			infoBtn.addEventListener("click", () => {
				modal.style.display = "flex";
				this.disableScroll();
			});
			// Close modal and enable scrolling
			closeBtn.addEventListener("click", () => {
				modal.style.display = "none";
				this.enableScroll();
			});
			window.addEventListener("click", (e) => {
				if (e.target === modal) {
					modal.style.display = "none";
					this.enableScroll();
				}
			});
			// Tab switching logic
			tabContainer.addEventListener("click", (e) => {
				if (e.target.classList.contains("tab-btn")) {
					tabContainer
						.querySelectorAll(".tab-btn")
						.forEach((btn) => btn.classList.remove("active"));
					e.target.classList.add("active");
					tabContent
						.querySelectorAll(".tab-pane")
						.forEach((pane) => pane.classList.remove("active"));
					const target = document.getElementById(
						e.target.getAttribute("data-tab")
					);
					target.classList.add("active");
					if (e.target.getAttribute("data-tab") === "changelog") {
						ChangelogLoader.load();
					}
				}
			});

			const headerContent = document.querySelector(".header-content");
			headerContent?.appendChild(infoBtn);
			document.body.appendChild(modal);
			AccessibilityManager.load();

			// Accessibility settings event listeners
			document
				.getElementById("lineHeightSelector")
				?.addEventListener("change", (e) => {
					const val = e.target.value;
					localStorage.setItem("lineHeight", val);
					const lh =
						val === "tight"
							? 1.3
							: val === "relaxed"
							? 1.8
							: val === "loose"
							? 2.0
							: 1.7;
					document.body.style.lineHeight = lh;
				});
			document
				.getElementById("contentWidth")
				?.addEventListener("change", (e) => {
					const val = e.target.value;
					localStorage.setItem("contentWidth", val);
					const maxWidth =
						val === "narrow"
							? "40rem"
							: val === "wide"
							? "65rem"
							: val === "full"
							? "100%"
							: "50rem";
					const prose = document.querySelector(".prose");
					if (prose) prose.style.maxWidth = maxWidth;
				});
			document
				.getElementById("highContrastMode")
				?.addEventListener("change", (e) => {
					const high = e.target.checked;
					localStorage.setItem("highContrast", high);
					document.documentElement.setAttribute(
						"data-contrast",
						high ? "high" : "normal"
					);
				});
			document
				.getElementById("reducedMotion")
				?.addEventListener("change", (e) => {
					const reduced = e.target.checked;
					localStorage.setItem("reducedMotion", reduced);
					document.documentElement.setAttribute(
						"data-motion",
						reduced ? "reduced" : "normal"
					);
				});
		}

		setupShortcuts() {
			// Keyboard shortcuts for modal and theme toggle
			document.addEventListener("keydown", (e) => {
				if (!e.ctrlKey && !e.altKey) {
					if (e.key === "?") {
						e.preventDefault();
						const modal = document.getElementById("infoModal");
						modal.style.display =
							modal.style.display === "none" ||
							modal.style.display === ""
								? "flex"
								: "none";
						return;
					}
					if (e.key === "Escape") {
						const modal = document.getElementById("infoModal");
						if (modal && modal.style.display !== "none") {
							modal.style.display = "none";
							this.enableScroll();
						}
						return;
					}
					if (
						e.key.toLowerCase() === "t" &&
						!["INPUT", "TEXTAREA"].includes(
							document.activeElement.tagName
						)
					) {
						e.preventDefault();
						const themeToggle =
							document.querySelector("#themeToggle");
						if (themeToggle) {
							themeToggle.checked = !themeToggle.checked;
							themeToggle.dispatchEvent(new Event("change"));
						}
					}
				}
			});
		}

		disableScroll() {
			// Save current scroll and disable body scrolling
			this.savedScroll = window.pageYOffset;
			document.body.style.overflow = "hidden";
			document.body.style.position = "fixed";
			document.body.style.top = `-${this.savedScroll}px`;
			document.body.style.width = "100%";
		}

		enableScroll() {
			// Restore scrolling
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
			window.scrollTo(0, this.savedScroll);
		}
	}

	// Mobile enhancements
	class MobileEnhancer {
		static fixViewport() {
			// Set CSS variable for viewport height
			const setVH = () => {
				const vh = window.innerHeight * 0.01;
				document.documentElement.style.setProperty("--vh", `${vh}px`);
			};
			setVH();
			window.addEventListener("resize", setVH);
		}

		static detectTouch() {
			// Add class for touch devices
			if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
				document.documentElement.classList.add("touch-device");
			}
		}

		static preventDoubleTapZoom() {
			// Prevent double-tap zoom on interactive elements
			let lastTap = 0;
			const handleTouch = (e) => {
				const now = Date.now();
				if (now - lastTap < 500 && now - lastTap > 0)
					e.preventDefault();
				lastTap = now;
			};
			document
				.querySelectorAll(
					'.tab-btn, .theme-switch, button:not([type="submit"])'
				)
				.forEach((el) =>
					el.addEventListener("touchstart", handleTouch, {
						passive: false,
					})
				);
		}

		static enhanceCodeBlocks() {
			// Add scroll indicators to code blocks
			const enhance = () => {
				document.querySelectorAll("pre").forEach((pre) => {
					pre.classList.toggle("scroll-left", pre.scrollLeft > 0);
					pre.classList.toggle(
						"scroll-right",
						pre.scrollLeft + pre.clientWidth < pre.scrollWidth
					);
				});
				document
					.querySelectorAll("pre")
					.forEach((pre) => pre.dispatchEvent(new Event("scroll")));
			};
			enhance();
			document.addEventListener("DOMContentLoaded", enhance);
			const contentEl = document.querySelector("#content");
			if (contentEl) {
				const observer = new MutationObserver(enhance);
				observer.observe(contentEl, { childList: true });
			}
		}

		static init() {
			this.fixViewport();
			this.detectTouch();
			this.preventDoubleTapZoom();
			this.enhanceCodeBlocks();
		}
	}

	// Initialize components
	const themeManager = new ThemeManager("#themeToggle");
	FontLoader.load();
	new MarkdownLoader("#content");
	new ModalManager();
	MobileEnhancer.init();

	// Save scroll position with debounce
	window.addEventListener("scroll", () => {
		clearTimeout(window.scrollTimer);
		window.scrollTimer = setTimeout(ScrollManager.save, 100);
	});
});
