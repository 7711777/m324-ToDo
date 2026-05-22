package com.example.demo;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DemoApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    // Test 1: Anwendung startet korrekt
    @Test
    void contextLoads() {
        assertTrue(true);
    }

    // Test 2: Task Getter/Setter funktioniert
    @Test
    void testTaskDescription() {
        Task task = new Task();
        task.setTaskdescription("Einkaufen");
        assertEquals("Einkaufen", task.getTaskdescription());
    }

    // Test 3: GET "/" gibt HTTP 200 zurück (MockMvc)
    @Test
    void testGetEndpointReturnsOk() throws Exception {
        mockMvc.perform(get("/"))
               .andExpect(status().isOk());
    }

    // TDD Test 4: Task hat Erfassungsdatum bei Instanziierung (schlägt zuerst fehl!)
    @Test
    void testTaskHasCreationDate() {
        Task task = new Task();
        assertNotNull(task.getCreatedAt(), "Task soll ein Erfassungsdatum haben");
    }

}
