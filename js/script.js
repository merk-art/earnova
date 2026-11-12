
// ==========================================
// EARNOVA - MAIN JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Earnova JavaScript loaded successfully!");

    
    // ==========================================
    // 1. REGISTRATION SYSTEM - SUPABASE
    // ==========================================

    const registerForm = document.getElementById("register-form");

    if (registerForm) {

        registerForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const fullname = document.getElementById("fullname").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            if (!fullname || !email || !phone || !password || !confirmPassword) {
                alert("Please complete all required fields.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            if (password.length < 8) {
                alert("Password must contain at least 8 characters.");
                return;
            }

            const submitButton = registerForm.querySelector('button[type="submit"]');

            try {

                submitButton.disabled = true;
                submitButton.textContent = "Creating Account...";

                const { data, error } = await supabaseClient.auth.signUp({

                    email: email,
                    password: password,

                    options: {
                        data: {
                            full_name: fullname,
                            phone: phone
                        }
                    }

                });

                if (error) {
                    throw error;
                }

                if (data.session) {

                    alert("Account created successfully! You can now log in.");

                } else {

                    alert(
                        "Account created successfully! " +
                        "Please check your email for a verification link " +
                        "before logging in."
                    );

                }

                window.location.href = "login.html";

            } catch (error) {

                console.error("Registration error:", error);

                alert("Registration failed: " + error.message);

            } finally {

                submitButton.disabled = false;
                submitButton.textContent = "Create Account";

            }

        });

    }


    
    // ==========================================
    // 2. LOGIN SYSTEM - SUPABASE
    // ==========================================

    const loginForm = document.getElementById("login-form");

    if (loginForm) {

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            const submitButton = loginForm.querySelector('button[type="submit"]');

            try {

                submitButton.disabled = true;
                submitButton.textContent = "Logging in...";

                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    throw error;
                }

                alert("Welcome back! Login successful.");

                window.location.href = "dashboard.html";

            } catch (error) {

                console.error("Login error:", error);

                alert("Login failed: " + error.message);

            } finally {

                submitButton.disabled = false;
                submitButton.textContent = "Login";

            }

        });

    }

    
    // ==========================================
    // 3. DASHBOARD - SUPABASE AUTHENTICATION
    // ==========================================

    const welcomeMessage = document.getElementById("welcome-message");

    if (welcomeMessage) {

        async function loadDashboard() {

            const { data: { session }, error } =
                await supabaseClient.auth.getSession();

            if (error || !session) {
                window.location.replace("login.html");
                return;
            }

            const { data: profile, error: profileError } =
                await supabaseClient
                    .from("profiles")
                    .select("full_name, phone")
                    .eq("id", session.user.id)
                    .single();

            if (profileError) {
                console.error("Profile loading error:", profileError);
            }

            const fullname = profile?.full_name || "Earnova Member";

            welcomeMessage.textContent = "Welcome, " + fullname + "!";

            const memberEmail = document.getElementById("member-email");

            if (memberEmail) {
                memberEmail.textContent = session.user.email;
            }

        }

        loadDashboard();

    }


    
    // ==========================================
    // 4. LOGOUT SYSTEM - SUPABASE
    // ==========================================

    const logoutLink = document.getElementById("logout-link");

    if (logoutLink) {

        logoutLink.addEventListener("click", async function (event) {

            event.preventDefault();

            try {

                const { error } = await supabaseClient.auth.signOut();

                if (error) {
                    throw error;
                }

                alert("You have successfully logged out.");

                window.location.href = "login.html";

            } catch (error) {

                console.error("Logout error:", error);

                alert("Could not log out: " + error.message);

            }

        });

    }


    // ==========================================
    // 5. REFERRAL CODE SYSTEM - DEMO
    // ==========================================

    const referralInput = document.getElementById("referral-code");
    const copyReferral = document.getElementById("copy-referral");

    if (referralInput) {

        const savedUserText = localStorage.getItem("earnovaUser");

        if (savedUserText) {

            const user = JSON.parse(savedUserText);

            if (!user.referralCode) {

                user.referralCode = "ERN" +
                    Math.random().toString(36).substring(2, 8).toUpperCase();

                localStorage.setItem("earnovaUser", JSON.stringify(user));

            }

            referralInput.value = user.referralCode;

        }

    }

    if (copyReferral && referralInput) {

        copyReferral.addEventListener("click", async function () {

            referralInput.select();

            try {

                await navigator.clipboard.writeText(referralInput.value);
                alert("Referral code copied!");

            } catch (error) {

                alert("Please select and copy your referral code manually.");

            }

        });

    }


    // ==========================================
    // 6. TASK BUTTON SYSTEM
    // ==========================================

    document.addEventListener("click", function (event) {

        const button = event.target.closest(".task-btn");

        if (!button) {
            return;
        }

        const taskCard = button.closest(".task-card");

        if (!taskCard) {
            alert("Task information could not be found.");
            return;
        }

        const taskTitle = taskCard.querySelector("h2, h3, h4");
        const taskCategory = taskCard.querySelector(".task-category");
        const taskDescription = taskCard.querySelector("p");

        const title = taskTitle
            ? taskTitle.textContent.trim()
            : "Earnova demonstration task";

        const category = taskCategory
            ? taskCategory.textContent.trim()
            : "General task";

        const description = taskDescription
            ? taskDescription.textContent.trim()
            : "This task is currently a demonstration.";

        alert(
            "EARNOVA - TASK DETAILS\n\n" +
            "Task: " + title + "\n" +
            "Category: " + category + "\n\n" +
            description +
            "\n\nThis is a demonstration task. " +
            "Real task applications will be available " +
            "after the platform is connected to its backend."
        );

    });


});
