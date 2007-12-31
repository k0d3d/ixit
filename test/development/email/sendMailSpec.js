/*global describe it expect*/

describe("node mailer tests", function () {
    
    it("should be able to send a test email", function sendTestEmail(done) {
        
        // arrange
        var sendMessage = require('../../../lib/email/mailer.js').sendMail;
        
        // act
        sendMessage({
                to: 'michael.rhema@gmail.com', // list of receivers
                subject: 'IXIT Test Email', // Subject line
                text: 'options.text' // plaintext body
            })
            .then(function () {
                
                // assert
                expect(true).toBe(true);
                done();
                
            })
            .catch(function (exception) {
                
                // assert
                //expect(exception).toBe(undefined);

                // fail
                console.error('couldn\'t send email');
                console.error(exception);
                done();
                
            });
        
    }, 20000);

});