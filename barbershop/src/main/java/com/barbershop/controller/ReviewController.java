package com.barbershop.controller;

import com.barbershop.model.Review;
import com.barbershop.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// ДОБАВИТЬ ИМПОРТ Authentication ЕСЛИ НУЖНО ДЛЯ ПОЛУЧЕНИЯ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ (уже добавлено в Impl)
// import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    // @Autowired
    // private UserService userService;
    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
    @PostMapping
    // Этот эндпоинт должен быть доступен аутентифицированным пользователям (USER или ADMIN)
    // @PreAuthorize("isAuthenticated()") // Или hasAnyRole('USER', 'ADMIN') - нужно настроить @EnableMethodSecurity в SecurityConfig
    public ResponseEntity<Review> addReview(@RequestBody Review review /*, Authentication authentication */) {
        if (review.getReviewText() == null || review.getReviewText().trim().isEmpty() ||
                review.getRating() < 1 || review.getRating() > 5 ||
                review.getAppointment() == null || review.getAppointment().getId() == null) {
            System.err.println("Validation failed: reviewText, rating, or appointment ID missing/invalid in request body.");
            return ResponseEntity.badRequest().body(null);
        }

        try {
            Review savedReview = reviewService.addReview(review.getReviewText(), review.getRating(), review.getAppointment().getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
        } catch (RuntimeException e) {
            System.err.println("Error adding review: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }
}
