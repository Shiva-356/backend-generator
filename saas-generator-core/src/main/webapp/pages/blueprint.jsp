<%@ page language="java" contentType="text/html; charset=UTF-8" 
	pageEncoding="UTF-8"%>
<%@ page import="com.saas.generator.model.Template" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>BackEnd Blueprint</title>
<link rel="stylesheet" href="${pageContext.request.contextPath}/assets/style.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet"
 href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
body {
    font-family: Arial, sans-serif;
    margin: 30px;
    background-color: #f8f9fa;
}
.section {
    transition: 0.2s;
}

.section:hover {
    transform: scale(1.01);
    border-left: 5px solid #2563eb;
}
h1 {
    color: #2c3e50;
}

h2 {
    color: #34495e;
}
ul {
    margin-left: 20px;
}
a {
    display: inline-block;
    margin-top: 10px;
    text-decoration: none;
    color: #ffffff;
    background-color: #007bff;
    padding: 8px 14px;
    border-radius: 4px;
    transition: background-color 0.3s ease, transform 0.2s ease;
}
a:hover {
    background-color: #0056b3;
    transform: scale(1.03);
}
a.back-link {
    background-color: #6c757d;
}

a.back-link:hover {
    background-color: #545b62;
}
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #212529;
    padding: 12px 20px;
    margin-bottom: 25px;
    border-radius: 6px;
}

.nav-left {
    color: #ffffff;
    font-size: 18px;
    font-weight: bold;
}

.nav-right a {
    color: #ffffff;
    margin-left: 15px;
    background: transparent;
    padding: 6px 10px;
}

.nav-right a:hover {
    background-color: #343a40;
    border-radius: 4px;
}

</style>

</head>
<body>
<div class="navbar">
    <div class="nav-left">SaaS Generator</div>
    <div class="nav-right">
        <a href="dashboard">Dashboard</a>
        <a href="logout">Logout</a>
    </div>
</div>
<h1><i class="fa-solid fa-diagram-project"></i> BackEnd Blueprint</h1>
<%
Template template = (Template) request.getAttribute("template");
String projectName = (String) request.getAttribute("projectName");
String projectType = (String) request.getAttribute("projectType");
%>
<div class="section">
    <h2>Project Information</h2>
    <p><b>Project Name:</b> <%= projectName %></p>
    <p><b>Project Type:</b> <%= projectType %></p>
</div>
<% if (template != null) { %>
<div class="section">
	<h2><i class="fa-solid fa-cubes"></i> Modules</h2>
    <ul>
        <% for (String m : template.getModules()) { %>
            <li><%= m %></li>
        <% } %>
    </ul>
</div>
<div class="section">
    <h2><i class="fa-solid fa-plug"></i> APIs</h2>
    <ul>
        <% for (String api : template.getApis()) { %>
            <li><%= api %></li>
        <% } %>
    </ul>
</div>
<div class="section">
    <h2><i class="fa-solid fa-database"></i> Database Tables</h2>
    <ul>
        <% for (String table : template.getDatabaseTables()) { %>
            <li><%= table %></li>
        <% } %>
    </ul>
</div>
<div class="section">
    <h2><i class="fa-solid fa-shield-halved"></i> Security Rules</h2>
    <ul>
        <% for (String sec : template.getSecurityRules()) { %>
            <li><%= sec %></li>
        <% } %>
    </ul>
</div>
<% } else { %>
    <p>No template generated.</p>
<% } %>
<br>
<a href="dashboard" class="back-link">⬅ Back to DashBoard</a>
<br><br>
<a href="download?project=${projectName}">
    Download BackEnd Code
</a>
<% String pdfPath = (String) request.getAttribute("pdfPath"); %>
<% if (pdfPath != null) { %>
    <br><br>
    <a href="<%= pdfPath %>" download>
    Download BackEnd Blueprint PDF
	</a>

<% } %>

</body>
</html>
