package com.saas.generator.service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

public class CodeGenerator {

    private static final String BASE_PATH = "D:/saas-output/";

    public static void generateBackend(String projectName,
                                       List<String> modules,
                                       List<String> tables) throws IOException {

        String root = BASE_PATH + projectName + "-backend/";

        createDir(root + "src/main/java/com/example/app/controller");
        createDir(root + "src/main/java/com/example/app/service");
        createDir(root + "src/main/java/com/example/app/repository");
        createDir(root + "src/main/java/com/example/app/model");
        createDir(root + "src/main/resources");

        for (String module : modules) {
            generateEntity(root, module);
            generateRepository(root, module);
            generateService(root, module);
            generateController(root, module);
        }

        generateSQL(root, tables);
        generateReadme(root, projectName);
    }

    private static void createDir(String path) {
        new File(path).mkdirs();
    }

    private static void generateEntity(String root, String name) throws IOException {
        FileWriter fw = new FileWriter(
            root + "src/main/java/com/example/app/model/" + name + ".java");

        fw.write(
            "package com.example.app.model;\n\n" +
            "import jakarta.persistence.*;\n" +
            "import java.time.LocalDateTime;\n\n" +
            "@Entity\n" +
            "public class " + name + " {\n\n" +
            "    @Id\n" +
            "    @GeneratedValue(strategy = GenerationType.IDENTITY)\n" +
            "    private Long id;\n\n" +
            "    private LocalDateTime createdAt = LocalDateTime.now();\n" +
            "}\n"
        );
        fw.close();
    }

    private static void generateRepository(String root, String name) throws IOException {
        FileWriter fw = new FileWriter(
            root + "src/main/java/com/example/app/repository/" + name + "Repository.java");

        fw.write(
            "package com.example.app.repository;\n\n" +
            "import org.springframework.data.jpa.repository.JpaRepository;\n" +
            "import com.example.app.model." + name + ";\n\n" +
            "public interface " + name + "Repository extends JpaRepository<" + name + ", Long> {}\n"
        );
        fw.close();
    }

    private static void generateService(String root, String name) throws IOException {
        FileWriter fw = new FileWriter(
            root + "src/main/java/com/example/app/service/" + name + "Service.java");

        fw.write(
            "package com.example.app.service;\n\n" +
            "import org.springframework.stereotype.Service;\n" +
            "import com.example.app.model." + name + ";\n\n" +
            "@Service\n" +
            "public class " + name + "Service {\n\n" +
            "    public " + name + " create(" + name + " obj) {\n" +
            "        return obj;\n" +
            "    }\n" +
            "}\n"
        );
        fw.close();
    }

    private static void generateController(String root, String name) throws IOException {
        FileWriter fw = new FileWriter(
            root + "src/main/java/com/example/app/controller/" + name + "Controller.java");

        fw.write(
            "package com.example.app.controller;\n\n" +
            "import org.springframework.web.bind.annotation.*;\n" +
            "import com.example.app.model." + name + ";\n\n" +
            "@RestController\n" +
            "@RequestMapping(\"/" + name.toLowerCase() + "s\")\n" +
            "public class " + name + "Controller {\n\n" +
            "    @PostMapping\n" +
            "    public String create(@RequestBody " + name + " obj) {\n" +
            "        return \"" + name + " created\";\n" +
            "    }\n" +
            "}\n"
        );
        fw.close();
    }

    private static void generateSQL(String root, List<String> tables) throws IOException {
        FileWriter fw = new FileWriter(root + "src/main/resources/schema.sql");

        for (String table : tables) {
            fw.write("CREATE TABLE " + table + " (id BIGINT PRIMARY KEY AUTO_INCREMENT);\n\n");
        }
        fw.close();
    }

    private static void generateReadme(String root, String projectName) throws IOException {
        FileWriter fw = new FileWriter(root + "README.md");

        fw.write(
            "# " + projectName + " Backend\n\n" +
            "Generated using SaaS Backend Generator\n\n" +
            "## Purpose\n" +
            "This project provides a production-ready backend structure\n" +
            "that can be extended with business logic.\n\n" +
            "## Tech Stack\n" +
            "- Spring Boot\n- REST APIs\n- JPA\n\n" +
            "## Sample API\nPOST /users\n\n"
        );
        fw.close();
    }
}
