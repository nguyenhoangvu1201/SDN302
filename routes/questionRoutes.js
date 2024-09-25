const express = require('express');
const router = express.Router();
const Question = require('../models/Question');


// GET /questions: Lấy danh sách tất cả câu hỏi
router.get('/', async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Các endpoint khác 

module.exports = router;
