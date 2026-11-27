
// ==========================================
// EARNOVA - MAIN JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Earnova JavaScript loaded successfully!");

    // ==========================================
    // 1. PAGE AUTHENTICATION PROTECTION
    // ==========================================

    const currentPage = window.location.pathname.split("/").pop();

    const protectedPages = [
        "dashboard.html",
        "tasks.html",
        "wallet.html",
        "referrals.html"
    ];

    if (protectedPages.includes(currentPage)) {

        async function checkAuthentication() {

            const { data, error } = await supabaseClient.auth.getSession();

            if (error || !data.session) {
                window.location.replace("login.html");
                return;
            }

            // Load dashboard profile only on dashboard.html
            if (currentPage === "dashboard.html") {

                const welcomeMessage =
                    document.getElementById("welcome-message");

                if (welcomeMessage) {

                    const { data: profile, error: profileError } =
                        await supabaseClient
                            .from("profiles")
                            .select("full_name, phone")
                            .eq("id", data.session.user.id)
                            .single();

                    if (profileError) {
                        console.error("Profile loading error:", profileError);
                    }

                    const fullname = profile?.full_name || "Earnova Member";

                    welcomeMessage.textContent =
                        "Welcome, " + fullname + "!";

                    const memberEmail =
                        document.getElementById("member-email");

                    if (memberEmail) {
                        memberEmail.textContent = data.session.user.email;
                    }
                }
            }
        }

        checkAuthentication();
    }


    // ==========================================
    // 2. REGISTRATION SYSTEM - SUPABASE
    // ==========================================

    const registerForm = document.getElementById("register-form");

    if (registerForm) {

        registerForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const fullname = document.getElementById("fullname").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword =
                document.getElementById("confirm-password").value;

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

            const submitButton =
                registerForm.querySelector('button[type="submit"]');

            try {

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = "Creating Account...";
                }

                const { data, error } = await supabaseClient.auth.signUp({

                    email: email,
                    password: password,

                    options: {
                        emailRedirectTo: "https://merk-art.github.io/earnova/",

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

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Create Account";
                }

            }

        });
    }


    // ==========================================
    // 3. LOGIN SYSTEM - SUPABASE
    // ==========================================

    const loginForm = document.getElementById("login-form");

    if (loginForm) {

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            const submitButton =
                loginForm.querySelector('button[type="submit"]');

            try {

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = "Logging in...";
                }

                const { data, error } =
                    await supabaseClient.auth.signInWithPassword({
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

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Login";
                }

            }

        });
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

                window.location.replace("login.html");

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
    // 6. LOAD TASKS AND HANDLE SUBMISSIONS
    // ==========================================

    const taskGrid = document.getElementById("task-grid");

    if (taskGrid) {

        const taskMap = new Map();

        // Create the task details area
        const taskDetails = document.createElement("section");
        taskDetails.className = "task-details";
        taskDetails.id = "task-details";

        taskGrid.insertAdjacentElement("afterend", taskDetails);

        // Load available tasks from Supabase
        async function loadTasks() {

            const { data: tasks, error } = await supabaseClient
                .from("tasks")
                .select("id, title, description, instructions, category, reward_amount")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            taskGrid.replaceChildren();
            taskMap.clear();

            if (error) {

                console.error("Task loading error:", error);
                taskGrid.textContent =
                    "Unable to load tasks. Please refresh the page.";
                return;
            }

            if (!tasks || tasks.length === 0) {

                taskGrid.textContent =
                    "There are currently no available tasks.";
                return;
            }

            tasks.forEach(function (task) {

                taskMap.set(String(task.id), task);

                const card = document.createElement("div");
                card.className = "task-card";

                const category = document.createElement("span");
                category.className = "task-category";
                category.textContent = task.category.replaceAll("_", " ");

                const title = document.createElement("h2");
                title.textContent = task.title;

                const description = document.createElement("p");
                description.textContent = task.description;

                const reward = document.createElement("h3");
                reward.textContent =
                    "KSh " + Number(task.reward_amount).toFixed(2);

                const button = document.createElement("button");
                button.type = "button";
                button.className = "task-btn";
                button.dataset.taskId = task.id;
                button.textContent = "View Task";

                card.appendChild(category);
                card.appendChild(title);
                card.appendChild(description);
                card.appendChild(reward);
                card.appendChild(button);

                taskGrid.appendChild(card);

            });
        }

        // Open task details when View Task is clicked
        taskGrid.addEventListener("click", function (event) {

            const button = event.target.closest(".task-btn");

            if (!button) {
                return;
            }

            const task = taskMap.get(button.dataset.taskId);

            if (!task) {
                return;
            }

            taskDetails.replaceChildren();

            const heading = document.createElement("h2");
            heading.textContent = task.title;

            const description = document.createElement("p");
            description.textContent = task.description;

            const instructionsHeading = document.createElement("h3");
            instructionsHeading.textContent = "Instructions";

            const instructions = document.createElement("p");
            instructions.textContent =
                task.instructions || "No additional instructions provided.";

            const submissionHeading = document.createElement("h3");
            submissionHeading.textContent = "Submit Your Work";

            const explanation = document.createElement("p");
            explanation.textContent =
                "Complete the task and enter your work below. You may also provide a link as proof.";

            // Create submission form
            const form = document.createElement("form");
            form.id = "task-submission-form";

            const workLabel = document.createElement("label");
            workLabel.textContent = "Your completed work";

            const workBox = document.createElement("textarea");
            workBox.name = "submission_text";
            workBox.placeholder = "Enter your answers or completed work here...";
            workBox.rows = 7;

            const proofLabel = document.createElement("label");
            proofLabel.textContent = "Proof link (optional)";

            const proofInput = document.createElement("input");
            proofInput.type = "url";
            proofInput.name = "proof_url";
            proofInput.placeholder = "https://example.com/your-work";

            const submitButton = document.createElement("button");
            submitButton.type = "submit";
            submitButton.className = "task-btn";
            submitButton.textContent = "Submit Task";

            const message = document.createElement("p");
            message.id = "submission-message";

            workLabel.appendChild(workBox);
proofLabel.appendChild(proofInput);

form.appendChild(workLabel);
form.appendChild(proofLabel);
            form.appendChild(submitButton);
            form.appendChild(message);

            taskDetails.appendChild(heading);
            taskDetails.appendChild(description);
            taskDetails.appendChild(instructionsHeading);
            taskDetails.appendChild(instructions);
            taskDetails.appendChild(submissionHeading);
            taskDetails.appendChild(explanation);
            taskDetails.appendChild(form);

            taskDetails.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            // Save the member's submission
            form.addEventListener("submit", async function (event) {

                event.preventDefault();

                const submissionText = workBox.value.trim();
                const proofUrl = proofInput.value.trim();

                if (!submissionText && !proofUrl) {

                    message.textContent =
                        "Please enter your completed work or provide a proof link.";

                    return;
                }

                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";

                const { data: userData, error: userError } =
                    await supabaseClient.auth.getUser();

                if (userError || !userData.user) {

                    message.textContent =
                        "Your session could not be verified. Please log in again.";

                    submitButton.disabled = false;
                    submitButton.textContent = "Submit Task";
                    return;
                }

                const { error: submitError } = await supabaseClient
                    .from("task_submissions")
                    .insert({
                        task_id: task.id,
                        user_id: userData.user.id,
                        submission_text: submissionText || null,
                        proof_url: proofUrl || null
                    });

                if (submitError) {

                    console.error("Submission error:", submitError);

                    if (submitError.code === "23505") {

                        message.textContent =
                            "You have already submitted this task.";

                    } else {

                        message.textContent =
                            "Submission failed. Please try again.";
                    }

                    submitButton.disabled = false;
                    submitButton.textContent = "Submit Task";
                    return;
                }

                message.textContent =
                    "Your work has been submitted successfully! It is now pending review.";

                form.reset();
                form.replaceWith(message);

            });

        });

        // Start loading tasks
        loadTasks();

    }

});
