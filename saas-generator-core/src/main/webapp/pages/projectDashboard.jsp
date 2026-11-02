<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.util.List" %>
<%@ page import="com.saas.generator.model.Project" %>
<%@ page import="com.saas.generator.model.Template" %>
<!DOCTYPE html>
<html>
<head>
<title>Projects</title>
<link rel="stylesheet" href="${pageContext.request.contextPath}/assets/style.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

</head>
<body>
<header style="padding:10px;background:#2c3e50;color:white">
  <h2>SaaS Backend Generator</h2>
</header>
<h2>Your Projects</h2>
<table border="1" cellpadding="8">
<tr>
    <th>Name</th>
    <th>Type</th>
    <th>Owner</th>
    <th>Created</th>
</tr>
<%
List<Project> projects = (List<Project>) request.getAttribute("projects");
if (projects != null) {
    for (Project p : projects) {
%>
<tr>
    <td><%= p.getProjectName() %></td>
    <td><%= p.getProjectType() %></td>
    <td><%= p.getOwner() %></td>
    <td><%= p.getCreatedAt() %></td>
</tr>
<%
Template t = p.getTemplate();
if (t != null) {
%>
<tr>
    <td colspan="4">
        <b>Template:</b> <%= t.getTemplateName() %><br>
        <b>Modules:</b> <%= t.getModules() %><br>
        <b>APIs:</b> <%= t.getApis() %><br>
        <b>Database Tables:</b> <%= t.getDatabaseTables() %><br>
        <b>Security:</b> <%= t.getSecurityRules() %>
    </td>
</tr>
<%
}
%>
<%
    }
}
%>
</table>
<br>
<a href="dashboard">Back to DashBoard</a>
</body>
</html>
