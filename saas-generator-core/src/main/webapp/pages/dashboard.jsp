<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>SaaS Dashboard</title>
<link rel="stylesheet" href="${pageContext.request.contextPath}/assets/style.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<style type="text/css">
.card {
    border: 1px solid #ddd;
    padding: 20px;
    border-radius: 6px;
    width: 280px;
    transition: 0.3s;
}

.card:hover {
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
}
</style>
</head>
<body>
	<header>
    <h2>SaaS Backend Generator</h2>
</header>

<div class="container">
    <div class="card">
        <h3>Welcome, ${sessionScope.username}</h3>
        <p><b>Project:</b> ${sessionScope.projectname}</p>
        <p><b>Login Time:</b> ${sessionScope.loginTime}</p>
    </div>

    <div class="card">
        <h3>Create New Project</h3>
        <p>Generate backend structure, schema & blueprint</p>
        <a class="btn" href="pages/createProject.jsp">Create</a>
    </div>

    <a href="logout">Logout</a>
</div>

</body>
</html>