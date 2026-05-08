module.exports = {
  generateRandomAnswer: (userContext, events, done) => {
    userContext.vars.answer = Math.floor(Math.random() * 1000);
    return done();
  }
};
