package com.barbershop.controller; // Убедитесь, что пакет правильный

import com.barbershop.model.Master; // Импортируйте вашу модель Master
import com.barbershop.service.MasterService; // Импортируйте ваш MasterService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/masters")
public class MasterController {

    private final MasterService masterService;

    @Autowired
    public MasterController(MasterService masterService) {
        this.masterService = masterService;
    }

    @GetMapping
    public ResponseEntity<List<Master>> getAllMasters() {
        List<Master> masters = masterService.getAllMasters();
        return ResponseEntity.ok(masters);
    }
}