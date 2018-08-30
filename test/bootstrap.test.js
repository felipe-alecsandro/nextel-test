var Sails = require('sails');
before( (done) => {
    Sails.lift({}, ( err, server ) => {
        
        if(err) return done(err);
        done(err, server)
        
    });
});

after( (done) => {
    Sails.lower(done);
});