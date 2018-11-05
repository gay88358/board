var assert = require('assert');

const DBCardGateway = require('../gateway/cardGateway/dbCardGateway');
const Database = require('../db/db');
const Card = require('../model/card');
const Task = require('../model/task');

describe('TodoGateway', function() {
  
  let cardGateway;
  let card;  
  
  function createCard() {
    let card = new Card('this is a card');
    card.setDescription('this is my desc');
    card.setTaskFk(null);
    card.setPriority(null);
    return card;
  }

  beforeEach(function(done) {
    card = createCard();

    cardGateway = new DBCardGateway(new Database);

    let result = cardGateway.connection();
    result.then(threadId => {
      done();
    })
    // let result = cardGateway.clearAll();
    // result
    // .then(value => {
    //     done();
    // })
    // .catch(err => {
    //     console.log(err);
    // })

  });
  
  afterEach(function(done) {
      let result = cardGateway.close();
      result.then(value => {
        done();
      })
  });
  
  describe('#CardGateway', () => {    
    it('test insert and find card', (done) => {
        let result = cardGateway.insert(card);
        result
        .then(insertedCard => {
            return cardGateway.find(insertedCard.id());
        })
        .then(finalCard => {
            assert.equal(finalCard.name(), card.name());
            assert.equal(finalCard.getTodoListSize(), 0);
            assert.equal(finalCard.description(), card.description());
            done();
        });
    });
    
    it('test find no card', function(done){
      const result = cardGateway.find(-100);
      result.then(card => {
        assert.equal(card, null);
        done();
      });
    });

    it('test update card', (done) => {
      const result = cardGateway.insert(card);
      result
      .then(insertedCard => {
        insertedCard.setName('this is a setname');
        insertedCard.setDescription('no desc');
        insertedCard.setPriority(0);
        return cardGateway.update(insertedCard);
      })
      .then(updateResult => {
        return cardGateway.find(card.id());
      })
      .then(finalCard => {
        assert.equal(finalCard.name(), 'this is a setname');  
        assert.equal(finalCard.description(), 'no desc'); 
        assert.equal(finalCard.priority(), 0); 
        done(); 
      });
    });

    it('test delete card', (done) => {
        const result = cardGateway.insert(card);
        result
        .then(insertedCard => {
          return cardGateway.delete(insertedCard.id());
        })
        .then(deleteResult => {
          return cardGateway.find(card.id());
        })
        .then(finalCard => {
            assert.equal(finalCard, null);
            done();
        });
    });

    // it('test loadPriorityWithTaskFk', function(done) {
      
    //   let result = cardGateway.loadPriorityWithTaskFk(131);

    //   result.then(priority => {
    //     assert.equal(priority, 3);
    //     done();
    //   })
   
    // });

    it('test insert card', function(done) {
      card.setTaskFk(null);
      let result = cardGateway.insert(card);
      result.then(insertedCard => {
        assert.equal(insertedCard.priority(), 0);
        done();
      });
    });

  })
});
