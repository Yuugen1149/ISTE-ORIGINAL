
// IMPORTANT: Add your Firebase project configuration to this file.
// Replace the placeholder values with your actual Firebase project configuration.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebase.firestore();

const registrationForm = document.getElementById("registration-form");
const submissionStatus = document.getElementById("submission-status");

registrationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = registrationForm.name.value;
    const dob = registrationForm.dob.value;
    const year = registrationForm.year.value;
    const branch = registrationForm.branch.value;
    const phone = registrationForm.phone.value;
    const email = registrationForm.email.value;
    const membership = registrationForm.membership.value;
    const screenshotFile = registrationForm.screenshot.files[0];

    if (!screenshotFile) {
        submissionStatus.innerHTML = "<p style='color:red;'>Please upload a screenshot of the payment.</p>";
        return;
    }

    submissionStatus.innerHTML = "<p>Submitting...</p>";

    try {
        // Upload screenshot to Firebase Storage
        const storageRef = storage.ref(`screenshots/${Date.now()}_${screenshotFile.name}`);
        const uploadTask = storageRef.put(screenshotFile);

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                submissionStatus.innerHTML = `<p>Upload is ${progress}% done</p>`;
            },
            (error) => {
                console.error("Error uploading screenshot:", error);
                submissionStatus.innerHTML = "<p style='color:red;'>Error uploading screenshot. Please try again.</p>";
            },
            async () => {
                // Get screenshot URL
                const screenshotURL = await uploadTask.snapshot.ref.getDownloadURL();

                // Save registration data to Firestore
                await db.collection("registrations").add({
                    name,
                    dob,
                    year,
                    branch,
                    phone,
                    email,
                    membership,
                    screenshotURL,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                submissionStatus.innerHTML = "<p style='color:green;'>Registration successful!</p>";
                registrationForm.reset();
            }
        );
    } catch (error) {
        console.error("Error submitting registration:", error);
        submissionStatus.innerHTML = "<p style='color:red;'>Error submitting registration. Please try again.</p>";
    }
});
