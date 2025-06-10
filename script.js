import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, getDoc, serverTimestamp, query as firestoreQuery, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// --- App State & Constants (Declared globally) ---
let app, db, auth, storage, appId;
let userId;
let userProfile = {};
let allPosts = [];
let currentFilter = { category: 'all', search: '', sort: 'recent' };
let sessionVotes = JSON.parse(localStorage.getItem('sessionVotes')) || {}; 

const adjectives = ["Witty", "Silly", "Clever", "Brave", "Curious", "Dapper", "Eager", "Funky", "Giga", "Happy", "Jolly", "Lazy", "Mega", "Nifty", "Omega", "Pixel", "Quantum", "Retro", "Super", "Turbo", "Ultra", "Vivid", "Wild", "Zen"];
const nouns = ["Cat", "Dog", "Wombat", "Fox", "Panda", "Penguin", "Dingo", "Gopher", "Koala", "Lemur", "Narwhal", "Ocelot", "Quokka", "Raccoon", "Sloth", "Tarsier", "Unicorn", "Vulture", "Walrus", "Yak", "Zebra"];
const animalIcons = [
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.79 13.5l-1.79-1.79c.35-.58.58-1.25.58-2.02 0-2.21-1.79-4-4-4s-4 1.79-4 4c0 .77.23 1.44.58 2.02L6.42 15.5C4.9 14.28 4 12.24 4 10c0-4.41 3.59-8 8-8s8 3.59 8 8c0 2.24-.9 4.28-2.42 5.5zM12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 7h-7L12 5.5l3.5 3.5zM12 17.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 8.5 12 8.5s4.5 2.01 4.5 4.5S14.49 17.5 12 17.5z"/></svg>',
];
const categories = [ {id: 'all', name: 'All Posts'}, {id: 'jp', name: 'Japanese Culture'}, {id: 'a', name: 'Anime & Manga'}, {id: 'c', name: 'Cosplay'}, {id: 'tr', name: 'Transportation'}, {id: 'oc', name: 'Otaku Culture'}, {id: 'yt', name: 'YouTubers'}, {id: 'vg', name: 'Video Games'}, {id: 'vr', name: 'Retro Games'}, {id: 'int', name: 'Interests'}, {id: 'co', name: 'Comics & Cartoons'}, {id: 'g', name: 'Technology'}, {id: 'tv', name: 'Television & Film'}, {id: 'k', name: 'Weapons'}, {id: 'o', name: 'Auto'}, {id: 'an', name: 'Animals & Nature'}, {id: 'tg', name: 'Traditional Games'}, {id: 'sp', name: 'Sports'}, {id: 'xs', name: 'Extreme Sports'}, {id: 'pw', name: 'Professional Wrestling'}, {id: 'sci', name: 'Science & Math'}, {id: 'his', name: 'History & Humanities'}, {id: 'int', name: 'International'}, {id: 'out', name: 'Outdoors'}, {id: 'toy', 'name': 'Toys'}, {id: 'cr', name: 'Creative'}, {id: 'i', name: 'Oekaki'}, {id: 'po', name: 'Papercraft & Origami'}, {id: 'p', name: 'Photography'}, {id: 'ck', name: 'Food & Cooking'}, {id: 'ac', name: 'Artwork/Critique'}, {id: 'w', name: 'Wallpapers'}, {id: 'lit', name: 'Literature'}, {id: 'mu', name: 'Music'}, {id: 'fa', name: 'Fashion'}, {id: '3d', name: '3DCG'}, {id: 'gd', name: 'Graphic Design'}, {id: 'diy', name: 'Do-It-Yourself'}, {id: 'gif', name: 'GIF'}, {id: 'qst', name: 'Quests'}, {id: 'oth', name: 'Other'}, {id: 'biz', name: 'Business & Finance'}, {id: 'trv', name: 'Travel'}, {id: 'fit', name: 'Fitness'}, {id: 'x', name: 'Paranormal'}, {id: 'adv', name: 'Advice'}, {id: 'pony', name: 'Pony'}, {id: 'news', name: 'Current News'}, {id: 'req', name: 'Requests'}, {id: 'vip', name: 'Very Important Posts'}, {id: 'misc', name: 'Miscellaneous'}, {id: 'r', name: 'Random'}, {id: 'pol', name: 'Politics'}, {id: 'nsfw', name: 'Adult & NSFW'} ];

let allDom = {};

/**
 * Main initialization function.
 */
function main() {
    //error handling
    let firebaseConfig;
    try {
        if (typeof firebaseConfigJSON === 'undefined') {
             throw new Error("The `firebaseConfigJSON` variable was not found on the window. This is a script loading issue.");
        }
        
        if (firebaseConfigJSON.includes('%%FIREBASE_CONFIG%%')) {
             throw new Error("Firebase config placeholder was not replaced. Check the Netlify build command (`sed ...`) and the `VITE_FIREBASE_CONFIG` environment variable.");
        }
        
        firebaseConfig = JSON.parse(firebaseConfigJSON);

    } catch (error) {
        console.error("Firebase Initialization Failed:", error);
        let userErrorMessage = `<h1>Configuration Error</h1><p style="color: #fca5a5;">${error.message}</p>`;
        if (error instanceof SyntaxError) {
            userErrorMessage += `<p>The Firebase config string injected into the HTML is not valid JSON. Please verify the <strong>VITE_FIREBASE_CONFIG</strong> value in your Netlify settings is a correctly formatted, single-line JSON string.</p>`;
        }
        userErrorMessage += `
            <div style="text-align: left; max-width: 600px; margin: 2rem auto; padding: 1rem; border: 1px solid #4b5563; border-radius: 8px; background-color: #374151;">
                <h2 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Troubleshooting Steps:</h2>
                <ol style="list-style-position: inside; list-style-type: decimal; padding-left: 1rem; line-height: 1.6;">
                    <li>Go to your Netlify site dashboard.</li>
                    <li>Navigate to <strong>Site configuration > Build & deploy > Build settings</strong>.</li>
                    <li>Ensure your <strong>Build command</strong> is exactly: <code style="background: #1f2937; padding: 2px 4px; border-radius: 4px;">sed -i "s|%%FIREBASE_CONFIG%%|$VITE_FIREBASE_CONFIG|g" index.html</code></li>
                    <li>Navigate to <strong>Site configuration > Build & deploy > Environment variables</strong>.</li>
                    <li>Ensure you have a variable named <strong>VITE_FIREBASE_CONFIG</strong> with your single-line JSON as its value.</li>
                    <li>Trigger a new deploy using "Deploy without cache".</li>
                </ol>
            </div>
        `;
        document.body.innerHTML = `<div style="padding: 2rem; text-align: center; color: #f3f4f6; background-color: #1f2937; min-height: 100vh; font-family: sans-serif;">${userErrorMessage}</div>`;
        return;
    }
    
    // --- Initialize Firebase Services ---
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    appId = firebaseConfig.appId;

    // --- Cache DOM Elements ---
    allDom = {
        themeToggle: document.getElementById('themeToggle'),
        themeIcon: document.getElementById('themeIcon'),
        html: document.documentElement,
        body: document.body,
        newPostBtn: document.getElementById('newPostBtn'),
        postModal: document.getElementById('postModal'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        postForm: document.getElementById('postForm'),
        postContent: document.getElementById('postContent'),
        postCategory: document.getElementById('postCategory'),
        postAuthor: document.getElementById('postAuthor'),
        fileUpload: document.getElementById('fileUpload'),
        fileNameDisplay: document.getElementById('fileName'),
        submitPostBtn: document.getElementById('submitPostBtn'),
        postBtnText: document.getElementById('postBtnText'),
        postBtnIcon: document.getElementById('postBtnIcon'),
        postBtnLoader: document.getElementById('postBtnLoader'),
        postFeed: document.getElementById('postFeed'),
        searchBar: document.getElementById('searchBar'),
        searchBarDesktop: document.getElementById('searchBarDesktop'),
        sortOrder: document.getElementById('sortOrder'),
        categoryList: document.getElementById('categoryList'),
        mobileCategorySelect: document.getElementById('mobileCategorySelect'),
        categoryTitle: document.getElementById('categoryTitle'),
        colorThemeBtn: document.getElementById('colorThemeBtn'),
        colorOptions: document.getElementById('colorOptions'),
    };
    
    // --- Run Setup Functions ---
    setupIdentity();
    setupTheme();
    setupCategories();
    setupEventListeners();
    authenticateAndLoad();
}

function setupIdentity() {
    let storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        userProfile = JSON.parse(storedProfile);
    } else {
        userProfile.name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} ${Math.floor(100 + Math.random() * 900)}`;
        userProfile.icon = animalIcons[Math.floor(Math.random() * animalIcons.length)];
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
}

function setupTheme() {
    const savedColor = localStorage.getItem('colorTheme') || 'warm';
    applyColorTheme(savedColor);
    
    const isDark = localStorage.getItem('theme') === 'dark';
    updateThemeUI(isDark);
}

function applyColorTheme(themeName) {
    const themePrefix = 'theme-';
    allDom.body.className = allDom.body.className.split(' ').filter(c => !c.startsWith(themePrefix)).join(' ');
    allDom.body.classList.add(`${themePrefix}${themeName}`);
    localStorage.setItem('colorTheme', themeName);
}

function toggleTheme() {
    const isCurrentlyDark = allDom.html.classList.contains('dark');
    localStorage.setItem('theme', !isCurrentlyDark ? 'dark' : 'light');
    updateThemeUI(!isCurrentlyDark);
}

function updateThemeUI(isDark) {
    allDom.html.classList.toggle('dark', isDark);
    allDom.html.classList.toggle('light', !isDark);
    allDom.themeIcon.innerHTML = isDark 
        ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>` // Sun icon
        : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`; // Moon icon
}

function setupCategories() {
    allDom.categoryList.innerHTML = '';
    allDom.postCategory.innerHTML = '<option value="">Choose a room...</option>';
    allDom.mobileCategorySelect.innerHTML = '';

    categories.forEach(cat => {
        const link = document.createElement('a');
        link.href = "#";
        link.dataset.catid = cat.id;
        link.className = 'block p-2 rounded-md hover:bg-[var(--border-color)] transition-colors text-sm';
        link.textContent = cat.name;
        if (cat.id === 'all') link.classList.add('category-selected');
        const li = document.createElement('li');
        li.appendChild(link);
        allDom.categoryList.appendChild(li);

        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        allDom.mobileCategorySelect.appendChild(option.cloneNode(true));
        if (cat.id !== 'all') {
            allDom.postCategory.appendChild(option);
        }
    });
}

function setupEventListeners() {
    allDom.themeToggle.addEventListener('click', toggleTheme);
    allDom.colorThemeBtn.addEventListener('click', (e) => { e.stopPropagation(); allDom.colorOptions.classList.toggle('hidden'); });
    allDom.colorOptions.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button?.dataset.theme) { applyColorTheme(button.dataset.theme); allDom.colorOptions.classList.add('hidden'); }
    });
    document.addEventListener('click', () => { allDom.colorOptions.classList.add('hidden'); });

    allDom.newPostBtn.addEventListener('click', () => {
        allDom.postAuthor.value = userProfile.name;
        openModal(allDom.postModal)
    });
    allDom.closeModalBtn.addEventListener('click', () => closeModal(allDom.postModal));
    allDom.postModal.querySelector('.modal-backdrop').addEventListener('click', () => closeModal(allDom.postModal));

    const handleSearch = (e) => { currentFilter.search = e.target.value.toLowerCase(); renderPosts(); };
    allDom.searchBar.addEventListener('input', handleSearch);
    allDom.searchBarDesktop.addEventListener('input', handleSearch);
    
    allDom.sortOrder.addEventListener('change', (e) => { currentFilter.sort = e.target.value; renderPosts(); });

    const handleCategoryChange = (catId) => {
        currentFilter.category = catId;
        const cat = categories.find(c => c.id === currentFilter.category);
        allDom.categoryTitle.textContent = cat ? cat.name : "All Posts";
        
        document.querySelectorAll('#categoryList a').forEach(a => a.classList.remove('category-selected'));
        document.querySelector(`#categoryList a[data-catid="${catId}"]`)?.classList.add('category-selected');
        allDom.mobileCategorySelect.value = catId;
        
        renderPosts();
    };
    allDom.categoryList.addEventListener('click', (e) => {
         e.preventDefault();
         const link = e.target.closest('a');
         if (link?.dataset.catid) { handleCategoryChange(link.dataset.catid); }
    });
    allDom.mobileCategorySelect.addEventListener('change', (e) => handleCategoryChange(e.target.value));

    allDom.postForm.addEventListener('submit', handlePostSubmit);
    allDom.fileUpload.addEventListener('change', () => {
        if (allDom.fileUpload.files.length > 0) { allDom.fileNameDisplay.textContent = allDom.fileUpload.files[0].name; }
    });

    allDom.postFeed.addEventListener('click', handlePostFeedClick);
}

function authenticateAndLoad() {
     onAuthStateChanged(auth, async (user) => {
        if (user) { 
            userId = user.uid; 
            loadPosts(); 
        } else {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) { 
                console.error("Authentication Error:", error); 
            }
        }
    });
}

function openModal(modalEl) { 
    modalEl.classList.remove('hidden', 'animate-fade-out'); 
    modalEl.classList.add('flex', 'animate-fade-in'); 
};

function closeModal(modalEl) {
     modalEl.classList.remove('animate-fade-in');
     modalEl.classList.add('animate-fade-out');
     setTimeout(() => {
        modalEl.classList.add('hidden');
        modalEl.classList.remove('flex');
        if(modalEl.id === 'postModal') { 
            allDom.postForm.reset(); 
            allDom.fileNameDisplay.textContent = ''; 
            setSubmitButtonState(false);
        }
     }, 300);
};

function setSubmitButtonState(isSubmitting) {
    allDom.submitPostBtn.disabled = isSubmitting;
    allDom.postBtnText.classList.toggle('hidden', isSubmitting);
    allDom.postBtnIcon.classList.toggle('hidden', isSubmitting);
    allDom.postBtnLoader.classList.toggle('hidden', !isSubmitting);
}

async function handlePostSubmit(e) {
    e.preventDefault();
    const content = allDom.postContent.value.trim();
    const file = allDom.fileUpload.files[0];
    const category = allDom.postCategory.value;
    const authorName = allDom.postAuthor.value.trim() || userProfile.name;

    if (!content && !file) { return; }
    if (!category) { alert('Please select a room!'); return; }

    setSubmitButtonState(true);
    
    if (userProfile.name !== authorName) {
        userProfile.name = authorName;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }

    try {
        let fileURL = null, fileType = null;
        if (file) {
            const storageRef = ref(storage, `files/${appId}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            fileURL = await getDownloadURL(snapshot.ref);
            fileType = file.type;
        }
    
        const postsCollection = collection(db, `artifacts/${appId}/public/data/posts`);
        await addDoc(postsCollection, {
            content: content, fileURL: fileURL, fileType: fileType, category: category,
            timestamp: serverTimestamp(), user: userProfile,
            upvotes: 0, downvotes: 0, comments: []
        });
        closeModal(allDom.postModal);
    } catch (error) { 
        console.error("Error adding document: ", error); 
        setSubmitButtonState(false);
    }
}

function loadPosts() {
    allDom.postFeed.innerHTML = `<div class="card p-8 text-center text-[var(--icon-color)] flex items-center justify-center gap-4"><div class="loader"></div> Loading posts...</div>`;
    const postsCollection = collection(db, `artifacts/${appId}/public/data/posts`);
    const q = firestoreQuery(postsCollection);
    onSnapshot(q, (snapshot) => {
        allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderPosts();
    }, error => {
        console.error("Error loading posts:", error) 
        allDom.postFeed.innerHTML = `<div class="card p-8 text-center text-red-500">Error loading posts. Check the browser console for details.</div>`;
    });
}

function renderPosts() {
    let postsToRender = [...allPosts];
    const searchTerm = allDom.searchBar.value.toLowerCase() || allDom.searchBarDesktop.value.toLowerCase();

    if (searchTerm) { 
        postsToRender = postsToRender.filter(p => p.content?.toLowerCase().includes(searchTerm)); 
    }
    if (currentFilter.category !== 'all') { 
        postsToRender = postsToRender.filter(p => p.category === currentFilter.category); 
    }

    postsToRender.sort((a, b) => {
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        if (currentFilter.sort === 'upvoted') return scoreB - scoreA;
        if (currentFilter.sort === 'commented') return (b.comments?.length || 0) - (a.comments?.length || 0);
        return (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0);
    });

    allDom.postFeed.innerHTML = postsToRender.length === 0 
        ? `<div class="card p-8 text-center text-[var(--icon-color)]">No posts found. Try changing your filters!</div>`
        : postsToRender.map(createPostElement).join('');
}

function createPostElement(post) {
    const timeAgo = post.timestamp ? moment(post.timestamp.toDate()).fromNow() : 'just now';
    const postUser = post.user || { name: 'Anonymous', icon: animalIcons[0] };
    const categoryInfo = categories.find(c => c.id === post.category);
    const voteStatus = sessionVotes[post.id];

    let fileContent = '';
    if (post.fileURL) {
        if (post.fileType?.startsWith('image/')) {
            fileContent = `<img src="${post.fileURL}" alt="Post image" class="mt-4 rounded-lg max-h-96 w-auto mx-auto cursor-pointer" onclick="this.classList.toggle('max-h-96')">`;
        } else if (post.fileType?.startsWith('video/')) {
            fileContent = `<video controls src="${post.fileURL}" class="mt-4 rounded-lg w-full"></video>`;
        } else if (post.fileType?.startsWith('audio/')) {
            fileContent = `<audio controls src="${post.fileURL}" class="mt-4 w-full"></audio>`;
        } else {
             fileContent = `<div class="mt-4 p-3 bg-[var(--bg-color)] rounded-md border border-[var(--border-color)]">
                <a href="${post.fileURL}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline flex items-center">
                   <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                   View Attached File
                </a></div>`
        }
    }

    const commentsHtml = renderCommentTree(post.comments);
        
    return `
        <div class="card rounded-lg shadow-lg p-5 transition duration-300 hover:shadow-xl" data-id="${post.id}">
            <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-10 h-10 text-primary">${postUser.icon}</div>
                <div class="flex-grow">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center flex-wrap gap-x-2 text-sm">
                            <span class="font-bold">${postUser.name}</span>
                            <span class="text-[var(--icon-color)]">·</span>
                            <span class="text-[var(--icon-color)]">${timeAgo}</span>
                            ${categoryInfo ? `<span class="text-[var(--icon-color)]">·</span> <a href="#" class="text-primary font-semibold board-link" data-catid="${categoryInfo.id}">${categoryInfo.name}</a>` : ''}
                        </div>
                    </div>
                    <p class="mt-1">${post.content || ''}</p>
                    ${fileContent}
                    <div class="mt-4 flex items-center space-x-6 text-[var(--icon-color)]">
                        <button class="flex items-center space-x-1 group upvote-btn"><svg class="w-5 h-5 icon group-hover:text-green-500 ${voteStatus === 'up' ? 'text-green-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg><span class="text-sm font-semibold group-hover:text-green-500 ${voteStatus === 'up' ? 'text-green-500' : ''}" data-role="upvote-count">${post.upvotes || 0}</span></button>
                        <button class="flex items-center space-x-1 group downvote-btn"><svg class="w-5 h-5 icon group-hover:text-red-500 ${voteStatus === 'down' ? 'text-red-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg><span class="text-sm font-semibold group-hover:text-red-500 ${voteStatus === 'down' ? 'text-red-500' : ''}" data-role="downvote-count">${post.downvotes || 0}</span></button>
                        <button class="flex items-center space-x-1 group comment-btn"><svg class="w-5 h-5 icon group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg><span class="text-sm font-semibold group-hover:text-primary" data-role="comment-count">${post.comments?.length || 0}</span></button>
                    </div>
                </div>
            </div>
            <div class="comment-section mt-4 pl-0 sm:pl-14 hidden">
                <form class="comment-form flex space-x-2" data-parent-id="root"><input type="text" class="comment-input w-full p-2 rounded-md bg-[var(--bg-color)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Add a comment..."><button type="submit" class="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-full">Reply</button></form>
                <div class="comments-list mt-4 space-y-3">${commentsHtml}</div>
            </div>
        </div>`;
}

function renderCommentTree(comments, parentId = null) {
    if (!comments || comments.length === 0) {
         return parentId ? '' : '<p class="text-sm text-[var(--icon-color)] no-comments">No comments yet.</p>';
    }
    const children = comments.filter(c => c.parentId === parentId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (children.length === 0) return '';
    
    return `
        <div class="space-y-4 ${parentId ? 'pl-6 border-l-2 border-[var(--border-color)]' : ''}">
            ${children.map(comment => `
                <div data-comment-id="${comment.id}">
                    ${createCommentElement(comment)}
                    ${renderCommentTree(comments, comment.id)}
                </div>
            `).join('')}
        </div>
    `;
}

function createCommentElement(comment) {
    const commentUser = comment.user || { name: 'Anonymous', icon: animalIcons[0] };
    const timeAgo = moment(comment.timestamp).fromNow();
    return `
        <div class="comment-wrapper flex items-start space-x-3">
            <div class="flex-shrink-0 w-8 h-8 text-primary">${commentUser.icon}</div>
            <div class="flex-grow">
                <div class="bg-[var(--bg-color)] p-3 rounded-lg">
                    <span class="font-bold text-sm">${commentUser.name}</span>
                    <p class="text-sm">${comment.text}</p>
                </div>
                <div class="actions text-xs text-[var(--icon-color)] mt-1 pl-1 flex items-center gap-2">
                   <span>${timeAgo}</span> · <button class="font-semibold hover:underline reply-to-comment-btn">Reply</button>
                </div>
                 <div class="reply-form-container mt-2 hidden">
                    <form class="comment-form flex space-x-2" data-parent-id="${comment.id}">
                       <input type="text" class="comment-input w-full p-2 rounded-md bg-[var(--bg-color)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Reply to ${commentUser.name}..."/>
                       <button type="submit" class="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-3 rounded-full text-sm">Reply</button>
                    </form>
                 </div>
            </div>
        </div>
    `;
}

function handlePostFeedClick(e) {
    const postEl = e.target.closest('[data-id]');
    if (!postEl) return;
    const postId = postEl.dataset.id;
    
    if (e.target.closest('.upvote-btn')) { handleVote(postId, 'upvotes'); }
    else if (e.target.closest('.downvote-btn')) { handleVote(postId, 'downvotes'); }
    else if (e.target.closest('.comment-btn')) { postEl.querySelector('.comment-section').classList.toggle('hidden'); }
    else if (e.target.closest('.comment-form')) {
        e.preventDefault();
        const form = e.target.closest('.comment-form');
        const input = form.querySelector('input');
        const parentId = form.dataset.parentId;
        if (input.value.trim()) { addComment(postId, input.value.trim(), parentId); input.value = ''; form.closest('.reply-form-container')?.classList.add('hidden'); }
    } else if (e.target.closest('.board-link')) {
        e.preventDefault();
        allDom.mobileCategorySelect.value = e.target.dataset.catid;
        allDom.mobileCategorySelect.dispatchEvent(new Event('change'));
    } else if (e.target.closest('.reply-to-comment-btn')) {
        const wrapper = e.target.closest('.comment-wrapper');
        wrapper.querySelector('.reply-form-container').classList.toggle('hidden');
    }
}

async function handleVote(postId, voteType) {
    const postRef = doc(db, `artifacts/${appId}/public/data/posts`, postId);
    const currentVote = sessionVotes[postId];
    if (currentVote === voteType.slice(0, -1)) return;

    const updates = {};
    updates[voteType] = increment(1);
    if (currentVote) {
        const oppositeVoteType = (voteType === 'upvotes') ? 'downvotes' : 'upvotes';
        updates[oppositeVoteType] = increment(-1);
    }
    
    try {
        await updateDoc(postRef, updates);
        sessionVotes[postId] = voteType.slice(0, -1);
        localStorage.setItem('sessionVotes', JSON.stringify(sessionVotes));
    } catch (error) { console.error("Error voting:", error); }
}

async function addComment(postId, text, parentId = null) {
     const postRef = doc(db, `artifacts/${appId}/public/data/posts`, postId);
     const newComment = {
         id: crypto.randomUUID(),
         parentId: parentId === 'root' ? null : parentId,
         text: text,
         user: userProfile,
         timestamp: new Date().toISOString()
     };
     try {
        await updateDoc(postRef, { comments: arrayUnion(newComment) });
     } catch(error) {
        console.error("Error adding comment: ", error);
     }
}

// --- Start the App ---
// Wait for the DOM to be fully loaded before running the main app logic
document.addEventListener('DOMContentLoaded', main);
window.main = main;