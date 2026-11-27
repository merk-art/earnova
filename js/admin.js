
// ==========================================
// EARNOVA ADMIN DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const submissionsList = document.getElementById("submissions-list");
    const adminMessage = document.getElementById("admin-message");

    const totalElement = document.getElementById("total-submissions");
    const pendingElement = document.getElementById("pending-submissions");
    const approvedElement = document.getElementById("approved-submissions");
    const rejectedElement = document.getElementById("rejected-submissions");

    // ==========================================
    // 1. CHECK ADMIN ACCESS
    // ==========================================

    async function checkAdminAccess() {

        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError || !userData.user) {
            window.location.replace("login.html");
            return false;
        }

        const { data: adminRecord, error: adminError } =
            await supabaseClient
                .from("admin_users")
                .select("user_id")
                .eq("user_id", userData.user.id)
                .maybeSingle();

        if (adminError || !adminRecord) {

            alert("Access denied. Administrator permission required.");
            window.location.replace("dashboard.html");
            return false;
        }

        return true;
    }

    // ==========================================
    // 2. LOAD SUBMISSIONS
    // ==========================================

    async function loadSubmissions() {

        submissionsList.textContent = "Loading submissions...";

        const { data: submissions, error } =
            await supabaseClient
                .from("task_submissions")
                .select("*")
                .order("submitted_at", { ascending: false });

        if (error) {

            console.error("Loading submissions error:", error);

            submissionsList.textContent =
                "Unable to load submissions. Please refresh.";

            return;
        }

        if (!submissions || submissions.length === 0) {

            submissionsList.textContent =
                "No task submissions have been received yet.";

            updateStatistics([]);
            return;
        }

        updateStatistics(submissions);
        submissionsList.replaceChildren();

        submissions.forEach(function (submission) {

            const card = document.createElement("div");
            card.className = "admin-submission-card";

            const title = document.createElement("h3");
            title.textContent = "Task ID: " + submission.task_id;

            const member = document.createElement("p");
            member.textContent = "Member ID: " + submission.user_id;

            const submitted = document.createElement("p");
            submitted.textContent =
                "Submitted: " +
                new Date(submission.submitted_at).toLocaleString();

            const workHeading = document.createElement("h4");
            workHeading.textContent = "Member's Work";

            const work = document.createElement("p");
            work.textContent =
                submission.submission_text || "No written response provided.";

            const proofHeading = document.createElement("h4");
            proofHeading.textContent = "Proof Link";

            const proof = document.createElement("p");

            if (submission.proof_url) {

                const proofLink = document.createElement("a");
                proofLink.href = submission.proof_url;
                proofLink.textContent = "Open submitted proof";
                proofLink.target = "_blank";
                proofLink.rel = "noopener noreferrer";

                proof.appendChild(proofLink);

            } else {

                proof.textContent = "No proof link provided.";

            }

            const status = document.createElement("p");
            status.textContent =
                "Status: " + submission.status.toUpperCase();

            const notesLabel = document.createElement("label");
            notesLabel.textContent = "Review notes";

            const notes = document.createElement("textarea");
            notes.value = submission.review_notes || "";
            notes.placeholder = "Write feedback for the member...";
            notes.rows = 3;

            card.appendChild(title);
            card.appendChild(member);
            card.appendChild(submitted);
            card.appendChild(workHeading);
            card.appendChild(work);
            card.appendChild(proofHeading);
            card.appendChild(proof);
            card.appendChild(status);
            card.appendChild(notesLabel);
            card.appendChild(notes);

            // Only pending submissions can be reviewed
            if (submission.status === "pending") {

                const actions = document.createElement("div");
                actions.className = "admin-actions";

                const approveButton = document.createElement("button");
                approveButton.textContent = "Approve";
                approveButton.type = "button";
                approveButton.className = "approve-btn";

                const rejectButton = document.createElement("button");
                rejectButton.textContent = "Reject";
                rejectButton.type = "button";
                rejectButton.className = "reject-btn";

                approveButton.addEventListener("click", function () {
                    reviewSubmission(
                        submission.id,
                        "approved",
                        notes.value,
                        approveButton,
                        rejectButton
                    );
                });

                rejectButton.addEventListener("click", function () {
                    reviewSubmission(
                        submission.id,
                        "rejected",
                        notes.value,
                        approveButton,
                        rejectButton
                    );
                });

                actions.appendChild(approveButton);
                actions.appendChild(rejectButton);

                card.appendChild(actions);

            }

            submissionsList.appendChild(card);

        });
    }

    // ==========================================
    // 3. UPDATE SUBMISSION STATISTICS
    // ==========================================

    function updateStatistics(submissions) {

        totalElement.textContent = submissions.length;

        pendingElement.textContent =
            submissions.filter(item => item.status === "pending").length;

        approvedElement.textContent =
            submissions.filter(item => item.status === "approved").length;

        rejectedElement.textContent =
            submissions.filter(item => item.status === "rejected").length;
    }

    // ==========================================
    // 4. APPROVE OR REJECT SUBMISSIONS
    // ==========================================

    async function reviewSubmission(
        submissionId,
        newStatus,
        reviewNotes,
        approveButton,
        rejectButton
    ) {

        const confirmation = confirm(
            "Are you sure you want to " + newStatus + " this submission?"
        );

        if (!confirmation) {
            return;
        }

        approveButton.disabled = true;
        rejectButton.disabled = true;

        const { error } = await supabaseClient
            .from("task_submissions")
            .update({
                status: newStatus,
                review_notes: reviewNotes.trim() || null,
                reviewed_at: new Date().toISOString()
            })
            .eq("id", submissionId)
            .eq("status", "pending");

        if (error) {

            console.error("Review error:", error);

            adminMessage.textContent =
                "Unable to update submission. Please try again.";

            approveButton.disabled = false;
            rejectButton.disabled = false;

            return;
        }

        adminMessage.textContent =
            "Submission successfully " + newStatus + ".";

        loadSubmissions();
    }

    // ==========================================
    // 5. ADMIN LOGOUT
    // ==========================================

    const logoutButton = document.getElementById("admin-logout");

    if (logoutButton) {

        logoutButton.addEventListener("click", async function (event) {

            event.preventDefault();

            const { error } = await supabaseClient.auth.signOut();

            if (error) {
                alert("Logout failed: " + error.message);
                return;
            }

            window.location.replace("login.html");

        });
    }

    // ==========================================
    // 6. START ADMIN DASHBOARD
    // ==========================================

    async function startAdminDashboard() {

        const isAdmin = await checkAdminAccess();

        if (!isAdmin) {
            return;
        }

        loadSubmissions();
    }

    startAdminDashboard();

});
