package com.saas.generator.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import com.saas.generator.model.Template;

import java.io.FileOutputStream;

public class PdfGenerator {

    public static String generateBlueprintPDF(String projectName, Template template) {

        String path = "D:/saas-output/" + projectName + "_Blueprint.pdf";

        try {
            Document document = new Document();
            PdfWriter.getInstance(document, new FileOutputStream(path));
            document.open();

            document.add(new Paragraph("Backend Blueprint"));
            document.add(new Paragraph("Project: " + projectName));
            document.add(new Paragraph("Template: " + template.getTemplateName()));
            document.add(new Paragraph("\nModules:"));

            for (String m : template.getModules())
                document.add(new Paragraph("- " + m));

            document.close();
            return path;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
