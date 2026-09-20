import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://cazxkkeuehubbdrpbyul.supabase.co";
const SUPABASE_KEY = "sb_publishable_t4O5ZOFX-ComDleRd5R73w_mMhQaZwZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// ====================
// AUTH
// ====================

async function getCurrentUser() {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return null;
    }

    return user;
}


// ====================
// MODAL
// ====================

const itemModal = document.getElementById("itemModal");
const itemModalTitle = document.getElementById("itemModalTitle");
const itemModalDescription = document.getElementById("itemModalDescription");
const itemInput = document.getElementById("itemInput");
const itemModalMessage = document.getElementById("itemModalMessage");
const saveItemButton = document.getElementById("saveItemButton");
const closeItemModal = document.getElementById("closeItemModal");

let modalType = null;
let editingId = null;
let deleteType = null;
let deleteId = null;

const deleteModal = document.getElementById("deleteModal");
const deleteModalTitle = document.getElementById("deleteModalTitle");
const deleteModalDescription =
    document.getElementById("deleteModalDescription");
const deleteModalMessage =
    document.getElementById("deleteModalMessage");
const closeDeleteModal =
    document.getElementById("closeDeleteModal");
const cancelDeleteButton =
    document.getElementById("cancelDeleteButton");
const confirmDeleteButton =
    document.getElementById("confirmDeleteButton");


function openDeleteModal(type, item) {

    deleteType = type;
    deleteId = item.id;

    deleteModalMessage.textContent = "";

    deleteModalTitle.textContent =
        type === "goal" ? "Delete Goal?" : "Delete Task?";

    deleteModalDescription.textContent =
        `Are you sure you want to delete "${item.title}"?`;

    deleteModal.classList.add("show");
}


function closeDeleteConfirmation() {

    deleteModal.classList.remove("show");

    deleteType = null;
    deleteId = null;

    deleteModalMessage.textContent = "";
}


closeDeleteModal.addEventListener(
    "click",
    closeDeleteConfirmation
);

cancelDeleteButton.addEventListener(
    "click",
    closeDeleteConfirmation
);


deleteModal.addEventListener("click", (event) => {

    if (event.target === deleteModal) {
        closeDeleteConfirmation();
    }

});


confirmDeleteButton.addEventListener("click", async () => {
const deleteId = deleteModal.dataset.deleteId;
const deleteType = deleteModal.dataset.deleteType;
    const user = await getCurrentUser();

    if (!user) return;

    confirmDeleteButton.disabled = true;
    confirmDeleteButton.textContent = "Deleting...";

    let table;

if (deleteType === "goal") {
    table = "goals";
} else if (deleteType === "task") {
    table = "tasks";
} else if (deleteType === "subject") {
    table = "subjects";
}

console.log("Deleting:", deleteType, deleteId, table);


    const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", deleteId)
        .eq("user_id", user.id);

    if (error) {

        console.error(error);

        deleteModalMessage.textContent =
            "Could not delete this item.";

        confirmDeleteButton.disabled = false;
        confirmDeleteButton.textContent = "Delete";

        return;
    }

    const deletedType = deleteType;

    closeDeleteConfirmation();

    confirmDeleteButton.disabled = false;
    confirmDeleteButton.textContent = "Delete";

    if (deletedType === "goal") {
    await loadGoals();
} else if (deletedType === "task") {
    await loadTasks();
} else if (deletedType === "subject") {
    await loadSubjects();
}

});


function openItemModal(type, item = null) {

    modalType = type;
    editingId = item ? item.id : null;

    itemModalMessage.textContent = "";

    if (type === "goal") {

        if (item) {
            itemModalTitle.textContent = "Edit Goal";
            itemModalDescription.textContent =
                "Change the name of your goal.";
            saveItemButton.textContent = "Save Changes";
            itemInput.value = item.title;
        } else {
            itemModalTitle.textContent = "Add Goal";
            itemModalDescription.textContent =
                "What do you want to achieve?";
            saveItemButton.textContent = "Add Goal";
            itemInput.value = "";
        }

    } else {

        if (item) {
            itemModalTitle.textContent = "Edit Task";
            itemModalDescription.textContent =
                "Change the name of your task.";
            saveItemButton.textContent = "Save Changes";
            itemInput.value = item.title;
        } else {
            itemModalTitle.textContent = "Add Task";
            itemModalDescription.textContent =
                "What task do you need to do?";
            saveItemButton.textContent = "Add Task";
            itemInput.value = "";
        }
    }

    itemModal.classList.add("show");

    setTimeout(() => {
        itemInput.focus();
    }, 50);
}


function closeModal() {

    itemModal.classList.remove("show");

    modalType = null;
    editingId = null;
    itemInput.value = "";
    itemModalMessage.textContent = "";

    saveItemButton.disabled = false;
    saveItemButton.textContent = "Add Goal";
}


closeItemModal.addEventListener("click", closeModal);


itemModal.addEventListener("click", (event) => {

    if (event.target === itemModal) {
        closeModal();
    }

});


document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        itemModal.classList.contains("show")
    ) {
        closeModal();
    }

});


// ====================
// GOALS
// ====================

const addGoalButton = document.getElementById("addGoalButton");
const goalsContainer = document.getElementById("goalsContainer");


async function loadGoals() {

    const user = await getCurrentUser();

    if (!user) return;

    const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    goalsContainer.innerHTML = "";

    if (data.length === 0) {

        goalsContainer.innerHTML = `
            <div class="empty-card">
                <h3>No goals yet</h3>
                <p>Create your first goal and start working towards it.</p>
            </div>
        `;

        return;
    }


    data.forEach(goal => {

        const goalCard = document.createElement("div");
        goalCard.className = "goal-card";


        const title = document.createElement("h3");
        title.textContent = goal.title;


        const progress = document.createElement("p");
        progress.textContent = "Progress: 0%";


        const actions = document.createElement("div");
        actions.className = "goal-actions";


        // EDIT

        const editButton = document.createElement("button");
        editButton.textContent = "✏ Edit";

        editButton.addEventListener("click", () => {
            openItemModal("goal", goal);
        });


        // DELETE

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑 Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {

    openDeleteModal("goal", goal);

});


        actions.appendChild(editButton);
        actions.appendChild(deleteButton);


        goalCard.appendChild(title);
        goalCard.appendChild(progress);
        goalCard.appendChild(actions);

        goalsContainer.appendChild(goalCard);

    });

}


addGoalButton.addEventListener("click", () => {

    openItemModal("goal");
deleteButton.addEventListener("click", () => {

    deleteModal.classList.add("show");

    deleteModalTitle.textContent = "Delete Subject?";

    deleteModalDescription.textContent =
        `Are you sure you want to delete "${subject.name}"?`;

    deleteModalMessage.textContent =
        "This action cannot be undone.";

    deleteModal.dataset.deleteId = subject.id;
    deleteModal.dataset.deleteType = "subject";

});
});


// ====================
// TASKS
// ====================

const addTaskButton = document.getElementById("addTaskButton");
const tasksContainer = document.getElementById("tasksContainer");


async function loadTasks() {

    const user = await getCurrentUser();

    if (!user) return;



    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });


    if (error) {

        console.error(error);
        return;

    }


    tasksContainer.innerHTML = "";


    if (data.length === 0) {

        tasksContainer.innerHTML = `
            <div class="empty-card">
                <h3>No tasks yet</h3>
                <p>Add tasks that move you closer to your goals.</p>
            </div>
        `;

        return;
    }


    data.forEach(task => {

        const taskCard = document.createElement("div");
        taskCard.className = "task-card";


        // CHECKBOX

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;


        // TITLE

        const title = document.createElement("span");

        title.textContent = task.title;



        if (task.completed) {
            title.style.textDecoration = "line-through";
            title.style.opacity = "0.55";
        }


        checkbox.addEventListener("change", async () => {

            const { error } = await supabase
                .from("tasks")
                .update({
                    completed: checkbox.checked
                })
                .eq("id", task.id)
                .eq("user_id", user.id);


            if (error) {

                console.error(error);
                alert("Could not update the task.");

                checkbox.checked = !checkbox.checked;

                return;

            }


            if (checkbox.checked) {

                title.style.textDecoration = "line-through";
                title.style.opacity = "0.55";

            } else {

                title.style.textDecoration = "none";
                title.style.opacity = "1";

            }

        });


        // ACTIONS

        const actions = document.createElement("div");

        actions.className = "task-actions";


        // EDIT

        const editButton = document.createElement("button");

        editButton.textContent = "✏ Edit";

        editButton.addEventListener("click", () => {

            openItemModal("task", task);

        });


        // DELETE

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "🗑 Delete";
        deleteButton.className = "delete-button";


        deleteButton.addEventListener("click", () => {

    openDeleteModal("task", task);

});

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);


        taskCard.appendChild(checkbox);
        taskCard.appendChild(title);
        taskCard.appendChild(actions);


        tasksContainer.appendChild(taskCard);

    });

}
// ====================
// SUBJECTS
// ====================

async function editSubject(subjectId, newName) {
const subjectsContainer =
    document.getElementById("subjectsContainer");
    const user = await getCurrentUser();

    if (!user) return;

    const { error } = await supabase
        .from("subjects")
        .update({
            name: newName.trim()
        })
        .eq("id", subjectId)
        .eq("user_id", user.id);

    if (error) {

        console.error(error);
        alert("Could not update the subject.");
        return;

    }
    async function deleteSubject(subjectId) {

    const user = await getCurrentUser();

    if (!user) return;

    const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", subjectId)
        .eq("user_id", user.id);

    if (error) {
        console.error(error);
        alert("Could not delete the subject.");
        return;
    }

    loadSubjects();
}

    loadSubjects();
}
async function addSubject(subjectName) {

    const user = await getCurrentUser();

    if (!user) return;

    const { error } = await supabase
        .from("subjects")
        .insert({
            user_id: user.id,
            name: subjectName.trim()
        });

    if (error) {
        console.error(error);
        alert("Could not add the subject.");
        return;
    }

    loadSubjects();
}
async function loadSubjects() {

    const user = await getCurrentUser();

    if (!user) return;


    const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });


    if (error) {

        console.error(error);
        return;

    }


    subjectsContainer.innerHTML = "";


    if (!data || data.length === 0) {

        subjectsContainer.innerHTML = `
            <div class="empty-card">
                <p>Add your subjects to get started.</p>
            </div>
        `;

        return;

    }


    data.forEach((subject) => {

    const subjectCard =
        document.createElement("div");

    subjectCard.className = "subject-card";

    subjectCard.innerHTML = `
        <div>
            <h3>${subject.name}</h3>
        </div>

        <div class="subject-actions">
            <button class="edit-subject-button">Edit</button>
            <button class="delete-subject-button">Delete</button>
        </div>
    `;
    const editButton =
    subjectCard.querySelector(".edit-subject-button");

editButton.addEventListener("click", () => {

    subjectModal.classList.add("show");

    subjectModalTitle.textContent = "Edit Subject";

    subjectInput.value = subject.name;

    saveSubjectButton.textContent = "Save Changes";

    subjectModal.dataset.editingId = subject.id;

    subjectInput.focus();

});
const deleteButton =
    subjectCard.querySelector(".delete-subject-button");

deleteButton.addEventListener("click", () => {

    deleteModal.classList.add("show");

    deleteModalTitle.textContent = "Delete Subject?";

    deleteModalDescription.textContent =
        `Are you sure you want to delete "${subject.name}"?`;

    deleteModalMessage.textContent =
        "This action cannot be undone.";

    deleteModal.dataset.deleteId = subject.id;

    deleteModal.dataset.deleteType = "subject";
});
subjectsContainer.appendChild(subjectCard);

});


}







addTaskButton.addEventListener("click", () => {

    openItemModal("task");

});

const addSubjectButton =
    document.getElementById("addSubjectButton");

const subjectModal =
    document.getElementById("subjectModal");

const subjectInput =
    document.getElementById("subjectInput");

const closeSubjectModal =
    document.getElementById("closeSubjectModal");

const cancelSubjectButton =
    document.getElementById("cancelSubjectButton");

addSubjectButton.addEventListener("click", () => {

    subjectModal.classList.add("show");

    subjectModalTitle.textContent = "Add Subject";

    subjectInput.value = "";

    subjectModal.dataset.editingId = "";

    saveSubjectButton.textContent = "Add Subject";

    subjectInput.focus();
});

function closeSubjectModalWindow() {
    subjectModal.classList.remove("show");
    subjectInput.value = "";
}

closeSubjectModal.addEventListener(
    "click",
    closeSubjectModalWindow
);

cancelSubjectButton.addEventListener(
    "click",
    closeSubjectModalWindow
);
saveSubjectButton.addEventListener("click", async () => {

    const newName = subjectInput.value.trim();

    if (!newName) {
        subjectInput.focus();
        return;
    }

    const editingId =
        subjectModal.dataset.editingId;

    if (editingId) {

        await editSubject(editingId, newName);

    } else {

        await addSubject(newName);

    }

    subjectModal.classList.remove("show");

    subjectInput.value = "";

    subjectModal.dataset.editingId = "";

    subjectModalTitle.textContent = "Add Subject";

    saveSubjectButton.textContent = "Add Subject";

});
// ====================
// SAVE GOAL / TASK
// ====================

saveItemButton.addEventListener("click", async () => {

    const title = itemInput.value.trim();


    if (!title) {

        itemModalMessage.textContent =
            "Please enter a name.";

        itemInput.focus();

        return;

    }


    const user = await getCurrentUser();

    if (!user) return;


    saveItemButton.disabled = true;
    saveItemButton.textContent = "Saving...";


    // EDIT EXISTING ITEM

    if (editingId) {

        const table =
            modalType === "goal"
                ? "goals"
                : "tasks";

        const { error } = await supabase
            .from(table)
            .update({
                title: title
            })
            .eq("id", editingId)
            .eq("user_id", user.id);

        if (error) {
            console.error(error);

            itemModalMessage.textContent =
                "Could not save the changes.";

            saveItemButton.disabled = false;
            saveItemButton.textContent = "Save Changes";

            return;
        }

        const savedType = modalType;
        closeModal();

        if (savedType === "goal") {
            await loadGoals();
        } else {
            await loadTasks();
        }

        return;
    }

     


        

    // CREATE NEW GOAL

    if (modalType === "goal") {

        const { error } = await supabase
            .from("goals")
            .insert({
                user_id: user.id,
                title: title
            });


        if (error) {

            console.error(error);

            itemModalMessage.textContent =
                "Could not save the goal.";

            saveItemButton.disabled = false;
            saveItemButton.textContent = "Add Goal";

            return;

        }


        closeModal();
        loadGoals();

    }


    // CREATE NEW TASK

    else if (modalType === "task") {

        const { error } = await supabase
            .from("tasks")
            .insert({
                user_id: user.id,
                title: title,
                completed: false
            });


        if (error) {

            console.error(error);

            itemModalMessage.textContent =
                "Could not save the task.";

            saveItemButton.disabled = false;
            saveItemButton.textContent = "Add Task";

            return;

        }


        closeModal();
        loadTasks();

    }

});


// ====================
// INITIAL LOAD
// ====================

loadGoals();
loadTasks();
loadSubjects();


// ====================
// ACCOUNT
// ====================

const accountName =
    document.getElementById("accountName");

const accountButton =
    document.getElementById("accountButton");

const accountMenu =
    document.getElementById("accountMenu");

const accountEmail =
    document.getElementById("accountEmail");


async function loadAccountName() {

    const user = await getCurrentUser();

    if (!user) return;


    const name = user.user_metadata?.name;


    accountName.textContent =
        name || "Account";

}


loadAccountName();


accountButton.addEventListener("click", async () => {

    const user = await getCurrentUser();

    if (!user) return;

    accountEmail.textContent =
        user.email;

    accountMenu.classList.toggle("show");

});


// ====================
// LOG OUT
// ====================

const logoutButton =
    document.getElementById("logoutButton");


logoutButton.addEventListener("click", async () => {

    const { error } =
        await supabase.auth.signOut();


    if (error) {

        console.error(error);
        alert("Could not log out.");

        return;

    }


    window.location.href = "login.html";

});


// ====================
// SWITCH ACCOUNT
// ====================

const switchAccountButton =
    document.getElementById("switchAccountButton");


switchAccountButton.addEventListener("click", async () => {

    const { error } =
        await supabase.auth.signOut();


    if (error) {

        console.error(error);
        alert("Could not switch account.");

        return;

    }


    window.location.href = "login.html";

});


// ====================
// SETTINGS
// ====================

const settingsButton =
    document.getElementById("settingsButton");

const settingsOverlay =
    document.getElementById("settingsOverlay");

const closeSettingsButton =
    document.getElementById("closeSettingsButton");

const closeSettingsBottom =
    document.getElementById("closeSettingsBottom");


settingsButton.addEventListener("click", () => {

    settingsOverlay.classList.add("show");

});


closeSettingsButton.addEventListener("click", () => {

    settingsOverlay.classList.remove("show");

});


closeSettingsBottom.addEventListener("click", () => {

    settingsOverlay.classList.remove("show");

});


settingsOverlay.addEventListener("click", (event) => {

    if (event.target === settingsOverlay) {

        settingsOverlay.classList.remove("show");

    }

});


// ====================
// APPEARANCE
// ====================

const darkModeButton =
    document.getElementById("darkModeButton");


darkModeButton.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");


    if (
        document.body.classList.contains("light-mode")
    ) {

        localStorage.setItem(
            "studyAppTheme",
            "light"
        );

        darkModeButton.textContent =
            "☀️ Light Mode";

    } else {

        localStorage.setItem(
            "studyAppTheme",
            "dark"
        );

        darkModeButton.textContent =
            "🌙 Dark Mode";

    }

});


const savedTheme =
    localStorage.getItem("studyAppTheme");


if (savedTheme === "light") {

    document.body.classList.add("light-mode");

    darkModeButton.textContent =
        "☀️ Light Mode";

}


// ====================
// CHANGE MODE
// ====================

const changeModeButton =
    document.getElementById("changeModeButton");

const modeSelector =
    document.getElementById("modeSelector");

const currentModeText =
    document.getElementById("currentModeText");

const modeComingSoonMessage =
    document.getElementById(
        "modeComingSoonMessage"
    );


const modeNames = {

    study: "Study",

    study_fitness:
        "Study + Physical Training & Martial Arts",

    overall:
        "Overall Progress in Life"

};


function updateCurrentMode() {

    const currentMode =
        localStorage.getItem("studyAppMode")
        || "study";


    currentModeText.textContent =
        "Your current mode is " +
        modeNames[currentMode] +
        ".";

}


updateCurrentMode();


changeModeButton.addEventListener("click", () => {

    modeSelector.classList.toggle("show");

});


document.querySelectorAll("[data-mode]").forEach(button => {
    button.addEventListener("click", () => {
        const selectedMode = button.dataset.mode;

        if (selectedMode === "study") {
            localStorage.setItem("studyAppMode", "study");
            updateCurrentMode();
            modeSelector.classList.remove("show");
            return;
        }

        modeComingSoonMessage.textContent =
            "🚀 " + modeNames[selectedMode] + " is coming soon!";

        modeComingSoonMessage.classList.add("show");

        setTimeout(() => {
            modeComingSoonMessage.classList.remove("show");
        }, 4000);
    });
});