package dev.uktcteam.hackathon.security;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String jwtSecretKey;

    @Value("${application.security.jwt.expiration}")
    private Long jwtExpiration;

    @Value("${application.security.refresh-token.secret-key}")
    private String refreshSecretKey;

    @Value("${application.security.refresh-token.expiration}")
    private Long refreshExpiration;


    public String extractUsernameJwt(String jwtToken) {
        return extractClaim(jwtToken, jwtSecretKey, Claims::getSubject);
    }

    public String extractUsernameFromRefreshToken(String refreshToken) {
        return extractClaim(refreshToken, refreshSecretKey, Claims::getSubject);
    }

    public Date getExpirationTimeOfJwt(String jwtToken) { return extractClaim(jwtToken, jwtSecretKey, Claims::getExpiration); }

    public Date getExpirationTimeOfRefreshToken(String refreshToken) { return extractClaim(refreshToken, refreshSecretKey, Claims::getExpiration); }

    public <T> T extractClaim(
            String token,
            String secretKey,
            Function<Claims, T> claimsResolver
    ){
        final Claims claims = extractAllClaims(token, secretKey);
        return claimsResolver.apply(claims);
    }

    public String generateJwtToken(UserDetails userDetails){
        return generateJwtToken(new HashMap<>(), userDetails);
    }

    public String generateJwtToken(
            Map<String,  Object> extraClaims,
            UserDetails userDetails
    ) {
        return buildToken(extraClaims, userDetails, jwtExpiration, jwtSecretKey);
    }

    public String generateRefreshToken(UserDetails userDetails){
        return generateRefreshToken(new HashMap<>(), userDetails);
    }

    public String generateRefreshToken(
            Map<String,  Object> extraClaims,
            UserDetails userDetails
    ) {
        return buildToken(extraClaims, userDetails, refreshExpiration, refreshSecretKey);
    }

    private String buildToken (
            Map<String,  Object> extraClaims,
            UserDetails userDetails,
            long expiration,
            String secretKey
    ){
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(secretKey), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isJwtTokenValid(String jwtToken, UserDetails userDetails) {
        final String username = extractUsernameJwt(jwtToken);
        return (username.equals(userDetails.getUsername())) && !isJwtTokenExpired(jwtToken);
    }

    public boolean isRefreshTokenValid(String refreshToken, UserDetails userDetails) {
        final String username = extractUsernameFromRefreshToken(refreshToken);
        return (username.equals(userDetails.getUsername())) && !isRefreshTokenExpired(refreshToken);
    }

    private boolean isJwtTokenExpired(String jwtToken) {
        return getExpirationTimeOfJwt(jwtToken).before(new Date());
    }

    private boolean isRefreshTokenExpired(String refreshToken) {
        return getExpirationTimeOfRefreshToken(refreshToken).before(new Date());
    }

    private Claims extractAllClaims(String token, String secretKey) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey(secretKey))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey(String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
