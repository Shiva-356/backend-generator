package com.saas.generator.controller;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
@WebServlet("/home")
public class HomeServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String name = "Shiva";
        String projectName = "Servlet Based SaaS Generator";
        String loginTime = java.time.LocalDateTime.now().toString();

        HttpSession session = request.getSession();
        session.setAttribute("username", name);
        session.setAttribute("projectname", projectName);
        session.setAttribute("loginTime", loginTime);

        response.sendRedirect("dashboard");
    }
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        doGet(request, response); 
    }
}
