package com.saas.generator.model;
import java.util.Map;
public class TemplateConfig {
    private Map<String, Template> templates;
    public Map<String, Template> getTemplates() {
        return templates;
    }
    public void setTemplates(Map<String, Template> templates) {
        this.templates = templates;
    }
}
