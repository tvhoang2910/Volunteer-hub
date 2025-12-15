package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils.JwtUtil;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

@Controller
@RequestMapping("/ui")
public class UIController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public UIController(UserService userService, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Show login page
     */
    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    /**
     * Process login form
     */
    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password, Model model,
            HttpServletResponse response) {
        try {
            // Find user by email
            User user = userService.findByEmail(email);
            if (user == null) {
                model.addAttribute("error", "Invalid email or password");
                return "login";
            }

            // Verify password
            if (!passwordEncoder.matches(password, user.getPassword())) {
                model.addAttribute("error", "Invalid email or password");
                return "login";
            }

            // Check if user is active
            if (!user.getIsActive()) {
                model.addAttribute("error", "Your account has been locked");
                return "login";
            }

            // Get user's first role (user should have at least one role)
            String userRole = user.getRoles().stream()
                    .findFirst()
                    .map(role -> role.getRoleName())
                    .orElse("USER");

            // Generate JWT token (pass userId as String)
            String jwtToken = jwtUtil.generateToken(user.getId().toString(), email, userRole);

            // Store token in secure cookie
            Cookie cookie = new Cookie("jwt_token", jwtToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(true); // Chỉ gửi qua HTTPS
            cookie.setPath("/");
            cookie.setMaxAge(24 * 60 * 60); // 24 hours
            response.addCookie(cookie);

            // Thêm SameSite=Lax qua header
            response.setHeader("Set-Cookie",
                    String.format("jwt_token=%s; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=%d",
                            jwtToken, 24 * 60 * 60));

            // Redirect to posts page
            return "redirect:/ui/posts";
        } catch (Exception e) {
            model.addAttribute("error", "An error occurred during login: " + e.getMessage());
            return "login";
        }
    }

    /**
     * Show create post page
     */
    @GetMapping("/posts/create")
    public String createPostPage(@CookieValue(value = "jwt_token", required = false) String jwtToken, Model model) {
        // Check if user is authenticated
        if (jwtToken == null || jwtToken.isEmpty() || "".equals(jwtToken)) {
            return "redirect:/ui/login";
        }

        try {
            // Validate token before extracting info
            if (!jwtUtil.validateToken(jwtToken)) {
                return "redirect:/ui/login";
            }

            String userId = jwtUtil.getUserIdFromToken(jwtToken);
            if (userId == null || userId.isEmpty()) {
                return "redirect:/ui/login";
            }
            model.addAttribute("userId", userId);
            // Pass JWT token to template for API calls
            model.addAttribute("jwtToken", jwtToken);
            return "create-post";
        } catch (Exception e) {
            // Token is invalid, redirect to login
            return "redirect:/ui/login";
        }
    }

    /**
     * Show posts list page
     */
    @GetMapping("/posts")
    public String postsPage(@CookieValue(value = "jwt_token", required = false) String jwtToken, Model model) {
        if (jwtToken != null && !jwtToken.isEmpty()) {
            try {
                if (jwtUtil.validateToken(jwtToken)) {
                    String userId = jwtUtil.getUserIdFromToken(jwtToken);
                    String email = jwtUtil.getEmailFromToken(jwtToken);
                    model.addAttribute("userId", userId);
                    model.addAttribute("email", email);
                    // Pass JWT token to template for API calls
                    model.addAttribute("jwtToken", jwtToken);
                }
            } catch (Exception e) {
                // Continue as anonymous
            }
        }
        return "posts-list";
    }

    /**
     * Logout
     */
    @GetMapping("/logout")
    public String logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt_token", "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return "redirect:/ui/login";
    }
}
