package com.saas.generator.model;
import java.util.*;
import java.time.LocalDateTime;
public class Project {
    private String projectName;
    private String projectType;
    private String owner;
    private LocalDateTime createdAt;
    private Template template;
    public Project(String projectName, String projectType, String owner) {
        this.projectName = projectName;
        this.projectType = projectType;
        this.owner = owner;
        this.createdAt = LocalDateTime.now();
    }
    public void setTemplate(Template template) {
        this.template = template;
    }
    public Template getTemplate() {
        return template;
    }
    public String getProjectName() {
        return projectName;
    }
    public String getProjectType() {
        return projectType;
    }
    public String getOwner() {
        return owner;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
