package com.barbershop.impl;

import com.barbershop.model.User;
import com.barbershop.repository.UserRepository;
import com.barbershop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.UUID;
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

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    @Override
    public User findOrCreateGuestUser(String email, String name) {
        // 1. Пытаемся найти пользователя по email (который у вас = username)
        User existingUser = userRepository.findByUsername(email);
        if (existingUser != null) {
            return existingUser; // Нашли, возвращаем
        }

        // 2. Если не нашли - создаем нового "гостя"
        User newGuest = new User();
        newGuest.setUsername(email); // email = username
        newGuest.setName(name);

        // 4. Генерируем случайный, никому не известный пароль-заглушку
        // (Это нужно, т.к. поле 'password' в User.java @Column(nullable = false))
        String randomPassword = UUID.randomUUID().toString();
        newGuest.setPassword(passwordEncoder.encode(randomPassword));

        // 5. Сохраняем и возвращаем
        return userRepository.save(newGuest);
    }
}
