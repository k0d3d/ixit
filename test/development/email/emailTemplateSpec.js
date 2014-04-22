/*global describe it expect*/


describe('send test email using a template', function () {
    
    it('should be able to send template email to confirm layout', function (done) {
        
        // arrange
        var sendTemplateEmail = require('../../../lib/email/sendMessage.js').sendTemplateEmail;

        // act
        sendTemplateEmail("itsyourinternet@aol.com", "jjaffe@its-your-internet.com", "test email for checking email template", "views/email-templates/test-email-template.jade", {
        }).then(function() {

            // assert
            expect(true).toBe(true);
            done();

        }).
        catch (function(exception) {

            // assert
            expect(exception).toBe(undefined);

            // fail
            console.error('couldn\'t send email');
            console.error(exception);
            done();

        });
        
        
    });    
    
    
});