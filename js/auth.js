import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://cazxkkeuehubbdrpbyul.supabase.co";
const SUPABASE_KEY = "sb_publishable_t4O5ZOFX-ComDleRd5R73w_mMhQaZwZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const loginForm = document.getElementById("loginForm");
const signupButton = document.getElementById("signupButton");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        message.textContent = error.message;
        return;
    }
const hasSelectedMode = localStorage.getItem("studyAppMode");

if (hasSelectedMode) {
    window.location.href = "dashboard.html";
} else {
    window.location.href = "onboarding.html";
}
});

signupButton.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value;

if (!name) {
    message.textContent = "Enter your name first.";
    return;
}

    if (!email || !password) {
        message.textContent = "Enter your email and password first.";
        return;
    }

    message.textContent = "Creating account...";

    const { error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        message.textContent = error.message;
        return;
    }

    message.textContent =
        "Account created! Check your email if verification is required.";
});