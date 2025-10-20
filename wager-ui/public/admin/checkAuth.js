
// ✅ Get Token from Local Storage
const getToken = () => localStorage.getItem("token");
const adminUrl =  () => {
    window.location.href = `${BASE_URL}/admin/admin.html`;
}
// ✅ Check Authentication Before Loading the Page
const checkAuth = async () => {
    const token = getToken();

    if (!token) {
        window.location.href = BASE_URL+"/admin/login.html"; // ✅ Redirect immediately
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/data`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        // ✅ If authentication is successful, show the page
        document.body.style.display = "block"; 
    } catch (error) {
        logout(); // ✅ Auto logout if token is invalid
    }
};

// ✅ Logout Function
const logout = () => {
    localStorage.removeItem("token");
    window.location.href = BASE_URL+"/admin/login.html"; // ✅ Redirect to login
};

// ✅ Hide the page content initially (Prevent loading before auth check)
document.body.style.display = "none";

// ✅ Run authentication check before page loads
if (window.location.pathname !== "/admin/login.html") {
    checkAuth();
}
