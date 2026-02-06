package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/.well-known/appspecific")
public class WellKnownAPI {

    @GetMapping("/com.chrome.devtools.json")
    public ResponseEntity<Map<String, Object>> chromeDevtools() {
        return ResponseEntity.ok(Map.of(
                "endpoints", java.util.List.of(
                        Map.of(
                                "name", "Volunteer Hub",
                                "url", "http://localhost:8080"))));
    }
}
