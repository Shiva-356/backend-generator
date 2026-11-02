package com.saas.generator.controller;

import com.saas.generator.service.ZipUtil;
import java.io.*;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/download")
public class DownloadServlet extends HttpServlet {

    private static final String BASE_PATH = "D:/saas-output/";

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String project = request.getParameter("project");

        String source = BASE_PATH + project + "-backend";
        String zip = BASE_PATH + project + ".zip";

        ZipUtil.zipFolder(source, zip);

        response.setContentType("application/zip");
        response.setHeader("Content-Disposition",
                "attachment; filename=" + project + ".zip");

        FileInputStream fis = new FileInputStream(zip);
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
