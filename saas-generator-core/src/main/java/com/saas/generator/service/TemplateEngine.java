package com.saas.generator.service;

import java.util.Arrays;
import com.saas.generator.model.Template;

public class TemplateEngine {

    public static Template getTemplate(String projectType) {

        switch (projectType) {

            case "FOOD_DELIVERY":
                return new Template(
                    "Food Delivery Backend",
                    Arrays.asList("User", "Restaurant", "Menu", "Order", "Payment"),
                    Arrays.asList("POST /login", "GET /restaurants", "POST /order"),
                    Arrays.asList("users", "restaurants", "orders", "payments"),
                    Arrays.asList("JWT Authentication", "Role Based Access")
                );

            case "EDUCATION_SYSTEM":
                return new Template(
                    "Education ERP Backend",
                    Arrays.asList("Student", "Faculty", "Course", "Attendance"),
                    Arrays.asList("POST /login", "GET /students"),
                    Arrays.asList("students", "faculty", "courses"),
                    Arrays.asList("JWT Authentication")
                );

            default:
                return new Template(
                    "Custom Startup Backend",
                    Arrays.asList("User"),
                    Arrays.asList("POST /login"),
                    Arrays.asList("users"),
                    Arrays.asList("Basic Security")
                );
        }
    }
}
