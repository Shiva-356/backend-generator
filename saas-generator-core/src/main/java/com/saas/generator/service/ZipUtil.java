package com.saas.generator.service;

import java.io.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ZipUtil {

    public static void zipFolder(String sourceFolder, String zipPath) throws IOException {
        FileOutputStream fos = new FileOutputStream(zipPath);
        ZipOutputStream zos = new ZipOutputStream(fos);

        File folder = new File(sourceFolder);
        zipFiles(folder, folder.getName(), zos);

        zos.close();
        fos.close();
    }

    private static void zipFiles(File file, String fileName, ZipOutputStream zos)
            throws IOException {

        if (file.isHidden()) return;

        if (file.isDirectory()) {
            if (!fileName.endsWith("/")) {
                zos.putNextEntry(new ZipEntry(fileName + "/"));
                zos.closeEntry();
            }
            File[] children = file.listFiles();
            if (children != null) {
                for (File child : children) {
                    zipFiles(child, fileName + "/" + child.getName(), zos);
                }
            }
            return;
        }

        FileInputStream fis = new FileInputStream(file);
        ZipEntry zipEntry = new ZipEntry(fileName);
        zos.putNextEntry(zipEntry);

        byte[] bytes = new byte[1024];
        int length;
        while ((length = fis.read(bytes)) >= 0) {
            zos.write(bytes, 0, length);
        }

        fis.close();
    }
}
