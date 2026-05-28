package com.example.demo;

import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.bind.annotation.*;

@RestController
@SpringBootApplication
public class DemoApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(DemoApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Autowired
    private TaskRepository taskRepository;

    @CrossOrigin
    @GetMapping("/")
    public List<Task> getTasks() {
        List<Task> tasks = taskRepository.findAll();
        tasks.sort(Comparator.comparing(
            t -> t.getDueDate() != null ? t.getDueDate() : "9999-12-31"
        ));
        return tasks;
    }

    @CrossOrigin
    @PostMapping("/tasks")
    public String addTask(@RequestBody Task task) {
        if (task.getTaskdescription() == null || task.getTaskdescription().isBlank()) {
            return "error: empty description";
        }
        if (taskRepository.findByTaskdescription(task.getTaskdescription()).isPresent()) {
            return "redirect:/";
        }
        taskRepository.save(task);
        return "redirect:/";
    }

    @CrossOrigin
    @PostMapping("/delete")
    public String delTask(@RequestBody Task task) {
        taskRepository.findByTaskdescription(task.getTaskdescription())
            .ifPresent(t -> taskRepository.delete(t));
        return "redirect:/";
    }

    @CrossOrigin
    @PutMapping("/tasks/{id}")
    public String updateTask(@PathVariable Long id, @RequestBody Task updated) {
        if (updated.getTaskdescription() == null || updated.getTaskdescription().isBlank()) {
            return "error: empty description";
        }
        taskRepository.findById(id).ifPresent(task -> {
            task.setTaskdescription(updated.getTaskdescription());
            taskRepository.save(task);
        });
        return "redirect:/";
    }
}
