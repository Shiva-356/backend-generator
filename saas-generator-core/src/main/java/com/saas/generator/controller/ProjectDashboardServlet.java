package com.saas.generator.controller;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import com.saas.generator.dao.ProjectDAO;
@WebServlet("/projectDashboard")
public class ProjectDashboardServlet extends HttpServlet {
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("username") == null) {
            response.sendRedirect("index.jsp");
            return;
        }
        request.setAttribute("projects", ProjectDAO.findAll());
        request.getRequestDispatcher("/pages/projectDashboard.jsp")
               .forward(request, response);
    }
}
