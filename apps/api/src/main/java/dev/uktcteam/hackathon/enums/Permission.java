package dev.uktcteam.hackathon.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum Permission {

    ADMIN_READ("admin:read"),    //get
    ADMIN_UPDATE("admin:update"),//put
    ADMIN_CREATE("admin:create"),//post
    ADMIN_DELETE("admin:delete"),//delete

    USER_READ("user:read"),    //get
    USER_UPDATE("user:update"),//put
    USER_CREATE("user:create"),//post
    USER_DELETE("user:delete") //delete
    ;
    @Getter
    private final String permission;
}
