package com.saas.generator.model;

import java.util.List;

public class Template {

    private String templateName;
    private List<String> modules;
    private List<String> apis;
    private List<String> databaseTables;
    private List<String> securityRules;

    public Template(String templateName, List<String> modules,
                    List<String> apis, List<String> databaseTables,
                    List<String> securityRules) {
        this.templateName = templateName;
        this.modules = modules;
        this.apis = apis;
        this.databaseTables = databaseTables;
        this.securityRules = securityRules;
    }

    public String getTemplateName() { return templateName; }
    public List<String> getModules() { return modules; }
    public List<String> getApis() { return apis; }
    public List<String> getDatabaseTables() { return databaseTables; }
    public List<String> getSecurityRules() { return securityRules; }
}
