
// ==========================================
// EARNOVA - MAIN JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Earnova JavaScript loaded successfully!");

    // ==========================================
    // 1. REGISTRATION SYSTEM
    // ==========================================

    const registerForm = document.getElementById("register-form");

    if (registerForm) {

        registerForm.addEventListener("submit", function (event) {

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

            const user = {
                fullname: fullname,
                email: email,
                phone: phone
            };

            localStorage.setItem("earnovaUser", JSON.stringify(user));
            sessionStorage.setItem("earnovaLoggedIn", "true");

            alert("Registration successful! Welcome to Earnova.");

            window.location.href = "dashboard.html";

        });

    }


    // ==========================================
    // 2. LOGIN SYSTEM - DEMO
    // ==========================================

    const loginForm = document.getElementById("login-form");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            const savedUserText = localStorage.getItem("earnovaUser");

            if (!savedUserText) {
                alert("No account found. Please register first.");
                return;
            }

            const savedUser = JSON.parse(savedUserText);

            if (email !== savedUser.email || password.trim() === "") {
                alert("Please check your email and password.");
                return;
            }

            sessionStorage.setItem("earnovaLoggedIn", "true");

            alert("Welcome back, " + savedUser.fullname + "!");

            window.location.href = "dashboard.html";

        });

    }


    // ==========================================
    // 3. DASHBOARD WELCOME MESSAGE
    // ==========================================

    const welcomeMessage = document.getElementById("welcome-message");

    if (welcomeMessage) {

        const loggedIn = sessionStorage.getItem("earnovaLoggedIn");
        const savedUserText = localStorage.getItem("earnovaUser");

        if (loggedIn !== "true" || !savedUserText) {

            window.location.href = "login.html";

        } else {

            const user = JSON.parse(savedUserText);

            welcomeMessage.textContent = "Welcome, " + user.fullname + "!";

            const memberEmail = document.getElementById("member-email");

            if (memberEmail) {
                memberEmail.textContent = user.email;
            }

        }

    }


    // ==========================================
    // 4. LOGOUT SYSTEM
    // ==========================================

    const logoutLink = document.getElementById("logout-link");

    if (logoutLink) {

        logoutLink.addEventListener("click", function (event) {

            event.preventDefault();

            sessionStorage.removeItem("earnovaLoggedIn");

            alert("You have successfully logged out.");

            window.location.href = "login.html";

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
