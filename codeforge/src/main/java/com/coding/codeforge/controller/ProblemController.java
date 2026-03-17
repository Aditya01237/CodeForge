package com.coding.codeforge.controller;

import com.coding.codeforge.DTO.RunRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ProblemController {

    @PostMapping("/run")
    public Map<String, Object> runCode(@RequestBody RunRequest req) {

        System.out.println("🔥 Code Received:");
        System.out.println(req.getCode());

        System.out.println("🔥 Language:");
        System.out.println(req.getLanguage());

        System.out.println("🔥 Input:");
        System.out.println(req.getInput());

        // dummy response
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("output", "Code executed successfully 🚀");

        return res;
    }
}