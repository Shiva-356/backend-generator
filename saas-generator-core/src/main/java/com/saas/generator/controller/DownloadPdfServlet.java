package com.saas.generator.controller;

import java.io.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/downloadPdf")
public class DownloadPdfServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String project = request.getParameter("project");
        String filePath = "D:/saas-output/" + project + "_Blueprint.pdf";

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition",
                "attachment; filename=" + project + "_Blueprint.pdf");

        FileInputStream fis = new FileInputStream(filePath);
        OutputStream os = response.getOutputStream();

        byte[] buffer = new byte[1024];
        int bytes;
        while ((bytes = fis.read(buffer)) != -1) {
            os.write(buffer, 0, bytes);
        }

        fis.close();
        os.flush();
    }
}
