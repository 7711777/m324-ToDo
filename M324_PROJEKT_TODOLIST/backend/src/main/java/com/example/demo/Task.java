package com.example.demo;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String taskdescription;

    private String dueDate;

    private String createdAt;

    public Task() {
        this.createdAt = LocalDate.now().toString();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTaskdescription() { return taskdescription; }
    public void setTaskdescription(String taskdescription) { this.taskdescription = taskdescription; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
