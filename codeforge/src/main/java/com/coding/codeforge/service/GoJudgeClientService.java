package com.coding.codeforge.service;

import com.coding.codeforge.DTO.JudgeRunRequest;
import com.coding.codeforge.DTO.JudgeRunResponse;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GoJudgeClientService {

    private static final String GO_JUDGE_URL = "http://localhost:8081/run";

    private final RestTemplate restTemplate = new RestTemplate();

    public ExecutionResultService runCode(String language, String code, String input) {
        try {
            JudgeRunRequest request = new JudgeRunRequest(language, code, input);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<JudgeRunRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<JudgeRunResponse> response = restTemplate.exchange(
                    GO_JUDGE_URL,
                    HttpMethod.POST,
                    entity,
                    JudgeRunResponse.class
            );

            JudgeRunResponse body = response.getBody();

            if (body == null) {
                return new ExecutionResultService("RE", "", "Empty response from Go judge");
            }

            return new ExecutionResultService(
                    body.getStatus(),
                    body.getOutput() == null ? "" : body.getOutput(),
                    body.getError() == null ? "" : body.getError()
            );

        } catch (Exception e) {
            return new ExecutionResultService(
                    "RE",
                    "",
                    "Go judge service error: " + e.getMessage()
            );
        }
    }
}