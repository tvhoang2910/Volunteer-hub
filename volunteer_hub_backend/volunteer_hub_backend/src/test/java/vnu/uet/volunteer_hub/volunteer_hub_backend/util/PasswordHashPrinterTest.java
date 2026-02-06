package vnu.uet.volunteer_hub.volunteer_hub_backend.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility test to print BCrypt hash for a given plaintext password.
 *
 * Run:
 * ./mvnw -q -Dtest=PasswordHashPrinterTest test
 */
public class PasswordHashPrinterTest {

    @Test
    void printHash() {
        String plain = "Lemanhhung@2005";
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String hash = encoder.encode(plain);

        System.out.println("\n=== BCrypt(12) hash for password ===");
        System.out.println("PLAIN=" + plain);
        System.out.println("HASH=" + hash);
        System.out.println("===================================\n");
    }
}
