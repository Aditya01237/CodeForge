package com.coding.codeforge.service;

import com.coding.codeforge.DTO.ProblemRequest;
import com.coding.codeforge.entity.Problem;
import com.coding.codeforge.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public Problem createProblem(ProblemRequest request) {
        Problem problem = new Problem();

        problem.setTitle(clean(request.getTitle()));
        problem.setDifficulty(clean(request.getDifficulty()));
        problem.setDescription(clean(request.getDescription()));
        problem.setInputFormat(clean(request.getInputFormat()));
        problem.setOutputFormat(clean(request.getOutputFormat()));
        problem.setConstraintsText(clean(request.getConstraintsText()));
        problem.setContentJson(clean(request.getContentJson()));

        problem.setReusable(request.getReusable() == null ? true : request.getReusable());
        problem.setCreatedForTestId(request.getCreatedForTestId());

        return problemRepository.save(problem);
    }

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public Problem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
    }

    private String clean(String value) {
        if (value == null) return null;
        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }
}