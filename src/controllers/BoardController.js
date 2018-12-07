const path = require('path');
const Board = require('../mongoModel/board');
const User = require('../mongoModel/user');
const UseCaseFactory = require('../factory/useCaseFactory');

module.exports = {
    /*
    {
        taskId,
        priority,
        boardFk
    }
    */
    async findBoardById(req, res) {
        try {
            let board = await UseCaseFactory.createBoardUseCase().findBoardById(req.body.id);
            res.send(board);    
        } catch(err) {
            res.send(err.message);
        }
    },
    async insertNewStage(req, res) {
        let board = await Board.findOne({_id: req.body.id});
        board.stage_list.push({
            title: req.body.title,
            WIP_limit: 0,
        });
        let newBoard = await board.save();
        res.send(newBoard);
    },
    async insertNewCardToStage(req, res) {
        let board = await Board.findOne({'stage_list': { $elemMatch: { _id: req.body.id }}}, { 'stage_list.work_items.$': 1 })
        board.stage_list[0].work_items.push({
            title: req.body.title
        })
        board = await board.save();
        res.send(board);
    },
    async addNewMember(req, res) {
        let board = await Board.findOne({_id: req.body.boardId});
        let user = await User.findOne({_id: req.body.userId});
        board.members.push(user);
        board = await board.save();
        user.board_list.push({
            boardFk: board._id,
            name: board.name,            
        });
        await user.save();
        res.send(board);
    },
    async renderBoard(req, res) {
      let pagePath = path.join(__dirname, '../views/pages/layouts/board');
      res.render(pagePath);
    },
    async renderUserBoards(req, res) {
        let pagePath = path.join(__dirname, '../views/pages/layouts/creator_board');
        res.render(pagePath);
    },
    async createBoard(req, res) {
        const initialData = {
            userId: req.user._id,
            boardName: req.body.boardName
        };  
        let board = await UseCaseFactory.createBoardUseCase().createBoard(initialData);
        res.send(board._id);
    },
    async fetchUserBoards(req, res) { // has some bug
        const boardID_list = req.body.board_list.map(boardID => boardID.boardFk);
        let boards = await UseCaseFactory.createBoardUseCase().findBoardsByIdList(boardID_list);
        res.send(boards);
    }
}