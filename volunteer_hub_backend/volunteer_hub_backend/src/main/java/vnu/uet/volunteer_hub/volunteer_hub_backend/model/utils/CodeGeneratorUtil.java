package vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils;

import java.security.SecureRandom;

public class CodeGeneratorUtil {

    private static final SecureRandom random = new SecureRandom();

    public static String generateRecoveryCode() {
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

}