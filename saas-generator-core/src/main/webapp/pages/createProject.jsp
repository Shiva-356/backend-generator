<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<title>Create Project</title>
<link rel="stylesheet" href="${pageContext.request.contextPath}/assets/style.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

</head>
<body>
<header>
    <h2>SaaS Backend Generator</h2>
</header>

<div class="container">
    <div class="card">
        <h2>Create New Project</h2>

        <form action="${pageContext.request.contextPath}/createProject" method="post">
            <label>Project Name</label><br>
            <input type="text" name="projectName" required style="width:100%;padding:8px"><br><br>

            <label>Project Type</label><br>
            <select name="projectType">
    	<option value="FOOD_DELIVERY">Online Food Delivery</option>
    	<option value="ECOMMERCE">E-Commerce</option>
    	<option value="BOOKING">Booking APP</option>
    	<option value="STREAMING">Streaming MVP</option>
    	<option value="PAYMENT">Payment APP</option>
    	<option value="EDUCATION">Education System</option>
    	<option value="CUSTOM">Custom Startup</option>
	</select><br><br>

            <button type="submit">Generate Backend</button>
        </form>
    </div>

    <a href="dashboard">← Back to Dashboard</a>
</div>
</body>
</html>
