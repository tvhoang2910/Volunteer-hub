package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Custom resolver to add extra query parameters (e.g. prompt) to the
 * authorization request sent to the OAuth2 provider.
 */
public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final OAuth2AuthorizationRequestResolver delegate;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository repo, String authorizationRequestBaseUri) {
        this.delegate = new DefaultOAuth2AuthorizationRequestResolver(repo, authorizationRequestBaseUri);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest req = delegate.resolve(request);
        return customize(req);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest req = delegate.resolve(request, clientRegistrationId);
        return customize(req);
    }

    private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest req) {
        if (req == null) return null;

        Map<String, Object> additional = new HashMap<>(req.getAdditionalParameters());

        // Force Google to show account selection. Use "consent" to force consent screen.
        additional.put("prompt", "select_account");

        // Example: to request offline access (refresh token) uncomment below
        // additional.put("access_type", "offline");

        return OAuth2AuthorizationRequest.from(req)
                .additionalParameters(additional)
                .build();
    }
}
