document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const headerToggle = document.getElementById('header-toggle');
    const mainHeader = document.getElementById('main-header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const scrollToRepoBtn = document.getElementById('scroll-to-repo');
    const courseGrid = document.getElementById('course-grid');
    
    // Overlays
    const materialOverlay = document.getElementById('material-overlay');
    const addMaterialOverlay = document.getElementById('add-material-overlay');
    const addCourseOverlay = document.getElementById('add-course-overlay');
    const closeBtns = document.querySelectorAll('.close-overlay');
    
    // Course Details
    const overlayCourseTitle = document.getElementById('overlay-course-title');
    const materialListContainer = document.getElementById('material-list');
    const emptyState = document.getElementById('empty-state');
    const showAddMaterialFormBtn = document.getElementById('show-add-material-form');
    const addMaterialBtn = document.getElementById('add-material-btn'); // Secondary add button
    
    // Forms
    const addMaterialForm = document.getElementById('add-material-form');
    const addCourseForm = document.getElementById('add-course-form');
    const addCourseBtn = document.getElementById('add-course-btn');
    
    // Toast
    const toast = document.getElementById('notification-toast');
    const toastMessage = document.getElementById('toast-message');

    // === State ===
    let currentCourseId = null;
    
    const defaultCourses = [
        { id: 'c-1', name: 'Kewarganegaraan', materials: [] },
        { id: 'c-2', name: 'Pemrograman Web 1', materials: [] },
        { id: 'c-3', name: 'Basis Data', materials: [] },
        { id: 'c-4', name: 'Statistika dan Probabilitas', materials: [] },
        { id: 'c-5', name: 'Bahasa Indonesia', materials: [] },
        { id: 'c-6', name: 'Konsep Sistem Informasi', materials: [] },
        { id: 'c-7', name: 'Pengantar Bisnis dan Manajemen', materials: [] }
    ];

    let courses = JSON.parse(localStorage.getItem('tumpukan_courses'));
    
    if (!courses) {
        courses = defaultCourses;
        saveCourses();
    }

    // === Initialization ===
    initTheme();
    renderCourses();

    // === Header & Theme Logic ===
    function updateHeaderToggleVisibility() {
        const isHeaderVisible = mainHeader.classList.contains('show');
        headerToggle.classList.toggle('hidden', isHeaderVisible);
    }

    headerToggle.addEventListener('click', (event) => {
        mainHeader.classList.toggle('show');
        updateHeaderToggleVisibility();
        event.stopPropagation();
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        mainHeader.classList.remove('show');
        updateHeaderToggleVisibility();
    });

    document.addEventListener('click', (event) => {
        if (mainHeader.classList.contains('show') && !mainHeader.contains(event.target) && !headerToggle.contains(event.target)) {
            mainHeader.classList.remove('show');
            updateHeaderToggleVisibility();
        }
    });

    scrollToRepoBtn.addEventListener('click', () => {
        document.getElementById('repository').scrollIntoView({ behavior: 'smooth' });
    });

    function initTheme() {
        const savedTheme = localStorage.getItem('tumpukan_theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggleBtn.textContent = '☀️ Light Mode';
        } else {
            themeToggleBtn.textContent = '🌙 Dark Mode';
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('tumpukan_theme', 'light');
            themeToggleBtn.textContent = '🌙 Dark Mode';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('tumpukan_theme', 'dark');
            themeToggleBtn.textContent = '☀️ Light Mode';
        }
    });

    // === Core Logic ===
    function saveCourses() {
        localStorage.setItem('tumpukan_courses', JSON.stringify(courses));
    }

    function renderCourses() {
        courseGrid.innerHTML = '';
        courses.forEach(course => {
            const card = document.createElement('div');
            card.classList.add('course-card');
            card.innerHTML = `
                <h3>${course.name}</h3>
                <button class="course-delete-btn" aria-label="Hapus Mata Kuliah">&times;</button>
            `;

            const deleteBtn = card.querySelector('.course-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCourse(course.id);
            });

            card.addEventListener('click', () => openMaterialOverlay(course.id));
            courseGrid.appendChild(card);
        });
    }

    function deleteCourse(courseId) {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        const confirmed = window.confirm(`Hapus mata kuliah "${course.name}"?`);
        if (!confirmed) return;

        courses = courses.filter(c => c.id !== courseId);
        saveCourses();
        renderCourses();

        if (currentCourseId === courseId) {
            closeAllOverlays();
        }

        showToast('Mata kuliah berhasil dihapus.');
    }

    function openMaterialOverlay(courseId) {
        currentCourseId = courseId;
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        overlayCourseTitle.textContent = course.name;
        renderMaterials(course);
        openOverlay(materialOverlay);
    }

    function renderMaterials(course) {
        materialListContainer.innerHTML = '';
        
        if (course.materials.length === 0) {
            materialListContainer.style.display = 'none';
            emptyState.style.display = 'block';
            addMaterialBtn.style.display = 'none';
        } else {
            materialListContainer.style.display = 'flex';
            emptyState.style.display = 'none';
            addMaterialBtn.style.display = 'block';
            
            course.materials.forEach(material => {
                const link = document.createElement('a');
                link.href = material.link;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.classList.add('material-item');
                link.textContent = material.name;
                materialListContainer.appendChild(link);
            });
        }
    }

    // === Overlays Handling ===
    function openOverlay(overlay) {
        overlay.classList.add('active');
    }

    function closeAllOverlays() {
        document.querySelectorAll('.overlay').forEach(overlay => {
            overlay.classList.remove('active');
        });
        currentCourseId = null;
        addMaterialForm.reset();
        addCourseForm.reset();
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Check if we are closing the add material form to go back to material list
            if (e.target.closest('#add-material-overlay') && currentCourseId) {
                document.getElementById('add-material-overlay').classList.remove('active');
                // Re-open material overlay
                const course = courses.find(c => c.id === currentCourseId);
                if(course) {
                    renderMaterials(course);
                    openOverlay(materialOverlay);
                } else {
                     closeAllOverlays();
                }
            } else {
                closeAllOverlays();
            }
        });
    });

    // Close on clicking outside
    document.querySelectorAll('.overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllOverlays();
            }
        });
    });

    // === Forms & Interactions ===
    addCourseBtn.addEventListener('click', () => {
        openOverlay(addCourseOverlay);
    });

    showAddMaterialFormBtn.addEventListener('click', () => {
        materialOverlay.classList.remove('active');
        openOverlay(addMaterialOverlay);
    });

    addMaterialBtn.addEventListener('click', () => {
        materialOverlay.classList.remove('active');
        openOverlay(addMaterialOverlay);
    });

    addCourseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const courseNameInput = document.getElementById('course-name');
        const courseName = courseNameInput.value.trim();
        
        if (courseName) {
            const newCourse = {
                id: 'c-' + Date.now(),
                name: courseName,
                materials: []
            };
            courses.push(newCourse);
            saveCourses();
            renderCourses();
            addCourseForm.reset();
            addCourseOverlay.classList.remove('active');
            showToast('Mata Kuliah Berhasil Ditambahkan!');
        }
    });

    addMaterialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('material-name');
        const linkInput = document.getElementById('material-link');
        const name = nameInput.value.trim();
        const link = linkInput.value.trim();
        
        if (name && link && currentCourseId) {
            const courseIndex = courses.findIndex(c => c.id === currentCourseId);
            if (courseIndex > -1) {
                courses[courseIndex].materials.push({ name, link });
                saveCourses();
                
                addMaterialForm.reset();
                addMaterialOverlay.classList.remove('active');
                
                // Re-render and open material overlay
                renderMaterials(courses[courseIndex]);
                openOverlay(materialOverlay);
                
                showToast('Materi Berhasil Ditambahkan!');
            }
        }
    });

    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
