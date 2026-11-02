package com.saas.generator.controller;

import com.saas.generator.model.Template;
import com.saas.generator.service.TemplateEngine;
import com.saas.generator.service.CodeGenerator;
import com.saas.generator.service.PdfGenerator;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/createProject")
public class CreateProjectServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        if (session == null) {
            response.sendRedirect("index.jsp");
            return;
        }

        request.getRequestDispatcher("/pages/createProject.jsp")
               .forward(request, response);
    }
@Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String projectName = request.getParameter("projectName");
        String projectType = request.getParameter("projectType");

        Template template = TemplateEngine.getTemplate(projectType);

        CodeGenerator.generateBackend(
                projectName,
                template.getModules(),
                template.getDatabaseTables()
        );

        String pdfPath = PdfGenerator.generateBlueprintPDF(projectName, template);

        request.setAttribute("template", template);
        request.setAttribute("projectName", projectName);
        request.setAttribute("projectType", projectType);
        request.setAttribute("pdfPath", pdfPath);

        request.getRequestDispatcher("/pages/blueprint.jsp")
               .forward(request, response);
    }
}
