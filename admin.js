import { adminUid, firebaseConfig, hasFirebaseConfig } from './firebase-config.js';

const loginForm = document.querySelector('#login-form');
const loginMessage = document.querySelector('#login-message');
const adminControls = document.querySelector('#admin-controls');
const adminStatus = document.querySelector('#admin-status');
const signOutButton = document.querySelector('#sign-out-button');
const projectForm = document.querySelector('#project-form');
const projectFormTitle = document.querySelector('#project-form-title');
const projectMessage = document.querySelector('#project-message');
const resetProjectFormButton = document.querySelector('#reset-project-form');
const projectsAdminList = document.querySelector('#projects-admin-list');

let auth;
let database;
let firebaseApi;

function setMessage(element, message, type = '') {
    element.textContent = message;
    element.className = `admin-message ${type}`.trim();
}

function requireConfiguredFirebase() {
    if (!hasFirebaseConfig() || !adminUid || adminUid.startsWith('PASTE_')) {
        setMessage(loginMessage, 'Paste your Firebase config and admin UID into firebase-config.js first.', 'error');
        return false;
    }

    return true;
}

async function setupFirebase() {
    if (firebaseApi) {
        return firebaseApi;
    }

    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
    const authModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js');
    const databaseModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js');

    const app = initializeApp(firebaseConfig);
    auth = authModule.getAuth(app);
    database = databaseModule.getDatabase(app);

    firebaseApi = {
        ...authModule,
        ...databaseModule
    };

    return firebaseApi;
}

function resetProjectForm() {
    projectForm.reset();
    document.querySelector('#project-id').value = '';
    document.querySelector('#project-order').value = '0';
    projectFormTitle.textContent = 'Add Project';
    setMessage(projectMessage, '');
}

function projectFromForm() {
    return {
        title: document.querySelector('#project-title').value.trim(),
        description: document.querySelector('#project-description').value.trim(),
        githubLink: document.querySelector('#project-link').value.trim(),
        order: Number(document.querySelector('#project-order').value || 0)
    };
}

function populateProjectForm(id, project) {
    document.querySelector('#project-id').value = id;
    document.querySelector('#project-title').value = project.title || '';
    document.querySelector('#project-description').value = project.description || '';
    document.querySelector('#project-link').value = project.githubLink || '';
    document.querySelector('#project-order').value = project.order || 0;
    projectFormTitle.textContent = 'Edit Project';
    setMessage(projectMessage, '');
    projectForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAdminProjects(projects) {
    projectsAdminList.innerHTML = '';

    if (!projects.length) {
        projectsAdminList.textContent = 'No projects have been added yet.';
        return;
    }

    projects.forEach(([id, project]) => {
        const item = document.createElement('article');
        item.className = 'admin-project-item';

        const info = document.createElement('div');

        const title = document.createElement('h3');
        title.textContent = project.title;

        const description = document.createElement('p');
        description.textContent = project.description;

        info.append(title, description);

        const actions = document.createElement('div');
        actions.className = 'admin-project-actions';

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'secondary-button';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => populateProjectForm(id, project));

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'danger-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', async () => {
            const confirmed = window.confirm(`Delete "${project.title}"?`);

            if (!confirmed) {
                return;
            }

            const { ref, remove } = firebaseApi;
            await remove(ref(database, `projects/${id}`));
        });

        actions.append(editButton, deleteButton);
        item.append(info, actions);
        projectsAdminList.appendChild(item);
    });
}

async function watchProjects() {
    const { onValue, ref } = firebaseApi;

    onValue(ref(database, 'projects'), snapshot => {
        const data = snapshot.val() || {};
        const projects = Object.entries(data).sort(([, a], [, b]) => {
            return (a.order || 0) - (b.order || 0);
        });

        renderAdminProjects(projects);
    });
}

async function handleSignedInUser(user) {
    if (!user) {
        loginForm.hidden = false;
        adminControls.hidden = true;
        return;
    }

    if (user.uid !== adminUid) {
        await firebaseApi.signOut(auth);
        setMessage(loginMessage, 'This account is not authorized to edit projects.', 'error');
        return;
    }

    loginForm.hidden = true;
    adminControls.hidden = false;
    adminStatus.textContent = `Signed in as ${user.email}`;
    watchProjects();
}

loginForm.addEventListener('submit', async event => {
    event.preventDefault();

    if (!requireConfiguredFirebase()) {
        return;
    }

    try {
        const { onAuthStateChanged, signInWithEmailAndPassword } = await setupFirebase();
        onAuthStateChanged(auth, handleSignedInUser);

        const email = document.querySelector('#admin-email').value;
        const password = document.querySelector('#admin-password').value;

        await signInWithEmailAndPassword(auth, email, password);
        setMessage(loginMessage, '');
    } catch (error) {
        console.error(error);
        setMessage(loginMessage, 'Could not sign in. Check your email, password, Firebase config, and authorized domain.', 'error');
    }
});

projectForm.addEventListener('submit', async event => {
    event.preventDefault();

    try {
        const { push, ref, set, update } = firebaseApi;
        const projectId = document.querySelector('#project-id').value;
        const project = projectFromForm();

        if (projectId) {
            await update(ref(database, `projects/${projectId}`), project);
            setMessage(projectMessage, 'Project updated.', 'success');
        } else {
            const newProjectRef = push(ref(database, 'projects'));
            await set(newProjectRef, project);
            setMessage(projectMessage, 'Project added.', 'success');
        }

        resetProjectForm();
    } catch (error) {
        console.error(error);
        setMessage(projectMessage, 'Could not save project. Check your database rules.', 'error');
    }
});

resetProjectFormButton.addEventListener('click', resetProjectForm);

signOutButton.addEventListener('click', async () => {
    await firebaseApi.signOut(auth);
});

if (requireConfiguredFirebase()) {
    setupFirebase()
        .then(({ onAuthStateChanged }) => onAuthStateChanged(auth, handleSignedInUser))
        .catch(error => {
            console.error(error);
            setMessage(loginMessage, 'Could not connect to Firebase. Check firebase-config.js.', 'error');
        });
}
