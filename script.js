// Problem2Project - Modern JavaScript Application
// Enhanced functionality for problem discovery and exploration

class Problem2Project {
    constructor() {
        this.problems = [];
        this.allProblems = [];
        this.currentCategory = null;
        this.currentView = 'grid';
        this.domains = {};
        this.bookmarkedProblems = this.getBookmarkedProblems();
        this.ignoreNextHashChange = false; // Flag to prevent automatic reopening
        this.init();
    }

    async init() {
        try {
            // Initialize theme first
            this.initializeTheme();
            // Load problems data using the data manager
            await loadProblemsData();
            this.loadData();
            this.generateCategoriesGrid();
            this.setupEventListeners();
            this.updateProblemCounts();
            this.hideLoadingScreen();
            this.setupIntersectionObserver();
            // Initialize bookmarks with a small delay to ensure DOM is ready
            setTimeout(() => {
                this.updateBookmarkCounts();
                this.updateBookmarkLists();
            }, 100);
            // Handle shared problem links
            this.handleSharedProblemLink();
            // Handle random problem trigger from other pages
            this.handleRandomProblemTrigger();
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.hideLoadingScreen();
        }
    }

    loadData() {
        try {
            // Use the embedded DataManager to get problems data
            this.problems = PROBLEMS_DATA.problems;
            this.allProblems = [...PROBLEMS_DATA.problems];
            this.domains = PROBLEMS_DATA.domains;

            // Update total problems count
            const totalProblemsEl = document.getElementById('total-problems');
            if (totalProblemsEl) {
                totalProblemsEl.textContent = `${this.problems.length}+`;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    generateCategoriesGrid() {
        const categoriesGrid = document.getElementById('categories-grid');
        if (!categoriesGrid) {
            console.warn('Categories grid element not found');
            return;
        }

        try {
            // Clear existing content
            categoriesGrid.innerHTML = '';

            // Generate category cards for all 20 domains
            Object.entries(DOMAINS).forEach(([domainId, domainInfo]) => {
                const categoryCard = this.createCategoryCard(domainId, domainInfo);
                if (categoryCard) {
                    categoriesGrid.appendChild(categoryCard);
                }
            });
        } catch (error) {
            console.error('Error generating categories grid:', error);
        }
    }

    createCategoryCard(domainId, domainInfo) {
        if (!domainId || !domainInfo) {
            console.warn('Invalid domain data:', domainId, domainInfo);
            return null;
        }
        
        try {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'category-card group';
            cardDiv.setAttribute('data-category', domainInfo.category || '');
            cardDiv.setAttribute('data-domain', domainId);

        cardDiv.innerHTML = `
            <div class="relative overflow-hidden bg-gradient-to-br ${domainInfo.gradient} dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 h-full cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-${domainInfo.color}-100 dark:border-gray-600 hover:border-${domainInfo.color}-300 dark:hover:border-${domainInfo.color}-400">
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${domainInfo.color}-400/10 to-${domainInfo.color === 'yellow' ? 'amber' : domainInfo.color}-400/10 dark:from-${domainInfo.color}-400/20 dark:to-${domainInfo.color === 'yellow' ? 'amber' : domainInfo.color}-400/20 rounded-full -translate-y-16 translate-x-16"></div>
                <div class="relative z-10">
                    <div class="w-12 h-12 bg-gradient-to-br ${domainInfo.iconGradient} rounded-xl flex items-center justify-center mb-4">
                        <i class="${domainInfo.icon} text-white text-xl"></i>
                    </div>
                    <h3 class="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">${domainInfo.shortName}</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">${domainInfo.description}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-${domainInfo.textColor} dark:text-${domainInfo.textColor.replace('-600', '-400')} font-semibold" id="count-${domainId}">0 problems</span>
                        <i class="fas fa-arrow-right text-gray-400 dark:text-gray-500 group-hover:text-${domainInfo.textColor.replace('-600', '-500')} dark:group-hover:text-${domainInfo.textColor.replace('-600', '-400')} group-hover:translate-x-1 transition-all"></i>
                    </div>
                </div>
            </div>
        `;

            // Add click event listener
            cardDiv.addEventListener('click', () => {
                this.selectCategory(domainInfo.category, domainId);
            });

            return cardDiv;
        } catch (error) {
            console.error('Error creating category card for domain:', domainId, error);
            return null;
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1500);
        }
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Search functionality
        this.setupSearch();
        
        // Category cards
        this.setupCategoryCards();
        
        // Problem interactions
        this.setupProblemInteractions();
        
        // Modal functionality
        this.setupModal();
        
        // Contact form
        this.setupContactForm();
        
        // Utility functions
        this.setupUtilities();
        
        // Hash change handling for shared links
        window.addEventListener('hashchange', () => {
            if (this.ignoreNextHashChange) {
                this.ignoreNextHashChange = false;
                return;
            }
            this.handleSharedProblemLink();
        });
    }

    setupNavigation() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Scroll to top button
        const scrollToTopButton = document.getElementById('scrollToTop');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopButton.classList.remove('opacity-0', 'invisible');
            } else {
                scrollToTopButton.classList.add('opacity-0', 'invisible');
            }
        });

        scrollToTopButton?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    setupSearch() {
        // Global search overlay
        const searchToggle = document.getElementById('search-toggle');
        const searchOverlay = document.getElementById('search-overlay');
        const searchClose = document.getElementById('search-close');
        const globalSearch = document.getElementById('global-search');

        searchToggle?.addEventListener('click', () => {
            searchOverlay.classList.remove('hidden');
            globalSearch.focus();
        });

        searchClose?.addEventListener('click', () => {
            searchOverlay.classList.add('hidden');
        });

        searchOverlay?.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.add('hidden');
            }
        });

        // Global search functionality
        globalSearch?.addEventListener('input', (e) => {
            this.performGlobalSearch(e.target.value);
        });

        // Search suggestions
        document.querySelectorAll('.search-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                globalSearch.value = suggestion.textContent;
                this.performGlobalSearch(suggestion.textContent);
            });
        });

        // Category search
        const categorySearch = document.getElementById('category-search');
        categorySearch?.addEventListener('input', (e) => {
            this.filterCategories(e.target.value);
        });

        // Problems search
        const problemsSearch = document.getElementById('problems-search');
        problemsSearch?.addEventListener('input', (e) => {
            this.filterProblems(e.target.value);
        });
    }

    setupCategoryCards() {
        // Category cards are now dynamically generated and have their event listeners
        // attached in the createCategoryCard method
        
        // View toggle for categories
        const viewToggle = document.getElementById('view-toggle');
        viewToggle?.addEventListener('click', () => {
            this.toggleCategoryView();
        });

        // Sort categories
        const sortCategories = document.getElementById('sort-categories');
        sortCategories?.addEventListener('change', (e) => {
            this.sortCategories(e.target.value);
        });
    }

    setupProblemInteractions() {
        // View toggle for problems
        const gridView = document.getElementById('grid-view');
        const listView = document.getElementById('list-view');

        gridView?.addEventListener('click', () => {
            this.currentView = 'grid';
            gridView.classList.add('bg-blue-600', 'text-white');
            gridView.classList.remove('bg-gray-200', 'text-gray-600');
            listView.classList.add('bg-gray-200', 'text-gray-600');
            listView.classList.remove('bg-blue-600', 'text-white');
            this.displayProblems(this.problems);
        });

        listView?.addEventListener('click', () => {
            this.currentView = 'list';
            listView.classList.add('bg-blue-600', 'text-white');
            listView.classList.remove('bg-gray-200', 'text-gray-600');
            gridView.classList.add('bg-gray-200', 'text-gray-600');
            gridView.classList.remove('bg-blue-600', 'text-white');
            this.displayProblems(this.problems);
        });

        // Sort problems
        const problemsSort = document.getElementById('problems-sort');
        problemsSort?.addEventListener('change', (e) => {
            this.sortProblems(e.target.value);
        });

        // Load more button
        const loadMore = document.getElementById('load-more');
        loadMore?.addEventListener('click', () => {
            this.loadMoreProblems();
        });
    }

    setupModal() {
        const modal = document.getElementById('problemModal');
        
        // Close modal events
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Bookmark functionality (desktop)
        const bookmarkBtn = document.getElementById('bookmark-btn');
        bookmarkBtn?.addEventListener('click', () => {
            this.toggleBookmark();
        });

        // Bookmark functionality (mobile)
        const bookmarkBtnMobile = document.getElementById('bookmark-btn-mobile');
        bookmarkBtnMobile?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleBookmark();
        });
        // Add touch event for better mobile responsiveness
        bookmarkBtnMobile?.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleBookmark();
        });

        // Share functionality (desktop)
        const shareBtn = document.getElementById('share-btn');
        shareBtn?.addEventListener('click', () => {
            this.shareProblem();
        });

        // Share functionality (mobile)
        const shareBtnMobile = document.getElementById('share-btn-mobile');
        shareBtnMobile?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.shareProblem();
        });
        // Add touch event for better mobile responsiveness
        shareBtnMobile?.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.shareProblem();
        });
    }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        contactForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactForm(e.target);
        });
    }

    setupUtilities() {
        // Theme toggle for desktop
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Theme toggle for mobile (in top navbar)
        const themeToggleMobile = document.getElementById('theme-toggle-mobile');
        themeToggleMobile?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Search toggle for mobile (in top navbar)
        const searchToggleMobile = document.getElementById('search-toggle-mobile');
        const searchOverlay = document.getElementById('search-overlay');
        const globalSearch = document.getElementById('global-search');
        searchToggleMobile?.addEventListener('click', () => {
            searchOverlay?.classList.remove('hidden');
            globalSearch?.focus();
        });

        // Bookmarks dropdown for desktop
        const bookmarksToggle = document.getElementById('bookmarks-toggle');
        const bookmarksDropdown = document.getElementById('bookmarks-dropdown');
        bookmarksToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleBookmarksDropdown();
        });

        // Bookmarks overlay for mobile
        const bookmarksToggleMobileBottom = document.getElementById('bookmarks-toggle-mobile-bottom');
        const bookmarksOverlay = document.getElementById('bookmarks-overlay');
        const bookmarksClose = document.getElementById('bookmarks-close');
        
        bookmarksToggleMobileBottom?.addEventListener('click', () => {
            this.showBookmarksOverlay();
        });
        
        bookmarksClose?.addEventListener('click', () => {
            this.hideBookmarksOverlay();
        });
        
        bookmarksOverlay?.addEventListener('click', (e) => {
            if (e.target === bookmarksOverlay) {
                this.hideBookmarksOverlay();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#bookmarks-toggle') && !e.target.closest('#bookmarks-dropdown')) {
                this.hideBookmarksDropdown();
            }
        });

        // Random problem button
        window.showRandomProblem = () => {
            this.showRandomProblem();
        };

        // Related problems
        window.showRelatedProblems = () => {
            this.showRelatedProblems();
        };
    }

    setupIntersectionObserver() {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.category-card, .problem-card').forEach(el => {
            observer.observe(el);
        });
    }

    updateProblemCounts() {
        Object.keys(this.domains).forEach(domainId => {
            const count = this.problems.filter(p => p.domain === domainId).length;
            const countElement = document.getElementById(`count-${domainId}`);
            if (countElement) {
                countElement.textContent = `${count} problems`;
            }
        });
    }

    selectCategory(category, domain) {
        this.currentCategory = { category, domain };
        
        // Filter problems by domain
        const filteredProblems = this.allProblems.filter(p => p.domain === domain);
        this.problems = filteredProblems;

        // Update UI
        this.displayCategoryKeywords(category);
        this.displayProblems(filteredProblems);
        this.showProblemsSection(category);

        // Scroll to problems section
        setTimeout(() => {
            document.getElementById('problems').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    displayCategoryKeywords(category) {
        const keywordsContainer = document.getElementById('keywords-container');
        const keywordsList = document.getElementById('keywords-list');
        const categoryName = document.getElementById('selected-category-name');

        // Get keywords using the DataManager
        const keywords = this.getCategoryKeywords(category);
        const domainInfo = Object.values(DOMAINS).find(d => d.category === category);

        categoryName.textContent = domainInfo ? domainInfo.shortName : category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
        keywordsList.innerHTML = '';

        keywords.forEach(keyword => {
            const span = document.createElement('span');
            span.className = 'px-4 py-2 bg-white border border-blue-200 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-300';
            span.textContent = keyword;
            span.addEventListener('click', () => {
                this.filterProblemsByKeyword(keyword);
            });
            keywordsList.appendChild(span);
        });

        keywordsContainer.classList.remove('hidden');
    }

    getCategoryKeywords(category) {
        // Map category names to domain keyword keys
        const categoryToKeywordMap = {
            'programming': 'Programming_Algorithms',
            'math': 'Math',
            'physics': 'Physics',
            'chemistry': 'Chemistry',
            'biology': 'Biology',
            'data-science': 'DataScience',
            'electronics': 'Electronics',
            'robotics': 'Robotics',
            'mechanical': 'Mechanical',
            'civil': 'Civil',
            'healthcare': 'Healthcare',
            'ux-design': 'UXDesign',
            'business': 'Business',
            'security': 'Security',
            'iot': 'IoT',
            'education': 'Education',
            'energy': 'Energy',
            'agriculture': 'Agriculture',
            'legal': 'Legal',
            'social-impact': 'SocialImpact',
            // New domains
            'aerospace': 'Aerospace',
            'automotive': 'Automotive',
            'finance': 'Finance',
            'gaming': 'Gaming',
            'materials': 'Materials',
            'telecom': 'Telecom',
            'pharma': 'Pharma',
            'media': 'Media',
            'logistics': 'Logistics',
            'climate': 'Climate',
            'vr-metaverse': 'VRMetaverse',
            'quantum': 'Quantum'
        };

        const keywordKey = categoryToKeywordMap[category];
        if (keywordKey && DOMAIN_KEYWORDS[keywordKey]) {
            return DOMAIN_KEYWORDS[keywordKey].keywords.slice(0, 12); // Show first 12 keywords
        }

        // Fallback keywords
        return ['Innovation', 'Technology', 'Problem Solving', 'Research', 'Development'];
    }

    displayProblems(problems) {
        const problemsGrid = document.getElementById('problems-grid');
        const loading = document.getElementById('loading');
        const noProblems = document.getElementById('no-problems');

        loading.classList.add('hidden');
        noProblems.classList.add('hidden');
        problemsGrid.innerHTML = '';

        if (problems.length === 0) {
            noProblems.classList.remove('hidden');
            return;
        }

        problems.forEach((problem, index) => {
            const card = this.createProblemCard(problem, index);
            problemsGrid.appendChild(card);
        });

        // Update grid layout based on view
        if (this.currentView === 'list') {
            problemsGrid.className = 'space-y-4';
        } else {
            problemsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
        }
    }

    createProblemCard(problem, index) {
        const card = document.createElement('div');
        const isBookmarked = this.bookmarkedProblems.includes(problem.id.toString());
        
        if (this.currentView === 'list') {
            card.className = 'problem-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500';
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-lightbulb text-white text-sm"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">${problem.title}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Problem #${problem.id}</p>
                            </div>
                        </div>
                        <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">${problem.description}</p>
                        <div class="flex flex-wrap gap-2">
                            ${problem.keywords.slice(0, 4).map(kw => 
                                `<span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">${kw}</span>`
                            ).join('')}
                            ${problem.keywords.length > 4 ? `<span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">+${problem.keywords.length - 4} more</span>` : ''}
                        </div>
                    </div>
                    <div class="flex flex-col space-y-2 ml-4">
                        <button class="bookmark-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}" data-problem-id="${problem.id}">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        <button class="share-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            card.className = 'problem-card group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500 hover:-translate-y-1';
            card.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <i class="fas fa-lightbulb text-white"></i>
                    </div>
                    <div class="flex space-x-1">
                        <button class="bookmark-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}" data-problem-id="${problem.id}">
                            <i class="fas fa-bookmark text-sm"></i>
                        </button>
                        <button class="share-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400 dark:text-gray-500">
                            <i class="fas fa-share-alt text-sm"></i>
                        </button>
                    </div>
                </div>
                
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${problem.title}</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">${problem.description}</p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    ${problem.keywords.slice(0, 3).map(kw => 
                        `<span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">${kw}</span>`
                    ).join('')}
                    ${problem.keywords.length > 3 ? `<span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">+${problem.keywords.length - 3}</span>` : ''}
                </div>
                
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Problem #${problem.id}</span>
                    <i class="fas fa-arrow-right text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all"></i>
                </div>
            `;
        }

        // Add click event for modal
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.bookmark-btn') && !e.target.closest('.share-btn')) {
                this.showProblemDetails(problem);
            }
        });

        // Add bookmark functionality
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        bookmarkBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleBookmarkFromCard(problem.id, bookmarkBtn);
        });

        // Add share functionality
        const shareBtn = card.querySelector('.share-btn');
        shareBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.shareSpecificProblem(problem);
        });

        return card;
    }

    showProblemsSection(categoryName) {
        const problemsSection = document.getElementById('problems');
        const currentCategory = document.getElementById('current-category');
        
        currentCategory.textContent = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace('-', ' ');
        problemsSection.classList.remove('hidden');
    }

    showProblemDetails(problem) {
        const modal = document.getElementById('problemModal');
        const title = document.getElementById('modalTitle');
        const description = document.getElementById('modalDescription');
        const keywords = document.getElementById('modalKeywords');
        const domain = document.getElementById('modalDomain');
        const domainBadge = document.getElementById('modalDomainBadge');
        const id = document.getElementById('modalId');

        // Get domain information
        const domainInfo = DOMAINS[problem.domain] || { shortName: 'Unknown Domain', category: 'unknown' };

        title.textContent = problem.title;
        description.textContent = problem.description;
        domain.textContent = domainInfo.shortName;
        domainBadge.textContent = `${domainInfo.category} • Problem #${problem.id}`;
        id.textContent = problem.id;

        // Generate keywords with dark mode support
        keywords.innerHTML = problem.keywords.map(kw => 
            `<span class="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium hover:shadow-md transition-shadow">${kw}</span>`
        ).join('');

        // Update bookmark buttons (both desktop and mobile)
        const bookmarkBtn = document.getElementById('bookmark-btn');
        const bookmarkBtnMobile = document.getElementById('bookmark-btn-mobile');
        const isBookmarked = this.bookmarkedProblems.includes(problem.id.toString());
        
        // Update desktop bookmark button
        if (bookmarkBtn) {
            bookmarkBtn.innerHTML = `<i class="fa${isBookmarked ? 's' : 'r'} fa-bookmark text-${isBookmarked ? 'yellow-500' : 'gray-600 dark:text-gray-400'} mr-2"></i>
                                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>`;
            bookmarkBtn.dataset.problemId = problem.id.toString();
        }
        
        // Update mobile bookmark button
        if (bookmarkBtnMobile) {
            bookmarkBtnMobile.innerHTML = `<i class="fa${isBookmarked ? 's' : 'r'} fa-bookmark text-${isBookmarked ? 'yellow-500' : 'gray-600 dark:text-gray-400'}"></i>`;
            bookmarkBtnMobile.dataset.problemId = problem.id.toString();
        }

        // Generate dynamic reference links
        this.generateReferenceLinks(problem);

        // Show modal as full screen
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Store current problem for sharing
        this.currentProblem = problem;
    }

    generateReferenceLinks(problem) {
        // Create search queries based on problem keywords and title
        const searchTerms = encodeURIComponent(`${problem.title} ${problem.keywords.slice(0, 3).join(' ')}`);
        const domainTerms = encodeURIComponent(`${problem.domain} ${problem.keywords[0] || ''}`);
        
        // Update all reference links with dynamic URLs
        const referenceLinks = document.querySelectorAll('.reference-link');
        console.log('Found reference links:', referenceLinks.length);
        
        if (referenceLinks.length >= 7) {
            // Google Scholar
            referenceLinks[0].href = `https://scholar.google.com/scholar?q=${searchTerms}`;
            referenceLinks[0].target = '_blank';
            console.log('Set Google Scholar link:', referenceLinks[0].href);
            
            // Wikipedia
            referenceLinks[1].href = `https://en.wikipedia.org/wiki/Special:Search?search=${searchTerms}`;
            referenceLinks[1].target = '_blank';
            
            // Reddit
            referenceLinks[2].href = `https://www.reddit.com/search/?q=${searchTerms}&type=link`;
            referenceLinks[2].target = '_blank';
            
            // Google Patents
            referenceLinks[3].href = `https://patents.google.com/?q=${searchTerms}`;
            referenceLinks[3].target = '_blank';
            
            // USPTO Database
            referenceLinks[4].href = `https://ppubs.uspto.gov/dirsearch-public/searches/searchss?query=${searchTerms}`;
            referenceLinks[4].target = '_blank';
            
            // GitHub
            referenceLinks[5].href = `https://github.com/search?q=${searchTerms}&type=repositories`;
            referenceLinks[5].target = '_blank';
            
            // Stack Overflow
            referenceLinks[6].href = `https://stackoverflow.com/search?q=${searchTerms}`;
            referenceLinks[6].target = '_blank';
            
            // ArXiv (if there's a 7th link)
            if (referenceLinks.length >= 8) {
                referenceLinks[7].href = `https://arxiv.org/search/?query=${searchTerms}`;
                referenceLinks[7].target = '_blank';
            }
            
            console.log('All reference links configured successfully');
        } else {
            console.warn('Not enough reference links found:', referenceLinks.length);
        }
    }

    closeModal() {
        const modal = document.getElementById('problemModal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.currentProblem = null;
        
        // Clear the hash to prevent reopening when navigating back
        if (window.location.hash.startsWith('#problem-')) {
            this.ignoreNextHashChange = true;
            // Use replaceState to avoid adding to browser history
            window.history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }

    performGlobalSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        const resultsList = document.getElementById('search-results-list');

        if (!query.trim()) {
            resultsContainer.classList.add('hidden');
            return;
        }

        const results = this.allProblems.filter(problem => 
            problem.title.toLowerCase().includes(query.toLowerCase()) ||
            problem.description.toLowerCase().includes(query.toLowerCase()) ||
            problem.keywords.some(kw => kw.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 10);

        resultsList.innerHTML = '';
        
        if (results.length > 0) {
            results.forEach(problem => {
                const item = document.createElement('div');
                item.className = 'p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100';
                item.innerHTML = `
                    <h4 class="font-semibold text-gray-900">${problem.title}</h4>
                    <p class="text-sm text-gray-600 truncate">${problem.description}</p>
                    <div class="flex gap-1 mt-2">
                        ${problem.keywords.slice(0, 2).map(kw => 
                            `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">${kw}</span>`
                        ).join('')}
                    </div>
                `;
                item.addEventListener('click', () => {
                    this.showProblemDetails(problem);
                    document.getElementById('search-overlay').classList.add('hidden');
                });
                resultsList.appendChild(item);
            });
            resultsContainer.classList.remove('hidden');
        } else {
            resultsList.innerHTML = '<p class="text-gray-500 text-center py-4">No results found</p>';
            resultsContainer.classList.remove('hidden');
        }
    }

    filterCategories(query) {
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const matches = title.includes(query.toLowerCase()) || description.includes(query.toLowerCase());
            card.style.display = matches ? 'block' : 'none';
        });
    }

    filterProblems(query) {
        if (!query.trim()) {
            this.displayProblems(this.problems);
            return;
        }

        const filtered = this.problems.filter(problem => 
            problem.title.toLowerCase().includes(query.toLowerCase()) ||
            problem.description.toLowerCase().includes(query.toLowerCase()) ||
            problem.keywords.some(kw => kw.toLowerCase().includes(query.toLowerCase()))
        );

        this.displayProblems(filtered);
    }

    filterProblemsByKeyword(keyword) {
        const filtered = this.problems.filter(problem => 
            problem.keywords.some(kw => kw.toLowerCase().includes(keyword.toLowerCase()))
        );
        this.displayProblems(filtered);
    }

    sortProblems(sortBy) {
        let sorted = [...this.problems];
        
        switch(sortBy) {
            case 'title':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'keywords':
                sorted.sort((a, b) => b.keywords.length - a.keywords.length);
                break;
            default: // relevance
                // Keep original order for relevance
                break;
        }
        
        this.displayProblems(sorted);
    }

    toggleBookmark() {
        if (!this.currentProblem) return;
        
        const problemId = this.currentProblem.id.toString();
        const bookmarkBtn = document.getElementById('bookmark-btn');
        const bookmarkBtnMobile = document.getElementById('bookmark-btn-mobile');
        
        if (this.bookmarkedProblems.includes(problemId)) {
            this.bookmarkedProblems = this.bookmarkedProblems.filter(id => id !== problemId);
            // Update desktop button
            if (bookmarkBtn) {
                bookmarkBtn.innerHTML = '<i class="far fa-bookmark text-gray-600 dark:text-gray-400 mr-2"></i><span class="text-sm font-medium text-gray-700 dark:text-gray-300">Bookmark</span>';
            }
            // Update mobile button
            if (bookmarkBtnMobile) {
                bookmarkBtnMobile.innerHTML = '<i class="far fa-bookmark text-gray-600 dark:text-gray-400"></i>';
            }
        } else {
            this.bookmarkedProblems.push(problemId);
            // Update desktop button
            if (bookmarkBtn) {
                bookmarkBtn.innerHTML = '<i class="fas fa-bookmark text-yellow-500 mr-2"></i><span class="text-sm font-medium text-gray-700 dark:text-gray-300">Bookmarked</span>';
            }
            // Update mobile button
            if (bookmarkBtnMobile) {
                bookmarkBtnMobile.innerHTML = '<i class="fas fa-bookmark text-yellow-500"></i>';
            }
        }
        
        this.saveBookmarks();
        this.updateBookmarkCounts();
        this.updateBookmarkLists();
        this.refreshProblemCardsBookmarkState();
    }

    toggleBookmarkFromCard(problemId, button) {
        const id = problemId.toString();
        if (this.bookmarkedProblems.includes(id)) {
            this.bookmarkedProblems = this.bookmarkedProblems.filter(bookmarkId => bookmarkId !== id);
            button.classList.remove('text-yellow-500');
            button.classList.add('text-gray-400');
        } else {
            this.bookmarkedProblems.push(id);
            button.classList.remove('text-gray-400');
            button.classList.add('text-yellow-500');
        }
        
        this.saveBookmarks();
        this.updateBookmarkCounts();
        this.updateBookmarkLists();
        this.refreshProblemCardsBookmarkState();
    }

    getBookmarkedProblems() {
        return JSON.parse(localStorage.getItem('bookmarkedProblems') || '[]');
    }

    saveBookmarks() {
        localStorage.setItem('bookmarkedProblems', JSON.stringify(this.bookmarkedProblems));
    }

    shareProblem() {
        if (!this.currentProblem) return;
        
        // Create clean base URL without any existing hash
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}#problem-${this.currentProblem.id}`;
        
        if (navigator.share) {
            navigator.share({
                title: this.currentProblem.title,
                text: this.currentProblem.description,
                url: shareUrl
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Problem link copied to clipboard!');
            });
        }
    }

    shareSpecificProblem(problem) {
        // Create clean base URL without any existing hash
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}#problem-${problem.id}`;
        
        if (navigator.share) {
            navigator.share({
                title: problem.title,
                text: problem.description,
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Problem link copied to clipboard!');
            });
        }
    }

    showRandomProblem() {
        if (this.allProblems.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * this.allProblems.length);
        const randomProblem = this.allProblems[randomIndex];
        this.showProblemDetails(randomProblem);
    }

    showRelatedProblems() {
        if (!this.currentProblem) return;
        
        // Find problems with similar keywords
        const relatedProblems = this.allProblems.filter(p => 
            p.id !== this.currentProblem.id &&
            p.keywords.some(kw => this.currentProblem.keywords.includes(kw))
        ).slice(0, 6);
        
        this.closeModal();
        
        if (relatedProblems.length > 0) {
            this.problems = relatedProblems;
            this.displayProblems(relatedProblems);
            document.getElementById('current-category').textContent = 'Related Problems';
            document.getElementById('problems').classList.remove('hidden');
            document.getElementById('problems').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('No related problems found!');
        }
    }

    handleContactForm(form) {
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // Simulate form submission
        setTimeout(() => {
            alert(`Thank you ${data.name}! Your message has been sent. We'll get back to you soon.`);
            form.reset();
        }, 1000);
    }

    handleSharedProblemLink() {
        // Check if there's a hash in the URL for a shared problem
        const hash = window.location.hash;
        if (hash && hash.startsWith('#problem-')) {
            const problemId = hash.substring(9); // Remove '#problem-' prefix
            
            // Find the problem by ID
            const problem = this.allProblems.find(p => p.id.toString() === problemId);
            
            if (problem) {
                // Check if modal is already open with the same problem
                const modal = document.getElementById('problemModal');
                if (!modal.classList.contains('hidden') && this.currentProblem && this.currentProblem.id.toString() === problemId) {
                    return; // Don't reopen the same problem
                }
                
                // Wait a bit for the UI to be ready, then show the problem
                setTimeout(() => {
                    this.showProblemDetails(problem);
                }, 500);
            } else {
                console.warn(`Problem with ID ${problemId} not found`);
            }
        }
    }

    handleRandomProblemTrigger() {
        // Check if random problem should be triggered from other pages
        if (sessionStorage.getItem('triggerRandomProblem') === 'true') {
            sessionStorage.removeItem('triggerRandomProblem');
            // Wait a bit for the UI to be ready, then show random problem
            setTimeout(() => {
                this.showRandomProblem();
            }, 500);
        }
    }

    toggleTheme() {
        try {
            const html = document.documentElement;
            const themeToggle = document.getElementById('theme-toggle');
            const themeToggleMobile = document.getElementById('theme-toggle-mobile');
            const currentTheme = localStorage.getItem('theme');
        
            if (currentTheme === 'dark') {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            // Update desktop button
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-moon text-gray-600 dark:text-gray-400"></i>';
            }
            // Update mobile button
            if (themeToggleMobile) {
                themeToggleMobile.innerHTML = '<i class="fas fa-moon text-gray-600 dark:text-gray-400"></i>';
            }
            } else {
                html.classList.add('dark');
                try {
                    localStorage.setItem('theme', 'dark');
                } catch (e) {
                    console.warn('Could not save theme preference');
                }
                // Update desktop button
                if (themeToggle) {
                    themeToggle.innerHTML = '<i class="fas fa-sun text-yellow-400"></i>';
                }
                // Update mobile button
                if (themeToggleMobile) {
                    themeToggleMobile.innerHTML = '<i class="fas fa-sun text-yellow-400"></i>';
                }
            }
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    }

    initializeTheme() {
        try {
            const html = document.documentElement;
            const themeToggle = document.getElementById('theme-toggle');
            const themeToggleMobile = document.getElementById('theme-toggle-mobile');
            
            let savedTheme = null;
            try {
                savedTheme = localStorage.getItem('theme');
            } catch (e) {
                console.warn('localStorage not available for theme storage');
            }
            
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                html.classList.add('dark');
                try {
                    localStorage.setItem('theme', 'dark');
                } catch (e) {
                    console.warn('Could not save theme preference');
                }
                // Update desktop button
                if (themeToggle) {
                    themeToggle.innerHTML = '<i class="fas fa-sun text-yellow-400"></i>';
                }
                // Update mobile button
                if (themeToggleMobile) {
                    themeToggleMobile.innerHTML = '<i class="fas fa-sun text-yellow-400"></i>';
                }
            } else {
                html.classList.remove('dark');
                try {
                    localStorage.setItem('theme', 'light');
                } catch (e) {
                    console.warn('Could not save theme preference');
                }
                // Update desktop button
                if (themeToggle) {
                    themeToggle.innerHTML = '<i class="fas fa-moon text-gray-600 dark:text-gray-400"></i>';
                }
                // Update mobile button
                if (themeToggleMobile) {
                    themeToggleMobile.innerHTML = '<i class="fas fa-moon text-gray-600 dark:text-gray-400"></i>';
                }
            }
        } catch (error) {
            console.error('Error initializing theme:', error);
        }
    }

    toggleCategoryView() {
        const grid = document.getElementById('categories-grid');
        if (grid.classList.contains('grid-cols-1')) {
            grid.classList.remove('grid-cols-1');
            grid.classList.add('md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
        } else {
            grid.classList.add('grid-cols-1');
            grid.classList.remove('md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
        }
    }

    sortCategories(sortBy) {
        const grid = document.getElementById('categories-grid');
        const cards = Array.from(grid.children);
        
        cards.sort((a, b) => {
            if (sortBy === 'name') {
                const nameA = a.querySelector('h3').textContent;
                const nameB = b.querySelector('h3').textContent;
                return nameA.localeCompare(nameB);
            } else if (sortBy === 'problems') {
                const countA = parseInt(a.querySelector('[id^="count-"]')?.textContent || '0');
                const countB = parseInt(b.querySelector('[id^="count-"]')?.textContent || '0');
                return countB - countA;
            }
            return 0;
        });
        
        grid.innerHTML = '';
        cards.forEach(card => grid.appendChild(card));
    }

    loadMoreProblems() {
        // Placeholder for pagination
        console.log('Loading more problems...');
    }

    // Bookmarks functionality
    updateBookmarkCounts() {
        const count = this.bookmarkedProblems.length;
        const countElement = document.getElementById('bookmarks-count');
        const countElementMobileBottom = document.getElementById('bookmarks-count-mobile-bottom');
        
        if (count > 0) {
            countElement?.classList.remove('hidden');
            countElementMobileBottom?.classList.remove('hidden');
            if (countElement) countElement.textContent = count;
            if (countElementMobileBottom) countElementMobileBottom.textContent = count;
        } else {
            countElement?.classList.add('hidden');
            countElementMobileBottom?.classList.add('hidden');
        }
    }

    updateBookmarkLists() {
        const bookmarksList = document.getElementById('bookmarks-list');
        const bookmarksListMobile = document.getElementById('bookmarks-list-mobile');
        
        if (this.bookmarkedProblems.length === 0) {
            const emptyMessage = '<p class="text-gray-500 dark:text-gray-400 text-sm text-center py-8">No bookmarked problems yet</p>';
            if (bookmarksList) bookmarksList.innerHTML = emptyMessage;
            if (bookmarksListMobile) bookmarksListMobile.innerHTML = emptyMessage;
            return;
        }

        const bookmarkedItems = this.bookmarkedProblems.map(problemId => {
            const problem = this.allProblems.find(p => p.id.toString() === problemId.toString());
            if (!problem) return '';

            const domainInfo = DOMAINS[problem.domain] || { shortName: 'Unknown', category: 'unknown' };
            
            return `
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer" 
                     onclick="window.problem2project.openBookmarkedProblem('${problem.id}')">
                    <h4 class="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-2">${problem.title}</h4>
                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>${domainInfo.shortName}</span>
                        <button onclick="event.stopPropagation(); window.problem2project.removeBookmark('${problem.id}')" 
                                class="text-red-500 hover:text-red-700 transition-colors">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (bookmarksList) bookmarksList.innerHTML = bookmarkedItems;
        if (bookmarksListMobile) bookmarksListMobile.innerHTML = bookmarkedItems;
    }

    toggleBookmarksDropdown() {
        const dropdown = document.getElementById('bookmarks-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
            if (!dropdown.classList.contains('hidden')) {
                this.updateBookmarkLists();
            }
        }
    }

    hideBookmarksDropdown() {
        const dropdown = document.getElementById('bookmarks-dropdown');
        dropdown?.classList.add('hidden');
    }

    showBookmarksOverlay() {
        const overlay = document.getElementById('bookmarks-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            this.updateBookmarkLists();
        }
    }

    hideBookmarksOverlay() {
        const overlay = document.getElementById('bookmarks-overlay');
        overlay?.classList.add('hidden');
    }

    openBookmarkedProblem(problemId) {
        const problem = this.allProblems.find(p => p.id.toString() === problemId.toString());
        if (problem) {
            this.hideBookmarksDropdown();
            this.hideBookmarksOverlay();
            this.showProblemDetails(problem);
        }
    }

    removeBookmark(problemId) {
        this.bookmarkedProblems = this.bookmarkedProblems.filter(id => id.toString() !== problemId.toString());
        this.saveBookmarks();
        this.updateBookmarkCounts();
        this.updateBookmarkLists();
        this.refreshProblemCardsBookmarkState();
        
        // Update the bookmark button if this problem is currently being viewed
        if (this.currentProblem && this.currentProblem.id.toString() === problemId.toString()) {
            const bookmarkBtn = document.getElementById('bookmark-btn');
            const bookmarkBtnMobile = document.getElementById('bookmark-btn-mobile');
            
            if (bookmarkBtn) {
                bookmarkBtn.innerHTML = '<i class="far fa-bookmark text-gray-600 dark:text-gray-400 mr-2"></i><span class="text-sm font-medium text-gray-700 dark:text-gray-300">Bookmark</span>';
            }
            if (bookmarkBtnMobile) {
                bookmarkBtnMobile.innerHTML = '<i class="far fa-bookmark text-gray-600 dark:text-gray-400"></i>';
            }
        }
    }

    refreshProblemCardsBookmarkState() {
        // Update all visible problem cards to reflect current bookmark state
        const problemCards = document.querySelectorAll('.problem-card');
        
        problemCards.forEach(card => {
            const bookmarkBtn = card.querySelector('.bookmark-btn');
            if (bookmarkBtn) {
                const problemId = bookmarkBtn.dataset.problemId;
                if (problemId) {
                    const isBookmarked = this.bookmarkedProblems.includes(problemId.toString());
                    
                    // Update button appearance
                    if (isBookmarked) {
                        bookmarkBtn.classList.remove('text-gray-400', 'dark:text-gray-500');
                        bookmarkBtn.classList.add('text-yellow-500');
                    } else {
                        bookmarkBtn.classList.remove('text-yellow-500');
                        bookmarkBtn.classList.add('text-gray-400', 'dark:text-gray-500');
                    }
                    
                    // Update icon
                    const icon = bookmarkBtn.querySelector('i');
                    if (icon) {
                        if (isBookmarked) {
                            icon.classList.remove('far');
                            icon.classList.add('fas');
                        } else {
                            icon.classList.remove('fas');
                            icon.classList.add('far');
                        }
                    }
                }
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.problem2project = new Problem2Project();
    } catch (error) {
        console.error('Failed to initialize Problem2Project application:', error);
        // Hide loading screen even if initialization fails
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
});

// Global functions for backward compatibility
window.toggleKeywords = (category) => {
    const app = window.problem2project || new Problem2Project();
    const domainMap = {
        'programming': '1',
        'math': '2',
        'physics': '3',
        'chemistry': '4',
        'biology': '5',
        'data-science': '6',
        'electronics': '7',
        'robotics': '8',
        'mechanical': '9',
        'civil': '10',
        'healthcare': '11',
        'ux': '12',
        'business': '13',
        'security': '14',
        'iot': '15',
        'education': '16',
        'energy': '17',
        'agriculture': '18',
        'legal': '19',
        'social-impact': '20'
    };
    
    app.selectCategory(category, domainMap[category]);
};

window.showProblemDetails = (problem) => {
    const app = window.problem2project || new Problem2Project();
    app.showProblemDetails(problem);
};

window.closeModal = () => {
    const app = window.problem2project || new Problem2Project();
    app.closeModal();
};
