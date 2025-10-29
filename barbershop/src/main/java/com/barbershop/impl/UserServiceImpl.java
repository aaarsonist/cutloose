package com.barbershop.impl;

import com.barbershop.model.User;
import com.barbershop.repository.UserRepository;
import com.barbershop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User saveUser(User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public boolean authenticate(String username, String password) {
        // теперь не используется напрямую
        throw new UnsupportedOperationException("Аутентификация через Spring Security");
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
