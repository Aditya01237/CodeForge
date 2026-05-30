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

        problem.setTitle(request.getTitle());
        problem.setDifficulty(request.getDifficulty());
        problem.setDescription(request.getDescription());
        problem.setInputFormat(request.getInputFormat());
        problem.setOutputFormat(request.getOutputFormat());
        problem.setConstraintsText(request.getConstraintsText());

        return problemRepository.save(problem);
    }

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public Problem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
    }
}