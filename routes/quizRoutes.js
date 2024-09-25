const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// 1. GET /quizzes: Lấy danh sách tất cả quizzes kèm theo câu hỏi
router.get('/', async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('questions');
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. POST /quizzes: Tạo một quiz mới
router.post('/', async (req, res) => {
    const quiz = new Quiz({
        title: req.body.title,
        description: req.body.description,
        questions: req.body.questions || []
    });

    try {
        const savedQuiz = await quiz.save();
        res.status(201).json(savedQuiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 3. GET /quizzes/:quizId: Lấy thông tin một quiz theo quizId kèm theo câu hỏi
router.get('/:quizId', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('questions');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. PUT /quizzes/:quizId: Cập nhật thông tin một quiz
router.put('/:quizId', async (req, res) => {
    try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.quizId, req.body, { new: true });
        if (!updatedQuiz) return res.status(404).json({ message: 'Quiz not found' });
        res.status(200).json(updatedQuiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 5. DELETE /quizzes/:quizId: Xóa một quiz
router.delete('/:quizId', async (req, res) => {
    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.quizId);
        if (!deletedQuiz) return res.status(404).json({ message: 'Quiz not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5.1 DELETE a question from a quiz by quizId and questionId
router.delete('/:quizId/question/:questionId', async (req, res) => {
    const { quizId, questionId } = req.params;

    try {
        // Tìm quiz theo quizId
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        // Xóa questionId trong mảng questions
        quiz.questions = quiz.questions.filter(q => q.toString() !== questionId);
        await quiz.save(); // Lưu lại quiz đã cập nhật

        // Xóa câu hỏi khỏi cơ sở dữ liệu
        await Question.findByIdAndDelete(questionId);

        res.json({ message: 'Question deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// 6. GET /quizzes/:quizId/populate: Lấy tất cả câu hỏi của quiz có từ "capital"
router.get('/:quizId/populate', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('questions');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        const filteredQuestions = quiz.questions.filter(question => 
            question.text.includes("capital")
        );

        res.status(200).json(filteredQuestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 7. POST /quizzes/:quizId/question: Tạo câu hỏi mới cho quiz
router.post('/:quizId/question', async (req, res) => {
    const question = new Question(req.body);

    try {
        const savedQuestion = await question.save();
        await Quiz.findByIdAndUpdate(req.params.quizId, { $push: { questions: savedQuestion._id } });
        res.status(201).json(savedQuestion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 8. POST /quizzes/:quizId/questions: Tạo nhiều câu hỏi cho quiz
router.post('/:quizId/questions', async (req, res) => {
    try {
        const questions = await Question.insertMany(req.body);
        await Quiz.findByIdAndUpdate(req.params.quizId, { $push: { questions: { $each: questions.map(q => q._id) } } });
        res.status(201).json(questions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Export router
module.exports = router;
