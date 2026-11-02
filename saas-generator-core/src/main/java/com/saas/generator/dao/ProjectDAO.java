package com.saas.generator.dao;
import java.util.ArrayList;
import java.util.List;
import com.saas.generator.model.Project;
public class ProjectDAO {
    private static final List<Project> projects = new ArrayList<>();
    public static void save(Project project) {
        projects.add(project);
    }
    public static List<Project> findAll() {
        return projects;
    }
}
