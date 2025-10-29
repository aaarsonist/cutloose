package com.barbershop.service;

import com.barbershop.model.User;

public interface UserService {
    User saveUser(User user);
    boolean authenticate(String username, String password);
}
